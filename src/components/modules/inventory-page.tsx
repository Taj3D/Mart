'use client'

import * as React from 'react'
import {
  Package, Search, Plus, Filter, Tags, Award, Warehouse,
  Edit2, Trash2, AlertTriangle, ArrowUpDown, X, Check,
  ChevronLeft, ChevronRight,
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
import { Textarea } from '@/components/ui/textarea'
import { useNavigationStore } from '@/lib/stores/navigation-store'

// Types
interface Product {
  id: string; sku: string; name: string; barcode?: string; categoryId?: string; brandId?: string
  unit: string; costPrice: number; sellingPrice: number; mrp?: number; currentStock: number
  minStockLevel: number; trackImei: boolean; vatApplicable: boolean; vatRate: number; isActive: boolean
  category?: { id: string; name: string }; brand?: { id: string; name: string }
}

interface Category {
  id: string; name: string; slug: string; description?: string; parentId?: string
  isActive: boolean; _count?: { products: number }; children?: Category[]; parent?: Category
}

interface Brand {
  id: string; name: string; description?: string; isActive: boolean
  _count?: { products: number }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function StockBadge({ current, min }: { current: number; min: number }) {
  if (current <= 0) return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0 text-[10px]">Out of Stock</Badge>
  if (current <= min) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 text-[10px]">Low Stock</Badge>
  return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px]">In Stock</Badge>
}

// ============= PRODUCTS TAB =============
function ProductsTab() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('')
  const [lowStockOnly, setLowStockOnly] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const pageSize = 10

  const fetchProducts = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (categoryFilter) params.set('categoryId', categoryFilter)
    if (lowStockOnly) params.set('lowStock', 'true')

    fetch(`/api/products?${params}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setProducts(data.data || [])
          setTotal(data.pagination?.total || 0)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search, categoryFilter, lowStockOnly])

  React.useEffect(() => { fetchProducts() }, [fetchProducts])

  // Fetch categories and brands for filters/form
  React.useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {})
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(d.data || [])).catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v === '_all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant={lowStockOnly ? 'default' : 'outline'} size="sm" onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1) }} className={lowStockOnly ? 'bg-amber-500 hover:bg-amber-600' : ''}>
          <AlertTriangle className="h-4 w-4 mr-1" /> Low Stock
        </Button>
        <Button size="sm" className="bg-navy-600 hover:bg-navy-700" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">SKU</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Product</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">Category</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase hidden md:table-cell">Brand</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Cost</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Price</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Stock</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? products.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs text-navy-600 dark:text-navy-400">{p.sku}</td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.barcode && <p className="text-xs text-muted-foreground">{p.barcode}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{p.category?.name || '—'}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground">{p.brand?.name || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm">{formatCurrency(p.costPrice)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm font-medium">{formatCurrency(p.sellingPrice)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`font-mono font-bold ${p.currentStock <= p.minStockLevel ? (p.currentStock <= 0 ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'}`}>
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center"><StockBadge current={p.currentStock} min={p.minStockLevel} /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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

      {/* Add Product Dialog */}
      <AddProductDialog open={showAddDialog} onOpenChange={setShowAddDialog} categories={categories} brands={brands} onSuccess={fetchProducts} />
    </div>
  )
}

// ============= ADD PRODUCT DIALOG =============
function AddProductDialog({ open, onOpenChange, categories, brands, onSuccess }: {
  open: boolean; onOpenChange: (open: boolean) => void; categories: Category[]; brands: Brand[]; onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ sku: '', name: '', categoryId: '', brandId: '', costPrice: '', sellingPrice: '', mrp: '', minStockLevel: '10', unit: 'pcs' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        onSuccess()
        onOpenChange(false)
        setForm({ sku: '', name: '', categoryId: '', brandId: '', costPrice: '', sellingPrice: '', mrp: '', minStockLevel: '10', unit: 'pcs' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Enter product details to add it to the inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required placeholder="SKU-013" /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs" /></div>
          </div>
          <div><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Product name" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Brand</Label><Select value={form.brandId} onValueChange={v => setForm(f => ({ ...f, brandId: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Cost Price *</Label><Input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} required placeholder="0" /></div>
            <div><Label>Selling Price *</Label><Input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} required placeholder="0" /></div>
            <div><Label>MRP</Label><Input type="number" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} placeholder="0" /></div>
          </div>
          <div><Label>Min Stock Level</Label><Input type="number" value={form.minStockLevel} onChange={e => setForm(f => ({ ...f, minStockLevel: e.target.value }))} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-navy-600 hover:bg-navy-700">{saving ? 'Saving...' : 'Add Product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============= CATEGORIES TAB =============
function CategoriesTab() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showAddDialog, setShowAddDialog] = React.useState(false)

  const fetchCategories = React.useCallback(() => {
    setLoading(true)
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setCategories(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  React.useEffect(() => { fetchCategories() }, [fetchCategories])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <Button size="sm" className="bg-navy-600 hover:bg-navy-700" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Card key={cat.id} className="border border-border/60 hover:border-navy-300 dark:hover:border-navy-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-navy-100 dark:bg-navy-800">
                      <Tags className="h-5 w-5 text-navy-600 dark:text-navy-300" />
                    </div>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.slug}</p>
                    </div>
                  </div>
                  <Badge className="bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300 border-0">
                    {cat._count?.products || 0} items
                  </Badge>
                </div>
                {cat.description && <p className="text-xs text-muted-foreground mt-2">{cat.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddCategoryDialog open={showAddDialog} onOpenChange={setShowAddDialog} categories={categories} onSuccess={fetchCategories} />
    </div>
  )
}

function AddCategoryDialog({ open, onOpenChange, categories, onSuccess }: {
  open: boolean; onOpenChange: (open: boolean) => void; categories: Category[]; onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', description: '', parentId: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        onSuccess()
        onOpenChange(false)
        setForm({ name: '', description: '', parentId: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>Parent Category</Label><Select value={form.parentId} onValueChange={v => setForm(f => ({ ...f, parentId: v }))}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="_none">None</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-navy-600 hover:bg-navy-700">{saving ? 'Saving...' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============= BRANDS TAB =============
function BrandsTab() {
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showAddDialog, setShowAddDialog] = React.useState(false)

  const fetchBrands = React.useCallback(() => {
    setLoading(true)
    fetch('/api/brands')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setBrands(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  React.useEffect(() => { fetchBrands() }, [fetchBrands])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{brands.length} brands</p>
        <Button size="sm" className="bg-navy-600 hover:bg-navy-700" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Brand
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brands.map(brand => (
            <Card key={brand.id} className="border border-border/60 hover:border-navy-300 dark:hover:border-navy-600 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    {brand.description && <p className="text-xs text-muted-foreground">{brand.description}</p>}
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px]">
                  {brand._count?.products || 0}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBrandDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchBrands} />
    </div>
  )
}

function AddBrandDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { onSuccess(); onOpenChange(false); setForm({ name: '', description: '' }) }
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>Add Brand</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-navy-600 hover:bg-navy-700">{saving ? 'Saving...' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============= STOCK MANAGEMENT TAB =============
function StockTab() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/products?pageSize=50')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setProducts(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const lowStock = products.filter(p => p.currentStock <= p.minStockLevel)
  const outOfStock = products.filter(p => p.currentStock <= 0)
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0)

  return (
    <div className="space-y-6">
      {/* Stock Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-navy-100 dark:bg-navy-800"><Package className="h-6 w-6 text-navy-600 dark:text-navy-300" /></div>
            <div><p className="text-sm text-muted-foreground">Total Stock Value</p><p className="text-2xl font-bold">{formatCurrency(totalValue)}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30"><AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-sm text-muted-foreground">Low Stock Items</p><p className="text-2xl font-bold text-amber-600">{lowStock.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30"><X className="h-6 w-6 text-rose-600 dark:text-rose-400" /></div>
            <div><p className="text-sm text-muted-foreground">Out of Stock</p><p className="text-2xl font-bold text-rose-600">{outOfStock.length}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Items Requiring Attention</CardTitle>
          <CardDescription>Products at or below minimum stock level</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="overflow-x-auto">
              <table className="ims-table w-full text-sm">
                <thead>
                  <tr className="ims-table-header">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-white/90 uppercase">Product</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase">Current</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase">Min Level</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase">Shortage</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-white/90 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length > 0 ? lowStock.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                      <td className="px-3 py-2"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku}</p></td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-amber-600">{p.currentStock}</td>
                      <td className="px-3 py-2 text-center font-mono">{p.minStockLevel}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-rose-600">{Math.max(0, p.minStockLevel - p.currentStock)}</td>
                      <td className="px-3 py-2 text-center"><StockBadge current={p.currentStock} min={p.minStockLevel} /></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">All stock levels are healthy!</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============= MAIN INVENTORY PAGE =============
export function InventoryPage() {
  const { activeSubPage, setActiveSubPage } = useNavigationStore()

  const tabValue = ['products', 'categories', 'brands', 'stock'].includes(activeSubPage) ? activeSubPage : 'products'

  return (
    <div className="space-y-4">
      <Tabs value={tabValue} onValueChange={(v) => setActiveSubPage(v)}>
        <TabsList className="bg-navy-100 dark:bg-navy-800">
          <TabsTrigger value="products" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-1" /> Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Tags className="h-4 w-4 mr-1" /> Categories
          </TabsTrigger>
          <TabsTrigger value="brands" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-1" /> Brands
          </TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Warehouse className="h-4 w-4 mr-1" /> Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="categories"><CategoriesTab /></TabsContent>
        <TabsContent value="brands"><BrandsTab /></TabsContent>
        <TabsContent value="stock"><StockTab /></TabsContent>
      </Tabs>
    </div>
  )
}
