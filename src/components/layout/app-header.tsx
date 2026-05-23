'use client'

import * as React from 'react'
import { Shield, Bell, Menu, LayoutDashboard, Package, BarChart3, Settings, LogOut, User as UserIcon, ShoppingCart, TrendingUp, FileText, Layers, Users, Truck, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/ui/notification-bell'
import type { NavItem } from './app-sidebar'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const navItems: Array<{ key: NavItem; label: string; icon: React.ElementType }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'investment', label: 'Investment', icon: Landmark },
  { key: 'basic-modules', label: 'Basic Modules', icon: Layers },
  { key: 'sales', label: 'Sales', icon: TrendingUp },
  { key: 'settings', label: 'Reports', icon: BarChart3 },
]

const sampleNotifications = [
  { id: '1', title: 'Order Completed', message: 'Order #ORD-001 has been delivered successfully', time: '2 min ago', read: false, type: 'success' as const },
  { id: '2', title: 'Low Stock Alert', message: 'Widget Pro inventory below threshold (5 units)', time: '15 min ago', read: false, type: 'warning' as const },
  { id: '3', title: 'System Update', message: 'ERP system maintenance scheduled for tonight', time: '1 hr ago', read: true, type: 'info' as const },
  { id: '4', title: 'Payment Failed', message: 'Invoice #INV-4521 payment processing failed', time: '3 hrs ago', read: true, type: 'error' as const },
  { id: '5', title: 'New User Registered', message: 'John Doe has been added to the system', time: '5 hrs ago', read: true, type: 'info' as const },
]

interface AppHeaderProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
  onLogout?: () => void
}

export function AppHeader({ activeItem, onNavigate, user, onLogout }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleNavigate = (item: NavItem) => {
    onNavigate(item)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a1628] dark:bg-[#0a1628] h-[60px] flex items-center px-4 shadow-md">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-2 mr-6">
        <Shield className="h-7 w-7 text-white/90" />
        <span className="text-white font-bold text-lg tracking-wide">Electronics Mart</span>
      </div>

      {/* Center: Desktop Nav Links with animated underline */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigate(item.key)}
            className={`group relative flex items-center gap-1.5 px-3 py-2 text-white uppercase font-bold text-[11.8px] tracking-wider transition-colors rounded-sm ${
              activeItem === item.key
                ? 'bg-white/15'
                : 'hover:bg-white/10'
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
            {/* Animated underline on hover - replaces .navbar-nav > li:after */}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-emerald-400 transition-all duration-500 ease-out ${
                activeItem === item.key ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />

        {/* Notification Bell - replaces #noti_Button, #noti_Counter, #notifications */}
        <NotificationBell
          notifications={sampleNotifications}
          onMarkRead={(id) => console.log('Mark read:', id)}
          onSeeAll={() => console.log('See all notifications')}
        />

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-white/10 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt={user?.name || 'Admin'} />
                <AvatarFallback className="bg-[#132240] text-white text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-white text-sm font-medium">
                {user?.name || 'Admin'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@ims-erp.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Hamburger Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#0a1628] border-slate-700/30 text-white w-[260px]">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-white/90" />
                Electronics Mart
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-4">
              {[
                { key: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
                { key: 'investment-heads' as NavItem, label: 'Investment Heads', icon: Landmark },
                { key: 'companies' as NavItem, label: 'Companies', icon: Layers },
                { key: 'sales' as NavItem, label: 'Sales', icon: TrendingUp },
                { key: 'purchase' as NavItem, label: 'Purchase', icon: ShoppingCart },
                { key: 'customers' as NavItem, label: 'Customers', icon: Users },
                { key: 'suppliers' as NavItem, label: 'Suppliers', icon: Truck },
                { key: 'reports' as NavItem, label: 'Reports', icon: BarChart3 },
                { key: 'settings' as NavItem, label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm uppercase font-bold tracking-wider rounded-sm transition-colors ${
                    activeItem === item.key
                      ? 'bg-[#132240] text-white border-l-4 border-[#2563eb]'
                      : 'text-slate-400 hover:bg-[#132240]/60 hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
