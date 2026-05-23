// ============================================================================
// Electronics Mart IMS — Product CRUD API
// Full: GET (list with filters), POST (create with variants), PUT (update),
//       DELETE (soft-delete)
// Features: Atomic transactions, auto-code generation, variant junction rows,
//           stock movement creation, audit logging, computed status
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// HELPER: Compute stock status
// ============================================================================

function computeStatus(currentStock: number, minStock: number): string {
  if (currentStock === 0) return 'Out of Stock'
  if (currentStock <= minStock) return 'Low Stock'
  return 'In Stock'
}

// ============================================================================
// HELPER: Map product record to API response
// ============================================================================

function mapProduct(p: any) {
  return {
    id: p.id,
    code: p.code,
    sku: p.sku,
    name: p.name,
    description: p.description ?? null,
    categoryId: p.categoryId ?? null,
    brandId: p.brandId ?? null,
    unitId: p.unitId ?? null,
    modelNo: p.modelNo ?? null,
    costPrice: p.costPrice,
    sellPrice: p.sellPrice,
    wholesalePrice: p.wholesalePrice,
    minStock: p.minStock,
    maxStock: p.maxStock,
    currentStock: p.currentStock,
    warrantyMonths: p.warrantyMonths,
    image: p.image ?? null,
    isActive: p.isActive,
    isDeleted: p.isDeleted ?? false,
    // Computed fields
    category: p.category?.name ?? 'Uncategorized',
    brand: p.brand?.name ?? null,
    unit: p.unit?.name ?? null,
    unitSymbol: p.unit?.symbol ?? null,
    status: computeStatus(p.currentStock, p.minStock),
    // Variants
    colorIds: Array.isArray(p.productColors) ? p.productColors.map((pc: { colorId: string }) => pc.colorId) : [],
    segmentIds: Array.isArray(p.productSegments) ? p.productSegments.map((ps: { segmentId: string }) => ps.segmentId) : [],
    capacityIds: Array.isArray(p.productCapacities) ? p.productCapacities.map((pc: { capacityId: string }) => pc.capacityId) : [],
    // Audit
    createdBy: p.createdBy ?? null,
    createdDate: p.createdDate ?? null,
    updatedBy: p.updatedBy ?? null,
    updatedDate: p.updatedDate ?? null,
  }
}

