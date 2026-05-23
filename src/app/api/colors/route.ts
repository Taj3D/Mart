// ============================================================================
// Electronics Mart IMS — Color CRUD API
// Full: GET (list), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// HELPER: Map color record to API response
// ============================================================================

function mapColor(c: Record<string, unknown>) {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    hexCode: c.hexCode ?? null,
    isActive: c.isActive,
    isDeleted: c.isDeleted ?? false,
    createdBy: c.createdBy ?? null,
    createdDate: c.createdDate ?? null,
    updatedBy: c.updatedBy ?? null,
    updatedDate: c.updatedDate ?? null,
  }
}

// ============================================================================
// GET /api/colors — List colors
// Params: ?all=true (include inactive)
// ============================================================================

export async function GET(request?: NextRequest) {
  try {
    const showAll = request?.nextUrl?.searchParams?.get('all') === 'true'
    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    const colors = await db.color.findMany({
      where: baseWhere,
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ data: colors.map(mapColor) })
  } catch (error) {
    console.error('Colors API error:', error)
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/colors — Create color
// Auto-generates code (CLR-00001), uses $transaction for atomicity
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation: name is required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Color name is required' }, { status: 400 })
    }

    // Validate hex code format if provided
    if (body.hexCode && !/^#[0-9A-Fa-f]{6}$/.test(body.hexCode.trim())) {
      return NextResponse.json({ error: 'Invalid hex code format. Use #RRGGBB (e.g., #FF0000)' }, { status: 400 })
    }

    // Atomic transaction: generate code + create color + audit log
    const result = await db.$transaction(async (tx) => {
      // Generate next code
      const code = await generateNextCode('Color')

      // Create the color
      const color = await tx.color.create({
        data: {
          code,
          name: body.name.trim(),
          hexCode: body.hexCode?.trim() || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return color
    })

    // Audit log (outside transaction for non-blocking)
    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Color',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        hexCode: result.hexCode,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapColor(result), { status: 201 })
  } catch (error) {
    console.error('Create color error:', error)
    return NextResponse.json({ error: 'Failed to create color' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/colors — Update color (code is read-only)
// Uses $transaction for atomicity
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Color ID is required' }, { status: 400 })
    }

    // Fetch existing for audit comparison
    const existing = await db.color.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted color' }, { status: 400 })
    }

    // Validate name if provided
    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Color name cannot be empty' }, { status: 400 })
    }

    // Validate hex code format if provided
    if (body.hexCode && !/^#[0-9A-Fa-f]{6}$/.test(String(body.hexCode).trim())) {
      return NextResponse.json({ error: 'Invalid hex code format. Use #RRGGBB (e.g., #FF0000)' }, { status: 400 })
    }

    // Code is read-only — never allow changing it
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'hexCode', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    // Atomic transaction
    const result = await db.$transaction(async (tx) => {
      const color = await tx.color.update({
        where: { id },
        data: updateData,
      })
      return color
    })

    // Audit log
    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Color',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        hexCode: existing.hexCode,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        hexCode: result.hexCode,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapColor(result))
  } catch (error) {
    console.error('Update color error:', error)
    return NextResponse.json({ error: 'Failed to update color' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/colors — Soft-delete using helper
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Color ID is required' }, { status: 400 })
    }

    const existing = await db.color.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Color is already deleted' }, { status: 400 })
    }

    // Soft-delete using the helper
    await softDelete(db.color, id, undefined)

    // Audit log
    await createAuditLog({
      action: 'Delete',
      entity: 'Color',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        hexCode: existing.hexCode,
        isActive: existing.isActive,
      },
    })

    return NextResponse.json({ message: 'Color soft-deleted successfully' })
  } catch (error) {
    console.error('Delete color error:', error)
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 400 })
  }
}
