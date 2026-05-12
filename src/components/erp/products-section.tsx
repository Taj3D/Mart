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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
// PRODUCT CARD
// ================================================================

function ProductCard({ product, onEdit, onDelete, onView }: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onView: (p: Product) => void
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow group">
      <CardContent className="p-4">
        {/* Product Image Placeholder */}
        <div className="h-32 rounded-lg bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center mb-3">
          <Package className="h-10 w-10 text-navy-300 dark:text-navy-600" />
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
            </div>
            {getStockBadge(product.status)}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description || product.category}</p>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-lg font-bold text-navy-700 dark:text-navy-300">{formatCurrency(product.sellPrice)}</p>
              <p className="text-[10px] text-muted-foreground">Stock: {product.currentStock} {product.unit}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="xs" onClick={() => onView(product)}><Eye className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="xs" onClick={() => onEdit(product)}><Edit2 className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="xs" className="text-rose-600" onClick={() => onDelete(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ================================================================
// PRODUCT DETAIL DIALOG
// ================================================================

function ProductDetailDialog({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  if (!product) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader variant="navy">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Product Details — {product.sku}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="h-40 rounded-lg bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center">
            <Package className="h-14 w-14 text-navy-300 dark:text-navy-600" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{product.category}</p></div>
            <div><span className="text-muted-foreground">Unit:</span><p className="font-medium">{product.unit}</p></div>
            <div><span className="text-muted-foreground">Cost Price:</span><p className="font-medium">{formatCurrency(product.costPrice)}</p></div>
            <div><span className="text-muted-foreground">Sell Price:</span><p className="font-medium text-navy-700 dark:text-navy-300">{formatCurrency(product.sellPrice)}</p></div>
            <div><span className="text-muted-foreground">Current Stock:</span><p className="font-medium">{product.currentStock}</p></div>
            <div><span className="text-muted-foreground">Status:</span><div className="mt-0.5">{getStockBadge(product.status)}</div></div>
          </div>
          {product.description && (
            <div><span className="text-muted-foreground text-sm">Description:</span><p className="text-sm mt-0.5">{product.description}</p></div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// ADD/EDIT DIALOG
// ================================================================

function ProductFormDialog({ open, onClose, product, categories, onSave }: {
  open: boolean; onClose: () => void; product: Product | null; categories: Category[]; onSave: (data: Record<string, unknown>) => void
}) {
  const [form, setForm] = React.useState({ sku: '', name: '', description: '', categoryId: '', unit: 'pcs', costPrice: 0, sellPrice: 0, currentStock: 0, minStock: 10, maxStock: 100 })

  React.useEffect(() => {
    if (product) {
      setForm({ sku: product.sku, name: product.name, description: product.description || '', categoryId: product.categoryId || '', unit: product.unit, costPrice: product.costPrice, sellPrice: product.sellPrice, currentStock: product.currentStock, minStock: product.minStock, maxStock: product.maxStock })
    } else {
      setForm({ sku: '', name: '', description: '', categoryId: '', unit: 'pcs', costPrice: 0, sellPrice: 0, currentStock: 0, minStock: 10, maxStock: 100 })
    }
  }, [product, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>{product ? 'Update product info' : 'Fill in product details'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">SKU *</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Category</Label><SearchableSelect options={categories.map(c => ({ value: c.id, label: c.name }))} value={form.categoryId} onValueChange={val => setForm(f => ({ ...f, categoryId: val }))} placeholder="Select category" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Cost</Label><Input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Sell Price</Label><Input type="number" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: parseFloat(e.target.value) || 0 }))} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Stock</Label><Input type="number" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: parseInt(e.target.value) || 0 }))} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => { if (!form.sku || !form.name) { toast.error('SKU and Name required'); return } onSave({ ...form, id: product?.id }); onClose() }}>{product ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  const filtered = React.useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = !selectedCategory || p.categoryId === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      if (data.id) {
        const { id, ...updateData } = data
        await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
        toast.success('Product updated')
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        toast.success('Product created')
      }
      refetch()
    } catch { toast.error('Failed to save product') }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      toast.success('Product deleted')
      refetch()
    } catch { toast.error('Failed to delete product') }
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load products</p>
        <Button variant="outline" onClick={refetch}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <InlineHeader color="navy">Products</InlineHeader>
          <p className="text-sm text-muted-foreground mt-1">Browse and manage your product catalog</p>
        </div>
        <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" />Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <SearchableSelect
          options={[{ value: '', label: 'All Categories' }, ...(categories || []).map(c => ({ value: c.id, label: `${c.name} (${c.productCount})` }))]}
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          placeholder="Filter by category"
        />
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-navy-600' : ''}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-navy-600' : ''}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tree Sidebar + Product Content */}
      <div className="flex gap-6">
        {/* Category List */}
        <div className="hidden lg:block w-56 shrink-0">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {categories ? (
                categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${selectedCategory === cat.id ? 'bg-navy-100 dark:bg-navy-900/30 text-navy-700 dark:text-navy-300 font-medium' : 'hover:bg-navy-50 dark:hover:bg-navy-900/20'}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{cat.productCount}</Badge>
                    </div>
                  </button>
                ))
              ) : <Skeleton className="h-40 w-full" />}
            </CardContent>
          </Card>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products found</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(''); setSelectedCategory('') }}>Clear Filters</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={p => { setEditingProduct(p); setFormOpen(true) }}
                onDelete={handleDelete}
                onView={p => setDetailProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            {filtered.map(product => (
              <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-navy-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
                      {getStockBadge(product.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.category} · {product.currentStock} {product.unit} in stock</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy-700 dark:text-navy-300">{formatCurrency(product.sellPrice)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="xs" onClick={() => setDetailProduct(product)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="xs" onClick={() => { setEditingProduct(product); setFormOpen(true) }}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="text-rose-600" onClick={() => handleDelete(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ProductFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditingProduct(null) }} product={editingProduct} categories={categories || []} onSave={handleSave} />
      <ProductDetailDialog product={detailProduct} open={!!detailProduct} onClose={() => setDetailProduct(null)} />
    </div>
  )
}
