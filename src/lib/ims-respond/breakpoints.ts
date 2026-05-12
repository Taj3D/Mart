/**
 * IMS Respond - Breakpoint System
 *
 * Provides a structured breakpoint system matching the original IMS ERP's
 * Bootstrap 3 breakpoints, with modern extensions.
 *
 * Original Respond.js behavior:
 * - Parsed @media rules from stylesheets
 * - Extracted min-width/max-width values
 * - Applied styles based on viewport width
 * - Updated on window resize (throttled at 30ms)
 *
 * Modern equivalent:
 * - CSS media queries work natively
 * - Structured breakpoint definitions for JS use
 * - Tailwind CSS integration
 * - Deep Navy Blue theme-aware breakpoint classes
 */

import type {
  BreakpointName,
  BreakpointMap,
  BreakpointInfo,
} from './types';

// ============================================================================
// Default Breakpoints
// ============================================================================

/**
 * Default breakpoint values matching Bootstrap 3 + modern extensions.
 *
 * Bootstrap 3 original:
 * - xs: 0 (no min-width, always applies)
 * - sm: 768px (tablets)
 * - md: 992px (desktops)
 * - lg: 1200px (large desktops)
 *
 * Modern additions (matching Tailwind defaults):
 * - xl: 1400px
 * - 2xl: 1600px
 */
export const DEFAULT_BREAKPOINTS: BreakpointMap = {
  xs: 0,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
  '2xl': 1600,
};

/**
 * Ordered breakpoint names from smallest to largest.
 */
export const BREAKPOINT_ORDER: BreakpointName[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Get the next breakpoint name (or null if this is the largest).
 */
export function getNextBreakpoint(bp: BreakpointName): BreakpointName | null {
  const idx = BREAKPOINT_ORDER.indexOf(bp);
  if (idx < 0 || idx >= BREAKPOINT_ORDER.length - 1) return null;
  return BREAKPOINT_ORDER[idx + 1];
}

/**
 * Get the previous breakpoint name (or null if this is the smallest).
 */
export function getPrevBreakpoint(bp: BreakpointName): BreakpointName | null {
  const idx = BREAKPOINT_ORDER.indexOf(bp);
  if (idx <= 0) return null;
  return BREAKPOINT_ORDER[idx - 1];
}

// ============================================================================
// Breakpoint Information
// ============================================================================

/**
 * Generate complete breakpoint information from a breakpoint map.
 * Provides media query strings for each breakpoint and direction.
 */
export function getBreakpointInfo(
  breakpoints: BreakpointMap = DEFAULT_BREAKPOINTS
): Record<BreakpointName, BreakpointInfo> {
  const result = {} as Record<BreakpointName, BreakpointInfo>;

  for (const name of BREAKPOINT_ORDER) {
    const minWidth = breakpoints[name];
    const nextBp = getNextBreakpoint(name);
    const maxWidth = nextBp ? breakpoints[nextBp] - 1 : null;

    const minQuery = `(min-width: ${minWidth}px)`;
    const maxQuery = maxWidth !== null ? `(max-width: ${maxWidth}px)` : null;

    let onlyQuery: string;
    if (maxWidth !== null) {
      onlyQuery = `${minQuery} and ${maxQuery}`;
    } else {
      onlyQuery = minQuery;
    }

    result[name] = {
      name,
      minWidth,
      maxWidth,
      minQuery,
      maxQuery,
      onlyQuery,
    };
  }

  return result;
}

// ============================================================================
// Media Query Builders
// ============================================================================

/**
 * Build a min-width media query string.
 * Replaces Respond.js's min-width parsing: `\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)`
 */
export function buildMinWidthQuery(value: number, unit: 'px' | 'em' = 'px'): string {
  return `(min-width: ${value}${unit})`;
}

/**
 * Build a max-width media query string.
 * Replaces Respond.js's max-width parsing: `\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)`
 */
export function buildMaxWidthQuery(value: number, unit: 'px' | 'em' = 'px'): string {
  return `(max-width: ${value}${unit})`;
}

/**
 * Build a between-widths (range) media query string.
 */
export function buildBetweenQuery(
  min: number,
  max: number,
  unit: 'px' | 'em' = 'px'
): string {
  return `(min-width: ${min}${unit}) and (max-width: ${max}${unit})`;
}

/**
 * Build a breakpoint-based media query.
 *
 * Direction:
 * - 'up': min-width (and above) - default, most common
 * - 'down': max-width (and below)
 * - 'only': exact breakpoint range (min-width AND max-width)
 *
 * @example
 * ```ts
 * buildBreakpointQuery('md', 'up')   → '(min-width: 992px)'
 * buildBreakpointQuery('md', 'down') → '(max-width: 991px)'
 * buildBreakpointQuery('md', 'only') → '(min-width: 992px) and (max-width: 1199px)'
 * ```
 */
export function buildBreakpointQuery(
  bp: BreakpointName,
  direction: 'up' | 'down' | 'only' = 'up',
  breakpoints: BreakpointMap = DEFAULT_BREAKPOINTS
): string {
  const info = getBreakpointInfo(breakpoints)[bp];

  switch (direction) {
    case 'up':
      return info.minQuery;
    case 'down':
      if (info.maxQuery) return info.maxQuery;
      // Largest breakpoint has no max, so use the min-width
      return info.minQuery;
    case 'only':
      return info.onlyQuery;
    default:
      return info.minQuery;
  }
}

// ============================================================================
// Breakpoint Resolution
// ============================================================================

/**
 * Determine the current breakpoint from viewport width.
 * Replaces Respond.js's viewport width comparison logic.
 *
 * @param width - Viewport width in pixels
 * @param breakpoints - Breakpoint map
 * @returns The active breakpoint name
 */
export function resolveBreakpoint(
  width: number,
  breakpoints: BreakpointMap = DEFAULT_BREAKPOINTS
): BreakpointName {
  // Check from largest to smallest
  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const name = BREAKPOINT_ORDER[i];
    if (width >= breakpoints[name]) {
      return name;
    }
  }
  return 'xs';
}

