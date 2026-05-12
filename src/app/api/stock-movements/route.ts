import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stock-movements - List stock movements with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const productId = searchParams.get('productId') || ''
    const warehouseId = searchParams.get('warehouseId') || ''
    const type = searchParams.get('type') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.createdAt = {} as any
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [movements, total] = await Promise.all([
      db.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, unit: true },
          },
          warehouse: {
            select: { id: true, name: true, code: true },
          },
          user: {
            select: { id: true, userName: true, fullName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.stockMovement.count({ where }),
    ])

    return NextResponse.json({
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}

// POST /api/stock-movements - Create stock movement (adjusts Product.currentStock)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, warehouseId, type, quantity, referenceNo, notes, movedBy } = body

    if (!productId || !warehouseId || !type || !quantity) {
      return NextResponse.json(
        { error: 'Product, warehouse, type, and quantity are required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['IN', 'OUT', 'TRANSFER']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Valid values: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate warehouse exists
    const warehouse = await db.warehouse.findUnique({
      where: { id: warehouseId },
    })

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }

    // Validate stock availability for OUT type
    if (type === 'OUT' && product.currentStock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Current: ${product.currentStock}, Requested: ${quantity}` },
        { status: 400 }
      )
    }

    // Create stock movement
    const movement = await db.stockMovement.create({
      data: {
        productId,
        warehouseId,
        type,
        quantity: parseInt(String(quantity)),
        referenceNo: referenceNo || null,
        notes: notes || null,
        movedBy: movedBy || null,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    // Adjust product current stock
    if (type === 'IN') {
      await db.product.update({
        where: { id: productId },
        data: { currentStock: { increment: parseInt(String(quantity)) } },
      })
    } else if (type === 'OUT') {
      await db.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: parseInt(String(quantity)) } },
      })
    }
    // TRANSFER: no net change to total stock (would need from/to warehouse logic for real implementation)

    return NextResponse.json({ data: movement }, { status: 201 })
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}
