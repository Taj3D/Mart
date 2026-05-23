// ============================================================================
// Electronics Mart IMS — Unit [id] CRUD API
// GET by ID, PUT by ID, DELETE by ID (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const unit = await db.unit.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!unit || unit.isDeleted) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: unit.id,
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      isActive: unit.isActive,
      productCount: unit._count.products,
      createdBy: unit.createdBy,
      createdDate: unit.createdDate,
      updatedBy: unit.updatedBy,
      updatedDate: unit.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.unit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted unit' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Unit name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'symbol', 'isActive']
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      return await tx.unit.update({ where: { id }, data: updateData })
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Unit',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, symbol: existing.symbol, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, symbol: result.symbol, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.unit.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Unit is already deleted' }, { status: 400 })
    }

    const activeProducts = await db.product.count({
      where: { unitId: id, ...notDeleted() },
    })
    if (activeProducts > 0) {
      return NextResponse.json(
        { error: `Cannot delete: unit has ${activeProducts} active product(s)` },
        { status: 400 }
      )
    }

    await softDelete(db.unit, id, undefined)
    await createAuditLog({
      action: 'Delete',
      entity: 'Unit',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name },
    })

    return NextResponse.json({ message: 'Unit soft-deleted successfully' })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}
