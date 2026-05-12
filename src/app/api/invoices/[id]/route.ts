import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, code: true, email: true, phone: true, address: true },
        },
        salesOrder: {
          select: { id: true, orderNo: true, status: true },
        },
        payments: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update invoice (status updates, payment recording)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, payment } = body

    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    // Handle status update
    if (status) {
      const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Valid values: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    // Handle payment recording
    if (payment) {
      const paymentAmount = parseFloat(String(payment.amount || 0))
      if (paymentAmount <= 0) {
        return NextResponse.json(
          { error: 'Payment amount must be greater than 0' },
          { status: 400 }
        )
      }

      // Create payment record
      await db.payment.create({
        data: {
          invoiceId: id,
          amount: paymentAmount,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
          method: payment.method || 'CASH',
          referenceNo: payment.referenceNo || null,
          notes: payment.notes || null,
          receivedBy: payment.receivedBy || null,
        },
      })

      // Update invoice paid amount
      const newPaidAmount = existingInvoice.paidAmount + paymentAmount
      updateData.paidAmount = newPaidAmount

      // If fully paid, update status
      if (newPaidAmount >= existingInvoice.totalAmount) {
        updateData.status = 'PAID'
      }
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
        salesOrder: {
          select: { id: true, orderNo: true },
        },
        payments: true,
      },
    })

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