// ============================================================================
// GET /api/products — List products with filters
// Params: ?category=, ?brand=, ?search=, ?all=true
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')
    const brandFilter = searchParams.get('brand')
    const searchFilter = searchParams.get('search')
    const showAll = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = showAll ? notDeleted() : { ...activeNotDeleted() }

    if (categoryFilter) {
      where.categoryId = categoryFilter
    }
    if (brandFilter) {
      where.brandId = brandFilter
    }
    if (searchFilter) {
      where.OR = [
        { name: { contains: searchFilter } },
        { code: { contains: searchFilter } },
        { sku: { contains: searchFilter } },
      ]
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
        productColors: { select: { colorId: true } },
        productSegments: { select: { segmentId: true } },
        productCapacities: { select: { capacityId: true } },
      },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(products.map(mapProduct))
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/products — Create product with variants
// Auto-generates code, creates variant junction rows, stock movement if needed
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation: name required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    // Check SKU uniqueness if provided
    if (body.sku) {
      const existingSku = await db.product.findUnique({ where: { sku: body.sku } })
      if (existingSku) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
    }

    // Atomic transaction: generate code + create product + variants + stock movement + audit
    const result = await db.$transaction(async (tx) => {
      // Generate auto code
      const code = await generateNextCode('Product')

      // Create product
      const product = await tx.product.create({
        data: {
          code,
          sku: body.sku?.trim() || null,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          categoryId: body.categoryId || null,
          brandId: body.brandId || null,
          unitId: body.unitId || null,
          modelNo: body.modelNo?.trim() || null,
          costPrice: Number(body.costPrice) || 0,
          sellPrice: Number(body.sellPrice) || 0,
          wholesalePrice: Number(body.wholesalePrice) || 0,
          minStock: Number(body.minStock) || 0,
          maxStock: Number(body.maxStock) || 0,
          currentStock: Number(body.currentStock) || 0,
          warrantyMonths: Number(body.warrantyMonths) || 0,
          image: body.image?.trim() || null,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
          createdBy: body.userId || null,
        },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, symbol: true } },
        },
      })

      // Create ProductColor junction rows
      if (Array.isArray(body.colorIds) && body.colorIds.length > 0) {
        await tx.productColor.createMany({
          data: body.colorIds.map((colorId: string) => ({
            productId: product.id,
            colorId,
          })),
          skipDuplicates: true,
        })
      }

      // Create ProductSegment junction rows
      if (Array.isArray(body.segmentIds) && body.segmentIds.length > 0) {
        await tx.productSegment.createMany({
          data: body.segmentIds.map((segmentId: string) => ({
            productId: product.id,
            segmentId,
          })),
          skipDuplicates: true,
        })
      }

      // Create ProductCapacity junction rows
      if (Array.isArray(body.capacityIds) && body.capacityIds.length > 0) {
        await tx.productCapacity.createMany({
          data: body.capacityIds.map((capacityId: string) => ({
            productId: product.id,
            capacityId,
          })),
          skipDuplicates: true,
        })
      }

      // Create StockMovement if initial stock > 0
      if (product.currentStock > 0) {
        const movementCode = await generateNextCode('StockMovement')
        await tx.stockMovement.create({
          data: {
            code: movementCode,
            productId: product.id,
            warehouseId: '', // Will be set later
            movementType: 'In',
            quantity: product.currentStock,
            referenceNo: `INIT-${product.code}`,
            notes: `Initial stock for ${product.name}`,
            createdBy: body.userId || null,
          },
        })
      }

      return product
    })

    // Audit log (outside transaction for non-blocking)
    await createAuditLog({
      userId: body.userId || undefined,
      action: 'Create',
      entity: 'Product',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        sku: result.sku,
        categoryId: result.categoryId,
        brandId: result.brandId,
        costPrice: result.costPrice,
        sellPrice: result.sellPrice,
        currentStock: result.currentStock,
      },
    })

    // Re-fetch with variants for response
    const fullProduct = await db.product.findUnique({
      where: { id: result.id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
        productColors: { select: { colorId: true } },
        productSegments: { select: { segmentId: true } },
        productCapacities: { select: { capacityId: true } },
      },
    })

    return NextResponse.json(mapProduct(fullProduct), { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json({ error: 'Duplicate entry detected' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/products — Update product (code is read-only)
// Uses $transaction for variant updates (delete old, insert new)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch existing for audit and validation
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted product' }, { status: 400 })
    }

    // If SKU is being changed, check for duplicates
    if (body.sku && body.sku !== existing.sku) {
      const duplicateSku = await db.product.findUnique({ where: { sku: body.sku } })
      if (duplicateSku) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
    }

    // Build update data — code is read-only
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'sku', 'name', 'description', 'categoryId', 'brandId', 'unitId',
      'modelNo', 'costPrice', 'sellPrice', 'wholesalePrice',
      'minStock', 'maxStock', 'currentStock', 'warrantyMonths',
      'image', 'isActive',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['costPrice', 'sellPrice', 'wholesalePrice'].includes(field)) {
          updateData[field] = parseFloat(String(body[field])) || 0
        } else if (['minStock', 'maxStock', 'currentStock', 'warrantyMonths'].includes(field)) {
          updateData[field] = parseInt(String(body[field])) || 0
        } else if (field === 'sku') {
          updateData[field] = body[field]?.trim() || null
        } else if (field === 'isActive') {
          updateData[field] = Boolean(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }
    updateData.updatedBy = body.userId || null

    // Validate name
    if (updateData.name !== undefined && (!updateData.name || !String(updateData.name).trim())) {
      return NextResponse.json({ error: 'Product name cannot be empty' }, { status: 400 })
    }

    // Atomic transaction: update product + replace variant junctions
    const result = await db.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, symbol: true } },
        },
      })

      // Replace ProductColor junction rows
      if (body.colorIds !== undefined) {
        await tx.productColor.deleteMany({ where: { productId: id } })
        if (Array.isArray(body.colorIds) && body.colorIds.length > 0) {
          await tx.productColor.createMany({
            data: body.colorIds.map((colorId: string) => ({ productId: id, colorId })),
            skipDuplicates: true,
          })
        }
      }

      // Replace ProductSegment junction rows
      if (body.segmentIds !== undefined) {
        await tx.productSegment.deleteMany({ where: { productId: id } })
        if (Array.isArray(body.segmentIds) && body.segmentIds.length > 0) {
          await tx.productSegment.createMany({
            data: body.segmentIds.map((segmentId: string) => ({ productId: id, segmentId })),
            skipDuplicates: true,
          })
        }
      }

      // Replace ProductCapacity junction rows
      if (body.capacityIds !== undefined) {
        await tx.productCapacity.deleteMany({ where: { productId: id } })
        if (Array.isArray(body.capacityIds) && body.capacityIds.length > 0) {
          await tx.productCapacity.createMany({
            data: body.capacityIds.map((capacityId: string) => ({ productId: id, capacityId })),
            skipDuplicates: true,
          })
        }
      }

      return product
    })

    // Audit log
    await createAuditLog({
      userId: body.userId || undefined,
      action: 'Update',
      entity: 'Product',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        sku: existing.sku,
        costPrice: existing.costPrice,
        sellPrice: existing.sellPrice,
        currentStock: existing.currentStock,
      },
      newValues: {
        code: result.code,
        name: result.name,
        sku: result.sku,
        costPrice: result.costPrice,
        sellPrice: result.sellPrice,
        currentStock: result.currentStock,
      },
    })

    // Re-fetch with variants for response
    const fullProduct = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, symbol: true } },
        productColors: { select: { colorId: true } },
        productSegments: { select: { segmentId: true } },
        productCapacities: { select: { capacityId: true } },
      },
    })

    return NextResponse.json(mapProduct(fullProduct))
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/products — Soft-delete using helper
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Product is already deleted' }, { status: 400 })
    }

    // Soft-delete + audit log in transaction
    await db.$transaction(async (tx) => {
      await softDelete(tx.product, id, undefined)

      await createAuditLog({
        action: 'Delete',
        entity: 'Product',
        entityId: id,
        oldValues: {
          code: existing.code,
          name: existing.name,
          sku: existing.sku,
          isActive: existing.isActive,
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Product soft-deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 400 })
  }
}
