import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, password } = body

    if (!userName || !password) {
      return NextResponse.json(
        { success: false, message: "User name and password are required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { userName },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid user name or password" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated. Contact administrator." },
        { status: 403 }
      )
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid user name or password" },
        { status: 401 }
      )
    }

    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    )
  }
}
