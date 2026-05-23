// ============================================================================
// Electronics Mart IMS — Brand CRUD API
// Full: GET (list with company relation), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// HELPER: Map brand record to API response
// ============================================================================

function mapBrand(b: Record<string, any>) {
  return {
    id: b.id,
    code: b.code,
    name: b.name,
    description: b.description ?? null,
    logo: b.logo ?? null,
    companyId: b.companyId ?? null,
    companyName: b.company?.name ?? null,
    companyCode: b.company?.code ?? null,
    isActive: b.isActive,
    isDeleted: b.isDeleted ?? false,
    productCount: b._count?.products ?? 0,
    createdBy: b.createdBy ?? null,
    createdDate: b.createdDate ?? b.createdAt ?? null,
    updatedBy: b.updatedBy ?? null,
    updatedDate: b.updatedDate ?? b.updatedAt ?? null,
  }
}

// ============================================================================
// GET /api/brands — List brands with company relation
// Params: ?all=true (include inactive), ?search= (name search)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    const search = request.nextUrl.searchParams.get('search') || ''

    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    const where = {
      ...baseWhere,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { company: { name: { contains: search } } },
            ],
          }
        : {}),
    }

    const brands = await db.brand.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, code: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(brands.map(mapBrand))
  } catch (error) {
    console.error('Brands GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/brands — Create brand with auto-code inside $transaction
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation: name is required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    // Atomic transaction: generate code + create brand + audit log
    const result = await db.$transaction(async (tx) => {
      // Generate next code
      const code = await generateNextCode('Brand')

      // Create the brand
      const brand = await tx.brand.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          logo: body.logo?.trim() || null,
          companyId: body.companyId || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
        include: {
          company: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true } },
        },
      })

      return brand
    })

    // Audit log (outside transaction for non-blocking)
    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Brand',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        logo: result.logo,
        companyId: result.companyId,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapBrand(result), { status: 201 })
  } catch (error) {
    console.error('Create brand error:', error)
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json({ error: 'Brand name or code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/brands — Update brand (code is read-only)
// Uses $transaction for atomicity
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Fetch existing for audit comparison
    const existing = await db.brand.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true } },
      },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted brand' }, { status: 400 })
    }

    // Validate name if provided
    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Brand name cannot be empty' }, { status: 400 })
    }

    // Code is read-only — never allow changing it
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'logo', 'companyId', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    // Clean up optional fields
    if (updateData.description === '') updateData.description = null
    if (updateData.logo === '') updateData.logo = null
    if (updateData.companyId === '') updateData.companyId = null

    // Atomic transaction
    const result = await db.$transaction(async (tx) => {
      const brand = await tx.brand.update({
        where: { id },
        data: updateData,
        include: {
          company: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true } },
        },
      })
      return brand
    })

    // Audit log
    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Brand',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        description: existing.description,
        logo: existing.logo,
        companyId: existing.companyId,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        logo: result.logo,
        companyId: result.companyId,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapBrand(result))
  } catch (error) {
    console.error('Update brand error:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/brands — Soft-delete with product count check
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    const existing = await db.brand.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Brand is already deleted' }, { status: 400 })
    }

    // Check for active products
    const activeProducts = await db.product.count({
      where: { brandId: id, ...notDeleted() },
    })

    if (activeProducts > 0) {
      return NextResponse.json(
        { error: `Cannot delete: brand has ${activeProducts} active product(s). Please reassign products first.` },
        { status: 400 }
      )
    }

    // Soft-delete using the helper
    await softDelete(db.brand, id, undefined)

    // Audit log
    await createAuditLog({
      action: 'Delete',
      entity: 'Brand',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        isActive: existing.isActive,
      },
    })

    return NextResponse.json({ message: 'Brand soft-deleted successfully' })
  } catch (error) {
    console.error('Delete brand error:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 400 })
  }
}
