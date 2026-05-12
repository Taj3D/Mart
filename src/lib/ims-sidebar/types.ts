/**
 * IMS Sidebar Types
 *
 * TypeScript interfaces for the IMS sidebar layout system.
 * Converted from the original sidebar CSS (File 31) which defined:
 * - .wrapper (flex container)
 * - #sidebar (collapsible sidebar, 250px → 80px)
 * - #content (main content area, min-height 88vh)
 * - .navbar (top navigation bar)
 * - Responsive breakpoints (@media max-width: 768px)
 *
 * Original CSS used green (#41b53f) as accent — converted to Deep Navy Blue theme.
 */

import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Sidebar Dimensions
// ---------------------------------------------------------------------------

/** Sidebar width configuration matching original CSS min-width/max-width */
export interface SidebarDimensions {
  /** Expanded sidebar width (original: 250px) */
  expanded: string
  /** Collapsed sidebar width (original: 80px) */
  collapsed: string
  /** Mobile sidebar width when visible (original: 80px, then 250px in some contexts) */
  mobile: string
  /** Mobile sidebar off-screen offset (original: -80px margin-left) */
  mobileOffset: string
}

/** Default sidebar dimensions from original CSS */
export const DEFAULT_SIDEBAR_DIMENSIONS: SidebarDimensions = {
  expanded: '250px',
  collapsed: '80px',
  mobile: '250px',
  mobileOffset: '-250px',
}

// ---------------------------------------------------------------------------
// Sidebar Transitions
// ---------------------------------------------------------------------------

/** Transition timing configuration matching original CSS */
export interface SidebarTransitions {
  /** Sidebar expand/collapse transition (original: all 0.5s) */
  sidebar: string
  /** Content area transition (original: all 0.3s) */
  content: string
  /** Link hover transition (original: all 0.3s) */
  linkHover: string
  /** Mobile slide-in duration */
  mobileSlide: string
}

/** Default transition timings from original CSS */
export const DEFAULT_SIDEBAR_TRANSITIONS: SidebarTransitions = {
  sidebar: 'all 0.5s ease',
  content: 'all 0.3s ease',
  linkHover: 'all 0.3s ease',
  mobileSlide: 'all 0.3s ease',
}

// ---------------------------------------------------------------------------
// Sidebar Theme Colors
// ---------------------------------------------------------------------------

/** Sidebar color theme replacing original green (#41b53f) with Deep Navy Blue */
export interface SidebarThemeColors {
  /** Sidebar background (original: #41b53f → Deep Navy Blue) */
  background: string
  /** Sidebar background dark mode */
  backgroundDark: string
  /** Sidebar text color (original: #fff) */
  text: string
  /** Sidebar header background (original: #41b53f → slightly different shade) */
  headerBackground: string
  /** Header background dark mode */
  headerBackgroundDark: string
  /** Menu item hover: text color (original: #41b53f) */
  hoverText: string
  /** Menu item hover: background (original: #fff) */
  hoverBackground: string
  /** Active menu item text (original: #fff) */
  activeText: string
  /** Active menu item background (original: #41b53f) */
  activeBackground: string
  /** Sub-menu background (original: #41b53f) */
  subMenuBackground: string
  /** Sub-menu background dark */
  subMenuBackgroundDark: string
  /** Separator/border color (original: #fff) */
  separator: string
  /** CTA article button background (original: #41b53f !important) */
  ctaBackground: string
  /** CTA download button background (original: #fff) */
  ctaDownloadBackground: string
  /** CTA download button text (original: #7386D5) */
  ctaDownloadText: string
  /** Active link color (original: #18bc9c) */
  activeLinkColor: string
}

/**
 * Deep Navy Blue sidebar theme
 * Replaces the original green (#41b53f) sidebar with the IMS Deep Navy Blue palette
 */
