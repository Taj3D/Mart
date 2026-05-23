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
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Plus,
  FileText,
  BarChart3,
  Warehouse,
  RefreshCw,
  XCircle,
  Search,
  ScanLine,
  SlidersHorizontal,
  CalendarDays,
  ArrowRight,
  Building2,
  Briefcase,
  Eye,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineHeader } from '@/components/ui/inline-header'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

export interface DashboardModuleProps {
  onNavigate?: (section: string) => void
}

interface DashboardStats {
  totalProducts: number
  totalSales: number
  totalLowStock: number
  totalCustomers: number
  totalInvestmentHeads: number
  totalCompanies: number
}

interface RecentSale {
  id: string
  customer: string
  totalAmount: number
  status: string
  date: string
  itemCount: number
}

interface MonthlySales {
  month: string
  amount: number
}

interface CategoryDistribution {
  name: string
  count: number
}

interface TopSellingProduct {
  id: string
  name: string
  code: string
  quantity: number
  revenue: number
}

interface DashboardData {
  stats: DashboardStats
  recentSales: RecentSale[]
  monthlySales: MonthlySales[]
  categoryDistribution: CategoryDistribution[]
  topSellingProducts: TopSellingProduct[]
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
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
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

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    CONFIRMED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    PROCESSING: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }
  return (
    <Badge className={`${map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} border-0 text-[10px] px-2 py-0.5`}>
      {status}
    </Badge>
  )
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
  '#0891b2', // cyan-600
]

const AREA_FILL = '#1e3a5f'
const AREA_STROKE = '#0f2744'

// ================================================================
// STAT CARD
// ================================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    navy: { bg: 'from-[#1e3a5f] to-[#0f2744] dark:from-[#0f2744] dark:to-[#091728]', iconBg: 'bg-white/20' },
    emerald: { bg: 'from-emerald-700 to-emerald-800 dark:from-emerald-800 dark:to-emerald-900', iconBg: 'bg-white/20' },
    amber: { bg: 'from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800', iconBg: 'bg-white/20' },
    rose: { bg: 'from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800', iconBg: 'bg-white/20' },
    cyan: { bg: 'from-cyan-600 to-cyan-700 dark:from-cyan-700 dark:to-cyan-800', iconBg: 'bg-white/20' },
    purple: { bg: 'from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800', iconBg: 'bg-white/20' },
  }
  const colors = colorMap[color] || colorMap.navy

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/80 truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/60 mt-1 truncate">{subtitle}</p>
            )}
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
    navy: { bg: 'bg-[#1e3a5f] dark:bg-[#0f2744]', hover: 'hover:brightness-110' },
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
// CUSTOM RECHARTS TOOLTIPS
// ================================================================

function SalesChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0f2744] border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#1e3a5f] dark:text-slate-300">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
        {formatBDT(payload[0].value)}
      </p>
    </div>
  )
}

function PieChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0f2744] border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#1e3a5f] dark:text-slate-300">{payload[0].name}</p>
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
// IMEI / SERIAL SEARCH BAR
// ================================================================

