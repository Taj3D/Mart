'use client'

import * as React from 'react'
import {
  Building2,
  Users,
  Warehouse,
  Cog,
  Save,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Loader2,
  AlertTriangle,
  DollarSign,
  Calendar,
  Bell,
  HardDrive,
  FileText,
  ShoppingBag,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InlineHeader } from '@/components/ui/inline-header'
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
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Autocomplete, type AutocompleteSuggestion } from '@/components/ui/autocomplete'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

interface CompanyData {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo: string | null
  currency: string
  financialYear: string | null
  isActive: boolean
}

interface UserData {
  id: string
  userName: string
  email: string | null
  fullName: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

interface WarehouseData {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  managerName: string | null
  isActive: boolean
}

interface CategoryData {
  id: string
  name: string
  description: string | null
  parentId: string | null
  isActive: boolean
  productCount: number
  childCount: number
  children: CategoryData[]
}

interface SettingsMap {
  [key: string]: string
}

// ================================================================
// HOOK
// ================================================================

function useApiData<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(url)
      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.error || `Failed to fetch (${res.status})`)
      }
      const json = await res.json()
      // APIs return data in { data: ... } or as direct array
      setData(json.data !== undefined ? json.data : json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  React.useEffect(() => { fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}

// ================================================================
// LOADING / ERROR STATES
// ================================================================

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <AlertTriangle className="h-8 w-8 text-rose-500" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-1" />Retry
      </Button>
    </div>
  )
}

// ================================================================
// TAB 1: COMPANY PROFILE
// ================================================================

function CompanyProfileTab() {
  const { data: company, loading, error, refetch } = useApiData<CompanyData>('/api/company')
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    currency: 'BDT',
    financialYear: '',
    logo: '',
  })

  React.useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        currency: company.currency || 'BDT',
        financialYear: company.financialYear || '',
        logo: company.logo || '',
      })
    }
  }, [company])

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Company name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to save')
      }
      toast.success('Company profile updated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save company profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Building2 className="h-3 w-3" />Company Name
          </Label>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Enter company name"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Mail className="h-3 w-3" />Email
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="info@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Phone className="h-3 w-3" />Phone
          </Label>
          <Input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+880 1234567890"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Globe className="h-3 w-3" />Website
          </Label>
          <Input
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="https://company.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <DollarSign className="h-3 w-3" />Currency
          </Label>
          <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BDT">BDT (৳)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1">
            <Calendar className="h-3 w-3" />Financial Year
          </Label>
          <Input
            value={form.financialYear}
            onChange={e => setForm(f => ({ ...f, financialYear: e.target.value }))}
            placeholder="2024-2025"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold flex items-center gap-1">
          <MapPin className="h-3 w-3" />Address
        </Label>
        <Textarea
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Full company address"
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Logo URL</Label>
        <Input
          value={form.logo}
          onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
          placeholder="https://example.com/logo.png"
        />
        <p className="text-xs text-muted-foreground">Enter a URL for the company logo image</p>
      </div>
      <Separator />
      <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
        Save Changes
      </Button>
    </div>
  )
}

// ================================================================
// TAB 2: USER MANAGEMENT
// ================================================================

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300 border-0',
  Manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0',
  User: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-0',
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0',
  Inactive: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0',
}

interface UserFormData {
  userName: string
  fullName: string
  email: string
  password: string
  role: string
  isActive: boolean
}

const emptyUserForm: UserFormData = {
  userName: '',
  fullName: '',
  email: '',
  password: '',
  role: 'User',
  isActive: true,
}

