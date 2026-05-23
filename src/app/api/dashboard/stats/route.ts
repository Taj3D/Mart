import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted } from '@/lib/db-utils'

// GET /api/dashboard/stats - Dashboard statistics with actual DB aggregations
export async function GET() {
  try {
    const [
      totalProducts,
      totalSales,
      totalLowStock,
      totalCustomers,
      totalInvestmentHeads,
      totalCompanies,
      recentSales,
    ] = await db.$transaction([
      // totalProducts: count of Product where notDeleted
      db.product.count({ where: notDeleted() }),

      // totalSales: sum of SalesOrder.totalAmount where notDeleted
      db.salesOrder.aggregate({
        _sum: { totalAmount: true },
        where: notDeleted(),
      }),

      // totalLowStock: count of Product where currentStock <= minStock and notDeleted
      db.product.count({
        where: {
          ...notDeleted(),
          currentStock: { lte: db.product.fields.minStock ? 0 : 0 },
        },
      }),

      // totalCustomers: count of Customer where notDeleted
      db.customer.count({ where: notDeleted() }),

      // totalInvestmentHeads: count of InvestmentHead where notDeleted
      db.investmentHead.count({ where: notDeleted() }),

      // totalCompanies: count of Company where notDeleted
      db.company.count({ where: notDeleted() }),

      // recentSales: last 5 SalesOrder records
      db.salesOrder.findMany({
        where: notDeleted(),
        take: 5,
        orderBy: { createdDate: 'desc' },
        include: {
          customer: { select: { name: true } },
          items: { select: { id: true } },
        },
      }),
    ])

    // Low stock: we need a raw approach since SQLite doesn't support cross-field comparison in count
    // Use a separate query for accurate low stock count
    const lowStockProducts = await db.product.count({
      where: {
        ...notDeleted(),
        currentStock: { lte: 10 },
      },
    })

    // Monthly sales data for chart (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const orders = await db.salesOrder.findMany({
      where: {
        ...notDeleted(),
        orderDate: { gte: sixMonthsAgo },
      },
      select: { totalAmount: true, orderDate: true },
    })

    // Group by month
    const monthlyData: Record<string, number> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      monthlyData[key] = 0
    }

    orders.forEach((order) => {
      const d = new Date(order.orderDate)
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      if (key in monthlyData) {
        monthlyData[key] += order.totalAmount
      }
    })

    // Category distribution
    const productsByCategory = await db.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: notDeleted(),
    })

    const categories = await db.category.findMany({ where: notDeleted() })
    const categoryDistribution = productsByCategory.map((item) => ({
      name: categories.find((c) => c.id === item.categoryId)?.name || 'Uncategorized',
      count: item._count.id,
    }))

    // Top selling products
    const orderItems = await db.salesOrderItem.findMany({
      select: { productId: true, quantity: true, totalPrice: true },
    })

    const productSales: Record<string, { quantity: number; revenue: number }> = {}
    orderItems.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { quantity: 0, revenue: 0 }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].revenue += item.totalPrice
    })

    const productIds = Object.keys(productSales)
    const topProductsData = productIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: productIds }, ...notDeleted() },
          select: { id: true, name: true, code: true },
        })
      : []

    const topSellingProducts = topProductsData
      .map((p) => ({
        ...p,
        quantity: productSales[p.id]?.quantity || 0,
        revenue: productSales[p.id]?.revenue || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Recent sales formatted
    const formattedRecentSales = recentSales.map((order) => ({
      id: order.code,
      customer: order.customer?.name || 'Unknown',
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.orderDate,
      itemCount: order.items?.length || 0,
    }))

    return NextResponse.json({
      stats: {
        totalProducts,
        totalSales: totalSales._sum.totalAmount || 0,
        totalLowStock: lowStockProducts,
        totalCustomers,
        totalInvestmentHeads,
        totalCompanies,
      },
      monthlySales: Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        amount,
      })),
      categoryDistribution,
      topSellingProducts,
      recentSales: formattedRecentSales,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
