import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/brands */
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: brands })
  } catch (error) {
    console.error('Brands GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

/** POST /api/brands */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const brand = await db.brand.create({
      data: {
        name: body.name,
        description: body.description || null,
        logo: body.logo || null,
      },
    })
    return NextResponse.json({ data: brand }, { status: 201 })
  } catch (error) {
    console.error('Brands POST error:', error)
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json({ error: 'Brand name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