function UserManagementTab() {
  const { data: users, loading, error, refetch } = useApiData<UserData[]>('/api/users')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null)
  const [form, setForm] = React.useState<UserFormData>({ ...emptyUserForm })
  const [saving, setSaving] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<UserData | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const openAddDialog = () => {
    setEditingUser(null)
    setForm({ ...emptyUserForm })
    setDialogOpen(true)
  }

  const openEditDialog = (user: UserData) => {
    setEditingUser(user)
    setForm({
      userName: user.userName,
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role,
      isActive: user.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.userName.trim()) {
      toast.error('Username is required')
      return
    }
    if (!editingUser && (!form.password || form.password.length < 6)) {
      toast.error('Password is required (min 6 characters)')
      return
    }
    if (form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const body: Record<string, unknown> = {
          userName: form.userName,
          fullName: form.fullName || null,
          email: form.email || null,
          role: form.role,
          isActive: form.isActive,
        }
        if (form.password) {
          body.password = form.password
        }
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to update user')
        }
        toast.success('User updated successfully')
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: form.userName,
            fullName: form.fullName || null,
            email: form.email || null,
            password: form.password,
            role: form.role,
            isActive: form.isActive,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to create user')
        }
        toast.success('User created successfully')
      }
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    // Check if this is the last active admin
    if (deleteTarget.role === 'Admin' && deleteTarget.isActive) {
      const activeAdmins = users?.filter(u => u.role === 'Admin' && u.isActive) ?? []
      if (activeAdmins.length <= 1) {
        toast.error('Cannot deactivate the last admin user')
        setDeleteTarget(null)
        return
      }
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to deactivate user')
      }
      toast.success('User deactivated')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate user')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users?.length ?? 0} users registered</p>
        <Button variant="outline" size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users?.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.userName}</TableCell>
                  <TableCell>{user.fullName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                  <TableCell>
                    <Badge className={`${ROLE_COLORS[user.role] || ''} text-[10px]`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[user.isActive ? 'Active' : 'Inactive']} text-[10px]`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(user)}
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

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader variant="navy">
            <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details' : 'Create a new system user'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Username *</Label>
                <Input
                  value={form.userName}
                  onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                  placeholder="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="user@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Password {editingUser ? '(leave blank to keep current)' : '*'}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                  />
                  <span className="text-sm">{form.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate user &quot;{deleteTarget?.userName}&quot;?
              They will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ================================================================
// TAB 3: WAREHOUSE MANAGEMENT
// ================================================================

interface WarehouseFormData {
  code: string
  name: string
  address: string
  phone: string
  managerName: string
  isActive: boolean
}

const emptyWarehouseForm: WarehouseFormData = {
  code: '',
  name: '',
  address: '',
  phone: '',
  managerName: '',
  isActive: true,
}

function WarehouseManagementTab() {
  const { data: warehouses, loading, error, refetch } = useApiData<WarehouseData[]>('/api/warehouses?all=true')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingWarehouse, setEditingWarehouse] = React.useState<WarehouseData | null>(null)
  const [form, setForm] = React.useState<WarehouseFormData>({ ...emptyWarehouseForm })
  const [saving, setSaving] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<WarehouseData | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const openAddDialog = () => {
    setEditingWarehouse(null)
    setForm({ ...emptyWarehouseForm })
    setDialogOpen(true)
  }

  const openEditDialog = (wh: WarehouseData) => {
    setEditingWarehouse(wh)
    setForm({
      code: wh.code,
      name: wh.name,
      address: wh.address || '',
      phone: wh.phone || '',
      managerName: wh.managerName || '',
      isActive: wh.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and Name are required')
      return
    }
    setSaving(true)
    try {
      if (editingWarehouse) {
        const res = await fetch(`/api/warehouses/${editingWarehouse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: form.code,
            name: form.name,
            address: form.address || null,
            phone: form.phone || null,
            managerName: form.managerName || null,
            isActive: form.isActive,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to update warehouse')
        }
        toast.success('Warehouse updated')
      } else {
        const res = await fetch('/api/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: form.code,
            name: form.name,
            address: form.address || null,
            phone: form.phone || null,
            managerName: form.managerName || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to create warehouse')
        }
        toast.success('Warehouse created')
      }
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save warehouse')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/warehouses/${deleteTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to deactivate warehouse')
      }
      toast.success('Warehouse deactivated')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate warehouse')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={3} />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{warehouses?.length ?? 0} warehouses</p>
        <Button variant="outline" size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />Add Warehouse
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No warehouses found
                </TableCell>
              </TableRow>
            ) : (
              warehouses?.map(wh => (
                <TableRow key={wh.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {wh.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{wh.name}</TableCell>
                  <TableCell className="text-muted-foreground">{wh.address || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{wh.phone || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{wh.managerName || '—'}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[wh.isActive ? 'Active' : 'Inactive']} text-[10px]`}>
                      {wh.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => openEditDialog(wh)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(wh)}
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

      {/* Add/Edit Warehouse Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader variant="navy">
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
            <DialogDescription>
              {editingWarehouse ? 'Update warehouse details' : 'Create a new warehouse location'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Code *</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="WH-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Main Warehouse"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address</Label>
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Warehouse address"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+880 1234567890"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Manager</Label>
                <Input
                  value={form.managerName}
                  onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))}
                  placeholder="Manager name"
                />
              </div>
            </div>
            {editingWarehouse && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label className="text-xs font-semibold">
                  {form.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {editingWarehouse ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Warehouse</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate warehouse &quot;{deleteTarget?.name}&quot; ({deleteTarget?.code})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ================================================================
// TAB 4: CATEGORIES
// ================================================================

interface CategoryFormData {
  name: string
  description: string
  parentId: string
}

const emptyCategoryForm: CategoryFormData = {
  name: '',
  description: '',
  parentId: '',
}

function CategoryTreeItem({
  category,
  depth = 0,
  onEdit,
  onDelete,
}: {
  category: CategoryData
  depth?: number
  onEdit: (cat: CategoryData) => void
  onDelete: (cat: CategoryData) => void
}) {
  const [expanded, setExpanded] = React.useState(true)
  const hasChildren = category.children && category.children.length > 0

  return (
    <>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md group"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <FolderTree className="h-4 w-4 text-navy-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{category.name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
            </Badge>
            {!category.isActive && (
              <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px]">Inactive</Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{category.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="xs" onClick={() => onEdit(category)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-rose-600 hover:text-rose-700"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {expanded && hasChildren && category.children.map(child => (
        <CategoryTreeItem
          key={child.id}
          category={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

function CategoriesTab() {
  const { data: categories, loading, error, refetch } = useApiData<CategoryData[]>('/api/categories?all=true')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryData | null>(null)
  const [form, setForm] = React.useState<CategoryFormData>({ ...emptyCategoryForm })
  const [saving, setSaving] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryData | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Flatten categories for the parent select dropdown
  const flattenCategories = React.useCallback((cats: CategoryData[], prefix = ''): AutocompleteSuggestion[] => {
    const result: AutocompleteSuggestion[] = []
    for (const cat of cats) {
      const label = prefix ? `${prefix} > ${cat.name}` : cat.name
      result.push({ value: cat.id, label, description: cat.description || undefined })
      if (cat.children?.length) {
        result.push(...flattenCategories(cat.children, label))
      }
    }
    return result
  }, [])

  const parentSuggestions = React.useMemo(
    () => {
      if (!categories) return []
      // When editing, exclude the category itself and its descendants from parent options
      const allFlat = flattenCategories(categories)
      if (!editingCategory) return allFlat
      const excludeIds = new Set<string>()
      const collectDescendants = (cat: CategoryData) => {
        excludeIds.add(cat.id)
        cat.children?.forEach(collectDescendants)
      }
      collectDescendants(editingCategory)
      return allFlat.filter(s => !excludeIds.has(s.value))
    },
    [categories, editingCategory, flattenCategories],
  )

  const openAddDialog = () => {
    setEditingCategory(null)
    setForm({ ...emptyCategoryForm })
    setDialogOpen(true)
  }

  const openEditDialog = (cat: CategoryData) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      description: cat.description || '',
      parentId: cat.parentId || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            parentId: form.parentId || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to update category')
        }
        toast.success('Category updated')
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            parentId: form.parentId || null,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || 'Failed to create category')
        }
        toast.success('Category created')
      }
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to delete category')
      }
      toast.success('Category deleted')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories?.length ?? 0} top-level categories</p>
        <Button variant="outline" size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />Add Category
        </Button>
      </div>

      <div className="rounded-md border max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-navy-300 scrollbar-track-transparent">
        {categories?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No categories found. Create your first category.
          </div>
        ) : (
          categories?.map(cat => (
            <CategoryTreeItem
              key={cat.id}
              category={cat}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader variant="navy">
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Create a new product category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Category description"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Parent Category</Label>
              <Autocomplete
                suggestions={parentSuggestions}
                value={form.parentId}
                onValueChange={v => setForm(f => ({ ...f, parentId: v }))}
                onSelect={suggestion => setForm(f => ({ ...f, parentId: suggestion.value }))}
                placeholder="None (top-level category)"
                minChars={0}
                clearable
                size="default"
              />
              <p className="text-xs text-muted-foreground">Leave empty for a top-level category</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category &quot;{deleteTarget?.name}&quot;?
              {(deleteTarget?.productCount ?? 0) > 0 && (
                <span className="block mt-1 text-rose-600 font-medium">
                  This category has {deleteTarget?.productCount} product(s) and cannot be deleted.
                </span>
              )}
              {(deleteTarget?.childCount ?? 0) > 0 && (
                <span className="block mt-1 text-rose-600 font-medium">
                  This category has {deleteTarget?.childCount} sub-categor(y/ies) and cannot be deleted.
                </span>
              )}
              {((deleteTarget?.productCount ?? 0) === 0 && (deleteTarget?.childCount ?? 0) === 0) && (
                <span className="block mt-1">This action cannot be undone.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || (deleteTarget?.productCount ?? 0) > 0 || (deleteTarget?.childCount ?? 0) > 0}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ================================================================
// TAB 5: SYSTEM PREFERENCES
// ================================================================

const DEFAULT_SETTINGS: SettingsMap = {
  dateFormat: 'DD/MM/YYYY',
  currencySymbol: '৳',
  taxRate: '10',
  lowStockThreshold: '10',
  autoBackup: 'true',
  emailNotifications: 'true',
  invoicePrefix: 'INV-',
  poPrefix: 'PO-',
  soPrefix: 'SO-',
}

function SystemPreferencesTab() {
  const { data: settings, loading, error, refetch } = useApiData<SettingsMap>('/api/settings')
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState<{
    dateFormat: string
    currencySymbol: string
    taxRate: string
    lowStockThreshold: string
    autoBackup: boolean
    emailNotifications: boolean
    invoicePrefix: string
    poPrefix: string
    soPrefix: string
  }>({
    dateFormat: DEFAULT_SETTINGS.dateFormat,
    currencySymbol: DEFAULT_SETTINGS.currencySymbol,
    taxRate: DEFAULT_SETTINGS.taxRate,
    lowStockThreshold: DEFAULT_SETTINGS.lowStockThreshold,
    autoBackup: DEFAULT_SETTINGS.autoBackup === 'true',
    emailNotifications: DEFAULT_SETTINGS.emailNotifications === 'true',
    invoicePrefix: DEFAULT_SETTINGS.invoicePrefix,
    poPrefix: DEFAULT_SETTINGS.poPrefix,
    soPrefix: DEFAULT_SETTINGS.soPrefix,
  })

  React.useEffect(() => {
    if (settings) {
      setForm({
        dateFormat: settings.dateFormat || DEFAULT_SETTINGS.dateFormat,
        currencySymbol: settings.currencySymbol || DEFAULT_SETTINGS.currencySymbol,
        taxRate: settings.taxRate || DEFAULT_SETTINGS.taxRate,
        lowStockThreshold: settings.lowStockThreshold || DEFAULT_SETTINGS.lowStockThreshold,
        autoBackup: settings.autoBackup !== undefined ? settings.autoBackup === 'true' : DEFAULT_SETTINGS.autoBackup === 'true',
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications === 'true' : DEFAULT_SETTINGS.emailNotifications === 'true',
        invoicePrefix: settings.invoicePrefix || DEFAULT_SETTINGS.invoicePrefix,
        poPrefix: settings.poPrefix || DEFAULT_SETTINGS.poPrefix,
        soPrefix: settings.soPrefix || DEFAULT_SETTINGS.soPrefix,
      })
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsArray = [
        { key: 'dateFormat', value: form.dateFormat },
        { key: 'currencySymbol', value: form.currencySymbol },
        { key: 'taxRate', value: form.taxRate },
        { key: 'lowStockThreshold', value: form.lowStockThreshold },
        { key: 'autoBackup', value: String(form.autoBackup) },
        { key: 'emailNotifications', value: String(form.emailNotifications) },
        { key: 'invoicePrefix', value: form.invoicePrefix },
        { key: 'poPrefix', value: form.poPrefix },
        { key: 'soPrefix', value: form.soPrefix },
      ]
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to save preferences')
      }
      toast.success('Preferences saved')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      {/* Display & Locale */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3 flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />Display &amp; Locale
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Date Format</Label>
            <Select value={form.dateFormat} onValueChange={v => setForm(f => ({ ...f, dateFormat: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Currency Symbol</Label>
            <Select value={form.currencySymbol} onValueChange={v => setForm(f => ({ ...f, currencySymbol: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="৳">৳ (BDT)</SelectItem>
                <SelectItem value="$">$ (USD)</SelectItem>
                <SelectItem value="€">€ (EUR)</SelectItem>
                <SelectItem value="£">£ (GBP)</SelectItem>
                <SelectItem value="₹">₹ (INR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3 flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" />Financial
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tax Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.taxRate}
              onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Low Stock Alert Threshold</Label>
            <Input
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Document Prefixes */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3 flex items-center gap-1.5">
          <FileText className="h-4 w-4" />Document Prefixes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <FileText className="h-3 w-3" />Invoice Prefix
            </Label>
            <Input
              value={form.invoicePrefix}
              onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value }))}
              placeholder="INV-"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />PO Prefix
            </Label>
            <Input
              value={form.poPrefix}
              onChange={e => setForm(f => ({ ...f, poPrefix: e.target.value }))}
              placeholder="PO-"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Package className="h-3 w-3" />SO Prefix
            </Label>
            <Input
              value={form.soPrefix}
              onChange={e => setForm(f => ({ ...f, soPrefix: e.target.value }))}
              placeholder="SO-"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* System */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3 flex items-center gap-1.5">
          <Cog className="h-4 w-4" />System
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-muted-foreground" />Auto Backup
              </p>
              <p className="text-xs text-muted-foreground">Automatically backup database daily</p>
            </div>
            <Switch
              checked={form.autoBackup}
              onCheckedChange={v => setForm(f => ({ ...f, autoBackup: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-muted-foreground" />Email Notifications
              </p>
              <p className="text-xs text-muted-foreground">Send alerts and notifications via email</p>
            </div>
            <Switch
              checked={form.emailNotifications}
              onCheckedChange={v => setForm(f => ({ ...f, emailNotifications: v }))}
            />
          </div>
        </div>
      </div>

      <Separator />

      <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
        Save Preferences
      </Button>
    </div>
  )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function SettingsSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <InlineHeader color="navy">System Settings</InlineHeader>
        <p className="text-sm text-muted-foreground mt-1">Configure your ERP system preferences and manage resources</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="bg-navy-50 dark:bg-navy-900/30 w-full sm:w-auto">
            <TabsTrigger value="company" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Building2 className="h-4 w-4 mr-1" />Company
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />Users
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Warehouse className="h-4 w-4 mr-1" />Warehouses
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-xs sm:text-sm">
              <FolderTree className="h-4 w-4 mr-1" />Categories
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white text-xs sm:text-sm">
              <Cog className="h-4 w-4 mr-1" />Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="company">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your organization information</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Warehouse Management</CardTitle>
              <CardDescription>Manage storage locations and warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseManagementTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage product categories and hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure default system behavior and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemPreferencesTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
