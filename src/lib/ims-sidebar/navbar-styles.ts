/**
 * IMS Navbar Styles
 *
 * Converts the original .navbar CSS rules from File 31 to
 * Tailwind CSS class mappings and configuration utilities.
 *
 * Original CSS:
 *   .navbar { padding: 15px 10px; background: #fff; border: none;
 *             border-radius: 0; margin-bottom: 6px;
 *             box-shadow: 1px 1px 3px rgba(0,0,0,0.65); }
 *   .navbar-btn { box-shadow: none; outline: none !important; border: none; }
 *
 * The original white navbar is updated to Deep Navy Blue theme.
 */

import { cn } from '@/lib/utils'
import type { NavbarConfig } from './types'
import { DEFAULT_NAVBAR_CONFIG } from './types'

// ---------------------------------------------------------------------------
// Navbar Tailwind Classes
// ---------------------------------------------------------------------------

/**
 * Complete Tailwind classes for the navbar.
 * Replaces .navbar CSS rules.
 */
export function getNavbarTailwindClasses(
  config: NavbarConfig = DEFAULT_NAVBAR_CONFIG,
  options?: {
    /** Whether to use dark theme navbar */
    dark?: boolean
    /** Whether navbar is fixed/sticky */
    sticky?: boolean
    /** Custom background override */
    background?: string
  },
): string {
  const classes = [
    // Layout
    'flex items-center',
    // Spacing (original: padding: 15px 10px)
    'px-3 py-4',
    // Border (original: border: none; border-radius: 0)
    'border-0 rounded-none',
    // Shadow (original: box-shadow: 1px 1px 3px rgba(0,0,0,0.65))
    'shadow-md',
    // Margin (original: margin-bottom: 6px)
    'mb-1.5',
    // Transition
    'transition-colors',
  ]

  if (options?.sticky) {
    classes.push('sticky top-0 z-50')
  }

  return classes.join(' ')
}

// ---------------------------------------------------------------------------
// Navbar Inline Styles
// ---------------------------------------------------------------------------

/**
 * Inline styles for navbar when Tailwind classes aren't sufficient.
 * Matches original CSS pixel values exactly.
 */
export function getNavbarInlineStyles(
  config: NavbarConfig = DEFAULT_NAVBAR_CONFIG,
): React.CSSProperties {
  return {
    padding: config.padding,
    borderRadius: config.borderRadius,
    marginBottom: config.marginBottom,
    boxShadow: config.boxShadow,
  }
}

// ---------------------------------------------------------------------------
// Navbar Button Classes
// ---------------------------------------------------------------------------

/**
 * Tailwind classes for navbar buttons.
 * Replaces .navbar-btn CSS rules.
 */
export function getNavbarBtnClasses(): string {
  return cn(
    'shadow-none outline-none border-0',
    'focus:outline-none focus:ring-0',
    'transition-colors',
  )
}

// ---------------------------------------------------------------------------
// Navbar Color Presets
// ---------------------------------------------------------------------------

/**
 * Navbar background color classes for different themes.
 * Original used #fff (white), IMS uses Deep Navy Blue.
 */
export const navbarColorPresets = {
  /** White navbar (original) */
  white: 'bg-white dark:bg-gray-100',
  /** Deep Navy Blue navbar (IMS theme) */
  navy: 'bg-[#1a2744] dark:bg-[#0a1628] text-white',
  /** Navy-700 navbar */
  navy700: 'bg-navy-700 dark:bg-navy-800 text-white',
  /** Transparent navbar */
  transparent: 'bg-transparent',
} as const

/**
 * Navbar text color classes.
 */
export const navbarTextPresets = {
  /** Dark text for white navbar */
  dark: 'text-[#1a2744] dark:text-gray-200',
  /** White text for navy navbar */
  white: 'text-white',
} as const

// ---------------------------------------------------------------------------
// Navbar Section Classes
// ---------------------------------------------------------------------------

/**
 * Classes for the navbar brand/logo section.
 */
export function getNavbarBrandClasses(): string {
  return 'flex items-center gap-2 font-semibold text-lg'
}

/**
 * Classes for the navbar navigation links.
 */
export function getNavbarNavClasses(): string {
  return 'flex items-center gap-1'
}

/**
 * Classes for individual navbar nav items.
 * Original .navbar-nav > li > a styling.
 */
export function getNavbarNavItemClasses(isActive: boolean = false): string {
  const base = [
    'flex items-center gap-1.5 px-3 py-2 rounded-sm',
    'font-bold text-[11.8px] tracking-wider uppercase',
    'transition-all duration-300',
  ]

  if (isActive) {
    base.push('bg-white/15 text-white')
  } else {
    base.push('hover:bg-white/10 text-white/90')
  }

  return cn(base)
}

// ---------------------------------------------------------------------------
// Navbar Hover Underline Animation
// ---------------------------------------------------------------------------

/**
 * Classes for animated underline effect on navbar items.
 * Replaces the .navbar-nav > li:after animation from the original site CSS.
 */
export function getNavbarUnderlineClasses(isActive: boolean): string {
  return cn(
    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-emerald-400',
    'transition-all duration-500 ease-out',
    isActive ? 'w-full' : 'w-0 group-hover:w-full',
  )
}
