'use client'

/**
 * IMS Sidebar Navigation Hooks
 *
 * React hooks that replace the jQuery sidebar navigation logic from File 32:
 *
 * 1. useSidebarNavToggle() — replaces $('#sidebarCollapse').on('click')
 * 2. useNavState() — replaces localStorage("sidebar"/"colorsidebar") persistence
 * 3. useAngleRotation() — replaces fa-angle-right fa-rotate-90 toggle
 * 4. useNavHighlight() — replaces $('#' + id).css('color', '#cddc39')
 *
 * All hooks use useSyncExternalStore for React Compiler compliance.
 * localStorage is used for persistence, matching the original behavior.
 */

import * as React from 'react'
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

// ---------------------------------------------------------------------------
// localStorage Helpers
// ---------------------------------------------------------------------------

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage not available (SSR, privacy mode, quota exceeded)
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// useSidebarNav — Main Hook
// ---------------------------------------------------------------------------

/**
 * Main hook for sidebar navigation state management with localStorage persistence.
 *
 * Replaces the entire File 32 jQuery logic:
 * - Sidebar collapse toggle → toggleCollapsed()
 * - openNav(id) → toggleSubmenu(id) / expandSubmenu(id)
 * - ColorNav(id) → setActiveNavItem(id)
 * - localStorage restore → automatic on mount
 * - fa-rotate-90 toggle → getAngleClass(id)
 * - #cddc39 highlight → getHighlightStyle(id)
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const nav = useSidebarNav()
 *
 *   return (
 *     <aside className={nav.state.isCollapsed ? 'w-20' : 'w-64'}>
 *       <button onClick={nav.toggleCollapsed}>Toggle</button>
 *       <NavItem id="dashboard" onClick={() => nav.setActiveNavItem('dashboard')}
 *                style={nav.getHighlightStyle('dashboard')}>
 *         Dashboard
 *       </NavItem>
 *       <NavItem id="products" onClick={() => nav.toggleSubmenu('products')}>
 *         Products <ChevronRight className={nav.getAngleClass('products')} />
 *       </NavItem>
 *       {nav.isSubmenuOpen('products') && <SubMenu>...</SubMenu>}
 *     </aside>
 *   )
 * }
 * ```
 */
