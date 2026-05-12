'use client'

import * as React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Package,
  BarChart3,
  RefreshCw,
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Archive,
  BoxesIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { DateRangePicker } from '@/components/pickers/date-range-picker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InlineHeader } from '@/components/ui/inline-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { toast } from 'sonner'
import { DateRange } from 'react-day-picker'

// ================================================================
// TYPES
// ================================================================

interface SalesReportData {
  summary: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    topCustomer: string
  }
  salesByDate: Array<{ date: string; revenue: number }>
  topProducts: Array<{ name: string; sku: string; category: string; revenue: number; quantity: number }>
  salesByCategory: Array<{ category: string; revenue: number }>
  period: { startDate: string | null; endDate: string | null }
}

interface InventoryReportData {
  summary: {
    totalItems: number
    inStock: number
    lowStock: number
    outOfStock: number
    inventoryValue: number
  }
  stockByCategory: Array<{ name: string; stock: number; value: number }>
  products: Array<{
    id: string; name: string; sku: string; category: string
    currentStock: number; minStock: number; costPrice: number; sellPrice: number
    stockValue: number; status: string
  }>
}

interface ProductData {
  id: string; sku: string; name: string; category: string; categoryId: string | null
  costPrice: number; sellPrice: number; currentStock: number; minStock: number
  status: string
}

interface CategoryData {
  id: string; name: string; productCount: number
}

interface DashboardData {
  monthlySales: Array<{ month: string; year: number; revenue: number }>
}

type SortDir = 'asc' | 'desc'

// ================================================================
// CONSTANTS
// ================================================================

const BDT = (amount: number): string =>
  `৳ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`

const NAVY_STROKE = '#1e3a5f'
const NAVY_FILL = '#c7d9ed'

const CATEGORY_COLORS = [
  '#1e3a5f', '#2d6a4f', '#d4a017', '#c44536', '#6b4c9a',
  '#2874a6', '#b7950b', '#7d3c98', '#117864', '#943126',
]

const PIE_COLORS = ['#2d6a4f', '#d4a017', '#c44536']

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
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => { fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData, setData }
}

// ================================================================
// QUICK DATE RANGES
// ================================================================

function getQuickRange(range: string): DateRange | undefined {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'today':
      return { from: today, to: now }
    case 'week': {
      const day = today.getDay()
      const diff = day === 0 ? 6 : day - 1 // Monday start
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - diff)
      return { from: startOfWeek, to: now }
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: startOfMonth, to: now }
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return { from: startOfYear, to: now }
    }
    default:
      return undefined
  }
}

// ================================================================
// LOADING CARD
// ================================================================

function LoadingCard({ className }: { className?: string }) {
  return <Skeleton className={`h-24 rounded-lg ${className ?? ''}`} />
}

function LoadingChart({ height = 300 }: { height?: number }) {
  return <Skeleton className={`w-full rounded-lg`} style={{ height }} />
}

// ================================================================
// SUMMARY CARD
// ================================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  colorClass,
  borderClass,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  colorClass: string
  borderClass: string
}) {
  return (
    <Card className={`border-l-4 ${borderClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className={`text-xl font-bold mt-1 ${colorClass}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ================================================================
// ERROR STATE
// ================================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
      <p className="text-muted-foreground mb-1 font-medium">Failed to load data</p>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />Retry
      </Button>
    </div>
  )
}

// ================================================================
// CHART CONFIGS
// ================================================================

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (৳)', color: NAVY_STROKE },
}

const categoryBarChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (৳)', color: '#1e3a5f' },
}

const stockByCategoryConfig: ChartConfig = {
  stock: { label: 'Stock', color: '#1e3a5f' },
}

const pieChartConfig: ChartConfig = {
  inStock: { label: 'In Stock', color: '#2d6a4f' },
  lowStock: { label: 'Low Stock', color: '#d4a017' },
  outOfStock: { label: 'Out of Stock', color: '#c44536' },
}

