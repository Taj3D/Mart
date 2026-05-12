'use client'

import * as React from 'react'
import {
  Package, Users, ShoppingCart, DollarSign, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Plus, FileText, Download, Printer,
  RefreshCw, ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useNavigationStore } from '@/lib/stores/navigation-store'

// Chart colors matching Deep Navy Blue theme
const CHART_COLORS = ['#1e3a5f', '#2d5a8e', '#3b7dd8', '#18bc9c', '#f9b31f', '#e74c3c', '#9b59b6', '#3498db']

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalPurchases: number
  lowStockProducts: number
  pendingOrders: number
  categoryCount: number
  brandCount: number
  supplierCount: number
  totalRevenue: number
  totalExpenses: number
}

interface MonthlySales {
  month: string
  amount: number
}

interface CategoryDist {
  name: string
  count: number
}

interface TopProduct {
  id: string
  name: string
  sku: string
  quantity: number
  revenue: number
}

interface RecentOrder {
  id: string
  customer: string
  totalAmount: number
  status: string
  paymentStatus: string
  date: string
  itemCount: number
}

interface DashboardData {
  stats: DashboardStats
  monthlySales: MonthlySales[]
  categoryDistribution: CategoryDist[]
  topSellingProducts: TopProduct[]
  recentOrders: RecentOrder[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function StatCard({ title, value, icon: Icon, change, trend, color }: {
  title: string; value: string; icon: React.ElementType; change?: string; trend?: 'up' | 'down'; color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    navy: { bg: 'from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800', iconBg: 'bg-white/20' },
    emerald: { bg: 'from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800', iconBg: 'bg-white/20' },
    amber: { bg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700', iconBg: 'bg-white/20' },
    rose: { bg: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700', iconBg: 'bg-white/20' },
    sky: { bg: 'from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700', iconBg: 'bg-white/20' },
    violet: { bg: 'from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700', iconBg: 'bg-white/20' },
  }
  const colors = colorMap[color] || colorMap.navy

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1.5">
                {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-300" />}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>{change}</span>
              </div>
            )}
          </div>
          <div className={`${colors.iconBg} p-3 rounded-xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Processing: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    Confirmed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return <Badge className={`${styles[status] || ''} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return <Badge className={`${styles[status] || ''} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
}

export function DashboardPage() {
  const { navigate } = useNavigationStore()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStats = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md"><CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent></Card>
          <Card className="border-0 shadow-md"><CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent></Card>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard data</h3>
          <p className="text-muted-foreground mb-4">{error || 'No data available'}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { stats, monthlySales, categoryDistribution, topSellingProducts, recentOrders } = data

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-navy-500 dark:from-navy-800 dark:via-navy-700 dark:to-navy-600 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, Admin!</h1>
              <p className="text-navy-200 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={fetchStats}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} change="+12.5%" trend="up" color="navy" />
        <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} change="+8.2%" trend="up" color="emerald" />
        <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} change="+5.1%" trend="up" color="sky" />
        <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} change="+15.3%" trend="up" color="violet" />
        <StatCard title="Low Stock" value={stats.lowStockProducts.toString()} icon={AlertTriangle} change="Needs attention" trend="down" color="amber" />
        <StatCard title="Pending Orders" value={stats.pendingOrders.toString()} icon={Clock} change="-3" trend="up" color="rose" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Bar Chart */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Monthly Sales</CardTitle>
                <CardDescription>Revenue over the last 6 months</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('reports', 'sales-report')}>
                View Report <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="amount" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">By Category</CardTitle>
                <CardDescription>Product distribution</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('inventory', 'categories')}>
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Top Selling Products</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('reports', 'sales-report')}>
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellingProducts.length > 0 ? topSellingProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Last 5 orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('sales', 'orders')}>
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/90 uppercase tracking-wider">Order</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/90 uppercase tracking-wider">Customer</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-white/90 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase tracking-wider">Status</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase tracking-wider">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                      <td className="px-3 py-2 font-medium text-navy-700 dark:text-navy-300">{order.id}</td>
                      <td className="px-3 py-2">{order.customer}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-3 py-2 text-center"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-2 text-center"><PaymentBadge status={order.paymentStatus} /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { icon: Plus, label: 'New Order', action: () => navigate('sales', 'orders'), variant: 'default' as const },
              { icon: Package, label: 'Add Product', action: () => navigate('inventory', 'products'), variant: 'default' as const },
              { icon: FileText, label: 'Create Invoice', action: () => navigate('sales', 'invoices'), variant: 'outline' as const },
              { icon: Users, label: 'Add Customer', action: () => navigate('sales', 'customers'), variant: 'outline' as const },
              { icon: Download, label: 'Export Data', action: () => navigate('reports', 'inventory-report'), variant: 'outline' as const },
              { icon: Printer, label: 'Print Report', action: () => navigate('reports', 'sales-report'), variant: 'outline' as const },
            ].map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                className={`h-auto py-3 flex flex-col items-center gap-1.5 ${
                  action.variant === 'default'
                    ? 'bg-navy-600 hover:bg-navy-700 dark:bg-navy-700 dark:hover:bg-navy-600'
                    : 'border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30'
                }`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
