// ============================================================================
// Electronics Mart IMS — Colors API
// GET: List colors (id, code, name, hexCode)
// ============================================================================

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeNotDeleted } from '@/lib/db-utils'

export async function GET() {
  try {
    const colors = await db.color.findMany({
      where: activeNotDeleted(),
      select: {
        id: true,
        code: true,
        name: true,
        hexCode: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(colors)
  } catch (error) {
    console.error('Colors API error:', error)
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 })
  }
}
