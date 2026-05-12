import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/sales/[id] - Get single sales order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const salesOrder = await db.salesOrder.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, code: true, email: true, phone: true },
        },
        user: {
          select: { id: true, userName: true, fullName: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, unit: true },
            },
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNo: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    })

    if (!salesOrder) {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: salesOrder })
  } catch (error) {
    console.error('Error fetching sales order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales order' },
      { status: 500 }
    )
  }
}

// PUT /api/sales/[id] - Update sales order (status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, deliveryDate, notes } = body

    const existingOrder = await db.salesOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    if (status) {
      updateData.status = status

      // If status is SHIPPED, reduce product stock
      if (status === 'SHIPPED' && existingOrder.status !== 'SHIPPED') {
        const orderWithItems = await db.salesOrder.findUnique({
          where: { id },
          include: { items: true },
        })

        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            await db.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  decrement: item.quantity,
                },
              },
            })

            // Create stock movement for each item
            const warehouse = await db.warehouse.findFirst()
            if (warehouse) {
              await db.stockMovement.create({
                data: {
                  productId: item.productId,
                  warehouseId: warehouse.id,
                  type: 'OUT',
                  quantity: item.quantity,
                  referenceNo: orderWithItems.orderNo,
                  notes: `Sales order shipped - ${orderWithItems.orderNo}`,
                },
              })
            }
          }
        }
      }
    }

    if (deliveryDate) {
      updateData.deliveryDate = new Date(deliveryDate)
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const salesOrder = await db.salesOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, code: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: salesOrder })
  } catch (error) {
    console.error('Error updating sales order:', error)
    return NextResponse.json(
      { error: 'Failed to update sales order' },
      { status: 500 }
    )
  }
}
