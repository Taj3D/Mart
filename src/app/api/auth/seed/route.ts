import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.user.findUnique({
      where: { userName: "admin" },
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        user: {
          id: existingAdmin.id,
          userName: existingAdmin.userName,
          role: existingAdmin.role,
        },
      })
    }

    // Create default admin user
    const passwordHash = await hashPassword("admin123")

    const admin = await db.user.create({
      data: {
        userName: "admin",
        email: "admin@ims-erp.com",
        passwordHash,
        fullName: "System Administrator",
        role: "Admin",
        isActive: true,
      },
    })

    // Create default company settings
    const existingCompany = await db.company.findFirst()
    if (!existingCompany) {
      await db.company.create({
        data: {
          name: "IMS Enterprise",
          address: "Dhaka, Bangladesh",
          phone: "+880 1234567890",
          email: "info@ims-erp.com",
          currency: "BDT",
          financialYear: "2024-2025",
          isActive: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully. Admin credentials: admin / admin123",
      user: {
        id: admin.id,
        userName: admin.userName,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database" },
      { status: 500 }
    )
  }
}
