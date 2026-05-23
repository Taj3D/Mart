// ============================================================================
// Electronics Mart IMS — Brand [id] CRUD API
// GET by ID, PUT by ID, DELETE by ID (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/brands/[id] — Get single brand with company relation
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await db.brand.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true } },
        _count: { select: { products: true } },
      },
    })

    if (!brand || brand.isDeleted) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: brand.id,
      code: brand.code,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      companyId: brand.companyId,
      companyName: brand.company?.name ?? null,
      companyCode: brand.company?.code ?? null,
      isActive: brand.isActive,
      isDeleted: brand.isDeleted,
      productCount: brand._count.products,
      createdBy: brand.createdBy,
      createdDate: brand.createdDate,
      updatedBy: brand.updatedBy,
      updatedDate: brand.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/brands/[id] — Update with transaction + audit log
// Code field is read-only on edit
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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

    return NextResponse.json({
      id: result.id,
      code: result.code,
      name: result.name,
      description: result.description,
      logo: result.logo,
      companyId: result.companyId,
      companyName: result.company?.name ?? null,
      companyCode: result.company?.code ?? null,
      isActive: result.isActive,
      productCount: result._count.products,
      updatedBy: result.updatedBy,
      updatedDate: result.updatedDate,
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/brands/[id] — Soft-delete with audit log and product count check
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
