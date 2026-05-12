import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/audit-logs - List audit logs with pagination, filter by entity/action/userId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const entity = searchParams.get('entity') || ''
    const action = searchParams.get('action') || ''
    const userId = searchParams.get('userId') || ''

    const where: Record<string, unknown> = {}

    if (entity) {
      where.entity = entity
    }

    if (action) {
      where.action = action
    }

    if (userId) {
      where.userId = userId
    }

    const [auditLogs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data: auditLogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
