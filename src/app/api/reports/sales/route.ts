import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: Record<string, unknown> = {}
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
    }

    const where: Record<string, unknown> = { status: { not: 'CANCELLED' } }
    if (Object.keys(dateFilter).length > 0) {
      where.orderDate = dateFilter
    }

    const sales = await db.salesOrder.findMany({ where, orderBy: { orderDate: 'asc' } })

    const salesByDate: Record<string, number> = {}
    sales.forEach(s => {
      const dateKey = new Date(s.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      salesByDate[dateKey] = (salesByDate[dateKey] || 0) + s.totalAmount
    })

    const saleItems = await db.salesOrderItem.findMany({
      where: { salesOrder: { status: { not: 'CANCELLED' } } },
      include: { product: { select: { name: true, sku: true } } },
    })

    const productRevenue: Record<string, { name: string; sku: string; revenue: number; quantity: number }> = {}
    saleItems.forEach(item => {
      const key = item.productId
      if (!productRevenue[key]) {
        productRevenue[key] = { name: item.product?.name || 'Unknown', sku: item.product?.sku || '', revenue: 0, quantity: 0 }
      }
      productRevenue[key].revenue += item.totalPrice
      productRevenue[key].quantity += item.quantity
    })

    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const revenueTrend = Object.entries(salesByDate).map(([date, revenue]) => ({
      date,
      revenue: parseFloat(revenue.toFixed(2)),
    }))

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalOrders = sales.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      },
      salesByDate: revenueTrend,
      topProducts,
      period: { startDate, endDate },
    })
  } catch (error) {
    console.error('Sales report API error:', error)
    return NextResponse.json({ error: 'Failed to generate sales report' }, { status: 500 })
  }
}