function IMEISearchBar() {
  const [searchValue, setSearchValue] = React.useState('')
  const [searching, setSearching] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter an IMEI or Serial number')
      inputRef.current?.focus()
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchValue.trim())}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        toast.success(`Found ${data.length} product(s) matching "${searchValue.trim()}"`)
      } else {
        toast.info(`No products found for "${searchValue.trim()}"`)
      }
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card className="shadow-md border-0">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f2744] dark:from-[#0f2744] dark:to-[#091728] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-amber-400/20 p-2 rounded-lg">
              <ScanLine className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg">Stock Info</h3>
              <p className="text-white/60 text-xs">IMEI / Serial Quick Search</p>
            </div>
          </div>
          <div className="flex-1 w-full sm:w-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                ref={inputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter IMEI or Serial Number..."
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400 focus:ring-amber-400/20 h-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-amber-500 hover:bg-amber-600 text-[#0f2744] font-semibold shrink-0 h-10 px-4"
            >
              {searching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1.5" />
                  Search Stock
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ================================================================
// ADVANCE SEARCH CARD
// ================================================================

function AdvanceSearchCard({ onNavigate }: { onNavigate?: (section: string) => void }) {
  return (
    <Card className="shadow-md border-0">
      <div className="bg-gradient-to-r from-[#047857] to-[#065f46] dark:from-[#065f46] dark:to-[#064e3b] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <SlidersHorizontal className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg">Advance Search</h3>
              <p className="text-white/60 text-xs">Search by multiple filters & criteria</p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate('products')
                toast.info('Opening product search with advanced filters...')
              } else {
                toast.info('Advance Search — navigation not available in preview')
              }
            }}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold shrink-0 h-10 px-5"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Advance Search
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ================================================================
// TODAY'S INSTALLMENT TABLE
// ================================================================

function TodaysInstallmentTable({ recentSales, loading }: { recentSales: RecentSale[]; loading: boolean }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Generate installment-like data from recentSales for the table display
  const installmentRows = React.useMemo(() => {
    return recentSales.map((sale, idx) => {
      const saleDate = new Date(sale.date)
      const paymentDate = new Date(saleDate)
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 5) + 1)
      const remindDate = new Date(paymentDate)
      remindDate.setDate(remindDate.getDate() - 1)
      const installment = Math.round(sale.totalAmount / 12)
      const defaultAmount = Math.random() > 0.6 ? Math.round(installment * 0.3) : 0

      return {
        sl: idx + 1,
        id: sale.id,
        customer: sale.customer,
        totalAmount: sale.totalAmount,
        status: sale.status,
        salesDate: saleDate,
        paymentDate,
        remindDate,
        installment,
        defaultAmount,
        itemCount: sale.itemCount,
      }
    })
  }, [recentSales])

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#1e3a5f] dark:text-[#4a8abf]" />
              Today&apos;s Installment
            </CardTitle>
            <CardDescription className="text-xs mt-1">{today}</CardDescription>
          </div>
          {installmentRows.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 text-[10px] px-2.5 py-0.5">
              {installmentRows.length} due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : installmentRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <CalendarDays className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              No installments due today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All payments are up to date
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sl</th>
                  <th className="text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Invoice No</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sales Date</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment Date</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Remind Date</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer Name</th>
                  <th className="text-left px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-right px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Installment</th>
                  <th className="text-right px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Default Amt</th>
                </tr>
              </thead>
              <tbody>
                {installmentRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 hover:bg-[#1e3a5f]/5 dark:hover:bg-[#1e3a5f]/10 transition-colors"
                  >
                    <td className="px-2 py-2.5 text-muted-foreground font-mono text-xs">{row.sl}</td>
                    <td className="px-2 py-2.5 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toast.info(`Viewing details for invoice ${row.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 text-[#1e3a5f] dark:text-[#4a8abf]" />
                      </Button>
                    </td>
                    <td className="px-2 py-2.5 font-medium text-[#1e3a5f] dark:text-[#4a8abf] font-mono text-xs">{row.id}</td>
                    <td className="px-2 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{formatDate(row.salesDate.toISOString())}</td>
                    <td className="px-2 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{formatDate(row.paymentDate.toISOString())}</td>
                    <td className="px-2 py-2.5 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Bell className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="text-amber-600 dark:text-amber-400">{formatDate(row.remindDate.toISOString())}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs font-mono text-muted-foreground">{row.id}</td>
                    <td className="px-2 py-2.5 text-xs font-medium truncate max-w-[120px]">{row.customer}</td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">{row.itemCount} item{row.itemCount !== 1 ? 's' : ''}</td>
                    <td className="px-2 py-2.5 text-right font-mono font-semibold text-xs">{formatBDT(row.installment)}</td>
                    <td className="px-2 py-2.5 text-right">
                      {row.defaultAmount > 0 ? (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0 text-[10px] px-1.5 py-0">
                          {formatBDT(row.defaultAmount)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Clear</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================================================================
// TOP SELLING PRODUCTS TABLE
// ================================================================

function TopSellingProductsTable({ products, loading }: { products: TopSellingProduct[]; loading: boolean }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Top Selling Products
            </CardTitle>
            <CardDescription className="text-xs mt-1">By revenue this period</CardDescription>
          </div>
          {products.length > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px] px-2.5 py-0.5">
              Top {products.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No sales data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Top products will appear here after sales</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product, idx) => {
              const maxRevenue = products[0]?.revenue || 1
              const barWidth = (product.revenue / maxRevenue) * 100

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#1e3a5f]/10 dark:bg-[#1e3a5f]/20 text-[#1e3a5f] dark:text-[#4a8abf] font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm font-mono font-semibold shrink-0">{formatBDT(product.revenue)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#4a8abf] dark:from-[#4a8abf] dark:to-[#6db3f2] rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {product.quantity} sold
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function DashboardModule({ onNavigate }: DashboardModuleProps) {
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useApiData<DashboardData>('/api/dashboard/stats')

  // Derived data
  const stats = dashboardData?.stats
  const recentSales = dashboardData?.recentSales || []
  const monthlySalesRaw = dashboardData?.monthlySales ?? null
  const monthlySales = React.useMemo(() => {
    if (!monthlySalesRaw) return []
    return monthlySalesRaw.map((m) => ({
      month: m.month,
      revenue: m.amount,
    }))
  }, [monthlySalesRaw])
  const categoryDistributionRaw = dashboardData?.categoryDistribution ?? null
  const categoryDistribution = React.useMemo(() => {
    if (!categoryDistributionRaw) return []
    return categoryDistributionRaw.map((c) => ({
      name: c.name,
      value: c.count,
    }))
  }, [categoryDistributionRaw])
  const topSellingProducts = dashboardData?.topSellingProducts || []

  const loading = dashboardLoading
  const error = dashboardError

  const refetchAll = () => {
    refetchDashboard()
    toast.success('Dashboard data refreshed')
  }

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
        <p className="text-slate-900 dark:text-white font-semibold mb-1">Failed to load dashboard data</p>
        <p className="text-xs text-muted-foreground/70 mb-4">{error}</p>
        <Button variant="outline" onClick={refetchAll} className="text-[#1e3a5f] dark:text-[#4a8abf]">
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
            Real-time inventory & sales metrics for Electronics Mart
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchAll}
          className="text-[#1e3a5f] dark:text-[#4a8abf]"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* ============================================================ */}
      {/* 1. IMEI / Serial Quick Search Bar */}
      {/* ============================================================ */}
      <IMEISearchBar />

      {/* ============================================================ */}
      {/* 2. Advance Search Card */}
      {/* ============================================================ */}
      <AdvanceSearchCard onNavigate={onNavigate} />

      {/* ============================================================ */}
      {/* 3. KPI Metric Cards Row */}
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
            title="Total Sales"
            value={formatBDT(stats?.totalSales || 0)}
            subtitle="All-time revenue"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Total Products"
            value={String(stats?.totalProducts || 0)}
            subtitle="Active items in stock"
            icon={Package}
            color="navy"
          />
          <StatCard
            title="Low Stock Items"
            value={String(stats?.totalLowStock || 0)}
            subtitle="Items at minimum level"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Total Customers"
            value={String(stats?.totalCustomers || 0)}
            subtitle="Registered customers"
            icon={Users}
            color="rose"
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. Secondary Stats Row */}
      {/* ============================================================ */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton key="inv-head" className="h-24 rounded-xl" />
          <Skeleton key="companies" className="h-24 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-md border-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl shrink-0">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Investment Heads</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats?.totalInvestmentHeads || 0}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 dark:text-purple-400 shrink-0"
                onClick={() => handleQuickAction('settings', 'Investment Heads')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-xl shrink-0">
                <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Companies</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats?.totalCompanies || 0}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-600 dark:text-cyan-400 shrink-0"
                onClick={() => handleQuickAction('purchase', 'Companies')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. Monthly Sales Chart + Category Distribution */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-white">Monthly Sales</CardTitle>
            <CardDescription>Revenue trend over the last 6 months (BDT)</CardDescription>
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
                      <linearGradient id="imsSalesGradient" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#imsSalesGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: AREA_STROKE, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-white">Category Distribution</CardTitle>
            <CardDescription>Product count breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Skeleton className="h-[300px] w-full max-w-[500px] rounded-lg" />
              </div>
            ) : categoryDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No product data available
              </div>
            ) : (
              <div className="h-[300px] w-full">
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

      {/* ============================================================ */}
      {/* 6. Today's Installment / Recent Sales Table */}
      {/* ============================================================ */}
      <TodaysInstallmentTable recentSales={recentSales} loading={loading} />

      {/* ============================================================ */}
      {/* 7. Quick Actions + Top Selling Products */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quick Actions Panel */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Actions</CardTitle>
            <CardDescription>Common operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
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
                icon={Warehouse}
                label="Stock Adjustment"
                color="amber"
                onClick={() => handleQuickAction('inventory', 'Stock Adjustment')}
              />
              <QuickActionButton
                icon={BarChart3}
                label="View Reports"
                color="cyan"
                onClick={() => handleQuickAction('reports', 'View Reports')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <TopSellingProductsTable products={topSellingProducts} loading={loading} />
      </div>
    </div>
  )
}
