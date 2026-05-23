'use client'

// ============================================================================
// Electronics Mart IMS — Categories Management UI
// Self-referencing hierarchy module with CRUD data grid + Create/Edit Sheet
// + Triple Utility Bundle (Import CSV, Export CSV, Export PDF)
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
  ChevronDown,
  Loader2,
  ToggleLeft,
  ToggleRight,
  X,
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

interface CategoryNode {
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
  children: CategoryNode[]
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface FlatCategory {
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
  children: CategoryNode[]
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

type FlattenedRow = {
  id: string
  code: string
  name: string
  description: string | null
  parentId: string | null
  parentName: string | null
  isActive: boolean
  productCount: number
  childCount: number
  depth: number
  hasChildren: boolean
  children: CategoryNode[]
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

// ============================================================================
// CUSTOM HOOK: Fetch tree-structured categories
// ============================================================================

function useCategoriesTree(showAll: boolean) {
  const [data, setData] = React.useState<CategoryNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const url = `/api/categories${showAll ? '?all=true' : ''}`

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
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
// CUSTOM HOOK: Fetch flat categories for dropdowns
// ============================================================================

function useFlatCategories() {
  const [data, setData] = React.useState<FlatCategory[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories?flat=true&all=true')
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch {
      // silent — used for dropdowns
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}

// ============================================================================
// CUSTOM HOOK: Fetch all flat categories for export
// ============================================================================

function useAllFlatCategories() {
  const [data, setData] = React.useState<FlatCategory[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories?flat=true&all=true')
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}

// ============================================================================
// HELPERS
// ============================================================================

function flattenTree(
  nodes: CategoryNode[],
  depth: number = 0,
  expandedIds: Set<string> = new Set()
): FlattenedRow[] {
  const result: FlattenedRow[] = []
  for (const node of nodes) {
    const isExpanded = expandedIds.has(node.id)
    result.push({
      id: node.id,
      code: node.code,
      name: node.name,
      description: node.description,
      parentId: node.parentId,
      parentName: node.parentName,
      isActive: node.isActive,
      productCount: node.productCount,
      childCount: node.childCount,
      depth,
      hasChildren: node.children && node.children.length > 0,
      children: node.children,
      createdBy: node.createdBy,
      createdDate: node.createdDate,
      updatedBy: node.updatedBy,
      updatedDate: node.updatedDate,
    })
    if (isExpanded && node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1, expandedIds))
    }
  }
  return result
}

function flattenAllForFilter(nodes: CategoryNode[]): FlattenedRow[] {
  const result: FlattenedRow[] = []
  for (const node of nodes) {
    result.push({
      id: node.id,
      code: node.code,
      name: node.name,
      description: node.description,
      parentId: node.parentId,
      parentName: node.parentName,
      isActive: node.isActive,
      productCount: node.productCount,
      childCount: node.childCount,
      depth: 0,
      hasChildren: node.children && node.children.length > 0,
      children: node.children,
      createdBy: node.createdBy,
      createdDate: node.createdDate,
      updatedBy: node.updatedBy,
      updatedDate: node.updatedDate,
    })
    if (node.children && node.children.length > 0) {
      result.push(...flattenAllForFilter(node.children))
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
  if (!dateStr) return '\u2014'
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
  category: FlattenedRow | null
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
            Category Details &mdash; {category.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Parent Category</span>
              <p className="font-medium mt-0.5">{category.parentName || '\u2014'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Products Count</span>
              <p className="font-semibold mt-0.5">{category.productCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Child Categories</span>
              <p className="font-semibold mt-0.5">{category.childCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Created</span>
              <p className="font-medium mt-0.5">{formatDate(category.createdDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <p className="font-medium mt-0.5">{formatDate(category.updatedDate)}</p>
            </div>
          </div>

          {category.description && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Description</span>
              <p className="text-sm mt-0.5 leading-relaxed">{category.description}</p>
            </div>
          )}

          {category.children && category.children.length > 0 && (
            <div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Child Categories</span>
              <div className="mt-1 space-y-1">
                {category.children.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded px-2 py-1">
                    <FolderTree className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium">{ch.name}</span>
                    <span className="text-muted-foreground text-xs font-mono">{ch.code}</span>
                    {getStatusBadge(ch.isActive)}
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
  onSave,
  saving,
  flatCategories,
  flatLoading,
  excludeId,
}: {
  open: boolean
  onClose: () => void
  category: FlattenedRow | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
  flatCategories: FlatCategory[]
  flatLoading: boolean
  excludeId?: string
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
  })
  const [parentSearch, setParentSearch] = React.useState('')
  const [showParentDropdown, setShowParentDropdown] = React.useState(false)

  React.useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        isActive: category.isActive,
      })
      setParentSearch(category.parentName || '')
    } else {
      setForm({
        name: '',
        description: '',
        parentId: '',
        isActive: true,
      })
      setParentSearch('')
    }
  }, [category, open])

  // Filter categories for parent dropdown — exclude self and own descendants
  const filteredParents = React.useMemo(() => {
    let cats = flatCategories.filter((c) => c.id !== excludeId && c.isActive)
    if (parentSearch.trim()) {
      const q = parentSearch.toLowerCase()
      cats = cats.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }
    return cats
  }, [flatCategories, parentSearch, excludeId])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    onSave({
      id: category?.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      parentId: form.parentId || null,
      isActive: form.isActive,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {category ? 'Edit Category' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {category ? 'Update category information' : 'Add a new category record'}
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
                value={category ? category.code : 'Auto: CAT-XXXXX'}
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
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Electronics"
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
                placeholder="Brief description of this category..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {/* Parent Category — Searchable Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Parent Category
              </Label>
              <div className="relative">
                <Input
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value)
                    setShowParentDropdown(true)
                    if (!e.target.value.trim()) {
                      setForm((f) => ({ ...f, parentId: '' }))
                    }
                  }}
                  onFocus={() => setShowParentDropdown(true)}
                  placeholder="Search parent category..."
                  disabled={flatLoading}
                />
                {form.parentId && (
                  <button
                    type="button"
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setForm((f) => ({ ...f, parentId: '' }))
                      setParentSearch('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                {showParentDropdown && filteredParents.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredParents.slice(0, 20).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                          form.parentId === cat.id ? 'bg-accent font-medium' : ''
                        }`}
                        onClick={() => {
                          setForm((f) => ({ ...f, parentId: cat.id }))
                          setParentSearch(cat.name)
                          setShowParentDropdown(false)
                        }}
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-xs ml-2 font-mono">{cat.code}</span>
                      </button>
                    ))}
                    {filteredParents.length > 20 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        ... and {filteredParents.length - 20} more
                      </div>
                    )}
                  </div>
                )}
                {showParentDropdown && filteredParents.length === 0 && parentSearch.trim() && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-xs text-muted-foreground text-center">
                    No categories found
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Leave empty for top-level category</p>
            </div>

            {/* Active Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </Label>
              <button
                type="button"
                className="flex items-center gap-3 w-full"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              >
                {form.isActive ? (
                  <ToggleRight className="h-8 w-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
                <span className={`text-sm font-medium ${form.isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
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
              ) : category ? (
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
// DELETE CONFIRMATION — with child category protection
// ============================================================================

function DeleteCategoryDialog({
  category,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  category: FlattenedRow | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  // If the category has children, prevent deletion
  const hasChildren = category && category.childCount > 0
  const hasProducts = category && category.productCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasChildren ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Cannot delete: category has {category?.childCount} child
                {category?.childCount === 1 ? '' : 'ren'}. Please reassign children first.
              </span>
            ) : hasProducts ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Cannot delete: category has {category?.productCount} active
                {category?.productCount === 1 ? ' product' : ' products'}. Please reassign products first.
              </span>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-foreground">
                  &quot;{category?.name}&quot;
                </span>{' '}
                ({category?.code})? This is a soft-delete &mdash; the record will be marked as
                deleted but preserved in the database.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          {!hasChildren && !hasProducts && (
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
          )}
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
  flatCategories,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  flatCategories: FlatCategory[]
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

  const CSV_COLUMNS = ['name', 'description', 'parentCategory']
  const CSV_LABELS: Record<string, string> = {
    name: 'Name',
    description: 'Description',
    parentCategory: 'Parent Category (name or code)',
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

  const downloadTemplate = () => {
    const header = CSV_COLUMNS.join(',')
    const sampleRow = 'Electronics,All electronic items,'
    const sampleRow2 = 'Television,,Electronics'
    const csv = [header, sampleRow, sampleRow2].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'categories_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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

      const autoMap: Record<string, string> = {}
      for (const col of CSV_COLUMNS) {
        const normalizedCol = col.toLowerCase().replace(/[^a-z0-9]/g, '')
        const idx = headers.findIndex(
          (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedCol
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

  const processMapping = () => {
    if (!columnMap['name']) {
      setErrors(['Name column mapping is required'])
      return
    }

    const headers = rawRows[0]
    const nameIdx = headers.indexOf(columnMap['name'])
    const descIdx = columnMap['description'] ? headers.indexOf(columnMap['description']) : -1
    const parentIdx = columnMap['parentCategory'] ? headers.indexOf(columnMap['parentCategory']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Name is empty \u2014 skipping`)
        continue
      }

      const parentVal = parentIdx >= 0 ? (row[parentIdx] || '').trim() : ''
      let parentId = ''
      if (parentVal) {
        const found = flatCategories.find(
          (c) => c.name.toLowerCase() === parentVal.toLowerCase() || c.code.toLowerCase() === parentVal.toLowerCase()
        )
        if (found) {
          parentId = found.id
        } else {
          newErrors.push(`Row ${i + 1}: Parent category "${parentVal}" not found`)
        }
      }

      stagingRows.push({
        name: name.trim(),
        description: descIdx >= 0 ? (row[descIdx] || '').trim() : '',
        parentCategory: parentVal,
        parentId,
      })
    }

    setStaging(stagingRows)
    setErrors(newErrors)
    setStep('preview')
  }

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
            Import Categories from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import category records
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-4">
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
                    Required columns: name. Optional: description, parentCategory
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
                  <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white" onClick={processMapping}>
                    Preview Data
                  </Button>
                </div>
              </div>
            )}

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
                        <TableHead className="text-xs font-semibold">Description</TableHead>
                        <TableHead className="text-xs font-semibold">Parent Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs">{row.description || '\u2014'}</TableCell>
                          <TableCell className="text-xs">{row.parentCategory || '\u2014'}</TableCell>
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
                    Import {staging.length} Categories
                  </Button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="space-y-4 text-center py-4">
                {importing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin mx-auto" />
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

function exportCategoriesCSV(categories: FlatCategory[]) {
  const headers = ['Code', 'Name', 'Description', 'Parent Category', 'Products Count', 'Status', 'Created Date']
  const rows = categories.map((c) => [
    c.code,
    c.name,
    c.description || '',
    c.parentName || '',
    String(c.productCount),
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
  link.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${categories.length} categories to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable with navy header
// ============================================================================

function exportCategoriesPDF(categories: FlatCategory[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Categories Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Categories: ${categories.length}`, 14, 37)

  // Table data
  const tableData = categories.map((c, idx) => [
    String(idx + 1),
    c.code,
    c.name,
    c.parentName || '\u2014',
    String(c.productCount),
    c.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    head: [['Sl', 'Code', 'Name', 'Parent', 'Products', 'Status']],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [25, 42, 86], // navy
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
  toast.success(`Exported ${categories.length} categories to PDF`)
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-sm" />
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
      <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center mb-4">
        <FolderTree className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        No categories found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Start by creating your first category.'}
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
// MAIN COMPONENT: CategoriesModule
// ============================================================================

export function CategoriesModule() {
  // State
  const [showInactive, setShowInactive] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  // Form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<FlattenedRow | null>(null)
  const [saving, setSaving] = React.useState(false)

  // View dialog
  const [viewCategory, setViewCategory] = React.useState<FlattenedRow | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)

  // Delete dialog
  const [deleteCategory, setDeleteCategory] = React.useState<FlattenedRow | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Import dialog
  const [importOpen, setImportOpen] = React.useState(false)

  // Data hooks
  const { data: treeData, loading, error, refetch } = useCategoriesTree(showInactive)
  const { data: flatCategories, loading: flatLoading, refetch: refetchFlat } = useFlatCategories()
  const { data: allFlatCategories } = useAllFlatCategories()

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Flatten and filter tree
  const allFlat = React.useMemo(() => flattenAllForFilter(treeData), [treeData])

  const filteredFlat = React.useMemo(() => {
    if (!debouncedSearch.trim()) return allFlat
    const q = debouncedSearch.toLowerCase()
    return allFlat.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.parentName && c.parentName.toLowerCase().includes(q))
    )
  }, [allFlat, debouncedSearch])

  // Flatten for display with tree indentation
  const displayRows = React.useMemo(() => {
    if (debouncedSearch.trim()) {
      // When searching, show flat results without tree structure
      return filteredFlat.map((c) => ({ ...c, depth: 0 }))
    }
    return flattenTree(treeData, 0, expandedIds)
  }, [treeData, expandedIds, debouncedSearch, filteredFlat])

  const totalCount = allFlat.length
  const filteredCount = filteredFlat.length

  // Toggle expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id)
          collectIds(node.children)
        }
      }
    }
    collectIds(treeData)
    setExpandedIds(allIds)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  // CRUD handlers
  const handleCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const handleEdit = (cat: FlattenedRow) => {
    setEditingCategory(cat)
    setFormOpen(true)
  }

  const handleView = (cat: FlattenedRow) => {
    setViewCategory(cat)
    setViewOpen(true)
  }

  const handleDelete = (cat: FlattenedRow) => {
    setDeleteCategory(cat)
    setDeleteOpen(true)
  }

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const isEdit = !!data.id
      const url = '/api/categories'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to ${isEdit ? 'update' : 'create'} category`)
      }

      toast.success(`Category ${isEdit ? 'updated' : 'created'} successfully`)
      setFormOpen(false)
      setEditingCategory(null)
      refetch()
      refetchFlat()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCategory) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories?id=${deleteCategory.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to delete category')
      }

      toast.success('Category deleted successfully')
      setDeleteOpen(false)
      setDeleteCategory(null)
      refetch()
      refetchFlat()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setShowInactive(false)
  }

  // ================================================================
  // RENDER
  // ================================================================

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
          <XCircle className="h-10 w-10 text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Failed to load categories
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Existing Categories
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCategoriesCSV(allFlatCategories.length > 0 ? allFlatCategories : allFlat)}
            className="text-xs"
            disabled={allFlat.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCategoriesPDF(allFlatCategories.length > 0 ? allFlatCategories : allFlat)}
            className="text-xs"
            disabled={allFlat.length === 0}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, code, parent..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchQuery('')
                setDebouncedSearch('')
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Show Inactive toggle */}
          <button
            className="flex items-center gap-2 text-sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <ToggleRight className="h-6 w-6 text-amber-500" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
            )}
            <span className={`text-xs font-medium ${showInactive ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>
              Show Inactive
            </span>
          </button>

          {/* Row count */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {debouncedSearch.trim()
              ? `${filteredCount} / ${totalCount} categories`
              : `${totalCount} categories`}
          </span>

          {/* Expand/Collapse all */}
          {!debouncedSearch.trim() && treeData.length > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={expandAll} className="h-7 text-xs px-2">
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Expand
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="h-7 text-xs px-2">
                <ChevronRight className="h-3.5 w-3.5 mr-1" />
                Collapse
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Data Grid */}
      {displayRows.length === 0 ? (
        <EmptyState
          hasFilters={!!debouncedSearch.trim() || showInactive}
          onClear={clearFilters}
        />
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/30">
                    <TableHead className="text-xs font-semibold w-12">Sl</TableHead>
                    <TableHead className="text-xs font-semibold w-28">Code</TableHead>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Parent Category</TableHead>
                    <TableHead className="text-xs font-semibold w-28 text-center">Products</TableHead>
                    <TableHead className="text-xs font-semibold w-24 text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold w-28 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((cat, idx) => (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium">
                        {cat.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center" style={{ paddingLeft: `${cat.depth * 24}px` }}>
                          {cat.hasChildren && (
                            <button
                              onClick={() => toggleExpand(cat.id)}
                              className="mr-1.5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {expandedIds.has(cat.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {!cat.hasChildren && cat.depth > 0 && (
                            <span className="w-[22px] mr-1.5 inline-block" />
                          )}
                          <FolderTree className="h-4 w-4 text-amber-500 mr-1.5 shrink-0" />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {cat.parentName || '\u2014'}
                      </TableCell>
                      <TableCell className="text-xs text-center font-mono">
                        {cat.productCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(cat.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            onClick={() => handleView(cat)}
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-500 hover:text-amber-700"
                            onClick={() => handleEdit(cat)}
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700"
                            onClick={() => handleDelete(cat)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* View Detail Dialog */}
      <CategoryViewDialog
        category={viewCategory}
        open={viewOpen}
        onClose={() => {
          setViewOpen(false)
          setViewCategory(null)
        }}
      />

      {/* Create/Edit Sheet */}
      <CategoryFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        onSave={handleSave}
        saving={saving}
        flatCategories={flatCategories}
        flatLoading={flatLoading}
        excludeId={editingCategory?.id}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        category={deleteCategory}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteCategory(null)
        }}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch()
          refetchFlat()
        }}
        flatCategories={flatCategories}
      />
    </div>
  )
}
