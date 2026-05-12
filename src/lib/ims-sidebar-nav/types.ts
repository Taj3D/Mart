/**
 * IMS Sidebar Navigation Types
 *
 * TypeScript interfaces for the sidebar navigation state persistence system.
 * Converted from File 32 jQuery script that managed:
 *
 * 1. Sidebar collapse toggle (#sidebarCollapse → toggleClass('active'))
 * 2. Sub-menu expand/collapse with angle icon rotation
 * 3. Open sub-menu persistence via localStorage("sidebar", id)
 * 4. Active/visited nav item persistence via localStorage("colorsidebar", id)
 * 5. Auto-restore state on page load from localStorage
 * 6. Default collapsed if no stored state
 *
 * Original jQuery:
 *   localStorage.setItem("sidebar", id)      → openNav(id)
 *   localStorage.setItem("colorsidebar", id)  → ColorNav(id)
 *   localStorage.getItem("sidebar")           → restore open sub-menu
 *   localStorage.getItem("colorsidebar")       → restore highlighted item
 *   $(id).find('i.fa-angle-right').toggleClass('fa-rotate-90')
 *   $('#sidebar').addClass('active')           → default collapsed
 *   $('#' + colorMenueId).css('color', '#cddc39') → highlight color
 */

// ---------------------------------------------------------------------------
// localStorage Keys
// ---------------------------------------------------------------------------

/** localStorage key for the open sidebar dropdown ID (original: "sidebar") */
export const LS_KEY_SIDEBAR_STATE = 'ims-sidebar-nav-open'

/** localStorage key for the highlighted/active nav item ID (original: "colorsidebar") */
export const LS_KEY_ACTIVE_NAV = 'ims-sidebar-nav-color'

/** localStorage key for sidebar collapsed state */
export const LS_KEY_SIDEBAR_COLLAPSED = 'ims-sidebar-collapsed'

// ---------------------------------------------------------------------------
// Navigation Item State
// ---------------------------------------------------------------------------

/**
 * Represents the open/closed state of a sidebar dropdown menu item.
 *
 * Replaces the jQuery logic that found parent/child UL elements
 * and set class="list-unstyled in" to show them.
 */
export interface NavItemState {
  /** Unique identifier for the nav item (original: element id attribute) */
  id: string
  /** Whether this item's sub-menu is expanded */
  isExpanded: boolean
  /** Whether this item is the active/visited item (highlighted) */
  isActive: boolean
  /** Parent nav item ID (for nested sub-menus) */
  parentId?: string
  /** Child sub-menu item IDs */
  childIds?: string[]
}

// ---------------------------------------------------------------------------
// Sidebar Navigation State
// ---------------------------------------------------------------------------

/**
 * Complete sidebar navigation state, persisted to localStorage.
 *
 * Replaces the original two-key localStorage approach:
 *   - localStorage.getItem("sidebar")      → openSubmenuId
 *   - localStorage.getItem("colorsidebar") → activeNavItemId
 *
 * Now stored as a single JSON object for cleaner state management.
 */
export interface SidebarNavState {
  /** Which sub-menu is currently open (original: localStorage "sidebar" value) */
  openSubmenuId: string | null
  /** Which nav item is highlighted/active (original: localStorage "colorsidebar" value) */
  activeNavItemId: string | null
  /** Whether the sidebar is collapsed (original: #sidebar has class "active") */
  isCollapsed: boolean
  /** Nested open sub-menu IDs (for multi-level menus, original: childId logic) */
  nestedOpenIds: string[]
}

/** Default sidebar nav state (matches original: sidebar collapsed by default if no stored state) */
export const DEFAULT_SIDEBAR_NAV_STATE: SidebarNavState = {
  openSubmenuId: null,
  activeNavItemId: null,
  isCollapsed: true, // Original: if no localStorage → $('#sidebar').addClass('active')
  nestedOpenIds: [],
}

// ---------------------------------------------------------------------------
// Highlight Color Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for the active nav item highlight color.
 *
 * Original CSS: `$('#' + colorMenueId).css('color', '#cddc39')`
 * The #cddc39 (lime/yellow-green) was used for high visibility on the green sidebar.
 * With Deep Navy Blue theme, we use a complementary highlight color.
 */
export interface NavHighlightConfig {
  /** Active item text color (original: #cddc39 → adjusted for Navy theme) */
  color: string
  /** Active item background color (optional, original: none) */
  backgroundColor?: string
  /** Active item CSS class name (alternative to inline color) */
  className?: string
}

