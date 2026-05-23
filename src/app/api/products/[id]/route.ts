// ============================================================================
// Electronics Mart IMS — Product Detail API (/api/products/[id])
// GET by ID, PUT by ID, DELETE by ID
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/products/[id] — Get single product with all relations
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, code: true } },
        brand: { select: { id: true, name: true, code: true } },
        unit: { select: { id: true, name: true, symbol: true, code: true } },
        productColors: {
          select: {
            colorId: true,
            color: { select: { id: true, name: true, code: true, hexCode: true } },
          },
        },
        productSegments: {
          select: {
            segmentId: true,
            segment: { select: { id: true, name: true, code: true } },
          },
        },
        productCapacities: {
          select: {
            capacityId: true,
            capacity: { select: { id: true, name: true, code: true, value: true, unit: true } },
          },
        },
        productImages: {
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
            isPrimary: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Compute status
    const status = product.currentStock === 0
      ? 'Out of Stock'
      : product.currentStock <= product.minStock
        ? 'Low Stock'
        : 'In Stock'

    return NextResponse.json({
      id: product.id,
      code: product.code,
      sku: product.sku,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitId: product.unitId,
      modelNo: product.modelNo,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      wholesalePrice: product.wholesalePrice,
      minStock: product.minStock,
      maxStock: product.maxStock,
      currentStock: product.currentStock,
      warrantyMonths: product.warrantyMonths,
      image: product.image,
      isActive: product.isActive,
      isDeleted: product.isDeleted,
      status,
      // Relations
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      colors: product.productColors.map((pc) => pc.color),
      segments: product.productSegments.map((ps) => ps.segment),
      capacities: product.productCapacities.map((pc) => pc.capacity),
      images: product.productImages,
      // Variant IDs for form
      colorIds: product.productColors.map((pc) => pc.colorId),
      segmentIds: product.productSegments.map((ps) => ps.segmentId),
      capacityIds: product.productCapacities.map((pc) => pc.capacityId),
      // Audit
      createdBy: product.createdBy,
      createdDate: product.createdDate,
      updatedBy: product.updatedBy,
      updatedDate: product.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/products/[id] — Update product with transaction
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
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

    // Atomic transaction
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

      // Replace variant junctions
      if (body.colorIds !== undefined) {
        await tx.productColor.deleteMany({ where: { productId: id } })
        if (Array.isArray(body.colorIds) && body.colorIds.length > 0) {
          await tx.productColor.createMany({
            data: body.colorIds.map((colorId: string) => ({ productId: id, colorId })),
            skipDuplicates: true,
          })
        }
      }

      if (body.segmentIds !== undefined) {
        await tx.productSegment.deleteMany({ where: { productId: id } })
        if (Array.isArray(body.segmentIds) && body.segmentIds.length > 0) {
          await tx.productSegment.createMany({
            data: body.segmentIds.map((segmentId: string) => ({ productId: id, segmentId })),
            skipDuplicates: true,
          })
        }
      }

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

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/products/[id] — Soft-delete with audit log
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
