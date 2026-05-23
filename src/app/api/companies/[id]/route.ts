import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// GET /api/companies/[id] - Get single company by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await db.company.findFirst({
      where: { id, ...notDeleted() },
    })

    if (!record) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ data: record })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      address,
      phone,
      email,
      website,
      logo,
      currency,
      financialYear,
      taxId,
      registrationNo,
      isActive,
      updatedBy,
    } = body

    // Check if record exists and is not deleted
    const existing = await db.company.findFirst({
      where: { id, ...notDeleted() },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Code field is read-only — never update it
    const result = await db.$transaction(async (tx) => {
      const record = await tx.company.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(address !== undefined && { address: address || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(email !== undefined && { email: email || null }),
          ...(website !== undefined && { website: website || null }),
          ...(logo !== undefined && { logo: logo || null }),
          ...(currency !== undefined && { currency }),
          ...(financialYear !== undefined && { financialYear: financialYear || null }),
          ...(taxId !== undefined && { taxId: taxId || null }),
          ...(registrationNo !== undefined && { registrationNo: registrationNo || null }),
          ...(isActive !== undefined && { isActive }),
          updatedBy: updatedBy || null,
        },
      })
      await createAuditLog({
        userId: updatedBy || undefined,
        action: 'Update',
        entity: 'Company',
        entityId: record.id,
        oldValues: existing,
        newValues: record,
      })
      return record
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}

// DELETE /api/companies/[id] - Soft-delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const deletedBy = searchParams.get('deletedBy') || undefined

    // Check if record exists and is not deleted
    const existing = await db.company.findFirst({
      where: { id, ...notDeleted() },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    await db.$transaction(async (tx) => {
      await softDelete(tx.company, id, deletedBy)
      await createAuditLog({
        userId: deletedBy,
        action: 'Delete',
        entity: 'Company',
        entityId: id,
        oldValues: existing,
      })
    })

    return NextResponse.json({ data: { id }, message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
