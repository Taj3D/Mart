'use client'

// ============================================================================
// Electronics Mart IMS — Investment Heads Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Landmark,
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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

interface InvestmentHead {
  id: string
  code: string
  name: string
  description: string | null
  investmentType: string
  openingBalance: number
  openingType: string
  isActive: boolean
  isDeleted: boolean
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface ApiResponse {
  data: InvestmentHead[]
  pagination: PaginationInfo
}

interface AllApiResponse {
  data: InvestmentHead[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INVESTMENT_TYPES = ['Fixed Asset', 'Current Asset', 'Liability', 'PF', 'FDR', 'Security'] as const

const OPENING_TYPES = ['Payment', 'Receive'] as const

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================================================
// CUSTOM HOOK: Paginated API Data Fetcher
// ============================================================================

function usePaginatedData(url: string) {
  const [data, setData] = React.useState<InvestmentHead[]>([])
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json: ApiResponse = await res.json()
      setData(json.data || [])
      setPagination(json.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, pagination, loading, error, refetch: fetchData }
}

// ============================================================================
// CUSTOM HOOK: All Data Fetcher (for export, no pagination)
// ============================================================================

function useAllData(url: string) {
  const [data, setData] = React.useState<InvestmentHead[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json: AllApiResponse = await res.json()
      setData(json.data || [])
    } catch {
      // silent — used for export only
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}

// ============================================================================
// HELPERS
// ============================================================================

function getInvestmentTypeBadge(type: string) {
  const colorMap: Record<string, string> = {
    'Fixed Asset': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    'Current Asset': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'Liability': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    'PF': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    'FDR': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    'Security': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  }
  return (
    <Badge className={`${colorMap[type] || 'bg-slate-100 text-slate-700'} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
      {type}
    </Badge>
  )
}

function getOpeningTypeBadge(type: string) {
  if (type === 'Receive') {
    return (
      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] font-semibold px-1.5 py-0.5">
        Receive
      </Badge>
    )
  }
  return (
    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0 text-[10px] font-semibold px-1.5 py-0.5">
      Payment
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ============================================================================
// INVESTMENT HEAD VIEW DETAIL DIALOG
// ============================================================================

function InvestmentHeadViewDialog({
  head,
  open,
  onClose,
}: {
  head: InvestmentHead | null
  open: boolean
  onClose: () => void
}) {
  if (!head) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-amber-500" />
            {head.name}
          </DialogTitle>
          <DialogDescription>
            Investment Head Details &mdash; {head.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{head.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(head.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Investment Type</span>
              <div className="mt-0.5">{getInvestmentTypeBadge(head.investmentType)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Opening Type</span>
              <div className="mt-0.5">{getOpeningTypeBadge(head.openingType)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Opening Balance</span>
              <p className="font-semibold mt-0.5">&#2547; {formatCurrency(head.openingBalance)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(head.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(head.updatedDate)}</p>
            </div>
          </div>

          {/* Description */}
          {head.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{head.description}</p>
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
// INVESTMENT HEAD FORM SHEET (ADD / EDIT)
// ============================================================================

function InvestmentHeadFormSheet({
  open,
  onClose,
  head,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  head: InvestmentHead | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    investmentType: '',
    openingBalance: 0,
    openingType: '',
  })

  React.useEffect(() => {
    if (head) {
      setForm({
        name: head.name,
        description: head.description || '',
        investmentType: head.investmentType,
        openingBalance: head.openingBalance,
        openingType: head.openingType,
      })
    } else {
      setForm({
        name: '',
        description: '',
        investmentType: '',
        openingBalance: 0,
        openingType: '',
      })
    }
  }, [head, open])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!form.investmentType) {
      toast.error('Investment Type is required')
      return
    }
    if (!form.openingType) {
      toast.error('Opening Type is required')
      return
    }
    onSave({
      ...form,
      id: head?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      openingBalance: parseFloat(String(form.openingBalance)) || 0,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-navy-600 text-white px-6 py-4 border-b border-navy-500">
          <SheetTitle className="text-white text-lg">
            {head ? 'Edit Investment Head' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {head ? 'Update investment head information' : 'Add a new investment head record'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-4 p-6">
            {/* Code Field — AUTO-GENERATED, READ-ONLY */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Code
              </Label>
              <Input
                value={head ? head.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format INVH-00001. Cannot be edited.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Office Building"
                autoFocus
              />
            </div>

            {/* Investment Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Investment Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.investmentType}
                onValueChange={(val) => setForm((f) => ({ ...f, investmentType: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select investment type..." />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opening Balance */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Opening Balance
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">&#2547;</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.openingBalance}
                  onChange={(e) => setForm((f) => ({ ...f, openingBalance: parseFloat(e.target.value) || 0 }))}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Opening Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Opening Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.openingType}
                onValueChange={(val) => setForm((f) => ({ ...f, openingType: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select opening type..." />
                </SelectTrigger>
                <SelectContent>
                  {OPENING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this investment head..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
              ) : head ? (
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

function DeleteInvestmentHeadDialog({
  head,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  head: InvestmentHead | null
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
            Delete Investment Head
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{head?.name}&quot;</span>{' '}
            ({head?.code})? This is a soft-delete &mdash; the record will be marked as deleted
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

  const CSV_COLUMNS = ['name', 'investmentType', 'openingBalance', 'openingType', 'description']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    investmentType: 'Investment Type (Fixed Asset/Current Asset/Liability/PF/FDR/Security)',
    openingBalance: 'Opening Balance (number)',
    openingType: 'Opening Type (Payment/Receive)',
    description: 'Description',
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
    const sampleRow = 'Office Building,Fixed Asset,50000.00,Payment,Main office building asset'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'investment_heads_import_template.csv'
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
    const typeIdx = columnMap['investmentType'] ? headers.indexOf(columnMap['investmentType']) : -1
    const balIdx = columnMap['openingBalance'] ? headers.indexOf(columnMap['openingBalance']) : -1
    const otIdx = columnMap['openingType'] ? headers.indexOf(columnMap['openingType']) : -1
    const descIdx = columnMap['description'] ? headers.indexOf(columnMap['description']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      const investmentType = typeIdx >= 0 ? (row[typeIdx] || '').trim() : ''
      if (investmentType && !INVESTMENT_TYPES.includes(investmentType as typeof INVESTMENT_TYPES[number])) {
        newErrors.push(`Row ${i + 1}: Invalid investment type "${investmentType}"`)
      }

      const openingType = otIdx >= 0 ? (row[otIdx] || '').trim() : ''
      if (openingType && !OPENING_TYPES.includes(openingType as typeof OPENING_TYPES[number])) {
        newErrors.push(`Row ${i + 1}: Invalid opening type "${openingType}"`)
      }

      const balance = balIdx >= 0 ? (row[balIdx] || '0').trim() : '0'
      const balanceNum = parseFloat(balance)
      if (isNaN(balanceNum)) {
        newErrors.push(`Row ${i + 1}: Invalid opening balance "${balance}"`)
      }

      stagingRows.push({
        name: name.trim(),
        investmentType: investmentType || 'Fixed Asset',
        openingBalance: isNaN(balanceNum) ? '0' : String(balanceNum),
        openingType: openingType || 'Payment',
        description: descIdx >= 0 ? (row[descIdx] || '').trim() : '',
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
        const res = await fetch('/api/investment-heads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            investmentType: row.investmentType,
            openingBalance: parseFloat(row.openingBalance) || 0,
            openingType: row.openingType,
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
            Import Investment Heads from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import investment head records
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
                      : 'border-navy-300 dark:border-navy-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileSpreadsheet className="h-12 w-12 text-navy-300 dark:text-navy-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag &amp; drop a CSV file here, or click to browse
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Required columns: name, investmentType, openingBalance, openingType
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
                <div className="bg-navy-50 dark:bg-navy-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">File:</span> {file?.name} &mdash; {rawRows.length - 1} data rows
                </div>

                <div className="space-y-3">
                  {CSV_COLUMNS.map((col) => (
                    <div key={col} className="grid grid-cols-2 gap-3 items-center">
                      <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
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
                  <Button className="bg-navy-600 hover:bg-navy-700 text-white" onClick={processMapping}>
                    Preview Data
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Preview / Staging */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="bg-navy-50 dark:bg-navy-900/20 rounded-lg p-3 text-sm">
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
                      <TableRow className="bg-navy-50 dark:bg-navy-900/30">
                        <TableHead className="text-xs font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-xs font-semibold">Balance</TableHead>
                        <TableHead className="text-xs font-semibold">Open Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs">{row.investmentType}</TableCell>
                          <TableCell className="text-xs font-mono">{row.openingBalance}</TableCell>
                          <TableCell className="text-xs">{row.openingType}</TableCell>
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
                    Import {staging.length} Investment Heads
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Importing / Result */}
            {step === 'importing' && (
              <div className="space-y-4 text-center py-4">
                {importing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-navy-400 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Importing investment heads...</p>
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

function exportInvestmentHeadsCSV(heads: InvestmentHead[]) {
  const headers = ['Code', 'Name', 'Investment Type', 'Opening Balance', 'Opening Type', 'Active', 'Description', 'Created Date']
  const rows = heads.map((h) => [
    h.code,
    h.name,
    h.investmentType,
    String(h.openingBalance),
    h.openingType,
    h.isActive ? 'Yes' : 'No',
    h.description || '',
    h.createdDate ? formatDate(h.createdDate) : '',
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
  link.download = `investment_heads_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${heads.length} investment heads to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportInvestmentHeadsPDF(heads: InvestmentHead[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Investment Heads Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Investment Heads: ${heads.length}`, 14, 37)

  // Table data
  const tableData = heads.map((h, idx) => [
    String(idx + 1),
    h.code,
    h.name,
    h.investmentType,
    formatCurrency(h.openingBalance),
    h.openingType,
    h.isActive ? 'Active' : 'Inactive',
    h.createdDate ? formatDate(h.createdDate) : '\u2014',
  ])

  autoTable(doc, {
    head: [['Sl', 'Code', 'Name', 'Investment Type', 'Opening Balance', 'Opening Type', 'Status', 'Created']],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [25, 42, 86], // navy-800
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 252],
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
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`investment_heads_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${heads.length} investment heads to PDF`)
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      {/* Search skeleton */}
      <Skeleton className="h-10 w-full max-w-sm" />
      {/* Table skeleton */}
      <Card className="shadow-md">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-full bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center mb-4">
        <Landmark className="h-10 w-10 text-navy-300 dark:text-navy-600" />
      </div>
      <h3 className="text-lg font-semibold text-navy-700 dark:text-navy-300 mb-1">
        No investment heads found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Start by creating your first investment head.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// PAGINATION CONTROLS
// ============================================================================

function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const { page, pageSize, total, totalPages } = pagination
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          Showing {startItem}\u2013{endItem} of {total} records
        </span>
        <span className="text-navy-400">|</span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => onPageSizeChange(parseInt(val))}
        >
          <SelectTrigger className="h-7 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (page <= 3) {
            pageNum = i + 1
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = page - 2 + i
          }
          return (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="icon"
              className={`h-7 w-7 text-xs ${
                pageNum === page ? 'bg-navy-600 hover:bg-navy-700 text-white' : ''
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT: InvestmentHeadsModule
// ============================================================================

export function InvestmentHeadsModule() {
  // Paginated data with search
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // reset to first page on search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build API URL with pagination and search
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (debouncedSearch) params.set('search', debouncedSearch)
    return `/api/investment-heads?${params.toString()}`
  }, [page, pageSize, debouncedSearch])

  const { data: heads, pagination, loading, error, refetch } = usePaginatedData(apiUrl)

  // All data for export
  const { data: allHeads, refetch: refetchAll } = useAllData('/api/investment-heads?all=true')

  // Form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingHead, setEditingHead] = React.useState<InvestmentHead | null>(null)
  const [saving, setSaving] = React.useState(false)

  // View/Delete state
  const [viewHead, setViewHead] = React.useState<InvestmentHead | null>(null)
  const [deleteHead, setDeleteHead] = React.useState<InvestmentHead | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Import state
  const [importOpen, setImportOpen] = React.useState(false)

  // Save handler
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const url = isEdit ? `/api/investment-heads/${data.id}` : '/api/investment-heads'
      const method = isEdit ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        name: data.name,
        investmentType: data.investmentType,
        openingBalance: data.openingBalance,
        openingType: data.openingType,
        description: data.description,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} investment head`)
      }

      toast.success(isEdit ? 'Investment head updated successfully' : 'Investment head created successfully')
      setFormOpen(false)
      setEditingHead(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteHead) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/investment-heads/${deleteHead.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || 'Failed to delete investment head')
      }
      toast.success('Investment head deleted successfully')
      setDeleteHead(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  // Export handlers
  const handleExportCSV = async () => {
    await refetchAll()
    // Use setTimeout to allow state to update
    setTimeout(() => {
      const data = allHeads.length > 0 ? allHeads : heads
      if (data.length === 0) {
        toast.error('No data to export')
        return
      }
      exportInvestmentHeadsCSV(data)
    }, 200)
  }

  const handleExportPDF = async () => {
    await refetchAll()
    setTimeout(() => {
      const data = allHeads.length > 0 ? allHeads : heads
      if (data.length === 0) {
        toast.error('No data to export')
        return
      }
      exportInvestmentHeadsPDF(data)
    }, 200)
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="shadow-md border-rose-200 dark:border-rose-800">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300 mb-1">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ================================================================== */}
      {/* HEADER BAR                                                         */}
      {/* ================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="h-6 w-6 text-amber-500" />
            Existing Investment Heads
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your investment head accounts and categories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="border-navy-200 dark:border-navy-700"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-navy-200 dark:border-navy-700"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          {/* Export PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="border-navy-200 dark:border-navy-700"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
          {/* Create new */}
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              setEditingHead(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SEARCH BAR                                                         */}
      {/* ================================================================== */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or code..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ================================================================== */}
      {/* DATA TABLE                                                         */}
      {/* ================================================================== */}
      {loading && !heads.length ? (
        <LoadingSkeleton />
      ) : !heads.length ? (
        <EmptyState hasFilters={!!searchQuery} onClear={clearSearch} />
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy-50 dark:bg-navy-900/30 hover:bg-navy-50 dark:hover:bg-navy-900/30">
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[50px]">Sl</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[120px]">Code</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300">Name</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[140px]">Investment Type</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[130px] text-right">Opening Balance</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[110px]">Opening Type</TableHead>
                    <TableHead className="text-xs font-semibold text-navy-700 dark:text-navy-300 w-[100px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heads.map((head, idx) => {
                    const sl = (pagination.page - 1) * pagination.pageSize + idx + 1
                    return (
                      <TableRow key={head.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                        <TableCell className="text-xs text-muted-foreground font-medium">{sl}</TableCell>
                        <TableCell className="font-mono text-xs font-medium text-navy-600 dark:text-navy-400">{head.code}</TableCell>
                        <TableCell className="text-sm font-medium">{head.name}</TableCell>
                        <TableCell>{getInvestmentTypeBadge(head.investmentType)}</TableCell>
                        <TableCell className="text-sm font-mono text-right">&#2547; {formatCurrency(head.openingBalance)}</TableCell>
                        <TableCell>{getOpeningTypeBadge(head.openingType)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-navy-500 hover:text-navy-700 dark:text-navy-400 dark:hover:text-navy-200"
                              onClick={() => setViewHead(head)}
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                              onClick={() => {
                                setEditingHead(head)
                                setFormOpen(true)
                              }}
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                              onClick={() => setDeleteHead(head)}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 0 && (
              <div className="px-4 pb-4">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* DIALOGS & SHEETS                                                   */}
      {/* ================================================================== */}

      {/* Create / Edit Form Sheet */}
      <InvestmentHeadFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingHead(null)
        }}
        head={editingHead}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <InvestmentHeadViewDialog
        head={viewHead}
        open={!!viewHead}
        onClose={() => setViewHead(null)}
      />

      {/* Delete Confirmation */}
      <DeleteInvestmentHeadDialog
        head={deleteHead}
        open={!!deleteHead}
        onClose={() => setDeleteHead(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch()
          refetchAll()
        }}
      />
    </div>
  )
}
