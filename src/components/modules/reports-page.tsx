'use client'

import * as React from 'react'
import {
  FileBarChart, FileSpreadsheet, TrendingUp, ScrollText,
  Download, Printer, Filter, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { useNavigationStore } from '@/lib/stores/navigation-store'

const CHART_COLORS = ['#1e3a5f', '#2d5a8e', '#3b7dd8', '#18bc9c', '#f9b31f', '#e74c3c', '#9b59b6', '#3498db']

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

// SALES REPORT TAB
function SalesReportTab() {
  const [data, setData] = React.useState<{ stats: { totalRevenue: number; totalOrders: number }; monthlySales: Array<{ month: string; amount: number }> } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.ok ? res.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4"><Skeleton className="h-[400px]" /></div>
  if (!data) return <Card className="border-0 shadow-md"><CardContent className="p-8 text-center"><p>Failed to load report data</p></CardContent></Card>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-semibold">Sales Overview</h3><p className="text-sm text-muted-foreground">Revenue and order trends</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-navy-100 dark:bg-navy-800"><FileBarChart className="h-6 w-6 text-navy-600 dark:text-navy-300" /></div>
            <div><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{data.stats.totalOrders}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2"><CardTitle className="text-lg">Monthly Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Line type="monotone" dataKey="amount" stroke="#1e3a5f" strokeWidth={3} dot={{ r: 5, fill: '#1e3a5f' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// INVENTORY REPORT TAB
function InventoryReportTab() {
  const [data, setData] = React.useState<{ categoryDistribution: Array<{ name: string; count: number }> } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.ok ? res.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4"><Skeleton className="h-[400px]" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-semibold">Inventory Analysis</h3><p className="text-sm text-muted-foreground">Product distribution and stock levels</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2"><CardTitle className="text-lg">Products by Category</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2d5a8e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// FINANCIAL REPORT TAB
function FinancialReportTab() {
  const [data, setData] = React.useState<{ stats: { totalRevenue: number; totalExpenses: number } } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.ok ? res.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-[300px]" />

  const profit = (data?.stats.totalRevenue || 0) - (data?.stats.totalExpenses || 0)
  const pieData = [
    { name: 'Revenue', value: data?.stats.totalRevenue || 0 },
    { name: 'Expenses', value: data?.stats.totalExpenses || 0 },
    { name: 'Profit', value: profit > 0 ? profit : 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-semibold">Financial Summary</h3></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.stats.totalRevenue || 0)}</p></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold text-rose-600">{formatCurrency(data?.stats.totalExpenses || 0)}</p></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Net Profit</p><p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(profit)}</p></CardContent></Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2"><CardTitle className="text-lg">Revenue vs Expenses</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={['#18bc9c', '#e74c3c', '#1e3a5f'][index]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// AUDIT LOG TAB
function AuditLogTab() {
  const [logs, setLogs] = React.useState<Array<{ id: string; action: string; entity: string; entityId?: string; newValue?: string; createdAt: string; user: { fullName?: string; userName: string } }>>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/audit')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLogs(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Action</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Entity</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">User</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Details</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-border/50">
                      <td className="px-3 py-2.5"><Badge className={`border-0 text-[10px] ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' : log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' : log.action === 'UPDATE' ? 'bg-navy-100 text-navy-700' : 'bg-gray-100 text-gray-700'}`}>{log.action}</Badge></td>
                      <td className="px-3 py-2.5">{log.entity}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{log.user.fullName || log.user.userName}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{log.newValue || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// MAIN REPORTS PAGE
export function ReportsPage() {
  const { activeSubPage, setActiveSubPage } = useNavigationStore()
  const tabValue = ['sales-report', 'inventory-report', 'financial-report', 'audit-log'].includes(activeSubPage) ? activeSubPage : 'sales-report'

  return (
    <Tabs value={tabValue} onValueChange={v => setActiveSubPage(v)}>
      <TabsList className="bg-navy-100 dark:bg-navy-800">
        <TabsTrigger value="sales-report" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><FileBarChart className="h-4 w-4 mr-1" /> Sales</TabsTrigger>
        <TabsTrigger value="inventory-report" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><FileSpreadsheet className="h-4 w-4 mr-1" /> Inventory</TabsTrigger>
        <TabsTrigger value="financial-report" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><TrendingUp className="h-4 w-4 mr-1" /> Financial</TabsTrigger>
        <TabsTrigger value="audit-log" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><ScrollText className="h-4 w-4 mr-1" /> Audit Log</TabsTrigger>
      </TabsList>
      <TabsContent value="sales-report"><SalesReportTab /></TabsContent>
      <TabsContent value="inventory-report"><InventoryReportTab /></TabsContent>
      <TabsContent value="financial-report"><FinancialReportTab /></TabsContent>
      <TabsContent value="audit-log"><AuditLogTab /></TabsContent>
    </Tabs>
  )
}