export const NAVY_SIDEBAR_THEME: SidebarThemeColors = {
  background: '#1a2744',
  backgroundDark: '#0a1628',
  text: '#ffffff',
  headerBackground: '#243b5c',
  headerBackgroundDark: '#1a2744',
  hoverText: '#1a2744',
  hoverBackground: '#ffffff',
  activeText: '#ffffff',
  activeBackground: '#243b5c',
  subMenuBackground: '#1e3050',
  subMenuBackgroundDark: '#0e1d33',
  separator: 'rgba(255, 255, 255, 0.2)',
  ctaBackground: '#243b5c',
  ctaDownloadBackground: '#ffffff',
  ctaDownloadText: '#1a2744',
  activeLinkColor: '#18bc9c',
}

// ---------------------------------------------------------------------------
// Navbar Configuration
// ---------------------------------------------------------------------------

/** Navbar styling configuration matching original CSS .navbar rules */
export interface NavbarConfig {
  /** Padding (original: 15px 10px) */
  padding: string
  /** Background color (original: #fff → Deep Navy themed) */
  background: string
  /** Background dark mode */
  backgroundDark: string
  /** Border radius (original: 0) */
  borderRadius: string
  /** Bottom margin (original: 6px) */
  marginBottom: string
  /** Box shadow (original: 1px 1px 3px rgba(0,0,0,0.65)) */
  boxShadow: string
  /** Text color for navbar items */
  text: string
  /** Text color dark mode */
  textDark: string
}

/** Default navbar configuration with Deep Navy Blue theme */
export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  padding: '15px 10px',
  background: '#ffffff',
  backgroundDark: '#1a2744',
  borderRadius: '0',
  marginBottom: '6px',
  boxShadow: '1px 1px 3px rgba(0, 0, 0, 0.25)',
  text: '#1a2744',
  textDark: '#e2e8f0',
}

// ---------------------------------------------------------------------------
// Content Area Configuration
// ---------------------------------------------------------------------------

/** Content area configuration matching original CSS #content rules */
export interface ContentAreaConfig {
  /** Padding (original: 5px) */
  padding: string
  /** Min height (original: 88vh) */
  minHeight: string
  /** Transition (original: all 0.3s) */
  transition: string
}

/** Default content area configuration */
export const DEFAULT_CONTENT_AREA_CONFIG: ContentAreaConfig = {
  padding: '5px',
  minHeight: '88vh',
  transition: 'all 0.3s ease',
}

// ---------------------------------------------------------------------------
// Sidebar Menu Item
// ---------------------------------------------------------------------------

/** Sidebar menu item definition (replaces Bootstrap sidebar <li><a> pattern) */
export interface SidebarMenuItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Icon component (replaces Font Awesome <i> tags) */
  icon?: LucideIcon
  /** Navigation href */
  href?: string
  /** Whether this item is currently active */
  isActive?: boolean
  /** Sub-items for collapsible sub-menu (replaces dropdown-toggle) */
  children?: SidebarMenuItem[]
  /** Badge count to display */
  badge?: number | string
  /** Short label shown when sidebar is collapsed (original: <strong> in header) */
  shortLabel?: string
  /** Custom click handler */
  onClick?: () => void
}

// ---------------------------------------------------------------------------
// Sidebar Header
// ---------------------------------------------------------------------------

/** Sidebar header configuration (replaces #sidebar .sidebar-header) */
export interface SidebarHeaderConfig {
  /** Padding (original: 20px) */
  padding: string
  /** Main title shown when expanded (original: h3) */
  title: string
  /** Abbreviation shown when collapsed (original: strong, font-size: 11px) */
  shortTitle: string
  /** Icon for the header */
  icon?: LucideIcon
}

/** Default sidebar header config */
export const DEFAULT_SIDEBAR_HEADER: SidebarHeaderConfig = {
  padding: '20px',
  title: 'IMS ERP',
  shortTitle: 'IMS',
}

// ---------------------------------------------------------------------------
// Responsive Breakpoints
// ---------------------------------------------------------------------------

