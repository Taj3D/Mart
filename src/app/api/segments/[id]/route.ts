// ============================================================================
// Electronics Mart IMS — Segment [id] CRUD API
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
    const segment = await db.segment.findUnique({
      where: { id },
      include: { _count: { select: { productSegments: true } } },
    })

    if (!segment || segment.isDeleted) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: segment.id,
      code: segment.code,
      name: segment.name,
      description: segment.description,
      isActive: segment.isActive,
      productCount: segment._count.productSegments,
      createdBy: segment.createdBy,
      createdDate: segment.createdDate,
      updatedBy: segment.updatedBy,
      updatedDate: segment.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching segment:', error)
    return NextResponse.json({ error: 'Failed to fetch segment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.segment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted segment' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Segment name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'isActive']
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      return await tx.segment.update({ where: { id }, data: updateData })
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Segment',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, description: result.description, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json({ error: 'Failed to update segment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.segment.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Segment is already deleted' }, { status: 400 })
    }

    const activeProductSegments = await db.productSegment.count({
      where: { segmentId: id, product: { ...notDeleted() } },
    })
    if (activeProductSegments > 0) {
      return NextResponse.json(
        { error: `Cannot delete: segment has ${activeProductSegments} active product linkage(s)` },
        { status: 400 }
      )
    }

    await softDelete(db.segment, id, undefined)
    await createAuditLog({
      action: 'Delete',
      entity: 'Segment',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name },
    })

    return NextResponse.json({ message: 'Segment soft-deleted successfully' })
  } catch (error) {
    console.error('Error deleting segment:', error)
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 })
  }
}
