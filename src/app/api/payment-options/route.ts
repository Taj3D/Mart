// ============================================================================
// Electronics Mart IMS — Payment Options CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/payment-options — List payment options
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

    const paymentOptions = await db.paymentOption.findMany({
      where,
      include: {
        _count: { select: { payments: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(paymentOptions.map((po) => ({
      id: po.id,
      code: po.code,
      name: po.name,
      description: po.description ?? null,
      charge: po.charge,
      isActive: po.isActive,
      isDeleted: po.isDeleted,
      paymentCount: po._count.payments,
      createdBy: po.createdBy ?? null,
      createdDate: po.createdDate ?? null,
      updatedBy: po.updatedBy ?? null,
      updatedDate: po.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('PaymentOptions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment options' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/payment-options — Create payment option with auto-code POP-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Payment option name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('PaymentOption')

      const paymentOption = await tx.paymentOption.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          charge: body.charge !== undefined ? parseFloat(String(body.charge)) || 0 : 0,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return paymentOption
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'PaymentOption',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, description: result.description, charge: result.charge },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create payment option error:', error)
    return NextResponse.json({ error: 'Failed to create payment option' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/payment-options — Update payment option (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Payment option ID is required' }, { status: 400 })
    }

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
      const paymentOption = await tx.paymentOption.update({
        where: { id },
        data: updateData,
      })
      return paymentOption
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
    console.error('Update payment option error:', error)
    return NextResponse.json({ error: 'Failed to update payment option' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/payment-options — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Payment option ID is required' }, { status: 400 })
    }

    const existing = await db.paymentOption.findUnique({
      where: { id },
    })

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
        { error: `Cannot delete: payment option has ${activePayments} active payment linkage(s). Please reassign payments first.` },
        { status: 400 }
      )
    }

    await softDelete(db.paymentOption, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'PaymentOption',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, charge: existing.charge },
    })

    return NextResponse.json({ message: 'Payment option soft-deleted successfully' })
  } catch (error) {
    console.error('Delete payment option error:', error)
    return NextResponse.json({ error: 'Failed to delete payment option' }, { status: 400 })
  }
}
