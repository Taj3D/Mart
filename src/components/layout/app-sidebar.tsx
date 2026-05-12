'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Inventory', icon: Package, active: false },
  { label: 'Products', icon: ShoppingCart, active: false },
  { label: 'Sales', icon: TrendingUp, active: false },
  { label: 'Purchase', icon: FileText, active: false },
  { label: 'Reports', icon: BarChart3, active: false },
  { label: 'Settings', icon: Settings, active: false },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-navy-800 dark:bg-navy-900 border-r border-navy-700/50 transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-[250px]'
      )}
    >
      {/* Sidebar Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-0.5 px-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <button
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-navy-700/50 text-white border-l-4 border-emerald-400'
                    : 'text-navy-300 hover:bg-navy-700/30 hover:text-white border-l-4 border-transparent'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-navy-700/50 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-navy-400 hover:text-white hover:bg-navy-700/30 text-sm transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
