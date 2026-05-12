'use client'

/**
 * IMS Sidebar Navigation Provider
 *
 * Context provider that replaces the entire File 32 jQuery script.
 * Manages sidebar collapse, sub-menu state, active item highlighting,
 * and localStorage persistence.
 *
 * Original jQuery functionality replaced:
 * 1. $('#sidebarCollapse').on('click') → toggleCollapsed()
 * 2. openNav(id) + localStorage → toggleSubmenu(id) with persistence
 * 3. ColorNav(id) + localStorage → setActiveNavItem(id) with persistence
 * 4. Page load restore from localStorage → auto-restored by provider
 * 5. fa-rotate-90 toggle → getAngleClass(id)
 * 6. #cddc39 highlight → getHighlightStyle(id)
 * 7. Default collapsed → defaultCollapsed config
 */

import * as React from 'react'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  LS_KEY_SIDEBAR_STATE,
  LS_KEY_ACTIVE_NAV,
  LS_KEY_SIDEBAR_COLLAPSED,
  DEFAULT_SIDEBAR_NAV_STATE,
  DEFAULT_NAV_HIGHLIGHT,
  DEFAULT_ANGLE_ROTATION,
  DEFAULT_COLLAPSE_CONFIG,
  type SidebarNavState,
  type NavHighlightConfig,
  type AngleRotationConfig,
  type SidebarCollapseConfig,
  type UseSidebarNavReturn,
} from './types'
import { useSidebarNav } from './sidebar-nav-hooks'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SidebarNavContext = React.createContext<UseSidebarNavReturn | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface SidebarNavProviderProps {
  children: React.ReactNode
  highlight?: NavHighlightConfig
  angleRotation?: AngleRotationConfig
  collapse?: SidebarCollapseConfig
  storagePrefix?: string
}

/**
 * Context provider for sidebar navigation state.
 *
 * Wraps useSidebarNav hook and provides all navigation state
 * and actions to child components.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <SidebarNavProvider>
 *       <IMSSidebarLayout>
 *         <Sidebar />
 *         <Content />
 *       </IMSSidebarLayout>
 *     </SidebarNavProvider>
 *   )
 * }
 * ```
 */
