import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/company - Get company info (first record)
export async function GET() {
  try {
    const company = await db.company.findFirst()

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// PUT /api/company - Update company info (upsert if not exists)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Try to find existing company
    const existingCompany = await db.company.findFirst()

    const companyData: Record<string, unknown> = {}
    const allowedFields = ['name', 'address', 'phone', 'email', 'website', 'logo', 'currency', 'financialYear', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        companyData[field] = body[field]
      }
    }

    let company

    if (existingCompany) {
      // Update existing company
      company = await db.company.update({
        where: { id: existingCompany.id },
        data: companyData,
      })
    } else {
      // Create new company (upsert)
      if (!companyData.name) {
        return NextResponse.json(
          { error: 'Company name is required when creating' },
          { status: 400 }
        )
      }
      company = await db.company.create({
        data: companyData,
      })
    }

    return NextResponse.json({ data: company })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}
