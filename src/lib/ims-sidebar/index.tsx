/**
 * IMS Sidebar Module
 *
 * Complete conversion of the original sidebar CSS (File 31) to React/Tailwind.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * ORIGINAL CSS → REACT/TAILWIND MAPPING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CSS Selector                    → React Component / Hook
 * ────────────────────────────────┼─────────────────────────────────────
 * .wrapper                        → IMSSidebarLayout
 * #sidebar                        → IMSSidebarPanel
 * #sidebar.active                 → collapsed prop on IMSSidebarPanel
 * #sidebar .sidebar-header        → header prop on IMSSidebarPanel
 * #sidebar .sidebar-header h3     → auto-hidden when collapsed
 * #sidebar .sidebar-header strong → auto-shown when collapsed
 * #sidebar ul li a                → SidebarMenuItemComponent
 * #sidebar ul li a:hover          → Tailwind hover classes
 * #sidebar ul li.active > a       → isActive prop on SidebarMenuItem
 * ul ul a                         → Sub-menu items (collapsible)
 * ul.CTAs                         → ctaButtons prop on IMSSidebarPanel
 * a.download                      → CTA variant='download'
 * a.article                       → CTA variant='article'
 * .dropdown-toggle::after         → ChevronDown icon
 * #content                        → IMSContentArea
 * .navbar                         → IMSNavbar
 * .navbar-btn                     → getNavbarBtnClasses()
 * .line                           → IMSLineSeparator
 * #btnUser                        → IMSUserButton
 * a:active                        → active:text-[#18bc9c]
 * @media (max-width: 768px)       → IMSMobileSidebar + useSidebarResponsive
 *
 * ═══════════════════════════════════════════════════════════════════════
 * COLOR THEME CONVERSION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Original Color        → Deep Navy Blue Theme
 * ──────────────────────┼─────────────────────────────
 * #41b53f (green)       → #1a2744 (primary sidebar)
 * #41b53f (header)      → #243b5c (header bg)
 * #41b53f (sub-menu)    → #1e3050 (sub-menu bg)
 * #fff (navbar bg)      → #1a2744 or #ffffff (configurable)
 * #18bc9c (active link) → #18bc9c (preserved as accent)
 * #ddd (line)           → gray-300 (border-dashed)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MIGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * BEFORE (jQuery + Bootstrap):
 * ```html
 * <div class="wrapper">
 *   <nav id="sidebar">
 *     <div class="sidebar-header">
 *       <h3>IMS ERP</h3>
 *       <strong>IMS</strong>
 *     </div>
 *     <ul class="components">
 *       <li class="active"><a href="#"><i class="fa fa-dashboard"></i> Dashboard</a></li>
 *       <li><a href="#pageSubmenu" data-toggle="collapse">Products <i class="dropdown-toggle"></i></a>
 *         <ul class="collapse list-unstyled" id="pageSubmenu">
 *           <li><a href="#">List All</a></li>
 *           <li><a href="#">Add New</a></li>
 *         </ul>
 *       </li>
 *     </ul>
 *     <ul class="CTAs">
 *       <li><a href="#" class="download">Download</a></li>
 *       <li><a href="#" class="article">Help</a></li>
 *     </ul>
 *   </nav>
 *   <div id="content">
 *     <nav class="navbar">...</nav>
 *     <h2>Page Content</h2>
 *   </div>
 * </div>
 * ```
 *
 * AFTER (React + Tailwind):
 * ```tsx
 * import { IMSSidebarLayout, IMSSidebarPanel, IMSContentArea, useSidebarState } from '@/lib/ims-sidebar'
 *
 * function App() {
 *   const { isCollapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile, isMobile } = useSidebarState()
 *
 *   return (
 *     <IMSSidebarLayout>
 *       {isMobile ? (
 *         <IMSMobileSidebar isOpen={mobileOpen} onClose={closeMobile} menuItems={items} />
 *       ) : (
 *         <IMSSidebarPanel collapsed={isCollapsed} onToggleCollapse={toggleCollapsed} menuItems={items} />
 *       )}
 *       <IMSContentArea>
 *         <h2>Page Content</h2>
 *       </IMSContentArea>
 *     </IMSSidebarLayout>
 *   )
 * }
 * ```
 *
 * OR use the pre-built IMSSidebarProvider for context-based state management:
 * ```tsx
 * import { IMSSidebarProvider, useIMSSidebar } from '@/lib/ims-sidebar'
 *
 * function App() {
 *   return (
 *     <IMSSidebarProvider menuItems={items}>
 *       <AppLayout />
 *     </IMSSidebarProvider>
 *   )
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
  SidebarDimensions,
  SidebarTransitions,
  SidebarThemeColors,
  NavbarConfig,
  ContentAreaConfig,
  SidebarMenuItem,
  SidebarHeaderConfig,
  SidebarResponsiveConfig,
  SidebarMenuItem as SidebarMenuItemType,
  CTAButtonConfig,
  LineSeparatorConfig,
  IMSSidebarConfig,
  IMSSidebarLayoutProps,
  IMSSidebarPanelProps,
  IMSContentAreaProps,
  IMSNavbarProps,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export {
  DEFAULT_SIDEBAR_DIMENSIONS,
  DEFAULT_SIDEBAR_TRANSITIONS,
  NAVY_SIDEBAR_THEME,
  DEFAULT_NAVBAR_CONFIG,
  DEFAULT_CONTENT_AREA_CONFIG,
  DEFAULT_SIDEBAR_HEADER,
  DEFAULT_SIDEBAR_RESPONSIVE,
  DEFAULT_LINE_SEPARATOR,
} from './types'

// ---------------------------------------------------------------------------
// Theme / Class Utilities
// ---------------------------------------------------------------------------
export {
  getSidebarClasses,
  getSidebarBackgroundClasses,
  getSidebarInlineStyles,
  getSidebarHeaderClasses,
  getSidebarHeaderTitleClasses,
  getSidebarHeaderShortTitleClasses,
  getMenuItemClasses,
  getMenuItemIconClasses,
  getMenuItemLabelClasses,
  getSubMenuClasses,
  getCTAContainerClasses,
  getCTAButtonClasses,
  getNavbarClasses,
  getNavbarButtonClasses,
  getContentAreaClasses,
  getWrapperClasses,
  getLineSeparatorClasses,
  getMobileSidebarClasses,
  getMobileOverlayClasses,
  getActiveLinkClasses,
  getUserButtonClasses,
  getComponentSeparatorClasses,
  getDropdownToggleClasses,
  getFullSidebarClassConfig,
} from './sidebar-theme'

// ---------------------------------------------------------------------------
// Layout Components
// ---------------------------------------------------------------------------
export {
  IMSSidebarLayout,
  IMSSidebarPanel,
  IMSMobileSidebar,
  IMSContentArea,
  IMSNavbar,
  IMSLineSeparator,
  IMSUserButton,
} from './sidebar-layout'

// ---------------------------------------------------------------------------
// Responsive Hooks
// ---------------------------------------------------------------------------
export {
  useSidebarResponsive,
  useSidebarState,
  useViewportWidth,
  useIsAboveBreakpoint,
} from './sidebar-responsive'

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
export {
  SIDEBAR_TRANSITION,
  CONTENT_TRANSITION,
  LINK_HOVER_TRANSITION,
  MOBILE_SLIDE_TRANSITION,
  sidebarVariants,
  mobileDrawerVariants,
  overlayVariants,
  subMenuVariants,
  menuItemHoverVariants,
  headerTitleVariants,
  headerShortTitleVariants,
  contentAreaVariants,
  cssTransitions,
  buildSidebarVariants,
  buildMobileDrawerVariants,
} from './sidebar-animations'

// ---------------------------------------------------------------------------
// Navbar Styles
// ---------------------------------------------------------------------------
export {
  getNavbarTailwindClasses,
  getNavbarInlineStyles,
  getNavbarBtnClasses,
  getNavbarBrandClasses,
  getNavbarNavClasses,
  getNavbarNavItemClasses,
  getNavbarUnderlineClasses,
  navbarColorPresets,
  navbarTextPresets,
} from './navbar-styles'

// ---------------------------------------------------------------------------
// Context Provider (convenience)
// ---------------------------------------------------------------------------

import * as React from 'react'
import {
  NAVY_SIDEBAR_THEME,
  DEFAULT_SIDEBAR_DIMENSIONS,
  DEFAULT_SIDEBAR_TRANSITIONS,
  DEFAULT_SIDEBAR_RESPONSIVE,
  DEFAULT_SIDEBAR_HEADER,
  type SidebarMenuItem,
  type SidebarHeaderConfig,
  type CTAButtonConfig,
  type SidebarThemeColors,
  type SidebarDimensions,
  type SidebarTransitions,
  type SidebarResponsiveConfig,
} from './types'
import { useSidebarState } from './sidebar-responsive'

/** Context value for the sidebar provider */
interface IMSSidebarContextValue {
  /** Whether sidebar is collapsed */
  isCollapsed: boolean
  /** Whether mobile drawer is open */
  mobileOpen: boolean
  /** Whether viewport is mobile */
  isMobile: boolean
  /** Toggle collapsed/open state */
  toggleCollapsed: () => void
  /** Open mobile drawer */
  openMobile: () => void
  /** Close mobile drawer */
  closeMobile: () => void
  /** Menu items */
  menuItems: SidebarMenuItem[]
  /** Header config */
  header: SidebarHeaderConfig
  /** CTA buttons */
  ctaButtons: CTAButtonConfig[]
  /** Theme */
  theme: SidebarThemeColors
  /** Dimensions */
  dimensions: SidebarDimensions
  /** Transitions */
  transitions: SidebarTransitions
  /** Responsive config */
  responsive: SidebarResponsiveConfig
}

