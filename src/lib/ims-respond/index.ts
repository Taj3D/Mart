/**
 * IMS Respond - Modern Responsive Utility System
 *
 * Replaces matchMedia() polyfill + Respond.js v1.2.0.
 *
 * Original libraries provided:
 * 1. matchMedia polyfill - Tested CSS media queries in JS for old browsers
 *    by injecting a <div> with the media query's CSS and checking offsetWidth.
 * 2. Respond.js v1.2.0 - Enabled min/max-width CSS media queries in IE6-8
 *    by parsing all stylesheets, extracting @media rules, and dynamically
 *    injecting/removing <style> blocks based on viewport width.
 *
 * In modern Next.js:
 * - window.matchMedia is native (all modern browsers)
 * - CSS media queries work natively (no polyfill needed)
 * - React hooks provide reactive responsive state
 * - useSyncExternalStore for SSR-safe, concurrent-mode-compatible updates
 *
 * ============================================================================
 * MIGRATION GUIDE
 * ============================================================================
 *
 * Old (jQuery + Respond.js)               → New (React + IMS Respond)
 * ──────────────────────────────────────────────────────────────────────
 * window.matchMedia(mq).matches           → matchesMediaQuery(mq) or useMatchMedia(mq)
 * respond.mediaQueriesSupported           → true (always)
 * respond.update()                        → Not needed (automatic)
 * $(window).on('resize', handler)         → useViewport() or useViewportWidth()
 * if (window.innerWidth >= 768)           → useIsAbove('sm') or isAbove('sm')
 * if (window.innerWidth < 768)            → useIsBelow('sm') or isBelow('sm')
 * CSS: .no-mq .fallback                   → Conditional JSX rendering
 * Dynamic <style> injection               → injectDynamicStyle() / updateDynamicStyle()
 * Stylesheet AJAX loading                 → fetchCSS() / parseRemoteMediaRules()
 * Respond.js resize throttle (30ms)       → createThrottledResizeHandler(100ms)
 * @media rule parsing                     → parseMediaRules(cssText)
 * em value calculation                    → pxToEm() / emToPx() / getEmValue()
 *
 * ============================================================================
 * USAGE PATTERNS
 * ============================================================================
 *
 * 1. Standalone Hook (no provider needed):
 *    ```tsx
 *    import { useViewport, useIsMobile } from '@/lib/ims-respond';
 *    function MyComponent() {
 *      const { breakpoint, isDesktop } = useViewport();
 *      const isMobile = useIsMobile();
 *    }
 *    ```
 *
 * 2. Context Provider (recommended for app-wide use):
 *    ```tsx
 *    import { ResponsiveProvider, useResponsiveContext } from '@/lib/ims-respond';
 *    <ResponsiveProvider injectClasses>
 *      <App />
 *    </ResponsiveProvider>
 *    ```
 *
 * 3. Utility Functions (no React):
 *    ```ts
 *    import { matchesMediaQuery, mq, buildBreakpointQuery } from '@/lib/ims-respond';
 *    const isMobile = matchesMediaQuery('(max-width: 767px)');
 *    const query = mq.breakpoint('md', 'up');
 *    ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  BreakpointName,
  BreakpointMap,
  BreakpointInfo,
  MediaQueryDirection,
  Orientation,
  ColorScheme,
  ReducedMotion,
  ContrastPreference,
  ViewportState,
  DynamicStyleOptions,
  ParsedMediaRule,
  ResponsiveProviderProps,
  UseViewportReturn,
  MediaQueryBuilder,
} from './types';

// ============================================================================
// Breakpoints
// ============================================================================

export {
  /** Default breakpoint map (Bootstrap 3 compatible) */
  DEFAULT_BREAKPOINTS,
  /** Breakpoint order from smallest to largest */
  BREAKPOINT_ORDER,
  /** Get the next breakpoint name */
  getNextBreakpoint,
  /** Get the previous breakpoint name */
  getPrevBreakpoint,
  /** Generate complete breakpoint information */
  getBreakpointInfo,
  /** Build min-width media query */
  buildMinWidthQuery,
  /** Build max-width media query */
  buildMaxWidthQuery,
  /** Build range media query */
  buildBetweenQuery,
  /** Build breakpoint-based media query */
  buildBreakpointQuery,
  /** Resolve breakpoint from viewport width */
  resolveBreakpoint,
  /** Check if width matches breakpoint direction */
  matchesBreakpoint,
  /** Convert px to em */
  pxToEm,
  /** Convert em to px */
  emToPx,
  /** Get current 1em value in pixels */
  getEmValue,
  /** Generate responsive CSS classes for <html> */
  generateResponsiveClasses,
} from './breakpoints';

// ============================================================================
// Responsive Utilities
// ============================================================================

export {
  /** Safe matchMedia wrapper */
  matchMedia,
  /** Test media query, return boolean */
  matchesMediaQuery,
  /** Whether media queries are supported (always true in modern browsers) */
  mediaQueriesSupported,
  /** Fluent media query builder */
  mq,
  /** Inject dynamic <style> element */
  injectDynamicStyle,
  /** Remove dynamic <style> element */
  removeDynamicStyle,
  /** Update dynamic <style> element */
  updateDynamicStyle,
  /** Parse @media rules from CSS text */
  parseMediaRules,
  /** Get viewport dimensions */
  getViewportDimensions,
  /** Get device pixel ratio */
  getPixelRatio,
  /** Get current orientation */
  getOrientation,
  /** Check dark color scheme preference */
  prefersDarkColorScheme,
  /** Check reduced motion preference */
  prefersReducedMotion,
  /** Create throttled resize handler */
  createThrottledResizeHandler,
  /** Fetch CSS from URL */
  fetchCSS,
  /** Parse remote stylesheet media rules */
  parseRemoteMediaRules,
} from './responsive-utils';

// ============================================================================
// React Hooks
// ============================================================================

export {
  /** Main viewport hook (standalone, no provider needed) */
  useViewport,
  /** Get current breakpoint name */
  useBreakpoint,
  /** Check if viewport is above a breakpoint */
  useIsAbove,
  /** Check if viewport is below a breakpoint */
  useIsBelow,
  /** Check if viewport is mobile (< 768px) */
  useIsMobile,
  /** Check if viewport is tablet (768-991px) */
  useIsTablet,
  /** Check if viewport is desktop (≥ 992px) */
  useIsDesktop,
  /** Test an arbitrary media query */
  useMatchMedia,
  /** Get viewport width */
  useViewportWidth,
  /** Get current orientation */
  useOrientation,
} from './use-responsive';

// ============================================================================
// Context Provider
// ============================================================================

export {
  /** Responsive context provider */
  ResponsiveProvider,
  /** Access responsive state from context */
  useResponsiveContext,
  /** Safely access responsive state (with/without provider) */
  useResponsiveSafe,
} from './responsive-provider';
