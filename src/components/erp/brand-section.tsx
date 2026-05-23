'use client'

import * as React from 'react'
import {
  Tag, Plus, Search, Edit2, Trash2, Upload, Download, FileDown,
  RefreshCw, XCircle, Eye, MoreHorizontal, FileUp, ArrowDownToLine,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ================================================================
// TYPES
// ================================================================

interface Brand {
  id: string
  code: string
  name: string
  description: string | null
  logo: string | null
  isActive: boolean
  isDeleted: boolean
  productCount: number
  createdDate: string
  updatedDate: string
}

// ================================================================
// HELPERS
// ================================================================

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ================================================================
// BRAND FORM SHEET
// ================================================================

function BrandFormSheet({
  open, onClose, brand, onSave, saving,
}: {
  open: boolean
  onClose: () => void
  brand: Brand | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '', description: '', logo: '', isActive: true,
  })

  React.useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        isActive: brand.isActive,
      })
    } else {
      setForm({ name: '', description: '', logo: '', isActive: true })
    }
  }, [brand, open])

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return }
    onSave({ ...form, id: brand?.id })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-navy-600 text-white px-6 py-4 border-b border-navy-500">
          <SheetTitle className="text-white text-lg">{brand ? 'Edit Brand' : 'Add New Brand'}</SheetTitle>
          <SheetDescription className="text-white/70">
            {brand ? 'Update brand information' : 'Fill in brand details'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-4 p-6">
            {/* Code (read-only) */}
            {brand && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Code</Label>
                <Input value={brand.code} disabled className="font-mono text-sm bg-muted" />
                <p className="text-[10px] text-muted-foreground italic">Auto-generated, read-only</p>
              </div>
            )}
            {!brand && (
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Code: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Auto-generated (BRD-XXXXX)</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Brand Name <span className="text-rose-500">*</span>
              </Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Samsung" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brand description..." rows={3} className="resize-none" />
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">Logo URL</Label>
              <Input value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} placeholder="https://..." />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-navy-200 dark:border-navy-700 p-3">
              <div>
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-[11px] text-muted-foreground">Inactive brands won&apos;t appear in product forms</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))} className="data-[state=checked]:bg-emerald-600" />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-navy-100 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-900/20">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white min-w-[100px]" onClick={handleSubmit} disabled={saving}>
              {saving ? (<span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving...</span>) : brand ? 'Update' : 'Create'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ================================================================
// IMPORT CSV DIALOG
// ================================================================

function ImportCSVDialog({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported: () => void }) {
  const [step, setStep] = React.useState(0) // 0=upload, 1=preview, 2=done
  const [rawText, setRawText] = React.useState('')
  const [rows, setRows] = React.useState<Record<string, string>[]>([])
  const [errors, setErrors] = React.useState<number[]>([])
  const [importing, setImporting] = React.useState(false)

  const reset = () => { setStep(0); setRawText(''); setRows([]); setErrors([]); setImporting(false) }

  const downloadTemplate = () => {
    const csv = 'name,description,logo\nSamsung,Electronics Giant,https://...\nLG,Life\'s Good,https://...'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'brand_import_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setRawText(text)
      const lines = text.trim().split('\n')
      if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const parsed: Record<string, string>[] = []
      const errIdx: number[] = []
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map((v) => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => { row[h] = vals[idx] || '' })
        if (!row.name?.trim()) errIdx.push(i - 1)
        parsed.push(row)
      }
      setRows(parsed)
      setErrors(errIdx)
      setStep(1)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    const validRows = rows.filter((_, i) => !errors.includes(i))
    if (validRows.length === 0) { toast.error('No valid rows to import'); return }
    setImporting(true)
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: true, items: validRows }),
      })
      if (!res.ok) throw new Error('Import failed')
      const result = await res.json()
      toast.success(`Successfully imported ${result.count || validRows.length} brands`)
      setStep(2)
      onImported()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import Brands from CSV</DialogTitle>
          <DialogDescription>Upload a CSV file to bulk-create brands</DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-navy-300 dark:border-navy-700 rounded-lg p-8 text-center">
              <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Select a CSV file or drag and drop</p>
              <Input type="file" accept=".csv" onChange={handleFile} className="max-w-xs mx-auto" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" />Download Template
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm"><span className="font-bold text-emerald-600">{rows.length - errors.length}</span> valid / <span className="font-bold text-rose-600">{errors.length}</span> invalid rows</p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-3.5 w-3.5 mr-1" />Template</Button>
            </div>
            <ScrollArea className="max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} className={errors.includes(i) ? 'bg-rose-50 dark:bg-rose-900/20' : ''}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className={errors.includes(i) ? 'text-rose-600' : ''}>{row.name || '(missing)'}</TableCell>
                      <TableCell className="text-xs truncate max-w-[200px]">{row.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose() }}>Cancel</Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleImport} disabled={importing || rows.length - errors.length === 0}>
                {importing ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
                Import {rows.length - errors.length} Rows
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-8">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
              <FileDown className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-lg">Import Complete!</p>
            <Button className="mt-4" onClick={() => { reset(); onClose() }}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ================================================================
// EXPORT CSV
// ================================================================

function exportCSV(brands: Brand[]) {
  const headers = ['Code', 'Name', 'Description', 'Products', 'Active', 'Created Date']
  const csvRows = brands.map((b) =>
    [b.code, b.name, b.description || '', String(b.productCount), String(b.isActive), formatDate(b.createdDate)].map((v) => `"${v}"`).join(',')
  )
  const csv = [headers.join(','), ...csvRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `brands_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${brands.length} brands to CSV`)
}

// ================================================================
// EXPORT PDF
// ================================================================

function exportPDF(brands: Brand[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setTextColor(10, 22, 40) // Deep Navy
  doc.text('Electronics Mart', 14, 18)
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('Brand Report', 14, 25)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 31)

  autoTable(doc, {
    startY: 36,
    head: [['Code', 'Name', 'Description', 'Products', 'Status', 'Created']],
    body: brands.map((b) => [b.code, b.name, b.description || '-', String(b.productCount), b.isActive ? 'Active' : 'Inactive', formatDate(b.createdDate)]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [10, 22, 40], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  })

  // Page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 8)
  }

  doc.save(`brands_${new Date().toISOString().slice(0, 10)}.pdf`)
  toast.success(`Exported ${brands.length} brands to PDF`)
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function BrandSection() {
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [showInactive, setShowInactive] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null)
  const [deleteBrand, setDeleteBrand] = React.useState<Brand | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)

  const fetchBrands = React.useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch(`/api/brands${showInactive ? '?all=true' : ''}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBrands(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  React.useEffect(() => { fetchBrands() }, [fetchBrands])

  const filtered = React.useMemo(() => {
    if (!search) return brands
    const q = search.toLowerCase()
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q))
  }, [brands, search])

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const res = await fetch('/api/brands', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save')
      }
      toast.success(isEdit ? 'Brand updated' : 'Brand created')
      setFormOpen(false); setEditingBrand(null); fetchBrands()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteBrand) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/brands?id=${deleteBrand.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete')
      }
      toast.success('Brand deleted')
      setDeleteBrand(null); fetchBrands()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-32" /></div>
        <Card><CardContent className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={fetchBrands}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-navy-600 dark:text-navy-400" />Brand Management
          </h2>
          <p className="text-sm text-muted-foreground">{filtered.length} brand{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" />Import CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCSV(filtered)} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportPDF(filtered)} disabled={filtered.length === 0}>
            <FileDown className="h-3.5 w-3.5" />Export PDF
          </Button>
          <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => { setEditingBrand(null); setFormOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />Add Brand
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Show Inactive</Label>
          <Switch checked={showInactive} onCheckedChange={setShowInactive} className="data-[state=checked]:bg-amber-500" />
        </div>
      </div>

      {/* Data Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{search ? 'No brands match your search' : 'No brands found'}</p>
        </div>
      ) : (
        <Card className="shadow-md border-navy-100 dark:border-navy-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 dark:bg-navy-900/30 hover:bg-navy-50 dark:hover:bg-navy-900/30">
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Code</TableHead>
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Name</TableHead>
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Description</TableHead>
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-center">Products</TableHead>
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Status</TableHead>
                <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((brand) => (
                <TableRow key={brand.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">{brand.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4 text-navy-400" />
                      </div>
                      <span className="font-medium text-sm">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{brand.description || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] border-navy-300 dark:border-navy-600">{brand.productCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${brand.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="xs"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingBrand(brand); setFormOpen(true) }}>
                          <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => setDeleteBrand(brand)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Form Sheet */}
      <BrandFormSheet open={formOpen} onClose={() => { setFormOpen(false); setEditingBrand(null) }} brand={editingBrand} onSave={handleSave} saving={saving} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBrand} onOpenChange={() => setDeleteBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">&quot;{deleteBrand?.name}&quot;</span>? This is a soft-delete — the record can be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {deleting ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : null}
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import CSV */}
      <ImportCSVDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={fetchBrands} />
    </div>
  )
}
