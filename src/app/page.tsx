'use client'

import * as React from 'react'
import { Shield, Eye, EyeOff, Loader2, LogIn, Database, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar, type NavItem } from '@/components/layout/app-sidebar'
import { IMSBreadcrumb } from '@/components/layout/ims-breadcrumb'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { DashboardModule } from '@/components/ims/dashboard-module'
import { InvestmentHeadsModule } from '@/components/ims/investment-heads-module'
import { CompaniesModule } from '@/components/ims/companies-module'
import { ColorsModule } from '@/components/ims/colors-module'
import { CategoriesModule } from '@/components/ims/categories-module'
import { BrandsModule } from '@/components/ims/brands-module'
import { WarehousesModule } from '@/components/ims/warehouses-module'
import { UnitsModule } from '@/components/ims/units-module'
import { SegmentsModule } from '@/components/ims/segments-module'
import {
  InventorySection,
  ProductsSection,
  SalesSection,
  PurchaseSection,
  CustomersSection,
  SuppliersSection,
  ReportsSection,
  SettingsSection,
} from '@/components/erp'

// ================================================================
// BREADCRUMB MAP
// ================================================================

const breadcrumbMap: Record<NavItem, Array<{ label: string; href?: string }>> = {
  dashboard: [{ label: 'Home' }, { label: 'Dashboard' }],
  investment: [{ label: 'Home', href: '#' }, { label: 'Investment' }],
  'investment-heads': [{ label: 'Home', href: '#' }, { label: 'Investment', href: '#' }, { label: 'Investment Heads' }],
  'basic-modules': [{ label: 'Home', href: '#' }, { label: 'Basic Modules' }],
  companies: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Companies' }],
  categories: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Categories' }],
  colors: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Colors' }],
  products: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Products' }],
  staff: [{ label: 'Home', href: '#' }, { label: 'Staff' }],
  'customers-suppliers': [{ label: 'Home', href: '#' }, { label: 'Customers & Suppliers' }],
  'inventory-mgmt': [{ label: 'Home', href: '#' }, { label: 'Inventory Management' }],
  'account-mgmt': [{ label: 'Home', href: '#' }, { label: 'Account Management' }],
  sales: [{ label: 'Home', href: '#' }, { label: 'Sales' }],
  purchase: [{ label: 'Home', href: '#' }, { label: 'Purchase' }],
  customers: [{ label: 'Home', href: '#' }, { label: 'Customers' }],
  suppliers: [{ label: 'Home', href: '#' }, { label: 'Suppliers' }],
  inventory: [{ label: 'Home', href: '#' }, { label: 'Inventory' }],
  brands: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Brands' }],
  warehouses: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Warehouses' }],
  units: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Units' }],
  segments: [{ label: 'Home', href: '#' }, { label: 'Basic Modules', href: '#' }, { label: 'Segments' }],
  reports: [{ label: 'Home', href: '#' }, { label: 'Reports' }],
  settings: [{ label: 'Home', href: '#' }, { label: 'Settings' }],
}

// ================================================================
// SECTION RENDERER
// ================================================================

function renderSection(activeItem: NavItem, onNavigate: (section: string) => void) {
  switch (activeItem) {
    case 'dashboard':
      return <DashboardModule onNavigate={onNavigate} />
    case 'investment-heads':
      return <InvestmentHeadsModule />
    case 'companies':
      return <CompaniesModule />
    case 'inventory':
      return <InventorySection />
    case 'products':
      return <ProductsSection />
    case 'categories':
      return <CategoriesModule />
    case 'brands':
      return <BrandsModule />
    case 'units':
      return <UnitsModule />
    case 'sales':
      return <SalesSection />
    case 'purchase':
      return <PurchaseSection />
    case 'customers':
      return <CustomersSection />
    case 'suppliers':
      return <SuppliersSection />
    case 'reports':
      return <ReportsSection />
    case 'settings':
      return <SettingsSection />
    // Placeholder sections for future modules
    case 'investment':
      return <InvestmentHeadsModule />
    case 'basic-modules':
      return <CompaniesModule />
    case 'colors':
      return <ColorsModule />
    case 'warehouses':
      return <WarehousesModule />
    case 'segments':
      return <SegmentsModule />
    case 'staff':
      return <SettingsSection />
    case 'customers-suppliers':
      return <CustomersSection />
    case 'inventory-mgmt':
      return <InventorySection />
    case 'account-mgmt':
      return <ReportsSection />
    default:
      return <DashboardModule onNavigate={onNavigate} />
  }
}

// ================================================================
// LOGIN FORM
// ================================================================

function LoginForm() {
  const [userName, setUserName] = React.useState('emart.amit')
  const [password, setPassword] = React.useState('Test_123')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [seeding, setSeeding] = React.useState(false)
  const login = useAuthStore((s) => s.login)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/auth/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Database seeded successfully')
      } else {
        toast.error(data.message || 'Failed to seed database')
      }
    } catch {
      toast.error('Failed to seed database')
    } finally {
      setSeeding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName || !password) {
      toast.error('Please enter username and password')
      return
    }

    setLoading(true)
    try {
      const success = await login(userName, password)
      if (success) {
        toast.success('Login successful! Welcome to Electronics Mart')
      } else {
        toast.error('Invalid username or password. Please check your credentials.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#132240] to-[#0a1628] p-4">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#132240] border border-[#2563eb]/30 mb-4">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Electronics Mart</h1>
          <p className="text-slate-400 text-sm mt-1">Inventory Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-slate-700/30 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-lg">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-slate-300 text-xs font-semibold">
                  Username
                </Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter username"
                  className="bg-[#0a1628]/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-[#0a1628]/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-[#0a1628] font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <Button
                variant="outline"
                className="w-full border-slate-600/50 text-slate-200 hover:bg-[#132240]/50 hover:text-white"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {seeding ? 'Seeding Data...' : 'Seed Sample Data'}
              </Button>
              <p className="text-center text-slate-500 text-[11px] mt-2">
                Default credentials: emart.amit / Test_123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-xs">
          <p>Developed & Copyright by <span className="text-amber-400 font-semibold">NextGen Digital Studio</span></p>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const [hydrated, setHydrated] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState<NavItem>('dashboard')

  // Wait for Zustand persist to hydrate
  React.useEffect(() => {
    setHydrated(true)
  }, [])

  const handleNavigate = (item: NavItem) => {
    setActiveItem(item)
  }

  const handleLogout = () => {
    useAuthStore.getState().logout()
    toast.success('Logged out successfully')
  }

  // Show loading while checking auth
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#132240] to-[#0a1628]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading Electronics Mart...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Show main ERP application
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <AppHeader
        activeItem={activeItem}
        onNavigate={handleNavigate}
        user={user ? { name: user.name, email: user.email, role: user.role } : null}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar - hidden on mobile */}
        <AppSidebar activeItem={activeItem} onNavigate={handleNavigate} />

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <IMSBreadcrumb items={breadcrumbMap[activeItem]} />

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            {renderSection(activeItem, handleNavigate)}
          </div>
        </main>
      </div>

      {/* Sticky Footer */}
      <Footer />
    </div>
  )
}
