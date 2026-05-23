import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// GET /api/investment-heads/[id] - Get single investment head by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await db.investmentHead.findFirst({
      where: { id, ...notDeleted() },
      include: {
        investments: {
          where: { isDeleted: false },
          orderBy: { createdDate: 'desc' },
        },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Investment head not found' }, { status: 404 })
    }

    return NextResponse.json({ data: record })
  } catch (error) {
    console.error('Error fetching investment head:', error)
    return NextResponse.json({ error: 'Failed to fetch investment head' }, { status: 500 })
  }
}

// PUT /api/investment-heads/[id] - Update investment head
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, investmentType, openingBalance, openingType, isActive, updatedBy } = body

    // Check if record exists and is not deleted
    const existing = await db.investmentHead.findFirst({
      where: { id, ...notDeleted() },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Investment head not found' }, { status: 404 })
    }

    // Code field is read-only — never update it
    const result = await db.$transaction(async (tx) => {
      const record = await tx.investmentHead.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description: description || null }),
          ...(investmentType !== undefined && { investmentType }),
          ...(openingBalance !== undefined && { openingBalance }),
          ...(openingType !== undefined && { openingType }),
          ...(isActive !== undefined && { isActive }),
          updatedBy: updatedBy || null,
        },
      })
      await createAuditLog({
        userId: updatedBy || undefined,
        action: 'Update',
        entity: 'InvestmentHead',
        entityId: record.id,
        oldValues: existing,
        newValues: record,
      })
      return record
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error updating investment head:', error)
    return NextResponse.json({ error: 'Failed to update investment head' }, { status: 500 })
  }
}

// DELETE /api/investment-heads/[id] - Soft-delete investment head
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const deletedBy = searchParams.get('deletedBy') || undefined

    // Check if record exists and is not deleted
    const existing = await db.investmentHead.findFirst({
      where: { id, ...notDeleted() },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Investment head not found' }, { status: 404 })
    }

    // Check for active investments
    const activeInvestments = await db.investment.count({
      where: {
        investmentHeadId: id,
        isDeleted: false,
        status: 'Active',
      },
    })

    if (activeInvestments > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${activeInvestments} active investment(s) linked to this head` },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await softDelete(tx.investmentHead, id, deletedBy)
      await createAuditLog({
        userId: deletedBy,
        action: 'Delete',
        entity: 'InvestmentHead',
        entityId: id,
        oldValues: existing,
      })
    })

    return NextResponse.json({ data: { id }, message: 'Investment head deleted successfully' })
  } catch (error) {
    console.error('Error deleting investment head:', error)
    return NextResponse.json({ error: 'Failed to delete investment head' }, { status: 500 })
  }
}
