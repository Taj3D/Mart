import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          take: 20,
          orderBy: { orderDate: 'desc' },
          select: {
            id: true,
            orderNo: true,
            orderDate: true,
            status: true,
            totalAmount: true,
          },
        },
        invoices: {
          take: 20,
          orderBy: { invoiceDate: 'desc' },
          select: {
            id: true,
            invoiceNo: true,
            invoiceDate: true,
            dueDate: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingCustomer = await db.customer.findUnique({
      where: { id },
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code !== existingCustomer.code) {
      const duplicateCode = await db.customer.findUnique({
        where: { code: body.code },
      })
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Customer with this code already exists' },
          { status: 409 }
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    const allowedFields = ['code', 'name', 'email', 'phone', 'address', 'city', 'country', 'creditLimit', 'balance', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['creditLimit', 'balance'].includes(field)) {
          updateData[field] = parseFloat(String(body[field]))
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingCustomer = await db.customer.findUnique({
      where: { id },
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const customer = await db.customer.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: customer, message: 'Customer deactivated successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
