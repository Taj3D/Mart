'use client'

import * as React from 'react'
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ArrowRightLeft,
  Plus,
  FileDown,
  Warehouse,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { InlineHeader } from '@/components/ui/inline-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SearchableSelect } from '@/components/select/searchable-select'
import { DateRangePicker } from '@/components/pickers/date-range-picker'
import { DataTable } from '@/components/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { DateRange } from 'react-day-picker'

// ================================================================
// TYPES
// ================================================================

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  category: string
  categoryId: string | null
  unit: string
  costPrice: number
  sellPrice: number
  currentStock: number
  minStock: number
  maxStock: number
  image: string | null
  isActive: boolean
  status: string
  createdAt?: string
  updatedAt?: string
}

interface Category {
  id: string
  name: string
  description: string | null
  parentId?: string | null
  productCount: number
  children?: { id: string; name: string; productCount: number }[]
}

interface WarehouseItem {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  managerName: string | null
  isActive: boolean
}

interface StockMovementProduct {
  id: string
  name: string
  sku: string
  unit?: string
}

interface StockMovementWarehouse {
  id: string
  name: string
  code: string
}

interface StockMovementUser {
  id: string
  userName: string
  fullName: string
}

interface StockMovement {
  id: string
  productId: string
  warehouseId: string
  type: 'IN' | 'OUT' | 'TRANSFER'
  quantity: number
  referenceNo: string | null
  notes: string | null
  movedBy: string | null
  createdAt: string
  updatedAt: string
  product: StockMovementProduct
  warehouse: StockMovementWarehouse
  user: StockMovementUser | null
}

