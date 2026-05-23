'use client'

// ============================================================================
// Electronics Mart IMS — Category Management UI
// Full CRUD data grid + Create/Edit Sheet + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  FolderTree,
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
  ChevronRight,
  Loader2,
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
import { SearchableSelect } from '@/components/select/searchable-select'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPES
// ============================================================================

interface CategoryItem {
  id: string
  code: string
  name: string
  description: string | null
  parentId: string | null
  parentName: string | null
  isActive: boolean
  isDeleted: boolean
  productCount: number
  childCount: number
  children: CategoryItem[]
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface FlatCategory {
  id: string
  code: string
  name: string
}

// ============================================================================
// CUSTOM HOOK: API Data Fetcher
// ============================================================================

function useApiData<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(json)
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

function flattenCategories(categories: CategoryItem[]): CategoryItem[] {
  const result: CategoryItem[] = []
  for (const cat of categories) {
    result.push(cat)
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children))
    }
  }
  return result
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
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================================
// CATEGORY VIEW DETAIL DIALOG
// ============================================================================

function CategoryViewDialog({
  category,
  open,
  onClose,
}: {
  category: CategoryItem | null
  open: boolean
  onClose: () => void
}) {
  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-amber-500" />
            {category.name}
          </DialogTitle>
          <DialogDescription>
            Category Details — {category.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
              <p className="font-mono font-medium mt-0.5">{category.code}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div className="mt-0.5">{getStatusBadge(category.isActive)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Parent</span>
              <p className="font-medium mt-0.5">{category.parentName || '— (Root)'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Products</span>
              <p className="font-medium mt-0.5">{category.productCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Sub-Categories</span>
              <p className="font-medium mt-0.5">{category.childCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(category.createdDate)}</p>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{category.description}</p>
            </div>
          )}

          {/* Children list */}
          {category.children && category.children.length > 0 && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Sub-Categories</span>
              <div className="mt-1 space-y-1">
                {category.children.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-2 text-sm bg-navy-50 dark:bg-navy-900/20 rounded-md px-3 py-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-navy-400 shrink-0" />
                    <span className="font-medium">{ch.name}</span>
                    <Badge variant="outline" className="text-[9px] ml-auto border-navy-300 dark:border-navy-600 text-navy-600 dark:text-navy-400">
                      {ch.code}
                    </Badge>
                  </div>
                ))}
              </div>
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
// CATEGORY FORM SHEET (ADD / EDIT)
// ============================================================================

function CategoryFormSheet({
  open,
  onClose,
  category,
  flatCategories,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  category: CategoryItem | null
  flatCategories: FlatCategory[]
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
  })

  React.useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        isActive: category.isActive,
      })
    } else {
      setForm({
        name: '',
        description: '',
        parentId: '',
        isActive: true,
      })
    }
  }, [category, open])

  // Filter out current category from parent options (prevent self-reference)
  const parentOptions = React.useMemo(() => {
    return flatCategories.filter((c) => c.id !== category?.id)
  }, [flatCategories, category])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    onSave({
      ...form,
      id: category?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-navy-600 text-white px-6 py-4 border-b border-navy-500">
          <SheetTitle className="text-white text-lg">
            {category ? 'Edit Category' : 'Add New Category'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {category ? 'Update category information' : 'Create a new product category'}
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
                value={category ? category.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format CAT-00001. Cannot be edited.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Category Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Televisions"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this category..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                Parent Category <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <SearchableSelect
                options={parentOptions.map((c) => ({
                  value: c.id,
                  label: `${c.code} — ${c.name}`,
                }))}
                value={form.parentId || undefined}
                onChange={(val) => setForm((f) => ({ ...f, parentId: val || '' }))}
                placeholder="Select parent category..."
                searchPlaceholder="Search categories..."
                emptyMessage="No categories found"
                clearable
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-navy-200 dark:border-navy-700 p-3">
              <div>
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-[11px] text-muted-foreground">
                  Inactive categories won&apos;t appear in product selection
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                className="data-[state=checked]:bg-emerald-600"
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
              ) : category ? (
                'Update'
              ) : (
                'Create'
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

function DeleteCategoryDialog({
  category,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  category: CategoryItem | null
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
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{category?.name}&quot;</span>{' '}
            ({category?.code})? This is a soft-delete — the record will be marked as deleted
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
  flatCategories,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  flatCategories: FlatCategory[]
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

  const CSV_COLUMNS = ['name', 'description', 'parentCode', 'isActive']
  const CSV_LABELS: Record<string, string> = {
    name: 'Category Name',
    description: 'Description',
    parentCode: 'Parent Category Code',
    isActive: 'Active (true/false)',
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
    const sampleRow = 'Sample Category,Sample description,CAT-00001,true'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'category_import_template.csv'
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
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

  // Process mapped data into staging
  const processMapping = () => {
    if (!columnMap['name']) {
      setErrors(['Category Name column mapping is required'])
      return
    }

    const headers = rawRows[0]
    const nameIdx = headers.indexOf(columnMap['name'])
    const descIdx = columnMap['description'] ? headers.indexOf(columnMap['description']) : -1
    const parentIdx = columnMap['parentCode'] ? headers.indexOf(columnMap['parentCode']) : -1
    const activeIdx = columnMap['isActive'] ? headers.indexOf(columnMap['isActive']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Category name is empty — skipping`)
        continue
      }

      const parentCode = parentIdx >= 0 ? row[parentIdx] || '' : ''
      const parentCat = parentCode ? flatCategories.find((c) => c.code === parentCode) : null
      if (parentCode && !parentCat) {
        newErrors.push(`Row ${i + 1}: Parent code "${parentCode}" not found`)
      }

      stagingRows.push({
        name: name.trim(),
        description: descIdx >= 0 ? (row[descIdx] || '').trim() : '',
        parentId: parentCat?.id || '',
        parentName: parentCat?.name || '',
        isActive: activeIdx >= 0 ? (row[activeIdx] || 'true').toLowerCase() : 'true',
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
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            description: row.description || null,
            parentId: row.parentId || null,
            isActive: row.isActive === 'true',
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
            Import Categories from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import category records
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-4">
            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-navy-300 dark:border-navy-600 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-navy-300 dark:text-navy-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a CSV file with category data
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                </div>
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
                  <span className="font-medium">File:</span> {file?.name} — {rawRows.length - 1} data rows
                </div>

                <div className="space-y-3">
                  {CSV_COLUMNS.map((col) => (
                    <div key={col} className="grid grid-cols-2 gap-3 items-center">
                      <Label className="text-xs font-semibold text-navy-700 dark:text-navy-300">
                        {CSV_LABELS[col]}
                        {col === 'name' && <span className="text-rose-500 ml-1">*</span>}
                      </Label>
                      <SearchableSelect
                        options={rawRows[0].map((h) => ({ value: h, label: h }))}
                        value={columnMap[col] || undefined}
                        onChange={(val) =>
                          setColumnMap((prev) => ({ ...prev, [col]: val || '' }))
                        }
                        placeholder="Select column..."
                        searchPlaceholder="Search headers..."
                        emptyMessage="No headers found"
                        clearable
                        size="sm"
                      />
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
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-navy-50 dark:bg-navy-900/30">
                        <TableHead className="text-xs font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-semibold">Description</TableHead>
                        <TableHead className="text-xs font-semibold">Parent</TableHead>
                        <TableHead className="text-xs font-semibold">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.description || '—'}
                          </TableCell>
                          <TableCell className="text-xs">{row.parentName || '—'}</TableCell>
                          <TableCell className="text-xs">{row.isActive}</TableCell>
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
                    Import {staging.length} Categories
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
                    <p className="text-sm text-muted-foreground">Importing categories...</p>
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
                            • {err}
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
// EXPORT CSV — Client-side CSV generation
// ============================================================================

function exportCategoriesCSV(categories: CategoryItem[]) {
  const flat = flattenCategories(categories)
  const headers = ['Code', 'Name', 'Description', 'Parent', 'Product Count', 'Active', 'Created Date']
  const rows = flat.map((c) => [
    c.code,
    c.name,
    c.description || '',
    c.parentName || '',
    String(c.productCount),
    c.isActive ? 'Yes' : 'No',
    c.createdDate ? formatDate(c.createdDate) : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      r.map((cell) => {
        // Escape cells that contain commas or quotes
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
  link.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${flat.length} categories to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable
// ============================================================================

function exportCategoriesPDF(categories: CategoryItem[]) {
  const flat = flattenCategories(categories)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Category Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Categories: ${flat.length}`, 14, 37)

  // Table data
  const tableData = flat.map((c) => [
    c.code,
    c.name,
    c.description || '—',
    c.parentName || '—',
    String(c.productCount),
    c.isActive ? 'Active' : 'Inactive',
    c.createdDate ? formatDate(c.createdDate) : '—',
  ])

  autoTable(doc, {
    head: [['Code', 'Name', 'Description', 'Parent', 'Products', 'Status', 'Created']],
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

  doc.save(`categories_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${flat.length} categories to PDF`)
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
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      {/* Table skeleton */}
      <Card className="shadow-md">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
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
      <div className="h-20 w-20 rounded-full bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center mb-4">
        <FolderTree className="h-10 w-10 text-navy-300 dark:text-navy-600" />
      </div>
      <h3 className="text-lg font-semibold text-navy-700 dark:text-navy-300 mb-1">
        No categories found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Start by creating your first product category.'}
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
// MAIN COMPONENT: CategorySection
// ============================================================================

export function CategorySection() {
  const { data: categories, loading, error, refetch } = useApiData<CategoryItem[]>('/api/categories')
  const { data: flatData, refetch: refetchFlat } = useApiData<FlatCategory[]>('/api/categories?flat=true')
  const { data: allData } = useApiData<CategoryItem[]>('/api/categories?all=true')

  const [searchQuery, setSearchQuery] = React.useState('')
  const [showInactive, setShowInactive] = React.useState(false)

  // Form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null)
  const [saving, setSaving] = React.useState(false)

  // View/Delete state
  const [viewCategory, setViewCategory] = React.useState<CategoryItem | null>(null)
  const [deleteCategory, setDeleteCategory] = React.useState<CategoryItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Import state
  const [importOpen, setImportOpen] = React.useState(false)

  // Use either active-only or all data based on toggle
  const sourceData = showInactive ? allData : categories

  // Flatten tree for the data grid
  const flatCategories = React.useMemo(() => {
    if (!sourceData) return []
    return flattenCategories(sourceData)
  }, [sourceData])

  // Filter by search
  const filtered = React.useMemo(() => {
    if (!flatCategories) return []
    return flatCategories.filter((c) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.parentName && c.parentName.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      )
    })
  }, [flatCategories, searchQuery])

  // Flat categories for parent dropdown (from API flat endpoint)
  const parentDropdownOptions = React.useMemo(() => {
    return flatData || []
  }, [flatData])

  // Save handler
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!data.id
      const url = isEdit ? '/api/categories' : '/api/categories'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save category')
      }

      toast.success(isEdit ? 'Category updated successfully' : 'Category created successfully')
      setFormOpen(false)
      setEditingCategory(null)
      refetch()
      refetchFlat()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteCategory) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/categories?id=${deleteCategory.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to delete category')
      }
      toast.success('Category deleted successfully')
      setDeleteCategory(null)
      refetch()
      refetchFlat()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setShowInactive(false)
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to Load Categories</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-navy-100 dark:bg-navy-900/40 flex items-center justify-center">
            <FolderTree className="h-5 w-5 text-navy-600 dark:text-navy-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-800 dark:text-navy-200">Categories</h2>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : `${flatCategories.length} categories`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sourceData && exportCategoriesCSV(sourceData)}
            disabled={!sourceData || sourceData.length === 0}
            className="border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sourceData && exportCategoriesPDF(sourceData)}
            disabled={!sourceData || sourceData.length === 0}
            className="border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
          <Button
            className="bg-navy-600 hover:bg-navy-700 text-white"
            size="sm"
            onClick={() => {
              setEditingCategory(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, code, or parent..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Show Inactive:
          </Label>
          <Switch
            checked={showInactive}
            onCheckedChange={setShowInactive}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>
        <div className="text-xs text-muted-foreground sm:ml-auto">
          Showing {filtered.length} of {flatCategories.length} categories
        </div>
      </div>

      {/* Data Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={!!searchQuery || showInactive} onClear={clearFilters} />
      ) : (
        <Card className="shadow-md border-navy-100 dark:border-navy-800">
          <ScrollArea className="max-h-[calc(100vh-340px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 dark:bg-navy-900/30 hover:bg-navy-50 dark:hover:bg-navy-900/30">
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold w-[100px]">Code</TableHead>
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Name</TableHead>
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold">Parent</TableHead>
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-center w-[100px]">Products</TableHead>
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-center w-[80px]">Status</TableHead>
                  <TableHead className="text-navy-600 dark:text-navy-400 font-semibold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className={`hover:bg-navy-50/50 dark:hover:bg-navy-900/20 ${
                      !cat.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <TableCell>
                      <span className="font-mono text-xs text-navy-600 dark:text-navy-400 bg-navy-50 dark:bg-navy-900/30 px-1.5 py-0.5 rounded">
                        {cat.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center shrink-0">
                          <FolderTree className="h-3.5 w-3.5 text-navy-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cat.parentName ? (
                        <Badge variant="outline" className="text-[10px] border-navy-300 dark:border-navy-600">
                          {cat.parentName}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">— (Root)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold text-sm ${
                        cat.productCount > 0
                          ? 'text-navy-700 dark:text-navy-300'
                          : 'text-muted-foreground'
                      }`}>
                        {cat.productCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(cat.isActive)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setViewCategory(cat)}
                          title="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingCategory(cat)
                            setFormOpen(true)
                          }}
                          title="Edit category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          onClick={() => setDeleteCategory(cat)}
                          title="Delete category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Category Form Sheet */}
      <CategoryFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        flatCategories={parentDropdownOptions}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <CategoryViewDialog
        category={viewCategory}
        open={!!viewCategory}
        onClose={() => setViewCategory(null)}
      />

      {/* Delete Confirmation */}
      <DeleteCategoryDialog
        category={deleteCategory}
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        flatCategories={parentDropdownOptions}
        onSuccess={() => {
          refetch()
          refetchFlat()
        }}
      />
    </div>
  )
}
