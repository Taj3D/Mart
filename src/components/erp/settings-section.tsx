'use client'

import * as React from 'react'
import {
  Building2,
  Users,
  Warehouse,
  Cog,
  Save,
  RefreshCw,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InlineHeader } from '@/components/ui/inline-header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

// ================================================================
// TYPES
// ================================================================

interface Warehouse {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  managerName: string | null
  isActive: boolean
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
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
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
// COMPANY PROFILE FORM
// ================================================================

function CompanyProfileForm() {
  const [form, setForm] = React.useState({
    name: 'X-Mart Global ERP',
    address: 'Dhaka, Bangladesh',
    phone: '+880 1234567890',
    email: 'info@xmart-erp.com',
    website: 'https://xmart-erp.com',
    currency: 'USD',
  })

  const handleSave = () => {
    toast.success('Company profile updated successfully')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1"><Building2 className="h-3 w-3" />Company Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1"><Mail className="h-3 w-3" />Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1"><Phone className="h-3 w-3" />Phone</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1"><Globe className="h-3 w-3" />Website</Label>
          <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" />Address</Label>
        <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Default Currency</Label>
        <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
      </div>
      <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleSave}>
        <Save className="h-4 w-4 mr-1" />Save Changes
      </Button>
    </div>
  )
}

// ================================================================
// USER MANAGEMENT
// ================================================================

function UserManagement() {
  const users = [
    { id: '1', name: 'System Administrator', username: 'admin', email: 'admin@ims-erp.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Sales Manager', username: 'sales_mgr', email: 'sales@ims-erp.com', role: 'Manager', status: 'Active' },
    { id: '3', name: 'Warehouse Staff', username: 'wh_staff', email: 'warehouse@ims-erp.com', role: 'User', status: 'Active' },
    { id: '4', name: 'Accountant', username: 'accountant', email: 'accounts@ims-erp.com', role: 'User', status: 'Inactive' },
  ]

  const roleColors: Record<string, string> = {
    Admin: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    Manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    User: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} users registered</p>
        <Button variant="outline" size="sm" onClick={() => toast.info('User creation dialog coming soon')}>
          <Plus className="h-4 w-4 mr-1" />Add User
        </Button>
      </div>
      <div className="space-y-2">
        {users.map(user => (
          <Card key={user.id} className="shadow-sm">
            <CardContent className="p-3 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-navy-100 dark:bg-navy-900/30 flex items-center justify-center">
                <span className="text-sm font-bold text-navy-700 dark:text-navy-300">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <Badge className={`${roleColors[user.role] || ''} border-0 text-[9px]`}>{user.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge className={user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[9px]' : 'bg-gray-100 text-gray-700 border-0 text-[9px]'}>
                {user.status}
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="xs"><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="xs" className="text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ================================================================
// WAREHOUSE MANAGEMENT
// ================================================================

function WarehouseManagement() {
  const { data: warehouses, loading, refetch } = useApiData<Warehouse[]>('/api/warehouses')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', code: '', address: '', phone: '', managerName: '' })

  const handleCreate = async () => {
    if (!form.name || !form.code) { toast.error('Name and Code are required'); return }
    try {
      await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      toast.success('Warehouse created')
      setDialogOpen(false)
      setForm({ name: '', code: '', address: '', phone: '', managerName: '' })
      refetch()
    } catch { toast.error('Failed to create warehouse') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{warehouses?.length || 0} warehouses</p>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />Add Warehouse
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-2">
          {warehouses?.map(wh => (
            <Card key={wh.id} className="shadow-sm">
              <CardContent className="p-3 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-navy-100 dark:bg-navy-900/30 flex items-center justify-center">
                  <Warehouse className="h-5 w-5 text-navy-600 dark:text-navy-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{wh.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{wh.code}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{wh.address || 'No address'} · {wh.phone || 'No phone'}</p>
                  {wh.managerName && <p className="text-xs text-muted-foreground">Manager: {wh.managerName}</p>}
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[9px]">Active</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader variant="navy">
            <DialogTitle>Add Warehouse</DialogTitle>
            <DialogDescription>Create a new warehouse location</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="WH-XXX" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Manager</Label><Input value={form.managerName} onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ================================================================
// SYSTEM PREFERENCES
// ================================================================

function SystemPreferences() {
  const [preferences, setPreferences] = React.useState({
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    taxRate: '10',
    lowStockThreshold: '10',
    autoBackup: true,
    emailNotifications: true,
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Date Format</Label>
          <Input value={preferences.dateFormat} onChange={e => setPreferences(p => ({ ...p, dateFormat: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Default Currency</Label>
          <Input value={preferences.currency} onChange={e => setPreferences(p => ({ ...p, currency: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Default Tax Rate (%)</Label>
          <Input type="number" value={preferences.taxRate} onChange={e => setPreferences(p => ({ ...p, taxRate: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Low Stock Threshold</Label>
          <Input type="number" value={preferences.lowStockThreshold} onChange={e => setPreferences(p => ({ ...p, lowStockThreshold: e.target.value }))} />
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Auto Backup</p><p className="text-xs text-muted-foreground">Automatically backup database daily</p></div>
          <Button variant={preferences.autoBackup ? 'default' : 'outline'} size="sm" className={preferences.autoBackup ? 'bg-navy-600' : ''} onClick={() => setPreferences(p => ({ ...p, autoBackup: !p.autoBackup }))}>
            {preferences.autoBackup ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Send alerts via email</p></div>
          <Button variant={preferences.emailNotifications ? 'default' : 'outline'} size="sm" className={preferences.emailNotifications ? 'bg-navy-600' : ''} onClick={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}>
            {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </div>
      <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => toast.success('Preferences saved')}>
        <Save className="h-4 w-4 mr-1" />Save Preferences
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
        <p className="text-sm text-muted-foreground mt-1">Configure your ERP system preferences</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="bg-navy-50 dark:bg-navy-900/30">
          <TabsTrigger value="company" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Building2 className="h-4 w-4 mr-1" />Company
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-1" />Users
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Warehouse className="h-4 w-4 mr-1" />Warehouses
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
            <Cog className="h-4 w-4 mr-1" />Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your organization information</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileForm />
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
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Warehouse Management</CardTitle>
              <CardDescription>Manage storage locations</CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure default system behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemPreferences />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
