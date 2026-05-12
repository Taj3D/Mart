import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/emi */
export async function GET() {
  try {
    const plans = await db.emiPlan.findMany({
      where: { isActive: true },
      include: { _count: { select: { schedules: true } } },
      orderBy: { tenureMonths: 'asc' },
    })
    return NextResponse.json({ data: plans })
  } catch (error) {
    console.error('EMI GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch EMI plans' }, { status: 500 })
  }
}

/** POST /api/emi */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plan = await db.emiPlan.create({
      data: {
        planName: body.planName,
        tenureMonths: parseInt(body.tenureMonths),
        interestRate: parseFloat(body.interestRate) || 0,
        processingFee: parseFloat(body.processingFee) || 0,
        downPaymentPercent: parseFloat(body.downPaymentPercent) || 0,
      },
    })
    return NextResponse.json({ data: plan }, { status: 201 })
  } catch (error) {
    console.error('EMI POST error:', error)
    return NextResponse.json({ error: 'Failed to create EMI plan' }, { status: 500 })
  }
}
