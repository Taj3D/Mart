'use client'

import * as React from 'react'
import { Shield, Bell, Menu, LayoutDashboard, Package, BarChart3, Settings, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
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

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Inventory', icon: Package, active: false },
  { label: 'Reports', icon: BarChart3, active: false },
  { label: 'Settings', icon: Settings, active: false },
]

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 bg-navy-700 dark:bg-navy-800 h-[60px] flex items-center px-4 shadow-md">
      {/* Left: Logo + Brand */}
      <div className="flex items-center gap-2 mr-6">
        <Shield className="h-7 w-7 text-white/90" />
        <span className="text-white font-bold text-lg tracking-wide">IMS ERP</span>
      </div>

      {/* Center: Desktop Nav Links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-1.5 px-3 py-2 text-white uppercase font-bold text-[11.8px] tracking-wider transition-colors rounded-sm ${
              item.active
                ? 'bg-white/15'
                : 'hover:bg-white/10'
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          <span className="sr-only">Notifications</span>
        </Button>

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
            <DropdownMenuItem>
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
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm uppercase font-bold tracking-wider rounded-sm transition-colors ${
                    item.active
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
