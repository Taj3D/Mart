// ============================================================================
// Electronics Mart IMS — Color [id] CRUD API
// GET by ID, PUT by ID, DELETE by ID (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/colors/[id] — Get single color
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const color = await db.color.findUnique({
      where: { id },
    })

    if (!color || color.isDeleted) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: color.id,
      code: color.code,
      name: color.name,
      hexCode: color.hexCode,
      isActive: color.isActive,
      isDeleted: color.isDeleted,
      createdBy: color.createdBy,
      createdDate: color.createdDate,
      updatedBy: color.updatedBy,
      updatedDate: color.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching color:', error)
    return NextResponse.json({ error: 'Failed to fetch color' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/colors/[id] — Update with transaction + audit log
// Code field is read-only on edit
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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

    return NextResponse.json({
      id: result.id,
      code: result.code,
      name: result.name,
      hexCode: result.hexCode,
      isActive: result.isActive,
      updatedBy: result.updatedBy,
      updatedDate: result.updatedDate,
    })
  } catch (error) {
    console.error('Error updating color:', error)
    return NextResponse.json({ error: 'Failed to update color' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/colors/[id] — Soft-delete with audit log
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    console.error('Error deleting color:', error)
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 })
  }
}
