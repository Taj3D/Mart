import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
        children: { include: { _count: { select: { products: true } } } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      parentId: c.parentId,
      productCount: c._count.products,
      children: c.children.map(ch => ({
        id: ch.id,
        name: ch.name,
        productCount: ch._count.products,
      })),
    })))
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const category = await db.category.create({
      data: {
        name: body.name,
        description: body.description || null,
        parentId: body.parentId || null,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
  }
}
