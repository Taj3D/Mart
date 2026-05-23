// ============================================================================
// Electronics Mart IMS — Card Type [id] CRUD API
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
    const cardType = await db.cardType.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    })

    if (!cardType || cardType.isDeleted) {
      return NextResponse.json({ error: 'Card type not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: cardType.id,
      code: cardType.code,
      name: cardType.name,
      description: cardType.description,
      sequence: cardType.sequence,
      isActive: cardType.isActive,
      paymentCount: cardType._count.payments,
      createdBy: cardType.createdBy,
      createdDate: cardType.createdDate,
      updatedBy: cardType.updatedBy,
      updatedDate: cardType.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching card type:', error)
    return NextResponse.json({ error: 'Failed to fetch card type' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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
      return await tx.cardType.update({ where: { id }, data: updateData })
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
    console.error('Error updating card type:', error)
    return NextResponse.json({ error: 'Failed to update card type' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.cardType.findUnique({ where: { id } })

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
        { error: `Cannot delete: card type has ${activePayments} active payment linkage(s)` },
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
    console.error('Error deleting card type:', error)
    return NextResponse.json({ error: 'Failed to delete card type' }, { status: 500 })
  }
}
