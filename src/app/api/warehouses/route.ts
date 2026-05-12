import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const warehouses = await db.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(warehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      address: w.address,
      phone: w.phone,
      managerName: w.managerName,
      isActive: w.isActive,
    })))
  } catch (error) {
    console.error('Warehouses API error:', error)
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const warehouse = await db.warehouse.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address || null,
        phone: body.phone || null,
        managerName: body.managerName || null,
      },
    })
    return NextResponse.json(warehouse, { status: 201 })
  } catch (error) {
    console.error('Create warehouse error:', error)
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 400 })
  }
}
