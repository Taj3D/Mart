import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/db-utils'

// Hardcoded credentials for quick access
const HARDCODED_CREDENTIALS: Record<string, { password: string; name: string; email: string; role: string }> = {
  'emart.amit': {
    password: 'Test_123',
    name: 'Amit Electronics Mart',
    email: 'amit@electronicsmart.com',
    role: 'Admin',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, password } = body

    if (!userName || !password) {
      return NextResponse.json(
        { success: false, error: 'User name and password are required' },
        { status: 400 }
      )
    }

    // 1. Check hardcoded credentials first
    const hardcodedUser = HARDCODED_CREDENTIALS[userName]
    if (hardcodedUser && hardcodedUser.password === password) {
      // Try to find the matching DB user for the ID reference
      const dbUser = await db.user.findUnique({ where: { userName } })

      if (dbUser) {
        // Update last login in transaction
        await db.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date() },
          })
          await createAuditLog({
            userId: dbUser.id,
            action: 'Login',
            entity: 'User',
            entityId: dbUser.id,
            newValues: { userName, loginMethod: 'hardcoded' },
          })
        })

        return NextResponse.json({
          success: true,
          user: {
            id: dbUser.id,
            name: dbUser.fullName || hardcodedUser.name,
            email: dbUser.email || hardcodedUser.email,
            role: dbUser.role,
          },
        })
      }

      // Hardcoded user not in DB yet — return hardcoded profile
      return NextResponse.json({
        success: true,
        user: {
          id: 'hardcoded-emart-amit',
          name: hardcodedUser.name,
          email: hardcodedUser.email,
          role: hardcodedUser.role,
        },
      })
    }

    // 2. Check database credentials using bcryptjs compare
    const user = await db.user.findUnique({
      where: { userName },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Contact administrator.' },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login time in atomic transaction
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
      await createAuditLog({
        userId: user.id,
        action: 'Login',
        entity: 'User',
        entityId: user.id,
        newValues: { userName, loginMethod: 'database' },
      })
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName || user.userName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
