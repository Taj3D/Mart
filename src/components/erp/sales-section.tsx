'use client'

import * as React from 'react'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  RefreshCw,
  XCircle,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Truck,
  CheckCircle2,
  Ban,
  FileBadge,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { InlineHeader } from '@/components/ui/inline-header'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchableSelect } from '@/components/select'
import { DatePicker } from '@/components/pickers/date-picker'
import { toast } from 'sonner'
import { exportToCSV, exportToXLSX, createExportDataSet } from '@/lib/table-export'

// ================================================================
// TYPES
// ================================================================

interface SalesOrderItem {
  id: string
  productId: string
  product: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface SalesOrder {
  id: string
  orderNo: string
  customerId: string
  customer: string
  date: string
  deliveryDate: string | null
  itemCount: number
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  notes: string | null
  items: SalesOrderItem[]
  createdAt: string
}

interface Customer {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
  orderCount: number
}

interface Product {
  id: string
  name: string
  sku: string
  sellPrice: number
}

interface LineItem {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
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
  return `৳ ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    CONFIRMED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    SHIPPED: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return <Badge className={`${map[status] || ''} border-0 text-[10px] font-semibold`}>{status}</Badge>
}

function getNextStatusAction(status: string): { label: string; nextStatus: string; icon: React.ReactNode; className: string } | null {
  switch (status) {
    case 'PENDING':
      return { label: 'Confirm', nextStatus: 'CONFIRMED', icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />, className: 'bg-sky-600 hover:bg-sky-700 text-white' }
    case 'CONFIRMED':
      return { label: 'Ship', nextStatus: 'SHIPPED', icon: <Truck className="h-4 w-4 mr-1.5" />, className: 'bg-navy-600 hover:bg-navy-700 text-white' }
    case 'SHIPPED':
      return { label: 'Deliver', nextStatus: 'DELIVERED', icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />, className: 'bg-emerald-600 hover:bg-emerald-700 text-white' }
    default:
      return null
  }
}

// ================================================================
// CREATE SALE SHEET
// ================================================================

function CreateSaleSheet({
  open,
  onClose,
  customers,
  products,
  onSave,
}: {
  open: boolean
  onClose: () => void
  customers: Customer[]
  products: Product[]
  onSave: () => void
}) {
  const [customerId, setCustomerId] = React.useState<string | undefined>(undefined)
  const [orderDate, setOrderDate] = React.useState<Date | undefined>(new Date())
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined)
  const [notes, setNotes] = React.useState('')
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { productId: '', quantity: 1, unitPrice: 0, discount: 0 },
  ])
  const [taxRate, setTaxRate] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }])
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }
        if (field === 'productId') {
          const product = products.find((p) => p.id === value)
          if (product) {
            updated.unitPrice = product.sellPrice
          }
        }
        return updated
      })
    )
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      toast.error('At least one item is required')
      return
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const getLineTotal = (item: LineItem): number => {
    return Math.max(0, item.quantity * item.unitPrice - item.discount)
  }

  const subtotal = lineItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount

  const resetForm = () => {
    setCustomerId(undefined)
    setOrderDate(new Date())
    setDeliveryDate(undefined)
    setNotes('')
    setLineItems([{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }])
    setTaxRate(0)
  }

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error('Please select a customer')
      return
    }
    if (!orderDate) {
      toast.error('Please select an order date')
      return
    }
    const validItems = lineItems.filter((item) => item.productId)
    if (validItems.length === 0) {
      toast.error('Please add at least one product')
      return
    }
    const hasInvalidQty = validItems.some((item) => item.quantity <= 0)
    if (hasInvalidQty) {
      toast.error('Quantity must be greater than 0')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          orderDate: orderDate.toISOString(),
          deliveryDate: deliveryDate?.toISOString() || null,
          notes: notes || null,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          items: validItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: getLineTotal(item),
          })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create order')
      }

      toast.success('Sales order created successfully')
      resetForm()
      onSave()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create sales order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="sm:max-w-3xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold text-navy-700 dark:text-navy-300">
            Create Sales Order
          </SheetTitle>
          <SheetDescription>Add customer details and line items for the sale</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6 py-4">
            {/* Customer & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Customer <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect
                  options={customers.map((c) => ({ value: c.id, label: c.name }))}
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Select customer"
                  searchPlaceholder="Search customers..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Order Date <span className="text-rose-500">*</span>
                </Label>
                <DatePicker
                  value={orderDate}
                  onChange={setOrderDate}
                  placeholder="Select order date"
                  formatStr="dd/MM/yyyy"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Delivery Date</Label>
                <DatePicker
                  value={deliveryDate}
                  onChange={setDeliveryDate}
                  placeholder="Select delivery date (optional)"
                  formatStr="dd/MM/yyyy"
                  minDate={orderDate}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Notes</Label>
              <Textarea
                placeholder="Additional notes or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Line Items <span className="text-rose-500">*</span>
                </Label>
                <Button variant="outline" size="xs" onClick={addLineItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Discount (৳)</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1" />
              </div>

              {/* Line Item Rows */}
              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center rounded-lg border border-border/50 p-2 md:p-0 md:border-0"
                  >
                    <div className="md:col-span-4">
                      <Label className="md:hidden text-[10px] text-muted-foreground mb-1">Product</Label>
                      <SearchableSelect
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.sku}) — ৳${p.sellPrice.toLocaleString()}`,
                        }))}
                        value={item.productId}
                        onChange={(val) => updateLineItem(idx, 'productId', val || '')}
                        placeholder="Select product"
                        searchPlaceholder="Search products..."
                        size="sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-[10px] text-muted-foreground mb-1">Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-[10px] text-muted-foreground mb-1">Unit Price</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-[10px] text-muted-foreground mb-1">Discount (৳)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.discount}
                        onChange={(e) => updateLineItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Label className="md:hidden text-[10px] text-muted-foreground mb-1">Total</Label>
                      <span className="text-sm font-semibold text-navy-700 dark:text-navy-300">
                        {formatCurrency(getLineTotal(item))}
                      </span>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        onClick={() => removeLineItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg border bg-navy-50/50 dark:bg-navy-900/10 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-muted-foreground">Tax:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="h-7 w-16 text-xs text-right"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="font-medium min-w-[80px] text-right">{formatCurrency(taxAmount)}</span>
                </div>
              </div>
              <div className="border-t border-navy-200 dark:border-navy-700 pt-2 flex justify-between text-base font-bold">
                <span>Total:</span>
                <span className="text-navy-700 dark:text-navy-300">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-4">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Create Order
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ================================================================
// VIEW SALES ORDER DIALOG
// ================================================================

function ViewOrderDialog({
  order,
  open,
  onClose,
  onStatusChange,
  onInvoiceGenerated,
}: {
  order: SalesOrder | null
  open: boolean
  onClose: () => void
  onStatusChange: () => void
  onInvoiceGenerated: () => void
}) {
  const [updating, setUpdating] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [generatingInvoice, setGeneratingInvoice] = React.useState(false)
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = React.useState<string | null>(null)

  if (!order) return null

  const nextAction = getNextStatusAction(order.status)
  const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED'
  const canGenerateInvoice = order.status === 'DELIVERED'

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/sales/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to update status')
      }

      toast.success(`Order status updated to ${newStatus}`)
      onStatusChange()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelConfirm = async () => {
    setCancelOpen(false)
    await handleStatusUpdate('CANCELLED')
  }

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true)
    setGeneratedInvoiceNo(null)
    try {
      const invoiceNo = `INV-${Date.now()}`
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo,
          salesOrderId: order.id,
          customerId: order.customerId,
          invoiceDate: new Date().toISOString(),
          dueDate: null,
          subtotal: order.subtotal,
          taxRate: order.subtotal > 0 ? (order.taxAmount / order.subtotal) * 100 : 0,
          notes: `Auto-generated for ${order.orderNo}`,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate invoice')
      }

      const result = await res.json()
      const invNo = result.data?.invoiceNo || invoiceNo
      setGeneratedInvoiceNo(invNo)
      toast.success(`Invoice generated: ${invNo}`)
      onInvoiceGenerated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate invoice')
    } finally {
      setGeneratingInvoice(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader variant="navy">
            <DialogTitle className="flex items-center gap-2">
              <span>Order {order.orderNo}</span>
              {getStatusBadge(order.status)}
            </DialogTitle>
            <DialogDescription>{order.customer}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Order Header Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Order Date</span>
                <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Delivery Date</span>
                <p className="font-medium">
                  {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Items</span>
                <p className="font-medium">{order.itemCount}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">Total</span>
                <p className="font-bold text-navy-700 dark:text-navy-300">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="text-sm">
                <span className="text-xs text-muted-foreground">Notes:</span>
                <p className="mt-0.5 text-muted-foreground italic">{order.notes}</p>
              </div>
            )}

            {/* Line Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-navy-700 to-navy-600 px-3 py-2 grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wider text-white">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Discount</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="divide-y divide-border/50">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2 grid grid-cols-12 gap-2 text-sm hover:bg-navy-50/50 dark:hover:bg-navy-900/10 transition-colors"
                  >
                    <div className="col-span-4">
                      <p className="font-medium">{item.product}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                    <div className="col-span-2 text-right">
                      {item.discount > 0 ? formatCurrency(item.discount) : '—'}
                    </div>
                    <div className="col-span-2 text-right font-semibold text-navy-700 dark:text-navy-300">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="rounded-lg border bg-navy-50/50 dark:bg-navy-900/10 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="border-t border-navy-200 dark:border-navy-700 pt-1.5 flex justify-between font-bold text-base">
                <span>Total:</span>
                <span className="text-navy-700 dark:text-navy-300">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Generated Invoice Info */}
            {generatedInvoiceNo && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 flex items-center gap-2">
                <FileBadge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Invoice Generated</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {generatedInvoiceNo}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Workflow Buttons */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex flex-wrap gap-2 flex-1">
              {nextAction && (
                <Button
                  className={nextAction.className}
                  onClick={() => handleStatusUpdate(nextAction.nextStatus)}
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    nextAction.icon
                  )}
                  {nextAction.label}
                </Button>
              )}

              {canGenerateInvoice && !generatedInvoiceNo && (
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                  onClick={handleGenerateInvoice}
                  disabled={generatingInvoice}
                >
                  {generatingInvoice ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <FileBadge className="h-4 w-4 mr-1.5" />
                  )}
                  Generate Invoice
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  onClick={() => setCancelOpen(true)}
                  disabled={updating}
                >
                  <Ban className="h-4 w-4 mr-1.5" />
                  Cancel Order
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation AlertDialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sales Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel order <strong>{order.orderNo}</strong> for{' '}
              <strong>{order.customer}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleCancelConfirm}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ================================================================
