import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (category) where.categoryId = category
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const products = await db.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      category: p.category?.name || 'Uncategorized',
      categoryId: p.categoryId,
      unit: p.unit,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      image: p.image,
      isActive: p.isActive,
      status: p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.minStock ? 'Low Stock' : 'In Stock',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })))
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        description: body.description || null,
        categoryId: body.categoryId || null,
        unit: body.unit || 'pcs',
        costPrice: body.costPrice || 0,
        sellPrice: body.sellPrice || 0,
        currentStock: body.currentStock || 0,
        minStock: body.minStock || 0,
        maxStock: body.maxStock || 0,
        image: body.image || null,
        isActive: body.isActive !== false,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error('Create product error:', error)
    const msg = error instanceof Error && error.message.includes('Unique') ? 'SKU already exists' : 'Failed to create product'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const product = await db.product.update({ where: { id }, data })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 400 })
  }
}
