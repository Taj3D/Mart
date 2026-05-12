'use client'

import * as React from 'react'
import { Shield, Bell, Menu, LayoutDashboard, Package, BarChart3, Settings, LogOut, User as UserIcon, ShoppingCart, TrendingUp, FileText, Layers } from 'lucide-react'
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
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'sales', label: 'Sales', icon: TrendingUp },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
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
}

export function AppHeader({ activeItem, onNavigate }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleNavigate = (item: NavItem) => {
    onNavigate(item)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-navy-700 dark:bg-navy-800 h-[60px] flex items-center px-4 shadow-md">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-2 mr-6">
        <Shield className="h-7 w-7 text-white/90" />
        <span className="text-white font-bold text-lg tracking-wide">IMS ERP</span>
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
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-navy-500 text-white text-xs">AD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-white text-sm font-medium">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@ims-erp.com</p>
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
            <DropdownMenuItem variant="destructive">
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
          <SheetContent side="left" className="bg-navy-800 dark:bg-navy-900 border-navy-700 text-white w-[260px]">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-white/90" />
                IMS ERP
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-4">
              {[
                { key: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
                { key: 'inventory' as NavItem, label: 'Inventory', icon: Package },
                { key: 'products' as NavItem, label: 'Products', icon: Layers },
                { key: 'sales' as NavItem, label: 'Sales', icon: TrendingUp },
                { key: 'purchase' as NavItem, label: 'Purchase', icon: ShoppingCart },
                { key: 'reports' as NavItem, label: 'Reports', icon: BarChart3 },
                { key: 'settings' as NavItem, label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm uppercase font-bold tracking-wider rounded-sm transition-colors ${
                    activeItem === item.key
                      ? 'bg-white/15 text-white border-l-4 border-emerald-400'
                      : 'text-navy-300 hover:bg-white/10 hover:text-white'
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
