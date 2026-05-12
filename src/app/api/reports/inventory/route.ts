import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { currentStock: 'asc' },
    })

    const totalItems = products.length
    const inStock = products.filter(p => p.currentStock > p.minStock).length
    const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length
    const outOfStock = products.filter(p => p.currentStock === 0).length

    const categoryStock: Record<string, { name: string; stock: number; value: number }> = {}
    products.forEach(p => {
      const cat = p.category?.name || 'Uncategorized'
      if (!categoryStock[cat]) {
        categoryStock[cat] = { name: cat, stock: 0, value: 0 }
      }
      categoryStock[cat].stock += p.currentStock
      categoryStock[cat].value += p.currentStock * p.sellPrice
    })

    const inventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0)

    return NextResponse.json({
      summary: {
        totalItems,
        inStock,
        lowStock,
        outOfStock,
        inventoryValue: parseFloat(inventoryValue.toFixed(2)),
      },
      stockByCategory: Object.values(categoryStock),
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || 'Uncategorized',
        currentStock: p.currentStock,
        minStock: p.minStock,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        stockValue: parseFloat((p.currentStock * p.costPrice).toFixed(2)),
        status: p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.minStock ? 'Low Stock' : 'In Stock',
      })),
    })
  } catch (error) {
    console.error('Inventory report API error:', error)
    return NextResponse.json({ error: 'Failed to generate inventory report' }, { status: 500 })
  }
}
