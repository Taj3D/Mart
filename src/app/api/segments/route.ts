// ============================================================================
// Electronics Mart IMS — Segments CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/segments — List segments
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
        { description: { contains: search } },
      ]
    }

    const segments = await db.segment.findMany({
      where,
      include: {
        _count: { select: { productSegments: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(segments.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description ?? null,
      isActive: s.isActive,
      isDeleted: s.isDeleted,
      productCount: s._count.productSegments,
      createdBy: s.createdBy ?? null,
      createdDate: s.createdDate ?? null,
      updatedBy: s.updatedBy ?? null,
      updatedDate: s.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Segments API error:', error)
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/segments — Create segment with auto-code SEG-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Segment name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Segment')

      const segment = await tx.segment.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return segment
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Segment',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, description: result.description },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create segment error:', error)
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/segments — Update segment (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Segment ID is required' }, { status: 400 })
    }

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
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const segment = await tx.segment.update({
        where: { id },
        data: updateData,
      })
      return segment
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
    console.error('Update segment error:', error)
    return NextResponse.json({ error: 'Failed to update segment' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/segments — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Segment ID is required' }, { status: 400 })
    }

    const existing = await db.segment.findUnique({
      where: { id },
    })

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
        { error: `Cannot delete: segment has ${activeProductSegments} active product linkage(s). Please reassign products first.` },
        { status: 400 }
      )
    }

    await softDelete(db.segment, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'Segment',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description },
    })

    return NextResponse.json({ message: 'Segment soft-deleted successfully' })
  } catch (error) {
    console.error('Delete segment error:', error)
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 400 })
  }
}
