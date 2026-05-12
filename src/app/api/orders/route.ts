import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/orders */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ]
    }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: true } },
          user: { select: { id: true, fullName: true, userName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

/** POST /api/orders - Create order with items */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Calculate totals
    let subtotal = 0
    let vatAmount = 0
    const items = body.items || []

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }
      const itemTotal = product.sellingPrice * item.quantity
      const itemVat = product.vatApplicable ? itemTotal * (product.vatRate / 100) : 0
      subtotal += itemTotal
      vatAmount += itemVat
    }

    const totalAmount = subtotal + vatAmount - (body.discountAmount || 0)
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        orderDate: new Date(),
        status: 'Pending',
        subtotal,
        discountAmount: body.discountAmount || 0,
        discountPercent: body.discountPercent || 0,
        vatAmount,
        totalAmount,
        paidAmount: 0,
        dueAmount: totalAmount,
        paymentStatus: 'Unpaid',
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        shippingAddress: body.shippingAddress || null,
        soldBy: body.soldBy,
        items: {
          create: items.map(
            (item: { productId: string; quantity: number }) => {
              return { productId: item.productId, quantity: item.quantity, unitPrice: 0, totalAmount: 0 }
            }
          ),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    })

    // Update item prices after creation
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (product) {
        const unitPrice = product.sellingPrice
        const itemTotal = unitPrice * item.quantity
        const itemVat = product.vatApplicable ? itemTotal * (product.vatRate / 100) : 0
        await db.orderItem.update({
          where: { id: order.items[i].id },
          data: { unitPrice, vatAmount: itemVat, totalAmount: itemTotal + itemVat },
        })
      }
    }

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
