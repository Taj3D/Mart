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
  Layers,
  Users,
  Warehouse,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem = 'dashboard' | 'inventory' | 'products' | 'sales' | 'purchase' | 'reports' | 'settings'

const sidebarItems: Array<{ key: NavItem; label: string; icon: React.ElementType; group: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Main' },
  { key: 'inventory', label: 'Inventory', icon: Package, group: 'Operations' },
  { key: 'products', label: 'Products', icon: Layers, group: 'Operations' },
  { key: 'sales', label: 'Sales', icon: TrendingUp, group: 'Operations' },
  { key: 'purchase', label: 'Purchase', icon: ShoppingCart, group: 'Operations' },
  { key: 'reports', label: 'Reports', icon: BarChart3, group: 'Analytics' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'System' },
]

interface AppSidebarProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

export function AppSidebar({ activeItem, onNavigate }: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  // Group items
  const groups = sidebarItems.reduce<Record<string, typeof sidebarItems>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-navy-800 dark:bg-navy-900 border-r border-navy-700/50 transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-[250px]'
      )}
    >
      {/* Sidebar Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-navy-500 dark:text-navy-400">
                {groupName}
              </p>
            )}
            <ul className="flex flex-col gap-0.5 px-2">
              {items.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      activeItem === item.key
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
          </div>
        ))}
      </nav>

      {/* Version Info */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-navy-700/50">
          <p className="text-[10px] text-navy-500">X-Mart Global ERP v10.1</p>
        </div>
      )}

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
