'use client'

/**
 * IMS Sidebar Layout Components
 *
 * React components implementing the original CSS layout structure from File 31.
 * Uses Deep Navy Blue theme instead of the original green (#41b53f).
 *
 * Original CSS structure:
 *   .wrapper   → IMSSidebarLayout (flex container, align-items: stretch)
 *   #sidebar   → IMSSidebarPanel (collapsible sidebar, 250px → 80px)
 *   #content   → IMSContentArea (main content, min-height: 88vh)
 *   .navbar    → IMSNavbar (top navigation bar)
 *   .line      → IMSLineSeparator (dashed divider)
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NAVY_SIDEBAR_THEME,
  DEFAULT_SIDEBAR_DIMENSIONS,
  DEFAULT_SIDEBAR_TRANSITIONS,
  DEFAULT_SIDEBAR_HEADER,
  DEFAULT_SIDEBAR_RESPONSIVE,
  type SidebarMenuItem,
  type SidebarHeaderConfig,
  type CTAButtonConfig,
  type SidebarThemeColors,
  type SidebarDimensions,
  type SidebarTransitions,
  type SidebarResponsiveConfig,
} from './types'
import {
  getSidebarClasses,
  getSidebarHeaderClasses,
  getSidebarHeaderTitleClasses,
  getSidebarHeaderShortTitleClasses,
  getMenuItemClasses,
  getMenuItemIconClasses,
  getMenuItemLabelClasses,
  getSubMenuClasses,
  getCTAContainerClasses,
  getCTAButtonClasses,
  getContentAreaClasses,
  getWrapperClasses,
  getLineSeparatorClasses,
  getMobileSidebarClasses,
  getMobileOverlayClasses,
  getDropdownToggleClasses,
  getComponentSeparatorClasses,
} from './sidebar-theme'

// ---------------------------------------------------------------------------
// IMSSidebarLayout — replaces .wrapper
// ---------------------------------------------------------------------------

interface IMSSidebarLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Root layout wrapper for the sidebar + content arrangement.
 *
 * Replaces the original `.wrapper { display: flex; align-items: stretch; }`
 */
