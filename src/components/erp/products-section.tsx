'use client'

import * as React from 'react'
import {
  Package,
  Search,
  Plus,
  Grid3X3,
  List,
  Edit2,
  Trash2,
  RefreshCw,
  XCircle,
  Eye,
  ArrowRight,
  History,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineHeader } from '@/components/ui/inline-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/select/searchable-select'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { toast } from 'sonner'

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

function generateSKU(categoryName: string, existingSKUs: string[]): string {
  const prefix = categoryName
    ? categoryName.substring(0, 3).toUpperCase()
    : 'PRD'
  let num = 100
  let sku = `${prefix}-${num}`
  while (existingSKUs.includes(sku)) {
    num++
    sku = `${prefix}-${num}`
  }
  return sku
}

// ================================================================
// CATEGORY SIDEBAR
// ================================================================

function CategorySidebar({
  categories,
  selectedCategory,
  onSelect,
  loading,
  totalCount,
}: {
  categories: Category[] | null
  selectedCategory: string
  onSelect: (id: string) => void
  loading: boolean
  totalCount: number
}) {
  return (
    <div className="hidden lg:block w-60 shrink-0">
      <Card className="shadow-md border-navy-200 dark:border-navy-800">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-bold text-navy-700 dark:text-navy-300 uppercase tracking-wider">
            Categories
          </h3>
        </div>
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <div className="px-2 pb-3 space-y-0.5">
            {/* All Categories */}
            <button
              className={`w-full text-left text-sm px-3 py-2.5 rounded-md transition-all flex items-center justify-between ${
                selectedCategory === ''
                  ? 'bg-navy-700 text-white border-l-3 border-emerald-400 pl-2.5 font-medium'
                  : 'hover:bg-navy-50 dark:hover:bg-navy-900/30 text-foreground'
              }`}
              onClick={() => onSelect('')}
            >
              <span>All Categories</span>
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 ${
                  selectedCategory === ''
                    ? 'border-white/30 text-white/80'
                    : 'border-navy-300 dark:border-navy-600 text-navy-600 dark:text-navy-400'
                }`}
              >
                {totalCount}
              </Badge>
            </button>

            {loading ? (
              <div className="space-y-1.5 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : (
              categories?.map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-md transition-all flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-navy-700 text-white border-l-3 border-emerald-400 pl-2.5 font-medium'
                      : 'hover:bg-navy-50 dark:hover:bg-navy-900/30 text-foreground'
                  }`}
                  onClick={() => onSelect(selectedCategory === cat.id ? '' : cat.id)}
                >
                  <span className="truncate">{cat.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 shrink-0 ml-1 ${
                      selectedCategory === cat.id
                        ? 'border-white/30 text-white/80'
                        : 'border-navy-300 dark:border-navy-600 text-navy-600 dark:text-navy-400'
                    }`}
                  >
                    {cat.productCount}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

// ================================================================
// PRODUCT CARD (GRID VIEW)
// ================================================================

function ProductCard({
  product,
  onEdit,
  onDelete,
  onView,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onView: (p: Product) => void
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200 group overflow-hidden border-navy-100 dark:border-navy-800">
      <CardContent className="p-0">
        {/* Image Placeholder */}
        <div className="h-36 bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center relative">
          <Package className="h-12 w-12 text-navy-300 dark:text-navy-600" />
          {/* Category Badge - top-left */}
          <Badge className="absolute top-2 left-2 bg-navy-600/90 text-white border-0 text-[10px] px-1.5 py-0.5 hover:bg-navy-600/90">
            {product.category}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          {/* Name + SKU */}
          <div>
            <h4 className="font-bold text-sm line-clamp-1 text-navy-800 dark:text-navy-200">
              {product.name}
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {product.sku}
            </p>
          </div>

          {/* Stock Badge */}
          <div>{getStockBadge(product.status)}</div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm text-muted-foreground line-through">
              {formatBDT(product.costPrice)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-base font-bold text-navy-700 dark:text-navy-300">
              {formatBDT(product.sellPrice)}
            </span>
          </div>

          {/* Stock info */}
          <p className="text-[11px] text-muted-foreground">
            Stock: {product.currentStock} {product.unit}
            {product.minStock > 0 && (
              <span className="ml-1">(min: {product.minStock})</span>
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-navy-100 dark:border-navy-800">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onView(product)}
              title="View details"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onEdit(product)}
              title="Edit product"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => onDelete(product)}
              title="Delete product"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ================================================================
// PRODUCT LIST VIEW
// ================================================================

function ProductListView({
  products,
  onEdit,
  onDelete,
  onView,
}: {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onView: (p: Product) => void
}) {
  return (
    <Card className="shadow-md border-navy-100 dark:border-navy-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-navy-50 dark:bg-navy-900/30 hover:bg-navy-50 dark:hover:bg-navy-900/30">
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">SKU</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Name</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Category</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Cost</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Sell</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Stock</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Status</TableHead>
            <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {product.sku}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-navy-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                    {!product.isActive && (
                      <span className="text-[10px] text-muted-foreground italic">Inactive</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] border-navy-300 dark:border-navy-600">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatBDT(product.costPrice)}
              </TableCell>
              <TableCell className="text-right text-sm font-semibold text-navy-700 dark:text-navy-300">
                {formatBDT(product.sellPrice)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {product.currentStock} {product.unit}
              </TableCell>
              <TableCell>{getStockBadge(product.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <Button variant="ghost" size="xs" onClick={() => onView(product)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => onEdit(product)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// ================================================================
// PRODUCT DETAIL DIALOG
// ================================================================

function ProductDetailDialog({
  product,
  open,
  onClose,
}: {
  product: Product | null
  open: boolean
  onClose: () => void
}) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Product Details — {product.sku}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Image Placeholder */}
          <div className="h-44 rounded-lg bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center">
            <Package className="h-16 w-16 text-navy-300 dark:text-navy-600" />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Category</span>
              <p className="font-medium mt-0.5">{product.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Unit</span>
              <p className="font-medium mt-0.5">{product.unit}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Cost Price</span>
              <p className="font-medium mt-0.5">{formatBDT(product.costPrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Sell Price</span>
              <p className="font-bold text-navy-700 dark:text-navy-300 mt-0.5">
                {formatBDT(product.sellPrice)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Current Stock</span>
              <p className="font-medium mt-0.5">
                {product.currentStock} {product.unit}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Stock Range</span>
              <p className="font-medium mt-0.5">
                {product.minStock} — {product.maxStock}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStockBadge(product.status)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Active</span>
              <p className="font-medium mt-0.5">
                {product.isActive ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 pt-2 border-t border-navy-100 dark:border-navy-800">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <History className="h-3.5 w-3.5" />
              Stock Movements
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <TrendingUp className="h-3.5 w-3.5" />
              Sales History
            </Button>
          </div>
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
// PRODUCT FORM SHEET (ADD / EDIT)
// ================================================================

function ProductFormSheet({
  open,
  onClose,
  product,
  categories,
  existingSKUs,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  existingSKUs: string[]
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    unit: 'pcs',
    costPrice: 0,
    sellPrice: 0,
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    isActive: true,
  })

  const [skuAuto, setSkuAuto] = React.useState(true)

  React.useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId || '',
        unit: product.unit,
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        currentStock: product.currentStock,
        minStock: product.minStock,
        maxStock: product.maxStock,
        isActive: product.isActive,
      })
      setSkuAuto(false)
    } else {
      setForm({
        sku: '',
        name: '',
        description: '',
        categoryId: '',
        unit: 'pcs',
        costPrice: 0,
        sellPrice: 0,
        currentStock: 0,
        minStock: 10,
        maxStock: 100,
        isActive: true,
      })
      setSkuAuto(true)
    }
  }, [product, open])

  // Auto-generate SKU when category changes and skuAuto is true
  React.useEffect(() => {
    if (!skuAuto || product) return
    if (form.categoryId) {
      const cat = categories.find((c) => c.id === form.categoryId)
      if (cat) {
        setForm((f) => ({ ...f, sku: generateSKU(cat.name, existingSKUs) }))
      }
    } else {
      setForm((f) => ({ ...f, sku: generateSKU('Product', existingSKUs) }))
    }
  }, [form.categoryId, skuAuto, product, categories, existingSKUs])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!form.sku.trim()) {
      toast.error('SKU is required')
      return
    }
    onSave({
      ...form,
      id: product?.id,
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      maxStock: Number(form.maxStock),
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-navy-600 text-white px-6 py-4 border-b border-navy-500">
          <SheetTitle className="text-white text-lg">
            {product ? 'Edit Product' : 'Add New Product'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {product ? 'Update product information' : 'Fill in product details to add to inventory'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-4 p-6">
            {/* SKU + Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  SKU <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-1.5">
                  <Input
                    value={form.sku}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, sku: e.target.value }))
                      setSkuAuto(false)
                    }}
                    placeholder="CAT-100"
                    className="font-mono text-sm"
                  />
                </div>
                {!product && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Switch
                      checked={skuAuto}
                      onCheckedChange={setSkuAuto}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-[10px] text-muted-foreground">Auto-generate</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Product Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Samsung 55&quot; Smart TV"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Category
              </Label>
              <SearchableSelect
                options={categories.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.productCount})`,
                }))}
                value={form.categoryId || undefined}
                onChange={(val) => setForm((f) => ({ ...f, categoryId: val || '' }))}
                placeholder="Select a category"
                searchPlaceholder="Search categories..."
                emptyMessage="No categories found"
                clearable
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product description..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Unit
              </Label>
              <Select
                value={form.unit}
                onValueChange={(val) => setForm((f) => ({ ...f, unit: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs — Pieces</SelectItem>
                  <SelectItem value="set">set — Sets</SelectItem>
                  <SelectItem value="pair">pair — Pairs</SelectItem>
                  <SelectItem value="box">box — Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Cost Price (৳)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ৳
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={form.costPrice || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))
                    }
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Sell Price (৳)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ৳
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={form.sellPrice || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sellPrice: parseFloat(e.target.value) || 0 }))
                    }
                    className="pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Margin Preview */}
            {form.costPrice > 0 && form.sellPrice > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-md px-3 py-2 text-sm">
                <span className="text-muted-foreground">Profit Margin: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {formatBDT(form.sellPrice - form.costPrice)} (
                  {((form.sellPrice - form.costPrice) / form.costPrice * 100).toFixed(1)}%)
                </span>
              </div>
            )}

            {/* Stock Levels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Min Stock
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minStock || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minStock: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Max Stock
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.maxStock || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxStock: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Current Stock
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.currentStock || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentStock: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="0"
                  disabled={!!product}
                />
                {product && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Stock managed via inventory
                  </p>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-navy-200 dark:border-navy-700 p-3">
              <div>
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive products won&apos;t appear in sales
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-navy-100 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-900/20">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white min-w-[100px]"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : product ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ================================================================
// DELETE CONFIRMATION
// ================================================================

function DeleteProductDialog({
  product,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  product: Product | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-navy-700 dark:text-navy-300">
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{product?.name}&quot;</span>? This
            action cannot be undone. All associated data including stock records will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {deleting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ================================================================
// LOADING SKELETON
// ================================================================

function LoadingSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className="shadow-md">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </Card>
  )
}

// ================================================================
// EMPTY STATE
// ================================================================

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-full bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-navy-300 dark:text-navy-600" />
      </div>
      <h3 className="text-lg font-semibold text-navy-700 dark:text-navy-300 mb-1">
        No products found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or category filter to find what you need.'
          : 'Start by adding your first product to the inventory.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function ProductsSection() {
  const { data: products, loading, error, refetch } = useApiData<Product[]>('/api/products')
  const { data: categories } = useApiData<Category[]>('/api/categories')

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = React.useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = React.useState<Product | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Filtered products
  const filtered = React.useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, searchQuery, selectedCategory])

  // Existing SKUs for auto-generate
  const existingSKUs = React.useMemo(
    () => products?.map((p) => p.sku) || [],
    [products]
  )

  // Total product count for "All Categories" badge
  const totalCount = products?.length || 0

  // Save handler
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const url = '/api/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save product')
      }

      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully')
      setFormOpen(false)
      setEditingProduct(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteProduct) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/products?id=${deleteProduct.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')
      toast.success('Product deleted successfully')
      setDeleteProduct(null)
      refetch()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to Load Products</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <InlineHeader color="navy">Products</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your electronics product catalog — {filtered.length} of {totalCount} items
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex gap-0.5 bg-navy-100 dark:bg-navy-900/40 rounded-md p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={
                viewMode === 'grid'
                  ? 'bg-navy-700 hover:bg-navy-800 text-white h-7 px-2.5'
                  : 'h-7 px-2.5 text-navy-600 dark:text-navy-400'
              }
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={
                viewMode === 'list'
                  ? 'bg-navy-700 hover:bg-navy-800 text-white h-7 px-2.5'
                  : 'h-7 px-2.5 text-navy-600 dark:text-navy-400'
              }
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Add Product Button */}
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              setEditingProduct(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 bg-white dark:bg-navy-900/30 border-navy-200 dark:border-navy-700"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="xs"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setSearchQuery('')}
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="flex gap-6">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories || null}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          loading={loading && !categories}
          totalCount={totalCount}
        />

        {/* Product Content */}
        {loading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={!!searchQuery || !!selectedCategory}
            onClear={() => {
              setSearchQuery('')
              setSelectedCategory('')
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => {
                  setEditingProduct(p)
                  setFormOpen(true)
                }}
                onDelete={(p) => setDeleteProduct(p)}
                onView={(p) => setDetailProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1">
            <ProductListView
              products={filtered}
              onEdit={(p) => {
                setEditingProduct(p)
                setFormOpen(true)
              }}
              onDelete={(p) => setDeleteProduct(p)}
              onView={(p) => setDetailProduct(p)}
            />
          </div>
        )}
      </div>

      {/* Form Sheet */}
      <ProductFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        categories={categories || []}
        existingSKUs={existingSKUs}
        onSave={handleSave}
        saving={saving}
      />

      {/* Detail Dialog */}
      <ProductDetailDialog
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
      />

      {/* Delete Confirmation */}
      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