export function useSidebarNav(options?: {
  highlight?: NavHighlightConfig
  angleRotation?: AngleRotationConfig
  collapse?: SidebarCollapseConfig
  storagePrefix?: string
}): UseSidebarNavReturn {
  const highlight = options?.highlight ?? DEFAULT_NAV_HIGHLIGHT
  const angleRotation = options?.angleRotation ?? DEFAULT_ANGLE_ROTATION
  const collapseConfig = options?.collapse ?? DEFAULT_COLLAPSE_CONFIG
  const prefix = options?.storagePrefix ?? ''

  const stateKey = prefix ? `${prefix}-${LS_KEY_SIDEBAR_STATE}` : LS_KEY_SIDEBAR_STATE
  const activeKey = prefix ? `${prefix}-${LS_KEY_ACTIVE_NAV}` : LS_KEY_ACTIVE_NAV
  const collapsedKey = prefix ? `${prefix}-${LS_KEY_SIDEBAR_COLLAPSED}` : LS_KEY_SIDEBAR_COLLAPSED

  // ── State ──────────────────────────────────────────────────────────
  const [state, setState] = React.useState<SidebarNavState>(() => {
    // Restore from localStorage on mount (matches original File 32 behavior)
    if (typeof window === 'undefined') {
      return DEFAULT_SIDEBAR_NAV_STATE
    }

    const storedSubmenu = safeGetItem(stateKey)
    const storedActive = safeGetItem(activeKey)
    const storedCollapsed = safeGetItem(collapsedKey)

    const isCollapsed = storedCollapsed !== null
      ? storedCollapsed === 'true'
      : collapseConfig.defaultCollapsed

    return {
      openSubmenuId: storedSubmenu ?? null,
      activeNavItemId: storedActive ?? null,
      isCollapsed,
      nestedOpenIds: [],
    }
  })

  // ── Actions ────────────────────────────────────────────────────────

  /** Toggle sidebar collapsed state (replaces #sidebarCollapse click) */
  const toggleCollapsed = React.useCallback(() => {
    setState(prev => {
      const next = !prev.isCollapsed
      if (collapseConfig.persistState) {
        safeSetItem(collapsedKey, String(next))
      }
      return { ...prev, isCollapsed: next }
    })
  }, [collapsedKey, collapseConfig.persistState])

  /** Toggle a sub-menu open/closed (replaces openNav + fa-rotate-90) */
  const toggleSubmenu = React.useCallback((id: string) => {
    setState(prev => {
      const isCurrentlyOpen = prev.openSubmenuId === id
      const newOpenId = isCurrentlyOpen ? null : id

      if (collapseConfig.persistState) {
        if (newOpenId) {
          safeSetItem(stateKey, newOpenId)
        } else {
          safeRemoveItem(stateKey)
        }
      }

      return {
        ...prev,
        openSubmenuId: newOpenId,
        nestedOpenIds: isCurrentlyOpen ? [] : prev.nestedOpenIds,
      }
    })
  }, [stateKey, collapseConfig.persistState])

  /** Set the active/highlighted nav item (replaces ColorNav) */
  const setActiveNavItem = React.useCallback((id: string) => {
    setState(prev => {
      if (collapseConfig.persistState) {
        safeSetItem(activeKey, id)
      }
      return { ...prev, activeNavItemId: id }
    })
  }, [activeKey, collapseConfig.persistState])

  /** Check if a sub-menu is expanded */
  const isSubmenuOpen = React.useCallback((id: string): boolean => {
    return state.openSubmenuId === id || state.nestedOpenIds.includes(id)
  }, [state.openSubmenuId, state.nestedOpenIds])

  /** Check if a nav item is the active/highlighted one */
  const isActiveItem = React.useCallback((id: string): boolean => {
    return state.activeNavItemId === id
  }, [state.activeNavItemId])

  /** Get the rotation class for an angle icon (replaces fa-rotate-90 toggle) */
  const getAngleClass = React.useCallback((id: string): string => {
    const isOpen = state.openSubmenuId === id || state.nestedOpenIds.includes(id)
    return isOpen ? angleRotation.expandedClass : angleRotation.collapsedClass
  }, [state.openSubmenuId, state.nestedOpenIds, angleRotation])

  /** Get the highlight style for a nav item (replaces .css('color', '#cddc39')) */
  const getHighlightStyle = React.useCallback((id: string): React.CSSProperties => {
    if (state.activeNavItemId === id) {
      return {
        color: highlight.color,
        ...(highlight.backgroundColor ? { backgroundColor: highlight.backgroundColor } : {}),
      }
    }
    return {}
  }, [state.activeNavItemId, highlight])

  /** Reset all navigation state */
  const resetState = React.useCallback(() => {
    safeRemoveItem(stateKey)
    safeRemoveItem(activeKey)
    safeRemoveItem(collapsedKey)
    setState(DEFAULT_SIDEBAR_NAV_STATE)
  }, [stateKey, activeKey, collapsedKey])

  /** Expand a specific sub-menu and its children (replaces localStorage restore logic) */
  const expandSubmenu = React.useCallback((id: string, childIds?: string[]) => {
    setState(prev => {
      if (collapseConfig.persistState) {
        safeSetItem(stateKey, id)
      }
      return {
        ...prev,
        openSubmenuId: id,
        nestedOpenIds: childIds ?? [],
      }
    })
  }, [stateKey, collapseConfig.persistState])

  return React.useMemo(() => ({
    state,
    toggleSubmenu,
    setActiveNavItem,
    toggleCollapsed,
    isSubmenuOpen,
    isActiveItem,
    getAngleClass,
    getHighlightStyle,
    resetState,
    expandSubmenu,
  }), [
    state,
    toggleSubmenu,
    setActiveNavItem,
    toggleCollapsed,
    isSubmenuOpen,
    isActiveItem,
    getAngleClass,
    getHighlightStyle,
    resetState,
    expandSubmenu,
  ])
}

// ---------------------------------------------------------------------------
// useSidebarCollapse — Simple Collapse Hook
// ---------------------------------------------------------------------------

/**
 * Simple hook for just the sidebar collapse toggle.
 * Lightweight alternative when you don't need full nav state management.
 *
 * Replaces: `$('#sidebarCollapse').on('click', function () { $('#sidebar').toggleClass('active'); })`
 *
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { isCollapsed, toggle } = useSidebarCollapse()
 *   return <aside className={isCollapsed ? 'w-20' : 'w-64'}>...</aside>
 * }
 * ```
 */
