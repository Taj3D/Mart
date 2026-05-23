'use client'

import * as React from 'react'
import {
  Package, Search, Plus, Grid3X3, List, Edit2, Trash2, RefreshCw,
  XCircle, Eye, ArrowRight, Download, Upload, FileSpreadsheet,
  FileText, AlertCircle, CheckCircle2, ChevronDown, Info,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect, type SelectOption } from '@/components/select/searchable-select'
import { MultiSelect, type MultiSelectOption } from '@/components/select/multi-select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ================================================================
// TYPES
// ================================================================

interface Product {
  id: string
  code: string
  sku: string | null
  name: string
  description: string | null
  categoryId: string | null
  brandId: string | null
  unitId: string | null
  modelNo: string | null
  costPrice: number
  sellPrice: number
  wholesalePrice: number
  minStock: number
  maxStock: number
  currentStock: number
  warrantyMonths: number
  image: string | null
  isActive: boolean
  isDeleted: boolean
  category: string
  brand: string | null
  unit: string | null
  unitSymbol: string | null
  status: string
  colorIds: string[]
  segmentIds: string[]
  capacityIds: string[]
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface Category {
  id: string
  code: string
  name: string
  description: string | null
  parentId?: string | null
  productCount: number
  children?: { id: string; name: string; productCount: number }[]
}

interface BrandItem {
  id: string
  code: string
  name: string
  productCount: number
}

interface UnitItem {
  id: string
  code: string
  name: string
  symbol: string | null
}

interface ColorItem {
  id: string
  code: string
  name: string
  hexCode: string | null
}

interface SegmentItem {
  id: string
  code: string
  name: string
}

interface CapacityItem {
  id: string
  code: string
  name: string
  value: number
  unit: string | null
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
        <div className="h-36 bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center relative">
          <Package className="h-12 w-12 text-navy-300 dark:text-navy-600" />
          <Badge className="absolute top-2 left-2 bg-navy-600/90 text-white border-0 text-[10px] px-1.5 py-0.5 hover:bg-navy-600/90">
            {product.category}
          </Badge>
          <Badge className="absolute top-2 right-2 bg-white/80 dark:bg-navy-700/80 text-navy-700 dark:text-navy-200 border-0 text-[9px] px-1.5 py-0.5 font-mono">
            {product.code}
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm line-clamp-1 text-navy-800 dark:text-navy-200">
              {product.name}
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {product.sku || product.code}
            </p>
          </div>
          <div>{getStockBadge(product.status)}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm text-muted-foreground line-through">
              {formatBDT(product.costPrice)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-base font-bold text-navy-700 dark:text-navy-300">
              {formatBDT(product.sellPrice)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Stock: {product.currentStock} {product.unitSymbol || product.unit || 'pcs'}
            {product.minStock > 0 && <span className="ml-1">(min: {product.minStock})</span>}
          </p>
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-navy-100 dark:border-navy-800">
            <Button variant="ghost" size="xs" onClick={() => onView(product)} title="View details">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => onEdit(product)} title="Edit product">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="xs"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => onDelete(product)} title="Delete product"
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
// PRODUCT LIST VIEW (TABLE)
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
    <Card className="shadow-md border-navy-100 dark:border-navy-800 overflow-hidden">
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-navy-50 dark:bg-navy-900/30 hover:bg-navy-50 dark:hover:bg-navy-900/30">
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Code</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">SKU</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Name</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Category</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Brand</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Cost (৳)</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Sell (৳)</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Stock</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Status</TableHead>
              <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {product.code}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {product.sku || '—'}
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
                <TableCell className="text-sm text-muted-foreground">
                  {product.brand || '—'}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatBDT(product.costPrice)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-navy-700 dark:text-navy-300">
                  {formatBDT(product.sellPrice)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {product.currentStock} {product.unitSymbol || product.unit || 'pcs'}
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
                      variant="ghost" size="xs"
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
      </ScrollArea>
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
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.code} — {product.sku || 'No SKU'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="h-44 rounded-lg bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center">
            <Package className="h-16 w-16 text-navy-300 dark:text-navy-600" />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Category</span>
              <p className="font-medium mt-0.5">{product.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Brand</span>
              <p className="font-medium mt-0.5">{product.brand || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Unit</span>
              <p className="font-medium mt-0.5">{product.unit || '—'} ({product.unitSymbol || '—'})</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Model No</span>
              <p className="font-medium mt-0.5">{product.modelNo || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Cost Price</span>
              <p className="font-medium mt-0.5">{formatBDT(product.costPrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Sell Price</span>
              <p className="font-bold text-navy-700 dark:text-navy-300 mt-0.5">{formatBDT(product.sellPrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Wholesale Price</span>
              <p className="font-medium mt-0.5">{formatBDT(product.wholesalePrice)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Warranty</span>
              <p className="font-medium mt-0.5">{product.warrantyMonths > 0 ? `${product.warrantyMonths} months` : '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Current Stock</span>
              <p className="font-medium mt-0.5">{product.currentStock} {product.unitSymbol || product.unit || 'pcs'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Stock Range</span>
              <p className="font-medium mt-0.5">{product.minStock} — {product.maxStock}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStockBadge(product.status)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Active</span>
              <p className="font-medium mt-0.5">{product.isActive ? 'Yes' : 'No'}</p>
            </div>
          </div>
          {product.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// PRODUCT FORM SHEET (ADD / EDIT) — With all new schema fields
// ================================================================

function ProductFormSheet({
  open,
  onClose,
  product,
  categories,
  brands,
  units,
  colors,
  segments,
  capacities,
  existingSKUs,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  brands: BrandItem[]
  units: UnitItem[]
  colors: ColorItem[]
  segments: SegmentItem[]
  capacities: CapacityItem[]
  existingSKUs: string[]
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    modelNo: '',
    costPrice: 0,
    sellPrice: 0,
    wholesalePrice: 0,
    minStock: 10,
    maxStock: 100,
    currentStock: 0,
    warrantyMonths: 0,
    isActive: true,
    colorIds: [] as string[],
    segmentIds: [] as string[],
    capacityIds: [] as string[],
  })

  React.useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        unitId: product.unitId || '',
        modelNo: product.modelNo || '',
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        wholesalePrice: product.wholesalePrice,
        minStock: product.minStock,
        maxStock: product.maxStock,
        currentStock: product.currentStock,
        warrantyMonths: product.warrantyMonths,
        isActive: product.isActive,
        colorIds: product.colorIds || [],
        segmentIds: product.segmentIds || [],
        capacityIds: product.capacityIds || [],
      })
    } else {
      setForm({
        name: '',
        sku: '',
        description: '',
        categoryId: '',
        brandId: '',
        unitId: '',
        modelNo: '',
        costPrice: 0,
        sellPrice: 0,
        wholesalePrice: 0,
        minStock: 10,
        maxStock: 100,
        currentStock: 0,
        warrantyMonths: 0,
        isActive: true,
        colorIds: [],
        segmentIds: [],
        capacityIds: [],
      })
    }
  }, [product, open])

  // Auto-generate SKU from category prefix
  React.useEffect(() => {
    if (product) return // Don't auto-generate when editing
    if (form.categoryId) {
      const cat = categories.find((c) => c.id === form.categoryId)
      if (cat) {
        setForm((f) => ({ ...f, sku: generateSKU(cat.name, existingSKUs) }))
      }
    }
  }, [form.categoryId, product, categories, existingSKUs])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }
    onSave({
      ...form,
      id: product?.id,
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      wholesalePrice: Number(form.wholesalePrice),
      minStock: Number(form.minStock),
      maxStock: Number(form.maxStock),
      currentStock: Number(form.currentStock),
      warrantyMonths: Number(form.warrantyMonths),
    })
  }

  // Category options
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.productCount})`,
  }))

  // Brand options
  const brandOptions: SelectOption[] = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }))

  // Color multi-select options
  const colorOptions: MultiSelectOption[] = colors.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  // Segment multi-select options
  const segmentOptions: MultiSelectOption[] = segments.map((s) => ({
    value: s.id,
    label: s.name,
  }))

  // Capacity multi-select options
  const capacityOptions: MultiSelectOption[] = capacities.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  // Profit margin preview
  const profitMargin = form.sellPrice - form.costPrice
  const profitPercent = form.costPrice > 0 ? ((profitMargin / form.costPrice) * 100).toFixed(1) : '0.0'

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
            {/* Code field — AUTO-GENERATED, READ-ONLY */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Product Code
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={product?.code || 'Auto: PRT-XXXXX'}
                  readOnly
                  className="font-mono text-sm bg-muted/50"
                />
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-[10px] text-muted-foreground">Auto-generated on save (e.g., PRT-00001)</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Product Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='e.g. Samsung 55" Smart TV'
              />
            </div>

            {/* SKU + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  SKU
                </Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="Auto from category"
                  className="font-mono text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Optional, auto from category prefix</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Category
                </Label>
                <SearchableSelect
                  options={categoryOptions}
                  value={form.categoryId || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, categoryId: val || '' }))}
                  placeholder="Select category"
                  searchPlaceholder="Search categories..."
                  emptyMessage="No categories found"
                  clearable
                />
              </div>
            </div>

            {/* Brand + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Brand
                </Label>
                <SearchableSelect
                  options={brandOptions}
                  value={form.brandId || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, brandId: val || '' }))}
                  placeholder="Select brand"
                  searchPlaceholder="Search brands..."
                  emptyMessage="No brands found"
                  clearable
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Unit
                </Label>
                <Select
                  value={form.unitId || undefined}
                  onValueChange={(val) => setForm((f) => ({ ...f, unitId: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.symbol || '—'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model No */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Model No
              </Label>
              <Input
                value={form.modelNo}
                onChange={(e) => setForm((f) => ({ ...f, modelNo: e.target.value }))}
                placeholder="e.g. UA55AU8000"
              />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Cost Price (৳)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                  <Input
                    type="number" min={0}
                    value={form.costPrice || ''}
                    onChange={(e) => setForm((f) => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-7" placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Sell Price (৳)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                  <Input
                    type="number" min={0}
                    value={form.sellPrice || ''}
                    onChange={(e) => setForm((f) => ({ ...f, sellPrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-7" placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                  Wholesale (৳)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                  <Input
                    type="number" min={0}
                    value={form.wholesalePrice || ''}
                    onChange={(e) => setForm((f) => ({ ...f, wholesalePrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-7" placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Profit Margin Preview */}
            {form.costPrice > 0 && form.sellPrice > 0 && (
              <div className={`rounded-md px-3 py-2 text-sm ${profitMargin >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                <span className="text-muted-foreground">Profit Margin: </span>
                <span className={`font-bold ${profitMargin >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {formatBDT(profitMargin)} ({profitPercent}%)
                </span>
              </div>
            )}

            {/* Stock Levels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Min Stock</Label>
                <Input
                  type="number" min={0}
                  value={form.minStock || ''}
                  onChange={(e) => setForm((f) => ({ ...f, minStock: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Max Stock</Label>
                <Input
                  type="number" min={0}
                  value={form.maxStock || ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxStock: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Current Stock</Label>
                <Input
                  type="number" min={0}
                  value={form.currentStock || ''}
                  onChange={(e) => setForm((f) => ({ ...f, currentStock: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Warranty Months */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Warranty (months)
              </Label>
              <Input
                type="number" min={0}
                value={form.warrantyMonths || ''}
                onChange={(e) => setForm((f) => ({ ...f, warrantyMonths: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product description..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Product Colors — Multi-select chips */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Product Colors
              </Label>
              {colors.length > 0 ? (
                <MultiSelect
                  options={colorOptions}
                  value={form.colorIds}
                  onChange={(val) => setForm((f) => ({ ...f, colorIds: val }))}
                  placeholder="Select colors"
                  searchPlaceholder="Search colors..."
                  emptyMessage="No colors found"
                  clearable
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">No colors available</p>
              )}
            </div>

            {/* Product Segments — Multi-select chips */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Product Segments
              </Label>
              {segments.length > 0 ? (
                <MultiSelect
                  options={segmentOptions}
                  value={form.segmentIds}
                  onChange={(val) => setForm((f) => ({ ...f, segmentIds: val }))}
                  placeholder="Select segments"
                  searchPlaceholder="Search segments..."
                  emptyMessage="No segments found"
                  clearable
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">No segments available</p>
              )}
            </div>

            {/* Product Capacities — Multi-select chips */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Product Capacities
              </Label>
              {capacities.length > 0 ? (
                <MultiSelect
                  options={capacityOptions}
                  value={form.capacityIds}
                  onChange={(val) => setForm((f) => ({ ...f, capacityIds: val }))}
                  placeholder="Select capacities"
                  searchPlaceholder="Search capacities..."
                  emptyMessage="No capacities found"
                  clearable
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">No capacities available</p>
              )}
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
              ) : product ? 'Update' : 'Create'}
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
            <span className="font-semibold text-foreground">&quot;{product?.name}&quot;</span>?
            The product will be soft-deleted and can be recovered later.
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
            ) : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ================================================================
// IMPORT CSV DIALOG
// ================================================================

interface CsvRow {
  [key: string]: string
}

interface ImportRow {
  row: CsvRow
  index: number
  isValid: boolean
  errors: string[]
}

function ImportCsvDialog({
  open,
  onClose,
  onImport,
  importing,
}: {
  open: boolean
  onClose: () => void
  onImport: (rows: CsvRow[]) => Promise<void>
  importing: boolean
}) {
  const [csvData, setCsvData] = React.useState<ImportRow[]>([])
  const [fileName, setFileName] = React.useState('')
  const [step, setStep] = React.useState<'upload' | 'preview'>('upload')

  const CSV_TEMPLATE_COLUMNS = [
    'name', 'sku', 'category', 'brand', 'unit', 'modelNo',
    'costPrice', 'sellPrice', 'wholesalePrice', 'currentStock',
    'minStock', 'maxStock', 'warrantyMonths', 'isActive',
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows')
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      const rows: ImportRow[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const row: CsvRow = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })

        // Validate
        const errors: string[] = []
        if (!row.name || !row.name.trim()) errors.push('Name is required')
        if (row.costPrice && isNaN(Number(row.costPrice))) errors.push('Invalid costPrice')
        if (row.sellPrice && isNaN(Number(row.sellPrice))) errors.push('Invalid sellPrice')

        rows.push({ row, index: i, isValid: errors.length === 0, errors })
      }

      setCsvData(rows)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const header = CSV_TEMPLATE_COLUMNS.join(',')
    const sampleRow = 'Sample Product,SP-001,Electronics,Samsung,pcs,SM-001,1000,1500,1300,50,10,100,12,true'
    const csv = `${header}\n${sampleRow}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validRows = csvData.filter((r) => r.isValid)
  const invalidRows = csvData.filter((r) => !r.isValid)

  const handleImport = async () => {
    await onImport(validRows.map((r) => r.row))
  }

  const handleClose = () => {
    setCsvData([])
    setFileName('')
    setStep('upload')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-navy-600" />
            Import Products from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with product data. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-navy-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Select a CSV file to upload
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download Template
              </Button>
              {fileName && (
                <p className="text-xs text-muted-foreground">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{validRows.length} valid rows</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span className="font-medium text-rose-600">{invalidRows.length} invalid rows</span>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <ScrollArea className="max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Sell</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((item) => (
                    <TableRow key={item.index} className={item.isValid ? '' : 'bg-rose-50 dark:bg-rose-900/10'}>
                      <TableCell className="text-xs text-muted-foreground">{item.index}</TableCell>
                      <TableCell className="text-sm">{item.row.name || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{item.row.sku || '—'}</TableCell>
                      <TableCell className="text-sm">{item.row.costPrice || '0'}</TableCell>
                      <TableCell className="text-sm">{item.row.sellPrice || '0'}</TableCell>
                      <TableCell className="text-sm">{item.row.currentStock || '0'}</TableCell>
                      <TableCell>
                        {item.isValid ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] px-1.5 py-0.5">Valid</Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700 border-0 text-[9px] px-1.5 py-0.5">
                            {item.errors[0]}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
              >
                {importing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Importing...
                  </span>
                ) : (
                  <>Import {validRows.length} valid rows</>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// EXPORT CSV — Client-side generation
// ================================================================

function exportProductsCSV(products: Product[]) {
  const headers = [
    'code', 'sku', 'name', 'category', 'brand', 'costPrice', 'sellPrice',
    'wholesalePrice', 'currentStock', 'minStock', 'maxStock', 'warrantyMonths', 'isActive',
  ]

  const rows = products.map((p) =>
    headers.map((h) => {
      const val = (p as Record<string, unknown>)[h]
      return String(val ?? '')
    }).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${products.length} products to CSV`)
}

// ================================================================
// EXPORT PDF — Landscape with jsPDF + autoTable
// ================================================================

function exportProductsPDF(products: Product[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }) as any

  // Corporate header
  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59) // slate-800
  doc.text('Electronics Mart', 14, 15)

  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139) // slate-500
  doc.text('Product Inventory Report', 14, 22)

  doc.setFontSize(9)
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 28)

  // Table
  const tableData = products.map((p) => [
    p.code,
    p.sku || '—',
    p.name,
    p.category,
    p.brand || '—',
    formatBDT(p.costPrice),
    formatBDT(p.sellPrice),
    p.currentStock.toString(),
    p.status,
  ])

  autoTable(doc, {
    startY: 33,
    head: [['Code', 'SKU', 'Name', 'Category', 'Brand', 'Cost', 'Sell', 'Stock', 'Status']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 50 },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    didDrawPage: (data: { pageNumber: number }) => {
      // Page number
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 8)
    },
  })

  // Total stock value summary at bottom
  const totalCostValue = products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)
  const totalSellValue = products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0)
  const finalY = doc.lastAutoTable.finalY + 8

  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  doc.text(`Total Products: ${products.length}`, 14, finalY)
  doc.text(`Total Stock Value (Cost): ${formatBDT(totalCostValue)}`, 14, finalY + 5)
  doc.text(`Total Stock Value (Sell): ${formatBDT(totalSellValue)}`, 14, finalY + 10)

  doc.save(`products_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${products.length} products to PDF`)
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
      <h3 className="text-lg font-semibold text-navy-700 dark:text-navy-300 mb-1">No products found</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or category filter to find what you need.'
          : 'Start by adding your first product to the inventory.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>Clear Filters</Button>
      )}
    </div>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function ProductsSection() {
  const { data: products, loading, error, refetch } = useApiData<Product[]>('/api/products')
  const { data: categories } = useApiData<Category[]>('/api/categories?flat=true')
  const { data: brands } = useApiData<BrandItem[]>('/api/brands')
  const { data: units } = useApiData<UnitItem[]>('/api/units')
  const { data: colors } = useApiData<ColorItem[]>('/api/colors')
  const { data: segments } = useApiData<SegmentItem[]>('/api/segments')
  const { data: capacities } = useApiData<CapacityItem[]>('/api/capacities')

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [selectedBrand, setSelectedBrand] = React.useState('')
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = React.useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = React.useState<Product | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [importing, setImporting] = React.useState(false)

  // Filtered products
  const filtered = React.useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory
      const matchBrand = !selectedBrand || p.brandId === selectedBrand
      return matchSearch && matchCategory && matchBrand
    })
  }, [products, searchQuery, selectedCategory, selectedBrand])

  // Existing SKUs for auto-generate
  const existingSKUs = React.useMemo(
    () => products?.map((p) => p.sku).filter(Boolean) as string[] || [],
    [products]
  )

  // Total product count
  const totalCount = products?.length || 0

  // Save handler
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const url = isEdit ? `/api/products/${data.id}` : '/api/products'
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
      const res = await fetch(`/api/products/${deleteProduct.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to delete product')
      }
      toast.success('Product deleted successfully')
      setDeleteProduct(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  // Import handler
  const handleImport = async (rows: Record<string, string>[]) => {
    try {
      setImporting(true)
      let successCount = 0
      let errorCount = 0

      for (const row of rows) {
        try {
          // Find category by name
          let categoryId = ''
          if (row.category && categories) {
            const cat = categories.find((c) => c.name.toLowerCase() === row.category.toLowerCase())
            if (cat) categoryId = cat.id
          }

          // Find brand by name
          let brandId = ''
          if (row.brand && brands) {
            const brd = brands.find((b) => b.name.toLowerCase() === row.brand.toLowerCase())
            if (brd) brandId = brd.id
          }

          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: row.name,
              sku: row.sku || null,
              categoryId: categoryId || null,
              brandId: brandId || null,
              modelNo: row.modelNo || null,
              costPrice: Number(row.costPrice) || 0,
              sellPrice: Number(row.sellPrice) || 0,
              wholesalePrice: Number(row.wholesalePrice) || 0,
              currentStock: Number(row.currentStock) || 0,
              minStock: Number(row.minStock) || 0,
              maxStock: Number(row.maxStock) || 0,
              warrantyMonths: Number(row.warrantyMonths) || 0,
              isActive: row.isActive !== 'false',
            }),
          })

          if (res.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }

      toast.success(`Imported ${successCount} products${errorCount > 0 ? ` (${errorCount} failed)` : ''}`)
      setImportOpen(false)
      refetch()
    } catch {
      toast.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedBrand('')
  }

  const hasFilters = searchQuery || selectedCategory || selectedBrand

  // Brand options for filter
  const brandFilterOptions: SelectOption[] = (brands || []).map((b) => ({
    value: b.id,
    label: b.name,
  }))

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to Load Products</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={refetch}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Category Sidebar */}
      <CategorySidebar
        categories={categories || null}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        loading={loading}
        totalCount={totalCount}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Products</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} of {totalCount} products
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Triple Utility Bundle Buttons */}
            <Button
              variant="outline" size="sm"
              className="gap-1.5 border-navy-200 dark:border-navy-700"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </Button>
            <Button
              variant="outline" size="sm"
              className="gap-1.5 border-navy-200 dark:border-navy-700"
              onClick={() => exportProductsCSV(filtered)}
              disabled={filtered.length === 0}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              variant="outline" size="sm"
              className="gap-1.5 border-navy-200 dark:border-navy-700"
              onClick={() => exportProductsPDF(filtered)}
              disabled={filtered.length === 0}
            >
              <FileText className="h-3.5 w-3.5" />
              Export PDF
            </Button>

            <div className="h-6 w-px bg-navy-200 dark:bg-navy-700 hidden sm:block" />

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="px-2 py-0.5">
                  <Grid3X3 className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2 py-0.5">
                  <List className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Add Product */}
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
              onClick={() => {
                setEditingProduct(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search + Filters Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, SKU..."
              className="pl-9"
            />
          </div>

          {/* Brand filter */}
          <div className="w-44">
            <SearchableSelect
              options={brandFilterOptions}
              value={selectedBrand || undefined}
              onChange={(val) => setSelectedBrand(val || '')}
              placeholder="Filter by brand"
              searchPlaceholder="Search brands..."
              emptyMessage="No brands found"
              clearable
              size="sm"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={!!hasFilters} onClear={clearFilters} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => { setEditingProduct(p); setFormOpen(true) }}
                onDelete={setDeleteProduct}
                onView={setDetailProduct}
              />
            ))}
          </div>
        ) : (
          <ProductListView
            products={filtered}
            onEdit={(p) => { setEditingProduct(p); setFormOpen(true) }}
            onDelete={setDeleteProduct}
            onView={setDetailProduct}
          />
        )}
      </div>

      {/* Form Sheet */}
      <ProductFormSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null) }}
        product={editingProduct}
        categories={categories || []}
        brands={brands || []}
        units={units || []}
        colors={colors || []}
        segments={segments || []}
        capacities={capacities || []}
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

      {/* Delete Dialog */}
      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCsvDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        importing={importing}
      />
    </div>
  )
}
