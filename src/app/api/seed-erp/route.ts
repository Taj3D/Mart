import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Seed categories
    const existingCategories = await db.category.count()
    if (existingCategories === 0) {
      await db.category.createMany({
        data: [
          { name: 'Electronics', description: 'Electronic devices and accessories' },
          { name: 'Clothing', description: 'Apparel and fashion items' },
          { name: 'Food & Beverage', description: 'Consumable food and drink products' },
          { name: 'Office Supplies', description: 'Stationery and office essentials' },
          { name: 'Hardware', description: 'Tools and hardware supplies' },
          { name: 'Health & Beauty', description: 'Personal care products' },
        ],
      })
    }

    // Seed products
    const existingProducts = await db.product.count()
    if (existingProducts === 0) {
      const categories = await db.category.findMany()
      const catMap: Record<string, string> = {}
      categories.forEach(c => { catMap[c.name] = c.id })

      await db.product.createMany({
        data: [
          { sku: 'ELEC-001', name: 'Wireless Mouse', categoryId: catMap['Electronics'], unit: 'pcs', costPrice: 12.5, sellPrice: 25.0, currentStock: 150, minStock: 20, maxStock: 500 },
          { sku: 'ELEC-002', name: 'USB-C Cable 1m', categoryId: catMap['Electronics'], unit: 'pcs', costPrice: 2.0, sellPrice: 5.99, currentStock: 500, minStock: 50, maxStock: 1000 },
          { sku: 'ELEC-003', name: 'Bluetooth Speaker', categoryId: catMap['Electronics'], unit: 'pcs', costPrice: 35.0, sellPrice: 69.99, currentStock: 45, minStock: 10, maxStock: 200 },
          { sku: 'ELEC-004', name: 'HDMI Adapter', categoryId: catMap['Electronics'], unit: 'pcs', costPrice: 5.0, sellPrice: 12.99, currentStock: 8, minStock: 15, maxStock: 300 },
          { sku: 'CLTH-001', name: 'Cotton T-Shirt', categoryId: catMap['Clothing'], unit: 'pcs', costPrice: 8.0, sellPrice: 19.99, currentStock: 200, minStock: 30, maxStock: 500 },
          { sku: 'CLTH-002', name: 'Denim Jeans', categoryId: catMap['Clothing'], unit: 'pcs', costPrice: 22.0, sellPrice: 49.99, currentStock: 75, minStock: 15, maxStock: 200 },
          { sku: 'CLTH-003', name: 'Wool Sweater', categoryId: catMap['Clothing'], unit: 'pcs', costPrice: 30.0, sellPrice: 65.0, currentStock: 3, minStock: 10, maxStock: 100 },
          { sku: 'FOOD-001', name: 'Organic Coffee 500g', categoryId: catMap['Food & Beverage'], unit: 'pcs', costPrice: 6.0, sellPrice: 14.99, currentStock: 300, minStock: 50, maxStock: 800 },
          { sku: 'FOOD-002', name: 'Green Tea Box', categoryId: catMap['Food & Beverage'], unit: 'box', costPrice: 3.5, sellPrice: 8.99, currentStock: 0, minStock: 40, maxStock: 500 },
          { sku: 'OFFC-001', name: 'A4 Paper Ream', categoryId: catMap['Office Supplies'], unit: 'ream', costPrice: 4.0, sellPrice: 8.5, currentStock: 250, minStock: 30, maxStock: 600 },
          { sku: 'OFFC-002', name: 'Ballpoint Pen Pack', categoryId: catMap['Office Supplies'], unit: 'pack', costPrice: 1.5, sellPrice: 3.99, currentStock: 400, minStock: 50, maxStock: 800 },
          { sku: 'HDWR-001', name: 'Power Drill', categoryId: catMap['Hardware'], unit: 'pcs', costPrice: 45.0, sellPrice: 89.99, currentStock: 25, minStock: 5, maxStock: 100 },
          { sku: 'HDWR-002', name: 'Screwdriver Set', categoryId: catMap['Hardware'], unit: 'set', costPrice: 15.0, sellPrice: 32.0, currentStock: 5, minStock: 10, maxStock: 100 },
          { sku: 'HLTH-001', name: 'Hand Sanitizer 500ml', categoryId: catMap['Health & Beauty'], unit: 'bottle', costPrice: 2.5, sellPrice: 6.99, currentStock: 180, minStock: 30, maxStock: 500 },
          { sku: 'HLTH-002', name: 'Face Cream', categoryId: catMap['Health & Beauty'], unit: 'jar', costPrice: 8.0, sellPrice: 18.5, currentStock: 0, minStock: 20, maxStock: 200 },
        ],
      })
    }

    // Seed customers
    const existingCustomers = await db.customer.count()
    if (existingCustomers === 0) {
      await db.customer.createMany({
        data: [
          { code: 'CUST-001', name: 'Acme Corporation', email: 'sales@acme.com', phone: '+1-555-0101', address: '123 Business Ave', city: 'New York', country: 'USA', creditLimit: 50000, balance: 0 },
          { code: 'CUST-002', name: 'Globex Industries', email: 'info@globex.com', phone: '+1-555-0102', address: '456 Tech Blvd', city: 'San Francisco', country: 'USA', creditLimit: 75000, balance: 2500 },
          { code: 'CUST-003', name: 'Wayne Enterprises', email: 'orders@wayne.com', phone: '+1-555-0103', address: '789 Gotham St', city: 'Chicago', country: 'USA', creditLimit: 100000, balance: 5000 },
          { code: 'CUST-004', name: 'Stark Industries', email: 'procurement@stark.com', phone: '+1-555-0104', address: '321 Innovation Dr', city: 'Los Angeles', country: 'USA', creditLimit: 200000, balance: 0 },
          { code: 'CUST-005', name: 'Umbrella Corp', email: 'supply@umbrella.com', phone: '+1-555-0105', address: '654 Raccoon Rd', city: 'Miami', country: 'USA', creditLimit: 30000, balance: 1200 },
          { code: 'CUST-006', name: 'Cyberdyne Systems', email: 'sales@cyberdyne.com', phone: '+1-555-0106', address: '987 Robot Lane', city: 'Seattle', country: 'USA', creditLimit: 80000, balance: 0 },
          { code: 'CUST-007', name: 'Initech LLC', email: 'office@initech.com', phone: '+1-555-0107', address: '147 Cubicle Way', city: 'Austin', country: 'USA', creditLimit: 15000, balance: 3500 },
          { code: 'CUST-008', name: 'Soylent Corp', email: 'orders@soylent.com', phone: '+1-555-0108', address: '258 Green St', city: 'Portland', country: 'USA', creditLimit: 45000, balance: 0 },
        ],
      })
    }

    // Seed suppliers
    const existingSuppliers = await db.supplier.count()
    if (existingSuppliers === 0) {
      await db.supplier.createMany({
        data: [
          { code: 'SUP-001', name: 'TechParts Global', email: 'supply@techparts.com', phone: '+86-555-0201', address: 'Industrial Zone', city: 'Shenzhen', country: 'China', balance: 0 },
          { code: 'SUP-002', name: 'FabTextiles', email: 'orders@fabtextiles.com', phone: '+91-555-0202', address: 'Textile District', city: 'Mumbai', country: 'India', balance: 15000 },
          { code: 'SUP-003', name: 'Nordic Goods', email: 'export@nordic.com', phone: '+46-555-0203', address: 'Harbor Area', city: 'Stockholm', country: 'Sweden', balance: 0 },
          { code: 'SUP-004', name: 'FreshHarvest Co', email: 'wholesale@freshharvest.com', phone: '+55-555-0204', address: 'Port Zone', city: 'Sao Paulo', country: 'Brazil', balance: 8000 },
          { code: 'SUP-005', name: 'Precision Tools Inc', email: 'sales@precision.com', phone: '+49-555-0205', address: 'Manufacturing Park', city: 'Munich', country: 'Germany', balance: 0 },
        ],
      })
    }

    // Seed warehouses
    const existingWarehouses = await db.warehouse.count()
    if (existingWarehouses === 0) {
      await db.warehouse.createMany({
        data: [
          { name: 'Main Warehouse', code: 'WH-MAIN', address: '100 Storage Lane, Industrial Zone', phone: '+1-555-0301', managerName: 'John Smith' },
          { name: 'East Distribution Center', code: 'WH-EAST', address: '200 East Blvd, Port Area', phone: '+1-555-0302', managerName: 'Sarah Chen' },
          { name: 'Cold Storage Facility', code: 'WH-COLD', address: '300 Chiller Rd, North Zone', phone: '+1-555-0303', managerName: 'Mike Johnson' },
        ],
      })
    }

    // Seed sales orders
    const existingSalesOrders = await db.salesOrder.count()
    if (existingSalesOrders === 0) {
      const customers = await db.customer.findMany()
      const products = await db.product.findMany()
      const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
      const now = new Date()

      for (let i = 0; i < 15; i++) {
        const customer = customers[i % customers.length]
        const numItems = Math.floor(Math.random() * 3) + 1
        const orderDate = new Date(now)
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30))

        let subtotal = 0
        const itemData = []
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)]
          const quantity = Math.floor(Math.random() * 10) + 1
          const unitPrice = product.sellPrice
          const totalPrice = parseFloat((quantity * unitPrice).toFixed(2))
          subtotal += totalPrice
          itemData.push({ productId: product.id, quantity, unitPrice, discount: 0, totalPrice })
        }

        const taxAmount = parseFloat((subtotal * 0.1).toFixed(2))
        const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2))

        await db.salesOrder.create({
          data: {
            orderNo: `SO-2024-${String(i + 1).padStart(4, '0')}`,
            customerId: customer.id,
            orderDate,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount,
            totalAmount,
            notes: i === 0 ? 'Priority delivery requested' : null,
            items: { create: itemData },
          },
        })
      }
    }

    // Seed purchase orders
    const existingPurchaseOrders = await db.purchaseOrder.count()
    if (existingPurchaseOrders === 0) {
      const suppliers = await db.supplier.findMany()
      const products = await db.product.findMany()
      const purchaseStatuses = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED']
      const now = new Date()

      for (let i = 0; i < 10; i++) {
        const supplier = suppliers[i % suppliers.length]
        const numItems = Math.floor(Math.random() * 3) + 1
        const orderDate = new Date(now)
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30))

        let subtotal = 0
        const itemData = []
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)]
          const quantity = Math.floor(Math.random() * 50) + 10
          const unitPrice = product.costPrice
          const totalPrice = parseFloat((quantity * unitPrice).toFixed(2))
          subtotal += totalPrice
          itemData.push({ productId: product.id, quantity, unitPrice, discount: 0, totalPrice })
        }

        const taxAmount = parseFloat((subtotal * 0.1).toFixed(2))
        const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2))

        await db.purchaseOrder.create({
          data: {
            orderNo: `PO-2024-${String(i + 1).padStart(4, '0')}`,
            supplierId: supplier.id,
            orderDate,
            expectedDate: new Date(orderDate.getTime() + 7 * 86400000),
            status: purchaseStatuses[Math.floor(Math.random() * purchaseStatuses.length)],
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount,
            totalAmount,
            items: { create: itemData },
          },
        })
      }
    }

    return NextResponse.json({ success: true, message: 'ERP data seeded successfully' })
  } catch (error) {
    console.error('ERP seed error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to seed ERP data' },
      { status: 500 }
    )
  }
}
