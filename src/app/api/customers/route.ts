import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      where: { isActive: true },
      include: { _count: { select: { salesOrders: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(customers.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      country: c.country,
      creditLimit: c.creditLimit,
      balance: c.balance,
      orderCount: c._count.salesOrders,
      isActive: c.isActive,
    })))
  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customer = await db.customer.create({
      data: {
        code: body.code || `CUST-${Date.now()}`,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || null,
        creditLimit: body.creditLimit || 0,
        balance: body.balance || 0,
      },
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 400 })
  }
}
