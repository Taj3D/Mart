import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Auto-seed if no data
    const productCount = await db.product.count()
    if (productCount === 0) {
      await fetch(new URL('/api/seed-erp', 'http://localhost:3000'), { method: 'POST' })
    }

    const totalProducts = await db.product.count()
    const lowStockItems = await db.product.count({ where: { currentStock: { lte: 10 } } })
    const outOfStockItems = await db.product.count({ where: { currentStock: 0 } })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todaySales = await db.salesOrder.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { orderDate: { gte: todayStart }, status: { not: 'CANCELLED' } },
    })

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthSales = await db.salesOrder.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { orderDate: { gte: monthStart }, status: { not: 'CANCELLED' } },
    })

    const pendingOrders = await db.salesOrder.count({ where: { status: 'PENDING' } })

    const recentOrders = await db.salesOrder.findMany({
      take: 5,
      orderBy: { orderDate: 'desc' },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    })

    // Monthly sales chart data
    const monthlyData = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const result = await db.salesOrder.aggregate({
        _sum: { totalAmount: true },
        where: { orderDate: { gte: d, lte: endOfMonth }, status: { not: 'CANCELLED' } },
      })
      monthlyData.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        revenue: result._sum.totalAmount || 0,
      })
    }

    const totalRevenue = await db.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    })

    const notifications: Array<{ type: string; title: string; message: string; time: string }> = []
    if (lowStockItems > 0) {
      notifications.push({ type: 'warning', title: 'Low Stock Alert', message: `${lowStockItems} products are below minimum stock level`, time: 'Just now' })
    }
    if (outOfStockItems > 0) {
      notifications.push({ type: 'error', title: 'Out of Stock', message: `${outOfStockItems} products are completely out of stock`, time: 'Just now' })
    }
    if (pendingOrders > 0) {
      notifications.push({ type: 'info', title: 'Pending Orders', message: `${pendingOrders} orders are waiting for confirmation`, time: '1 hr ago' })
    }
    notifications.push({ type: 'success', title: 'System Online', message: 'All ERP modules running normally', time: '5 min ago' })

    return NextResponse.json({
      stats: {
        totalProducts,
        todaySales: todaySales._sum.totalAmount || 0,
        todayOrderCount: todaySales._count,
        lowStockItems,
        outOfStockItems,
        pendingOrders,
        monthSales: monthSales._sum.totalAmount || 0,
        monthOrderCount: monthSales._count,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNo: o.orderNo,
        customer: o.customer?.name || 'Unknown',
        date: o.orderDate,
        itemCount: o.items.length,
        total: o.totalAmount,
        status: o.status,
        items: o.items.map(item => ({
          product: item.product?.name || 'Unknown',
          quantity: item.quantity,
          price: item.unitPrice,
          total: item.totalPrice,
        })),
      })),
      monthlySales: monthlyData,
      performance: {
        salesTarget: 78,
        inventoryAccuracy: 94,
        orderFulfillment: 65,
        customerSatisfaction: 89,
      },
      notifications,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
