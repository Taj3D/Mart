import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const sales = await db.salesOrder.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { orderDate: 'desc' },
    })

    return NextResponse.json(sales.map(s => ({
      id: s.id,
      orderNo: s.orderNo,
      customerId: s.customerId,
      customer: s.customer?.name || 'Unknown',
      date: s.orderDate,
      deliveryDate: s.deliveryDate,
      itemCount: s.items.length,
      subtotal: s.subtotal,
      taxAmount: s.taxAmount,
      totalAmount: s.totalAmount,
      status: s.status,
      notes: s.notes,
      items: s.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product?.name || 'Unknown',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.totalPrice,
      })),
      createdAt: s.createdAt,
    })))
  } catch (error) {
    console.error('Sales API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const sale = await db.salesOrder.create({
      data: {
        orderNo: body.orderNo || `SO-${Date.now()}`,
        customerId: body.customerId,
        subtotal: body.subtotal || 0,
        taxAmount: body.taxAmount || 0,
        totalAmount: body.totalAmount || 0,
        status: body.status || 'PENDING',
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: { productId: string; quantity?: number; unitPrice?: number; discount?: number; totalPrice?: number }) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            discount: item.discount || 0,
            totalPrice: item.totalPrice || 0,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json({ error: 'Failed to create sales order' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, ...data } = body
    if (!id) return NextResponse.json({ error: 'Sale ID required' }, { status: 400 })

    const sale = await db.salesOrder.update({
      where: { id },
      data: { status, ...data },
    })
    return NextResponse.json(sale)
  } catch (error) {
    console.error('Update sale error:', error)
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 400 })
  }
}
