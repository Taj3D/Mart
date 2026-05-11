import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session.user,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    )
  }
}
