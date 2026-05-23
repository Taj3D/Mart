'use client'

// ============================================================================
// Electronics Mart IMS — Employees Management UI
// Full CRUD data grid + Create/Edit Sheet + View Detail Dialog
// + Triple Utility Bundle (Import CSV, Export CSV, Export PDF)
// ============================================================================

import * as React from 'react'
import {
  Users,
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
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Heart,
  User,
  Hash,
  Banknote,
  Shield,
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

interface Employee {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
  accountNo: string | null
  departmentId: string | null
  designationId: string | null
  religion: string | null
  salary: number
  srDueLimit: number
  photo: string | null
  nid: string | null
  fatherName: string | null
  motherName: string | null
  joinDate: string | null
  dateOfBirth: string | null
  bloodGroup: string | null
  presentAddress: string | null
  permanentAddress: string | null
  emergencyContact: string | null
  status: string
  isActive: boolean
  isDeleted: boolean
  department: { id: string; name: string } | null
  designation: { id: string; name: string } | null
  leaveCount: number
  srTargetCount: number
  createdBy: string | null
  createdDate: string | null
  updatedBy: string | null
  updatedDate: string | null
}

interface DepartmentOption {
  id: string
  name: string
  code: string
}

interface DesignationOption {
  id: string
  name: string
  code: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const RELIGIONS = ['Islam', 'Hindu', 'Christian', 'Buddhist', 'Other']
const EMPLOYEE_STATUSES = ['Active', 'OnLeave', 'Resigned', 'Terminated']
const STATUS_LABELS: Record<string, string> = {
  Active: 'Active',
  OnLeave: 'On Leave',
  Resigned: 'Resigned',
  Terminated: 'Terminated',
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    Active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Active' },
    OnLeave: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'On Leave' },
    Resigned: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-600 dark:text-slate-400', label: 'Resigned' },
    Terminated: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', label: 'Terminated' },
  }
  const s = map[status] || map.Active
  return (
    <Badge className={`${s.bg} ${s.text} border-0 text-[10px] font-semibold px-1.5 py-0.5`}>
      {s.label}
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

function formatBDT(amount: number): string {
  return `৳${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`
}

// ============================================================================
// CUSTOM HOOK: All Employees Data Fetcher
// ============================================================================

function useAllEmployees(url: string) {
  const [data, setData] = React.useState<Employee[]>([])
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
// VIEW DETAIL DIALOG — Shows ALL fields in organized sections
// ============================================================================

function EmployeeViewDialog({
  employee,
  open,
  onClose,
}: {
  employee: Employee | null
  open: boolean
  onClose: () => void
}) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader variant="navy">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-500" />
            {employee.name}
          </DialogTitle>
          <DialogDescription>
            Employee Details &mdash; {employee.code}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-2">
            {/* Personal Info Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" /> Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Name</span>
                  <p className="font-semibold mt-0.5">{employee.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Father Name</span>
                  <p className="font-medium mt-0.5">{employee.fatherName || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Mother Name</span>
                  <p className="font-medium mt-0.5">{employee.motherName || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Date of Birth</span>
                  <p className="font-medium mt-0.5">{formatDate(employee.dateOfBirth)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Blood Group</span>
                  <p className="font-medium mt-0.5">{employee.bloodGroup || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Religion</span>
                  <p className="font-medium mt-0.5">{employee.religion || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">National ID</span>
                  <p className="font-mono mt-0.5">{employee.nid || '\u2014'}</p>
                </div>
              </div>
            </div>

            {/* Contact Info Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Phone</span>
                  <p className="font-medium mt-0.5 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {employee.phone || '\u2014'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Email</span>
                  <p className="font-medium mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {employee.email || '\u2014'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Present Address</span>
                  <p className="font-medium mt-0.5 text-xs leading-relaxed">{employee.presentAddress || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Permanent Address</span>
                  <p className="font-medium mt-0.5 text-xs leading-relaxed">{employee.permanentAddress || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Emergency Contact</span>
                  <p className="font-medium mt-0.5">{employee.emergencyContact || '\u2014'}</p>
                </div>
              </div>
            </div>

            {/* Employment Info Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Employment Information
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Code</span>
                  <p className="font-mono font-semibold mt-0.5">{employee.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Department</span>
                  <p className="font-medium mt-0.5 flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {employee.department?.name || '\u2014'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Designation</span>
                  <p className="font-medium mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    {employee.designation?.name || '\u2014'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Join Date</span>
                  <p className="font-medium mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formatDate(employee.joinDate)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
                  <div className="mt-0.5">{getStatusBadge(employee.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Active</span>
                  <p className="font-medium mt-0.5">{employee.isActive ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Gross Salary</span>
                  <p className="font-semibold mt-0.5 text-emerald-700 dark:text-emerald-300">{formatBDT(employee.salary)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">SR Due Limit</span>
                  <p className="font-semibold mt-0.5">{formatBDT(employee.srDueLimit)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Account No.</span>
                  <p className="font-mono mt-0.5">{employee.accountNo || '\u2014'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Leaves</span>
                  <p className="font-medium mt-0.5">{employee.leaveCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">SR Targets</span>
                  <p className="font-medium mt-0.5">{employee.srTargetCount}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

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
// CREATE / EDIT FORM SHEET — Large form with 3 sections
// ============================================================================

function EmployeeFormSheet({
  open,
  onClose,
  employee,
  onSave,
  saving,
  departments,
  designations,
}: {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onSave: (data: Record<string, unknown>) => void
  saving: boolean
  departments: DepartmentOption[]
  designations: DesignationOption[]
}) {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    accountNo: '',
    departmentId: '',
    designationId: '',
    religion: '',
    salary: 0,
    srDueLimit: 0,
    nid: '',
    fatherName: '',
    motherName: '',
    joinDate: '',
    dateOfBirth: '',
    bloodGroup: '',
    presentAddress: '',
    permanentAddress: '',
    emergencyContact: '',
    status: 'Active',
    isActive: true,
  })

  React.useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email || '',
        phone: employee.phone || '',
        accountNo: employee.accountNo || '',
        departmentId: employee.departmentId || '',
        designationId: employee.designationId || '',
        religion: employee.religion || '',
        salary: employee.salary,
        srDueLimit: employee.srDueLimit,
        nid: employee.nid || '',
        fatherName: employee.fatherName || '',
        motherName: employee.motherName || '',
        joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        bloodGroup: employee.bloodGroup || '',
        presentAddress: employee.presentAddress || '',
        permanentAddress: employee.permanentAddress || '',
        emergencyContact: employee.emergencyContact || '',
        status: employee.status,
        isActive: employee.isActive,
      })
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        accountNo: '',
        departmentId: '',
        designationId: '',
        religion: '',
        salary: 0,
        srDueLimit: 0,
        nid: '',
        fatherName: '',
        motherName: '',
        joinDate: new Date().toISOString().split('T')[0],
        dateOfBirth: '',
        bloodGroup: '',
        presentAddress: '',
        permanentAddress: '',
        emergencyContact: '',
        status: 'Active',
        isActive: true,
      })
    }
  }, [employee, open])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Employee name is required')
      return
    }

    onSave({
      ...form,
      id: employee?.id,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      accountNo: form.accountNo.trim() || null,
      departmentId: form.departmentId || null,
      designationId: form.designationId || null,
      religion: form.religion || null,
      salary: Number(form.salary) || 0,
      srDueLimit: Number(form.srDueLimit) || 0,
      nid: form.nid.trim() || null,
      fatherName: form.fatherName.trim() || null,
      motherName: form.motherName.trim() || null,
      joinDate: form.joinDate || null,
      dateOfBirth: form.dateOfBirth || null,
      bloodGroup: form.bloodGroup || null,
      presentAddress: form.presentAddress.trim() || null,
      permanentAddress: form.permanentAddress.trim() || null,
      emergencyContact: form.emergencyContact.trim() || null,
      isActive: form.isActive,
      status: form.status,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-2xl w-full p-0 overflow-hidden">
        <SheetHeader className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 border-b border-slate-700">
          <SheetTitle className="text-white text-lg">
            {employee ? 'Edit Employee' : 'Create new'}
          </SheetTitle>
          <SheetDescription className="text-white/70">
            {employee ? 'Update employee information' : 'Add a new employee record'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-160px)]">
          <div className="grid gap-6 p-6">
            {/* ── Employment Section ── */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Employment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code — AUTO-GENERATED, READ-ONLY */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Employee Code
                  </Label>
                  <Input
                    value={employee ? employee.code : 'Auto-generated on save'}
                    disabled
                    className="bg-muted text-muted-foreground font-mono text-sm cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Auto-generated in format EMP-00001. Cannot be edited.
                  </p>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </Label>
                  <Select
                    value={form.departmentId || '_none'}
                    onValueChange={(val) => setForm((f) => ({ ...f, departmentId: val === '_none' ? '' : val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Designation
                  </Label>
                  <Select
                    value={form.designationId || '_none'}
                    onValueChange={(val) => setForm((f) => ({ ...f, designationId: val === '_none' ? '' : val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {designations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Join Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Joining Date
                  </Label>
                  <Input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s] || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gross Salary */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gross Salary
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                    <Input
                      type="number"
                      value={form.salary}
                      onChange={(e) => setForm((f) => ({ ...f, salary: parseFloat(e.target.value) || 0 }))}
                      className="pl-7"
                      min={0}
                      step={100}
                    />
                  </div>
                </div>

                {/* SR Due Limit */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    SR Due Limit
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                    <Input
                      type="number"
                      value={form.srDueLimit}
                      onChange={(e) => setForm((f) => ({ ...f, srDueLimit: parseFloat(e.target.value) || 0 }))}
                      className="pl-7"
                      min={0}
                      step={100}
                    />
                  </div>
                </div>

                {/* Account No */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Account No.
                  </Label>
                  <Input
                    value={form.accountNo}
                    onChange={(e) => setForm((f) => ({ ...f, accountNo: e.target.value }))}
                    placeholder="Bank account number"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* ── Personal Section ── */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name — REQUIRED */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    autoFocus
                  />
                </div>

                {/* Father Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Father Name
                  </Label>
                  <Input
                    value={form.fatherName}
                    onChange={(e) => setForm((f) => ({ ...f, fatherName: e.target.value }))}
                    placeholder="Father name"
                  />
                </div>

                {/* Mother Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mother Name
                  </Label>
                  <Input
                    value={form.motherName}
                    onChange={(e) => setForm((f) => ({ ...f, motherName: e.target.value }))}
                    placeholder="Mother name"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Blood Group
                  </Label>
                  <Select
                    value={form.bloodGroup || '_none'}
                    onValueChange={(val) => setForm((f) => ({ ...f, bloodGroup: val === '_none' ? '' : val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Religion */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Religion
                  </Label>
                  <Select
                    value={form.religion || '_none'}
                    onValueChange={(val) => setForm((f) => ({ ...f, religion: val === '_none' ? '' : val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* National ID */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    National ID
                  </Label>
                  <Input
                    value={form.nid}
                    onChange={(e) => setForm((f) => ({ ...f, nid: e.target.value }))}
                    placeholder="National ID number"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* ── Contact Section ── */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact No.
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Emergency Contact
                  </Label>
                  <Input
                    value={form.emergencyContact}
                    onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
                    placeholder="Emergency contact number"
                  />
                </div>

                {/* Present Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Present Address
                  </Label>
                  <textarea
                    value={form.presentAddress}
                    onChange={(e) => setForm((f) => ({ ...f, presentAddress: e.target.value }))}
                    placeholder="Present address..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Permanent Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Permanent Address
                  </Label>
                  <textarea
                    value={form.permanentAddress}
                    onChange={(e) => setForm((f) => ({ ...f, permanentAddress: e.target.value }))}
                    placeholder="Permanent address..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {form.isActive ? 'Employee is currently active' : 'Employee is currently inactive'}
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
              className="bg-amber-500 hover:bg-amber-600 text-white min-w-[120px]"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : employee ? (
                'Update Employee'
              ) : (
                'Add Employee'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// DELETE CONFIRMATION — with SR target count warning
// ============================================================================

function DeleteEmployeeDialog({
  employee,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  const hasSrTargets = employee && employee.srTargetCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white">
            Delete Employee
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">&quot;{employee?.name}&quot;</span>{' '}
            ({employee?.code})?
            {hasSrTargets && (
              <span className="block mt-2 text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                This employee has {employee.srTargetCount} active SR target(s). Please resolve them before deleting.
              </span>
            )}
            {!hasSrTargets && (
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
            disabled={deleting || !!hasSrTargets}
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
// IMPORT CSV DIALOG — 3-step wizard
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

  const CSV_COLUMNS = ['name', 'phone', 'email', 'departmentId', 'designationId', 'religion', 'salary', 'bloodGroup', 'nid', 'fatherName', 'motherName', 'presentAddress', 'permanentAddress']
  const CSV_LABELS: Record<string, string> = {
    name: 'Employee Name',
    phone: 'Contact No.',
    email: 'Email',
    departmentId: 'Department',
    designationId: 'Designation',
    religion: 'Religion',
    salary: 'Gross Salary',
    bloodGroup: 'Blood Group',
    nid: 'National ID',
    fatherName: 'Father Name',
    motherName: 'Mother Name',
    presentAddress: 'Present Address',
    permanentAddress: 'Permanent Address',
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
    const sampleRow = 'John Doe,01712345678,john@example.com,Sales,Manager,Islam,25000,B+,1234567890,Robert Doe,Mary Doe,Dhaka,Bangladesh'
    const csv = [header, sampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees_import_template.csv'
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

  const processMapping = () => {
    if (!columnMap['name']) {
      setErrors(['Name column mapping is required'])
      return
    }
    const headers = rawRows[0]
    const nameIdx = headers.indexOf(columnMap['name'])
    const phoneIdx = columnMap['phone'] ? headers.indexOf(columnMap['phone']) : -1
    const emailIdx = columnMap['email'] ? headers.indexOf(columnMap['email']) : -1
    const religionIdx = columnMap['religion'] ? headers.indexOf(columnMap['religion']) : -1
    const salaryIdx = columnMap['salary'] ? headers.indexOf(columnMap['salary']) : -1
    const bloodGroupIdx = columnMap['bloodGroup'] ? headers.indexOf(columnMap['bloodGroup']) : -1
    const nidIdx = columnMap['nid'] ? headers.indexOf(columnMap['nid']) : -1
    const fatherNameIdx = columnMap['fatherName'] ? headers.indexOf(columnMap['fatherName']) : -1
    const motherNameIdx = columnMap['motherName'] ? headers.indexOf(columnMap['motherName']) : -1
    const presentAddressIdx = columnMap['presentAddress'] ? headers.indexOf(columnMap['presentAddress']) : -1
    const permanentAddressIdx = columnMap['permanentAddress'] ? headers.indexOf(columnMap['permanentAddress']) : -1

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
        phone: phoneIdx >= 0 ? (row[phoneIdx] || '').trim() : '',
        email: emailIdx >= 0 ? (row[emailIdx] || '').trim() : '',
        religion: religionIdx >= 0 ? (row[religionIdx] || '').trim() : '',
        salary: salaryIdx >= 0 ? (row[salaryIdx] || '0').trim() : '0',
        bloodGroup: bloodGroupIdx >= 0 ? (row[bloodGroupIdx] || '').trim() : '',
        nid: nidIdx >= 0 ? (row[nidIdx] || '').trim() : '',
        fatherName: fatherNameIdx >= 0 ? (row[fatherNameIdx] || '').trim() : '',
        motherName: motherNameIdx >= 0 ? (row[motherNameIdx] || '').trim() : '',
        presentAddress: presentAddressIdx >= 0 ? (row[presentAddressIdx] || '').trim() : '',
        permanentAddress: permanentAddressIdx >= 0 ? (row[permanentAddressIdx] || '').trim() : '',
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
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            phone: row.phone || null,
            email: row.email || null,
            religion: row.religion || null,
            salary: Number(row.salary) || 0,
            bloodGroup: row.bloodGroup || null,
            nid: row.nid || null,
            fatherName: row.fatherName || null,
            motherName: row.motherName || null,
            presentAddress: row.presentAddress || null,
            permanentAddress: row.permanentAddress || null,
            isActive: true,
            status: 'Active',
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
            Import Employees from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import employee records
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
                    Required column: name
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
                  <Button className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white" onClick={processMapping}>
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
                        <TableHead className="text-xs font-semibold">Phone</TableHead>
                        <TableHead className="text-xs font-semibold">Religion</TableHead>
                        <TableHead className="text-xs font-semibold">Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staging.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{row.name}</TableCell>
                          <TableCell className="text-xs">{row.phone || '\u2014'}</TableCell>
                          <TableCell className="text-xs">{row.religion || '\u2014'}</TableCell>
                          <TableCell className="text-xs">{row.salary || '0'}</TableCell>
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
                    Import {staging.length} Employees
                  </Button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="space-y-4 text-center py-4">
                {importing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Importing employees...</p>
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

function exportEmployeesCSV(employees: Employee[]) {
  const headers = [
    'Code', 'Name', 'Contact No.', 'Email', 'Department', 'Designation',
    'Religion', 'Gross Salary', 'SR Due Limit', 'Blood Group', 'National ID',
    'Father Name', 'Mother Name', 'Join Date', 'Date of Birth',
    'Status', 'Active',
  ]
  const rows = employees.map((e) => [
    e.code,
    e.name,
    e.phone || '',
    e.email || '',
    e.department?.name || '',
    e.designation?.name || '',
    e.religion || '',
    String(e.salary),
    String(e.srDueLimit),
    e.bloodGroup || '',
    e.nid || '',
    e.fatherName || '',
    e.motherName || '',
    formatDate(e.joinDate),
    formatDate(e.dateOfBirth),
    e.status,
    e.isActive ? 'Yes' : 'No',
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
  link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${employees.length} employees to CSV`)
}

// ============================================================================
// EXPORT PDF — Landscape A4 PDF with jsPDF + autoTable, navy header
// ============================================================================

function exportEmployeesPDF(employees: Employee[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronics Mart', 14, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Employees Report', 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32)
  doc.text(`Total Employees: ${employees.length}`, 14, 37)

  const tableData = employees.map((e, idx) => [
    String(idx + 1),
    e.code,
    e.name,
    e.phone || '\u2014',
    formatDate(e.joinDate),
    e.department?.name || '\u2014',
    e.designation?.name || '\u2014',
    formatBDT(e.salary),
    e.status,
  ])

  autoTable(doc, {
    head: [['Sl', 'Code', 'Name', 'Phone', 'Join Date', 'Department', 'Designation', 'Salary', 'Status']],
    body: tableData,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [25, 42, 86],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 252],
    },
    margin: { left: 14, right: 14 },
  })

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

  doc.save(`employees_report_${new Date().toISOString().split('T')[0]}.pdf`)
  toast.success(`Exported ${employees.length} employees to PDF`)
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
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
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
        <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        No employees found
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you need.'
          : 'Start by creating your first employee record.'}
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
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
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
              variant={page === pageNum ? 'default' : 'outline'}
              size="icon"
              className="h-7 w-7 text-xs"
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
// MAIN COMPONENT: EmployeesModule
// ============================================================================

export function EmployeesModule() {
  // ── Data State ──
  const { data: employees, loading, error, refetch } = useAllEmployees('/api/employees?all=true')
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([])
  const [designations, setDesignations] = React.useState<DesignationOption[]>([])

  // ── UI State ──
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [filterDepartment, setFilterDepartment] = React.useState('')
  const [filterDesignation, setFilterDesignation] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // ── Dialog/Sheet State ──
  const [viewEmployee, setViewEmployee] = React.useState<Employee | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteEmployee, setDeleteEmployee] = React.useState<Employee | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // ── Fetch Departments & Designations on mount ──
  React.useEffect(() => {
    fetch('/api/departments?all=true')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || [])
        setDepartments(list.map((d: { id: string; name: string; code: string }) => ({ id: d.id, name: d.name, code: d.code })))
      })
      .catch(() => {})

    fetch('/api/designations?all=true')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data || [])
        setDesignations(list.map((d: { id: string; name: string; code: string }) => ({ id: d.id, name: d.name, code: d.code })))
      })
      .catch(() => {})
  }, [])

  // ── Search debounce ──
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // ── Client-side filtering ──
  const filteredEmployees = React.useMemo(() => {
    let result = employees

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          (e.phone && e.phone.toLowerCase().includes(q)) ||
          (e.email && e.email.toLowerCase().includes(q))
      )
    }

    if (filterDepartment) {
      result = result.filter((e) => e.departmentId === filterDepartment)
    }

    if (filterDesignation) {
      result = result.filter((e) => e.designationId === filterDesignation)
    }

    if (filterStatus) {
      result = result.filter((e) => e.status === filterStatus)
    }

    return result
  }, [employees, debouncedSearch, filterDepartment, filterDesignation, filterStatus])

  // ── Pagination ──
  const totalPages = Math.ceil(filteredEmployees.length / pageSize)
  const paginatedEmployees = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredEmployees.slice(start, start + pageSize)
  }, [filteredEmployees, page, pageSize])

  const hasFilters = !!(debouncedSearch || filterDepartment || filterDesignation || filterStatus)

  const clearFilters = () => {
    setSearch('')
    setFilterDepartment('')
    setFilterDesignation('')
    setFilterStatus('')
    setPage(1)
  }

  // ── CRUD Handlers ──
  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const isEdit = !!data.id
      const url = isEdit ? '/api/employees' : '/api/employees'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to ${isEdit ? 'update' : 'create'} employee`)
      }

      toast.success(isEdit ? 'Employee updated successfully' : 'Employee created successfully')
      setFormOpen(false)
      setEditEmployee(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteEmployee) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees?id=${deleteEmployee.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete employee')
      }
      toast.success('Employee deleted successfully')
      setDeleteOpen(false)
      setDeleteEmployee(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (emp: Employee) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: emp.id,
          isActive: !emp.isActive,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to toggle status')
      }
      toast.success(emp.isActive ? 'Employee deactivated' : 'Employee activated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Toggle failed')
    }
  }

  const openCreate = () => {
    setEditEmployee(null)
    setFormOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp)
    setFormOpen(true)
  }

  const openView = (emp: Employee) => {
    setViewEmployee(emp)
    setViewOpen(true)
  }

  const openDelete = (emp: Employee) => {
    setDeleteEmployee(emp)
    setDeleteOpen(true)
  }

  // ── Loading / Error ──
  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <XCircle className="h-12 w-12 text-rose-400 mb-3" />
        <p className="text-sm text-muted-foreground mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Existing Employees
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Triple Utility Bundle */}
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
            onClick={() => exportEmployeesCSV(filteredEmployees)}
            disabled={filteredEmployees.length === 0}
            className="text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportEmployeesPDF(filteredEmployees)}
            disabled={filteredEmployees.length === 0}
            className="text-xs"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create new
          </Button>
        </div>
      </div>

      {/* Search + Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, phone, email..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          value={filterDepartment || '_all'}
          onValueChange={(val) => { setFilterDepartment(val === '_all' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterDesignation || '_all'}
          onValueChange={(val) => { setFilterDesignation(val === '_all' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Designations</SelectItem>
            {designations.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus || '_all'}
          onValueChange={(val) => { setFilterStatus(val === '_all' ? '' : val); setPage(1) }}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            {EMPLOYEE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(debouncedSearch || filterDepartment || filterDesignation || filterStatus) && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredEmployees.length} of {employees.length} employees
          </span>
        )}
      </div>

      {/* Data Grid */}
      {filteredEmployees.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/30">
                    <TableHead className="text-xs font-semibold w-10">Sl</TableHead>
                    <TableHead className="text-xs font-semibold">Code</TableHead>
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Contact No.</TableHead>
                    <TableHead className="text-xs font-semibold">Join Date</TableHead>
                    <TableHead className="text-xs font-semibold">Department</TableHead>
                    <TableHead className="text-xs font-semibold">Designation</TableHead>
                    <TableHead className="text-xs font-semibold">Salary</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((emp, idx) => {
                    const sl = (page - 1) * pageSize + idx + 1
                    return (
                      <TableRow key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <TableCell className="text-xs text-muted-foreground">{sl}</TableCell>
                        <TableCell className="text-xs font-mono font-medium">{emp.code}</TableCell>
                        <TableCell className="text-xs font-semibold">{emp.name}</TableCell>
                        <TableCell className="text-xs">{emp.phone || '\u2014'}</TableCell>
                        <TableCell className="text-xs">{formatDate(emp.joinDate)}</TableCell>
                        <TableCell className="text-xs">{emp.department?.name || '\u2014'}</TableCell>
                        <TableCell className="text-xs">{emp.designation?.name || '\u2014'}</TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatBDT(emp.salary)}
                        </TableCell>
                        <TableCell>{getStatusBadge(emp.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openView(emp)}
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(emp)}
                              title="Edit employee"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openDelete(emp)}
                              title="Delete employee"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            </Button>
                            <button
                              onClick={() => handleToggleActive(emp)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                                emp.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                              title={emp.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  emp.isActive ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="px-4 pb-4">
              <PaginationControls
                pagination={{ page, pageSize, total: filteredEmployees.length, totalPages }}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── View Detail Dialog ── */}
      <EmployeeViewDialog
        employee={viewEmployee}
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewEmployee(null) }}
      />

      {/* ── Create / Edit Sheet ── */}
      <EmployeeFormSheet
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEmployee(null) }}
        employee={editEmployee}
        onSave={handleSave}
        saving={saving}
        departments={departments}
        designations={designations}
      />

      {/* ── Delete Confirmation ── */}
      <DeleteEmployeeDialog
        employee={deleteEmployee}
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteEmployee(null) }}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      {/* ── Import CSV Dialog ── */}
      <ImportCSVDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