/** Default highlight config matching original #cddc39 behavior */
export const DEFAULT_NAV_HIGHLIGHT: NavHighlightConfig = {
  color: '#cddc39', // Preserved original lime-green for contrast against navy
  className: 'text-[#cddc39] font-medium',
}

/** Navy-themed highlight alternative */
export const NAVY_NAV_HIGHLIGHT: NavHighlightConfig = {
  color: '#cddc39',
  backgroundColor: 'rgba(205, 220, 57, 0.1)',
  className: 'text-[#cddc39] bg-[rgba(205,220,57,0.1)] font-medium',
}

// ---------------------------------------------------------------------------
// Angle Icon Rotation
// ---------------------------------------------------------------------------

/**
 * Configuration for the angle icon rotation on sub-menu toggle.
 *
 * Original: `$(this).find('i[class*="fa fa-angle-right"]').toggleClass('fa-rotate-90')`
 * In React, this is handled via CSS transform on a ChevronRight/ChevronDown icon.
 */
export interface AngleRotationConfig {
  /** Rotation angle when expanded (original: 90 degrees) */
  expandedRotation: number
  /** Rotation angle when collapsed (original: 0 degrees) */
  collapsedRotation: number
  /** Transition duration (original: implicit from CSS) */
  transitionDuration: string
  /** CSS transform class when expanded */
  expandedClass: string
  /** CSS transform class when collapsed */
  collapsedClass: string
}

/** Default angle rotation config matching original fa-rotate-90 behavior */
export const DEFAULT_ANGLE_ROTATION: AngleRotationConfig = {
  expandedRotation: 90,
  collapsedRotation: 0,
  transitionDuration: '200ms',
  expandedClass: 'rotate-90',
  collapsedClass: 'rotate-0',
}

// ---------------------------------------------------------------------------
// SidebarCollapse Toggle
// ---------------------------------------------------------------------------

/**
 * Configuration for the sidebar collapse toggle button.
 *
 * Original: `$('#sidebarCollapse').on('click', function () { $('#sidebar').toggleClass('active'); })`
 */
export interface SidebarCollapseConfig {
  /** Whether sidebar starts collapsed by default (original: yes, adds 'active' class) */
  defaultCollapsed: boolean
  /** Whether to persist collapsed state to localStorage */
  persistState: boolean
  /** Animation duration for collapse (original: CSS transition all 0.5s) */
  animationDuration: number
}

/** Default collapse configuration */
export const DEFAULT_COLLAPSE_CONFIG: SidebarCollapseConfig = {
  defaultCollapsed: true,
  persistState: true,
  animationDuration: 500,
}

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

/**
 * Props for the SidebarNavProvider component.
 */
export interface SidebarNavProviderProps {
  /** Child components */
  children: React.ReactNode
  /** Highlight color configuration */
  highlight?: NavHighlightConfig
  /** Angle rotation configuration */
  angleRotation?: AngleRotationConfig
  /** Collapse configuration */
  collapse?: SidebarCollapseConfig
  /** Custom localStorage key prefix (for multi-instance support) */
  storagePrefix?: string
}

// ---------------------------------------------------------------------------
// Hook Return Types
// ---------------------------------------------------------------------------

/** Return type for useSidebarNav hook */
export interface UseSidebarNavReturn {
  /** Current navigation state */
  state: SidebarNavState
  /** Toggle a sub-menu open/closed (replaces openNav + angle rotation) */
  toggleSubmenu: (id: string) => void
  /** Set the active/highlighted nav item (replaces ColorNav) */
  setActiveNavItem: (id: string) => void
  /** Toggle sidebar collapsed state (replaces #sidebarCollapse click) */
  toggleCollapsed: () => void
  /** Check if a sub-menu is expanded */
  isSubmenuOpen: (id: string) => boolean
  /** Check if a nav item is the active/highlighted one */
  isActiveItem: (id: string) => boolean
  /** Get the rotation class for an angle icon */
  getAngleClass: (id: string) => string
  /** Get the highlight class/color for a nav item */
  getHighlightStyle: (id: string) => React.CSSProperties
  /** Reset all navigation state */
  resetState: () => void
  /** Expand a specific sub-menu and its children (replaces localStorage restore) */
  expandSubmenu: (id: string, childIds?: string[]) => void
}
