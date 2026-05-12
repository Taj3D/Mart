/**
 * IMS Sidebar Theme Configuration
 *
 * Converts the original sidebar CSS colors and styles (File 31) to
 * Deep Navy Blue themed Tailwind CSS class mappings.
 *
 * Original CSS used:
 * - Sidebar background: #41b53f (green)
 * - Active link: #18bc9c (teal)
 * - Hover: white bg with green text
 * - Header: #41b53f background
 * - Sub-menu: #41b53f background
 *
 * All green (#41b53f) references are converted to Deep Navy Blue palette:
 * - #0a1628 (darkest)
 * - #1a2744 (primary sidebar)
 * - #243b5c (active/highlight)
 */

import {
  NAVY_SIDEBAR_THEME,
  DEFAULT_NAVBAR_CONFIG,
  DEFAULT_SIDEBAR_DIMENSIONS,
  DEFAULT_SIDEBAR_TRANSITIONS,
  DEFAULT_CONTENT_AREA_CONFIG,
  DEFAULT_SIDEBAR_RESPONSIVE,
  DEFAULT_LINE_SEPARATOR,
  type SidebarThemeColors,
  type SidebarDimensions,
  type SidebarTransitions,
  type NavbarConfig,
  type ContentAreaConfig,
  type SidebarResponsiveConfig,
  type LineSeparatorConfig,
} from './types'

// ---------------------------------------------------------------------------
// Tailwind Class Mappings
// ---------------------------------------------------------------------------

/**
 * Tailwind CSS classes for the sidebar panel (replaces #sidebar CSS rules)
 *
 * Original CSS:
 *   #sidebar { min-width: 250px; max-width: 250px; background: #41b53f; color: #fff; transition: all 0.5s; }
 *   #sidebar.active { min-width: 80px; max-width: 80px; text-align: center; }
 */
export function getSidebarClasses(collapsed: boolean, theme: SidebarThemeColors = NAVY_SIDEBAR_THEME): string {
  const base = [
    'flex flex-col shrink-0 overflow-hidden',
    'text-white',
    'transition-all duration-500 ease-in-out',
  ]

  if (collapsed) {
    base.push('w-[80px]')
  } else {
    base.push('w-[250px]')
  }

  return base.join(' ')
}

/**
 * Tailwind CSS classes for sidebar background styling
 */
export function getSidebarBackgroundClasses(theme: SidebarThemeColors = NAVY_SIDEBAR_THEME): string {
  return `bg-[${theme.background}] dark:bg-[${theme.backgroundDark}]`
}

/**
 * Inline styles for sidebar that need CSS custom properties
 * (dimensions, transitions cannot always be expressed purely in Tailwind)
 */
export function getSidebarInlineStyles(
  collapsed: boolean,
  dimensions: SidebarDimensions = DEFAULT_SIDEBAR_DIMENSIONS,
  transitions: SidebarTransitions = DEFAULT_SIDEBAR_TRANSITIONS,
): React.CSSProperties {
  return {
    width: collapsed ? dimensions.collapsed : dimensions.expanded,
    minWidth: collapsed ? dimensions.collapsed : dimensions.expanded,
    maxWidth: collapsed ? dimensions.collapsed : dimensions.expanded,
    transition: transitions.sidebar,
  }
}

// ---------------------------------------------------------------------------
// Sidebar Header Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for sidebar header (replaces #sidebar .sidebar-header CSS)
 *
 * Original CSS:
 *   #sidebar .sidebar-header { padding: 20px; background: #41b53f; }
 *   #sidebar .sidebar-header h3 { display: block; } (hidden when active)
 *   #sidebar .sidebar-header strong { display: none; font-size: 11px; } (shown when active)
 */
export function getSidebarHeaderClasses(collapsed: boolean): string {
  return [
    'p-5 flex items-center gap-3',
    collapsed ? 'justify-center' : '',
  ].join(' ')
}

/**
 * Header title classes (h3 in original, hidden when collapsed)
 */
export function getSidebarHeaderTitleClasses(collapsed: boolean): string {
  if (collapsed) return 'hidden'
  return 'text-lg font-semibold text-white whitespace-nowrap'
}

/**
 * Header short title classes (strong in original, shown when collapsed)
 */
export function getSidebarHeaderShortTitleClasses(collapsed: boolean): string {
  if (!collapsed) return 'hidden'
  return 'text-[11px] font-bold text-white uppercase tracking-wider'
}

// ---------------------------------------------------------------------------
// Menu Item Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for sidebar menu items (replaces #sidebar ul li a CSS)
 *
 * Original CSS:
 *   #sidebar ul li a { padding: 10px; font-size: 1.1em; display: block; text-align: left; }
 *   #sidebar ul li a:hover { color: #41b53f; background: #fff; }
 *   #sidebar.active ul li a { padding: 20px 10px; text-align: center; font-size: 0.85em; }
 *   #sidebar.active ul li a i { margin-right: 0; display: block; font-size: 1.8em; margin-bottom: 5px; }
 */
