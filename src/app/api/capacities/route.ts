// ============================================================================
// Electronics Mart IMS — Capacities CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/capacities — List capacities
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
        { unit: { contains: search } },
      ]
    }

    const capacities = await db.capacity.findMany({
      where,
      include: {
        _count: { select: { productCapacities: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(capacities.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      value: c.value,
      unit: c.unit ?? null,
      isActive: c.isActive,
      isDeleted: c.isDeleted,
      productCount: c._count.productCapacities,
      createdBy: c.createdBy ?? null,
      createdDate: c.createdDate ?? null,
      updatedBy: c.updatedBy ?? null,
      updatedDate: c.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Capacities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch capacities' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/capacities — Create capacity with auto-code CAP-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Capacity name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Capacity')

      const capacity = await tx.capacity.create({
        data: {
          code,
          name: body.name.trim(),
          value: body.value !== undefined ? parseFloat(String(body.value)) || 0 : 0,
          unit: body.unit?.trim() || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return capacity
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Capacity',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, value: result.value, unit: result.unit },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create capacity error:', error)
    return NextResponse.json({ error: 'Failed to create capacity' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/capacities — Update capacity (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Capacity ID is required' }, { status: 400 })
    }

    const existing = await db.capacity.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Capacity not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted capacity' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Capacity name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'value', 'unit', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'value') {
          updateData[field] = parseFloat(String(body.value)) || 0
        } else {
          updateData[field] = body[field]
        }
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const capacity = await tx.capacity.update({
        where: { id },
        data: updateData,
      })
      return capacity
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Capacity',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, value: existing.value, unit: existing.unit, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, value: result.value, unit: result.unit, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update capacity error:', error)
    return NextResponse.json({ error: 'Failed to update capacity' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/capacities — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Capacity ID is required' }, { status: 400 })
    }

    const existing = await db.capacity.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Capacity not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Capacity is already deleted' }, { status: 400 })
    }

    const activeProductCapacities = await db.productCapacity.count({
      where: { capacityId: id, product: { ...notDeleted() } },
    })

    if (activeProductCapacities > 0) {
      return NextResponse.json(
        { error: `Cannot delete: capacity has ${activeProductCapacities} active product linkage(s). Please reassign products first.` },
        { status: 400 }
      )
    }

    await softDelete(db.capacity, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'Capacity',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, value: existing.value, unit: existing.unit },
    })

    return NextResponse.json({ message: 'Capacity soft-deleted successfully' })
  } catch (error) {
    console.error('Delete capacity error:', error)
    return NextResponse.json({ error: 'Failed to delete capacity' }, { status: 400 })
  }
}
