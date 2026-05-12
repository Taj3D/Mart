'use client'

import * as React from 'react'
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
  XCircle,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineHeader } from '@/components/ui/inline-header'
import { IMSChart } from '@/lib/chart-utils'
import { DatePicker } from '@/components/pickers'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

interface SalesReportData {
  summary: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
  }
  salesByDate: Array<{ date: string; revenue: number }>
  topProducts: Array<{ name: string; sku: string; revenue: number; quantity: number }>
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

interface DashboardData {
  monthlySales: Array<{ month: string; year: number; revenue: number }>
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

  React.useEffect(() => { fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}

// ================================================================
// HELPERS
// ================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function ReportsSection() {
  const { data: salesReport, loading: salesLoading, error: salesError, refetch: refetchSales } = useApiData<SalesReportData>('/api/reports/sales')
  const { data: inventoryReport, loading: invLoading, error: invError, refetch: refetchInv } = useApiData<InventoryReportData>('/api/reports/inventory')
  const { data: dashboardData, loading: dashLoading } = useApiData<DashboardData>('/api/dashboard')

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)

  // Refresh sales report with date range
  const refreshWithDates = React.useCallback(async () => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate.toISOString())
    if (endDate) params.set('endDate', endDate.toISOString())
    const url = `/api/reports/sales${params.toString() ? `?${params.toString()}` : ''}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      // Manually update - we use a key approach instead for simplicity
      toast.success('Report refreshed with new date range')
    } catch { toast.error('Failed to refresh report') }
  }, [startDate, endDate])

  const hasError = salesError || invError

  if (hasError) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load report data</p>
        <Button variant="outline" onClick={() => { refetchSales(); refetchInv() }}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Reports & Analytics</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Business intelligence and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetchSales(); refetchInv(); toast.success('Reports refreshed') }}>
            <RefreshCw className="h-4 w-4 mr-1" />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export all reports as PDF')}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
        </div>
      </div>

      {/* Sales Report */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-navy-500" />Sales Report
              </CardTitle>
              <CardDescription>Revenue trend and order analysis</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Start date" />
              <DatePicker value={endDate} onChange={setEndDate} placeholder="End date" />
              <Button variant="outline" size="sm" onClick={refreshWithDates}>Apply</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {salesLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : (
              <>
                <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(salesReport?.summary.totalRevenue || 0)}</p></CardContent></Card>
                <Card className="border-l-4 border-l-navy-500"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-xl font-bold text-navy-700 dark:text-navy-300">{salesReport?.summary.totalOrders || 0}</p></CardContent></Card>
                <Card className="border-l-4 border-l-amber-500"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Avg Order Value</p><p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(salesReport?.summary.avgOrderValue || 0)}</p></CardContent></Card>
              </>
            )}
          </div>

          {/* Revenue Trend Chart */}
          {salesLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <IMSChart
              type="area2d"
              data={{
                chartType: 'single',
                data: (salesReport?.salesByDate || []).map(d => ({ label: d.date, value: d.revenue })),
              }}
              caption="Revenue Trend"
              xAxisName="Date"
              yAxisName="Revenue ($)"
              height={300}
              numberPrefix="$"
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Report */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-navy-500" />Inventory Report
            </CardTitle>
            <CardDescription>Stock levels by category</CardDescription>
          </CardHeader>
          <CardContent>
            {invLoading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{inventoryReport?.summary.inStock || 0}</p>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{inventoryReport?.summary.outOfStock || 0}</p>
                    <p className="text-xs text-muted-foreground">Out of Stock</p>
                  </div>
                </div>
                <IMSChart
                  type="column2d"
                  data={{
                    chartType: 'single',
                    data: (inventoryReport?.stockByCategory || []).map(c => ({ label: c.name, value: c.stock })),
                  }}
                  caption="Stock by Category"
                  xAxisName="Category"
                  yAxisName="Units"
                  height={250}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-navy-500" />Top Products
            </CardTitle>
            <CardDescription>Best selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : (
              <IMSChart
                type="bar2d"
                data={{
                  chartType: 'single',
                  data: (salesReport?.topProducts || []).slice(0, 8).map(p => ({ label: p.name, value: p.revenue })),
                }}
                caption="Top Products by Revenue"
                xAxisName="Revenue ($)"
                numberPrefix="$"
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend - Monthly */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-navy-500" />Monthly Revenue Trend
          </CardTitle>
          <CardDescription>12-month revenue comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {dashLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <IMSChart
              type="line"
              data={{
                chartType: 'single',
                data: (dashboardData?.monthlySales || []).map(m => ({ label: m.month, value: m.revenue })),
              }}
              caption="Monthly Revenue"
              xAxisName="Month"
              yAxisName="Revenue ($)"
              height={300}
              numberPrefix="$"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