const SidebarContext = React.createContext<IMSSidebarContextValue | null>(null)

/** Props for the IMSSidebarProvider */
interface IMSSidebarProviderProps {
  children: React.ReactNode
  /** Menu items for the sidebar */
  menuItems: SidebarMenuItem[]
  /** Header configuration */
  header?: SidebarHeaderConfig
  /** CTA buttons */
  ctaButtons?: CTAButtonConfig[]
  /** Theme colors */
  theme?: SidebarThemeColors
  /** Dimensions */
  dimensions?: SidebarDimensions
  /** Transitions */
  transitions?: SidebarTransitions
  /** Responsive config */
  responsive?: SidebarResponsiveConfig
  /** Default collapsed state */
  defaultCollapsed?: boolean
}

/**
 * Context provider for sidebar state management.
 *
 * Wraps useSidebarState hook and provides sidebar config to all children.
 * This is the recommended way to use the sidebar in a full application.
 *
 * @example
 * ```tsx
 * <IMSSidebarProvider menuItems={navItems}>
 *   <AppLayout />
 * </IMSSidebarProvider>
 * ```
 */
export function IMSSidebarProvider({
  children,
  menuItems,
  header = DEFAULT_SIDEBAR_HEADER,
  ctaButtons = [],
  theme = NAVY_SIDEBAR_THEME,
  dimensions = DEFAULT_SIDEBAR_DIMENSIONS,
  transitions = DEFAULT_SIDEBAR_TRANSITIONS,
  responsive = DEFAULT_SIDEBAR_RESPONSIVE,
  defaultCollapsed = false,
}: IMSSidebarProviderProps) {
  const sidebarState = useSidebarState({ defaultCollapsed, responsive })

  const value = React.useMemo<IMSSidebarContextValue>(() => ({
    ...sidebarState,
    menuItems,
    header,
    ctaButtons,
    theme,
    dimensions,
    transitions,
    responsive,
  }), [sidebarState, menuItems, header, ctaButtons, theme, dimensions, transitions, responsive])

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

/**
 * Hook to access sidebar context.
 * Must be used within an IMSSidebarProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isCollapsed, toggleCollapsed, menuItems } = useIMSSidebar()
 *   return <button onClick={toggleCollapsed}>{isCollapsed ? 'Expand' : 'Collapse'}</button>
 * }
 * ```
 */
export function useIMSSidebar(): IMSSidebarContextValue {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useIMSSidebar must be used within an IMSSidebarProvider')
  }
  return context
}
