'use client'

// ============================================================================
// Electronics Mart IMS — Brands Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  XCircle,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Building2,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPES
// ============================================================================

interface Brand {
  id: string
  code: string
  name: string
  description: string | null
  logo: string | null
  companyId: string | null
  companyName: string | null
  companyCode: string | null
  isActive: boolean
  isDeleted: boolean
  productCount: number
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface Company {
  id: string
  code: string
  name: string
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusBadge(isActive: boolean) {
  if (isActive) {
    return (
      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] font-semibold px-1.5 py-0.5">
        Active
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold px-1.5 py-0.5">
      Inactive
    </Badge>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================================
// CUSTOM HOOK: Brand Data Fetcher
// ============================================================================

function useBrands(showAll: boolean) {
  const [data, setData] = React.useState<Brand[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/brands${showAll ? '?all=true' : ''}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [showAll])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================================================
// CUSTOM HOOK: Companies Fetcher (for searchable select)
// ============================================================================

function useCompanies() {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/companies?all=true')
        if (!res.ok) return
        const json = await res.json()
        const list = Array.isArray(json) ? json : json.data || []
        setCompanies(
          list.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            code: c.code as string,
            name: c.name as string,
          }))
        )
      } catch {
        // silent — used for dropdown only
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  return { companies, loading }
}

// ============================================================================
// BRAND VIEW DETAIL DIALOG
// ============================================================================

function BrandViewDialog({
  brand,
  open,
  onClose,
}: {
  brand: Brand | null
  open: boolean
  onClose: () => void
}) {
  if (!brand) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-amber-500" />
            {brand.name}
          </DialogTitle>
          <DialogDescription>
            Brand Details &mdash; {brand.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{brand.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(brand.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Company / Manufacturer</span>
              <p className="font-medium mt-0.5">{brand.companyName || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Products Count</span>
              <p className="font-semibold mt-0.5">{brand.productCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(brand.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(brand.updatedDate)}</p>
            </div>
          </div>

          {/* Logo URL */}
          {brand.logo && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Logo URL</span>
              <p className="text-sm mt-0.5 text-blue-600 dark:text-blue-400 break-all">{brand.logo}</p>
            </div>
          )}

          {/* Description */}
          {brand.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{brand.description}</p>
            </div>
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

// ============================================================================
// BRAND FORM SHEET (ADD / EDIT)
// ============================================================================

function BrandFormSheet({
  open,
  onClose,
  brand,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  brand: Brand | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    logo: '',
    companyId: '',
    isActive: true,
  })
  const { companies } = useCompanies()
  const [companySearch, setCompanySearch] = React.useState('')
  const [companyDropdownOpen, setCompanyDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        companyId: brand.companyId || '',
        isActive: brand.isActive,
      })
    } else {
      setForm({
        name: '',
        description: '',
        logo: '',
        companyId: '',
        isActive: true,
      })
    }
  }, [brand, open])

  const filteredCompanies = React.useMemo(() => {
    if (!companySearch) return companies
    const q = companySearch.toLowerCase()
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    )
  }, [companies, companySearch])

  const selectedCompany = React.useMemo(
    () => companies.find((c) => c.id === form.companyId),
    [companies, form.companyId]
  )

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    onSave({
      ...form,
      id: brand?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      logo: form.logo.trim() || null,
      companyId: form.companyId || null,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {brand ? 'Edit Brand' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {brand ? 'Update brand information' : 'Add a new brand record'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-4 p-6">
            {/* Code Field — AUTO-GENERATED, READ-ONLY */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Code
              </Label>
              <Input
                value={brand ? brand.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {brand
                  ? 'Code is read-only and cannot be changed'
                  : 'Auto: BRD-XXXXX — generated on save'}
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Samsung"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this brand..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {/* Company/Manufacturer — Searchable Select Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Company / Manufacturer <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <div
                  className="flex items-center gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-ring"
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                >
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  {selectedCompany ? (
                    <span className="flex-1 truncate">
                      {selectedCompany.name}{' '}
                      <span className="text-muted-foreground text-xs">
                        ({selectedCompany.code})
                      </span>
                    </span>
                  ) : (
                    <span className="flex-1 text-muted-foreground">
                      Select company...
                    </span>
                  )}
                  {form.companyId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setForm((f) => ({ ...f, companyId: '' }))
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {companyDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-lg">
                    <div className="p-2">
                      <Input
                        placeholder="Search companies..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">
                          No companies found
                        </p>
                      ) : (
                        filteredCompanies.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                              form.companyId === c.id
                                ? 'bg-accent font-medium'
                                : ''
                            }`}
                            onClick={() => {
                              setForm((f) => ({ ...f, companyId: c.id }))
                              setCompanyDropdownOpen(false)
                              setCompanySearch('')
                            }}
                          >
                            {c.name}{' '}
                            <span className="text-muted-foreground text-xs">
                              ({c.code})
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Logo URL <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={form.logo}
                onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div>
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive brands won&apos;t appear in product forms
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isActive: checked }))
                }
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
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
              ) : brand ? (
                'Update'
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// DELETE CONFIRMATION
// ============================================================================

function DeleteBrandDialog({
  brand,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  brand: Brand | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">
            Delete Brand
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              &quot;{brand?.name}&quot;
            </span>{' '}
            ({brand?.code})?{' '}
            {brand && brand.productCount > 0 ? (
              <span className="text-rose-600 font-medium">
                This brand has {brand.productCount} linked product(s). Please
                reassign products before deleting.
              </span>
            ) : (
              'This is a soft-delete &mdash; the record will be marked as deleted but preserved in the database.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting || (brand ? brand.productCount > 0 : false)}
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

// ============================================================================
// IMPORT CSV DIALOG
// ============================================================================

function ImportCSVDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = React.useState<File | null>(null)
  const [rawRows, setRawRows] = React.useState<string[][]>([])
  const [staging, setStaging] = React.useState<Array<Record<string, string>>>([])
  const [columnMap, setColumnMap] = React.useState<Record<string, string>>({})
  const [step, setStep] = React.useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload')
  const [errors, setErrors] = React.useState<string[]>([])
  const [importing, setImporting] = React.useState(false)
  const [importResult, setImportResult] = React.useState<{ success: number; failed: number } | null>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const CSV_COLUMNS = ['name', 'description', 'company']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    description: 'Description',
    company: 'Company Name (must match existing company)',
  }

  React.useEffect(() => {
    if (open) {
      setFile(null)
      setRawRows([])
      setStaging([])
      setColumnMap({})
      setStep('upload')
      setErrors([])
      setImporting(false)
      setImportResult(null)
    }
  }, [open])

  // Download CSV template
  const downloadTemplate = () => {
    const header = CSV_COLUMNS.join(',')
    const sampleRow = 'Samsung,Electronics Giant,Samsung Electronics'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brands_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Parse CSV file
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    return lines.map((line) => {
      const cells: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      cells.push(current.trim())
      return cells
    })
  }

  const processFile = (f: File) => {
    setFile(f)
    setErrors([])

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) {
        setErrors(['CSV file must contain at least a header row and one data row'])
        return
      }

      setRawRows(rows)
      const headers = rows[0]

      // Auto-map columns by matching header names
      const autoMap: Record<string, string> = {}
      for (const col of CSV_COLUMNS) {
        const idx = headers.findIndex(
          (h) =>
            h
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '') ===
            col.toLowerCase().replace(/[^a-z0-9]/g, '')
        )
        if (idx >= 0) {
          autoMap[col] = headers[idx]
        }
      }
      setColumnMap(autoMap)
      setStep('mapping')
    }
    reader.readAsText(f)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    processFile(f)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.name.endsWith('.csv')) {
      processFile(f)
    } else {
      setErrors(['Please drop a .csv file'])
    }
  }

  // Process mapped data into staging
  const processMapping = () => {
    if (!columnMap['name']) {
      setErrors(['Name column mapping is required'])
      return
    }

    const headers = rawRows[0]
    const nameIdx = headers.indexOf(columnMap['name'])
    const descIdx = columnMap['description'] ? headers.indexOf(columnMap['description']) : -1
    const compIdx = columnMap['company'] ? headers.indexOf(columnMap['company']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      stagingRows.push({
        name: name.trim(),
        description: descIdx >= 0 ? (row[descIdx] || '').trim() : '',
        company: compIdx >= 0 ? (row[compIdx] || '').trim() : '',
      })
    }

    setStaging(stagingRows)
    setErrors(newErrors)
    setStep('preview')
  }

  // Execute bulk import
  const executeImport = async () => {
    setImporting(true)
    let success = 0
    let failed = 0

    for (const row of staging) {
      try {
        const res = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            description: row.description || null,
          }),
        })
        if (res.ok) {
          success++
        } else {
          const err = await res.json().catch(() => ({}))
          failed++
          setErrors((prev) => [...prev, `${row.name}: ${err.error || 'Failed'}`])
        }
      } catch {
        failed++
        setErrors((prev) => [...prev, `${row.name}: Network error`])
      }
    }

    setImportResult({ success, failed })
    setStep('importing')
    setImporting(false)
    if (success > 0) {
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-amber-500" />
            Import Brands from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import brand records
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-4">
            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileSpreadsheet className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag &amp; drop a CSV file here, or click to browse
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Required columns: name
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {errors.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 space-y-1">
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-rose-600 dark:text-rose-400">
                        {err}
                      </p>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            )}

            {/* Step: Column Mapping */}
            {step === 'mapping' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">File:</span> {file?.name} &mdash;{' '}
                  {rawRows.length - 1} data rows
                </div>

                <div className="space-y-3">
                  {CSV_COLUMNS.map((col) => (
                    <div
                      key={col}
                      className="grid grid-cols-2 gap-3 items-center"
                    >
                      <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                        {CSV_LABELS[col]}
                        {col === 'name' && (
                          <span className="text-rose-500 ml-1">*</span>
                        )}
                      </Label>
                      <Select
                        value={columnMap[col] || ''}
                        onValueChange={(val) =>
                          setColumnMap((prev) => ({ ...prev, [col]: val }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rawRows[0].map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white"
                    onClick={processMapping}
                  >
                    Preview Data
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Preview / Staging */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">{staging.length}</span> rows ready
                  for import
                </div>

                {errors.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                      Validation Issues ({errors.length}):
                    </p>
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-rose-600 dark:text-rose-400">
                        &bull; {err}
                      </p>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-900/30">
                        <TableHead className="text-xs font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Company
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">
                            {row.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {row.description || '\u2014'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {row.company || '\u2014'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {staging.length > 50 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-xs text-center text-muted-foreground"
                          >
                            ... and {staging.length - 50} more rows
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStep('mapping')}>
                    Back
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={executeImport}
                    disabled={staging.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import {staging.length} Brands
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Importing / Result */}
            {step === 'importing' && (
              <div className="space-y-4 text-center py-4">
                {importing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Importing brands...
                    </p>
                  </>
                ) : importResult ? (
                  <>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {importResult.success}
                        </p>
                        <p className="text-xs text-muted-foreground">Imported</p>
                      </div>
                      {importResult.failed > 0 && (
                        <div className="text-center">
                          <XCircle className="h-8 w-8 text-rose-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                            {importResult.failed}
                          </p>
                          <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                      )}
                    </div>
                    {errors.length > 0 && (
                      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-left max-h-32 overflow-y-auto">
                        {errors.map((err, i) => (
                          <p
                            key={i}
                            className="text-xs text-rose-600 dark:text-rose-400"
                          >
                            &bull; {err}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {step === 'importing' && !importing ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// EXPORT CSV — Client-side CSV generation with proper escaping
// ============================================================================

function exportBrandsCSV(brands: Brand[]) {
  const headers = [
    'Code',
    'Name',
    'Description',
    'Company',
    'Products Count',
    'Status',
    'Created Date',
  ]
  const rows = brands.map((b) => [
    b.code,
    b.name,
    b.description || '',
    b.companyName || '',
    String(b.productCount),
    b.isActive ? 'Active' : 'Inactive',
    b.createdDate ? formatDate(b.createdDate) : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      r
        .map((cell) => {
          const str = String(cell)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `brands_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${brands.length} brands to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportBrandsPDF(brands: Brand[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Brands Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Brands: ${brands.length}`, 14, 37)

  // Table data
  const tableData = brands.map((b, idx) => [
    String(idx + 1),
    b.code,
    b.name,
    b.companyName || '\u2014',
    String(b.productCount),
    b.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    startY: 42,
    head: [['Sl', 'Code', 'Name', 'Company', 'Products', 'Status']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [25, 42, 86],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  })

  // Page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 8
    )
  }

  doc.save(`brands_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${brands.length} brands to PDF`)
}

// ============================================================================
// MAIN BRANDS MODULE COMPONENT
// ============================================================================

export function BrandsModule() {
  const { data: brands, loading, error, refetch } = useBrands(false)
  const { data: allBrands, refetch: refetchAll } = useBrands(true)

  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [showInactive, setShowInactive] = React.useState(false)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null)
  const [viewBrand, setViewBrand] = React.useState<Brand | null>(null)
  const [deleteBrand, setDeleteBrand] = React.useState<Brand | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)

  // 400ms debounce for search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Use the right dataset based on showInactive
  const activeData = showInactive ? allBrands : brands

  // Client-side filtering with debounce
  const filtered = React.useMemo(() => {
    if (!activeData) return []
    if (!debouncedSearch) return activeData
    const q = debouncedSearch.toLowerCase()
    return activeData.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.companyName || '').toLowerCase().includes(q)
    )
  }, [activeData, debouncedSearch])

  const totalCount = activeData?.length || 0

  // Handle save (create/update)
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
      toast.success(isEdit ? 'Brand updated successfully' : 'Brand created successfully')
      setFormOpen(false)
      setEditingBrand(null)
      refetch()
      if (showInactive) refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteBrand) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/brands?id=${deleteBrand.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete')
      }
      toast.success('Brand deleted successfully')
      setDeleteBrand(null)
      refetch()
      if (showInactive) refetchAll()
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
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <p className="text-muted-foreground mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-slate-900 dark:text-white" />
            Existing Brands
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {totalCount} brand{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportBrandsCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportBrandsPDF(filtered)}
            disabled={filtered.length === 0}
          >
            <FileText className="h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              setEditingBrand(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands by name, code, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Show Inactive
          </Label>
          <Switch
            checked={showInactive}
            onCheckedChange={setShowInactive}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>
      </div>

      {/* Data Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search
              ? 'No brands match your search'
              : 'No brands found'}
          </p>
          {!search && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setEditingBrand(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first brand
            </Button>
          )}
        </div>
      ) : (
        <Card className="shadow-md border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <TableHead className="text-slate-900 dark:text-white font-semibold w-10">
                  Sl
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold">
                  Code
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold">
                  Name
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold">
                  Company / Manufacturer
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold text-center">
                  Products
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-slate-900 dark:text-white font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((brand, idx) => (
                <TableRow
                  key={brand.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {brand.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="font-medium text-sm">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {brand.companyName ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{brand.companyName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{'\u2014'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-slate-300 dark:border-slate-600"
                    >
                      {brand.productCount}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(brand.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setViewBrand(brand)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingBrand(brand)
                          setFormOpen(true)
                        }}
                        title="Edit brand"
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setDeleteBrand(brand)}
                        title="Delete brand"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Detail Dialog */}
      <BrandViewDialog
        brand={viewBrand}
        open={!!viewBrand}
        onClose={() => setViewBrand(null)}
      />

      {/* Form Sheet */}
      <BrandFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingBrand(null)
        }}
        brand={editingBrand}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <DeleteBrandDialog
        brand={deleteBrand}
        open={!!deleteBrand}
        onClose={() => setDeleteBrand(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch()
          if (showInactive) refetchAll()
        }}
      />
    </div>
  )
}
