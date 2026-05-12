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
        email: "admin@electro-erp.com",
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
          name: "ElectroMart Bangladesh",
          address: "52 Gulshan Avenue, Dhaka 1212",
          phone: "+880 2-8877665",
          email: "info@electromart.com.bd",
          currency: "BDT",
          financialYear: "2024-2025",
          isActive: true,
        },
      })
    }

    // Seed categories if they don't exist
    const existingCategories = await db.category.count()
    if (existingCategories === 0) {
      // Parent categories - Electronics specific
      const television = await db.category.create({
        data: { name: "Television", description: "Smart TV, LED TV, OLED TV and more", isActive: true },
      })
      const refrigerator = await db.category.create({
        data: { name: "Refrigerator", description: "Single Door, Double Door, Side-by-Side refrigerators", isActive: true },
      })
      const airConditioner = await db.category.create({
        data: { name: "Air Conditioner", description: "Split AC, Window AC, Inverter AC", isActive: true },
      })
      const mobilePhone = await db.category.create({
        data: { name: "Mobile Phone", description: "Smartphones and feature phones", isActive: true },
      })
      const laptopComputer = await db.category.create({
        data: { name: "Laptop & Computer", description: "Laptops, desktops and monitors", isActive: true },
      })
      const homeAppliances = await db.category.create({
        data: { name: "Home Appliances", description: "Microwave, Washing Machine, Water Purifier", isActive: true },
      })
      const accessories = await db.category.create({
        data: { name: "Accessories", description: "Cables, Chargers, Headphones, Power Banks", isActive: true },
      })

      // Sub-categories
      await db.category.createMany({
        data: [
          { name: "Smart TV", description: "Internet-enabled smart televisions", parentId: television.id, isActive: true },
          { name: "LED TV", description: "Standard LED televisions", parentId: television.id, isActive: true },
          { name: "OLED TV", description: "Premium OLED televisions", parentId: television.id, isActive: true },
          { name: "Single Door", description: "Single door refrigerators", parentId: refrigerator.id, isActive: true },
          { name: "Double Door", description: "Double door refrigerators", parentId: refrigerator.id, isActive: true },
          { name: "Side-by-Side", description: "Side-by-side refrigerators", parentId: refrigerator.id, isActive: true },
          { name: "Split AC", description: "Split type air conditioners", parentId: airConditioner.id, isActive: true },
          { name: "Window AC", description: "Window type air conditioners", parentId: airConditioner.id, isActive: true },
          { name: "Inverter AC", description: "Energy-efficient inverter air conditioners", parentId: airConditioner.id, isActive: true },
          { name: "Smartphone", description: "Android and iOS smartphones", parentId: mobilePhone.id, isActive: true },
          { name: "Feature Phone", description: "Basic feature phones", parentId: mobilePhone.id, isActive: true },
          { name: "Laptop", description: "Portable laptop computers", parentId: laptopComputer.id, isActive: true },
          { name: "Desktop", description: "Desktop computers", parentId: laptopComputer.id, isActive: true },
          { name: "Monitor", description: "Computer monitors and displays", parentId: laptopComputer.id, isActive: true },
          { name: "Microwave", description: "Microwave ovens", parentId: homeAppliances.id, isActive: true },
          { name: "Washing Machine", description: "Washing machines", parentId: homeAppliances.id, isActive: true },
          { name: "Water Purifier", description: "Water purification systems", parentId: homeAppliances.id, isActive: true },
          { name: "Cable", description: "HDMI, USB and other cables", parentId: accessories.id, isActive: true },
          { name: "Charger", description: "Device chargers and adapters", parentId: accessories.id, isActive: true },
          { name: "Headphone", description: "Headphones and earbuds", parentId: accessories.id, isActive: true },
          { name: "Power Bank", description: "Portable power banks", parentId: accessories.id, isActive: true },
        ],
      })
    }

    // Seed warehouses if they don't exist
    const existingWarehouses = await db.warehouse.count()
    let mainWarehouseId = ""
    let secondaryWarehouseId = ""
    if (existingWarehouses === 0) {
      const mainWarehouse = await db.warehouse.create({
        data: {
          name: "Main Warehouse - Dhaka",
          code: "WH-DHK-001",
          address: "Industrial Area, Tejgaon, Dhaka",
          phone: "+880 2-8877660",
          managerName: "Rahim Uddin",
          isActive: true,
        },
      })
      mainWarehouseId = mainWarehouse.id

      const secondaryWarehouse = await db.warehouse.create({
        data: {
          name: "Chittagong Distribution Center",
          code: "WH-CTG-001",
          address: "CDA Avenue, Chittagong Port Area",
          phone: "+880 31-2557700",
          managerName: "Karim Hossain",
          isActive: true,
        },
      })
      secondaryWarehouseId = secondaryWarehouse.id

      await db.warehouse.create({
        data: {
          name: "Savar Electronics Hub",
          code: "WH-SVR-001",
          address: "EPZ Road, Savar, Dhaka",
          phone: "+880 2-7788990",
          managerName: "Fatima Begum",
          isActive: true,
        },
      })
    } else {
      const mainWarehouse = await db.warehouse.findFirst()
      mainWarehouseId = mainWarehouse?.id || ""
      const secondWarehouse = await db.warehouse.findMany()
      secondaryWarehouseId = secondWarehouse[1]?.id || mainWarehouseId
    }

    // Seed products if they don't exist
    const existingProducts = await db.product.count()
    if (existingProducts === 0) {
      // Get category IDs
      const categories = await db.category.findMany()
      const televisionCategory = categories.find(c => c.name === "Television")
      const refrigeratorCategory = categories.find(c => c.name === "Refrigerator")
      const airConditionerCategory = categories.find(c => c.name === "Air Conditioner")
      const mobilePhoneCategory = categories.find(c => c.name === "Mobile Phone")
      const laptopComputerCategory = categories.find(c => c.name === "Laptop & Computer")
      const homeAppliancesCategory = categories.find(c => c.name === "Home Appliances")
      const accessoriesCategory = categories.find(c => c.name === "Accessories")

      await db.product.createMany({
        data: [
          // Television
          { sku: "TV-001", name: "Samsung 55\" Crystal 4K Smart TV", description: "55 inch Crystal 4K UHD Smart TV, Tizen OS, HDR10+", categoryId: televisionCategory?.id || null, unit: "pcs", costPrice: 62000, sellPrice: 75000, minStock: 3, maxStock: 30, currentStock: 12, isActive: true },
          { sku: "TV-002", name: "LG 43\" Smart TV", description: "43 inch Full HD Smart TV, WebOS, AI ThinQ", categoryId: televisionCategory?.id || null, unit: "pcs", costPrice: 43000, sellPrice: 52000, minStock: 5, maxStock: 40, currentStock: 20, isActive: true },
          { sku: "TV-003", name: "Sony 65\" Bravia OLED", description: "65 inch 4K OLED Smart TV, Google TV, XR Processor", categoryId: televisionCategory?.id || null, unit: "pcs", costPrice: 235000, sellPrice: 285000, minStock: 2, maxStock: 10, currentStock: 4, isActive: true },
          { sku: "TV-004", name: "Walton 32\" LED TV", description: "32 inch HD Ready LED TV, Android TV", categoryId: televisionCategory?.id || null, unit: "pcs", costPrice: 14000, sellPrice: 18500, minStock: 10, maxStock: 80, currentStock: 35, isActive: true },

          // Refrigerator
          { sku: "REF-001", name: "Samsung 258L Double Door Refrigerator", description: "258L, Digital Inverter, Frost Free, RT28K3022S8", categoryId: refrigeratorCategory?.id || null, unit: "pcs", costPrice: 56000, sellPrice: 68000, minStock: 3, maxStock: 25, currentStock: 10, isActive: true },
          { sku: "REF-002", name: "LG 190L Single Door Refrigerator", description: "190L, Smart Inverter Compressor, GL-D201ASPY", categoryId: refrigeratorCategory?.id || null, unit: "pcs", costPrice: 28000, sellPrice: 35000, minStock: 5, maxStock: 35, currentStock: 15, isActive: true },
          { sku: "REF-003", name: "Walton 365L Side-by-Side Refrigerator", description: "365L, Non-Frost, Digital Control, WSI-365", categoryId: refrigeratorCategory?.id || null, unit: "pcs", costPrice: 68000, sellPrice: 82000, minStock: 2, maxStock: 15, currentStock: 6, isActive: true },

          // Air Conditioner
          { sku: "AC-001", name: "General 1.5 Ton Split AC", description: "1.5 Ton, Split AC, R32 Refrigerant, ASGG18CGTA", categoryId: airConditionerCategory?.id || null, unit: "pcs", costPrice: 58000, sellPrice: 72000, minStock: 5, maxStock: 30, currentStock: 14, isActive: true },
          { sku: "AC-002", name: "Samsung 1 Ton Inverter AC", description: "1 Ton, Inverter Split AC, Digital Inverter, AR10TYHQASINSE", categoryId: airConditionerCategory?.id || null, unit: "pcs", costPrice: 46000, sellPrice: 58000, minStock: 5, maxStock: 30, currentStock: 18, isActive: true },
          { sku: "AC-003", name: "Gree 2 Ton Split AC", description: "2 Ton, Split AC, R410A, GSH-24-XL", categoryId: airConditionerCategory?.id || null, unit: "pcs", costPrice: 70000, sellPrice: 85000, minStock: 3, maxStock: 20, currentStock: 8, isActive: true },

          // Mobile Phone
          { sku: "MOB-001", name: "Samsung Galaxy S24 Ultra", description: "6.8 inch, 256GB, 12GB RAM, S Pen, Titanium Frame", categoryId: mobilePhoneCategory?.id || null, unit: "pcs", costPrice: 135000, sellPrice: 159999, minStock: 5, maxStock: 40, currentStock: 18, isActive: true },
          { sku: "MOB-002", name: "iPhone 15 Pro Max", description: "6.7 inch, 256GB, A17 Pro Chip, Titanium", categoryId: mobilePhoneCategory?.id || null, unit: "pcs", costPrice: 162000, sellPrice: 189999, minStock: 3, maxStock: 25, currentStock: 10, isActive: true },
          { sku: "MOB-003", name: "Xiaomi Redmi Note 13 Pro", description: "6.67 inch, 128GB, 8GB RAM, 200MP Camera", categoryId: mobilePhoneCategory?.id || null, unit: "pcs", costPrice: 26000, sellPrice: 32999, minStock: 10, maxStock: 80, currentStock: 42, isActive: true },
          { sku: "MOB-004", name: "Walton Primo R9", description: "6.5 inch, 64GB, 4GB RAM, Made in Bangladesh", categoryId: mobilePhoneCategory?.id || null, unit: "pcs", costPrice: 9500, sellPrice: 12999, minStock: 15, maxStock: 100, currentStock: 55, isActive: true },

          // Laptop & Computer
          { sku: "LAP-001", name: "HP EliteBook 840 G10", description: "14 inch, i7-1355U, 16GB RAM, 512GB SSD", categoryId: laptopComputerCategory?.id || null, unit: "pcs", costPrice: 78000, sellPrice: 95000, minStock: 3, maxStock: 25, currentStock: 9, isActive: true },
          { sku: "LAP-002", name: "Dell Latitude 5540", description: "15.6 inch, i7-1355U, 16GB RAM, 512GB SSD", categoryId: laptopComputerCategory?.id || null, unit: "pcs", costPrice: 72000, sellPrice: 88000, minStock: 3, maxStock: 25, currentStock: 11, isActive: true },
          { sku: "LAP-003", name: "ASUS VivoBook 15", description: "15.6 inch, i5-1235U, 8GB RAM, 512GB SSD", categoryId: laptopComputerCategory?.id || null, unit: "pcs", costPrice: 42000, sellPrice: 55000, minStock: 5, maxStock: 35, currentStock: 22, isActive: true },
          { sku: "LAP-004", name: "Samsung 27\" Monitor", description: "27 inch, 4K UHD, IPS Panel, LS27A600U", categoryId: laptopComputerCategory?.id || null, unit: "pcs", costPrice: 22000, sellPrice: 28000, minStock: 5, maxStock: 40, currentStock: 16, isActive: true },

          // Home Appliances
          { sku: "APP-001", name: "LG Microwave Oven 20L", description: "20L, 700W, Auto Cook Menu, MS2043DB", categoryId: homeAppliancesCategory?.id || null, unit: "pcs", costPrice: 9500, sellPrice: 12500, minStock: 8, maxStock: 50, currentStock: 28, isActive: true },
          { sku: "APP-002", name: "Walton Washing Machine 7kg", description: "7kg, Fully Automatic, Top Load, WWM-70S", categoryId: homeAppliancesCategory?.id || null, unit: "pcs", costPrice: 17000, sellPrice: 22000, minStock: 5, maxStock: 30, currentStock: 12, isActive: true },

          // Accessories
          { sku: "ACC-001", name: "USB-C Fast Charger 65W", description: "65W GaN Fast Charger, USB-C PD, Universal", categoryId: accessoriesCategory?.id || null, unit: "pcs", costPrice: 1800, sellPrice: 2500, minStock: 20, maxStock: 200, currentStock: 95, isActive: true },
          { sku: "ACC-002", name: "Anker Power Bank 20000mAh", description: "20000mAh, 22.5W, PowerCore Select", categoryId: accessoriesCategory?.id || null, unit: "pcs", costPrice: 3200, sellPrice: 4500, minStock: 15, maxStock: 120, currentStock: 60, isActive: true },
          { sku: "ACC-003", name: "Samsung Galaxy Buds FE", description: "Active Noise Cancellation, 30hr Battery, IPX2", categoryId: accessoriesCategory?.id || null, unit: "pcs", costPrice: 5500, sellPrice: 7999, minStock: 10, maxStock: 80, currentStock: 35, isActive: true },
          { sku: "ACC-004", name: "HDMI Cable 2m", description: "HDMI 2.1, 4K@60Hz, 2 meter, Braided", categoryId: accessoriesCategory?.id || null, unit: "pcs", costPrice: 380, sellPrice: 650, minStock: 30, maxStock: 300, currentStock: 180, isActive: true },
        ],
      })
    }

    // Seed customers if they don't exist
    const existingCustomers = await db.customer.count()
    if (existingCustomers === 0) {
      await db.customer.createMany({
        data: [
          { code: "CUST-001", name: "Rahim Electronics", email: "info@rahim-electronics.com", phone: "+880 171234567", address: "456 Motijheel Commercial Area", city: "Dhaka", country: "Bangladesh", creditLimit: 5000000, balance: 0, isActive: true },
          { code: "CUST-002", name: "Karim Digital Store", email: "karim@digitalstore.com", phone: "+880 181234567", address: "789 Agrabad CDA Avenue", city: "Chittagong", country: "Bangladesh", creditLimit: 3000000, balance: 250000, isActive: true },
          { code: "CUST-003", name: "Fatima Home Appliances", email: "fatima@appliances.com", phone: "+880 191234567", address: "12 Rajshahi Road", city: "Rajshahi", country: "Bangladesh", creditLimit: 2000000, balance: 0, isActive: true },
          { code: "CUST-004", name: "Global IT Solutions Ltd", email: "contact@globalit.com", phone: "+880 161234567", address: "34 Gulshan Avenue", city: "Dhaka", country: "Bangladesh", creditLimit: 10000000, balance: 1500000, isActive: true },
          { code: "CUST-005", name: "Nabil Corporation", email: "info@nabilcorp.com", phone: "+880 151234567", address: "56 Uttara Sector 7", city: "Dhaka", country: "Bangladesh", creditLimit: 7500000, balance: 0, isActive: true },
        ],
      })
    }

    // Seed suppliers if they don't exist
    const existingSuppliers = await db.supplier.count()
    if (existingSuppliers === 0) {
      await db.supplier.createMany({
        data: [
          { code: "SUP-001", name: "Samsung Bangladesh Distributor", email: "orders@samsung-bd.com", phone: "+880 211234567", address: "123 Elephant Road", city: "Dhaka", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-002", name: "LG Electronics BD", email: "supply@lge-bd.com", phone: "+880 221234567", address: "45 Nawabpur Road", city: "Dhaka", country: "Bangladesh", balance: 500000, isActive: true },
          { code: "SUP-003", name: "Walton Distributions", email: "dist@walton.com", phone: "+880 231234567", address: "78 Walton House, Gulshan", city: "Dhaka", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-004", name: "Apple Authorized Reseller BD", email: "orders@apple-bd.com", phone: "+880 241234567", address: "90 Dhanmondi", city: "Dhaka", country: "Bangladesh", balance: 0, isActive: true },
          { code: "SUP-005", name: "Gree AC Bangladesh", email: "sales@gree-bd.com", phone: "+880 251234567", address: "34 Tongi Industrial Area", city: "Gazipur", country: "Bangladesh", balance: 200000, isActive: true },
        ],
      })
    }

    // Seed sample purchase orders if they don't exist
    const existingPurchaseOrders = await db.purchaseOrder.count()
    if (existingPurchaseOrders === 0) {
      const supplier1 = await db.supplier.findFirst({ where: { code: "SUP-001" } })
      const supplier2 = await db.supplier.findFirst({ where: { code: "SUP-002" } })
      const supplier3 = await db.supplier.findFirst({ where: { code: "SUP-003" } })
      const supplier4 = await db.supplier.findFirst({ where: { code: "SUP-004" } })

      const tv001 = await db.product.findFirst({ where: { sku: "TV-001" } })
      const tv004 = await db.product.findFirst({ where: { sku: "TV-004" } })
      const mob001 = await db.product.findFirst({ where: { sku: "MOB-001" } })
      const lap001 = await db.product.findFirst({ where: { sku: "LAP-001" } })
      const ref001 = await db.product.findFirst({ where: { sku: "REF-001" } })
      const app001 = await db.product.findFirst({ where: { sku: "APP-001" } })
      const mob002 = await db.product.findFirst({ where: { sku: "MOB-002" } })
      const ac002 = await db.product.findFirst({ where: { sku: "AC-002" } })

      // PO 1 - Samsung bulk order (TVs + Phones + ACs)
      if (supplier1 && tv001 && mob001 && ac002) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-001",
            supplierId: supplier1.id,
            orderDate: new Date("2024-12-01"),
            expectedDate: new Date("2024-12-15"),
            status: "RECEIVED",
            subtotal: 5166000,
            taxAmount: 0,
            totalAmount: 5166000,
            notes: "Q4 Samsung bulk restock - TVs, Phones and Inverter ACs",
            createdBy: admin.id,
            items: {
              create: [
                { productId: tv001.id, quantity: 12, unitPrice: 62000, discount: 0, totalPrice: 744000 },
                { productId: mob001.id, quantity: 20, unitPrice: 135000, discount: 0, totalPrice: 2700000 },
                { productId: ac002.id, quantity: 18, unitPrice: 46000, discount: 0, totalPrice: 828000 },
                { productId: mob001.id, quantity: 20, unitPrice: 135000, discount: 270000, totalPrice: 2430000 },
              ],
            },
          },
        })
      }

      // PO 2 - LG order (Refrigerators + Microwaves)
      if (supplier2 && ref001 && app001) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-002",
            supplierId: supplier2.id,
            orderDate: new Date("2024-12-10"),
            expectedDate: new Date("2024-12-22"),
            status: "RECEIVED",
            subtotal: 1150000,
            taxAmount: 0,
            totalAmount: 1150000,
            notes: "LG Refrigerator and Microwave restock",
            createdBy: admin.id,
            items: {
              create: [
                { productId: ref001.id, quantity: 10, unitPrice: 56000, discount: 0, totalPrice: 560000 },
                { productId: app001.id, quantity: 30, unitPrice: 9500, discount: 0, totalPrice: 285000 },
                { productId: ref001.id, quantity: 5, unitPrice: 56000, discount: 20000, totalPrice: 260000 },
              ],
            },
          },
        })
      }

      // PO 3 - Walton order (TVs)
      if (supplier3 && tv004) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-003",
            supplierId: supplier3.id,
            orderDate: new Date("2025-01-05"),
            expectedDate: new Date("2025-01-18"),
            status: "PENDING",
            subtotal: 490000,
            taxAmount: 0,
            totalAmount: 490000,
            notes: "Walton LED TV restock for January",
            createdBy: admin.id,
            items: {
              create: [
                { productId: tv004.id, quantity: 35, unitPrice: 14000, discount: 0, totalPrice: 490000 },
              ],
            },
          },
        })
      }

      // PO 4 - Apple authorized reseller order
      if (supplier4 && mob002 && lap001) {
        await db.purchaseOrder.create({
          data: {
            orderNo: "PO-2024-004",
            supplierId: supplier4.id,
            orderDate: new Date("2025-01-08"),
            expectedDate: new Date("2025-01-22"),
            status: "APPROVED",
            subtotal: 4230000,
            taxAmount: 0,
            totalAmount: 4230000,
            notes: "iPhone 15 Pro Max and HP laptops for corporate clients",
            createdBy: admin.id,
            items: {
              create: [
                { productId: mob002.id, quantity: 15, unitPrice: 162000, discount: 0, totalPrice: 2430000 },
                { productId: lap001.id, quantity: 10, unitPrice: 78000, discount: 0, totalPrice: 780000 },
                { productId: mob002.id, quantity: 5, unitPrice: 162000, discount: 60000, totalPrice: 750000 },
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
      const customer2 = await db.customer.findFirst({ where: { code: "CUST-002" } })
      const customer4 = await db.customer.findFirst({ where: { code: "CUST-004" } })
      const customer5 = await db.customer.findFirst({ where: { code: "CUST-005" } })

      const tv001 = await db.product.findFirst({ where: { sku: "TV-001" } })
      const mob001 = await db.product.findFirst({ where: { sku: "MOB-001" } })
      const acc001 = await db.product.findFirst({ where: { sku: "ACC-001" } })
      const acc004 = await db.product.findFirst({ where: { sku: "ACC-004" } })
      const lap002 = await db.product.findFirst({ where: { sku: "LAP-002" } })
      const lap004 = await db.product.findFirst({ where: { sku: "LAP-004" } })
      const ac001 = await db.product.findFirst({ where: { sku: "AC-001" } })
      const ref001 = await db.product.findFirst({ where: { sku: "REF-001" } })
      const mob003 = await db.product.findFirst({ where: { sku: "MOB-003" } })
      const acc003 = await db.product.findFirst({ where: { sku: "ACC-003" } })

      // SO 1 - Rahim Electronics bulk order
      if (customer1 && tv001 && mob001 && acc001) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2024-001",
            customerId: customer1.id,
            orderDate: new Date("2024-12-05"),
            deliveryDate: new Date("2024-12-12"),
            status: "DELIVERED",
            subtotal: 3299990,
            taxAmount: 0,
            totalAmount: 3299990,
            notes: "Bulk order for retail store - Samsung TVs, Galaxy phones and chargers",
            createdBy: admin.id,
            items: {
              create: [
                { productId: tv001.id, quantity: 8, unitPrice: 75000, discount: 0, totalPrice: 600000 },
                { productId: mob001.id, quantity: 15, unitPrice: 159999, discount: 0, totalPrice: 2399985 },
                { productId: acc001.id, quantity: 50, unitPrice: 2500, discount: 0, totalPrice: 125000 },
                { productId: mob001.id, quantity: 1, unitPrice: 159999, discount: 159999, totalPrice: 0 },
              ],
            },
          },
        })
      }

      // SO 2 - Karim Digital Store - ACs and Fridges
      if (customer2 && ac001 && ref001) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2024-002",
            customerId: customer2.id,
            orderDate: new Date("2024-12-15"),
            deliveryDate: new Date("2024-12-22"),
            status: "CONFIRMED",
            subtotal: 1428000,
            taxAmount: 0,
            totalAmount: 1428000,
            notes: "Summer season AC and refrigerator stock for Chittagong branch",
            createdBy: admin.id,
            items: {
              create: [
                { productId: ac001.id, quantity: 10, unitPrice: 72000, discount: 0, totalPrice: 720000 },
                { productId: ref001.id, quantity: 8, unitPrice: 68000, discount: 0, totalPrice: 544000 },
                { productId: ac001.id, quantity: 2, unitPrice: 72000, discount: 44000, totalPrice: 100000 },
              ],
            },
          },
        })
      }

      // SO 3 - Global IT Solutions - Corporate laptop order
      if (customer4 && lap002 && lap004 && acc004) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2024-003",
            customerId: customer4.id,
            orderDate: new Date("2024-12-20"),
            deliveryDate: new Date("2025-01-03"),
            status: "SHIPPED",
            subtotal: 2446500,
            taxAmount: 0,
            totalAmount: 2446500,
            notes: "Corporate IT infrastructure upgrade - Dell laptops with Samsung monitors",
            createdBy: admin.id,
            items: {
              create: [
                { productId: lap002.id, quantity: 20, unitPrice: 88000, discount: 0, totalPrice: 1760000 },
                { productId: lap004.id, quantity: 20, unitPrice: 28000, discount: 0, totalPrice: 560000 },
                { productId: acc004.id, quantity: 50, unitPrice: 650, discount: 0, totalPrice: 32500 },
                { productId: lap002.id, quantity: 2, unitPrice: 88000, discount: 176000, totalPrice: 0 },
              ],
            },
          },
        })
      }

      // SO 4 - Nabil Corporation - Xiaomi phones and accessories
      if (customer5 && mob003 && acc003 && acc001) {
        await db.salesOrder.create({
          data: {
            orderNo: "SO-2025-001",
            customerId: customer5.id,
            orderDate: new Date("2025-01-10"),
            deliveryDate: new Date("2025-01-17"),
            status: "PENDING",
            subtotal: 1709985,
            taxAmount: 0,
            totalAmount: 1709985,
            notes: "Xiaomi smartphone batch with Galaxy Buds and chargers",
            createdBy: admin.id,
            items: {
              create: [
                { productId: mob003.id, quantity: 40, unitPrice: 32999, discount: 0, totalPrice: 1319960 },
                { productId: acc003.id, quantity: 30, unitPrice: 7999, discount: 0, totalPrice: 239970 },
                { productId: acc001.id, quantity: 60, unitPrice: 2500, discount: 0, totalPrice: 150000 },
                { productId: mob003.id, quantity: 1, unitPrice: 32999, discount: 32999, totalPrice: 0 },
              ],
            },
          },
        })
      }
    }

    // Seed sample stock movements if none exist and we have a warehouse
    const existingMovements = await db.stockMovement.count()
    if (existingMovements === 0 && mainWarehouseId) {
      const tv001 = await db.product.findFirst({ where: { sku: "TV-001" } })
      const mob001 = await db.product.findFirst({ where: { sku: "MOB-001" } })
      const ac002 = await db.product.findFirst({ where: { sku: "AC-002" } })
      const ref001 = await db.product.findFirst({ where: { sku: "REF-001" } })
      const app001 = await db.product.findFirst({ where: { sku: "APP-001" } })
      const tv004 = await db.product.findFirst({ where: { sku: "TV-004" } })
      const lap001 = await db.product.findFirst({ where: { sku: "LAP-001" } })
      const mob002 = await db.product.findFirst({ where: { sku: "MOB-002" } })

      // Stock IN from PO-2024-001 (Samsung)
      if (tv001) {
        await db.stockMovement.create({
          data: {
            productId: tv001.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 12,
            referenceNo: "PO-2024-001",
            notes: "Samsung 55\" Smart TV received from Samsung BD Distributor",
            movedBy: admin.id,
          },
        })
      }

      if (mob001) {
        await db.stockMovement.create({
          data: {
            productId: mob001.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 40,
            referenceNo: "PO-2024-001",
            notes: "Samsung Galaxy S24 Ultra received from Samsung BD Distributor",
            movedBy: admin.id,
          },
        })
      }

      if (ac002) {
        await db.stockMovement.create({
          data: {
            productId: ac002.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 18,
            referenceNo: "PO-2024-001",
            notes: "Samsung 1 Ton Inverter AC received from Samsung BD Distributor",
            movedBy: admin.id,
          },
        })
      }

      // Stock IN from PO-2024-002 (LG)
      if (ref001) {
        await db.stockMovement.create({
          data: {
            productId: ref001.id,
            warehouseId: secondaryWarehouseId || mainWarehouseId,
            type: "IN",
            quantity: 15,
            referenceNo: "PO-2024-002",
            notes: "Samsung 258L Double Door Refrigerator received from LG Electronics BD",
            movedBy: admin.id,
          },
        })
      }

      if (app001) {
        await db.stockMovement.create({
          data: {
            productId: app001.id,
            warehouseId: secondaryWarehouseId || mainWarehouseId,
            type: "IN",
            quantity: 30,
            referenceNo: "PO-2024-002",
            notes: "LG Microwave Oven 20L received from LG Electronics BD",
            movedBy: admin.id,
          },
        })
      }

      // Stock OUT for SO-2024-001 (Rahim Electronics)
      if (tv001) {
        await db.stockMovement.create({
          data: {
            productId: tv001.id,
            warehouseId: mainWarehouseId,
            type: "OUT",
            quantity: 8,
            referenceNo: "SO-2024-001",
            notes: "Samsung 55\" Smart TV sold to Rahim Electronics",
            movedBy: admin.id,
          },
        })
      }

      if (mob001) {
        await db.stockMovement.create({
          data: {
            productId: mob001.id,
            warehouseId: mainWarehouseId,
            type: "OUT",
            quantity: 16,
            referenceNo: "SO-2024-001",
            notes: "Samsung Galaxy S24 Ultra sold to Rahim Electronics",
            movedBy: admin.id,
          },
        })
      }

      // Stock OUT for SO-2024-003 (Global IT Solutions)
      if (lap001) {
        await db.stockMovement.create({
          data: {
            productId: lap001.id,
            warehouseId: mainWarehouseId,
            type: "OUT",
            quantity: 9,
            referenceNo: "SO-2024-003",
            notes: "HP EliteBook 840 G10 shipped to Global IT Solutions Ltd",
            movedBy: admin.id,
          },
        })
      }

      // Transfer between warehouses
      if (tv004) {
        await db.stockMovement.create({
          data: {
            productId: tv004.id,
            warehouseId: mainWarehouseId,
            type: "TRANSFER",
            quantity: 10,
            referenceNo: "TR-2024-001",
            notes: "Walton 32\" LED TV transferred to Chittagong Distribution Center",
            movedBy: admin.id,
          },
        })
      }

      if (mob002) {
        await db.stockMovement.create({
          data: {
            productId: mob002.id,
            warehouseId: mainWarehouseId,
            type: "IN",
            quantity: 20,
            referenceNo: "PO-2024-004",
            notes: "iPhone 15 Pro Max received from Apple Authorized Reseller BD",
            movedBy: admin.id,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Electronics inventory data. Admin credentials: admin / admin123",
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
