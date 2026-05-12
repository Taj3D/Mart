import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/companies */
export async function GET() {
  try {
    const companies = await db.company.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: companies })
  } catch (error) {
    console.error('Companies GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
