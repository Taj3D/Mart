export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { db } = await import('@/lib/db')
      const { hashPassword } = await import('@/lib/auth')
      
      // Auto-seed admin user if not exists
      const existingAdmin = await db.user.findUnique({ where: { userName: 'admin' } })
      if (!existingAdmin) {
        const passwordHash = await hashPassword('admin123')
        await db.user.create({
          data: {
            userName: 'admin',
            email: 'admin@electronicsmart.com',
            passwordHash,
            fullName: 'System Administrator',
            role: 'Admin',
            isActive: true,
          },
        })
        console.log('[Seed] Admin user created: admin / admin123')
      }

      // Auto-seed emart.amit user if not exists
      const existingEmart = await db.user.findUnique({ where: { userName: 'emart.amit' } })
      if (!existingEmart) {
        const passwordHash = await hashPassword('Test_123')
        await db.user.create({
          data: {
            userName: 'emart.amit',
            email: 'amit@electronicsmart.com',
            passwordHash,
            fullName: 'Amit Manager',
            role: 'Admin',
            isActive: true,
          },
        })
        console.log('[Seed] Emart user created: emart.amit / Test_123')
      }

      // Auto-seed company if not exists
      const existingCompany = await db.company.findFirst()
      if (!existingCompany) {
        await db.company.create({
          data: {
            name: 'Electronics Mart',
            address: '52 Gulshan Avenue, Dhaka 1212',
            phone: '+880 2-8877665',
            email: 'info@electronicsmart.com',
            currency: 'BDT',
            financialYear: '2024-2025',
            isActive: true,
          },
        })
        console.log('[Seed] Company created: Electronics Mart')
      }
    } catch (error) {
      console.error('[Seed] Auto-seed error:', error)
    }
  }
}
