'use client'

import * as React from 'react'
import {
  Building, UserCog, SlidersHorizontal, CalendarClock, Save,
  Shield, Users, Bell, Mail, Phone, MapPin, Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useNavigationStore } from '@/lib/stores/navigation-store'

// COMPANY TAB
function CompanyTab() {
  const [company, setCompany] = React.useState<{ id: string; name: string; address?: string; phone?: string; email?: string; website?: string; currency: string; vatRate: number; taxId?: string } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/auth/seed', { method: 'POST' })
      .then(() => fetch('/api/companies'))
      .then(res => res.json())
      .then(data => { if (data?.data) setCompany(data.data[0]); setLoading(false) })
      .catch(() => {
        // Fallback: just show a form
        setLoading(false)
      })
  }, [])

  if (loading) return <Skeleton className="h-[400px]" />

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-navy-600 dark:text-navy-400" /> Company Profile</CardTitle>
          <CardDescription>Manage your company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input defaultValue={company?.name || 'X-Mart Global'} /></div>
            <div><Label>Currency</Label><Input defaultValue={company?.currency || 'BDT'} /></div>
            <div><Label>Phone</Label><Input defaultValue={company?.phone || ''} /></div>
            <div><Label>Email</Label><Input defaultValue={company?.email || ''} /></div>
            <div><Label>Address</Label><Input defaultValue={company?.address || ''} /></div>
            <div><Label>Website</Label><Input defaultValue={company?.website || ''} /></div>
            <div><Label>VAT Rate (%)</Label><Input type="number" defaultValue={company?.vatRate || 15} /></div>
            <div><Label>Tax ID</Label><Input defaultValue={company?.taxId || ''} /></div>
          </div>
          <Button className="bg-navy-600 hover:bg-navy-700"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// USERS TAB
function UsersTab() {
  const [users, setUsers] = React.useState<Array<{ id: string; userName: string; fullName?: string; email?: string; role: string; isActive: boolean; lastLoginAt?: string }>>([])

  React.useEffect(() => {
    fetch('/api/users')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.data) setUsers(data.data) })
      .catch(() => {})
  }, [])

  // If no users from API, show default
  const displayUsers = users.length > 0 ? users : [
    { id: '1', userName: 'admin', fullName: 'System Administrator', email: 'admin@xmart.com', role: 'SuperAdmin', isActive: true, lastLoginAt: new Date().toISOString() },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-navy-600 dark:text-navy-400" /> User Management</CardTitle>
              <CardDescription>Manage system users and roles</CardDescription>
            </div>
            <Button size="sm" className="bg-navy-600 hover:bg-navy-700"><Users className="h-4 w-4 mr-1" /> Add User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="ims-table w-full text-sm">
              <thead>
                <tr className="ims-table-header">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Username</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Full Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Email</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Role</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map(u => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="px-3 py-2.5 font-medium">{u.userName}</td>
                    <td className="px-3 py-2.5">{u.fullName || '—'}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{u.email || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge className={`border-0 text-[10px] ${u.role === 'SuperAdmin' ? 'bg-violet-100 text-violet-700' : u.role === 'Admin' ? 'bg-navy-100 text-navy-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge className={`border-0 text-[10px] ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// SYSTEM TAB
function SystemTab() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-navy-600 dark:text-navy-400" /> System Settings</CardTitle>
          <CardDescription>Configure system preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-3">General</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Default Currency</Label><Input defaultValue="BDT" /></div>
              <div><Label>Date Format</Label><Input defaultValue="DD/MM/YYYY" /></div>
              <div><Label>Time Zone</Label><Input defaultValue="Asia/Dhaka" /></div>
              <div><Label>Language</Label><Input defaultValue="English" /></div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-3">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-navy-600" /><span className="text-sm">Low Stock Alerts</span></div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy-600" /><span className="text-sm">Email Notifications</span></div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-navy-600" /><span className="text-sm">Security Alerts</span></div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Enabled</Badge>
              </div>
            </div>
          </div>
          <Button className="bg-navy-600 hover:bg-navy-700"><Save className="h-4 w-4 mr-2" /> Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// EMI PLANS TAB
function EmiPlansTab() {
  const [plans, setPlans] = React.useState<Array<{ id: string; planName: string; tenureMonths: number; interestRate: number; processingFee: number; downPaymentPercent: number; isActive: boolean }>>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/emi')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.data) setPlans(data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-navy-600 dark:text-navy-400" /> EMI Plans</CardTitle>
          <CardDescription>Configure installment payment plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[200px]" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <Card key={plan.id} className="border border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{plan.planName}</h4>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Tenure:</span> <span className="font-medium">{plan.tenureMonths} months</span></div>
                      <div><span className="text-muted-foreground">Interest:</span> <span className="font-medium">{plan.interestRate}%</span></div>
                      <div><span className="text-muted-foreground">Processing Fee:</span> <span className="font-medium">৳{plan.processingFee}</span></div>
                      <div><span className="text-muted-foreground">Down Payment:</span> <span className="font-medium">{plan.downPaymentPercent}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// MAIN SETTINGS PAGE
export function SettingsPage() {
  const { activeSubPage, setActiveSubPage } = useNavigationStore()
  const tabValue = ['company', 'users', 'system', 'emi-plans'].includes(activeSubPage) ? activeSubPage : 'company'

  return (
    <Tabs value={tabValue} onValueChange={v => setActiveSubPage(v)}>
      <TabsList className="bg-navy-100 dark:bg-navy-800">
        <TabsTrigger value="company" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><Building className="h-4 w-4 mr-1" /> Company</TabsTrigger>
        <TabsTrigger value="users" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><UserCog className="h-4 w-4 mr-1" /> Users</TabsTrigger>
        <TabsTrigger value="system" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><SlidersHorizontal className="h-4 w-4 mr-1" /> System</TabsTrigger>
        <TabsTrigger value="emi-plans" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"><CalendarClock className="h-4 w-4 mr-1" /> EMI Plans</TabsTrigger>
      </TabsList>
      <TabsContent value="company"><CompanyTab /></TabsContent>
      <TabsContent value="users"><UsersTab /></TabsContent>
      <TabsContent value="system"><SystemTab /></TabsContent>
      <TabsContent value="emi-plans"><EmiPlansTab /></TabsContent>
    </Tabs>
  )
}
