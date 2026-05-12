import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function mapCategory(c: Record<string, any>) {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? null,
    parentId: c.parentId,
    isActive: c.isActive,
    productCount: c._count?.products ?? 0,
    childCount: c._count?.children ?? 0,
    children: Array.isArray(c.children) ? c.children.map(mapCategory) : [],
  }
}

export async function GET(request?: NextRequest) {
  try {
    const includeAll = request?.nextUrl?.searchParams?.get('all') === 'true'

    const categories = await db.category.findMany({
      where: includeAll
        ? { parentId: null }
        : { isActive: true, parentId: null },
      include: {
        _count: { select: { products: true, children: true } },
        children: {
          include: {
            _count: { select: { products: true, children: true } },
            children: {
              include: {
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories.map(mapCategory))
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
