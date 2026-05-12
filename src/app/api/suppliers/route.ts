import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      where: { isActive: true },
      include: { _count: { select: { purchaseOrders: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(suppliers.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      country: s.country,
      balance: s.balance,
      orderCount: s._count.purchaseOrders,
      isActive: s.isActive,
    })))
  } catch (error) {
    console.error('Suppliers API error:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supplier = await db.supplier.create({
      data: {
        code: body.code || `SUP-${Date.now()}`,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || null,
        balance: body.balance || 0,
      },
    })
    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 400 })
  }
}
