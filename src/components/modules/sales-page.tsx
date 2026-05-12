'use client'

import * as React from 'react'
import {
  ShoppingCart, Receipt, CreditCard, Users, RotateCcw, Plus, Search,
  ChevronLeft, ChevronRight, Eye, FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useNavigationStore } from '@/lib/stores/navigation-store'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Processing: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    Confirmed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    Returned: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  }
  return <Badge className={`${styles[status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return <Badge className={`${styles[status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
}

// ORDERS TAB
function OrdersTab() {
  const [orders, setOrders] = React.useState<Array<{
    id: string; orderNumber: string; customer: { name: string }; totalAmount: number; status: string; paymentStatus: string; paymentMethod?: string; createdAt: string; items: Array<{ id: string; product: { name: string }; quantity: number; unitPrice: number; totalAmount: number }>
  }>>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [selectedOrder, setSelectedOrder] = React.useState<typeof orders[0] | null>(null)
  const pageSize = 10

  const fetchOrders = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/orders?${params}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) { setOrders(data.data || []); setTotal(data.pagination?.total || 0) }; setLoading(false) })
      .catch(() => setLoading(false))
  }, [page, search, statusFilter])

  React.useEffect(() => { fetchOrders() }, [fetchOrders])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === '_all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Order #</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Customer</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Amount</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Status</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Payment</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">Date</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map(o => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-navy-700 dark:text-navy-300">{o.orderNumber}</td>
                      <td className="px-3 py-2.5">{o.customer.name}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-3 py-2.5 text-center"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-3 py-2.5 text-center"><PaymentStatusBadge status={o.paymentStatus} /></td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-center"><Button variant="ghost" size="xs" onClick={() => setSelectedOrder(o)}><Eye className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  )) : <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No orders found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>Customer: {selectedOrder.customer.name} | {new Date(selectedOrder.createdAt).toLocaleDateString()}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div><p className="text-xs text-muted-foreground">Status</p><OrderStatusBadge status={selectedOrder.status} /></div>
                  <div><p className="text-xs text-muted-foreground">Payment</p><PaymentStatusBadge status={selectedOrder.paymentStatus} /></div>
                  {selectedOrder.paymentMethod && <div><p className="text-xs text-muted-foreground">Method</p><p className="text-sm font-medium">{selectedOrder.paymentMethod}</p></div>}
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted"><th className="px-3 py-2 text-left text-xs">Product</th><th className="px-3 py-2 text-right text-xs">Qty</th><th className="px-3 py-2 text-right text-xs">Price</th><th className="px-3 py-2 text-right text-xs">Total</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map(item => (
                        <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.product.name}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalAmount)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t bg-muted/50"><td colSpan={3} className="px-3 py-2 text-right font-bold">Total</td><td className="px-3 py-2 text-right font-bold text-navy-700 dark:text-navy-300">{formatCurrency(selectedOrder.totalAmount)}</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// CUSTOMERS TAB
function CustomersTab() {
  const [customers, setCustomers] = React.useState<Array<{ id: string; code: string; name: string; phone?: string; email?: string; city?: string; tier: string; creditLimit: number; currentBalance: number }>>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    setLoading(true)
    const params = search ? `?search=${search}` : ''
    fetch(`/api/customers${params}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setCustomers(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Code</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Name</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">Phone</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">City</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Tier</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                      <td className="px-3 py-2.5 font-mono text-xs text-navy-600 dark:text-navy-400">{c.code}</td>
                      <td className="px-3 py-2.5 font-medium">{c.name}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{c.phone || '—'}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{c.city || '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={`border-0 text-[10px] ${c.tier === 'Platinum' ? 'bg-violet-100 text-violet-700' : c.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : c.tier === 'Silver' ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-700'}`}>{c.tier}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">{formatCurrency(c.currentBalance)}</td>
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

// INVOICES TAB
function InvoicesTab() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-8 text-center">
        <FileText className="h-12 w-12 text-navy-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
        <p className="text-muted-foreground">Invoices are auto-generated from confirmed orders. View orders to manage invoices.</p>
      </CardContent>
    </Card>
  )
}

// PAYMENTS TAB
function PaymentsTab() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-8 text-center">
        <CreditCard className="h-12 w-12 text-navy-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payment Management</h3>
        <p className="text-muted-foreground">Track payments against orders. Payments can be recorded from the Order detail view.</p>
      </CardContent>
    </Card>
  )
}

// RETURNS TAB
function ReturnsTab() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-8 text-center">
        <RotateCcw className="h-12 w-12 text-navy-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Return Management</h3>
        <p className="text-muted-foreground">Process customer returns and refunds from the Order detail view.</p>
      </CardContent>
    </Card>
  )
}

// MAIN SALES PAGE
export function SalesPage() {
  const { activeSubPage, setActiveSubPage } = useNavigationStore()
  const tabValue = ['orders', 'invoices', 'payments', 'customers', 'returns'].includes(activeSubPage) ? activeSubPage : 'orders'

  return (
    <Tabs value={tabValue} onValueChange={v => setActiveSubPage(v)}>
      <TabsList className="bg-navy-100 dark:bg-navy-800">
        <TabsTrigger value="orders" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Receipt className="h-4 w-4 mr-1" /> Orders</TabsTrigger>
        <TabsTrigger value="invoices" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><FileText className="h-4 w-4 mr-1" /> Invoices</TabsTrigger>
        <TabsTrigger value="payments" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><CreditCard className="h-4 w-4 mr-1" /> Payments</TabsTrigger>
        <TabsTrigger value="customers" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Users className="h-4 w-4 mr-1" /> Customers</TabsTrigger>
        <TabsTrigger value="returns" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><RotateCcw className="h-4 w-4 mr-1" /> Returns</TabsTrigger>
      </TabsList>
      <TabsContent value="orders"><OrdersTab /></TabsContent>
      <TabsContent value="invoices"><InvoicesTab /></TabsContent>
      <TabsContent value="payments"><PaymentsTab /></TabsContent>
      <TabsContent value="customers"><CustomersTab /></TabsContent>
      <TabsContent value="returns"><ReturnsTab /></TabsContent>
    </Tabs>
  )
}
