// ============================================================================
// Electronics Mart IMS — Segments API
// GET: List segments (id, code, name)
// ============================================================================

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeNotDeleted } from '@/lib/db-utils'

export async function GET() {
  try {
    const segments = await db.segment.findMany({
      where: activeNotDeleted(),
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(segments)
  } catch (error) {
    console.error('Segments API error:', error)
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}
