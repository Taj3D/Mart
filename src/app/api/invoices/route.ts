import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const customerId = searchParams.get('customerId') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (status) {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, code: true },
          },
          salesOrder: {
            select: { id: true, orderNo: true },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              method: true,
              referenceNo: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceNo, salesOrderId, customerId, invoiceDate, dueDate, subtotal, taxRate, notes } = body

    if (!invoiceNo || !customerId) {
      return NextResponse.json(
        { error: 'Invoice number and customer are required' },
        { status: 400 }
      )
    }

    // Check if invoiceNo already exists
    const existingInvoice = await db.invoice.findUnique({
      where: { invoiceNo },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice with this number already exists' },
        { status: 409 }
      )
    }

    // Validate customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate sales order exists if provided
    if (salesOrderId) {
      const salesOrder = await db.salesOrder.findUnique({
        where: { id: salesOrderId },
      })
      if (!salesOrder) {
        return NextResponse.json(
          { error: 'Sales order not found' },
          { status: 404 }
        )
      }
    }

    const sub = parseFloat(String(subtotal || 0))
    const tax = sub * (parseFloat(String(taxRate || 0)) / 100)
    const total = sub + tax

    const invoice = await db.invoice.create({
      data: {
        invoiceNo,
        salesOrderId: salesOrderId || null,
        customerId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'DRAFT',
        subtotal: sub,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: 0,
        notes: notes || null,
      },
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
        salesOrder: {
          select: { id: true, orderNo: true },
        },
      },
    })

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