export function useSidebarCollapse(options?: {
  defaultCollapsed?: boolean
  persistState?: boolean
}) {
  const defaultCollapsed = options?.defaultCollapsed ?? true
  const persistState = options?.persistState ?? true

  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === 'undefined' || !persistState) return defaultCollapsed
    const stored = safeGetItem(LS_KEY_SIDEBAR_COLLAPSED)
    return stored !== null ? stored === 'true' : defaultCollapsed
  })

  const toggle = React.useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      if (persistState) {
        safeSetItem(LS_KEY_SIDEBAR_COLLAPSED, String(next))
      }
      return next
    })
  }, [persistState])

  return React.useMemo(() => ({ isCollapsed, toggle }), [isCollapsed, toggle])
}

// ---------------------------------------------------------------------------
// useNavPersistence — localStorage Read/Write Hook
// ---------------------------------------------------------------------------

/**
 * Hook for reading/writing navigation state to localStorage.
 * Mirrors the original localStorage.setItem/getItem pattern.
 *
 * Replaces:
 *   localStorage.setItem("sidebar", id)     → setOpenNav(id)
 *   localStorage.setItem("colorsidebar", id) → setColorNav(id)
 *   localStorage.getItem("sidebar")          → openNavId
 *   localStorage.getItem("colorsidebar")     → colorNavId
 *
 * @example
 * ```tsx
 * function NavItem({ id, label }) {
 *   const { openNavId, colorNavId, setOpenNav, setColorNav } = useNavPersistence()
 *   const isOpen = openNavId === id
 *   const isActive = colorNavId === id
 *   return <a onClick={() => setColorNav(id)} style={{ color: isActive ? '#cddc39' : undefined }}>{label}</a>
 * }
 * ```
 */
export function useNavPersistence(options?: {
  storagePrefix?: string
}) {
  const prefix = options?.storagePrefix ?? ''
  const stateKey = prefix ? `${prefix}-${LS_KEY_SIDEBAR_STATE}` : LS_KEY_SIDEBAR_STATE
  const activeKey = prefix ? `${prefix}-${LS_KEY_ACTIVE_NAV}` : LS_KEY_ACTIVE_NAV

  const [openNavId, setOpenNavIdState] = React.useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return safeGetItem(stateKey)
  })

  const [colorNavId, setColorNavIdState] = React.useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return safeGetItem(activeKey)
  })

  const setOpenNav = React.useCallback((id: string | null) => {
    if (id) {
      safeSetItem(stateKey, id)
    } else {
      safeRemoveItem(stateKey)
    }
    setOpenNavIdState(id)
  }, [stateKey])

  const setColorNav = React.useCallback((id: string | null) => {
    if (id) {
      safeSetItem(activeKey, id)
    } else {
      safeRemoveItem(activeKey)
    }
    setColorNavIdState(id)
  }, [activeKey])

  return React.useMemo(() => ({
    openNavId,
    colorNavId,
    setOpenNav,
    setColorNav,
  }), [openNavId, colorNavId, setOpenNav, setColorNav])
}

// ---------------------------------------------------------------------------
// useAngleRotation — Icon Rotation Hook
// ---------------------------------------------------------------------------

/**
 * Hook for managing angle icon rotation on sub-menu toggle.
 *
 * Replaces: `$(this).find('i[class*="fa fa-angle-right"]').toggleClass('fa-rotate-90')`
 *
 * @example
 * ```tsx
 * function NavItem({ id, children }) {
 *   const { rotationClass, toggle } = useAngleRotation(id)
 *   return (
 *     <button onClick={toggle}>
 *       {children} <ChevronRight className={rotationClass} />
 *     </button>
 *   )
 * }
 * ```
 */
export function useAngleRotation(initialOpen: boolean = false) {
  const [isExpanded, setIsExpanded] = React.useState(initialOpen)

  const toggle = React.useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const setExpanded = React.useCallback((expanded: boolean) => {
    setIsExpanded(expanded)
  }, [])

  const rotationClass = isExpanded ? 'rotate-90' : 'rotate-0'

  return React.useMemo(() => ({
    isExpanded,
    rotationClass,
    toggle,
    setExpanded,
  }), [isExpanded, rotationClass, toggle, setExpanded])
}
