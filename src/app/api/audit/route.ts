import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/audit */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const entity = searchParams.get('entity') || ''
    const action = searchParams.get('action') || ''

    const where: any = {}
    if (entity) where.entity = entity
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, userName: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data: logs,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('Audit GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
