import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, createAuditLog } from '@/lib/db-utils'

// GET /api/investment-heads - List all investment heads (not deleted)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const investmentType = searchParams.get('investmentType') || ''
    const all = searchParams.get('all') === 'true'

    const where = {
      ...notDeleted(),
      ...(search ? { name: { contains: search } } : {}),
      ...(investmentType ? { investmentType } : {}),
    }

    if (all) {
      const records = await db.investmentHead.findMany({
        where,
        orderBy: { createdDate: 'desc' },
      })
      return NextResponse.json({ data: records })
    }

    const skip = (page - 1) * pageSize

    const [records, total] = await db.$transaction([
      db.investmentHead.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdDate: 'desc' },
      }),
      db.investmentHead.count({ where }),
    ])

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching investment heads:', error)
    return NextResponse.json({ error: 'Failed to fetch investment heads' }, { status: 500 })
  }
}

// POST /api/investment-heads - Create new investment head
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, investmentType, openingBalance, openingType, isActive, createdBy } = body

    if (!name || !investmentType) {
      return NextResponse.json({ error: 'Name and Investment Type are required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('InvestmentHead')
      const record = await tx.investmentHead.create({
        data: {
          code,
          name,
          description: description || null,
          investmentType,
          openingBalance: openingBalance || 0,
          openingType: openingType || 'Payment',
          isActive: isActive !== undefined ? isActive : true,
          createdBy: createdBy || null,
        },
      })
      await createAuditLog({
        userId: createdBy || undefined,
        action: 'Create',
        entity: 'InvestmentHead',
        entityId: record.id,
        newValues: record,
      })
      return record
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating investment head:', error)
    return NextResponse.json({ error: 'Failed to create investment head' }, { status: 500 })
  }
}
