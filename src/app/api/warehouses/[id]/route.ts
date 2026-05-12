import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/warehouses/[id] - Get single warehouse
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const warehouse = await db.warehouse.findUnique({
      where: { id },
      include: {
        _count: { select: { stockMovements: true } },
      },
    })

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        phone: warehouse.phone,
        managerName: warehouse.managerName,
        isActive: warehouse.isActive,
        createdAt: warehouse.createdAt,
        updatedAt: warehouse.updatedAt,
        stockMovementCount: warehouse._count.stockMovements,
      },
    })
  } catch (error) {
    console.error('Error fetching warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouse' },
      { status: 500 }
    )
  }
}

// PUT /api/warehouses/[id] - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingWarehouse = await db.warehouse.findUnique({
      where: { id },
    })

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code !== existingWarehouse.code) {
      const duplicateCode = await db.warehouse.findUnique({
        where: { code: body.code },
      })
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Warehouse with this code already exists' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'code', 'address', 'phone', 'managerName', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const warehouse = await db.warehouse.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: warehouse })
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    )
  }
}

// DELETE /api/warehouses/[id] - Soft delete warehouse (set isActive = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingWarehouse = await db.warehouse.findUnique({
      where: { id },
    })

    if (!existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }

    const warehouse = await db.warehouse.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: warehouse, message: 'Warehouse deactivated successfully' })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to delete warehouse' },
      { status: 500 }
    )
  }
}
