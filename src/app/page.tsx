'use client'

import * as React from 'react'
import { Shield, Eye, EyeOff, Loader2, LogIn, RefreshCw, Database } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar, type NavItem } from '@/components/layout/app-sidebar'
import { IMSBreadcrumb } from '@/components/layout/ims-breadcrumb'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  DashboardSection,
  InventorySection,
  ProductsSection,
  SalesSection,
  PurchaseSection,
  ReportsSection,
  SettingsSection,
} from '@/components/erp'

// ================================================================
// BREADCRUMB MAP
// ================================================================

const breadcrumbMap: Record<NavItem, Array<{ label: string; href?: string }>> = {
  dashboard: [{ label: 'Home' }, { label: 'Dashboard' }],
  inventory: [{ label: 'Home', href: '#' }, { label: 'Inventory' }],
  products: [{ label: 'Home', href: '#' }, { label: 'Products' }],
  sales: [{ label: 'Home', href: '#' }, { label: 'Sales' }],
  purchase: [{ label: 'Home', href: '#' }, { label: 'Purchase' }],
  reports: [{ label: 'Home', href: '#' }, { label: 'Reports' }],
  settings: [{ label: 'Home', href: '#' }, { label: 'Settings' }],
}

// ================================================================
// SECTION RENDERER
// ================================================================

function renderSection(activeItem: NavItem) {
  switch (activeItem) {
    case 'dashboard':
      return <DashboardSection />
    case 'inventory':
      return <InventorySection />
    case 'products':
      return <ProductsSection />
    case 'sales':
      return <SalesSection />
    case 'purchase':
      return <PurchaseSection />
    case 'reports':
      return <ReportsSection />
    case 'settings':
      return <SettingsSection />
    default:
      return <DashboardSection />
  }
}

// ================================================================
// LOGIN FORM
// ================================================================

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [userName, setUserName] = React.useState('admin')
  const [password, setPassword] = React.useState('admin123')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [seeding, setSeeding] = React.useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      // Seed auth data (admin user + company)
      await fetch('/api/auth/seed', { method: 'POST' })
      // Seed ERP business data
      await fetch('/api/seed-erp', { method: 'POST' })
      toast.success('Database seeded with sample data')
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      toast.success('Login successful! Welcome to X-Mart Global ERP')
      onLogin()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-navy-600/50 border border-navy-500/30 mb-4">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">X-Mart Global ERP</h1>
          <p className="text-navy-300 text-sm mt-1">Inventory Management System v10.1</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-navy-600/30 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-lg">Sign In</CardTitle>
            <CardDescription className="text-navy-300">
              Enter your credentials to access the ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-navy-200 text-xs font-semibold">
                  Username
                </Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter username"
                  className="bg-navy-800/50 border-navy-600/50 text-white placeholder:text-navy-400 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy-200 text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-navy-800/50 border-navy-600/50 text-white placeholder:text-navy-400 focus:border-amber-500 focus:ring-amber-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold"
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

            <div className="mt-4 pt-4 border-t border-navy-600/30">
              <Button
                variant="outline"
                className="w-full border-navy-600/50 text-navy-200 hover:bg-navy-700/50 hover:text-white"
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
              <p className="text-center text-navy-400 text-[11px] mt-2">
                Default credentials: admin / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-navy-400 text-xs">
          <p>Developed by <span className="text-amber-400 font-semibold">NextGen Digital Studio</span></p>
          <p className="mt-1">Copyright &copy; {new Date().getFullYear()} IMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================

export default function HomePage() {
  const [activeItem, setActiveItem] = React.useState<NavItem>('dashboard')
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [checkingAuth, setCheckingAuth] = React.useState(true)

  // Check auth status on mount
  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data?.user) {
          setIsLoggedIn(true)
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleNavigate = (item: NavItem) => {
    setActiveItem(item)
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-navy-300 text-sm">Loading X-Mart Global ERP...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Show main ERP application
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <AppHeader activeItem={activeItem} onNavigate={handleNavigate} />

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
            {renderSection(activeItem)}
          </div>
        </main>
      </div>

      {/* Sticky Footer */}
      <Footer />
    </div>
  )
}
