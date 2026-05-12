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
          name: "X-Mart Global",
          address: "Dhaka, Bangladesh",
          phone: "+880 1234567890",
          email: "info@xmart-global.com",
          currency: "BDT",
          financialYear: "2024-2025",
          isActive: true,
        },
      })
    }

    // Seed categories if they don't exist
    const existingCategories = await db.category.count()
    if (existingCategories === 0) {
      // Parent categories
      const electronics = await db.category.create({
        data: { name: "Electronics", description: "Electronic devices and accessories", isActive: true },
      })
      const clothing = await db.category.create({
        data: { name: "Clothing", description: "Apparel and fashion items", isActive: true },
      })
      const food = await db.category.create({
        data: { name: "Food & Beverages", description: "Food items and beverages", isActive: true },
      })
      const office = await db.category.create({
        data: { name: "Office Supplies", description: "Office stationery and supplies", isActive: true },
      })
      const hardware = await db.category.create({
        data: { name: "Hardware", description: "Hardware and tools", isActive: true },
      })

      // Sub-categories
      await db.category.createMany({
        data: [
          { name: "Laptops", description: "Laptop computers", parentId: electronics.id, isActive: true },
          { name: "Mobile Phones", description: "Smartphones and mobile devices", parentId: electronics.id, isActive: true },
          { name: "Accessories", description: "Electronic accessories", parentId: electronics.id, isActive: true },
          { name: "Men's Wear", description: "Men's clothing", parentId: clothing.id, isActive: true },
          { name: "Women's Wear", description: "Women's clothing", parentId: clothing.id, isActive: true },
          { name: "Beverages", description: "Drinks and beverages", parentId: food.id, isActive: true },
          { name: "Snacks", description: "Snack items", parentId: food.id, isActive: true },
          { name: "Stationery", description: "Pens, paper, and stationery", parentId: office.id, isActive: true },
          { name: "Tools", description: "Hand tools and power tools", parentId: hardware.id, isActive: true },
        ],
      })
    }

    // Seed warehouses if they don't exist
    const existingWarehouses = await db.warehouse.count()
    let mainWarehouseId = ""
    if (existingWarehouses === 0) {
      const mainWarehouse = await db.warehouse.create({
        data: {
          name: "Main Warehouse",
          code: "WH-001",
          address: "Industrial Area, Dhaka",
          phone: "+880 9876543210",
          managerName: "Rahim Uddin",
          isActive: true,
        },
      })
      mainWarehouseId = mainWarehouse.id

      await db.warehouse.create({
        data: {
          name: "Secondary Warehouse",
          code: "WH-002",
          address: "Chittagong Port Area",
          phone: "+880 9876543211",
          managerName: "Karim Hossain",
          isActive: true,
        },
      })

      await db.warehouse.create({
        data: {
          name: "Cold Storage",
          code: "WH-003",
          address: "Savar, Dhaka",
          phone: "+880 9876543212",
          managerName: "Fatima Begum",
          isActive: true,
        },
      })
    } else {
      const mainWarehouse = await db.warehouse.findFirst()
      mainWarehouseId = mainWarehouse?.id || ""
    }

    // Seed products if they don't exist
    const existingProducts = await db.product.count()
    if (existingProducts === 0) {
      // Get category IDs
      const categories = await db.category.findMany()
      const electronicsCategory = categories.find(c => c.name === "Electronics")
      const clothingCategory = categories.find(c => c.name === "Clothing")
      const foodCategory = categories.find(c => c.name === "Food & Beverages")
      const officeCategory = categories.find(c => c.name === "Office Supplies")
      const hardwareCategory = categories.find(c => c.name === "Hardware")

      await db.product.createMany({
        data: [
          { sku: "ELEC-001", name: "Dell Latitude 5540 Laptop", description: "15.6 inch, i7, 16GB RAM, 512GB SSD", categoryId: electronicsCategory?.id || null, unit: "pcs", costPrice: 65000, sellPrice: 78000, minStock: 5, maxStock: 50, currentStock: 25, isActive: true },
          { sku: "ELEC-002", name: "HP EliteBook 840", description: "14 inch, i5, 8GB RAM, 256GB SSD", categoryId: electronicsCategory?.id || null, unit: "pcs", costPrice: 52000, sellPrice: 62000, minStock: 5, maxStock: 40, currentStock: 18, isActive: true },
          { sku: "ELEC-003", name: "Samsung Galaxy S24", description: "6.2 inch, 256GB, 8GB RAM", categoryId: electronicsCategory?.id || null, unit: "pcs", costPrice: 85000, sellPrice: 99999, minStock: 10, maxStock: 100, currentStock: 45, isActive: true },
          { sku: "ELEC-004", name: "iPhone 15 Pro", description: "6.1 inch, 128GB", categoryId: electronicsCategory?.id || null, unit: "pcs", costPrice: 110000, sellPrice: 135000, minStock: 5, maxStock: 30, currentStock: 12, isActive: true },
          { sku: "ELEC-005", name: "USB-C Hub 7-in-1", description: "7 port USB-C hub with HDMI", categoryId: electronicsCategory?.id || null, unit: "pcs", costPrice: 1200, sellPrice: 2200, minStock: 20, maxStock: 200, currentStock: 85, isActive: true },
          { sku: "CLTH-001", name: "Formal Shirt - Blue", description: "Cotton formal shirt, size M-XL", categoryId: clothingCategory?.id || null, unit: "pcs", costPrice: 800, sellPrice: 1500, minStock: 30, maxStock: 300, currentStock: 150, isActive: true },
          { sku: "CLTH-002", name: "Denim Jeans - Dark", description: "Slim fit denim jeans, size 30-38", categoryId: clothingCategory?.id || null, unit: "pcs", costPrice: 1200, sellPrice: 2500, minStock: 20, maxStock: 200, currentStock: 75, isActive: true },
          { sku: "CLTH-003", name: "Saree - Silk", description: "Pure silk saree, traditional design", categoryId: clothingCategory?.id || null, unit: "pcs", costPrice: 3500, sellPrice: 6500, minStock: 10, maxStock: 100, currentStock: 3, isActive: true },
          { sku: "FOOD-001", name: "Mineral Water 1L", description: "Packaged drinking water 1 liter", categoryId: foodCategory?.id || null, unit: "bottle", costPrice: 12, sellPrice: 20, minStock: 100, maxStock: 1000, currentStock: 500, isActive: true },
          { sku: "FOOD-002", name: "Basmati Rice 5kg", description: "Premium basmati rice 5kg pack", categoryId: foodCategory?.id || null, unit: "pack", costPrice: 450, sellPrice: 650, minStock: 50, maxStock: 500, currentStock: 2, isActive: true },
          { sku: "FOOD-003", name: "Green Tea Pack 25bags", description: "Premium green tea, 25 tea bags", categoryId: foodCategory?.id || null, unit: "pack", costPrice: 180, sellPrice: 320, minStock: 30, maxStock: 300, currentStock: 120, isActive: true },
          { sku: "OFFC-001", name: "A4 Paper Ream 500", description: "A4 size copy paper, 500 sheets", categoryId: officeCategory?.id || null, unit: "ream", costPrice: 350, sellPrice: 500, minStock: 50, maxStock: 500, currentStock: 200, isActive: true },
          { sku: "OFFC-002", name: "Ball Pen Blue (Box 12)", description: "Blue ballpoint pens, box of 12", categoryId: officeCategory?.id || null, unit: "box", costPrice: 80, sellPrice: 150, minStock: 20, maxStock: 200, currentStock: 90, isActive: true },
          { sku: "HDWR-001", name: "Cordless Drill 18V", description: "18V cordless drill with battery", categoryId: hardwareCategory?.id || null, unit: "pcs", costPrice: 4500, sellPrice: 7500, minStock: 5, maxStock: 50, currentStock: 15, isActive: true },
          { sku: "HDWR-002", name: "Wrench Set 12pc", description: "12-piece combination wrench set", categoryId: hardwareCategory?.id || null, unit: "set", costPrice: 2800, sellPrice: 4500, minStock: 5, maxStock: 30, currentStock: 8, isActive: true },
        ],
      })
    }

    // Seed customers if they don't exist
    const existingCustomers = await db.customer.count()
    if (existingCustomers === 0) {
      await db.customer.createMany({
        data: [
          { code: "CUST-001", name: "Rahim Enterprise", email: "info@rahim-enterprise.com", phone: "+880 171234567", address: "456 Motijheel", city: "Dhaka", country: "Bangladesh", creditLimit: 500000, balance: 0, isActive: true },
          { code: "CUST-002", name: "Karim Traders", email: "karim@traders.com", phone: "+880 181234567", address: "789 Agrabad", city: "Chittagong", country: "Bangladesh", creditLimit: 300000, balance: 25000, isActive: true },
          { code: "CUST-003", name: "Fatima Store", email: "fatima@store.com", phone: "+880 191234567", address: "12 Rajshahi Road", city: "Rajshahi", country: "Bangladesh", creditLimit: 200000, balance: 0, isActive: true },
          { code: "CUST-004", name: "Global Solutions Ltd", email: "contact@globalsol.com", phone: "+880 161234567", address: "34 Gulshan Avenue", city: "Dhaka", country: "Bangladesh", creditLimit: 1000000, balance: 150000, isActive: true },
          { code: "CUST-005", name: "Nabil Corporation", email: "info@nabilcorp.com", phone: "+880 151234567", address: "56 Uttara Sector 7", city: "Dhaka", country: "Bangladesh", creditLimit: 750000, balance: 0, isActive: true },
        ],
      })
    }

    // Seed suppliers if they don't exist
    const existingSuppliers = await db.supplier.count()
    if (existingSuppliers === 0) {
      await db.supplier.createMany({
        data: [
          { code: "SUP-001", name: "TechDistributors BD", email: "sales@techdist.com", phone: "+880 211234567", address: "123 Elephant Road", city: "Dhaka", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-002", name: "Garment World", email: "info@garmentworld.com", phone: "+880 221234567", address: "45 Narayanganj", city: "Narayanganj", country: "Bangladesh", balance: 50000, isActive: true },
          { code: "SUP-003", name: "FoodLink International", email: "supply@foodlink.com", phone: "+880 231234567", address: "78 Chittagong Port", city: "Chittagong", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-004", name: "Office Depot BD", email: "orders@officedepotbd.com", phone: "+880 241234567", address: "90 Dhanmondi", city: "Dhaka", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-005", name: "Hardware Solutions", email: "sales@hwsolutions.com", phone: "+880 251234567", address: "34 Tongi Industrial Area", city: "Gazipur", country: "Bangladesh", balance: 20000, isActive: true },
        ],
      })
    }

    // Seed sample purchase orders if they don't exist
    const existingPurchaseOrders = await db.purchaseOrder.count()
    if (existingPurchaseOrders === 0) {
      const supplier1 = await db.supplier.findFirst({ where: { code: "SUP-001" } })
      const supplier3 = await db.supplier.findFirst({ where: { code: "SUP-003" } })
      const product1 = await db.product.findFirst({ where: { sku: "ELEC-001" } })
      const product3 = await db.product.findFirst({ where: { sku: "ELEC-003" } })
      const product9 = await db.product.findFirst({ where: { sku: "FOOD-001" } })
      const product10 = await db.product.findFirst({ where: { sku: "FOOD-002" } })

      if (supplier1 && product1 && product3) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-001",
            supplierId: supplier1.id,
            orderDate: new Date("2024-12-01"),
            expectedDate: new Date("2024-12-15"),
            status: "RECEIVED",
            subtotal: 2925000,
            taxAmount: 0,
            totalAmount: 2925000,
            notes: "Quarterly electronics restock",
            createdBy: admin.id,
            items: {
              create: [
                { productId: product1.id, quantity: 25, unitPrice: 65000, discount: 0, totalPrice: 1625000 },
                { productId: product3.id, quantity: 15, unitPrice: 85000, discount: 0, totalPrice: 1275000 },
                { productId: product3.id, quantity: 1, unitPrice: 85000, discount: 25000, totalPrice: 25000 },
              ],
            },
          },
        })
      }

      if (supplier3 && product9 && product10) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-002",
            supplierId: supplier3.id,
            orderDate: new Date("2024-12-10"),
            expectedDate: new Date("2024-12-20"),
            status: "PENDING",
            subtotal: 292500,
            taxAmount: 0,
            totalAmount: 292500,
            notes: "Monthly food supply order",
            createdBy: admin.id,
            items: {
              create: [
                { productId: product9.id, quantity: 500, unitPrice: 12, discount: 0, totalPrice: 6000 },
                { productId: product10.id, quantity: 200, unitPrice: 450, discount: 0, totalPrice: 90000 },
                { productId: product10.id, quantity: 100, unitPrice: 450, discount: 3500, totalPrice: 41500 },
              ],
            },
          },
        })
      }
    }

    // Seed sample sales orders if they don't exist
    const existingSalesOrders = await db.salesOrder.count()
    if (existingSalesOrders === 0) {
      const customer1 = await db.customer.findFirst({ where: { code: "CUST-001" } })
      const customer4 = await db.customer.findFirst({ where: { code: "CUST-004" } })
      const product1 = await db.product.findFirst({ where: { sku: "ELEC-001" } })
      const product5 = await db.product.findFirst({ where: { sku: "ELEC-005" } })
      const product6 = await db.product.findFirst({ where: { sku: "CLTH-001" } })
      const product12 = await db.product.findFirst({ where: { sku: "OFFC-001" } })

      if (customer1 && product1 && product5) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2024-001",
            customerId: customer1.id,
            orderDate: new Date("2024-12-05"),
            deliveryDate: new Date("2024-12-12"),
            status: "DELIVERED",
            subtotal: 822200,
            taxAmount: 0,
            totalAmount: 822200,
            notes: "Bulk order for office setup",
            createdBy: admin.id,
            items: {
              create: [
                { productId: product1.id, quantity: 10, unitPrice: 78000, discount: 0, totalPrice: 780000 },
                { productId: product5.id, quantity: 20, unitPrice: 2200, discount: 0, totalPrice: 44000 },
              ],
            },
          },
        })
      }

      if (customer4 && product6 && product12) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2024-002",
            customerId: customer4.id,
            orderDate: new Date("2024-12-15"),
            deliveryDate: new Date("2024-12-22"),
            status: "CONFIRMED",
            subtotal: 140000,
            taxAmount: 0,
            totalAmount: 140000,
            notes: "Corporate supply order",
            createdBy: admin.id,
            items: {
              create: [
                { productId: product6.id, quantity: 50, unitPrice: 1500, discount: 5000, totalPrice: 70000 },
                { productId: product12.id, quantity: 100, unitPrice: 500, discount: 20000, totalPrice: 30000 },
              ],
            },
          },
        })
      }
    }

    // Seed sample stock movements if none exist and we have a warehouse
    const existingMovements = await db.stockMovement.count()
    if (existingMovements === 0 && mainWarehouseId) {
      const product1 = await db.product.findFirst({ where: { sku: "ELEC-001" } })
      const product3 = await db.product.findFirst({ where: { sku: "ELEC-003" } })
      const product9 = await db.product.findFirst({ where: { sku: "FOOD-001" } })

      if (product1) {
        await db.stockMovement.create({
          data: {
            productId: product1.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 25,
            referenceNo: "PO-2024-001",
            notes: "Purchase order received",
            movedBy: admin.id,
          },
        })
      }

      if (product3) {
        await db.stockMovement.create({
          data: {
            productId: product3.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 15,
            referenceNo: "PO-2024-001",
            notes: "Purchase order received",
            movedBy: admin.id,
          },
        })
      }

      if (product9) {
        await db.stockMovement.create({
          data: {
            productId: product9.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 500,
            referenceNo: "PO-2024-002",
            notes: "Purchase order received",
            movedBy: admin.id,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with sample business data. Admin credentials: admin / admin123",
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
