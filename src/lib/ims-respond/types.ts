/**
 * IMS Respond - Responsive Types
 *
 * Replaces matchMedia polyfill + Respond.js v1.2.0 with modern TypeScript types.
 *
 * Original libraries:
 * 1. matchMedia() polyfill - Tested CSS media queries in JS for old browsers
 *    (window.matchMedia polyfill using DOM injection)
 * 2. Respond.js v1.2.0 - Enabled min/max-width CSS media queries in IE6-8
 *    by parsing stylesheets, extracting @media rules, and dynamically
 *    injecting/removing style blocks based on viewport width.
 *
 * In modern Next.js:
 * - window.matchMedia is native (Chrome 9+, Firefox 6+, Safari 5.1+, Edge 12+)
 * - CSS media queries work natively in all modern browsers
 * - No need for stylesheet parsing/AJAX CSS loading
 * - React hooks provide reactive responsive state
 * - CSS custom properties + Tailwind breakpoints handle responsive design
 *
 * This module provides:
 * - Structured breakpoint system matching Bootstrap 3 + Tailwind conventions
 * - Type-safe media query builders
 * - React hooks for responsive state
 * - Dynamic style injection utilities (for edge cases)
 * - Viewport-based layout utilities
 */

import type { ReactNode } from 'react';

// ============================================================================
// Breakpoint Definitions
// ============================================================================

/**
 * Standard breakpoint names matching Bootstrap 3 conventions.
 * These are the same breakpoints used in the original IMS ERP system.
 */
export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Breakpoint pixel values.
 * Maps Bootstrap 3 breakpoints to modern equivalents.
 *
 * Bootstrap 3 original values:
 * - xs: <768px (extra small, phones)
 * - sm: ≥768px (small, tablets)
 * - md: ≥992px (medium, desktops)
 * - lg: ≥1200px (large, large desktops)
 *
 * Modern additions:
 * - xl: ≥1400px (extra large screens)
 * - 2xl: ≥1600px (ultra-wide screens)
 */