export function getMenuItemClasses(collapsed: boolean, isActive: boolean = false): string {
  const base = [
    'flex items-center gap-3 w-full text-white transition-all duration-300',
    'hover:bg-white hover:text-[#1a2744] dark:hover:bg-white/90 dark:hover:text-[#0a1628]',
    'rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-white/30',
  ]

  if (isActive) {
    base.push('bg-white/15 text-white font-medium border-l-4 border-emerald-400')
  } else {
    base.push('border-l-4 border-transparent')
  }

  if (collapsed) {
    base.push('px-2 py-4 text-[0.85em] justify-center flex-col gap-1')
  } else {
    base.push('px-3 py-2.5 text-[0.95em] text-left')
  }

  return base.join(' ')
}

/**
 * Menu item icon classes
 */
export function getMenuItemIconClasses(collapsed: boolean): string {
  if (collapsed) {
    return 'shrink-0 text-[1.4em] mb-1' // Original: 1.8em in collapsed, simplified
  }
  return 'shrink-0 h-5 w-5' // Standard icon size when expanded
}

/**
 * Menu item label classes (hidden when collapsed)
 */
export function getMenuItemLabelClasses(collapsed: boolean): string {
  if (collapsed) return 'hidden'
  return 'truncate'
}

// ---------------------------------------------------------------------------
// Sub-menu Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for sub-menu items (replaces ul ul a CSS)
 *
 * Original CSS:
 *   ul ul a { font-size: 0.9em !important; padding-left: 30px !important; background: #41b53f; }
 *   #sidebar.active ul ul a { padding: 10px !important; }
 */
export function getSubMenuClasses(collapsed: boolean): string {
  const base = [
    'text-[0.9em] text-white/80',
    'hover:bg-white hover:text-[#1a2744]',
    'transition-all duration-300',
  ]

  if (collapsed) {
    base.push('px-2 py-2')
  } else {
    base.push('pl-8 pr-3 py-2')
  }

  return base.join(' ')
}

// ---------------------------------------------------------------------------
// CTA (Call To Action) Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for CTA buttons (replaces ul.CTAs CSS)
 *
 * Original CSS:
 *   ul.CTAs { padding: 20px; }
 *   ul.CTAs a { text-align: center; font-size: 0.9em !important; display: block; border-radius: 5px; margin-bottom: 5px; }
 *   a.download { background: #fff; color: #7386D5; }
 *   a.article, a.article:hover { background: #41b53f !important; color: #fff !important; }
 */
export function getCTAContainerClasses(): string {
  return 'p-5 space-y-2'
}

export function getCTAButtonClasses(variant: 'download' | 'article'): string {
  const base = [
    'block w-full text-center text-[0.9em] py-2 px-4 rounded-md',
    'transition-all duration-300',
    'font-medium',
  ]

  if (variant === 'download') {
    base.push('bg-white text-[#1a2744] hover:bg-white/90')
  } else {
    base.push('bg-[#243b5c] text-white hover:bg-[#2d4a6e]')
  }

  return base.join(' ')
}

// ---------------------------------------------------------------------------
// Navbar Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for the top navbar (replaces .navbar CSS)
 *
 * Original CSS:
 *   .navbar { padding: 15px 10px; background: #fff; border: none; border-radius: 0; margin-bottom: 6px; box-shadow: 1px 1px 3px rgba(0,0,0,0.65); }
 *   .navbar-btn { box-shadow: none; outline: none !important; border: none; }
 */
export function getNavbarClasses(config: NavbarConfig = DEFAULT_NAVBAR_CONFIG): string {
  return [
    'flex items-center border-0 rounded-none',
    'shadow-md',
    'transition-colors',
  ].join(' ')
}

/**
 * Navbar button classes (replaces .navbar-btn)
 */
export function getNavbarButtonClasses(): string {
  return 'shadow-none outline-none border-0 focus:outline-none focus:ring-0'
}

// ---------------------------------------------------------------------------
// Content Area Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for the content area (replaces #content CSS)
 *
 * Original CSS:
 *   #content { width: 100%; padding: 5px; min-height: 88vh; transition: all 0.3s; }
 */
export function getContentAreaClasses(config: ContentAreaConfig = DEFAULT_CONTENT_AREA_CONFIG): string {
  return [
    'w-full p-1 min-h-[88vh] flex-1',
    'transition-all duration-300',
  ].join(' ')
}

// ---------------------------------------------------------------------------
// Layout Wrapper Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for the layout wrapper (replaces .wrapper CSS)
 *
 * Original CSS:
 *   .wrapper { display: flex; align-items: stretch; }
 */
export function getWrapperClasses(): string {
  return 'flex min-h-screen'
}

// ---------------------------------------------------------------------------
// Line Separator Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for line separator (replaces .line CSS)
 *
 * Original CSS:
 *   .line { width: 100%; height: 1px; border-bottom: 1px dashed #ddd; margin: 40px 0; }
 */
export function getLineSeparatorClasses(config: LineSeparatorConfig = DEFAULT_LINE_SEPARATOR): string {
  return 'w-full border-b border-dashed border-gray-300 dark:border-gray-600 my-10'
}

// ---------------------------------------------------------------------------
// Responsive Classes
// ---------------------------------------------------------------------------

/**
 * Mobile responsive sidebar classes
 *
 * Original CSS (@media max-width: 768px):
 *   #sidebar { min-width: 80px; max-width: 80px; text-align: center; margin-left: -80px !important; }
 *   #sidebar.active { margin-left: 0 !important; }
 *   #sidebar .sidebar-header h3, .CTAs { display: none; }
 *   #sidebar .sidebar-header strong { display: block; }
 *   #sidebar ul li a { padding: 20px 10px; }
 *   #sidebar ul li a span { font-size: 0.85em; }
 *   #sidebar ul li a i { margin-right: 0; display: block; font-size: 1.3em; }
 *   #sidebarCollapse span { display: none; }
 */
export function getMobileSidebarClasses(isVisible: boolean): string {
  const base = [
    'fixed inset-y-0 left-0 z-40',
    'transition-all duration-300',
    'lg:relative lg:z-0',
  ]

  if (isVisible) {
    base.push('translate-x-0')
  } else {
    base.push('-translate-x-full lg:translate-x-0')
  }

  return base.join(' ')
}

/**
 * Mobile overlay (backdrop) classes
 */
export function getMobileOverlayClasses(isVisible: boolean): string {
  if (isVisible) {
    return 'fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300'
  }
  return 'hidden'
}

// ---------------------------------------------------------------------------
// Active Link Color
// ---------------------------------------------------------------------------

/**
 * Active link color class (replaces a:active { color: #18bc9c })
 */
export function getActiveLinkClasses(): string {
  return 'active:text-[#18bc9c]'
}

// ---------------------------------------------------------------------------
// btnUser Classes
// ---------------------------------------------------------------------------

/**
 * User button styling (replaces #btnUser { margin-bottom: 5px })
 */
export function getUserButtonClasses(): string {
  return 'mb-[5px]'
}

// ---------------------------------------------------------------------------
// Component Separator (replaces #sidebar ul.components border-bottom)
// ---------------------------------------------------------------------------

/**
 * Sidebar component separator classes (replaces ul.components { border-bottom: 1px solid #fff })
 */
export function getComponentSeparatorClasses(): string {
  return 'border-b border-white/20'
}

// ---------------------------------------------------------------------------
// Dropdown Toggle (replaces .dropdown-toggle::after positioning)
// ---------------------------------------------------------------------------

/**
 * Dropdown toggle chevron positioning classes
 *
 * Original CSS:
 *   .dropdown-toggle::after { display: block; position: absolute; top: 50%; right: 20px; transform: translateY(-50%); }
 *   #sidebar.active .dropdown-toggle::after { top: auto; bottom: 10px; right: 50%; transform: translateX(50%); }
 */
export function getDropdownToggleClasses(collapsed: boolean): string {
  if (collapsed) {
    return 'absolute bottom-2 left-1/2 -translate-x-1/2'
  }
  return 'absolute top-1/2 right-5 -translate-y-1/2'
}

// ---------------------------------------------------------------------------
// Full Theme Export
// ---------------------------------------------------------------------------

/**
 * Get complete sidebar class configuration as an object
 * Useful for components that need all classes at once
 */
export function getFullSidebarClassConfig(collapsed: boolean) {
  return {
    wrapper: getWrapperClasses(),
    sidebar: getSidebarClasses(collapsed),
    sidebarHeader: getSidebarHeaderClasses(collapsed),
    sidebarHeaderTitle: getSidebarHeaderTitleClasses(collapsed),
    sidebarHeaderShortTitle: getSidebarHeaderShortTitleClasses(collapsed),
    menuItem: (isActive?: boolean) => getMenuItemClasses(collapsed, isActive),
    menuItemIcon: getMenuItemIconClasses(collapsed),
    menuItemLabel: getMenuItemLabelClasses(collapsed),
    subMenu: getSubMenuClasses(collapsed),
    ctaContainer: getCTAContainerClasses(),
    ctaButton: getCTAButtonClasses,
    navbar: getNavbarClasses(),
    navbarButton: getNavbarButtonClasses(),
    contentArea: getContentAreaClasses(),
    lineSeparator: getLineSeparatorClasses(),
    mobileSidebar: getMobileSidebarClasses,
    mobileOverlay: getMobileOverlayClasses,
    dropdownToggle: getDropdownToggleClasses(collapsed),
    componentSeparator: getComponentSeparatorClasses(),
    userButton: getUserButtonClasses(),
    activeLink: getActiveLinkClasses(),
  }
}
