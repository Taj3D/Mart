'use client'

// ============================================================================
// Electronics Mart IMS — Companies Management Module
// Full CRUD data grid + Create/Edit Sheet + View Detail Dialog + Triple Utility Bundle
// (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Building2,
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
  Globe,
  Phone,
  Mail,
  MapPin,
  Hash,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchableSelect } from '@/components/select/searchable-select'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// TYPES
// ============================================================================

interface CompanyItem {
  id: string
  code: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo: string | null
  currency: string
  financialYear: string | null
  taxId: string | null
  registrationNo: string | null
  isActive: boolean
  isDeleted: boolean
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface PaginatedResponse {
  data: CompanyItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface AllResponse {
  data: CompanyItem[]
}

// ============================================================================
// CUSTOM HOOK: Paginated API Data Fetcher
// ============================================================================

function usePaginatedCompanies(page: number, pageSize: number, search: string) {
  const [data, setData] = React.useState<CompanyItem[]>([])
  const [pagination, setPagination] = React.useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (search) params.set('search', search)
      const res = await fetch(`/api/companies?${params.toString()}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json: PaginatedResponse = await res.json()
      setData(json.data)
      setPagination(json.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, pagination, loading, error, refetch: fetchData }
}

function useAllCompanies() {
  const [data, setData] = React.useState<CompanyItem[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/companies?all=true')
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json: AllResponse = await res.json()
      setData(json.data)
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================================
// COMPANY VIEW DETAIL DIALOG
// ============================================================================

function CompanyViewDialog({
  company,
  open,
  onClose,
}: {
  company: CompanyItem | null
  open: boolean
  onClose: () => void
}) {
  if (!company) return null

  const infoItems = [
    { label: 'Code', value: company.code, icon: Hash, mono: true },
    { label: 'Status', value: null, badge: true, isActive: company.isActive },
    { label: 'Address', value: company.address, icon: MapPin },
    { label: 'Phone', value: company.phone, icon: Phone },
    { label: 'Email', value: company.email, icon: Mail },
    { label: 'Website', value: company.website, icon: Globe },
    { label: 'Currency', value: company.currency, icon: CreditCard },
    { label: 'Tax ID', value: company.taxId, icon: Hash },
    { label: 'Registration No', value: company.registrationNo, icon: Hash },
    { label: 'Financial Year', value: company.financialYear },
    { label: 'Created', value: formatDate(company.createdDate) },
    { label: 'Updated', value: formatDate(company.updatedDate) },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            {company.name}
          </DialogTitle>
          <DialogDescription>
            Company Details — {company.code}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {infoItems.map((item) => (
              <div key={item.label}>
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {item.label}
                </span>
                {item.badge ? (
                  <div className="mt-0.5">
                    <Badge
                      className={
                        item.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px] font-semibold px-1.5 py-0.5'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold px-1.5 py-0.5'
                      }
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ) : (
                  <p className={`mt-0.5 ${item.mono ? 'font-mono' : 'font-medium'}`}>
                    {item.value || '—'}
                  </p>
                )}
              </div>
            ))}
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
// COMPANY FORM SHEET (ADD / EDIT)
// ============================================================================

function CompanyFormSheet({
  open,
  onClose,
  company,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  company: CompanyItem | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
}) {
  const [form, setForm] = React.useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    currency: 'BDT',
    taxId: '',
    registrationNo: '',
  })

  React.useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        currency: company.currency || 'BDT',
        taxId: company.taxId || '',
        registrationNo: company.registrationNo || '',
      })
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        currency: 'BDT',
        taxId: '',
        registrationNo: '',
      })
    }
  }, [company, open])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Company name is required')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Invalid email format')
      return
    }
    if (form.website && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(form.website)) {
      toast.error('Invalid website URL format')
      return
    }
    onSave({
      ...form,
      id: company?.id,
      name: form.name.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      taxId: form.taxId.trim() || null,
      registrationNo: form.registrationNo.trim() || null,
    })
  }

  const currencyOptions = [
    { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'INR', label: 'INR — Indian Rupee' },
    { value: 'JPY', label: 'JPY — Japanese Yen' },
    { value: 'CNY', label: 'CNY — Chinese Yuan' },
    { value: 'SGD', label: 'SGD — Singapore Dollar' },
    { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
    { value: 'AED', label: 'AED — UAE Dirham' },
  ]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {company ? 'Edit Company' : 'Create New Company'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {company ? 'Update company information' : 'Add a new company to the system'}
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
                value={company ? company.code : 'Auto-generated on save'}
                disabled
                className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-generated in format CMP-00001. Cannot be edited.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Company Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Samsung Electronics"
                autoFocus
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Address <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Company address..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+880-xxxx-xxxxxx"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Email <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="info@company.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Website <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://www.company.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Currency
              </Label>
              <SearchableSelect
                options={currencyOptions}
                value={form.currency}
                onChange={(val) => setForm((f) => ({ ...f, currency: val || 'BDT' }))}
                placeholder="Select currency..."
                searchPlaceholder="Search currencies..."
                emptyMessage="No currency found"
              />
            </div>

            {/* Tax ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Tax ID <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.taxId}
                  onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                  placeholder="Tax identification number"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Registration No */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">
                Registration No <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.registrationNo}
                  onChange={(e) => setForm((f) => ({ ...f, registrationNo: e.target.value }))}
                  placeholder="Company registration number"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white min-w-[120px]"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : company ? (
                'Update Company'
              ) : (
                'Add Company'
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

function DeleteCompanyDialog({
  company,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  company: CompanyItem | null
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
            Delete Company
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{company?.name}&quot;</span>{' '}
            ({company?.code})? This is a soft-delete — the record will be marked as deleted
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
  const [dragOver, setDragOver] = React.useState(false)

  const CSV_COLUMNS = ['name', 'address', 'phone', 'email', 'website', 'currency', 'taxId', 'registrationNo']
  const CSV_LABELS: Record<string, string> = {
    name: 'Company Name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    currency: 'Currency',
    taxId: 'Tax ID',
    registrationNo: 'Registration No',
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
    const sampleRow = 'Samsung Electronics,Dhaka Bangladesh,+880-1712345678,info@samsung.com,https://samsung.com,BDT,TAX-12345,REG-67890'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'company_import_template.csv'
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) {
      processFile(f)
    } else {
      toast.error('Please drop a CSV file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  // Process mapped data into staging
  const processMapping = () => {
    if (!columnMap['name']) {
      setErrors(['Company Name column mapping is required'])
      return
    }

    const headers = rawRows[0]
    const nameIdx = headers.indexOf(columnMap['name'])
    const addressIdx = columnMap['address'] ? headers.indexOf(columnMap['address']) : -1
    const phoneIdx = columnMap['phone'] ? headers.indexOf(columnMap['phone']) : -1
    const emailIdx = columnMap['email'] ? headers.indexOf(columnMap['email']) : -1
    const websiteIdx = columnMap['website'] ? headers.indexOf(columnMap['website']) : -1
    const currencyIdx = columnMap['currency'] ? headers.indexOf(columnMap['currency']) : -1
    const taxIdIdx = columnMap['taxId'] ? headers.indexOf(columnMap['taxId']) : -1
    const regNoIdx = columnMap['registrationNo'] ? headers.indexOf(columnMap['registrationNo']) : -1

    const stagingRows: Array<Record<string, string>> = []
    const newErrors: string[] = []

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      const name = nameIdx >= 0 ? row[nameIdx] || '' : ''
      if (!name.trim()) {
        newErrors.push(`Row ${i + 1}: Company name is empty — skipping`)
        continue
      }

      stagingRows.push({
        name: name.trim(),
        address: addressIdx >= 0 ? (row[addressIdx] || '').trim() : '',
        phone: phoneIdx >= 0 ? (row[phoneIdx] || '').trim() : '',
        email: emailIdx >= 0 ? (row[emailIdx] || '').trim() : '',
        website: websiteIdx >= 0 ? (row[websiteIdx] || '').trim() : '',
        currency: currencyIdx >= 0 ? (row[currencyIdx] || 'BDT').trim() : 'BDT',
        taxId: taxIdIdx >= 0 ? (row[taxIdIdx] || '').trim() : '',
        registrationNo: regNoIdx >= 0 ? (row[regNoIdx] || '').trim() : '',
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
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            address: row.address || null,
            phone: row.phone || null,
            email: row.email || null,
            website: row.website || null,
            currency: row.currency || 'BDT',
            taxId: row.taxId || null,
            registrationNo: row.registrationNo || null,
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
            Import Companies from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import company records
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2 space-y-4">
            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <FileSpreadsheet className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Drag &amp; drop a CSV file here, or click to select
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
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-sm">
                  <span className="font-medium">File:</span> {file?.name} — {rawRows.length - 1} data rows
                </div>

                <div className="space-y-3">
                  {CSV_COLUMNS.map((col) => (
                    <div key={col} className="grid grid-cols-2 gap-3 items-center">
                      <Label className="text-xs font-semibold text-slate-900 dark:text-white">
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
                  <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white" onClick={processMapping}>
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
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-900/30">
                        <TableHead className="text-xs font-semibold">Name</TableHead>
                        <TableHead className="text-xs font-semibold">Phone</TableHead>
                        <TableHead className="text-xs font-semibold">Email</TableHead>
                        <TableHead className="text-xs font-semibold">Currency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.phone || '—'}
                          </TableCell>
                          <TableCell className="text-xs">{row.email || '—'}</TableCell>
                          <TableCell className="text-xs">{row.currency}</TableCell>
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
                    Import {staging.length} Companies
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
                    <p className="text-sm text-muted-foreground">Importing companies...</p>
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

function exportCompaniesCSV(companies: CompanyItem[]) {
  const headers = ['Code', 'Name', 'Address', 'Phone', 'Email', 'Website', 'Currency', 'Tax ID', 'Registration No', 'Active', 'Created Date']
  const rows = companies.map((c) => [
    c.code,
    c.name,
    c.address || '',
    c.phone || '',
    c.email || '',
    c.website || '',
    c.currency,
    c.taxId || '',
    c.registrationNo || '',
    c.isActive ? 'Yes' : 'No',
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
  link.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${companies.length} companies to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape PDF with jsPDF + autoTable
// ============================================================================

function exportCompaniesPDF(companies: CompanyItem[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Corporate header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Company Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Companies: ${companies.length}`, 14, 37)

  // Table data
  const tableData = companies.map((c, i) => [
    String(i + 1),
    c.code,
    c.name,
    c.address || '—',
    c.phone || '—',
    c.email || '—',
    c.currency,
    c.isActive ? 'Active' : 'Inactive',
  ])

  autoTable(doc, {
    head: [['Sl', 'Code', 'Name', 'Address', 'Phone', 'Email', 'Currency', 'Status']],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
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

  doc.save(`companies_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${companies.length} companies to PDF`)
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Card className="shadow-md">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
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
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        No companies found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search to find what you need.'
          : 'Start by creating your first company.'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Search
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT: CompaniesModule
// ============================================================================

export function CompaniesModule() {
  // Pagination state
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Data
  const { data, pagination, loading, error, refetch } = usePaginatedCompanies(page, pageSize, debouncedSearch)
  const { data: allCompanies, refetch: refetchAll } = useAllCompanies()

  // Form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCompany, setEditingCompany] = React.useState<CompanyItem | null>(null)
  const [saving, setSaving] = React.useState(false)

  // View/Delete state
  const [viewCompany, setViewCompany] = React.useState<CompanyItem | null>(null)
  const [deleteCompany, setDeleteCompany] = React.useState<CompanyItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Import state
  const [importOpen, setImportOpen] = React.useState(false)

  // Computed: serial number offset for current page
  const slOffset = (page - 1) * pageSize

  // Save handler
  const handleSave = async (formData: Record<string, unknown>) => {
    try {
      setSaving(true)
      const isEdit = !!formData.id
      const url = isEdit ? `/api/companies/${formData.id}` : '/api/companies'
      const method = isEdit ? 'PUT' : 'POST'

      const payload: Record<string, unknown> = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        currency: formData.currency,
        taxId: formData.taxId,
        registrationNo: formData.registrationNo,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} company`)
      }

      toast.success(isEdit ? 'Company updated successfully' : 'Company created successfully')
      setFormOpen(false)
      setEditingCompany(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteCompany) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/companies/${deleteCompany.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete company')
      }
      toast.success('Company deleted successfully')
      setDeleteCompany(null)
      refetch()
      refetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete company')
    } finally {
      setDeleting(false)
    }
  }

  // Export handlers (use all data)
  const handleExportCSV = () => {
    if (!allCompanies || allCompanies.length === 0) {
      toast.error('No companies to export')
      return
    }
    exportCompaniesCSV(allCompanies)
  }

  const handleExportPDF = () => {
    if (!allCompanies || allCompanies.length === 0) {
      toast.error('No companies to export')
      return
    }
    exportCompaniesPDF(allCompanies)
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Existing companies</h2>
        </div>
        <Card className="shadow-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Failed to load companies</p>
            <Button variant="outline" size="sm" onClick={() => { refetch(); refetchAll() }}>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Existing companies</h2>
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
            onClick={handleExportCSV}
            className="text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingCompany(null)
              setFormOpen(true)
            }}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create new company
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, email, phone..."
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {pagination.total} record{pagination.total !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Data Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton />
          ) : data.length === 0 ? (
            <EmptyState
              hasFilters={!!debouncedSearch}
              onClear={() => setSearchQuery('')}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <TableHead className="text-xs font-semibold text-slate-900 dark:text-white w-12">Sl</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-900 dark:text-white w-28">Code</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-900 dark:text-white">Name</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-900 dark:text-white text-right w-28">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((company, idx) => (
                      <TableRow
                        key={company.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer"
                        onClick={() => setViewCompany(company)}
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {slOffset + idx + 1}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                          >
                            {company.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-900 dark:text-white">
                          {company.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
                              onClick={() => {
                                setEditingCompany(company)
                                setFormOpen(true)
                              }}
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                              onClick={() => setDeleteCompany(company)}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-muted-foreground">
                    Showing {slOffset + 1}–{Math.min(slOffset + pageSize, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Show first, last, and pages around current
                        if (p === 1 || p === pagination.totalPages) return true
                        if (Math.abs(p - page) <= 1) return true
                        return false
                      })
                      .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) {
                          acc.push('ellipsis')
                        }
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === 'ellipsis' ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={page === p ? 'default' : 'outline'}
                            size="sm"
                            className={`h-7 w-7 p-0 text-xs ${
                              page === p
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : ''
                            }`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Sheet (Create / Edit) */}
      <CompanyFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCompany(null)
        }}
        company={editingCompany}
        onSave={handleSave}
        saving={saving}
      />

      {/* View Detail Dialog */}
      <CompanyViewDialog
        company={viewCompany}
        open={!!viewCompany}
        onClose={() => setViewCompany(null)}
      />

      {/* Delete Confirmation */}
      <DeleteCompanyDialog
        company={deleteCompany}
        open={!!deleteCompany}
        onClose={() => setDeleteCompany(null)}
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