export interface BreakpointMap {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

/**
 * Complete breakpoint information including computed media queries.
 */
export interface BreakpointInfo {
  /** Breakpoint name */
  name: BreakpointName;
  /** Min-width in pixels */
  minWidth: number;
  /** Max-width in pixels (next breakpoint - 1, or null for largest) */
  maxWidth: number | null;
  /** Media query string for min-width */
  minQuery: string;
  /** Media query string for max-width */
  maxQuery: string | null;
  /** Media query string for this breakpoint range only */
  onlyQuery: string;
}

// ============================================================================
// Media Query Types
// ============================================================================

/**
 * Media query feature types.
 * Replaces Respond.js's regex-based min/max parsing with typed objects.
 */
export interface MediaQueryFeature {
  /** Feature name (e.g., 'width', 'height', 'orientation') */
  feature: string;
  /** Min value (e.g., 768) */
  min?: number;
  /** Max value (e.g., 991) */
  max?: number;
  /** Unit (e.g., 'px', 'em', 'rem') */
  unit?: 'px' | 'em' | 'rem';
}

/**
 * Media query direction for breakpoint-based queries.
 */
export type MediaQueryDirection = 'up' | 'down' | 'only';

/**
 * Orientation values for orientation queries.
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Prefers-color-scheme values.
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Prefers-reduced-motion values.
 */
export type ReducedMotion = 'no-preference' | 'reduce';

/**
 * Prefers-contrast values.
 */
export type ContrastPreference = 'no-preference' | 'more' | 'less' | 'custom';

// ============================================================================
// Viewport State
// ============================================================================

/**
 * Current viewport state.
 * Replaces Respond.js's manual viewport width tracking.
 */
export interface ViewportState {
  /** Current viewport width in pixels */
  width: number;
  /** Current viewport height in pixels */
  height: number;
  /** Current active breakpoint name */
  breakpoint: BreakpointName;
  /** Whether viewport matches each breakpoint (min-width) */
  matches: Record<BreakpointName, boolean>;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Current orientation */
  orientation: Orientation;
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether user prefers dark color scheme */
  prefersDarkColorScheme: boolean;
}

// ============================================================================
// Dynamic Style Injection
// ============================================================================

/**
 * Dynamic style injection options.
 * Replaces Respond.js's dynamic <style> element injection.
 * For cases where CSS media queries aren't sufficient (e.g., JS-dependent styles).
 */
export interface DynamicStyleOptions {
  /** Unique ID for the style element */
  id: string;
  /** CSS rules to inject */
  css: string;
  /** Media query to apply (optional) */
  media?: string;
}

/**
 * Parsed media rule extracted from CSS.
 * Replaces Respond.js's @media rule parsing.
 */
export interface ParsedMediaRule {
  /** Original media query string */
  mediaQuery: string;
  /** Media type (e.g., 'all', 'screen', 'print') */
  mediaType: string;
  /** Whether the rule has min-width */
  hasMinWidth: boolean;
  /** Whether the rule has max-width */
  hasMaxWidth: boolean;
  /** Min-width value in pixels (if present) */
  minWidth: number | null;
  /** Max-width value in pixels (if present) */
  maxWidth: number | null;
  /** CSS rules within this media block */
  rules: string;
}

// ============================================================================
// Provider Props
// ============================================================================

/**
 * Props for the ResponsiveProvider component.
 */
export interface ResponsiveProviderProps {
  /** Child elements */
  children: ReactNode;
  /** Custom breakpoints (overrides defaults) */
  breakpoints?: Partial<BreakpointMap>;
  /** Throttle delay for resize events in ms (default: 100) */
  throttleMs?: number;
  /** Whether to inject responsive CSS classes on <html> (default: true) */
  injectClasses?: boolean;
  /** Callback when viewport state changes */
  onViewportChange?: (state: ViewportState) => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useViewport hook.
 * Provides complete viewport state and utility methods.
 */
export interface UseViewportReturn {
  /** Current viewport state */
  viewport: ViewportState;
  /** Whether viewport is at or above the given breakpoint */
  isAbove: (bp: BreakpointName) => boolean;
  /** Whether viewport is below the given breakpoint */
  isBelow: (bp: BreakpointName) => boolean;
  /** Whether viewport is exactly at the given breakpoint range */
  isOnly: (bp: BreakpointName) => boolean;
  /** Test an arbitrary media query */
  matchesQuery: (query: string) => boolean;
  /** Get media query string for breakpoint + direction */
  getBreakpointQuery: (bp: BreakpointName, direction?: MediaQueryDirection) => string;
  /** Active breakpoint name (convenience) */
  breakpoint: BreakpointName;
  /** Whether viewport is mobile-sized (< sm) */
  isMobile: boolean;
  /** Whether viewport is tablet-sized (sm to md) */
  isTablet: boolean;
  /** Whether viewport is desktop-sized (≥ md) */
  isDesktop: boolean;
  /** Whether viewport is large desktop (≥ lg) */
  isLargeDesktop: boolean;
}

// ============================================================================
// Utility Function Types
// ============================================================================

/**
 * Media query builder function.
 * Replaces Respond.js's manual media query string construction.
 */
export type MediaQueryBuilder = {
  /** Build min-width query */
  minWidth: (value: number, unit?: 'px' | 'em') => string;
  /** Build max-width query */
  maxWidth: (value: number, unit?: 'px' | 'em') => string;
  /** Build min-width and max-width range query */
  between: (min: number, max: number, unit?: 'px' | 'em') => string;
  /** Build orientation query */
  orientation: (orientation: Orientation) => string;
  /** Build prefers-color-scheme query */
  colorScheme: (scheme: ColorScheme) => string;
  /** Build prefers-reduced-motion query */
  reducedMotion: (preference: ReducedMotion) => string;
  /** Build prefers-contrast query */
  contrast: (preference: ContrastPreference) => string;
  /** Build breakpoint-based query */
  breakpoint: (bp: BreakpointName, direction?: MediaQueryDirection) => string;
  /** Combine multiple queries with 'and' */
  and: (...queries: string[]) => string;
  /** Combine multiple queries with 'or' (comma) */
  or: (...queries: string[]) => string;
  /** Negate a query */
  not: (query: string) => string;
};
