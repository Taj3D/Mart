// ============================================================================
// Electronics Mart IMS — Units API
// GET: List units (id, code, name, symbol)
// ============================================================================

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeNotDeleted } from '@/lib/db-utils'

export async function GET() {
  try {
    const units = await db.unit.findMany({
      where: activeNotDeleted(),
      select: {
        id: true,
        code: true,
        name: true,
        symbol: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Units API error:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}
