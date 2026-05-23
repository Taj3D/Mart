// ============================================================================
// Electronics Mart IMS — Segments CRUD API
// Full: GET (list), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// HELPER: Map segment record to API response
// ============================================================================

function mapSegment(s: Record<string, unknown>) {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description ?? null,
    isActive: s.isActive,
    isDeleted: s.isDeleted ?? false,
    createdBy: s.createdBy ?? null,
    createdDate: s.createdDate ?? null,
    updatedBy: s.updatedBy ?? null,
    updatedDate: s.updatedDate ?? null,
    _count: (s as Record<string, unknown> & { _count?: { productSegments?: number } })._count ?? {},
  }
}

// ============================================================================
// GET /api/segments — List segments
// Params: ?all=true (include inactive), ?search= (name/code/description)
// Includes _count for productSegments
// ============================================================================

export async function GET(request?: NextRequest) {
  try {
    const showAll = request?.nextUrl?.searchParams?.get('all') === 'true'
    const search = request?.nextUrl?.searchParams?.get('search')?.trim() || ''
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
        _count: {
          select: { productSegments: true },
        },
      },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ data: segments.map(mapSegment) })
  } catch (error) {
    console.error('Segments API error:', error)
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/segments — Create segment
// Auto-generates code (SEG-00001), uses $transaction for atomicity
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation: name is required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Segment name is required' }, { status: 400 })
    }

    // Atomic transaction: generate code + create segment + audit log
    const result = await db.$transaction(async (tx) => {
      // Generate next code
      const code = await generateNextCode('Segment')

      // Create the segment
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

    // Audit log (outside transaction for non-blocking)
    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Segment',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapSegment(result), { status: 201 })
  } catch (error) {
    console.error('Create segment error:', error)
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/segments — Update segment (code is read-only)
// Uses $transaction for atomicity
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Segment ID is required' }, { status: 400 })
    }

    // Fetch existing for audit comparison
    const existing = await db.segment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted segment' }, { status: 400 })
    }

    // Validate name if provided
    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Segment name cannot be empty' }, { status: 400 })
    }

    // Code is read-only — never allow changing it
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'description' ? (body[field] || null) : body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    // Atomic transaction
    const result = await db.$transaction(async (tx) => {
      const segment = await tx.segment.update({
        where: { id },
        data: updateData,
      })
      return segment
    })

    // Audit log
    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Segment',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        description: existing.description,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapSegment(result))
  } catch (error) {
    console.error('Update segment error:', error)
    return NextResponse.json({ error: 'Failed to update segment' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/segments — Soft-delete using helper
// Checks for active product links before allowing delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Segment ID is required' }, { status: 400 })
    }

    const existing = await db.segment.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Segment is already deleted' }, { status: 400 })
    }

    // Check for active product links
    const activeProductLinks = await db.productSegment.count({
      where: {
        segmentId: id,
        product: { isDeleted: false },
      },
    })

    if (activeProductLinks > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${activeProductLinks} product(s) are linked to this segment. Remove product links first.` },
        { status: 400 }
      )
    }

    // Soft-delete using the helper
    await softDelete(db.segment, id, undefined)

    // Audit log
    await createAuditLog({
      action: 'Delete',
      entity: 'Segment',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        description: existing.description,
        isActive: existing.isActive,
      },
    })

    return NextResponse.json({ message: 'Segment soft-deleted successfully' })
  } catch (error) {
    console.error('Delete segment error:', error)
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 400 })
  }
}
