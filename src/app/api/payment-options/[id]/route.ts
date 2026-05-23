// ============================================================================
// Electronics Mart IMS — Payment Option [id] CRUD API
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
    const paymentOption = await db.paymentOption.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    })

    if (!paymentOption || paymentOption.isDeleted) {
      return NextResponse.json({ error: 'Payment option not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: paymentOption.id,
      code: paymentOption.code,
      name: paymentOption.name,
      description: paymentOption.description,
      charge: paymentOption.charge,
      isActive: paymentOption.isActive,
      paymentCount: paymentOption._count.payments,
      createdBy: paymentOption.createdBy,
      createdDate: paymentOption.createdDate,
      updatedBy: paymentOption.updatedBy,
      updatedDate: paymentOption.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching payment option:', error)
    return NextResponse.json({ error: 'Failed to fetch payment option' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.paymentOption.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Payment option not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted payment option' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Payment option name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'charge', 'isActive']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'charge') {
          updateData[field] = parseFloat(String(body.charge)) || 0
        } else {
          updateData[field] = body[field]
        }
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      return await tx.paymentOption.update({ where: { id }, data: updateData })
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'PaymentOption',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, charge: existing.charge, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, description: result.description, charge: result.charge, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating payment option:', error)
    return NextResponse.json({ error: 'Failed to update payment option' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.paymentOption.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Payment option not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Payment option is already deleted' }, { status: 400 })
    }

    // Check for active payments linked
    const activePayments = await db.payment.count({
      where: { paymentOptionId: id, ...notDeleted() },
    })
    if (activePayments > 0) {
      return NextResponse.json(
        { error: `Cannot delete: payment option has ${activePayments} active payment linkage(s)` },
        { status: 400 }
      )
    }

    await softDelete(db.paymentOption, id, undefined)
    await createAuditLog({
      action: 'Delete',
      entity: 'PaymentOption',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, charge: existing.charge },
    })

    return NextResponse.json({ message: 'Payment option soft-deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment option:', error)
    return NextResponse.json({ error: 'Failed to delete payment option' }, { status: 500 })
  }
}
