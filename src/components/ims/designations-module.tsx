'use client'

// ============================================================================
// Electronics Mart IMS — Designations Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Briefcase,
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
  Info,
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

interface Designation {
  id: string
  code: string
  name: string
  description: string | null
  grade: string | null
  minSalary: number
  maxSalary: number
  isActive: boolean
  isDeleted: boolean
  employeeCount: number
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

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const GRADE_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1']

// ============================================================================
// CUSTOM HOOK: All Designations Data Fetcher
// ============================================================================

function useAllDesignations(url: string) {
  const [data, setData] = React.useState<Designation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : (json.data || []))
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

function getGradeBadge(grade: string | null) {
  if (!grade) return <span className="text-muted-foreground text-xs">\u2014</span>
  const colorMap: Record<string, string> = {
    A1: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    A2: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    B1: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    B2: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    C1: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    C2: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    D1: 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300',
  }
  const colorClass = colorMap[grade] || 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
  return (
    <Badge className={`${colorClass} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
      {grade}
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

function formatSalary(amount: number): string {
  if (amount === 0) return '\u2014'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function truncateDescription(text: string | null, maxLen: number = 40): string {
  if (!text) return '\u2014'
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '\u2026'
}

// ============================================================================
// DESIGNATION VIEW DETAIL DIALOG
// ============================================================================

function DesignationViewDialog({
  designation,
  open,
  onClose,
}: {
  designation: Designation | null
  open: boolean
  onClose: () => void
}) {
  if (!designation) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            {designation.name}
          </DialogTitle>
          <DialogDescription>
            Designation Details &mdash; {designation.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{designation.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(designation.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Grade</span>
              <div className="mt-0.5">{getGradeBadge(designation.grade)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Employees</span>
              <p className="font-semibold mt-0.5">{designation.employeeCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Min Salary</span>
              <p className="font-medium mt-0.5">{formatSalary(designation.minSalary)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Max Salary</span>
              <p className="font-medium mt-0.5">{formatSalary(designation.maxSalary)}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Salary Band Range</span>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatSalary(designation.minSalary)}
                </span>
                <span className="text-muted-foreground">\u2014</span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {formatSalary(designation.maxSalary)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(designation.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(designation.updatedDate)}</p>
            </div>
          </div>

          {/* Description — full in detail view */}
          {designation.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{designation.description}</p>
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
// DESIGNATION FORM SHEET (ADD / EDIT)
// ============================================================================

function DesignationFormSheet({
  open,
  onClose,
  designation,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  designation: Designation | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    grade: '',
    minSalary: '',
    maxSalary: '',
    isActive: true,
  })

  React.useEffect(() => {
    if (designation) {
      setForm({
        name: designation.name,
        description: designation.description || '',
        grade: designation.grade || '',
        minSalary: designation.minSalary ? String(designation.minSalary) : '',
        maxSalary: designation.maxSalary ? String(designation.maxSalary) : '',
        isActive: designation.isActive,
      })
    } else {
      setForm({
        name: '',
        description: '',
        grade: '',
        minSalary: '',
        maxSalary: '',
        isActive: true,
      })
    }
  }, [designation, open])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    const minSalary = Number(form.minSalary) || 0
    const maxSalary = Number(form.maxSalary) || 0
    if (maxSalary > 0 && minSalary > 0 && maxSalary < minSalary) {
      toast.error('Maximum salary must be greater than or equal to minimum salary')
      return
    }

    onSave({
      id: designation?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      grade: form.grade || null,
      minSalary,
      maxSalary,
      isActive: form.isActive,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {designation ? 'Edit Designation' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {designation ? 'Update designation information' : 'Add a new designation record'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-4 p-6">
            {/* Code Field — AUTO-GENERATED, READ-ONLY */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code
              </Label>
              <Input
                value={designation ? designation.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format DSG-00001. Cannot be edited.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Managing Director, Sales Officer, Computer Operator"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this designation..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {/* Grade */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Grade <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select
                value={form.grade || '__none__'}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, grade: val === '__none__' ? '' : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salary Band Info */}
            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Salary Band
                </span>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">
                Define the salary range for this designation level
              </p>
            </div>

            {/* Min Salary */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Min Salary <span className="text-muted-foreground font-normal">(BDT)</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.minSalary}
                onChange={(e) => setForm((f) => ({ ...f, minSalary: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Max Salary */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Salary <span className="text-muted-foreground font-normal">(BDT)</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.maxSalary}
                onChange={(e) => setForm((f) => ({ ...f, maxSalary: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {form.isActive ? 'Designation is currently active' : 'Designation is currently inactive'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  form.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
              ) : designation ? (
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

function DeleteDesignationDialog({
  designation,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  designation: Designation | null
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
            Delete Designation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{designation?.name}&quot;</span>{' '}
            ({designation?.code})?{designation && designation.employeeCount > 0 && (
              <span className="block mt-2 text-rose-600 dark:text-rose-400 font-medium">
                Warning: This designation has {designation.employeeCount} employee(s) assigned.
                Please reassign employees before deleting.
              </span>
            )}
            {designation && designation.employeeCount === 0 && (
              <span className="block mt-2">
                This is a soft-delete &mdash; the record will be marked as deleted
                but preserved in the database.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting || (designation?.employeeCount ?? 0) > 0}
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

  const CSV_COLUMNS = ['name', 'description', 'grade', 'minSalary', 'maxSalary']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    description: 'Description',
    grade: 'Grade',
    minSalary: 'Min Salary',
    maxSalary: 'Max Salary',
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
    const sampleRow = 'Sales Officer,Handles customer sales,B1,15000,30000'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'designations_import_template.csv'
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
    const getIdx = (col: string) => columnMap[col] ? headers.indexOf(columnMap[col]) : -1
    const nameIdx = getIdx('name')
    const descIdx = getIdx('description')
    const gradeIdx = getIdx('grade')
    const minIdx = getIdx('minSalary')
    const maxIdx = getIdx('maxSalary')

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      const gradeVal = gradeIdx >= 0 ? (row[gradeIdx] || '').trim() : ''
      if (gradeVal && !GRADE_OPTIONS.includes(gradeVal)) {
        newErrors.push(`Row ${i + 1}: Invalid grade "${gradeVal}" \u2014 valid: ${GRADE_OPTIONS.join(', ')}`)
      }

      stagingRows.push({
        name: name.trim(),
        description: descIdx >= 0 ? (row[descIdx] || '').trim() : '',
        grade: gradeVal,
        minSalary: minIdx >= 0 ? (row[minIdx] || '0').trim() : '0',
        maxSalary: maxIdx >= 0 ? (row[maxIdx] || '0').trim() : '0',
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
        const res = await fetch('/api/designations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            description: row.description || null,
            grade: row.grade || null,
            minSalary: Number(row.minSalary) || 0,
            maxSalary: Number(row.maxSalary) || 0,
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
            Import Designations from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import designation records
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
                    Required columns: name, description, grade, minSalary, maxSalary
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
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white" onClick={processMapping}>
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
                        <TableHead className="text-xs font-semibold">Grade</TableHead>
                        <TableHead className="text-xs font-semibold">Min Salary</TableHead>
                        <TableHead className="text-xs font-semibold">Max Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs">{row.grade || '\u2014'}</TableCell>
                          <TableCell className="text-xs">{row.minSalary || '\u2014'}</TableCell>
                          <TableCell className="text-xs">{row.maxSalary || '\u2014'}</TableCell>
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
                    Import {staging.length} Designations
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
                    <p className="text-sm text-muted-foreground">Importing designations...</p>
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

function exportDesignationsCSV(designations: Designation[]) {
  const headers = ['Code', 'Name', 'Description', 'Grade', 'Min Salary', 'Max Salary', 'Employees', 'Status', 'Created Date']
  const rows = designations.map((d) => [
    d.code,
    d.name,
    d.description || '',
    d.grade || '',
    String(d.minSalary),
    String(d.maxSalary),
    String(d.employeeCount),
    d.isActive ? 'Active' : 'Inactive',
    d.createdDate ? formatDate(d.createdDate) : '',
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
  link.download = `designations_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${designations.length} designations to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportDesignationsPDF(designations: Designation[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Designations Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Designations: ${designations.length}`, 14, 37)

  // Table data
  const tableData = designations.map((d, idx) => [
    String(idx + 1),
    d.code,
    d.name,
    d.grade || '\u2014',
    String(d.minSalary > 0 ? d.minSalary : '\u2014'),
    String(d.maxSalary > 0 ? d.maxSalary : '\u2014'),
    String(d.employeeCount),
    d.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    head: [['Sl', 'Code', 'Name', 'Grade', 'Min Salary', 'Max Salary', 'Employees', 'Status']],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [25, 42, 86], // navy header #192A56
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

  doc.save(`designations_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${designations.length} designations to PDF`)
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
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
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20" />
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
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center mb-4">
        <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        No designations found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Start by creating your first designation.'}
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
// PAGINATION CONTROLS (client-side)
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
        <span className="text-slate-400">|</span>
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
                pageNum === page ? 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white' : ''
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
// MAIN COMPONENT: DesignationsModule
// ============================================================================

export function DesignationsModule() {
  // Data fetching
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [showInactive, setShowInactive] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build API URL
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams()
    params.set('all', 'true')
    if (debouncedSearch) params.set('search', debouncedSearch)
    return `/api/designations?${params.toString()}`
  }, [debouncedSearch])

  const { data: allDesignations, loading, error, refetch } = useAllDesignations(apiUrl)

  // Client-side filtering
  const filteredDesignations = React.useMemo(() => {
    let result = allDesignations
    if (!showInactive) {
      result = result.filter((d) => d.isActive)
    }
    return result
  }, [allDesignations, showInactive])

  // Client-side pagination
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const pagination = React.useMemo<PaginationInfo>(() => {
    const total = filteredDesignations.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    return { page: Math.min(page, totalPages), pageSize, total, totalPages }
  }, [filteredDesignations.length, page, pageSize])

  const paginatedDesignations = React.useMemo(() => {
    const start = (pagination.page - 1) * pageSize
    return filteredDesignations.slice(start, start + pageSize)
  }, [filteredDesignations, pagination.page, pageSize])

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, showInactive])

  // Form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingDesignation, setEditingDesignation] = React.useState<Designation | null>(null)
  const [saving, setSaving] = React.useState(false)

  // View/Delete state
  const [viewDesignation, setViewDesignation] = React.useState<Designation | null>(null)
  const [deleteDesignation, setDeleteDesignation] = React.useState<Designation | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Import state
  const [importOpen, setImportOpen] = React.useState(false)

  // Save handler
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const method = isEdit ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        grade: data.grade,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        isActive: data.isActive,
      }

      if (isEdit) {
        body.id = data.id
      }

      const res = await fetch('/api/designations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} designation`)
      }

      toast.success(isEdit ? 'Designation updated successfully' : 'Designation created successfully')
      setFormOpen(false)
      setEditingDesignation(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteDesignation) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/designations?id=${deleteDesignation.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error || 'Failed to delete designation')
      }
      toast.success('Designation deleted successfully')
      setDeleteDesignation(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  // Export handlers
  const handleExportCSV = () => {
    if (filteredDesignations.length === 0) {
      toast.error('No data to export')
      return
    }
    exportDesignationsCSV(filteredDesignations)
  }

  const handleExportPDF = () => {
    if (filteredDesignations.length === 0) {
      toast.error('No data to export')
      return
    }
    exportDesignationsPDF(filteredDesignations)
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
            <Briefcase className="h-6 w-6 text-amber-500" />
            Existing Designations
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage job designations, grades, and salary bands
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="border-slate-200 dark:border-slate-700"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-200 dark:border-slate-700"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          {/* Export PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="border-slate-200 dark:border-slate-700"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
          {/* Create new */}
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => {
              setEditingDesignation(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SEARCH BAR & FILTERS                                               */}
      {/* ================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, grade, or description..."
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

        {/* Show Inactive Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={showInactive}
            onClick={() => setShowInactive(!showInactive)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              showInactive ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                showInactive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <Label className="text-xs font-medium text-muted-foreground cursor-pointer" onClick={() => setShowInactive(!showInactive)}>
            Show Inactive
          </Label>
        </div>

        {/* Row count */}
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredDesignations.length} of {allDesignations.length} designations
        </span>
      </div>

      {/* ================================================================== */}
      {/* DATA TABLE                                                         */}
      {/* ================================================================== */}
      {loading && !allDesignations.length ? (
        <LoadingSkeleton />
      ) : !filteredDesignations.length ? (
        <EmptyState hasFilters={!!searchQuery || showInactive} onClear={() => { setSearchQuery(''); setShowInactive(false); }} />
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[50px]">Sl</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[120px]">Code</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[80px] text-center">Grade</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[110px] text-right">Min Salary</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[110px] text-right">Max Salary</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[90px] text-center">Employees</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[90px] text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDesignations.map((designation, idx) => {
                    const sl = (pagination.page - 1) * pagination.pageSize + idx + 1
                    return (
                      <TableRow key={designation.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <TableCell className="text-xs text-muted-foreground font-medium">{sl}</TableCell>
                        <TableCell className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{designation.code}</TableCell>
                        <TableCell className="text-sm font-medium">{designation.name}</TableCell>
                        <TableCell className="text-center">{getGradeBadge(designation.grade)}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatSalary(designation.minSalary)}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{formatSalary(designation.maxSalary)}</TableCell>
                        <TableCell className="text-sm text-center font-medium">{designation.employeeCount}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(designation.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                              onClick={() => setViewDesignation(designation)}
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                              onClick={() => {
                                setEditingDesignation(designation)
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
                              onClick={() => setDeleteDesignation(designation)}
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
      <DesignationFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingDesignation(null)
        }}
        designation={editingDesignation}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <DesignationViewDialog
        designation={viewDesignation}
        open={!!viewDesignation}
        onClose={() => setViewDesignation(null)}
      />

      {/* Delete Confirmation */}
      <DeleteDesignationDialog
        designation={deleteDesignation}
        open={!!deleteDesignation}
        onClose={() => setDeleteDesignation(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
