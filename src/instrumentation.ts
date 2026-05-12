export async function register() {
  // Auto-seed the database on first startup
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { db } = await import('@/lib/db')
      const { hashPassword } = await import('@/lib/auth')

      const adminExists = await db.user.findUnique({
        where: { userName: 'admin' },
      })

      if (!adminExists) {
        console.log('[Auto-Seed] Creating default admin user...')
        const passwordHash = await hashPassword('admin123')

        await db.user.create({
          data: {
            userName: 'admin',
            email: 'admin@ims-erp.com',
            passwordHash,
            fullName: 'System Administrator',
            role: 'Admin',
            isActive: true,
          },
        })

        console.log('[Auto-Seed] Admin user created successfully (admin / admin123)')

        // Create default company if not exists
        const companyExists = await db.company.findFirst()
        if (!companyExists) {
          await db.company.create({
            data: {
              name: 'X-Mart Global',
              address: 'Dhaka, Bangladesh',
              phone: '+880 1234567890',
              email: 'info@xmart-global.com',
              currency: 'BDT',
              financialYear: '2024-2025',
              isActive: true,
            },
          })
          console.log('[Auto-Seed] Default company created')
        }
      }
    } catch (error) {
      console.error('[Auto-Seed] Error:', error)
    }
  }
}
