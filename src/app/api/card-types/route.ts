// ============================================================================
// Electronics Mart IMS — Card Types CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/card-types — List card types
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

    const cardTypes = await db.cardType.findMany({
      where,
      include: {
        _count: { select: { payments: true } },
      },
      orderBy: [
        { sequence: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(cardTypes.map((ct) => ({
      id: ct.id,
      code: ct.code,
      name: ct.name,
      description: ct.description ?? null,
      sequence: ct.sequence,
      isActive: ct.isActive,
      isDeleted: ct.isDeleted,
      paymentCount: ct._count.payments,
      createdBy: ct.createdBy ?? null,
      createdDate: ct.createdDate ?? null,
      updatedBy: ct.updatedBy ?? null,
      updatedDate: ct.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Card Types API error:', error)
    return NextResponse.json({ error: 'Failed to fetch card types' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/card-types — Create card type with auto-code CDT-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Card type name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('CardType')

      const cardType = await tx.cardType.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          sequence: body.sequence !== undefined ? Number(body.sequence) : 0,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return cardType
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'CardType',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, description: result.description, sequence: result.sequence, isActive: result.isActive },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create card type error:', error)
    return NextResponse.json({ error: 'Failed to create card type' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/card-types — Update card type (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Card type ID is required' }, { status: 400 })
    }

    const existing = await db.cardType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Card type not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted card type' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Card type name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'sequence', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'sequence' ? Number(body[field]) : body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const cardType = await tx.cardType.update({
        where: { id },
        data: updateData,
      })
      return cardType
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'CardType',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, sequence: existing.sequence, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, description: result.description, sequence: result.sequence, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update card type error:', error)
    return NextResponse.json({ error: 'Failed to update card type' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/card-types — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Card type ID is required' }, { status: 400 })
    }

    const existing = await db.cardType.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Card type not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Card type is already deleted' }, { status: 400 })
    }

    const activePayments = await db.payment.count({
      where: { cardTypeId: id, ...notDeleted() },
    })

    if (activePayments > 0) {
      return NextResponse.json(
        { error: `Cannot delete: card type has ${activePayments} active payment linkage(s). Please reassign payments first.` },
        { status: 400 }
      )
    }

    await softDelete(db.cardType, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'CardType',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, sequence: existing.sequence },
    })

    return NextResponse.json({ message: 'Card type soft-deleted successfully' })
  } catch (error) {
    console.error('Delete card type error:', error)
    return NextResponse.json({ error: 'Failed to delete card type' }, { status: 400 })
  }
}
