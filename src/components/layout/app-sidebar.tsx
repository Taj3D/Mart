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
  Landmark,
  Palette,
  DollarSign,
  Percent,
  Gauge,
  Target,
  CreditCardIcon,
  IdCard,
  Briefcase,
  MessageSquare,
  BookOpen,
  LineChart,
  Megaphone,
  Ruler,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem =
  | 'dashboard'
  | 'investment'
  | 'investment-heads'
  | 'basic-modules'
  | 'companies'
  | 'categories'
  | 'colors'
  | 'products'
  | 'brands'
  | 'units'
  | 'warehouses'
  | 'segments'
  | 'capacities'
  | 'payment-options'
  | 'card-types'
  | 'staff'
  | 'customers-suppliers'
  | 'inventory-mgmt'
  | 'account-mgmt'
  | 'sales'
  | 'purchase'
  | 'customers'
  | 'suppliers'
  | 'inventory'
  | 'reports'
  | 'settings'

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
// Hierarchical sidebar items — matching target site embd-j.com
// ================================================================

const sidebarItems: SidebarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'Main',
  },
  // ── Investment ──
  {
    key: 'investment',
    label: 'Investment',
    icon: Landmark,
    group: 'Operations',
    subItems: [
      { key: 'investment-heads', label: 'Investment Heads', icon: Landmark },
      // Future: Asset, Liability sub-menus
    ],
    parentOf: ['investment-heads'],
  },
  // ── Basic Modules ──
  {
    key: 'basic-modules',
    label: 'Basic Modules',
    icon: Layers,
    group: 'Operations',
    subItems: [
      { key: 'companies', label: 'Companies', icon: Building2 },
      { key: 'categories', label: 'Categories', icon: FolderTree },
      { key: 'colors', label: 'Color', icon: Palette },
      { key: 'products', label: 'Products', icon: Package },
      { key: 'brands', label: 'Brands', icon: Tag },
      { key: 'units', label: 'Units', icon: Ruler },
      { key: 'warehouses', label: 'Godowns', icon: Warehouse },
      { key: 'segments', label: 'Segments', icon: PieChart },
      { key: 'capacities', label: 'Capacities', icon: Gauge },
      { key: 'payment-options', label: 'Payment Options', icon: DollarSign },
      { key: 'card-types', label: 'Card Types', icon: CreditCard },
    ],
    parentOf: ['companies', 'categories', 'colors', 'products', 'brands', 'units', 'warehouses', 'segments', 'capacities', 'payment-options', 'card-types'],
  },
  // ── Staff ──
  {
    key: 'staff',
    label: 'Staff',
    icon: Briefcase,
    group: 'People',
  },
  // ── Customers & Suppliers ──
  {
    key: 'customers-suppliers',
    label: 'Customers & Suppliers',
    icon: Users,
    group: 'People',
    subItems: [
      { key: 'customers', label: 'Customers', icon: Users },
      { key: 'suppliers', label: 'Suppliers', icon: Truck },
    ],
    parentOf: ['customers', 'suppliers'],
  },
  // ── Inventory Management ──
  {
    key: 'inventory-mgmt',
    label: 'Inventory Management',
    icon: Warehouse,
    group: 'Operations',
    subItems: [
      { key: 'inventory', label: 'Stock Overview', icon: BarChart2 },
      { key: 'stock-adjustment', label: 'Stock Adjustment', icon: ArrowLeftRight },
      { key: 'stock-movements', label: 'Stock Movements', icon: Truck },
    ],
    parentOf: ['inventory'],
  },
  // ── Account Management ──
  {
    key: 'account-mgmt',
    label: 'Account Management',
    icon: DollarSign,
    group: 'Finance',
  },
  // ── Sales ──
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
  // ── Purchase ──
  {
    key: 'purchase',
    label: 'Purchase',
    icon: ShoppingCart,
    group: 'Operations',
    subItems: [
      { key: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
      { key: 'goods-receipt', label: 'Goods Receipt', icon: PackageCheck },
    ],
  },
  // ── SMS Service ──
  {
    key: 'reports',
    label: 'SMS Service',
    icon: MessageSquare,
    group: 'System',
  },
  // ── Accounting Report ──
  {
    key: 'settings',
    label: 'Accounting Report',
    icon: BookOpen,
    group: 'Reports',
  },
]

// ================================================================
// Helper: map any NavItem to its parent sidebar item
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
    const parent = getParentNavItem(activeItem)
    const item = sidebarItems.find((i) => i.key === parent)
    return item?.subItems ? new Set([parent]) : new Set()
  })

  const activeTopLevel = getParentNavItem(activeItem)

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

  const handleTopLevelClick = (item: SidebarItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpand(item.key)
    }
    onNavigate(item.key)
  }

  const handleSubItemClick = (parentKey: NavItem, subKey: string) => {
    const validNavItems = new Set<string>(sidebarItems.map((i) => i.key))
    for (const item of sidebarItems) {
      if (item.parentOf) {
        for (const child of item.parentOf) {
          validNavItems.add(child)
        }
      }
    }
    if (validNavItems.has(subKey)) {
      onNavigate(subKey as NavItem)
    } else {
      onNavigate(parentKey)
    }
  }

  const groups = sidebarItems.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-[#0a1628] dark:bg-[#0a1628] border-r border-slate-700/30 transition-all duration-300 shrink-0 overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-[250px]'
      )}
    >
      {/* Sidebar Menu */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            {/* Group Label */}
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                          ? 'bg-[#132240] text-white border-l-4 border-[#2563eb]'
                          : 'text-slate-400 hover:bg-[#132240]/60 hover:text-white border-l-4 border-transparent',
                        collapsed && 'justify-center px-0 border-l-0'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          )}
                        </>
                      )}
                    </button>

                    {/* Sub-menu items */}
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
                                onClick={() => handleSubItemClick(item.key, sub.key)}
                                className={cn(
                                  'flex items-center gap-2.5 w-full px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                                  'text-slate-500 hover:text-white hover:bg-[#132240]/60',
                                  activeItem === sub.key && 'text-white bg-[#132240]/80'
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
        <div className="px-4 py-2 border-t border-slate-700/30">
          <p className="text-[10px] text-slate-600">Electronics Mart v1.0</p>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t border-slate-700/30 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-slate-500 hover:text-white hover:bg-[#132240]/60 text-sm transition-colors"
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