export function SidebarNavProvider({
  children,
  highlight = DEFAULT_NAV_HIGHLIGHT,
  angleRotation = DEFAULT_ANGLE_ROTATION,
  collapse = DEFAULT_COLLAPSE_CONFIG,
  storagePrefix,
}: SidebarNavProviderProps) {
  const nav = useSidebarNav({
    highlight,
    angleRotation,
    collapse,
    storagePrefix,
  })

  return (
    <SidebarNavContext.Provider value={nav}>
      {children}
    </SidebarNavContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// useSidebarNavContext — Access Hook
// ---------------------------------------------------------------------------

/**
 * Access sidebar navigation state from context.
 * Must be used within a SidebarNavProvider.
 *
 * @example
 * ```tsx
 * function NavItem({ id, label, hasSubmenu }) {
 *   const nav = useSidebarNavContext()
 *   return (
 *     <div
 *       onClick={() => hasSubmenu ? nav.toggleSubmenu(id) : nav.setActiveNavItem(id)}
 *       style={nav.getHighlightStyle(id)}
 *     >
 *       {label}
 *       {hasSubmenu && <ChevronRight className={`${nav.getAngleClass(id)} transition-transform`} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSidebarNavContext(): UseSidebarNavReturn {
  const context = React.useContext(SidebarNavContext)
  if (!context) {
    throw new Error('useSidebarNavContext must be used within a SidebarNavProvider')
  }
  return context
}

// ---------------------------------------------------------------------------
// Safe Context Hook (no throw)
// ---------------------------------------------------------------------------

/**
 * Safe version of useSidebarNavContext that returns null
 * instead of throwing when used outside a provider.
 * Useful for components that work both with and without the provider.
 */
export function useSidebarNavContextSafe(): UseSidebarNavReturn | null {
  return React.useContext(SidebarNavContext)
}

// ---------------------------------------------------------------------------
// Pre-built Navigation Item Component
// ---------------------------------------------------------------------------

interface SidebarNavItemProps {
  /** Unique identifier (maps to original element id) */
  id: string
  /** Display label */
  label: string
  /** Optional icon (replaces Font Awesome icons) */
  icon?: React.ElementType
  /** Whether this item has a sub-menu (replaces dropdown-toggle class) */
  hasSubmenu?: boolean
  /** Navigation href */
  href?: string
  /** Child content (sub-menu items) */
  children?: React.ReactNode
  /** Extra class names */
  className?: string
}

/**
 * Pre-built sidebar navigation item component.
 *
 * Combines all File 32 behaviors into a single component:
 * - Click handling (openNav / ColorNav)
 * - Angle icon rotation (fa-rotate-90)
 * - Active item highlight (#cddc39)
 *
 * @example
 * ```tsx
 * <SidebarNavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
 * <SidebarNavItem id="products" icon={Package} label="Products" hasSubmenu>
 *   <SidebarNavItem id="product-list" label="All Products" />
 *   <SidebarNavItem id="product-add" label="Add New" />
 * </SidebarNavItem>
 * ```
 */
export function SidebarNavItem({
  id,
  label,
  icon: Icon,
  hasSubmenu = false,
  href,
  children,
  className,
}: SidebarNavItemProps) {
  const nav = useSidebarNavContextSafe()
  const isExpanded = nav?.isSubmenuOpen(id) ?? false
  const isActive = nav?.isActiveItem(id) ?? false
  const angleClass = nav?.getAngleClass(id) ?? 'rotate-0'
  const highlightStyle = nav?.getHighlightStyle(id) ?? {}

  const handleClick = React.useCallback(() => {
    if (!nav) return
    if (hasSubmenu) {
      nav.toggleSubmenu(id)
    } else {
      nav.setActiveNavItem(id)
    }
  }, [nav, hasSubmenu, id])

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className={`
          flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white
          rounded-md transition-all duration-200 text-left
          hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30
          ${isActive ? 'font-medium' : ''}
        `}
        style={highlightStyle}
        aria-expanded={hasSubmenu ? isExpanded : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        <span className="truncate flex-1">{label}</span>
        {hasSubmenu && (
          <svg
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${angleClass}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Sub-menu (replaces original list-unstyled in) */}
      {hasSubmenu && isExpanded && children && (
        <div className="pl-8 py-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pre-built Collapse Toggle Button
// ---------------------------------------------------------------------------

interface SidebarCollapseButtonProps {
  className?: string
  collapsedIcon?: React.ElementType
  expandedIcon?: React.ElementType
  collapsedLabel?: string
  expandedLabel?: string
}

/**
 * Pre-built sidebar collapse toggle button.
 *
 * Replaces the original:
 *   $('#sidebarCollapse').on('click', function () { $('#sidebar').toggleClass('active'); })
 *
 * @example
 * ```tsx
 * <SidebarCollapseButton />
 * ```
 */
export function SidebarCollapseButton({
  className,
  collapsedIcon: CollapsedIcon,
  expandedIcon: ExpandedIcon,
  collapsedLabel = 'Expand',
  expandedLabel = 'Collapse',
}: SidebarCollapseButtonProps) {
  const nav = useSidebarNavContextSafe()
  const isCollapsed = nav?.state.isCollapsed ?? true

  const CollapsedIconComp = CollapsedIcon ?? ChevronsRight
  const ExpandedIconComp = ExpandedIcon ?? ChevronsLeft

  return (
    <button
      onClick={() => nav?.toggleCollapsed()}
      className={`
        flex items-center gap-3 w-full px-3 py-2 rounded-md
        text-white/70 hover:text-white hover:bg-white/10
        text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/30
        ${className ?? ''}
      `}
      aria-label={isCollapsed ? collapsedLabel : expandedLabel}
      title={isCollapsed ? collapsedLabel : expandedLabel}
    >
      {isCollapsed ? (
        <>
          <CollapsedIconComp />
        </>
      ) : (
        <>
          <ExpandedIconComp />
          <span>{expandedLabel}</span>
        </>
      )}
    </button>
  )
}
