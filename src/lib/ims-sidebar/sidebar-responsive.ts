'use client'

/**
 * IMS Sidebar Responsive Utilities
 *
 * Provides hooks and utilities for responsive sidebar behavior,
 * converting the original @media queries from File 31 to React hooks.
 *
 * Original CSS:
 *   @media (max-width: 768px) {
 *     #sidebar { min-width: 80px; max-width: 80px; margin-left: -80px !important; }
 *     #sidebar.active { margin-left: 0 !important; }
 *     #sidebar .sidebar-header h3, .CTAs { display: none; }
 *     #sidebar .sidebar-header strong { display: block; }
 *     #sidebar ul li a { padding: 20px 10px; }
 *     #sidebar ul li a i { margin-right: 0; display: block; font-size: 1.3em; }
 *     #sidebarCollapse span { display: none; }
 *   }
 */

import * as React from 'react'
import { DEFAULT_SIDEBAR_RESPONSIVE, type SidebarResponsiveConfig } from './types'

// ---------------------------------------------------------------------------
// useSidebarResponsive Hook
// ---------------------------------------------------------------------------

/**
 * Hook that tracks responsive state for the sidebar.
 *
 * Replaces the @media (max-width: 768px) CSS rule with a React-friendly API.
 * Uses useSyncExternalStore for React Compiler compliance (no setState in effects).
 */
export function useSidebarResponsive(
  config: SidebarResponsiveConfig = DEFAULT_SIDEBAR_RESPONSIVE,
) {
  const { mobileBreakpoint, mobileStartCollapsed, hideCollapseTextOnMobile } = config

  // Use useSyncExternalStore for media query matching (React Compiler compliant)
  const isMobile = React.useSyncExternalStore(
    React.useCallback(
      (callback: () => void) => {
        const mql = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
        mql.addEventListener('change', callback)
        return () => mql.removeEventListener('change', callback)
      },
      [mobileBreakpoint],
    ),
    React.useCallback(
      () => window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches,
      [mobileBreakpoint],
    ),
    () => false, // SSR: not mobile
  )

  return {
    /** Whether the viewport is below the mobile breakpoint */
    isMobile,
    /** Mobile breakpoint in px */
    mobileBreakpoint,
    /** Whether sidebar should start collapsed on mobile */
    mobileStartCollapsed,
    /** Whether to hide collapse button text on mobile */
    hideCollapseTextOnMobile,
    /** Responsive sidebar width for mobile */
    mobileSidebarWidth: '250px' as const,
    /** Whether to show expanded sidebar on mobile */
    mobileShowExpanded: !isMobile,
  }
}

// ---------------------------------------------------------------------------
// useSidebarState Hook
// ---------------------------------------------------------------------------

interface SidebarStateOptions {
  /** Default collapsed state on desktop */
  defaultCollapsed?: boolean
  /** Responsive configuration */
  responsive?: SidebarResponsiveConfig
}

/**
 * Hook that manages sidebar collapsed state with responsive awareness.
 *
 * Automatically collapses on mobile and provides toggle functionality.
 */
export function useSidebarState(options: SidebarStateOptions = {}) {
  const { defaultCollapsed = false, responsive = DEFAULT_SIDEBAR_RESPONSIVE } = options
  const { isMobile } = useSidebarResponsive(responsive)

  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // On mobile, the sidebar is a drawer, not collapsible
  const isCollapsed = isMobile ? false : collapsed

  const toggleCollapsed = React.useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => !prev)
    }
  }, [isMobile])

  const openMobile = React.useCallback(() => setMobileOpen(true), [])
  const closeMobile = React.useCallback(() => setMobileOpen(false), [])

  return {
    /** Whether sidebar is collapsed (desktop) or not (mobile always expanded when open) */
    isCollapsed,
    /** Whether mobile drawer is open */
    mobileOpen,
    /** Toggle collapsed/open state */
    toggleCollapsed,
    /** Open mobile drawer */
    openMobile,
    /** Close mobile drawer */
    closeMobile,
    /** Whether viewport is mobile */
    isMobile,
    /** Set collapsed state directly */
    setCollapsed,
  }
}

// ---------------------------------------------------------------------------
// Responsive Class Helpers
// ---------------------------------------------------------------------------

/**
 * Get responsive visibility classes for sidebar sections.
 *
 * Original CSS on mobile:
 *   #sidebar .sidebar-header h3, .CTAs { display: none; } (always hidden on mobile)
 *   #sidebar .sidebar-header strong { display: block; } (always shown on mobile)
 *   #sidebarCollapse span { display: none; } (hide toggle text on mobile)
 */
export function getResponsiveVisibilityClasses(isMobile: boolean) {
  return {
    /** Title shown on desktop, hidden on mobile (h3) */
    title: isMobile ? 'hidden' : 'block',
    /** Short title hidden on desktop, shown on mobile (strong) */
    shortTitle: isMobile ? 'block' : 'hidden',
    /** CTA section hidden on mobile */
    cta: isMobile ? 'hidden' : 'block',
    /** Collapse button text hidden on mobile */
    collapseText: isMobile ? 'hidden' : 'inline',
  }
}

// ---------------------------------------------------------------------------
// Viewport Width Hook
// ---------------------------------------------------------------------------

/**
 * Hook to get current viewport width.
 * Uses useSyncExternalStore for React Compiler compliance.
 */
export function useViewportWidth(): number {
  return React.useSyncExternalStore(
    React.useCallback((callback: () => void) => {
      window.addEventListener('resize', callback)
      return () => window.removeEventListener('resize', callback)
    }, []),
    () => window.innerWidth,
    () => 1024, // SSR default: desktop
  )
}

// ---------------------------------------------------------------------------
// Breakpoint Check Hook
// ---------------------------------------------------------------------------

/**
 * Hook to check if viewport is above a specific breakpoint.
 */
export function useIsAboveBreakpoint(breakpoint: number): boolean {
  return React.useSyncExternalStore(
    React.useCallback(
      (callback: () => void) => {
        const mql = window.matchMedia(`(min-width: ${breakpoint + 1}px)`)
        mql.addEventListener('change', callback)
        return () => mql.removeEventListener('change', callback)
      },
      [breakpoint],
    ),
    React.useCallback(
      () => window.matchMedia(`(min-width: ${breakpoint + 1}px)`).matches,
      [breakpoint],
    ),
    () => true, // SSR: assume desktop
  )
}
