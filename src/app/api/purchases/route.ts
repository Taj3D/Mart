import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const purchases = await db.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { orderDate: 'desc' },
    })

    return NextResponse.json(purchases.map(p => ({
      id: p.id,
      orderNo: p.orderNo,
      supplierId: p.supplierId,
      supplier: p.supplier?.name || 'Unknown',
      date: p.orderDate,
      expectedDate: p.expectedDate,
      itemCount: p.items.length,
      subtotal: p.subtotal,
      taxAmount: p.taxAmount,
      totalAmount: p.totalAmount,
      status: p.status,
      notes: p.notes,
      items: p.items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: item.product?.name || 'Unknown',
        sku: item.product?.sku || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.totalPrice,
      })),
      createdAt: p.createdAt,
    })))
  } catch (error) {
    console.error('Purchases API error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const purchase = await db.purchaseOrder.create({
      data: {
        orderNo: body.orderNo || `PO-${Date.now()}`,
        supplierId: body.supplierId,
        subtotal: body.subtotal || 0,
        taxAmount: body.taxAmount || 0,
        totalAmount: body.totalAmount || 0,
        status: body.status || 'PENDING',
        notes: body.notes || null,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
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

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Create purchase error:', error)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, ...data } = body
    if (!id) return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 })

    const purchase = await db.purchaseOrder.update({
      where: { id },
      data: { status, ...data },
    })
    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Update purchase error:', error)
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 400 })
  }
}