/** Responsive breakpoint configuration matching original @media rules */
export interface SidebarResponsiveConfig {
  /** Mobile breakpoint in px (original: 768px) */
  mobileBreakpoint: number
  /** Whether sidebar starts collapsed on mobile (original: true, margin-left: -80px) */
  mobileStartCollapsed: boolean
  /** Whether to hide collapse button text on mobile (original: #sidebarCollapse span { display: none }) */
  hideCollapseTextOnMobile: boolean
}

/** Default responsive configuration */
export const DEFAULT_SIDEBAR_RESPONSIVE: SidebarResponsiveConfig = {
  mobileBreakpoint: 768,
  mobileStartCollapsed: true,
  hideCollapseTextOnMobile: true,
}

// ---------------------------------------------------------------------------
// Line Separator
// ---------------------------------------------------------------------------

/** Line separator config (replaces original .line CSS) */
export interface LineSeparatorConfig {
  /** Height (original: 1px) */
  height: string
  /** Border style (original: dashed) */
  borderStyle: string
  /** Border color (original: #ddd) */
  color: string
  /** Margin (original: 40px 0) */
  margin: string
}

/** Default line separator configuration */
export const DEFAULT_LINE_SEPARATOR: LineSeparatorConfig = {
  height: '1px',
  borderStyle: 'dashed',
  color: '#ddd',
  margin: '40px 0',
}

// ---------------------------------------------------------------------------
// CTA (Call To Action) Buttons
// ---------------------------------------------------------------------------

/** CTA button configuration (replaces original ul.CTAs styles) */
export interface CTAButtonConfig {
  /** Button label */
  label: string
  /** Button variant: 'download' (white bg) or 'article' (accent bg) */
  variant: 'download' | 'article'
  /** Navigation href */
  href?: string
  /** Click handler */
  onClick?: () => void
}

// ---------------------------------------------------------------------------
// Complete Sidebar Configuration
// ---------------------------------------------------------------------------

/** Complete IMS sidebar configuration combining all sub-configs */
export interface IMSSidebarConfig {
  /** Sidebar dimensions */
  dimensions: SidebarDimensions
  /** Transition timings */
  transitions: SidebarTransitions
  /** Color theme */
  theme: SidebarThemeColors
  /** Navbar configuration */
  navbar: NavbarConfig
  /** Content area configuration */
  contentArea: ContentAreaConfig
  /** Header configuration */
  header: SidebarHeaderConfig
  /** Responsive configuration */
  responsive: SidebarResponsiveConfig
  /** Menu items */
  menuItems: SidebarMenuItem[]
  /** CTA buttons at bottom */
  ctaButtons: CTAButtonConfig[]
}

// ---------------------------------------------------------------------------
// Layout Component Props
// ---------------------------------------------------------------------------

/** Props for the IMS sidebar layout wrapper (replaces .wrapper) */
export interface IMSSidebarLayoutProps {
  /** Sidebar configuration (uses defaults if not provided) */
  config?: Partial<IMSSidebarConfig>
  /** Content to render in the main area */
  children: React.ReactNode
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean
  /** Optional className */
  className?: string
}

/** Props for the sidebar panel component (replaces #sidebar) */
export interface IMSSidebarPanelProps {
  /** Whether sidebar is collapsed */
  collapsed: boolean
  /** Toggle collapse handler */
  onToggleCollapse: () => void
  /** Menu items */
  menuItems: SidebarMenuItem[]
  /** Header configuration */
  header?: SidebarHeaderConfig
  /** CTA buttons */
  ctaButtons?: CTAButtonConfig[]
  /** Optional className */
  className?: string
}

/** Props for the content area component (replaces #content) */
export interface IMSContentAreaProps {
  /** Content */
  children: React.ReactNode
  /** Optional className */
  className?: string
}

/** Props for the navbar component (replaces .navbar) */
export interface IMSNavbarProps {
  /** Navbar content */
  children: React.ReactNode
  /** Optional className */
  className?: string
}
