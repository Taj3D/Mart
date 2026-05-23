'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Users,
  Truck,
  ArrowLeftRight,
  FolderTree,
  Tag,
  FileText,
  Receipt,
  CreditCard,
  ClipboardList,
  Warehouse,
  PackageCheck,
  BarChart2,
  PieChart,
  ScrollText,
  Building2,
  UserCog,
  Cog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem = 'dashboard' | 'inventory' | 'products' | 'sales' | 'purchase' | 'customers' | 'suppliers' | 'reports' | 'settings'

// ================================================================
// Sub-menu item definition
// ================================================================

interface SubItem {
  key: string
  label: string
  icon: React.ElementType
}

// ================================================================
// Sidebar item definition with optional sub-items
// ================================================================

interface SidebarItem {
  key: NavItem
  label: string
  icon: React.ElementType
  group: string
  subItems?: SubItem[]
  /** NavItem that should be considered the parent for active-state highlighting */
  parentOf?: NavItem[]
}

// ================================================================
// Hierarchical sidebar items
// ================================================================

const sidebarItems: SidebarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'Main',
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Package,
    group: 'Operations',
    subItems: [
      { key: 'stock-overview', label: 'Stock Overview', icon: BarChart2 },
      { key: 'stock-adjustment', label: 'Stock Adjustment', icon: ArrowLeftRight },
      { key: 'stock-movements', label: 'Stock Movements', icon: Truck },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    icon: Layers,
    group: 'Operations',
    subItems: [
      { key: 'all-products', label: 'All Products', icon: Package },
      { key: 'categories', label: 'Categories', icon: FolderTree },
      { key: 'brands', label: 'Brands', icon: Tag },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: TrendingUp,
    group: 'Operations',
    subItems: [
      { key: 'sales-orders', label: 'Sales Orders', icon: FileText },
      { key: 'invoices', label: 'Invoices', icon: Receipt },
      { key: 'payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    key: 'purchase',
    label: 'Purchase',
    icon: ShoppingCart,
    group: 'Operations',
    subItems: [
      { key: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
      { key: 'suppliers', label: 'Suppliers', icon: Users },
      { key: 'goods-receipt', label: 'Goods Receipt', icon: PackageCheck },
    ],
    parentOf: ['suppliers'],
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    group: 'People',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    group: 'Analytics',
    subItems: [
      { key: 'sales-report', label: 'Sales Report', icon: TrendingUp },
      { key: 'inventory-report', label: 'Inventory Report', icon: PieChart },
      { key: 'financial-report', label: 'Financial Report', icon: BarChart2 },
      { key: 'audit-log', label: 'Audit Log', icon: ScrollText },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    group: 'System',
    subItems: [
      { key: 'company-profile', label: 'Company Profile', icon: Building2 },
      { key: 'users', label: 'Users', icon: UserCog },
      { key: 'warehouses', label: 'Warehouses', icon: Warehouse },
      { key: 'system', label: 'System', icon: Cog },
    ],
  },
]

// ================================================================
// Helper: map any NavItem to its parent sidebar item
// (e.g. 'suppliers' → the Purchase sidebar item)
// ================================================================

const navItemToParent: Partial<Record<NavItem, NavItem>> = {}
for (const item of sidebarItems) {
  if (item.parentOf) {
    for (const child of item.parentOf) {
      navItemToParent[child] = item.key
    }
  }
}

function getParentNavItem(item: NavItem): NavItem {
  return navItemToParent[item] ?? item
}

// ================================================================
// Component
// ================================================================

interface AppSidebarProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

export function AppSidebar({ activeItem, onNavigate }: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<Set<NavItem>>(() => {
    // Auto-expand the group that contains the active item on mount
    const parent = getParentNavItem(activeItem)
    const item = sidebarItems.find((i) => i.key === parent)
    return item?.subItems ? new Set([parent]) : new Set()
  })

  // Resolve the active top-level key (e.g. 'suppliers' → 'purchase')
  const activeTopLevel = getParentNavItem(activeItem)

  // ----------------------------------------------------------------
  // Toggle a top-level item's sub-menu open / closed
  // ----------------------------------------------------------------
  const toggleExpand = (key: NavItem) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // ----------------------------------------------------------------
  // Handle top-level item click:
  //   - If item has sub-items: expand its menu AND navigate
  //   - If no sub-items: just navigate
  // ----------------------------------------------------------------
  const handleTopLevelClick = (item: SidebarItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpand(item.key)
    }
    onNavigate(item.key)
  }

  // ----------------------------------------------------------------
  // Handle sub-item click: navigate to the parent section
  // ----------------------------------------------------------------
  const handleSubItemClick = (parentKey: NavItem) => {
    onNavigate(parentKey)
  }

  // ----------------------------------------------------------------
  // Group items by group name
  // ----------------------------------------------------------------
  const groups = sidebarItems.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-navy-800 dark:bg-navy-900 border-r border-navy-700/50 transition-all duration-300 shrink-0 overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-[250px]'
      )}
    >
      {/* Sidebar Menu */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            {/* Group Label */}
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-navy-500 dark:text-navy-400">
                {groupName}
              </p>
            )}

            <ul className="flex flex-col gap-0.5 px-2">
              {items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0
                const isExpanded = expandedItems.has(item.key)
                const isActive = activeTopLevel === item.key

                return (
                  <li key={item.key}>
                    {/* Top-level button */}
                    <button
                      onClick={() => handleTopLevelClick(item)}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-navy-700/50 text-white border-l-4 border-emerald-400'
                          : 'text-navy-300 hover:bg-navy-700/30 hover:text-white border-l-4 border-transparent',
                        collapsed && 'justify-center px-0 border-l-0'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>

                          {/* Chevron for items with sub-menus */}
                          {hasSubItems && (
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 shrink-0 text-navy-400 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          )}
                        </>
                      )}
                    </button>

                    {/* Sub-menu items with smooth expand animation */}
                    {hasSubItems && !collapsed && (
                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-200 ease-in-out',
                          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        )}
                      >
                        <ul className="flex flex-col gap-0.5 mt-0.5 pl-4">
                          {item.subItems!.map((sub) => (
                            <li key={sub.key}>
                              <button
                                onClick={() => handleSubItemClick(item.key)}
                                className={cn(
                                  'flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                                  'text-navy-400 hover:text-white hover:bg-navy-700/30',
                                  isActive && 'text-navy-200'
                                )}
                              >
                                <sub.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{sub.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Version Info */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-navy-700/50">
          <p className="text-[10px] text-navy-500">Electronics Mart v1.0</p>
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
            <ChevronRight className="h-5 w-5 shrink-0 mx-auto" />
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
