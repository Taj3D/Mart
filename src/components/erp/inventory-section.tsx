'use client'

import * as React from 'react'
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { InlineHeader } from '@/components/ui/inline-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/select'
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
}

interface Category {
  id: string
  name: string
  description: string | null
  productCount: number
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

  React.useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ================================================================
// HELPERS
// ================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function getStockBadge(status: string) {
  const map: Record<string, string> = {
    'In Stock': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Low Stock': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Out of Stock': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return <Badge className={`${map[status] || ''} border-0 text-[10px]`}>{status}</Badge>
}

// ================================================================
// ADD/EDIT PRODUCT DIALOG
// ================================================================

function ProductDialog({
  open,
  onClose,
  product,
  categories,
  onSave,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  onSave: (data: Record<string, unknown>) => void
}) {
  const [form, setForm] = React.useState({
    sku: '', name: '', description: '', categoryId: '', unit: 'pcs',
    costPrice: 0, sellPrice: 0, currentStock: 0, minStock: 10, maxStock: 100,
  })

  React.useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku, name: product.name, description: product.description || '',
        categoryId: product.categoryId || '', unit: product.unit,
        costPrice: product.costPrice, sellPrice: product.sellPrice,
        currentStock: product.currentStock, minStock: product.minStock, maxStock: product.maxStock,
      })
    } else {
      setForm({ sku: '', name: '', description: '', categoryId: '', unit: 'pcs', costPrice: 0, sellPrice: 0, currentStock: 0, minStock: 10, maxStock: 100 })
    }
  }, [product, open])

  const handleSubmit = () => {
    if (!form.sku || !form.name) {
      toast.error('SKU and Name are required')
      return
    }
    onSave({ ...form, id: product?.id })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>{product ? 'Update product information' : 'Fill in product details'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-semibold">SKU *</Label>
              <Input id="sku" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <SearchableSelect
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={form.categoryId}
              onValueChange={val => setForm(f => ({ ...f, categoryId: val }))}
              placeholder="Select category"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cost Price</Label>
              <Input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sell Price</Label>
              <Input type="number" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Unit</Label>
              <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Current Stock</Label>
              <Input type="number" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Min Stock</Label>
              <Input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Max Stock</Label>
              <Input type="number" value={form.maxStock} onChange={e => setForm(f => ({ ...f, maxStock: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSubmit}>{product ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function InventorySection() {
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useApiData<Product[]>('/api/products')
  const { data: categories, loading: categoriesLoading } = useApiData<Category[]>('/api/categories')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [categoryFilter, setCategoryFilter] = React.useState('')

  const filteredProducts = React.useMemo(() => {
    if (!products) return []
    if (!categoryFilter) return products
    return products.filter(p => p.categoryId === categoryFilter)
  }, [products, categoryFilter])

  // Stock overview stats
  const inStock = products?.filter(p => p.currentStock > p.minStock).length || 0
  const lowStock = products?.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length || 0
  const outOfStock = products?.filter(p => p.currentStock === 0).length || 0

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      if (data.id) {
        const { id, ...updateData } = data
        await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
        toast.success('Product updated successfully')
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        toast.success('Product created successfully')
      }
      refetchProducts()
    } catch {
      toast.error('Failed to save product')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      toast.success('Product deleted successfully')
      refetchProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  // Table columns
  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'sku', header: 'SKU', cell: ({ row }) => <span className="font-mono text-xs text-navy-600 dark:text-navy-400">{row.getValue('sku')}</span> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span> },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'unit', header: 'Unit' },
    { accessorKey: 'costPrice', header: 'Cost', cell: ({ row }) => formatCurrency(row.getValue('costPrice') as number) },
    { accessorKey: 'sellPrice', header: 'Sell Price', cell: ({ row }) => formatCurrency(row.getValue('sellPrice') as number) },
    { accessorKey: 'currentStock', header: 'Stock', cell: ({ row }) => {
      const val = row.getValue('currentStock') as number
      return <span className={val === 0 ? 'text-rose-600 font-semibold' : val <= (row.original.minStock) ? 'text-amber-600 font-semibold' : ''}>{val}</span>
    }},
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => getStockBadge(row.getValue('status') as string) },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => { setEditingProduct(row.original); setDialogOpen(true) }}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="text-rose-600 hover:text-rose-700" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  if (productsError) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load inventory data</p>
        <Button variant="outline" onClick={refetchProducts}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Inventory Management</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Manage products and stock levels</p>
        </div>
        <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => { setEditingProduct(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" />Add Product
        </Button>
      </div>

      {/* Stock Overview Cards */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="shadow-md border-l-4 border-l-navy-500">
            <CardContent className="p-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-navy-600 dark:text-navy-400" />
              <div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-xl font-bold text-navy-700 dark:text-navy-300">{products?.length || 0}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div><p className="text-xs text-muted-foreground">In Stock</p><p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{inStock}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              <div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-xl font-bold text-amber-700 dark:text-amber-300">{lowStock}</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              <div><p className="text-xs text-muted-foreground">Out of Stock</p><p className="text-xl font-bold text-rose-700 dark:text-rose-300">{outOfStock}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-xs font-semibold text-muted-foreground">Filter by Category:</Label>
        <SearchableSelect
          options={[{ value: '', label: 'All Categories' }, ...(categories || []).map(c => ({ value: c.id, label: `${c.name} (${c.productCount})` }))]}
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="All Categories"
        />
        {categoryFilter && (
          <Button variant="ghost" size="xs" onClick={() => setCategoryFilter('')}>Clear</Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKey="name"
        searchPlaceholder="Search products..."
        isLoading={productsLoading}
        pageSize={10}
        exportConfig={{
          exportTypes: ['csv' as const, 'excel' as const, 'pdf' as const],
          fileName: 'inventory-report',
          columnLabels: { sku: 'SKU', name: 'Product Name', category: 'Category', unit: 'Unit', costPrice: 'Cost Price', sellPrice: 'Sell Price', currentStock: 'Stock', status: 'Status' },
        }}
      />

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingProduct(null) }}
        product={editingProduct}
        categories={categories || []}
        onSave={handleSave}
      />
    </div>
  )
}
