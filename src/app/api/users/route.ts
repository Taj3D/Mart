import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// GET /api/users - List all users (exclude passwordHash), with search by name/role
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { fullName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (role) {
      where.role = role
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        userName: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            purchaseOrders: true,
            salesOrders: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { userName: 'asc' },
    })

    return NextResponse.json(
      users.map(u => ({
        id: u.id,
        userName: u.userName,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        purchaseOrderCount: u._count.purchaseOrders,
        salesOrderCount: u._count.salesOrders,
        auditLogCount: u._count.auditLogs,
      }))
    )
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (hash password)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userName || !body.password) {
      return NextResponse.json(
        { error: 'userName and password are required' },
        { status: 400 }
      )
    }

    // Check for duplicate userName
    const existingUser = await db.user.findUnique({
      where: { userName: body.userName },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this userName already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(body.password)

    const user = await db.user.create({
      data: {
        userName: body.userName,
        email: body.email || null,
        passwordHash,
        fullName: body.fullName || null,
        role: body.role || 'User',
      },
      select: {
        id: true,
        userName: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    )
  }
}
