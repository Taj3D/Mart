'use client'

import * as React from 'react'
import {
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  RefreshCw,
  Trash2,
  Search,
  FileText,
  PackageCheck,
  Ban,
  ChevronRight,
  Warehouse,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { InlineHeader } from '@/components/ui/inline-header'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/select'
import { DatePicker } from '@/components/pickers/date-picker'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

interface PurchaseOrderItem {
  id: string
  productId: string
  product: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

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
  items: PurchaseOrderItem[]
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

interface WarehouseInfo {
  id: string
  name: string
  code: string
}

interface LineItemDraft {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  lineTotal: number
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

const BDT = (amount: number): string => `৳${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    APPROVED: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    RECEIVED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  }
  return (
    <Badge variant="outline" className={`${map[status] || 'bg-gray-100 text-gray-700'} text-[10px] font-semibold uppercase tracking-wide`}>
      {status}
    </Badge>
  )
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return 'N/A'
  }
}

// ================================================================
// CREATE PURCHASE ORDER SHEET
// ================================================================

function CreatePurchaseSheet({
  open,
  onClose,
  suppliers,
  products,
  onSave,
}: {
  open: boolean
  onClose: () => void
  suppliers: Supplier[]
  products: Product[]
  onSave: () => void
}) {
  const [submitting, setSubmitting] = React.useState(false)
  const [supplierId, setSupplierId] = React.useState<string | undefined>(undefined)
  const [orderDate, setOrderDate] = React.useState<Date | undefined>(new Date())
  const [expectedDate, setExpectedDate] = React.useState<Date | undefined>(undefined)
  const [notes, setNotes] = React.useState('')
  const [lineItems, setLineItems] = React.useState<LineItemDraft[]>([])

  const resetForm = React.useCallback(() => {
    setSupplierId(undefined)
    setOrderDate(new Date())
    setExpectedDate(undefined)
    setNotes('')
    setLineItems([])
    setSubmitting(false)
  }, [])

  const handleClose = React.useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const addLineItem = () => {
    setLineItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, discount: 0, lineTotal: 0 }])
  }

  const updateLineItem = (index: number, field: keyof LineItemDraft, value: string | number) => {
    setLineItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }

        if (field === 'productId') {
          const product = products.find(p => p.id === value)
          if (product) {
            updated.unitPrice = product.costPrice
            updated.lineTotal = Math.max(0, updated.quantity * updated.unitPrice - updated.discount)
          }
        }
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
          updated.lineTotal = Math.max(0, updated.quantity * updated.unitPrice - updated.discount)
        }

        return updated
      })
    )
  }

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const taxRate = 0.15
  const taxAmount = subtotal * taxRate
  const totalAmount = subtotal + taxAmount

  const handleSubmit = async () => {
    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }
    if (!orderDate) {
      toast.error('Please select an order date')
      return
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }
    const hasEmptyProduct = lineItems.some(item => !item.productId)
    if (hasEmptyProduct) {
      toast.error('Please select a product for all line items')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          orderDate: orderDate.toISOString(),
          expectedDate: expectedDate ? expectedDate.toISOString() : null,
          notes: notes.trim() || null,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          items: lineItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: item.lineTotal,
          })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create purchase order')
      }

      toast.success('Purchase order created successfully')
      onSave()
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="sm:max-w-3xl w-full overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-xl font-bold text-navy-700 dark:text-navy-300 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Create Purchase Order
          </SheetTitle>
          <SheetDescription>Add supplier details and line items for the purchase order</SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-6 space-y-6">
          {/* Supplier & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Supplier <span className="text-rose-500">*</span>
              </Label>
              <SearchableSelect
                options={suppliers.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                value={supplierId}
                onChange={setSupplierId}
                placeholder="Select supplier..."
                searchPlaceholder="Search suppliers..."
                emptyMessage="No supplier found."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Order Date <span className="text-rose-500">*</span>
              </Label>
              <DatePicker
                value={orderDate}
                onChange={setOrderDate}
                placeholder="Select order date"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Expected Delivery Date
              </Label>
              <DatePicker
                value={expectedDate}
                onChange={setExpectedDate}
                placeholder="Select expected date"
                minDate={orderDate}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Notes</Label>
            <Textarea
              placeholder="Additional notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wide">
                Line Items
              </Label>
              <Button variant="outline" size="sm" onClick={addLineItem} className="border-navy-300 text-navy-700 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-900/30">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </Button>
            </div>

            {lineItems.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-lg py-10 text-center">
                <PackageCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No items added yet. Click &quot;Add Item&quot; to begin.</p>
              </div>
            )}

            {lineItems.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-card space-y-3 relative">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Item #{idx + 1}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 -mt-1 -mr-1"
                    onClick={() => removeLineItem(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Product Select */}
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Product</Label>
                    <SearchableSelect
                      options={products.map(p => ({
                        value: p.id,
                        label: `${p.name} — ${p.sku} (৳${p.costPrice.toFixed(2)})`,
                      }))}
                      value={item.productId || undefined}
                      onChange={(val) => updateLineItem(idx, 'productId', val || '')}
                      placeholder="Select product..."
                      searchPlaceholder="Search products..."
                      emptyMessage="No product found."
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Unit Price (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Discount (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.discount}
                      onChange={(e) => updateLineItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Line Total</Label>
                    <div className="h-9 px-3 rounded-md border bg-muted/50 flex items-center text-sm font-bold text-navy-700 dark:text-navy-300">
                      {BDT(item.lineTotal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {lineItems.length > 0 && (
            <div className="border rounded-lg p-4 bg-navy-50/50 dark:bg-navy-900/20 space-y-2">
              <p className="text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wide mb-2">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{BDT(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (15%):</span>
                <span className="font-medium">{BDT(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span className="text-navy-700 dark:text-navy-300">Total:</span>
                <span className="text-navy-700 dark:text-navy-300">{BDT(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-navy-700 hover:bg-navy-800 text-white min-w-[140px]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-1" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ================================================================
// GOODS RECEIVED NOTE (GRN) SECTION
// ================================================================

function GoodsReceivedNote({ order, warehouse }: { order: PurchaseOrder; warehouse: WarehouseInfo | null }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
            Goods Received Note
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">GRN Reference:</span>
            <p className="font-semibold">GRN-{order.orderNo.replace('PO-', '')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Received Date:</span>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Supplier:</span>
            <p className="font-semibold">{order.supplier}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Warehouse className="h-3 w-3" /> Warehouse:
            </span>
            <p className="font-semibold">{warehouse?.name || 'Main Warehouse'}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Items Received</p>
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.product}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.sku}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Qty: <span className="font-semibold text-foreground">{item.quantity}</span></span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Received</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ================================================================
// VIEW PURCHASE ORDER DIALOG
// ================================================================

function ViewPurchaseDialog({
  order,
  open,
  onClose,
  onStatusChange,
  warehouse,
}: {
  order: PurchaseOrder | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, newStatus: string) => Promise<void>
  warehouse: WarehouseInfo | null
}) {
  const [updating, setUpdating] = React.useState(false)

  if (!order) return null

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      await onStatusChange(order.id, newStatus)
      if (newStatus === 'RECEIVED') {
        toast.success('Stock updated! Items added to inventory.')
      } else if (newStatus === 'APPROVED') {
        toast.success('Purchase order approved')
      } else if (newStatus === 'CANCELLED') {
        toast.success('Purchase order cancelled')
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader variant="navy">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg">{order.orderNo}</DialogTitle>
            {getStatusBadge(order.status)}
          </div>
          <DialogDescription>{order.supplier}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* PO Header Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Order Date</span>
              <p className="text-sm font-semibold">{formatDate(order.date)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Expected Date</span>
              <p className="text-sm font-semibold">{formatDate(order.expectedDate)}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Items</span>
              <p className="text-sm font-semibold">{order.items.length}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</span>
              <p className="text-sm font-bold text-navy-700 dark:text-navy-300">{BDT(order.totalAmount)}</p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-muted/50 rounded-md p-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Notes</span>
              <p className="text-sm mt-0.5">{order.notes}</p>
            </div>
          )}

          <Separator />

          {/* Line Items Table */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Order Items</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-700 text-white text-xs uppercase tracking-wider">
                    <th className="text-left px-3 py-2 font-semibold">Product</th>
                    <th className="text-right px-3 py-2 font-semibold">Qty</th>
                    <th className="text-right px-3 py-2 font-semibold">Unit Price</th>
                    <th className="text-right px-3 py-2 font-semibold">Discount</th>
                    <th className="text-right px-3 py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className={`border-t border-border/50 ${idx % 2 === 1 ? 'bg-muted/30' : ''}`}>
                      <td className="px-3 py-2">
                        <div>
                          <span className="font-medium">{item.product}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">{item.sku}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-2 font-medium">{item.quantity}</td>
                      <td className="text-right px-3 py-2">{BDT(item.unitPrice)}</td>
                      <td className="text-right px-3 py-2 text-rose-600 dark:text-rose-400">
                        {item.discount > 0 ? BDT(item.discount) : '—'}
                      </td>
                      <td className="text-right px-3 py-2 font-semibold">{BDT(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{BDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">{BDT(order.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span className="text-navy-700 dark:text-navy-300">Total:</span>
                <span className="text-navy-700 dark:text-navy-300">{BDT(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* GRN - Shown when status is RECEIVED */}
          {order.status === 'RECEIVED' && (
            <>
              <Separator />
              <GoodsReceivedNote order={order} warehouse={warehouse} />
            </>
          )}

          {/* Status Workflow */}
          {order.status !== 'CANCELLED' && order.status !== 'RECEIVED' && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <Button
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                      size="sm"
                      onClick={() => handleStatusUpdate('APPROVED')}
                      disabled={updating}
                    >
                      {updating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      )}
                      Approve
                    </Button>
                  )}
                  {order.status === 'APPROVED' && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                      onClick={() => handleStatusUpdate('RECEIVED')}
                      disabled={updating}
                    >
                      {updating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <PackageCheck className="h-4 w-4 mr-1.5" />
                      )}
                      Mark Received
                    </Button>
                  )}
                  {order.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={updating}
                    >
                      {updating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                      ) : (
                        <Ban className="h-4 w-4 mr-1.5" />
                      )}
                      Cancel Order
                    </Button>
                  )}
                </div>
                {/* Status Flow Indicator */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                  <span className={order.status === 'PENDING' ? 'text-amber-600 font-bold' : ''}>PENDING</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className={order.status === 'APPROVED' ? 'text-sky-600 font-bold' : ''}>APPROVED</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className={order.status === 'RECEIVED' ? 'text-emerald-600 font-bold' : ''}>RECEIVED</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
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
  const { data: warehouses } = useApiData<WarehouseInfo[]>('/api/warehouses')

  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewOrder, setViewOrder] = React.useState<PurchaseOrder | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

  const defaultWarehouse = warehouses && warehouses.length > 0 ? warehouses[0] : null

  // Stats
  const totalOrders = purchases?.length || 0
  const pendingOrders = purchases?.filter(p => p.status === 'PENDING').length || 0
  const approvedOrders = purchases?.filter(p => p.status === 'APPROVED').length || 0
  const totalSpent = purchases?.filter(p => p.status !== 'CANCELLED').reduce((sum, p) => sum + p.totalAmount, 0) || 0

  // Filter purchases by search
  const filteredPurchases = React.useMemo(() => {
    if (!purchases) return []
    if (!searchQuery.trim()) return purchases

    const q = searchQuery.toLowerCase()
    return purchases.filter(
      p =>
        p.orderNo.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    )
  }, [purchases, searchQuery])

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/purchases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Failed to update status')
    }

    refetch()
  }

  // Table columns
  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'orderNo',
      header: 'PO No',
      cell: ({ row }) => (
        <span className="font-semibold text-navy-700 dark:text-navy-300">{row.getValue('orderNo')}</span>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('supplier')}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Order Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.getValue('date') as string)}</span>
      ),
    },
    {
      accessorKey: 'expectedDate',
      header: 'Expected Date',
      cell: ({ row }) => {
        const val = row.getValue('expectedDate') as string | null
        return (
          <span className={`text-sm ${!val ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
            {formatDate(val)}
          </span>
        )
      },
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue('itemCount')}</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total (৳)',
      cell: ({ row }) => (
        <span className="text-sm font-semibold">{BDT(row.getValue('totalAmount') as number)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status') as string),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setViewOrder(row.original)}
          className="text-navy-600 hover:text-navy-800 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-900/30"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
      ),
    },
  ]

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="h-14 w-14 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Failed to Load Data</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={refetch} className="border-navy-300 text-navy-700 hover:bg-navy-50">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <InlineHeader color="navy">Purchase Orders</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Manage procurement and supplier purchase orders</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            className="bg-navy-700 hover:bg-navy-800 text-white shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Purchase
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="shadow-md border-l-4 border-l-navy-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-navy-100 dark:bg-navy-900/40 flex items-center justify-center">
                <Truck className="h-5 w-5 text-navy-600 dark:text-navy-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-navy-700 dark:text-navy-300">{totalOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-sky-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Approved</p>
                <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{approvedOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{BDT(totalSpent)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Orders DataTable */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        searchKey="orderNo"
        searchPlaceholder="Search purchase orders..."
        isLoading={loading}
        pageSize={10}
        showRefresh
        onRefresh={refetch}
        striped
        exportConfig={{
          exportTypes: ['csv' as const, 'excel' as const],
          fileName: 'purchase-orders-report',
          columnLabels: {
            orderNo: 'PO No',
            supplier: 'Supplier',
            date: 'Order Date',
            expectedDate: 'Expected Date',
            itemCount: 'Items',
            totalAmount: 'Total (৳)',
            status: 'Status',
          },
        }}
      />

      {/* Create Purchase Order Sheet */}
      <CreatePurchaseSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        suppliers={suppliers || []}
        products={products || []}
        onSave={refetch}
      />

      {/* View Purchase Order Dialog */}
      <ViewPurchaseDialog
        order={viewOrder}
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        onStatusChange={handleStatusChange}
        warehouse={defaultWarehouse}
      />
    </div>
  )
}
