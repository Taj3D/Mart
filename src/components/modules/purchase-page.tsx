'use client'

import * as React from 'react'
import {
  Truck, ClipboardCheck, Building2, Banknote, Boxes, Search, Plus,
  ChevronLeft, ChevronRight, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { useNavigationStore } from '@/lib/stores/navigation-store'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function PurchaseStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    Sent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return <Badge className={`${styles[status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
}

// PURCHASE ORDERS TAB
function PurchaseOrdersTab() {
  const [purchases, setPurchases] = React.useState<Array<{
    id: string; purchaseNumber: string; supplier: { name: string }; totalAmount: number; status: string; paymentStatus: string; purchaseDate: string
    items: Array<{ id: string; product: { name: string }; quantity: number; unitCost: number; totalAmount: number }>
  }>>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [selectedPurchase, setSelectedPurchase] = React.useState<typeof purchases[0] | null>(null)

  React.useEffect(() => {
    setLoading(true)
    const params = search ? `?search=${search}` : ''
    fetch(`/api/purchases${params}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPurchases(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search purchase orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">PO #</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Supplier</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Amount</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Status</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Payment</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">Date</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length > 0 ? purchases.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                      <td className="px-3 py-2.5 font-medium text-navy-700 dark:text-navy-300">{p.purchaseNumber}</td>
                      <td className="px-3 py-2.5">{p.supplier.name}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-3 py-2.5 text-center"><PurchaseStatusBadge status={p.status} /></td>
                      <td className="px-3 py-2.5 text-center"><Badge className={`border-0 text-[10px] ${p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : p.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{p.paymentStatus}</Badge></td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground text-xs">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-center"><Button variant="ghost" size="xs" onClick={() => setSelectedPurchase(p)}><Eye className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  )) : <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No purchase orders found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedPurchase && (
            <>
              <DialogHeader>
                <DialogTitle>Purchase {selectedPurchase.purchaseNumber}</DialogTitle>
                <DialogDescription>Supplier: {selectedPurchase.supplier.name} | {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div><p className="text-xs text-muted-foreground">Status</p><PurchaseStatusBadge status={selectedPurchase.status} /></div>
                  <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-navy-700 dark:text-navy-300">{formatCurrency(selectedPurchase.totalAmount)}</p></div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted"><th className="px-3 py-2 text-left text-xs">Product</th><th className="px-3 py-2 text-right text-xs">Qty</th><th className="px-3 py-2 text-right text-xs">Unit Cost</th><th className="px-3 py-2 text-right text-xs">Total</th></tr></thead>
                    <tbody>{selectedPurchase.items.map(item => (<tr key={item.id} className="border-t"><td className="px-3 py-2">{item.product.name}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.unitCost)}</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalAmount)}</td></tr>))}</tbody>
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

// SUPPLIERS TAB
function SuppliersTab() {
  const [suppliers, setSuppliers] = React.useState<Array<{ id: string; code: string; name: string; contactPerson?: string; phone?: string; email?: string; city?: string; paymentTerms: string; currentBalance: number; _count?: { purchases: number } }>>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    fetch('/api/suppliers')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSuppliers(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <Card key={s.id} className="border border-border/60 hover:border-navy-300 dark:hover:border-navy-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                    <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.code}</p></div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px]">{s._count?.purchases || 0} POs</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                  {s.contactPerson && <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{s.contactPerson}</span></div>}
                  {s.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{s.phone}</span></div>}
                  <div><span className="text-muted-foreground">Terms:</span> <span className="font-medium">{s.paymentTerms}</span></div>
                  <div><span className="text-muted-foreground">Balance:</span> <span className="font-bold text-amber-600">{formatCurrency(s.currentBalance)}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// PLACEHOLDER TABS
function SupplierPaymentsTab() {
  return <Card className="border-0 shadow-md"><CardContent className="p-8 text-center"><Banknote className="h-12 w-12 text-navy-400 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">Supplier Payments</h3><p className="text-muted-foreground">Record payments to suppliers from Purchase Order detail view.</p></CardContent></Card>
}

function GoodsReceiptTab() {
  return <Card className="border-0 shadow-md"><CardContent className="p-8 text-center"><Boxes className="h-12 w-12 text-navy-400 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">Goods Receipt</h3><p className="text-muted-foreground">Record goods received against Purchase Orders.</p></CardContent></Card>
}

// MAIN PURCHASE PAGE
export function PurchasePage() {
  const { activeSubPage, setActiveSubPage } = useNavigationStore()
  const tabValue = ['purchase-orders', 'suppliers', 'supplier-payments', 'goods-receipt'].includes(activeSubPage) ? activeSubPage : 'purchase-orders'

  return (
    <Tabs value={tabValue} onValueChange={v => setActiveSubPage(v)}>
      <TabsList className="bg-navy-100 dark:bg-navy-800">
        <TabsTrigger value="purchase-orders" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><ClipboardCheck className="h-4 w-4 mr-1" /> Purchase Orders</TabsTrigger>
        <TabsTrigger value="suppliers" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Building2 className="h-4 w-4 mr-1" /> Suppliers</TabsTrigger>
        <TabsTrigger value="supplier-payments" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Banknote className="h-4 w-4 mr-1" /> Payments</TabsTrigger>
        <TabsTrigger value="goods-receipt" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Boxes className="h-4 w-4 mr-1" /> Goods Receipt</TabsTrigger>
      </TabsList>
      <TabsContent value="purchase-orders"><PurchaseOrdersTab /></TabsContent>
      <TabsContent value="suppliers"><SuppliersTab /></TabsContent>
      <TabsContent value="supplier-payments"><SupplierPaymentsTab /></TabsContent>
      <TabsContent value="goods-receipt"><GoodsReceiptTab /></TabsContent>
    </Tabs>
  )
}