interface StockMovementsResponse {
  data: StockMovement[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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
  return '৳ ' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStockStatus(stock: number, minStock: number): string {
  if (stock === 0) return 'Out of Stock'
  if (stock <= minStock) return 'Low Stock'
  return 'In Stock'
}

function getStockBadge(status: string) {
  const config: Record<string, { bg: string; text: string }> = {
    'In Stock': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    'Low Stock': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    'Out of Stock': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  }
  const c = config[status] || config['In Stock']
  return (
    <Badge className={`${c.bg} ${c.text} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
      {status}
    </Badge>
  )
}

function getMovementTypeBadge(type: string) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'IN': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: <ArrowDown className="h-3 w-3" /> },
    'OUT': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', icon: <ArrowUp className="h-3 w-3" /> },
    'TRANSFER': { bg: 'bg-navy-100 dark:bg-navy-900/30', text: 'text-navy-700 dark:text-navy-300', icon: <ArrowRightLeft className="h-3 w-3" /> },
  }
  const c = config[type] || config['IN']
  return (
    <Badge className={`${c.bg} ${c.text} border-0 text-[10px] font-semibold px-1.5 py-0.5 flex items-center gap-1`}>
      {c.icon}
      {type}
    </Badge>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ================================================================
// STOCK ADJUSTMENT DIALOG (Tab 1)
// ================================================================

function StockAdjustmentDialog({
  open,
  onClose,
  products,
  warehouses,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  warehouses: WarehouseItem[]
  onSuccess: () => void
}) {
  const [form, setForm] = React.useState({
    productId: '',
    type: 'IN' as 'IN' | 'OUT' | 'TRANSFER',
    quantity: 0,
    warehouseId: '',
    referenceNo: '',
    notes: '',
  })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm({
        productId: '',
        type: 'IN',
        quantity: 0,
        warehouseId: '',
        referenceNo: '',
        notes: '',
      })
    }
  }, [open])

  const selectedProduct = React.useMemo(
    () => products.find(p => p.id === form.productId),
    [products, form.productId]
  )

  const handleSubmit = async () => {
    if (!form.productId) {
      toast.error('Please select a product')
      return
    }
    if (!form.warehouseId) {
      toast.error('Please select a warehouse')
      return
    }
    if (form.quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }
    if (form.type === 'OUT' && selectedProduct && selectedProduct.currentStock < form.quantity) {
      toast.error(`Insufficient stock. Available: ${selectedProduct.currentStock}`)
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          warehouseId: form.warehouseId,
          type: form.type,
          quantity: form.quantity,
          referenceNo: form.referenceNo || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to adjust stock')
      }
      toast.success('Stock adjusted successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to adjust stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>Adjust stock levels by adding, removing, or transferring inventory</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
          {/* Product Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Product <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              options={products.map(p => ({
                value: p.id,
                label: `${p.name} (${p.sku})`,
              }))}
              value={form.productId || undefined}
              onChange={val => setForm(f => ({ ...f, productId: val || '' }))}
              placeholder="Search and select product..."
              searchPlaceholder="Search products..."
              emptyMessage="No products found"
              clearable
            />
            {selectedProduct && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-navy-50 dark:bg-navy-900/20 rounded-md px-3 py-2">
                <span>Current Stock: <strong className="text-navy-700 dark:text-navy-300">{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
                <span className="text-navy-300 dark:text-navy-600">|</span>
                <span>Min: {selectedProduct.minStock}</span>
                <span className="text-navy-300 dark:text-navy-600">|</span>
                <span>Max: {selectedProduct.maxStock}</span>
              </div>
            )}
          </div>

          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Adjustment Type <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['IN', 'OUT', 'TRANSFER'] as const).map(t => {
                const icons = { IN: ArrowDown, OUT: ArrowUp, TRANSFER: ArrowRightLeft }
                const colors = {
                  IN: form.type === 'IN' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
                  OUT: form.type === 'OUT' ? 'bg-rose-600 text-white border-rose-600' : 'border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30',
                  TRANSFER: form.type === 'TRANSFER' ? 'bg-navy-600 text-white border-navy-600' : 'border-navy-300 dark:border-navy-700 text-navy-700 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-900/30',
                }
                const Icon = icons[t]
                return (
                  <button
                    key={t}
                    type="button"
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-xs font-semibold transition-all ${colors[t]}`}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t === 'IN' ? 'Stock In' : t === 'OUT' ? 'Stock Out' : 'Transfer'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Quantity <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={form.quantity || ''}
              onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
              placeholder="Enter quantity"
            />
          </div>

          {/* Warehouse */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Warehouse <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              options={warehouses.map(w => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
              value={form.warehouseId || undefined}
              onChange={val => setForm(f => ({ ...f, warehouseId: val || '' }))}
              placeholder="Select warehouse..."
              searchPlaceholder="Search warehouses..."
              emptyMessage="No warehouses found"
              clearable
            />
          </div>

          {/* Reference No */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Reference No <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={form.referenceNo}
              onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))}
              placeholder="e.g. PO-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add notes for this adjustment..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            className="bg-navy-600 hover:bg-navy-700 text-white min-w-[120px]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Adjusting...
              </span>
            ) : (
              'Adjust Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// QUICK STOCK IN DIALOG (Tab 2)
// ================================================================

function QuickStockInDialog({
  open,
  onClose,
  products,
  warehouses,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  warehouses: WarehouseItem[]
  onSuccess: () => void
}) {
  const [form, setForm] = React.useState({
    productId: '',
    quantity: 0,
    warehouseId: '',
    referenceNo: '',
    notes: '',
  })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm({
        productId: '',
        quantity: 0,
        warehouseId: '',
        referenceNo: '',
        notes: '',
      })
    }
  }, [open])

  const selectedProduct = React.useMemo(
    () => products.find(p => p.id === form.productId),
    [products, form.productId]
  )

  const handleSubmit = async () => {
    if (!form.productId) {
      toast.error('Please select a product')
      return
    }
    if (!form.warehouseId) {
      toast.error('Please select a warehouse')
      return
    }
    if (form.quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          warehouseId: form.warehouseId,
          type: 'IN',
          quantity: form.quantity,
          referenceNo: form.referenceNo || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to add stock')
      }
      toast.success('Stock added successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>Quick Stock In</DialogTitle>
          <DialogDescription>Quickly add stock without creating a purchase order</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
          {/* Product */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Product <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              options={products.map(p => ({
                value: p.id,
                label: `${p.name} (${p.sku})`,
              }))}
              value={form.productId || undefined}
              onChange={val => setForm(f => ({ ...f, productId: val || '' }))}
              placeholder="Search and select product..."
              searchPlaceholder="Search products..."
              emptyMessage="No products found"
              clearable
            />
            {selectedProduct && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-emerald-50 dark:bg-emerald-900/20 rounded-md px-3 py-2">
                <span>Current Stock: <strong className="text-navy-700 dark:text-navy-300">{selectedProduct.currentStock} {selectedProduct.unit}</strong></span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Quantity <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={form.quantity || ''}
              onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
              placeholder="Enter quantity"
            />
          </div>

          {/* Warehouse */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Warehouse <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              options={warehouses.map(w => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
              value={form.warehouseId || undefined}
              onChange={val => setForm(f => ({ ...f, warehouseId: val || '' }))}
              placeholder="Select warehouse..."
              searchPlaceholder="Search warehouses..."
              emptyMessage="No warehouses found"
              clearable
            />
          </div>

          {/* Reference No */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Reference No <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={form.referenceNo}
              onChange={e => setForm(f => ({ ...f, referenceNo: e.target.value }))}
              placeholder="e.g. GRN-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add notes for this stock in..."
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Adding...
              </span>
            ) : (
              <>
                <ArrowDown className="h-3.5 w-3.5 mr-1" />
                Stock In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// STOCK OVERVIEW TAB
// ================================================================

function StockOverviewTab({
  products,
  productsLoading,
  productsError,
  categories,
  categoriesLoading,
  refetchProducts,
  warehouses,
}: {
  products: Product[] | null
  productsLoading: boolean
  productsError: string | null
  categories: Category[] | null
  categoriesLoading: boolean
  refetchProducts: () => void
  warehouses: WarehouseItem[]
}) {
  const [categoryFilter, setCategoryFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [adjustmentOpen, setAdjustmentOpen] = React.useState(false)

  // Stats calculations
  const stats = React.useMemo(() => {
    if (!products) return { totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
    return {
      totalItems: products.reduce((sum, p) => sum + p.currentStock, 0),
      inStock: products.filter(p => p.currentStock > p.minStock).length,
      lowStock: products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length,
      outOfStock: products.filter(p => p.currentStock === 0).length,
    }
  }, [products])

  // Filtered products
  const filteredProducts = React.useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchCategory = !categoryFilter || p.categoryId === categoryFilter
      const status = getStockStatus(p.currentStock, p.minStock)
      const matchStatus = statusFilter === 'all' || status === statusFilter
      return matchCategory && matchStatus
    })
  }, [products, categoryFilter, statusFilter])

  // Table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-navy-600 dark:text-navy-400">{row.getValue('sku')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center shrink-0">
            <Package className="h-3.5 w-3.5 text-navy-400" />
          </div>
          <div>
            <span className="font-medium text-sm line-clamp-1">{row.getValue('name')}</span>
            {!row.original.isActive && (
              <span className="text-[10px] text-muted-foreground italic block">Inactive</span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] border-navy-300 dark:border-navy-600">
          {row.getValue('category')}
        </Badge>
      ),
    },
    {
      accessorKey: 'currentStock',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Current Stock
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.getValue('currentStock') as number
        const minStock = row.original.minStock
        return (
          <span className={`font-semibold text-sm ${val === 0 ? 'text-rose-600' : val <= minStock ? 'text-amber-600' : 'text-emerald-600'}`}>
            {val} {row.original.unit}
          </span>
        )
      },
    },
    {
      accessorKey: 'minStock',
      header: 'Min Stock',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue('minStock')}</span>
      ),
    },
    {
      accessorKey: 'maxStock',
      header: 'Max Stock',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue('maxStock')}</span>
      ),
    },
    {
      id: 'costValue',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-xs uppercase tracking-wider"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cost Value
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      accessorFn: row => row.currentStock * row.costPrice,
      cell: ({ row }) => (
        <span className="font-medium text-sm text-navy-700 dark:text-navy-300">
          {formatBDT(row.original.currentStock * row.original.costPrice)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: row => getStockStatus(row.currentStock, row.minStock),
      cell: ({ row }) => getStockBadge(getStockStatus(row.original.currentStock, row.original.minStock)),
      filterFn: (row, _id, filterValue) => {
        if (filterValue === 'all') return true
        const status = getStockStatus(row.original.currentStock, row.original.minStock)
        return status === filterValue
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="xs"
          className="text-navy-600 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          onClick={() => {
            // In a full app this would open a detail view
            toast.info(`Selected: ${row.original.name}`)
          }}
        >
          <FileDown className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  if (productsError) {
    return (
      <div className="p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to Load Inventory</h3>
        <p className="text-sm text-muted-foreground mb-4">{productsError}</p>
        <Button variant="outline" onClick={refetchProducts}>
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="shadow-md border-l-4 border-l-navy-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-navy-100 dark:bg-navy-900/40 flex items-center justify-center">
                <Package className="h-5 w-5 text-navy-600 dark:text-navy-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Items</p>
                <p className="text-xl font-bold text-navy-700 dark:text-navy-300">{stats.totalItems.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">In Stock Products</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.inStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Low Stock</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-rose-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Out of Stock</p>
                <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{stats.outOfStock}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Category:</Label>
          <SearchableSelect
            options={[
              { value: '', label: 'All Categories' },
              ...(categories || []).map(c => ({
                value: c.id,
                label: `${c.name} (${c.productCount})`,
              })),
            ]}
            value={categoryFilter || undefined}
            onChange={val => setCategoryFilter(val || '')}
            placeholder="All Categories"
            searchPlaceholder="Search categories..."
            emptyMessage="No categories found"
            disabled={categoriesLoading}
            clearable
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</Label>
          <div className="flex items-center gap-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'In Stock', label: 'In Stock' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out of Stock', label: 'Out of Stock' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-navy-600 text-white shadow-sm'
                    : 'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-900/50'
                }`}
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            className="bg-navy-600 hover:bg-navy-700 text-white"
            onClick={() => setAdjustmentOpen(true)}
          >
            <ArrowUpDown className="h-4 w-4 mr-1.5" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKey="name"
        searchPlaceholder="Search by product name or SKU..."
        isLoading={productsLoading}
        pageSize={10}
        striped
        showRefresh
        onRefresh={refetchProducts}
        exportConfig={{
          exportTypes: ['csv' as const, 'excel' as const],
          fileName: 'stock-overview',
          columnLabels: {
            sku: 'SKU',
            name: 'Product Name',
            category: 'Category',
            currentStock: 'Current Stock',
            minStock: 'Min Stock',
            maxStock: 'Max Stock',
            costValue: 'Cost Value (৳)',
            status: 'Status',
          },
        }}
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
        products={products || []}
        warehouses={warehouses}
        onSuccess={refetchProducts}
      />
    </div>
  )
}

// ================================================================
// STOCK MOVEMENTS TAB
// ================================================================

function StockMovementsTab({
  products,
  warehouses,
}: {
  products: Product[] | null
  warehouses: WarehouseItem[]
}) {
  const [movements, setMovements] = React.useState<StockMovement[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Filters
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [quickStockInOpen, setQuickStockInOpen] = React.useState(false)

  const fetchMovements = React.useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pagination.limit))
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      if (dateRange?.from) params.set('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.set('endDate', dateRange.to.toISOString())

      const res = await fetch(`/api/stock-movements?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch stock movements')
      const json: StockMovementsResponse = await res.json()
      setMovements(json.data)
      setPagination(prev => ({ ...prev, ...json.pagination }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, typeFilter, dateRange])

  React.useEffect(() => {
    fetchMovements(pagination.page)
  }, [pagination.page, typeFilter, dateRange, fetchMovements])

  // Table columns
  const columns: ColumnDef<StockMovement>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.getValue('createdAt'))}</span>
      ),
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.original.product
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center shrink-0">
              <Package className="h-3.5 w-3.5 text-navy-400" />
            </div>
            <div>
              <span className="font-medium text-sm line-clamp-1">{product.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono block">{product.sku}</span>
            </div>
          </div>
        )
      },
      accessorFn: row => row.product.name,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => getMovementTypeBadge(row.getValue('type')),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const type = row.original.type
        const qty = row.getValue('quantity') as number
        const unit = row.original.product.unit || 'pcs'
        return (
          <span className={`font-semibold text-sm ${
            type === 'IN' ? 'text-emerald-600' : type === 'OUT' ? 'text-rose-600' : 'text-navy-600 dark:text-navy-400'
          }`}>
            {type === 'OUT' ? '-' : type === 'IN' ? '+' : ''}{qty} {unit}
          </span>
        )
      },
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }) => {
        const wh = row.original.warehouse
        return (
          <div className="flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{wh.name}</span>
          </div>
        )
      },
      accessorFn: row => row.warehouse.name,
    },
    {
      accessorKey: 'referenceNo',
      header: 'Reference',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.getValue('referenceNo') || '—'}
        </span>
      ),
    },
    {
      id: 'movedBy',
      header: 'Moved By',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.user?.fullName || row.original.user?.userName || row.original.movedBy || 'System'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Date Range:</Label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Filter by date range"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Type:</Label>
          <div className="flex items-center gap-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'IN', label: 'Stock In' },
              { value: 'OUT', label: 'Stock Out' },
              { value: 'TRANSFER', label: 'Transfer' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  typeFilter === opt.value
                    ? 'bg-navy-600 text-white shadow-sm'
                    : 'bg-navy-50 dark:bg-navy-900/30 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-900/50'
                }`}
                onClick={() => setTypeFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:ml-auto">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setQuickStockInOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Quick Stock In
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Failed to Load Movements</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchMovements(pagination.page)}>
            <RefreshCw className="h-4 w-4 mr-2" />Retry
          </Button>
        </div>
      )}

      {/* Data Table */}
      {!error && (
        <DataTable
          columns={columns}
          data={movements}
          searchKey="product"
          searchPlaceholder="Search by product name..."
          isLoading={loading}
          pageSize={pagination.limit}
          striped
          showRefresh
          onRefresh={() => fetchMovements(pagination.page)}
          sidePagination="server"
          totalRows={pagination.total}
          onFetchData={(params) => {
            setPagination(prev => ({ ...prev, page: params.page }))
          }}
          exportConfig={{
            exportTypes: ['csv' as const, 'excel' as const],
            fileName: 'stock-movements',
            columnLabels: {
              createdAt: 'Date',
              product: 'Product',
              type: 'Type',
              quantity: 'Quantity',
              warehouse: 'Warehouse',
              referenceNo: 'Reference',
              movedBy: 'Moved By',
            },
          }}
        />
      )}

      {/* Pagination Info */}
      {!error && !loading && pagination.total > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} movements
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stock In Dialog */}
      <QuickStockInDialog
        open={quickStockInOpen}
        onClose={() => setQuickStockInOpen(false)}
        products={products || []}
        warehouses={warehouses}
        onSuccess={() => fetchMovements(pagination.page)}
      />
    </div>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function InventorySection() {
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useApiData<Product[]>('/api/products')
  const { data: categories, loading: categoriesLoading } = useApiData<Category[]>('/api/categories')
  const { data: warehouses } = useApiData<WarehouseItem[]>('/api/warehouses')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Inventory Management</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Manage stock levels, movements, and warehouse inventory</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-navy-100 dark:bg-navy-900/40">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"
          >
            <Package className="h-4 w-4 mr-1.5" />
            Stock Overview
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"
          >
            <ArrowRightLeft className="h-4 w-4 mr-1.5" />
            Stock Movements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StockOverviewTab
            products={products}
            productsLoading={productsLoading}
            productsError={productsError}
            categories={categories}
            categoriesLoading={categoriesLoading}
            refetchProducts={refetchProducts}
            warehouses={warehouses || []}
          />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementsTab
            products={products}
            warehouses={warehouses || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
