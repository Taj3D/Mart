'use client'

import * as React from 'react'
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { toast } from 'sonner'

interface Supplier {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  balance: number
  isActive: boolean
  createdAt: string
  _count?: { purchaseOrders: number }
}

const formatBDT = (amount: number) => `৳ ${amount.toLocaleString('en-IN')}`

export function SuppliersSection() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Supplier | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    code: '', name: '', email: '', phone: '', address: '', city: '', country: 'Bangladesh',
    balance: 0, isActive: true,
  })

  const fetchSuppliers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/suppliers')
      if (!res.ok) throw new Error('Failed to fetch suppliers')
      const data = await res.json()
      setSuppliers(Array.isArray(data) ? data : data.suppliers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const openCreate = () => {
    setEditingSupplier(null)
    setForm({ code: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`, name: '', email: '', phone: '', address: '', city: '', country: 'Bangladesh', balance: 0, isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s)
    setForm({ code: s.code, name: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', city: s.city || '', country: s.country || 'Bangladesh', balance: s.balance, isActive: s.isActive })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.name) {
      toast.error('Supplier code and name are required')
      return
    }
    setSaving(true)
    try {
      if (editingSupplier) {
        const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to update supplier')
        toast.success('Supplier updated successfully')
      } else {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to create supplier')
        toast.success('Supplier created successfully')
      }
      setDialogOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/suppliers/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete supplier')
      toast.success('Supplier deactivated successfully')
      fetchSuppliers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete supplier')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  )

  const activeSuppliers = suppliers.filter(s => s.isActive)
  const totalBalance = activeSuppliers.reduce((s, sp) => s + sp.balance, 0)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSuppliers} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-800 dark:text-navy-100">Suppliers</h2>
          <p className="text-sm text-muted-foreground">{suppliers.length} total suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Button onClick={openCreate} className="bg-navy-700 hover:bg-navy-800">
            <Plus className="h-4 w-4 mr-2" />Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-navy-600">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Suppliers</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-navy-100">{activeSuppliers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-amber-700">{formatBDT(totalBalance)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Purchase Orders</p>
            <p className="text-2xl font-bold text-emerald-700">{suppliers.reduce((s, sp) => s + (sp._count?.purchaseOrders || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-40 bg-muted/30" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(supplier => (
            <Card key={supplier.id} className={`hover:shadow-md transition-shadow ${!supplier.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-navy-600 dark:text-navy-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-800 dark:text-navy-100">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{supplier.code}</p>
                    </div>
                  </div>
                  <Badge variant={supplier.isActive ? 'success' : 'destructive'} className="text-[10px]">
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  {supplier.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{supplier.phone}</div>}
                  {supplier.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{supplier.email}</div>}
                  {supplier.city && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{supplier.city}, {supplier.country}</div>}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Balance: </span>
                    <span className="font-semibold text-amber-700">{formatBDT(supplier.balance)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(supplier)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700" onClick={() => setDeleteTarget(supplier)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy-800 dark:text-navy-100">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update supplier information' : 'Enter supplier details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="SUP-001" />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplier name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+880..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opening Balance (৳)</Label>
              <Input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked }))} />
              <Label>Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-navy-700 hover:bg-navy-800">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Supplier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate &quot;{deleteTarget?.name}&quot;. The supplier record will be preserved but marked as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
