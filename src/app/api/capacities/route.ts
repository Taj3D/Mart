// ============================================================================
// Electronics Mart IMS — Capacities API
// GET: List capacities (id, code, name, value, unit)
// ============================================================================

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeNotDeleted } from '@/lib/db-utils'

export async function GET() {
  try {
    const capacities = await db.capacity.findMany({
      where: activeNotDeleted(),
      select: {
        id: true,
        code: true,
        name: true,
        value: true,
        unit: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(capacities)
  } catch (error) {
    console.error('Capacities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch capacities' }, { status: 500 })
  }
}
