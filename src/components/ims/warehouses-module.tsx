'use client'

// ============================================================================
// Electronics Mart IMS — Warehouses (Godowns) Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Warehouse,
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
  MapPin,
  Phone,
  User,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
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

interface WarehouseItem {
  id: string
  code: string
  name: string
  address: string | null
  phone: string | null
  managerName: string | null
  type: string
  capacity: number | null
  isActive: boolean
  isDeleted: boolean
  stockCount: number
  adjustmentCount: number
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WAREHOUSE_TYPES = ['General', 'Cold Storage', 'Hazardous'] as const

// ============================================================================
// CUSTOM HOOK: All Data Fetcher (for grid + export)
// ============================================================================

function useAllData(baseUrl: string) {
  const [data, setData] = React.useState<WarehouseItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(baseUrl)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================================================
// HELPERS
// ============================================================================

function getWarehouseTypeBadge(type: string) {
  const colorMap: Record<string, string> = {
    'General': 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300',
    'Cold Storage': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    'Hazardous': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  }
  return (
    <Badge className={`${colorMap[type] || 'bg-slate-100 text-slate-700'} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
      {type}
    </Badge>
  )
}

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
// WAREHOUSE VIEW DETAIL DIALOG
// ============================================================================

function WarehouseViewDialog({
  warehouse,
  open,
  onClose,
}: {
  warehouse: WarehouseItem | null
  open: boolean
  onClose: () => void
}) {
  if (!warehouse) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-amber-500" />
            {warehouse.name}
          </DialogTitle>
          <DialogDescription>
            Warehouse Details &mdash; {warehouse.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{warehouse.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(warehouse.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Type</span>
              <div className="mt-0.5">{getWarehouseTypeBadge(warehouse.type)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Capacity</span>
              <p className="font-semibold mt-0.5">{warehouse.capacity != null ? warehouse.capacity.toLocaleString() : '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Manager</span>
              <p className="font-medium mt-0.5">{warehouse.managerName || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Phone</span>
              <p className="font-medium mt-0.5">{warehouse.phone || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Stock Items</span>
              <p className="font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">{warehouse.stockCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(warehouse.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(warehouse.updatedDate)}</p>
            </div>
          </div>

          {/* Address */}
          {warehouse.address && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Address</span>
              <p className="text-sm mt-0.5 leading-relaxed flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {warehouse.address}
              </p>
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
// WAREHOUSE FORM SHEET (ADD / EDIT)
// ============================================================================

function WarehouseFormSheet({
  open,
  onClose,
  warehouse,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  warehouse: WarehouseItem | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    address: '',
    phone: '',
    managerName: '',
    type: 'General',
    capacity: '',
    isActive: true,
  })

  React.useEffect(() => {
    if (warehouse) {
      setForm({
        name: warehouse.name,
        address: warehouse.address || '',
        phone: warehouse.phone || '',
        managerName: warehouse.managerName || '',
        type: warehouse.type || 'General',
        capacity: warehouse.capacity != null ? String(warehouse.capacity) : '',
        isActive: warehouse.isActive,
      })
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        managerName: '',
        type: 'General',
        capacity: '',
        isActive: true,
      })
    }
  }, [warehouse, open])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    onSave({
      id: warehouse?.id,
      name: form.name.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      managerName: form.managerName.trim() || null,
      type: form.type,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      isActive: form.isActive,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {warehouse ? 'Edit Warehouse' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {warehouse ? 'Update warehouse information' : 'Add a new warehouse / godown record'}
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
                value={warehouse ? warehouse.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format WHS-00001. Cannot be edited.
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
                placeholder="e.g. Main Warehouse"
                autoFocus
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Address <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Full warehouse address..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background pl-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+880 1XXX-XXXXXX"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Manager Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Manager Name <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.managerName}
                  onChange={(e) => setForm((f) => ({ ...f, managerName: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Type
              </Label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm((f) => ({ ...f, type: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select warehouse type..." />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Capacity <span className="text-muted-foreground font-normal">(volumetric, optional)</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="e.g. 5000"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive warehouses won&apos;t appear in default lists
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
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
              ) : warehouse ? (
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

function DeleteWarehouseDialog({
  warehouse,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  warehouse: WarehouseItem | null
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
            Delete Warehouse
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{warehouse?.name}&quot;</span>{' '}
            ({warehouse?.code})? This is a soft-delete &mdash; the record will be marked as deleted
            but preserved in the database.
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

  const CSV_COLUMNS = ['name', 'address', 'phone', 'managerName', 'type', 'capacity']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    address: 'Address',
    phone: 'Phone',
    managerName: 'Manager Name',
    type: 'Type (General/Cold Storage/Hazardous)',
    capacity: 'Capacity (number)',
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
    const sampleRow = 'Main Warehouse,"123 Industrial Area, Dhaka",+880 1712-345678,John Doe,General,5000'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'warehouses_import_template.csv'
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
          (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, '')
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
    const addrIdx = columnMap['address'] ? headers.indexOf(columnMap['address']) : -1
    const phoneIdx = columnMap['phone'] ? headers.indexOf(columnMap['phone']) : -1
    const mgrIdx = columnMap['managerName'] ? headers.indexOf(columnMap['managerName']) : -1
    const typeIdx = columnMap['type'] ? headers.indexOf(columnMap['type']) : -1
    const capIdx = columnMap['capacity'] ? headers.indexOf(columnMap['capacity']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      const whType = typeIdx >= 0 ? (row[typeIdx] || '').trim() : ''
      if (whType && !WAREHOUSE_TYPES.includes(whType as typeof WAREHOUSE_TYPES[number])) {
        newErrors.push(`Row ${i + 1}: Invalid warehouse type "${whType}"`)
      }

      const capacity = capIdx >= 0 ? (row[capIdx] || '').trim() : ''
      if (capacity && isNaN(parseInt(capacity))) {
        newErrors.push(`Row ${i + 1}: Invalid capacity "${capacity}"`)
      }

      stagingRows.push({
        name: name.trim(),
        address: addrIdx >= 0 ? (row[addrIdx] || '').trim() : '',
        phone: phoneIdx >= 0 ? (row[phoneIdx] || '').trim() : '',
        managerName: mgrIdx >= 0 ? (row[mgrIdx] || '').trim() : '',
        type: whType || 'General',
        capacity: capacity && !isNaN(parseInt(capacity)) ? capacity : '',
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
        const res = await fetch('/api/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            address: row.address || null,
            phone: row.phone || null,
            managerName: row.managerName || null,
            type: row.type,
            capacity: row.capacity ? parseInt(row.capacity) : null,
            isActive: true,
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
            Import Warehouses from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import warehouse records
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
                    Required columns: name, type (General/Cold Storage/Hazardous)
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
                      <p key={i} className="text-xs text-rose-600 dark:text-rose-400">{err}</p>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            )}

            {/* Step: Column Mapping */}
            {step === 'mapping' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">File:</span> {file?.name} &mdash; {rawRows.length - 1} data rows
                </div>

                <div className="space-y-3">
                  {CSV_COLUMNS.map((col) => (
                    <div key={col} className="grid grid-cols-2 gap-3 items-center">
                      <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                        {CSV_LABELS[col]}
                        {col === 'name' && <span className="text-rose-500 ml-1">*</span>}
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
                  <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white" onClick={processMapping}>
                    Preview Data
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Preview / Staging */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">{staging.length}</span> rows ready for import
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
                        <TableHead className="text-xs font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Manager</TableHead>
                        <TableHead className="text-xs font-semibold">Capacity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs">{row.type}</TableCell>
                          <TableCell className="text-xs">{row.managerName || '\u2014'}</TableCell>
                          <TableCell className="text-xs font-mono">{row.capacity || '\u2014'}</TableCell>
                        </TableRow>
                      ))}
                      {staging.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-xs text-center text-muted-foreground">
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
                    Import {staging.length} Warehouses
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
                    <p className="text-sm text-muted-foreground">Importing warehouses...</p>
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
                          <p key={i} className="text-xs text-rose-600 dark:text-rose-400">
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

function exportWarehousesCSV(warehouses: WarehouseItem[]) {
  const headers = ['Code', 'Name', 'Address', 'Phone', 'Manager', 'Type', 'Capacity', 'Stock Items', 'Status', 'Created Date']
  const rows = warehouses.map((w) => [
    w.code,
    w.name,
    w.address || '',
    w.phone || '',
    w.managerName || '',
    w.type,
    w.capacity != null ? String(w.capacity) : '',
    String(w.stockCount),
    w.isActive ? 'Active' : 'Inactive',
    w.createdDate ? formatDate(w.createdDate) : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      r.map((cell) => {
        const str = String(cell)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `warehouses_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${warehouses.length} warehouses to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportWarehousesPDF(warehouses: WarehouseItem[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Warehouses Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Warehouses: ${warehouses.length}`, 14, 37)

  // Table data
  const tableData = warehouses.map((w, idx) => [
    String(idx + 1),
    w.code,
    w.name,
    w.managerName || '\u2014',
    w.type,
    w.capacity != null ? String(w.capacity) : '\u2014',
    String(w.stockCount),
    w.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    startY: 42,
    head: [['Sl', 'Code', 'Name', 'Manager', 'Type', 'Capacity', 'Stock', 'Status']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [25, 42, 86],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
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
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  doc.save(`warehouses_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${warehouses.length} warehouses to PDF`)
}

// ============================================================================
// MAIN WAREHOUSES MODULE COMPONENT
// ============================================================================

export function WarehousesModule() {
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [showInactive, setShowInactive] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingWarehouse, setEditingWarehouse] = React.useState<WarehouseItem | null>(null)
  const [viewingWarehouse, setViewingWarehouse] = React.useState<WarehouseItem | null>(null)
  const [deletingWarehouse, setDeletingWarehouse] = React.useState<WarehouseItem | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Build API URL
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams()
    params.set('all', 'true')
    if (debouncedSearch) params.set('search', debouncedSearch)
    return `/api/warehouses?${params.toString()}`
  }, [debouncedSearch])

  const { data: allWarehouses, loading, error, refetch } = useAllData(apiUrl)

  // Client-side filter by active status
  const filteredWarehouses = React.useMemo(() => {
    if (showInactive) return allWarehouses
    return allWarehouses.filter((w) => w.isActive)
  }, [allWarehouses, showInactive])

  // CRUD handlers
  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const isEdit = !!data.id
      const res = await fetch('/api/warehouses', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} warehouse`)
      }
      toast.success(isEdit ? 'Warehouse updated successfully' : 'Warehouse created successfully')
      setFormOpen(false)
      setEditingWarehouse(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingWarehouse) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/warehouses?id=${deletingWarehouse.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete warehouse')
      }
      toast.success('Warehouse deleted successfully')
      setDeletingWarehouse(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (wh: WarehouseItem) => {
    setEditingWarehouse(wh)
    setFormOpen(true)
  }

  const openCreate = () => {
    setEditingWarehouse(null)
    setFormOpen(true)
  }

  // Export all data (need to fetch with all=true, no search filter)
  const { data: exportData } = useAllData('/api/warehouses?all=true')

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Card>
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <XCircle className="h-12 w-12 text-rose-400" />
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 dark:bg-slate-800">
            <Warehouse className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Existing Warehouses</h2>
            <p className="text-xs text-muted-foreground">
              {filteredWarehouses.length} of {allWarehouses.length} warehouses
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create new
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, address, manager..."
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Show Inactive Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-background">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
            className="scale-75"
          />
          <Label htmlFor="show-inactive" className="text-xs cursor-pointer select-none">
            Show Inactive
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            title="Import CSV"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportWarehousesCSV(exportData)}
            title="Export CSV"
          >
            <Download className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportWarehousesPDF(exportData)}
            title="Export PDF"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Data Grid */}
      {filteredWarehouses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
            <Warehouse className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-muted-foreground text-sm">
              {search ? 'No warehouses match your search' : 'No warehouses found'}
            </p>
            {!search && (
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first warehouse
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <TableHead className="text-xs font-semibold w-10">Sl</TableHead>
                    <TableHead className="text-xs font-semibold">Code</TableHead>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Address</TableHead>
                    <TableHead className="text-xs font-semibold">Manager</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Capacity</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Stock Items</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.map((wh, idx) => (
                    <TableRow key={wh.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-mono font-medium">{wh.code}</TableCell>
                      <TableCell className="text-sm font-medium">{wh.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {wh.address || '\u2014'}
                      </TableCell>
                      <TableCell className="text-xs">{wh.managerName || '\u2014'}</TableCell>
                      <TableCell>{getWarehouseTypeBadge(wh.type)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {wh.capacity != null ? wh.capacity.toLocaleString() : '\u2014'}
                      </TableCell>
                      <TableCell className="text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {wh.stockCount}
                      </TableCell>
                      <TableCell>{getStatusBadge(wh.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setViewingWarehouse(wh)}
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(wh)}
                            title="Edit warehouse"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setDeletingWarehouse(wh)}
                            title="Delete warehouse"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Sheet */}
      <WarehouseFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingWarehouse(null)
        }}
        warehouse={editingWarehouse}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <WarehouseViewDialog
        warehouse={viewingWarehouse}
        open={!!viewingWarehouse}
        onClose={() => setViewingWarehouse(null)}
      />

      {/* Delete Confirmation */}
      <DeleteWarehouseDialog
        warehouse={deletingWarehouse}
        open={!!deletingWarehouse}
        onClose={() => setDeletingWarehouse(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
