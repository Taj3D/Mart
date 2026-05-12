'use client'

import * as React from 'react'
import {
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Users,
  Download,
  Printer,
  ShoppingCart,
  CheckCircle,
  Info,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineHeader } from '@/components/ui/inline-header'
import { QuickLinkCard } from '@/components/ui/quick-link-card'
import { IMSChart } from '@/lib/chart-utils'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    CONFIRMED: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    SHIPPED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return (
    <Badge className={`${map[status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] px-2 py-0.5`}>
      {status}
    </Badge>
  )
}

// ================================================================
// STAT CARD
// ================================================================

function StatCard({ title, value, change, trend, icon: Icon, color }: {
  title: string; value: string; change: string; trend: 'up' | 'down'; icon: React.ElementType; color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    navy: { bg: 'from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800', iconBg: 'bg-white/20' },
    emerald: { bg: 'from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800', iconBg: 'bg-white/20' },
    amber: { bg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700', iconBg: 'bg-white/20' },
    rose: { bg: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700', iconBg: 'bg-white/20' },
  }
  const colors = colorMap[color] || colorMap.navy

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-300" />}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>{change}</span>
              <span className="text-xs text-white/60">vs last month</span>
            </div>
          </div>
          <div className={`${colors.iconBg} p-3 rounded-xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function DashboardSection() {
  const { data, loading, error, refetch } = useApiData<DashboardData>('/api/dashboard')

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load dashboard data</p>
        <Button variant="outline" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  const stats = data?.stats
  const recentOrders = data?.recentOrders || []
  const monthlySales = data?.monthlySales || []
  const performance = data?.performance || { salesTarget: 0, inventoryAccuracy: 0, orderFulfillment: 0, customerSatisfaction: 0 }
  const notifications = data?.notifications || []

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Dashboard Overview</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Real-time business metrics and KPIs</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Dashboard refreshed') }} className="text-navy-600 dark:text-navy-300">
          <RefreshCw className="h-4 w-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Products" value={String(stats?.totalProducts || 0)} change="+12.5%" trend="up" icon={Package} color="navy" />
          <StatCard title="Sales Today" value={formatCurrency(stats?.todaySales || 0)} change="+8.2%" trend="up" icon={DollarSign} color="emerald" />
          <StatCard title="Low Stock Items" value={String(stats?.lowStockItems || 0)} change="+3" trend="down" icon={AlertTriangle} color="amber" />
          <StatCard title="Pending Orders" value={String(stats?.pendingOrders || 0)} change="-5.1%" trend="up" icon={Clock} color="rose" />
        </div>
      )}

      {/* Monthly Sales Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Sales</CardTitle>
            <CardDescription>Revenue trend over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : (
              <IMSChart
                type="area2d"
                data={{
                  chartType: 'single',
                  data: monthlySales.map(m => ({ label: m.month, value: m.revenue })),
                }}
                caption=""
                xAxisName="Month"
                yAxisName="Revenue ($)"
                height={300}
                numberPrefix="$"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest 5 sales orders</CardDescription>
              </div>
              <Badge variant="info" className="text-[10px]">{recentOrders.length} orders</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">Order</th>
                      <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                      <th className="text-right px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                        <td className="px-2 py-2.5 font-medium text-navy-700 dark:text-navy-300">{order.orderNo}</td>
                        <td className="px-2 py-2.5 text-muted-foreground">{order.customer}</td>
                        <td className="px-2 py-2.5 text-right font-medium">{formatCurrency(order.total)}</td>
                        <td className="px-2 py-2.5 text-center">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance + Quick Actions + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
            <CardDescription>Current quarter KPIs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              [
                { label: 'Sales Target', value: performance.salesTarget, color: 'bg-navy-600 dark:bg-navy-500' },
                { label: 'Inventory Accuracy', value: performance.inventoryAccuracy, color: 'bg-emerald-600 dark:bg-emerald-500' },
                { label: 'Order Fulfillment', value: performance.orderFulfillment, color: 'bg-amber-500 dark:bg-amber-400' },
                { label: 'Customer Satisfaction', value: performance.customerSatisfaction, color: 'bg-rose-500 dark:bg-rose-400' },
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm font-bold text-navy-700 dark:text-navy-300">{metric.value}%</span>
                  </div>
                  <div className="h-2.5 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} rounded-full transition-all duration-700`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common ERP operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: ShoppingCart, label: 'New Sale', color: 'navy' },
                { icon: Package, label: 'Add Product', color: 'emerald' },
                { icon: FileText, label: 'Create Invoice', color: 'amber' },
                { icon: Users, label: 'Add Customer', color: 'navy' },
                { icon: Download, label: 'Export Data', color: 'emerald' },
                { icon: Printer, label: 'Print Report', color: 'amber' },
              ].map(action => (
                <QuickLinkCard
                  key={action.label}
                  title={action.label}
                  icon={action.icon}
                  color={action.color as 'navy' | 'emerald' | 'amber' | 'rose'}
                  description=""
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Recent system alerts</CardDescription>
              </div>
              <Badge className="bg-rose-500 text-white border-0 text-[10px]">{notifications.length} new</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              notifications.map((notif, idx) => {
                const alertStyles: Record<string, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
                  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-500', icon: CheckCircle, iconColor: 'text-emerald-600 dark:text-emerald-400' },
                  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-500', icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-400' },
                  info: { bg: 'bg-navy-50 dark:bg-navy-900/20', border: 'border-l-navy-500', icon: Info, iconColor: 'text-navy-600 dark:text-navy-400' },
                  error: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-l-rose-500', icon: XCircle, iconColor: 'text-rose-600 dark:text-rose-400' },
                }
                const style = alertStyles[notif.type] || alertStyles.info
                const IconComp = style.icon
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${style.border} ${style.bg}`}>
                    <IconComp className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