export function IMSSidebarLayout({ children, className }: IMSSidebarLayoutProps) {
  return (
    <div className={cn(getWrapperClasses(), className)}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// IMSSidebarPanel — replaces #sidebar
// ---------------------------------------------------------------------------

interface IMSSidebarPanelProps {
  collapsed: boolean
  onToggleCollapse: () => void
  menuItems: SidebarMenuItem[]
  header?: SidebarHeaderConfig
  ctaButtons?: CTAButtonConfig[]
  theme?: SidebarThemeColors
  dimensions?: SidebarDimensions
  transitions?: SidebarTransitions
  className?: string
}

/**
 * Collapsible sidebar panel.
 *
 * Replaces the original:
 *   #sidebar { min-width: 250px; max-width: 250px; background: #41b53f; color: #fff; transition: all 0.5s; }
 *   #sidebar.active { min-width: 80px; max-width: 80px; text-align: center; }
 */
export function IMSSidebarPanel({
  collapsed,
  onToggleCollapse,
  menuItems,
  header = DEFAULT_SIDEBAR_HEADER,
  ctaButtons,
  theme = NAVY_SIDEBAR_THEME,
  className,
}: IMSSidebarPanelProps) {
  const [expandedSubMenus, setExpandedSubMenus] = React.useState<Set<string>>(new Set())

  const toggleSubMenu = React.useCallback((id: string) => {
    setExpandedSubMenus(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <aside
      className={cn(
        getSidebarClasses(collapsed, theme),
        'bg-[--sidebar-bg] dark:bg-[--sidebar-bg-dark] text-white',
        className,
      )}
      style={{
        '--sidebar-bg': theme.background,
        '--sidebar-bg-dark': theme.backgroundDark,
      } as React.CSSProperties}
      data-state={collapsed ? 'collapsed' : 'expanded'}
      role="navigation"
      aria-label="Main sidebar navigation"
    >
      {/* Sidebar Header — replaces #sidebar .sidebar-header */}
      <div
        className={cn(
          getSidebarHeaderClasses(collapsed),
          'bg-[--sidebar-header-bg] dark:bg-[--sidebar-header-bg-dark]',
        )}
        style={{
          '--sidebar-header-bg': theme.headerBackground,
          '--sidebar-header-bg-dark': theme.headerBackgroundDark,
        } as React.CSSProperties}
      >
        {header.icon && (
          <header.icon className="h-6 w-6 text-white shrink-0" />
        )}
        <h3 className={getSidebarHeaderTitleClasses(collapsed)}>
          {header.title}
        </h3>
        <strong className={getSidebarHeaderShortTitleClasses(collapsed)}>
          {header.shortTitle}
        </strong>
      </div>

      {/* Menu Items — replaces #sidebar ul.components */}
      <nav className="flex-1 overflow-y-auto py-1">
        <ul className={getComponentSeparatorClasses()}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <SidebarMenuItemComponent
                item={item}
                collapsed={collapsed}
                expandedSubMenus={expandedSubMenus}
                onToggleSubMenu={toggleSubMenu}
                theme={theme}
              />
            </li>
          ))}
        </ul>

        {/* CTA Buttons — replaces ul.CTAs */}
        {ctaButtons && ctaButtons.length > 0 && !collapsed && (
          <div className={getCTAContainerClasses()}>
            {ctaButtons.map((cta, idx) => (
              <a
                key={idx}
                href={cta.href}
                onClick={cta.onClick}
                className={getCTAButtonClasses(cta.variant)}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Collapse Toggle — replaces #sidebarCollapse */}
      <div className="border-t border-white/20 p-2">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

// ---------------------------------------------------------------------------
// SidebarMenuItemComponent — internal
// ---------------------------------------------------------------------------

interface SidebarMenuItemComponentProps {
  item: SidebarMenuItem
  collapsed: boolean
  expandedSubMenus: Set<string>
  onToggleSubMenu: (id: string) => void
  theme: SidebarThemeColors
}

function SidebarMenuItemComponent({
  item,
  collapsed,
  expandedSubMenus,
  onToggleSubMenu,
  theme,
}: SidebarMenuItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedSubMenus.has(item.id)
  const Icon = item.icon

  const handleClick = () => {
    if (hasChildren) {
      onToggleSubMenu(item.id)
    }
    item.onClick?.()
  }

  return (
    <div>
      <button
        className={cn(
          getMenuItemClasses(collapsed, item.isActive),
          'relative',
        )}
        onClick={handleClick}
        title={collapsed ? item.label : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {Icon && <Icon className={getMenuItemIconClasses(collapsed)} />}
        <span className={getMenuItemLabelClasses(collapsed)}>{item.label}</span>
        {item.badge !== undefined && !collapsed && (
          <span className="ml-auto bg-emerald-400 text-navy-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {/* Dropdown toggle chevron — replaces .dropdown-toggle::after */}
        {hasChildren && !collapsed && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded ? 'rotate-180' : '',
              getDropdownToggleClasses(collapsed),
            )}
          />
        )}
      </button>

      {/* Sub-menu — replaces ul ul a */}
      {hasChildren && isExpanded && !collapsed && (
        <ul className="py-1">
          {item.children!.map((child) => {
            const ChildIcon = child.icon
            return (
              <li key={child.id}>
                <a
                  href={child.href}
                  className={cn(
                    getSubMenuClasses(collapsed),
                    child.isActive ? 'text-white font-medium' : '',
                  )}
                  onClick={child.onClick}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                  <span>{child.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// IMSMobileSidebar — mobile overlay sidebar
// ---------------------------------------------------------------------------

interface IMSMobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  menuItems: SidebarMenuItem[]
  header?: SidebarHeaderConfig
  ctaButtons?: CTAButtonConfig[]
  theme?: SidebarThemeColors
}

/**
 * Mobile sidebar with overlay.
 *
 * Replaces the original @media (max-width: 768px) behavior:
 *   #sidebar { margin-left: -80px !important; }
 *   #sidebar.active { margin-left: 0 !important; }
 */
export function IMSMobileSidebar({
  isOpen,
  onClose,
  menuItems,
  header = DEFAULT_SIDEBAR_HEADER,
  ctaButtons,
  theme = NAVY_SIDEBAR_THEME,
}: IMSMobileSidebarProps) {
  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={getMobileOverlayClasses(isOpen)}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar drawer */}
      <aside
        className={cn(
          getMobileSidebarClasses(isOpen),
          'w-[250px] flex flex-col text-white',
          'bg-[--sidebar-bg] dark:bg-[--sidebar-bg-dark]',
        )}
        style={{
          '--sidebar-bg': theme.background,
          '--sidebar-bg-dark': theme.backgroundDark,
        } as React.CSSProperties}
        aria-label="Mobile sidebar navigation"
      >
        {/* Header */}
        <div
          className={cn(
            getSidebarHeaderClasses(false),
            'bg-[--sidebar-header-bg] dark:bg-[--sidebar-header-bg-dark]',
          )}
          style={{
            '--sidebar-header-bg': theme.headerBackground,
            '--sidebar-header-bg-dark': theme.headerBackgroundDark,
          } as React.CSSProperties}
        >
          {header.icon && <header.icon className="h-6 w-6 text-white shrink-0" />}
          <h3 className={getSidebarHeaderTitleClasses(false)}>{header.title}</h3>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-1">
          <ul className={getComponentSeparatorClasses()}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={getMenuItemClasses(false, item.isActive)}
                  onClick={() => {
                    item.onClick?.()
                    onClose()
                  }}
                >
                  {item.icon && <item.icon className={getMenuItemIconClasses(false)} />}
                  <span className={getMenuItemLabelClasses(false)}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {ctaButtons && ctaButtons.length > 0 && (
            <div className={getCTAContainerClasses()}>
              {ctaButtons.map((cta, idx) => (
                <a
                  key={idx}
                  href={cta.href}
                  onClick={() => {
                    cta.onClick?.()
                    onClose()
                  }}
                  className={getCTAButtonClasses(cta.variant)}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------
// IMSContentArea — replaces #content
// ---------------------------------------------------------------------------

interface IMSContentAreaProps {
  children: React.ReactNode
  className?: string
}

/**
 * Main content area.
 *
 * Replaces the original:
 *   #content { width: 100%; padding: 5px; min-height: 88vh; transition: all 0.3s; }
 */
export function IMSContentArea({ children, className }: IMSContentAreaProps) {
  return (
    <main className={cn(getContentAreaClasses(), className)}>
      {children}
    </main>
  )
}

// ---------------------------------------------------------------------------
// IMSNavbar — replaces .navbar
// ---------------------------------------------------------------------------

interface IMSNavbarProps {
  children: React.ReactNode
  className?: string
}

/**
 * Top navigation bar.
 *
 * Replaces the original:
 *   .navbar { padding: 15px 10px; background: #fff; border: none; border-radius: 0; margin-bottom: 6px; box-shadow: 1px 1px 3px rgba(0,0,0,0.65); }
 *   .navbar-btn { box-shadow: none; outline: none !important; border: none; }
 */
export function IMSNavbar({ children, className }: IMSNavbarProps) {
  return (
    <header className={cn(getNavbarClasses(), 'bg-white dark:bg-navy-800 px-3 py-4 mb-1.5', className)}>
      {children}
    </header>
  )
}

// ---------------------------------------------------------------------------
// IMSLineSeparator — replaces .line
// ---------------------------------------------------------------------------

interface IMSLineSeparatorProps {
  className?: string
}

/**
 * Dashed line separator.
 *
 * Replaces the original:
 *   .line { width: 100%; height: 1px; border-bottom: 1px dashed #ddd; margin: 40px 0; }
 */
export function IMSLineSeparator({ className }: IMSLineSeparatorProps) {
  return (
    <div className={cn(getLineSeparatorClasses(), className)} role="separator" />
  )
}

// ---------------------------------------------------------------------------
// btnUser wrapper — replaces #btnUser
// ---------------------------------------------------------------------------

interface IMSUserButtonProps {
  children: React.ReactNode
  className?: string
}

/**
 * User button wrapper.
 *
 * Replaces the original:
 *   #btnUser { margin-bottom: 5px; }
 */
export function IMSUserButton({ children, className }: IMSUserButtonProps) {
  return (
    <div className={cn('mb-[5px]', className)}>
      {children}
    </div>
  )
}
