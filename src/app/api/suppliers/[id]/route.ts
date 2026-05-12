import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/suppliers/[id] - Get single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supplier = await db.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
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
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: supplier })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code !== existingSupplier.code) {
      const duplicateCode = await db.supplier.findUnique({
        where: { code: body.code },
      })
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Supplier with this code already exists' },
          { status: 409 }
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    const allowedFields = ['code', 'name', 'email', 'phone', 'address', 'city', 'country', 'balance', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'balance') {
          updateData[field] = parseFloat(String(body[field]))
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const supplier = await db.supplier.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: supplier })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

// DELETE /api/suppliers/[id] - Soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    const supplier = await db.supplier.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: supplier, message: 'Supplier deactivated successfully' })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}
