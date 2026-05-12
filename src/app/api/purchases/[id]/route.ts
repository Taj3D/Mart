import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/purchases/[id] - Get single purchase order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: {
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
      },
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: purchaseOrder })
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    )
  }
}

// PUT /api/purchases/[id] - Update purchase order (status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, expectedDate, notes } = body

    const existingOrder = await db.purchaseOrder.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validStatuses = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED']
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

      // If status is RECEIVED, update product stock
      if (status === 'RECEIVED' && existingOrder.status !== 'RECEIVED') {
        const orderWithItems = await db.purchaseOrder.findUnique({
          where: { id },
          include: { items: true },
        })

        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            await db.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  increment: item.quantity,
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
                  type: 'IN',
                  quantity: item.quantity,
                  referenceNo: orderWithItems.orderNo,
                  notes: `Purchase order received - ${orderWithItems.orderNo}`,
                },
              })
            }
          }
        }
      }
    }

    if (expectedDate) {
      updateData.expectedDate = new Date(expectedDate)
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const purchaseOrder = await db.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: {
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

    return NextResponse.json({ data: purchaseOrder })
  } catch (error) {
    console.error('Error updating purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}