// EXPORT HELPERS
// ================================================================

function buildExportDataSet(data: SalesOrder[]) {
  return createExportDataSet(
    ['Order No', 'Customer', 'Date', 'Items', 'Total (৳)', 'Status'],
    ['orderNo', 'customer', 'date', 'itemCount', 'totalAmount', 'status'],
    data.map((s) => ({
      orderNo: s.orderNo,
      customer: s.customer,
      date: new Date(s.date).toLocaleDateString(),
      itemCount: s.itemCount,
      totalAmount: s.totalAmount,
      status: s.status,
    }))
  )
}

async function doExportCSV(data: SalesOrder[]) {
  try {
    await exportToCSV(buildExportDataSet(data), { fileName: 'sales-orders' })
    toast.success('CSV exported successfully')
  } catch {
    toast.error('Failed to export CSV')
  }
}

async function doExportExcel(data: SalesOrder[]) {
  try {
    await exportToXLSX(buildExportDataSet(data), { fileName: 'sales-orders' })
    toast.success('Excel exported successfully')
  } catch {
    toast.error('Failed to export Excel')
  }
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function SalesSection() {
  const { data: sales, loading, error, refetch } = useApiData<SalesOrder[]>('/api/sales')
  const { data: customers } = useApiData<Customer[]>('/api/customers')
  const { data: products } = useApiData<Product[]>('/api/products')

  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewOrder, setViewOrder] = React.useState<SalesOrder | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')

  // ============================================================
  // Stats
  // ============================================================
  const todayStr = new Date().toDateString()
  const todaySales =
    sales
      ?.filter((s) => new Date(s.date).toDateString() === todayStr)
      .reduce((sum, s) => sum + s.totalAmount, 0) || 0

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthSales =
    sales?.filter((s) => new Date(s.date) >= monthStart).reduce((sum, s) => sum + s.totalAmount, 0) ||
    0

  const pendingOrders = sales?.filter((s) => s.status === 'PENDING').length || 0

  const totalRevenue =
    sales
      ?.filter((s) => s.status !== 'CANCELLED')
      .reduce((sum, s) => sum + s.totalAmount, 0) || 0

  // ============================================================
  // Filtered & Sorted Data
  // ============================================================
  const filteredSales = React.useMemo(() => {
    if (!sales) return []
    let result = [...sales]

    // Search filter by order no or customer name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.orderNo.toLowerCase().includes(term) || s.customer.toLowerCase().includes(term)
      )
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return result
  }, [sales, searchTerm])

  // ============================================================
  // Table Columns
  // ============================================================
  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'orderNo',
      header: 'Order No',
      cell: ({ row }) => (
        <span className="font-semibold text-navy-700 dark:text-navy-300">
          {row.getValue('orderNo')}
        </span>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('customer')}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.getValue('date') as string).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-center tabular-nums">{row.getValue('itemCount')}</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total (৳)',
      cell: ({ row }) => (
        <span className="font-semibold text-navy-700 dark:text-navy-300">
          {formatCurrency(row.getValue('totalAmount') as number)}
        </span>
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
          className="hover:bg-navy-100 dark:hover:bg-navy-900/30"
          onClick={() => setViewOrder(row.original)}
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> View
        </Button>
      ),
    },
  ]

  // ============================================================
  // Error State
  // ============================================================
  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load sales data</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* Header Bar */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <InlineHeader color="navy">Sales Orders</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all sales orders
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Input
              placeholder="Search order or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-56 pl-3 text-sm"
            />
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                <Download className="h-4 w-4 mr-1.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => doExportCSV(filteredSales)}
                disabled={!sales?.length}
              >
                <FileText className="h-4 w-4 mr-2" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => doExportExcel(filteredSales)}
                disabled={!sales?.length}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Sale Button */}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Sale
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Stats Cards */}
      {/* ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Today&apos;s Sales */}
          <Card className="shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2.5">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Today&apos;s Sales</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(todaySales)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="shadow-md border-l-4 border-l-navy-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-navy-100 dark:bg-navy-900/30 p-2.5">
                <TrendingUp className="h-6 w-6 text-navy-600 dark:text-navy-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">This Month</p>
                <p className="text-xl font-bold text-navy-700 dark:text-navy-300">
                  {formatCurrency(monthSales)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="shadow-md border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2.5">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending Orders</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                  {pendingOrders}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="shadow-md border-l-4 border-l-sky-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-sky-100 dark:bg-sky-900/30 p-2.5">
                <ShoppingCart className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-xl font-bold text-sky-700 dark:text-sky-300">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* Sales Orders DataTable */}
      {/* ======================================================== */}
      <DataTable
        columns={columns}
        data={filteredSales}
        searchKey="orderNo"
        searchPlaceholder="Search orders..."
        isLoading={loading}
        pageSize={10}
        exportConfig={{
          exportTypes: ['csv' as const, 'excel' as const],
          fileName: 'sales-orders',
          columnLabels: {
            orderNo: 'Order No',
            customer: 'Customer',
            date: 'Date',
            itemCount: 'Items',
            totalAmount: 'Total',
            status: 'Status',
          },
        }}
      />

      {/* ======================================================== */}
      {/* Create Sale Sheet */}
      {/* ======================================================== */}
      <CreateSaleSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        customers={customers || []}
        products={products || []}
        onSave={refetch}
      />

      {/* ======================================================== */}
      {/* View Order Dialog */}
      {/* ======================================================== */}
      <ViewOrderDialog
        order={viewOrder}
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        onStatusChange={refetch}
        onInvoiceGenerated={refetch}
      />
    </div>
  )
}
