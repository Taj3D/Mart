export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { db } = await import('@/lib/db')
      const { hashPassword } = await import('@/lib/auth')

      // ====================================================================
      // SEED 1: Users (admin + emart.amit)
      // ====================================================================
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

      // ====================================================================
      // SEED 2: Company
      // ====================================================================
      const existingCompany = await db.company.findFirst()
      if (!existingCompany) {
        await db.company.create({
          data: {
            code: 'CMP-00001',
            name: 'Electronics Mart',
            address: '52 Gulshan Avenue, Dhaka 1212',
            phone: '+880 2-8877665',
            email: 'info@electronicsmart.com',
            website: 'https://electronicsmart.com.bd',
            currency: 'BDT',
            financialYear: '2024-2025',
            isActive: true,
          },
        })
        console.log('[Seed] Company created: Electronics Mart')
      }

      // ====================================================================
      // SEED 3: Departments
      // ====================================================================
      const deptCount = await db.department.count()
      if (deptCount === 0) {
        await db.department.createMany({
          data: [
            { code: 'DEP-00001', name: 'Sales', description: 'Sales & Marketing Department' },
            { code: 'DEP-00002', name: 'Purchase', description: 'Procurement & Purchase Department' },
            { code: 'DEP-00003', name: 'Accounts', description: 'Finance & Accounts Department' },
            { code: 'DEP-00004', name: 'Warehouse', description: 'Warehouse & Logistics Department' },
            { code: 'DEP-00005', name: 'IT', description: 'Information Technology Department' },
            { code: 'DEP-00006', name: 'Management', description: 'Senior Management' },
          ],
        })
        console.log('[Seed] 6 departments created')
      }

      // ====================================================================
      // SEED 4: Designations
      // ====================================================================
      const desgCount = await db.designation.count()
      if (desgCount === 0) {
        await db.designation.createMany({
          data: [
            { code: 'DSG-00001', name: 'Managing Director', grade: 'A1' },
            { code: 'DSG-00002', name: 'General Manager', grade: 'A2' },
            { code: 'DSG-00003', name: 'Sales Manager', grade: 'B1' },
            { code: 'DSG-00004', name: 'Purchase Manager', grade: 'B1' },
            { code: 'DSG-00005', name: 'Accounts Manager', grade: 'B1' },
            { code: 'DSG-00006', name: 'Warehouse In-Charge', grade: 'B2' },
            { code: 'DSG-00007', name: 'Sales Representative', grade: 'C1' },
            { code: 'DSG-00008', name: 'IT Officer', grade: 'C1' },
          ],
        })
        console.log('[Seed] 8 designations created')
      }

      // ====================================================================
      // SEED 5: Units
      // ====================================================================
      const unitCount = await db.unit.count()
      if (unitCount === 0) {
        await db.unit.createMany({
          data: [
            { code: 'UNT-00001', name: 'Pieces', symbol: 'pcs' },
            { code: 'UNT-00002', name: 'Kilograms', symbol: 'kg' },
            { code: 'UNT-00003', name: 'Liters', symbol: 'ltr' },
            { code: 'UNT-00004', name: 'Meters', symbol: 'm' },
            { code: 'UNT-00005', name: 'Set', symbol: 'set' },
            { code: 'UNT-00006', name: 'Box', symbol: 'box' },
            { code: 'UNT-00007', name: 'Carton', symbol: 'ctn' },
            { code: 'UNT-00008', name: 'Ton', symbol: 'ton' },
          ],
        })
        console.log('[Seed] 8 units created')
      }

      // ====================================================================
      // SEED 6: Brands
      // ====================================================================
      const brandCount = await db.brand.count()
      if (brandCount === 0) {
        await db.brand.createMany({
          data: [
            { code: 'BRD-00001', name: 'Samsung', description: 'Samsung Electronics' },
            { code: 'BRD-00002', name: 'LG', description: 'LG Electronics' },
            { code: 'BRD-00003', name: 'Sony', description: 'Sony Corporation' },
            { code: 'BRD-00004', name: 'Whirlpool', description: 'Whirlpool Corporation' },
            { code: 'BRD-00005', name: 'Walton', description: 'Walton Hi-Tech Industries' },
            { code: 'BRD-00006', name: 'Xiaomi', description: 'Xiaomi Corporation' },
            { code: 'BRD-00007', name: 'Realme', description: 'Realme (BBK Electronics)' },
            { code: 'BRD-00008', name: 'Carrier', description: 'Carrier Global Corporation' },
            { code: 'BRD-00009', name: 'Gree', description: 'Gree Electric Appliances' },
            { code: 'BRD-00010', name: 'Haier', description: 'Haier Group' },
          ],
        })
        console.log('[Seed] 10 brands created')
      }

      // ====================================================================
      // SEED 7: Categories (hierarchical)
      // ====================================================================
      const catCount = await db.category.count()
      if (catCount === 0) {
        // Root categories
        const tv = await db.category.create({ data: { code: 'CAT-00001', name: 'Television', description: 'All types of TVs' } })
        const ac = await db.category.create({ data: { code: 'CAT-00002', name: 'Air Conditioner', description: 'All types of ACs' } })
        const fridge = await db.category.create({ data: { code: 'CAT-00003', name: 'Refrigerator', description: 'All types of refrigerators' } })
        const mobile = await db.category.create({ data: { code: 'CAT-00004', name: 'Mobile Phone', description: 'Smartphones & feature phones' } })
        const laptop = await db.category.create({ data: { code: 'CAT-00005', name: 'Laptop', description: 'Laptops & notebooks' } })
        const wash = await db.category.create({ data: { code: 'CAT-00006', name: 'Washing Machine', description: 'All washing machines' } })
        const micro = await db.category.create({ data: { code: 'CAT-00007', name: 'Microwave Oven', description: 'Microwave ovens' } })
        const audio = await db.category.create({ data: { code: 'CAT-00008', name: 'Audio System', description: 'Speakers & sound systems' } })

        // Sub-categories
        await db.category.createMany({
          data: [
            { code: 'CAT-00009', name: 'LED TV', parentId: tv.id },
            { code: 'CAT-00010', name: 'Smart TV', parentId: tv.id },
            { code: 'CAT-00011', name: 'OLED TV', parentId: tv.id },
            { code: 'CAT-00012', name: 'Split AC', parentId: ac.id },
            { code: 'CAT-00013', name: 'Window AC', parentId: ac.id },
            { code: 'CAT-00014', name: 'Cassette AC', parentId: ac.id },
            { code: 'CAT-00015', name: 'Single Door Fridge', parentId: fridge.id },
            { code: 'CAT-00016', name: 'Double Door Fridge', parentId: fridge.id },
            { code: 'CAT-00017', name: 'Side-by-Side Fridge', parentId: fridge.id },
            { code: 'CAT-00018', name: 'Smartphone', parentId: mobile.id },
            { code: 'CAT-00019', name: 'Feature Phone', parentId: mobile.id },
          ],
        })
        console.log('[Seed] 19 categories created (8 root + 11 sub)')
      }

      // ====================================================================
      // SEED 8: Colors
      // ====================================================================
      const colorCount = await db.color.count()
      if (colorCount === 0) {
        await db.color.createMany({
          data: [
            { code: 'CLR-00001', name: 'Black', hexCode: '#000000' },
            { code: 'CLR-00002', name: 'White', hexCode: '#FFFFFF' },
            { code: 'CLR-00003', name: 'Silver', hexCode: '#C0C0C0' },
            { code: 'CLR-00004', name: 'Grey', hexCode: '#808080' },
            { code: 'CLR-00005', name: 'Blue', hexCode: '#0000FF' },
            { code: 'CLR-00006', name: 'Red', hexCode: '#FF0000' },
            { code: 'CLR-00007', name: 'Gold', hexCode: '#FFD700' },
            { code: 'CLR-00008', name: 'Rose Gold', hexCode: '#B76E79' },
          ],
        })
        console.log('[Seed] 8 colors created')
      }

      // ====================================================================
      // SEED 9: Capacities
      // ====================================================================
      const capCount = await db.capacity.count()
      if (capCount === 0) {
        await db.capacity.createMany({
          data: [
            { code: 'CAP-00001', name: '64GB', value: 64, unit: 'GB' },
            { code: 'CAP-00002', name: '128GB', value: 128, unit: 'GB' },
            { code: 'CAP-00003', name: '256GB', value: 256, unit: 'GB' },
            { code: 'CAP-00004', name: '512GB', value: 512, unit: 'GB' },
            { code: 'CAP-00005', name: '1 Ton', value: 1, unit: 'Ton' },
            { code: 'CAP-00006', name: '1.5 Ton', value: 1.5, unit: 'Ton' },
            { code: 'CAP-00007', name: '2 Ton', value: 2, unit: 'Ton' },
            { code: 'CAP-00008', name: '200L', value: 200, unit: 'L' },
            { code: 'CAP-00009', name: '320L', value: 320, unit: 'L' },
            { code: 'CAP-00010', name: '420L', value: 420, unit: 'L' },
            { code: 'CAP-00011', name: '55 inch', value: 55, unit: 'inch' },
            { code: 'CAP-00012', name: '65 inch', value: 65, unit: 'inch' },
          ],
        })
        console.log('[Seed] 12 capacities created')
      }

      // ====================================================================
      // SEED 10: Segments
      // ====================================================================
      const segCount = await db.segment.count()
      if (segCount === 0) {
        await db.segment.createMany({
          data: [
            { code: 'SEG-00001', name: 'Budget', description: 'Entry-level affordable products' },
            { code: 'SEG-00002', name: 'Mid-Range', description: 'Mid-range balanced products' },
            { code: 'SEG-00003', name: 'Premium', description: 'High-end premium products' },
            { code: 'SEG-00004', name: 'Ultra-Premium', description: 'Flagship / luxury products' },
          ],
        })
        console.log('[Seed] 4 segments created')
      }

      // ====================================================================
      // SEED 11: Warehouses
      // ====================================================================
      const whsCount = await db.warehouse.count()
      if (whsCount === 0) {
        await db.warehouse.createMany({
          data: [
            { code: 'WHS-00001', name: 'Main Warehouse', address: 'Gulshan, Dhaka', type: 'General', managerName: 'Rahim Uddin' },
            { code: 'WHS-00002', name: 'Cold Storage', address: 'Uttara, Dhaka', type: 'ColdStorage', managerName: 'Karim Hossain' },
            { code: 'WHS-00003', name: 'Showroom Stock', address: 'Dhanmondi, Dhaka', type: 'General', managerName: 'Jamal Ahmed' },
          ],
        })
        console.log('[Seed] 3 warehouses created')
      }

      // ====================================================================
      // SEED 12: Payment Options & Card Types
      // ====================================================================
      const payOptCount = await db.paymentOption.count()
      if (payOptCount === 0) {
        await db.paymentOption.createMany({
          data: [
            { code: 'POP-00001', name: 'Cash', description: 'Cash payment' },
            { code: 'POP-00002', name: 'Card', description: 'Credit/Debit card' },
            { code: 'POP-00003', name: 'Bank Transfer', description: 'Direct bank transfer' },
            { code: 'POP-00004', name: 'Mobile Banking', description: 'bKash, Nagad, Rocket' },
            { code: 'POP-00005', name: 'EMI', description: 'Equal Monthly Installment' },
            { code: 'POP-00006', name: 'Check', description: 'Bank check payment' },
          ],
        })
        console.log('[Seed] 6 payment options created')
      }

      const cardTypeCount = await db.cardType.count()
      if (cardTypeCount === 0) {
        await db.cardType.createMany({
          data: [
            { code: 'CDT-00001', name: 'Visa', description: 'Visa credit/debit card' },
            { code: 'CDT-00002', name: 'Mastercard', description: 'Mastercard credit/debit card' },
            { code: 'CDT-00003', name: 'Amex', description: 'American Express card' },
            { code: 'CDT-00004', name: 'DBBL Nexus', description: 'Dutch Bangla Nexus card' },
          ],
        })
        console.log('[Seed] 4 card types created')
      }

      // ====================================================================
      // SEED 13: Bank Accounts
      // ====================================================================
      const bankCount = await db.bankAccount.count()
      if (bankCount === 0) {
        await db.bankAccount.createMany({
          data: [
            { code: 'BNA-00001', bankName: 'Dutch Bangla Bank', accountName: 'Electronics Mart', accountNumber: '1234567890', branch: 'Gulshan', balance: 500000, openingBalance: 500000 },
            { code: 'BNA-00002', bankName: 'BRAC Bank', accountName: 'Electronics Mart', accountNumber: '0987654321', branch: 'Dhanmondi', balance: 300000, openingBalance: 300000 },
          ],
        })
        console.log('[Seed] 2 bank accounts created')
      }

      // ====================================================================
      // SEED 14: Settings
      // ====================================================================
      const settingCount = await db.setting.count()
      if (settingCount === 0) {
        await db.setting.createMany({
          data: [
            { key: 'company_name', value: 'Electronics Mart', category: 'General' },
            { key: 'currency', value: 'BDT', category: 'General' },
            { key: 'currency_symbol', value: '৳', category: 'General' },
            { key: 'tax_rate', value: '15', category: 'General', description: 'VAT percentage' },
            { key: 'low_stock_alert', value: 'true', category: 'Inventory' },
            { key: 'sms_enabled', value: 'false', category: 'Sms' },
            { key: 'invoice_prefix', value: 'INV', category: 'Report' },
            { key: 'date_format', value: 'dd/MM/yyyy', category: 'General' },
            { key: 'fiscal_year_start', value: 'July', category: 'General' },
          ],
        })
        console.log('[Seed] 9 settings created')
      }

      console.log('[Seed] ✅ All Phase 2 seed data initialized successfully')
    } catch (error) {
      console.error('[Seed] Auto-seed error:', error)
    }
  }
}
