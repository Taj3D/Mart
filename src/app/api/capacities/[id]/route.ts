// ============================================================================
// Electronics Mart IMS — Capacity [id] CRUD API
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
    const capacity = await db.capacity.findUnique({
      where: { id },
      include: { _count: { select: { productCapacities: true } } },
    })

    if (!capacity || capacity.isDeleted) {
      return NextResponse.json({ error: 'Capacity not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: capacity.id,
      code: capacity.code,
      name: capacity.name,
      value: capacity.value,
      unit: capacity.unit,
      isActive: capacity.isActive,
      productCount: capacity._count.productCapacities,
      createdBy: capacity.createdBy,
      createdDate: capacity.createdDate,
      updatedBy: capacity.updatedBy,
      updatedDate: capacity.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching capacity:', error)
    return NextResponse.json({ error: 'Failed to fetch capacity' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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
      return await tx.capacity.update({ where: { id }, data: updateData })
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
    console.error('Error updating capacity:', error)
    return NextResponse.json({ error: 'Failed to update capacity' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.capacity.findUnique({ where: { id } })

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
        { error: `Cannot delete: capacity has ${activeProductCapacities} active product linkage(s)` },
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
    console.error('Error deleting capacity:', error)
    return NextResponse.json({ error: 'Failed to delete capacity' }, { status: 500 })
  }
}
