import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get counts
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalPurchases,
      lowStockProducts,
      pendingOrders,
      recentOrders,
      totalRevenue,
      totalExpenses,
      categoryCount,
      brandCount,
      supplierCount,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.customer.count({ where: { isActive: true } }),
      db.order.count(),
      db.purchase.count(),
      db.product.count({
        where: { currentStock: { lte: 10 }, isActive: true },
      }),
      db.order.count({
        where: { status: { in: ['Pending', 'Confirmed'] } },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: true },
      }),
      db.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'Cancelled' } } }),
      db.purchase.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'Cancelled' } } }),
      db.category.count({ where: { isActive: true } }),
      db.brand.count({ where: { isActive: true } }),
      db.supplier.count({ where: { isActive: true } }),
    ])

    // Monthly sales data for chart (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: 'Cancelled' },
      },
      select: { totalAmount: true, createdAt: true },
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
      const d = new Date(order.createdAt)
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
      if (key in monthlyData) {
        monthlyData[key] += order.totalAmount
      }
    })

    // Category distribution
    const productsByCategory = await db.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { isActive: true },
    })

    const categories = await db.category.findMany()
    const categoryDistribution = productsByCategory.map((item) => ({
      name: categories.find((c) => c.id === item.categoryId)?.name || 'Uncategorized',
      count: item._count.id,
    }))

    // Top selling products
    const orderItems = await db.orderItem.findMany({
      select: { productId: true, quantity: true, totalAmount: true },
    })

    const productSales: Record<string, { quantity: number; revenue: number }> = {}
    orderItems.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { quantity: 0, revenue: 0 }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].revenue += item.totalAmount
    })

    const productIds = Object.keys(productSales)
    const topProductsData = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    })

    const topSellingProducts = topProductsData
      .map((p) => ({
        ...p,
        quantity: productSales[p.id]?.quantity || 0,
        revenue: productSales[p.id]?.revenue || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Recent orders formatted
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.customer.name,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.createdAt,
      itemCount: order.items.length,
    }))

    return NextResponse.json({
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalPurchases,
        lowStockProducts,
        pendingOrders,
        categoryCount,
        brandCount,
        supplierCount,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalExpenses: totalExpenses._sum.totalAmount || 0,
      },
      monthlySales: Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        amount,
      })),
      categoryDistribution,
      topSellingProducts,
      recentOrders: formattedRecentOrders,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