/**
 * Check if a viewport width matches a breakpoint direction.
 */
export function matchesBreakpoint(
  width: number,
  bp: BreakpointName,
  direction: 'up' | 'down' | 'only' = 'up',
  breakpoints: BreakpointMap = DEFAULT_BREAKPOINTS
): boolean {
  const current = resolveBreakpoint(width, breakpoints);
  const currentIdx = BREAKPOINT_ORDER.indexOf(current);
  const targetIdx = BREAKPOINT_ORDER.indexOf(bp);

  switch (direction) {
    case 'up':
      return currentIdx >= targetIdx;
    case 'down':
      return currentIdx <= targetIdx;
    case 'only':
      return current === bp;
    default:
      return currentIdx >= targetIdx;
  }
}

// ============================================================================
// Em Value Calculation
// ============================================================================

/**
 * Convert pixels to ems relative to a base font size.
 * Replaces Respond.js's getEmValue() function which created a temporary
 * div to measure 1em in pixels.
 *
 * Modern approach: use parseFloat(getComputedStyle) instead of DOM measurement.
 *
 * @param px - Pixel value
 * @param baseFontSize - Base font size (default: 16px browser default)
 * @returns Value in ems
 */
export function pxToEm(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}em`;
}

/**
 * Convert ems to pixels relative to a base font size.
 * Inverse of pxToEm.
 *
 * @param em - Em value string (e.g., '1.5em') or number
 * @param baseFontSize - Base font size (default: 16px)
 * @returns Value in pixels
 */
export function emToPx(em: string | number, baseFontSize: number = 16): number {
  const emValue = typeof em === 'string' ? parseFloat(em) : em;
  return emValue * baseFontSize;
}

/**
 * Get the current 1em value in pixels from the browser.
 * Modern replacement for Respond.js's getEmValue() that used DOM injection.
 */
export function getEmValue(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 16;

  try {
    return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  } catch {
    return 16;
  }
}

// ============================================================================
// CSS Class Generation
// ============================================================================

/**
 * Generate responsive CSS class names for the <html> element.
 * Replaces Respond.js's dynamic class injection approach.
 *
 * Provides classes like:
 * - `ims-bp-xs`, `ims-bp-sm`, `ims-bp-md`, `ims-bp-lg`, `ims-bp-xl`, `ims-bp-2xl`
 * - `ims-bp-sm-up`, `ims-bp-md-up`, etc.
 * - `ims-bp-sm-down`, `ims-bp-md-down`, etc.
 * - `ims-mobile`, `ims-tablet`, `ims-desktop`, `ims-lg-desktop`
 * - `ims-orientation-portrait`, `ims-orientation-landscape`
 * - `ims-prefers-dark`, `ims-prefers-light`
 * - `ims-prefers-reduced-motion`
 *
 * These classes enable CSS-only responsive styling without Respond.js.
 */
export function generateResponsiveClasses(
  breakpoint: BreakpointName,
  orientation: 'portrait' | 'landscape',
  prefersDark: boolean,
  prefersReducedMotion: boolean
): string {
  const classes: string[] = [];
  const bpIdx = BREAKPOINT_ORDER.indexOf(breakpoint);

  // Current breakpoint class
  classes.push(`ims-bp-${breakpoint}`);

  // Direction classes (e.g., ims-bp-md-up means at md or above)
  for (let i = 0; i <= bpIdx; i++) {
    classes.push(`ims-bp-${BREAKPOINT_ORDER[i]}-up`);
  }

  // Direction classes down (e.g., ims-bp-md-down means at md or below)
  for (let i = bpIdx; i < BREAKPOINT_ORDER.length; i++) {
    classes.push(`ims-bp-${BREAKPOINT_ORDER[i]}-down`);
  }

  // Semantic classes
  const isMobile = bpIdx <= BREAKPOINT_ORDER.indexOf('xs');
  const isTablet = bpIdx >= BREAKPOINT_ORDER.indexOf('sm') && bpIdx < BREAKPOINT_ORDER.indexOf('md');
  const isDesktop = bpIdx >= BREAKPOINT_ORDER.indexOf('md');
  const isLargeDesktop = bpIdx >= BREAKPOINT_ORDER.indexOf('lg');

  if (isMobile) classes.push('ims-mobile');
  if (isTablet) classes.push('ims-tablet');
  if (isDesktop) classes.push('ims-desktop');
  if (isLargeDesktop) classes.push('ims-lg-desktop');

  // Orientation
  classes.push(`ims-orientation-${orientation}`);

  // Color scheme
  classes.push(prefersDark ? 'ims-prefers-dark' : 'ims-prefers-light');

  // Reduced motion
  if (prefersReducedMotion) classes.push('ims-prefers-reduced-motion');

  return classes.join(' ');
}

// ============================================================================
// Deep Navy Blue Responsive Theme CSS
// ============================================================================

/**
 * CSS variables for Deep Navy Blue responsive breakpoints.
 * These can be used in CSS for responsive styles that match the JS breakpoints.
 */
export const RESPOND_CSS_VARIABLES = `
  :root {
    --ims-bp-xs: 0px;
    --ims-bp-sm: 768px;
    --ims-bp-md: 992px;
    --ims-bp-lg: 1200px;
    --ims-bp-xl: 1400px;
    --ims-bp-2xl: 1600px;
  }
`;
