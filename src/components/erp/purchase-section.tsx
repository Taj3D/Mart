'use client'

import * as React from 'react'
import {
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  RefreshCw,
  XCircle,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { InlineHeader } from '@/components/ui/inline-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/select'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

interface PurchaseOrder {
  id: string
  orderNo: string
  supplierId: string
  supplier: string
  date: string
  expectedDate: string | null
  itemCount: number
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  notes: string | null
  items: Array<{ id: string; productId: string; product: string; sku: string; quantity: number; unitPrice: number; discount: number; total: number }>
  createdAt: string
}

interface Supplier {
  id: string
  code: string
  name: string
  email: string | null
  orderCount: number
}

interface Product {
  id: string
  name: string
  sku: string
  costPrice: number
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

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    APPROVED: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    RECEIVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return <Badge className={`${map[status] || ''} border-0 text-[10px]`}>{status}</Badge>
}

// ================================================================
// CREATE PURCHASE DIALOG
// ================================================================

function CreatePurchaseDialog({ open, onClose, suppliers, products, onSave }: {
  open: boolean; onClose: () => void; suppliers: Supplier[]; products: Product[]; onSave: () => void
}) {
  const [supplierId, setSupplierId] = React.useState('')
  const [lineItems, setLineItems] = React.useState<Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number }>>([])

  const addLineItem = () => setLineItems(prev => [...prev, { productId: '', quantity: 10, unitPrice: 0, totalPrice: 0 }])

  const updateLineItem = (index: number, field: string, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'productId') {
        const product = products.find(p => p.id === value)
        if (product) { updated.unitPrice = product.costPrice; updated.totalPrice = product.costPrice * updated.quantity }
      }
      if (field === 'quantity' || field === 'unitPrice') updated.totalPrice = updated.quantity * updated.unitPrice
      return updated
    }))
  }

  const removeLineItem = (index: number) => setLineItems(prev => prev.filter((_, i) => i !== index))

  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * 0.1
  const totalAmount = subtotal + taxAmount

  const handleSubmit = async () => {
    if (!supplierId || lineItems.length === 0) { toast.error('Supplier and items required'); return }
    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          items: lineItems.map(item => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice })),
        }),
      })
      toast.success('Purchase order created')
      onSave()
      onClose()
      setSupplierId('')
      setLineItems([])
    } catch { toast.error('Failed to create purchase order') }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader variant="navy">
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>Select supplier and add items</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Supplier</Label>
            <SearchableSelect options={suppliers.map(s => ({ value: s.id, label: s.name }))} value={supplierId} onValueChange={setSupplierId} placeholder="Select supplier" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Line Items</Label>
              <Button variant="outline" size="xs" onClick={addLineItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5"><SearchableSelect options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))} value={item.productId} onValueChange={val => updateLineItem(idx, 'productId', val)} placeholder="Select product" /></div>
                <div className="col-span-2"><Input type="number" min={1} value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', parseInt(e.target.value) || 0)} /></div>
                <div className="col-span-2"><Input type="number" value={item.unitPrice} onChange={e => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                <div className="col-span-2 text-sm font-medium">{formatCurrency(item.totalPrice)}</div>
                <div className="col-span-1"><Button variant="ghost" size="xs" className="text-rose-600" onClick={() => removeLineItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax (10%):</span><span>{formatCurrency(taxAmount)}</span></div>
            <div className="flex justify-between font-bold"><span>Total:</span><span className="text-navy-700 dark:text-navy-300">{formatCurrency(totalAmount)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSubmit}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// VIEW ORDER DIALOG
// ================================================================

function ViewPurchaseDialog({ order, open, onClose }: { order: PurchaseOrder | null; open: boolean; onClose: () => void }) {
  if (!order) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>{order.orderNo}</DialogTitle>
          <DialogDescription>{order.supplier} — {getStatusBadge(order.status)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Order Date:</span><p className="font-medium">{new Date(order.date).toLocaleDateString()}</p></div>
            <div><span className="text-muted-foreground">Supplier:</span><p className="font-medium">{order.supplier}</p></div>
            <div><span className="text-muted-foreground">Expected:</span><p className="font-medium">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'N/A'}</p></div>
            <div><span className="text-muted-foreground">Total:</span><p className="font-bold text-navy-700 dark:text-navy-300">{formatCurrency(order.totalAmount)}</p></div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Order Items</p>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50">
                <div><span className="font-medium">{item.product}</span> <span className="text-muted-foreground text-xs">×{item.quantity}</span></div>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function PurchaseSection() {
  const { data: purchases, loading, error, refetch } = useApiData<PurchaseOrder[]>('/api/purchases')
  const { data: suppliers } = useApiData<Supplier[]>('/api/suppliers')
  const { data: products } = useApiData<Product[]>('/api/products')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewOrder, setViewOrder] = React.useState<PurchaseOrder | null>(null)

  const pendingOrders = purchases?.filter(p => p.status === 'PENDING').length || 0
  const approvedOrders = purchases?.filter(p => p.status === 'APPROVED').length || 0
  const totalSpent = purchases?.filter(p => p.status !== 'CANCELLED').reduce((sum, p) => sum + p.totalAmount, 0) || 0

  const columns: ColumnDef<PurchaseOrder>[] = [
    { accessorKey: 'orderNo', header: 'Order No', cell: ({ row }) => <span className="font-medium text-navy-700 dark:text-navy-300">{row.getValue('orderNo')}</span> },
    { accessorKey: 'supplier', header: 'Supplier' },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => new Date(row.getValue('date') as string).toLocaleDateString() },
    { accessorKey: 'itemCount', header: 'Items' },
    { accessorKey: 'totalAmount', header: 'Total', cell: ({ row }) => formatCurrency(row.getValue('totalAmount') as number) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => getStatusBadge(row.getValue('status') as string) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <Button variant="ghost" size="xs" onClick={() => setViewOrder(row.original)}><Eye className="h-3.5 w-3.5" /></Button> },
  ]

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load purchase data</p>
        <Button variant="outline" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Purchase Orders</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Manage procurement and supplier orders</p>
        </div>
        <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />New Purchase
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="shadow-md border-l-4 border-l-navy-500"><CardContent className="p-4 flex items-center gap-3"><Truck className="h-8 w-8 text-navy-600" /><div><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-xl font-bold text-navy-700 dark:text-navy-300">{purchases?.length || 0}</p></div></CardContent></Card>
          <Card className="shadow-md border-l-4 border-l-amber-500"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-amber-600" /><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-amber-700 dark:text-amber-300">{pendingOrders}</p></div></CardContent></Card>
          <Card className="shadow-md border-l-4 border-l-emerald-500"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-emerald-600" /><div><p className="text-xs text-muted-foreground">Approved</p><p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{approvedOrders}</p></div></CardContent></Card>
          <Card className="shadow-md border-l-4 border-l-rose-500"><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-8 w-8 text-rose-600" /><div><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-xl font-bold text-rose-700 dark:text-rose-300">{formatCurrency(totalSpent)}</p></div></CardContent></Card>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={purchases || []}
        searchKey="orderNo"
        searchPlaceholder="Search purchase orders..."
        isLoading={loading}
        pageSize={10}
        exportConfig={{
          exportTypes: ['csv' as const, 'excel' as const],
          fileName: 'purchase-report',
          columnLabels: { orderNo: 'Order No', supplier: 'Supplier', date: 'Date', itemCount: 'Items', totalAmount: 'Total', status: 'Status' },
        }}
      />

      {/* Dialogs */}
      <CreatePurchaseDialog open={createOpen} onClose={() => setCreateOpen(false)} suppliers={suppliers || []} products={products || []} onSave={refetch} />
      <ViewPurchaseDialog order={viewOrder} open={!!viewOrder} onClose={() => setViewOrder(null)} />
    </div>
  )
}
