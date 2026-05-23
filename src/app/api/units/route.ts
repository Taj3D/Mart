// ============================================================================
// Electronics Mart IMS — Units CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/units — List units
// Params: ?all=true, ?search=
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    const search = request.nextUrl.searchParams.get('search') || ''

    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    const where: Record<string, unknown> = { ...baseWhere }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { symbol: { contains: search } },
      ]
    }

    const units = await db.unit.findMany({
      where,
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(units.map((u) => ({
      id: u.id,
      code: u.code,
      name: u.name,
      symbol: u.symbol ?? null,
      isActive: u.isActive,
      isDeleted: u.isDeleted,
      productCount: u._count.products,
      createdBy: u.createdBy ?? null,
      createdDate: u.createdDate ?? null,
      updatedBy: u.updatedBy ?? null,
      updatedDate: u.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Units API error:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/units — Create unit with auto-code UNT-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Unit name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Unit')

      const unit = await tx.unit.create({
        data: {
          code,
          name: body.name.trim(),
          symbol: body.symbol?.trim() || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return unit
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Unit',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, symbol: result.symbol },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create unit error:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/units — Update unit (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 })
    }

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
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const unit = await tx.unit.update({
        where: { id },
        data: updateData,
      })
      return unit
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
    console.error('Update unit error:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/units — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 })
    }

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
        { error: `Cannot delete: unit has ${activeProducts} active product(s). Please reassign products first.` },
        { status: 400 }
      )
    }

    await softDelete(db.unit, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'Unit',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, symbol: existing.symbol },
    })

    return NextResponse.json({ message: 'Unit soft-deleted successfully' })
  } catch (error) {
    console.error('Delete unit error:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 400 })
  }
}
