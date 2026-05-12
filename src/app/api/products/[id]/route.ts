import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            warehouse: { select: { id: true, name: true } },
          },
        },
        purchaseOrderItems: {
          take: 10,
          orderBy: { purchaseOrder: { orderDate: 'desc' } },
          include: {
            purchaseOrder: {
              select: { id: true, orderNo: true, status: true, orderDate: true },
            },
          },
        },
        salesOrderItems: {
          take: 10,
          orderBy: { salesOrder: { orderDate: 'desc' } },
          include: {
            salesOrder: {
              select: { id: true, orderNo: true, status: true, orderDate: true },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // If SKU is being changed, check for duplicates
    if (body.sku && body.sku !== existingProduct.sku) {
      const duplicateSku = await db.product.findUnique({
        where: { sku: body.sku },
      })
      if (duplicateSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    const allowedFields = ['sku', 'name', 'description', 'categoryId', 'unit', 'costPrice', 'sellPrice', 'minStock', 'maxStock', 'currentStock', 'image', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['costPrice', 'sellPrice'].includes(field)) {
          updateData[field] = parseFloat(String(body[field]))
        } else if (['minStock', 'maxStock', 'currentStock'].includes(field)) {
          updateData[field] = parseInt(String(body[field]))
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Soft delete (set isActive=false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = await db.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: product, message: 'Product deactivated successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
