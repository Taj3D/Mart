/**
 * IMS Sidebar Animation Configuration
 *
 * Converts sidebar CSS transitions from File 31 to Framer Motion
 * animation variants and transition configs.
 *
 * Original CSS transitions:
 * - #sidebar: transition all 0.5s
 * - #content: transition all 0.3s
 * - a, a:hover, a:focus: transition all 0.3s
 *
 * These are expressed as Framer Motion variants for components
 * that need JS-driven animations (mobile drawer, collapse toggle).
 */

import type { Variants, Transition } from 'framer-motion'

// ---------------------------------------------------------------------------
// Transition Presets
// ---------------------------------------------------------------------------

/** Sidebar expand/collapse transition (original: all 0.5s) */
export const SIDEBAR_TRANSITION: Transition = {
  duration: 0.5,
  ease: 'easeInOut',
}

/** Content area transition (original: all 0.3s) */
export const CONTENT_TRANSITION: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

/** Link hover transition (original: all 0.3s) */
export const LINK_HOVER_TRANSITION: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

/** Mobile slide transition */
export const MOBILE_SLIDE_TRANSITION: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // material ease-out
}

// ---------------------------------------------------------------------------
// Sidebar Panel Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for sidebar width animation.
 *
 * Matches original:
 *   #sidebar { min-width: 250px; max-width: 250px; transition: all 0.5s; }
 *   #sidebar.active { min-width: 80px; max-width: 80px; }
 */
export const sidebarVariants: Variants = {
  expanded: {
    width: 250,
    minWidth: 250,
    transition: SIDEBAR_TRANSITION,
  },
  collapsed: {
    width: 80,
    minWidth: 80,
    transition: SIDEBAR_TRANSITION,
  },
}

// ---------------------------------------------------------------------------
// Mobile Drawer Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for mobile sidebar drawer.
 *
 * Matches original:
 *   @media (max-width: 768px) {
 *     #sidebar { margin-left: -80px !important; }
 *     #sidebar.active { margin-left: 0 !important; }
 *   }
 */
export const mobileDrawerVariants: Variants = {
  closed: {
    x: '-100%',
    transition: MOBILE_SLIDE_TRANSITION,
  },
  open: {
    x: 0,
    transition: MOBILE_SLIDE_TRANSITION,
  },
}

// ---------------------------------------------------------------------------
// Overlay Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for mobile overlay backdrop.
 */
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

// ---------------------------------------------------------------------------
// Sub-menu Collapse Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for sub-menu expand/collapse.
 *
 * Matches original Bootstrap dropdown animation behavior
 * (slideDown/slideUp from File 30, 300ms duration).
 */
export const subMenuVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// ---------------------------------------------------------------------------
// Menu Item Hover Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for menu item hover effects.
 *
 * Matches original:
 *   #sidebar ul li a:hover { color: #41b53f; background: #fff; }
 *   transition: all 0.3s;
 */
export const menuItemHoverVariants: Variants = {
  idle: {
    backgroundColor: 'transparent',
    transition: LINK_HOVER_TRANSITION,
  },
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transition: LINK_HOVER_TRANSITION,
  },
}

// ---------------------------------------------------------------------------
// Header Title Fade Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for sidebar header title fade.
 *
 * Matches original:
 *   #sidebar.active .sidebar-header h3 { display: none; }
 *   #sidebar.active .sidebar-header strong { display: block; }
 */
export const headerTitleVariants: Variants = {
  visible: {
    opacity: 1,
    width: 'auto',
    transition: CONTENT_TRANSITION,
  },
  hidden: {
    opacity: 0,
    width: 0,
    transition: CONTENT_TRANSITION,
  },
}

export const headerShortTitleVariants: Variants = {
  visible: {
    opacity: 1,
    transition: CONTENT_TRANSITION,
  },
  hidden: {
    opacity: 0,
    transition: CONTENT_TRANSITION,
  },
}

// ---------------------------------------------------------------------------
// Content Area Variants
// ---------------------------------------------------------------------------

/**
 * Framer Motion variants for content area transition when sidebar toggles.
 *
 * Matches original:
 *   #content { width: 100%; transition: all 0.3s; }
 */
export const contentAreaVariants: Variants = {
  sidebarExpanded: {
    marginLeft: 0,
    transition: CONTENT_TRANSITION,
  },
  sidebarCollapsed: {
    marginLeft: 0,
    transition: CONTENT_TRANSITION,
  },
}

// ---------------------------------------------------------------------------
// CSS Transition Strings
// ---------------------------------------------------------------------------

/**
 * CSS transition strings for components not using Framer Motion.
 * These replicate the original CSS transition values.
 */
export const cssTransitions = {
  /** Sidebar expand/collapse (original: all 0.5s) */
  sidebar: 'all 0.5s ease',
  /** Content area (original: all 0.3s) */
  content: 'all 0.3s ease',
  /** Link hover (original: all 0.3s) */
  linkHover: 'all 0.3s ease',
  /** Mobile slide */
  mobileSlide: 'all 0.3s ease',
  /** Sub-menu animation */
  subMenu: 'all 0.3s ease',
} as const

// ---------------------------------------------------------------------------
// Animation Utility
// ---------------------------------------------------------------------------

/**
 * Build a custom sidebar animation variant with different durations.
 */
export function buildSidebarVariants(options: {
  expandedWidth?: number
  collapsedWidth?: number
  duration?: number
}): Variants {
  const { expandedWidth = 250, collapsedWidth = 80, duration = 0.5 } = options
  return {
    expanded: {
      width: expandedWidth,
      minWidth: expandedWidth,
      transition: { duration, ease: 'easeInOut' },
    },
    collapsed: {
      width: collapsedWidth,
      minWidth: collapsedWidth,
      transition: { duration, ease: 'easeInOut' },
    },
  }
}

/**
 * Build custom mobile drawer variants.
 */
export function buildMobileDrawerVariants(options: {
  duration?: number
}): Variants {
  const { duration = 0.3 } = options
  return {
    closed: {
      x: '-100%',
      transition: { duration, ease: [0.4, 0, 0.2, 1] },
    },
    open: {
      x: 0,
      transition: { duration, ease: [0.4, 0, 0.2, 1] },
    },
  }
}
