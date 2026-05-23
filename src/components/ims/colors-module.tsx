'use client'

// ============================================================================
// Electronics Mart IMS — Colors Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Palette,
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

interface ColorRecord {
  id: string
  code: string
  name: string
  hexCode: string | null
  isActive: boolean
  isDeleted: boolean
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface ApiResponse {
  data: ColorRecord[]
}

// ============================================================================
// CUSTOM HOOK: All Data Fetcher
// ============================================================================

function useColorsData(url: string) {
  const [data, setData] = React.useState<ColorRecord[]>([])
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function isValidHexCode(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

// ============================================================================
// COLOR VIEW DETAIL DIALOG
// ============================================================================

function ColorViewDialog({
  color,
  open,
  onClose,
}: {
  color: ColorRecord | null
  open: boolean
  onClose: () => void
}) {
  if (!color) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-500" />
            {color.name}
          </DialogTitle>
          <DialogDescription>
            Color Details &mdash; {color.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Color Swatch Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div
              className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm"
              style={{ backgroundColor: color.hexCode || '#CCCCCC' }}
            />
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{color.name}</p>
              <p className="text-sm font-mono text-muted-foreground">{color.hexCode || 'No hex code'}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{color.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(color.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Hex Code</span>
              <p className="font-mono font-medium mt-0.5">{color.hexCode || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(color.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(color.updatedDate)}</p>
            </div>
          </div>
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
// COLOR FORM SHEET (ADD / EDIT)
// ============================================================================

function ColorFormSheet({
  open,
  onClose,
  color,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  color: ColorRecord | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    hexCode: '',
    isActive: true,
  })

  React.useEffect(() => {
    if (color) {
      setForm({
        name: color.name,
        hexCode: color.hexCode || '',
        isActive: color.isActive,
      })
    } else {
      setForm({
        name: '',
        hexCode: '',
        isActive: true,
      })
    }
  }, [color, open])

  const handleHexFromPicker = (val: string) => {
    setForm((f) => ({ ...f, hexCode: val.toUpperCase() }))
  }

  const handleHexFromInput = (val: string) => {
    // Auto-add # prefix if missing
    let hex = val.trim()
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex
    }
    setForm((f) => ({ ...f, hexCode: hex.toUpperCase() }))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (form.hexCode && !isValidHexCode(form.hexCode)) {
      toast.error('Invalid hex code format. Use #RRGGBB (e.g., #FF0000)')
      return
    }
    onSave({
      ...form,
      id: color?.id,
      name: form.name.trim(),
      hexCode: form.hexCode.trim() || null,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {color ? 'Edit Color' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-slate-300">
            {color ? 'Update color information' : 'Add a new color record'}
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
                value={color ? color.code : 'Auto: CLR-XXXXX'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format CLR-00001. Cannot be edited.
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
                placeholder="e.g. Midnight Blue"
                autoFocus
              />
            </div>

            {/* Hex Code with Color Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hex Code
              </Label>
              <div className="flex items-center gap-3">
                {/* Color Picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={form.hexCode && isValidHexCode(form.hexCode) ? form.hexCode : '#000000'}
                    onChange={(e) => handleHexFromPicker(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-600 cursor-pointer p-0.5"
                    style={{ appearance: 'auto' }}
                  />
                </div>
                {/* Text Input */}
                <Input
                  value={form.hexCode}
                  onChange={(e) => handleHexFromInput(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1 font-mono"
                  maxLength={7}
                />
                {/* Live Swatch Preview */}
                <div
                  className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-600 shadow-sm shrink-0"
                  style={{
                    backgroundColor: form.hexCode && isValidHexCode(form.hexCode) ? form.hexCode : '#CCCCCC',
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Click the color swatch to pick, or type a hex code (e.g., #FF0000)
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between gap-3 py-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active
              </Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20">
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
              ) : color ? (
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

function DeleteColorDialog({
  color,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  color: ColorRecord | null
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
            Delete Color
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{color?.name}&quot;</span>{' '}
            ({color?.code})? This is a soft-delete &mdash; the record will be marked as deleted
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

  const CSV_COLUMNS = ['name', 'hexCode']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    hexCode: 'Hex Code (e.g., #FF0000)',
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
    const sampleRow = 'Midnight Blue,#1E3A5F'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colors_import_template.csv'
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
    const hexIdx = columnMap['hexCode'] ? headers.indexOf(columnMap['hexCode']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      const hexCode = hexIdx >= 0 ? (row[hexIdx] || '').trim() : ''
      if (hexCode && !isValidHexCode(hexCode)) {
        newErrors.push(`Row ${i + 1}: Invalid hex code "${hexCode}" (use #RRGGBB format)`)
      }

      stagingRows.push({
        name: name.trim(),
        hexCode: hexCode || '',
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
        const res = await fetch('/api/colors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            hexCode: row.hexCode || null,
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
            Import Colors from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import color records
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
                    Required columns: name, hexCode (optional)
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
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm">
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
                  <Button className="bg-slate-800 hover:bg-slate-900 text-white" onClick={processMapping}>
                    Preview Data
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Preview / Staging */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm">
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
                      <TableRow className="bg-slate-50 dark:bg-slate-800/30">
                        <TableHead className="text-xs font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-semibold">Hex Code</TableHead>
                        <TableHead className="text-xs font-semibold">Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs font-mono">{row.hexCode || '\u2014'}</TableCell>
                          <TableCell>
                            {row.hexCode && isValidHexCode(row.hexCode) ? (
                              <div
                                className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600"
                                style={{ backgroundColor: row.hexCode }}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">\u2014</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {staging.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-xs text-center text-muted-foreground">
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
                    Import {staging.length} Colors
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
                    <p className="text-sm text-muted-foreground">Importing colors...</p>
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

function exportColorsCSV(colors: ColorRecord[]) {
  const headers = ['Code', 'Name', 'Hex Code', 'Status', 'Created Date']
  const rows = colors.map((c) => [
    c.code,
    c.name,
    c.hexCode || '',
    c.isActive ? 'Active' : 'Inactive',
    c.createdDate ? formatDate(c.createdDate) : '',
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
  link.download = `colors_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${colors.length} colors to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportColorsPDF(colors: ColorRecord[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Colors Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Colors: ${colors.length}`, 14, 37)

  // Table data
  const tableData = colors.map((c, idx) => [
    String(idx + 1),
    c.code,
    c.name,
    c.hexCode || '\u2014',
    c.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    startY: 42,
    head: [['Sl', 'Code', 'Name', 'Hex Code', 'Status']],
    body: tableData,
    theme: 'grid',
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
      fillColor: [240, 244, 250],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 28 },
      2: { cellWidth: 50 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
    },
    didDrawPage: (data) => {
      // Page number
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      )
    },
  })

  doc.save(`colors_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${colors.length} colors to PDF`)
}

// ============================================================================
// MAIN COMPONENT: Colors Module
// ============================================================================

export function ColorsModule() {
  // Data state
  const [showInactive, setShowInactive] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  // Debounce search term (400ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // API URL with query params
  const apiUrl = `/api/colors${showInactive ? '?all=true' : ''}`
  const { data: colors, loading, error, refetch } = useColorsData(apiUrl)

  // All data for export (always fetch all including inactive for export)
  const { data: allColors, refetch: refetchAll } = useColorsData('/api/colors?all=true')

  // UI state
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<ColorRecord | null>(null)
  const [viewColor, setViewColor] = React.useState<ColorRecord | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [deleteColor, setDeleteColor] = React.useState<ColorRecord | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)

  // Filter colors by search
  const filteredColors = React.useMemo(() => {
    if (!debouncedSearch) return colors
    const term = debouncedSearch.toLowerCase()
    return colors.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        (c.hexCode && c.hexCode.toLowerCase().includes(term))
    )
  }, [colors, debouncedSearch])

  // CRUD handlers
  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const isEdit = !!data.id
      const url = isEdit ? '/api/colors' : '/api/colors'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} color`)
      }

      toast.success(isEdit ? 'Color updated successfully' : 'Color created successfully')
      setFormOpen(false)
      setSelectedColor(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save color')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteColor) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/colors?id=${deleteColor.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete color')
      }

      toast.success('Color deleted successfully')
      setDeleteOpen(false)
      setDeleteColor(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete color')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (color: ColorRecord) => {
    setSelectedColor(color)
    setFormOpen(true)
  }

  const handleView = (color: ColorRecord) => {
    setViewColor(color)
    setViewOpen(true)
  }

  const handleDeleteClick = (color: ColorRecord) => {
    setDeleteColor(color)
    setDeleteOpen(true)
  }

  const handleCreate = () => {
    setSelectedColor(null)
    setFormOpen(true)
  }

  // Export handlers
  const handleExportCSV = () => {
    if (allColors.length === 0) {
      toast.error('No data to export')
      return
    }
    exportColorsCSV(allColors)
  }

  const handleExportPDF = () => {
    if (allColors.length === 0) {
      toast.error('No data to export')
      return
    }
    exportColorsPDF(allColors)
  }

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-rose-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Failed to Load Colors
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Existing Colors
        </h2>
        <div className="flex items-center gap-2">
          {/* Import CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import CSV
          </Button>
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          {/* Export PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
          {/* Create */}
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or code..."
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Show Inactive Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-xs font-medium text-muted-foreground cursor-pointer">
            Show Inactive
          </Label>
        </div>
        {/* Row Count */}
        <div className="text-xs text-muted-foreground ml-auto">
          {filteredColors.length}/{colors.length} records
        </div>
      </div>

      {/* Data Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="text-xs font-semibold w-12">Sl</TableHead>
                  <TableHead className="text-xs font-semibold w-28">Code</TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold w-32">Hex Code</TableHead>
                  <TableHead className="text-xs font-semibold w-20">Status</TableHead>
                  <TableHead className="text-xs font-semibold w-28 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Palette className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          No colors found
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'Create your first color to get started'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColors.map((color, idx) => (
                    <TableRow key={color.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-mono font-medium">{color.code}</TableCell>
                      <TableCell className="text-sm font-medium text-slate-900 dark:text-white">
                        {color.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Color Swatch */}
                          <div
                            className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm shrink-0"
                            style={{ backgroundColor: color.hexCode || '#CCCCCC' }}
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {color.hexCode || '\u2014'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(color.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(color)}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(color)}
                            className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(color)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Sheet (Create/Edit) */}
      <ColorFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedColor(null)
        }}
        color={selectedColor}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <ColorViewDialog
        color={viewColor}
        open={viewOpen}
        onClose={() => {
          setViewOpen(false)
          setViewColor(null)
        }}
      />

      {/* Delete Confirmation */}
      <DeleteColorDialog
        color={deleteColor}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteColor(null)
        }}
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
