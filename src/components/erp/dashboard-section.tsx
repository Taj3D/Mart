'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Plus,
  FileText,
  BarChart3,
  Users,
  Warehouse,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineHeader } from '@/components/ui/inline-header'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

export interface DashboardSectionProps {
  onNavigate?: (section: string) => void
}

interface DashboardStats {
  totalProducts: number
  todaySales: number
  todayOrderCount: number
  lowStockItems: number
  outOfStockItems: number
  pendingOrders: number
  monthSales: number
  monthOrderCount: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  orderNo: string
  customer: string
  date: string
  itemCount: number
  total: number
  status: string
  items: Array<{ product: string; quantity: number; price: number; total: number }>
}

interface MonthlySales {
  month: string
  year: number
  revenue: number
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  monthlySales: MonthlySales[]
  performance: {
    salesTarget: number
    inventoryAccuracy: number
    orderFulfillment: number
    customerSatisfaction: number
  }
  notifications: Array<{ type: string; title: string; message: string; time: string }>
}

interface Product {
  id: string
  sku: string
  name: string
  category: string
  categoryId: string
  currentStock: number
  minStock: number
  maxStock: number
  costPrice: number
  sellPrice: number
  status: string
}

// ================================================================
// HOOK
// ================================================================

function useApiData<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ================================================================
// HELPERS
// ================================================================

function formatBDT(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  return `৳ ${formatted}`
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    SHIPPED: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return (
    <Badge className={`${map[status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] px-2 py-0.5`}>
      {status}
    </Badge>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ================================================================
// CHART COLORS
// ================================================================

const PIE_COLORS = [
  '#1e3a5f', // navy
  '#047857', // emerald
  '#d97706', // amber
  '#e11d48', // rose
  '#06b6d4', // cyan
  '#7c3aed', // purple
  '#ea580c', // orange
]

const AREA_FILL = '#1e3a5f'
const AREA_STROKE = '#0f2744'

// ================================================================
// STAT CARD
// ================================================================

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    navy: { bg: 'from-navy-700 to-navy-800 dark:from-navy-800 dark:to-navy-900', iconBg: 'bg-white/20' },
    emerald: { bg: 'from-emerald-700 to-emerald-800 dark:from-emerald-800 dark:to-emerald-900', iconBg: 'bg-white/20' },
    amber: { bg: 'from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800', iconBg: 'bg-white/20' },
    rose: { bg: 'from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800', iconBg: 'bg-white/20' },
  }
  const colors = colorMap[color] || colorMap.navy

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/80 truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-300 shrink-0" />
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {change}
              </span>
              <span className="text-xs text-white/60">vs yesterday</span>
            </div>
          </div>
          <div className={`${colors.iconBg} p-3 rounded-xl shrink-0 ml-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// ================================================================
// QUICK ACTION BUTTON
// ================================================================

function QuickActionButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType
  label: string
  color: string
  onClick: () => void
}) {
  const colorMap: Record<string, { bg: string; hover: string }> = {
    navy: { bg: 'bg-navy-600 dark:bg-navy-700', hover: 'hover:brightness-110' },
    emerald: { bg: 'bg-emerald-600 dark:bg-emerald-700', hover: 'hover:brightness-110' },
    amber: { bg: 'bg-amber-500 dark:bg-amber-600', hover: 'hover:brightness-110' },
    rose: { bg: 'bg-rose-500 dark:bg-rose-600', hover: 'hover:brightness-110' },
    cyan: { bg: 'bg-cyan-600 dark:bg-cyan-700', hover: 'hover:brightness-110' },
    purple: { bg: 'bg-purple-600 dark:bg-purple-700', hover: 'hover:brightness-110' },
  }
  const c = colorMap[color] || colorMap.navy

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white ${c.bg} ${c.hover} transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer w-full min-h-[90px]`}
    >
      <Icon className="h-6 w-6 opacity-90" />
      <span className="text-xs font-semibold leading-tight text-center">{label}</span>
    </button>
  )
}

// ================================================================
// CUSTOM RECHARTS TOOLTIP
// ================================================================

function SalesChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-900 border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-navy-700 dark:text-navy-300">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
        {formatBDT(payload[0].value)}
      </p>
    </div>
  )
}

function PieChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-900 border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-navy-700 dark:text-navy-300">{payload[0].name}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
        {payload[0].value} products
      </p>
    </div>
  )
}

// ================================================================
// CUSTOM PIE CHART LEGEND
// ================================================================

function CustomPieLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload?.length) return null
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground truncate max-w-[100px]">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useApiData<DashboardData>('/api/dashboard')

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useApiData<Product[]>('/api/products')

  // Combined error + loading
  const loading = dashboardLoading || productsLoading
  const error = dashboardError || productsError

  const refetchAll = () => {
    refetchDashboard()
    refetchProducts()
    toast.success('Dashboard data refreshed')
  }

  // Derived data
  const stats = dashboardData?.stats
  const recentOrders = dashboardData?.recentOrders || []
  const monthlySales = dashboardData?.monthlySales || []

  // Low stock products
  const lowStockProducts = React.useMemo(() => {
    if (!productsData) return []
    return productsData
      .filter(p => p.currentStock <= p.minStock)
      .sort((a, b) => {
        // Sort by deficit (most deficit first)
        const deficitA = a.minStock - a.currentStock
        const deficitB = b.minStock - b.currentStock
        return deficitB - deficitA
      })
      .slice(0, 10)
  }, [productsData])

  // Category distribution for pie chart
  const categoryDistribution = React.useMemo(() => {
    if (!productsData) return []
    const categoryMap: Record<string, number> = {}
    for (const p of productsData) {
      const cat = p.category || 'Uncategorized'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    }
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [productsData])

  // Handle quick action navigation
  const handleQuickAction = (section: string, action: string) => {
    if (onNavigate) {
      onNavigate(section)
      toast.info(`Navigating to ${action}...`)
    } else {
      toast.info(`${action} — navigation not available in preview`)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load dashboard data</p>
        <p className="text-xs text-muted-foreground/70 mb-4">{error}</p>
        <Button variant="outline" onClick={refetchAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* Section Header */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Dashboard Overview</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time electronics inventory metrics and KPIs
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchAll}
          className="text-navy-600 dark:text-navy-300"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* ============================================================ */}
      {/* 1. Stats Cards Row */}
      {/* ============================================================ */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={String(stats?.totalProducts || 0)}
            change="+12.5%"
            trend="up"
            icon={Package}
            color="navy"
          />
          <StatCard
            title="Today's Sales"
            value={formatBDT(stats?.todaySales || 0)}
            change="+8.2%"
            trend="up"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Low Stock Items"
            value={String(stats?.lowStockItems || 0)}
            change="+3"
            trend="down"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Pending Orders"
            value={String(stats?.pendingOrders || 0)}
            change="-5.1%"
            trend="up"
            icon={Clock}
            color="rose"
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Monthly Sales Chart + 3. Recent Sales Orders Table */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Sales</CardTitle>
            <CardDescription>Revenue trend over the last 12 months (BDT)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlySales}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={AREA_FILL} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={AREA_FILL} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <RechartsTooltip content={<SalesChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={AREA_STROKE}
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: AREA_STROKE, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales Orders Table */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Sales Orders</CardTitle>
                <CardDescription>Latest 5 sales transactions</CardDescription>
              </div>
              <Badge variant="info" className="text-[10px]">
                {recentOrders.length} orders
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Order
                      </th>
                      <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Customer
                      </th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Items
                      </th>
                      <th className="text-right px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Total
                      </th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="text-right px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors cursor-pointer"
                        onClick={() =>
                          toast.info(`Order ${order.orderNo} — detail view coming soon`)
                        }
                      >
                        <td className="px-2 py-2.5 font-medium text-navy-700 dark:text-navy-300">
                          {order.orderNo}
                        </td>
                        <td className="px-2 py-2.5 text-muted-foreground truncate max-w-[120px]">
                          {order.customer}
                        </td>
                        <td className="px-2 py-2.5 text-center text-muted-foreground">
                          {order.itemCount}
                        </td>
                        <td className="px-2 py-2.5 text-right font-medium">
                          {formatBDT(order.total)}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-2 py-2.5 text-right text-muted-foreground text-xs">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* 4. Low Stock Alerts + 5. Quick Actions */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock Alerts Panel */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Products at or below minimum stock level</CardDescription>
              </div>
              {lowStockProducts.length > 0 && (
                <Badge variant="warning" className="text-[10px]">
                  {lowStockProducts.length} items
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  All products are well-stocked
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No items below minimum stock level
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {lowStockProducts.map(product => {
                  const deficit = product.minStock - product.currentStock
                  const isOutOfStock = product.currentStock === 0
                  const isCritical = deficit > product.minStock * 0.5

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isOutOfStock
                          ? 'bg-rose-50 dark:bg-rose-900/15 border-rose-200 dark:border-rose-800/40'
                          : isCritical
                            ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/40'
                            : 'bg-background border-border'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          {isOutOfStock && (
                            <Badge className="bg-rose-500 text-white border-0 text-[9px] px-1.5 py-0">
                              OUT
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stock / Min</p>
                          <p className="text-sm font-mono font-semibold">
                            <span
                              className={
                                isOutOfStock
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isCritical
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-foreground'
                              }
                            >
                              {product.currentStock}
                            </span>
                            <span className="text-muted-foreground"> / {product.minStock}</span>
                          </p>
                        </div>
                        <div className="text-right min-w-[48px]">
                          <p className="text-xs text-muted-foreground">Deficit</p>
                          <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                            -{deficit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common ERP operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickActionButton
                icon={ShoppingCart}
                label="New Sale"
                color="navy"
                onClick={() => handleQuickAction('sales', 'New Sale')}
              />
              <QuickActionButton
                icon={Plus}
                label="Add Product"
                color="emerald"
                onClick={() => handleQuickAction('products', 'Add Product')}
              />
              <QuickActionButton
                icon={FileText}
                label="Create Invoice"
                color="amber"
                onClick={() => handleQuickAction('sales', 'Create Invoice')}
              />
              <QuickActionButton
                icon={Warehouse}
                label="Stock Adjustment"
                color="rose"
                onClick={() => handleQuickAction('inventory', 'Stock Adjustment')}
              />
              <QuickActionButton
                icon={BarChart3}
                label="View Reports"
                color="cyan"
                onClick={() => handleQuickAction('reports', 'View Reports')}
              />
              <QuickActionButton
                icon={Users}
                label="Manage Suppliers"
                color="purple"
                onClick={() => handleQuickAction('purchase', 'Manage Suppliers')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* 6. Category-wise Stock Distribution (Pie/Donut Chart) */}
      {/* ============================================================ */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Category-wise Stock Distribution</CardTitle>
          <CardDescription>Product count breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center">
              <Skeleton className="h-[320px] w-full max-w-[500px] rounded-lg" />
            </div>
          ) : categoryDistribution.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No product data available
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieChartTooltip />} />
                  <Legend content={<CustomPieLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