const productComparisonConfig: ChartConfig = {
  costPrice: { label: 'Cost Price', color: '#c44536' },
  sellPrice: { label: 'Sell Price', color: '#1e3a5f' },
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function ReportsSection() {
  // Date range state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [appliedDateRange, setAppliedDateRange] = React.useState<DateRange | undefined>(undefined)

  // Build sales URL with applied date range
  const salesUrl = React.useMemo(() => {
    const params = new URLSearchParams()
    if (appliedDateRange?.from) params.set('startDate', appliedDateRange.from.toISOString())
    if (appliedDateRange?.to) params.set('endDate', appliedDateRange.to.toISOString())
    return `/api/reports/sales${params.toString() ? `?${params.toString()}` : ''}`
  }, [appliedDateRange])

  // Data hooks
  const { data: salesReport, loading: salesLoading, error: salesError, refetch: refetchSales, setData: setSalesData } = useApiData<SalesReportData>(salesUrl)
  const { data: inventoryReport, loading: invLoading, error: invError, refetch: refetchInv } = useApiData<InventoryReportData>('/api/reports/inventory')
  const { data: products, loading: prodLoading, error: prodError, refetch: refetchProducts } = useApiData<ProductData[]>('/api/products')
  const { data: categories, loading: catLoading } = useApiData<CategoryData[]>('/api/categories')
  const { data: dashboardData, loading: dashLoading } = useApiData<DashboardData>('/api/dashboard')

  // Inventory category filter
  const [invCategoryFilter, setInvCategoryFilter] = React.useState<string>('all')

  // Sort states
  const [topProductsSort, setTopProductsSort] = React.useState<{ key: string; dir: SortDir }>({ key: 'revenue', dir: 'desc' })
  const [marginSort, setMarginSort] = React.useState<{ key: string; dir: SortDir }>({ key: 'marginPct', dir: 'desc' })

  // Apply date range
  const handleApplyDateRange = React.useCallback(async () => {
    setAppliedDateRange(dateRange)
    // Immediately fetch with the new date range
    const params = new URLSearchParams()
    if (dateRange?.from) params.set('startDate', dateRange.from.toISOString())
    if (dateRange?.to) params.set('endDate', dateRange.to.toISOString())
    const url = `/api/reports/sales${params.toString() ? `?${params.toString()}` : ''}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setSalesData(json)
      toast.success('Sales report updated with new date range')
    } catch {
      toast.error('Failed to refresh sales report')
    }
  }, [dateRange, setSalesData])

  // Quick range handler
  const handleQuickRange = React.useCallback((range: string) => {
    const newRange = getQuickRange(range)
    setDateRange(newRange)
    setAppliedDateRange(newRange)
  }, [])

  // Derived data for inventory tab
  const filteredInventoryProducts = React.useMemo(() => {
    if (!inventoryReport?.products) return []
    if (invCategoryFilter === 'all') return inventoryReport.products
    return inventoryReport.products.filter(p => p.category === invCategoryFilter)
  }, [inventoryReport, invCategoryFilter])

  const inventoryValuation = React.useMemo(() => {
    return [...filteredInventoryProducts]
      .sort((a, b) => b.stockValue - a.stockValue)
  }, [filteredInventoryProducts])

  const inventoryCategories = React.useMemo(() => {
    if (!inventoryReport?.products) return []
    const cats = new Set(inventoryReport.products.map(p => p.category))
    return Array.from(cats)
  }, [inventoryReport])

  // Stock distribution for pie chart
  const stockDistribution = React.useMemo(() => {
    if (!inventoryReport?.summary) return []
    return [
      { name: 'In Stock', value: inventoryReport.summary.inStock, key: 'inStock' },
      { name: 'Low Stock', value: inventoryReport.summary.lowStock, key: 'lowStock' },
      { name: 'Out of Stock', value: inventoryReport.summary.outOfStock, key: 'outOfStock' },
    ]
  }, [inventoryReport])

  // Derived data for product performance tab
  const productPerformance = React.useMemo(() => {
    if (!products) return []
    return products.map(p => {
      const margin = p.sellPrice - p.costPrice
      const marginPct = p.sellPrice > 0 ? (margin / p.sellPrice) * 100 : 0
      return {
        ...p,
        margin: parseFloat(margin.toFixed(2)),
        marginPct: parseFloat(marginPct.toFixed(2)),
        stockValue: p.currentStock * p.costPrice,
      }
    })
  }, [products])

  const top10ByRevenue = React.useMemo(() => {
    if (!salesReport?.topProducts) return []
    return salesReport.topProducts.slice(0, 10)
  }, [salesReport])

  const productComparisonData = React.useMemo(() => {
    if (!products || !top10ByRevenue.length) return []
    return top10ByRevenue.map(tp => {
      const prod = products.find(p => p.name === tp.name)
      return {
        name: tp.name.length > 15 ? tp.name.substring(0, 15) + '…' : tp.name,
        costPrice: prod?.costPrice || 0,
        sellPrice: prod?.sellPrice || tp.revenue / Math.max(tp.quantity, 1),
      }
    })
  }, [products, top10ByRevenue])

  const sortedMarginData = React.useMemo(() => {
    const data = [...productPerformance]
    const { key, dir } = marginSort
    data.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[key] as number
      const bVal = (b as Record<string, unknown>)[key] as number
      return dir === 'asc' ? aVal - bVal : bVal - aVal
    })
    return data
  }, [productPerformance, marginSort])

  const categoryPerformance = React.useMemo(() => {
    if (!categories || !products) return []
    return categories.map(cat => {
      const catProducts = products.filter(p => p.categoryId === cat.id)
      const totalRevenue = catProducts.reduce((s, p) => s + (p.sellPrice * p.currentStock), 0)
      const margins = catProducts.map(p => p.sellPrice > 0 ? ((p.sellPrice - p.costPrice) / p.sellPrice) * 100 : 0)
      const avgMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0
      const stockValue = catProducts.reduce((s, p) => s + (p.costPrice * p.currentStock), 0)
      return {
        category: cat.name,
        products: catProducts.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        avgMargin: parseFloat(avgMargin.toFixed(2)),
        stockValue: parseFloat(stockValue.toFixed(2)),
      }
    }).filter(c => c.products > 0)
  }, [categories, products])

  // Sort helper for tables
  const toggleSort = React.useCallback((current: { key: string; dir: SortDir }, key: string, setter: (v: { key: string; dir: SortDir }) => void) => {
    if (current.key === key) {
      setter({ key, dir: current.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setter({ key, dir: 'desc' })
    }
  }, [])

  const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => {
    if (!active) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    return dir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
  }

  // Sales by category chart data
  const salesByCategoryChartData = React.useMemo(() => {
    if (!salesReport?.salesByCategory) return []
    return salesReport.salesByCategory.map((c, i) => ({
      ...c,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  }, [salesReport])

  // Stock by category chart data
  const stockByCategoryChartData = React.useMemo(() => {
    if (!inventoryReport?.stockByCategory) return []
    return inventoryReport.stockByCategory.map((c, i) => ({
      ...c,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  }, [inventoryReport])

  // Global refresh
  const refreshAll = React.useCallback(() => {
    refetchSales()
    refetchInv()
    refetchProducts()
    toast.success('All reports refreshed')
  }, [refetchSales, refetchInv, refetchProducts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <InlineHeader color="navy">Reports & Analytics</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Business intelligence and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4 mr-1" />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export feature coming soon')}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="sales" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5">
            <Package className="h-4 w-4" />Inventory
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />Performance
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* TAB 1: SALES REPORT                                          */}
        {/* ============================================================ */}
        <TabsContent value="sales" className="space-y-6 mt-4">
          {/* Date Range Filter */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Period:</span>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Select date range"
                    className="w-[260px]"
                  />
                  <Button size="sm" onClick={handleApplyDateRange} className="bg-navy-600 hover:bg-navy-700 text-white">
                    Apply
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground mr-1">Quick:</span>
                  {['today', 'week', 'month', 'year'].map(range => (
                    <Button
                      key={range}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleQuickRange(range)}
                    >
                      {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Year'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error state */}
          {salesError && <ErrorState message={salesError} onRetry={refetchSales} />}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {salesLoading ? (
              <>
                <LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard />
              </>
            ) : (
              <>
                <SummaryCard
                  title="Total Revenue"
                  value={BDT(salesReport?.summary.totalRevenue || 0)}
                  icon={DollarSign}
                  colorClass="text-emerald-700 dark:text-emerald-300"
                  borderClass="border-l-emerald-500"
                />
                <SummaryCard
                  title="Total Orders"
                  value={salesReport?.summary.totalOrders || 0}
                  icon={ShoppingCart}
                  colorClass="text-navy-700 dark:text-navy-300"
                  borderClass="border-l-navy-500"
                />
                <SummaryCard
                  title="Average Order Value"
                  value={BDT(salesReport?.summary.avgOrderValue || 0)}
                  icon={TrendingUp}
                  colorClass="text-amber-700 dark:text-amber-300"
                  borderClass="border-l-amber-500"
                />
                <SummaryCard
                  title="Top Customer"
                  value={salesReport?.summary.topCustomer || 'N/A'}
                  icon={Users}
                  colorClass="text-purple-700 dark:text-purple-300"
                  borderClass="border-l-purple-500"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="shadow-md lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-navy-500" />Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <LoadingChart height={300} />
                ) : (
                  <ChartContainer config={revenueChartConfig} className="h-[300px] w-full" style={{ aspectRatio: undefined }}>
                    <LineChart data={salesReport?.salesByDate || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => BDT(value)} />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={NAVY_STROKE}
                        fill={NAVY_FILL}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: NAVY_STROKE }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-navy-500" />Sales by Category
                </CardTitle>
                <CardDescription>Revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <LoadingChart height={300} />
                ) : (
                  <ChartContainer config={categoryBarChartConfig} className="h-[300px] w-full" style={{ aspectRatio: undefined }}>
                    <BarChart data={salesByCategoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={55} />
                      <Tooltip formatter={(value: number) => BDT(value)} />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {salesByCategoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Products Table */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-navy-500" />Top Selling Products
              </CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => toggleSort(topProductsSort, 'quantity', setTopProductsSort)}
                        >
                          <span className="flex items-center">Qty Sold <SortIcon active={topProductsSort.key === 'quantity'} dir={topProductsSort.dir} /></span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none text-right"
                          onClick={() => toggleSort(topProductsSort, 'revenue', setTopProductsSort)}
                        >
                          <span className="flex items-center justify-end">Revenue (৳) <SortIcon active={topProductsSort.key === 'revenue'} dir={topProductsSort.dir} /></span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...(salesReport?.topProducts || [])]
                        .sort((a, b) => {
                          const key = topProductsSort.key as 'quantity' | 'revenue'
                          return topProductsSort.dir === 'asc' ? a[key] - b[key] : b[key] - a[key]
                        })
                        .map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{p.category || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>{p.quantity}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-300">{BDT(p.revenue)}</TableCell>
                          </TableRow>
                        ))
                      }
                      {(!salesReport?.topProducts || salesReport.topProducts.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No sales data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: INVENTORY REPORT                                      */}
        {/* ============================================================ */}
        <TabsContent value="inventory" className="space-y-6 mt-4">
          {/* Error state */}
          {invError && <ErrorState message={invError} onRetry={refetchInv} />}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {invLoading ? (
              <>
                <LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard />
              </>
            ) : (
              <>
                <SummaryCard
                  title="Total Products"
                  value={inventoryReport?.summary.totalItems || 0}
                  icon={BoxesIcon}
                  colorClass="text-navy-700 dark:text-navy-300"
                  borderClass="border-l-navy-500"
                />
                <SummaryCard
                  title="Total Stock Value"
                  value={BDT(inventoryReport?.summary.inventoryValue || 0)}
                  icon={DollarSign}
                  colorClass="text-emerald-700 dark:text-emerald-300"
                  borderClass="border-l-emerald-500"
                />
                <SummaryCard
                  title="Low Stock Items"
                  value={inventoryReport?.summary.lowStock || 0}
                  icon={AlertTriangle}
                  colorClass="text-amber-700 dark:text-amber-300"
                  borderClass="border-l-amber-500"
                />
                <SummaryCard
                  title="Out of Stock"
                  value={inventoryReport?.summary.outOfStock || 0}
                  icon={Archive}
                  colorClass="text-rose-700 dark:text-rose-300"
                  borderClass="border-l-rose-500"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock by Category Chart */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-navy-500" />Stock by Category
                </CardTitle>
                <CardDescription>Stock units per category</CardDescription>
              </CardHeader>
              <CardContent>
                {invLoading ? (
                  <LoadingChart height={300} />
                ) : (
                  <ChartContainer config={stockByCategoryConfig} className="h-[300px] w-full" style={{ aspectRatio: undefined }}>
                    <BarChart data={stockByCategoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                      <Tooltip />
                      <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
                        {stockByCategoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Stock Level Distribution Pie Chart */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-navy-500" />Stock Level Distribution
                </CardTitle>
                <CardDescription>In Stock / Low Stock / Out of Stock</CardDescription>
              </CardHeader>
              <CardContent>
                {invLoading ? (
                  <LoadingChart height={300} />
                ) : (
                  <ChartContainer config={pieChartConfig} className="h-[300px] w-full" style={{ aspectRatio: undefined }}>
                    <PieChart>
                      <Pie
                        data={stockDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stockDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inventory Valuation Table */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-navy-500" />Inventory Valuation
                  </CardTitle>
                  <CardDescription>Products sorted by total value (descending)</CardDescription>
                </div>
                <Select value={invCategoryFilter} onValueChange={setInvCategoryFilter}>
                  <SelectTrigger className="w-[180px]" size="sm">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {inventoryCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {invLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Cost Price</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryValuation.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={p.currentStock === 0 ? 'text-rose-600 font-medium' : p.currentStock <= p.minStock ? 'text-amber-600 font-medium' : ''}>
                              {p.currentStock}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{BDT(p.costPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{BDT(p.stockValue)}</TableCell>
                        </TableRow>
                      ))}
                      {inventoryValuation.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No inventory data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: PRODUCT PERFORMANCE                                   */}
        {/* ============================================================ */}
        <TabsContent value="performance" className="space-y-6 mt-4">
          {/* Error state */}
          {(prodError) && <ErrorState message={prodError || 'Failed to load products'} onRetry={refetchProducts} />}

          {/* Product Comparison Chart */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-navy-500" />Product Comparison — Top 10 by Revenue
              </CardTitle>
              <CardDescription>Cost Price vs Sell Price comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading || prodLoading ? (
                <LoadingChart height={350} />
              ) : (
                <ChartContainer config={productComparisonConfig} className="h-[350px] w-full" style={{ aspectRatio: undefined }}>
                  <BarChart data={productComparisonData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => BDT(value)} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="costPrice" fill="#c44536" radius={[4, 4, 0, 0]} name="Cost Price" />
                    <Bar dataKey="sellPrice" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="Sell Price" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Margin Analysis Table */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-navy-500" />Profit Margin Analysis
                </CardTitle>
                <CardDescription>Click column headers to sort</CardDescription>
              </CardHeader>
              <CardContent>
                {prodLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right"
                            onClick={() => toggleSort(marginSort, 'marginPct', setMarginSort)}
                          >
                            <span className="flex items-center justify-end cursor-pointer select-none">
                              Margin% <SortIcon active={marginSort.key === 'marginPct'} dir={marginSort.dir} />
                            </span>
                          </TableHead>
                          <TableHead className="text-right">Margin (৳)</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMarginData.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-xs">{p.name}</TableCell>
                            <TableCell className={`text-right font-medium text-xs ${p.marginPct >= 30 ? 'text-emerald-600 dark:text-emerald-400' : p.marginPct >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {p.marginPct.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right text-xs">{BDT(p.margin)}</TableCell>
                            <TableCell className="text-xs">{p.currentStock}</TableCell>
                            <TableCell>
                              <Badge
                                variant={p.status === 'Out of Stock' ? 'destructive' : p.status === 'Low Stock' ? 'warning' : 'success'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {sortedMarginData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No product data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category-wise Performance Table */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-navy-500" />Category-wise Performance
                </CardTitle>
                <CardDescription>Aggregated category metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {catLoading || prodLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Products</TableHead>
                          <TableHead className="text-right">Total Revenue</TableHead>
                          <TableHead className="text-right">Avg Margin%</TableHead>
                          <TableHead className="text-right">Stock Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryPerformance.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{c.category}</TableCell>
                            <TableCell className="text-right">{c.products}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-300">{BDT(c.totalRevenue)}</TableCell>
                            <TableCell className={`text-right font-medium ${c.avgMargin >= 30 ? 'text-emerald-600 dark:text-emerald-400' : c.avgMargin >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {c.avgMargin.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right">{BDT(c.stockValue)}</TableCell>
                          </TableRow>
                        ))}
                        {categoryPerformance.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No category data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
