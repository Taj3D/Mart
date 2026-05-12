/**
 * IMS Respond - Responsive Utilities
 *
 * Modern replacements for matchMedia polyfill + Respond.js utility functions.
 *
 * Original functionality mapped:
 * - window.matchMedia() polyfill → Native matchMedia with safe wrappers
 * - respond.mediaQueriesSupported → Always true in modern browsers
 * - respond.update() → Dynamic style system (refresh)
 * - ripCSS() / translate() → CSS media query parsing (now native)
 * - applyMedia() → Dynamic style injection based on viewport
 * - ajax() / xmlHttp() → fetch() for dynamic CSS loading
 * - getEmValue() → getComputedStyle approach
 * - resize throttling → requestAnimationFrame + throttle
 */

import type {
  BreakpointName,
  BreakpointMap,
  DynamicStyleOptions,
  ParsedMediaRule,
  MediaQueryBuilder,
  Orientation,
  ColorScheme,
  ReducedMotion,
  ContrastPreference,
  MediaQueryDirection,
} from './types';
import {
  DEFAULT_BREAKPOINTS,
  buildMinWidthQuery,
  buildMaxWidthQuery,
  buildBetweenQuery,
  buildBreakpointQuery,
  getBreakpointInfo,
} from './breakpoints';

// ============================================================================
// matchMedia Safe Wrapper
// ============================================================================

/**
 * Safe matchMedia wrapper.
 * Replaces the matchMedia polyfill from the original file.
 *
 * The polyfill created a temporary <div>, injected CSS with the media query,
 * and checked if the div had the expected width. This is completely unnecessary
 * in modern browsers where matchMedia is native.
 *
 * @param query - Media query string
 * @returns MediaQueryList result (or fallback for SSR)
 */
export function matchMedia(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }
  return window.matchMedia(query);
}

/**
 * Test a media query and return boolean result.
 * Replaces the polyfill's `bool = div.offsetWidth == 42` check.
 *
 * @param query - Media query string
 * @returns Whether the media query matches
 */
export function matchesMediaQuery(query: string): boolean {
  const mql = matchMedia(query);
  return mql?.matches ?? false;
}

/**
 * Whether media queries are supported in the current environment.
 * Replaces `respond.mediaQueriesSupported`.
 * Always true in modern browsers.
 */
export function mediaQueriesSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

// ============================================================================
// Media Query Builder
// ============================================================================

/**
 * Fluent media query builder.
 * Provides a type-safe way to construct complex media queries
 * without manual string concatenation.
 *
 * @example
 * ```ts
 * const query = mq.and(
 *   mq.breakpoint('md', 'up'),
 *   mq.orientation('landscape'),
 *   mq.not(mq.colorScheme('dark'))
 * );
 * // Result: '(min-width: 992px) and (orientation: landscape) and not (prefers-color-scheme: dark)'
 * ```
 */
export const mq: MediaQueryBuilder = {
  minWidth: (value: number, unit: 'px' | 'em' = 'px') =>
    `(min-width: ${value}${unit})`,

  maxWidth: (value: number, unit: 'px' | 'em' = 'px') =>
    `(max-width: ${value}${unit})`,

  between: (min: number, max: number, unit: 'px' | 'em' = 'px') =>
    `(min-width: ${min}${unit}) and (max-width: ${max}${unit})`,

  orientation: (o: Orientation) =>
    `(orientation: ${o})`,

  colorScheme: (scheme: ColorScheme) =>
    `(prefers-color-scheme: ${scheme})`,

  reducedMotion: (preference: ReducedMotion) =>
    `(prefers-reduced-motion: ${preference})`,

  contrast: (preference: ContrastPreference) =>
    `(prefers-contrast: ${preference})`,

  breakpoint: (bp: BreakpointName, direction: MediaQueryDirection = 'up') =>
    buildBreakpointQuery(bp, direction),

  and: (...queries: string[]) =>
    queries.join(' and '),

  or: (...queries: string[]) =>
    queries.join(', '),

  not: (query: string) =>
    `not ${query}`,
};

// ============================================================================
// Dynamic Style Injection
// ============================================================================

/**
 * Inject a dynamic <style> element into the document head.
 * Replaces Respond.js's applyMedia() which dynamically created <style>
 * elements with media-query-specific CSS rules.
 *
 * Key differences:
 * - Uses id-based tracking instead of array indexing
 * - Properly cleans up previous style elements
 * - Works with any CSS, not just @media rules
 *
 * @param options - Style injection options
 */
export function injectDynamicStyle(options: DynamicStyleOptions): void {
  if (typeof document === 'undefined') return;

  const { id, css, media } = options;

  // Remove existing style with same id
  removeDynamicStyle(id);

  // Create new style element
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = `ims-respond-${id}`;
  if (media) {
    style.media = media;
  }

  if (style.styleSheet) {
    // IE path (unlikely but safe)
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  // Insert at end of head
  const head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(style);
  }
}

/**
 * Remove a dynamically injected style element by id.
 * Replaces Respond.js's cleanup loop: `for (var i in appendedEls) { head.removeChild(appendedEls[i]); }`
 */
export function removeDynamicStyle(id: string): void {
  if (typeof document === 'undefined') return;

  const el = document.getElementById(`ims-respond-${id}`);
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Update a dynamic style element's CSS content.
 * If the element doesn't exist, it will be created.
 */
export function updateDynamicStyle(options: DynamicStyleOptions): void {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById(`ims-respond-${options.id}`);
  if (existing) {
    if (existing.styleSheet) {
      existing.styleSheet.cssText = options.css;
    } else {
      existing.textContent = options.css;
    }
    if (options.media) {
      existing.media = options.media;
    }
  } else {
    injectDynamicStyle(options);
  }
}

// ============================================================================
// CSS Media Query Parsing
// ============================================================================

/**
 * Parse @media rules from CSS text.
 * Replaces Respond.js's translate() function which used regex to extract
 * @media blocks from stylesheet text.
 *
 * This is primarily useful for dynamic CSS analysis, not for runtime
 * polyfilling (which is what Respond.js did).
 *
 * @param cssText - Raw CSS text containing @media rules
 * @returns Array of parsed media rules
 */
export function parseMediaRules(cssText: string): ParsedMediaRule[] {
  const results: ParsedMediaRule[] = [];

  // Match @media blocks
  const mediaRegex = /@media\s+([^{]+)\s*\{([\s\S]*?)(?=\}\s*@media|\}\s*$)/gi;
  let match: RegExpExecArray | null;

  while ((match = mediaRegex.exec(cssText)) !== null) {
    const mediaQuery = match[1].trim();
    const rules = match[2].trim();

    // Extract media type
    const typeMatch = mediaQuery.match(/^(only\s+)?([a-zA-Z]+)/);
    const mediaType = typeMatch ? typeMatch[2] : 'all';

    // Extract min-width
    const minMatch = mediaQuery.match(/min-width:\s*([\d.]+)(px|em)/);
    const minWidth = minMatch ? parseFloat(minMatch[1]) : null;

    // Extract max-width
    const maxMatch = mediaQuery.match(/max-width:\s*([\d.]+)(px|em)/);
    const maxWidth = maxMatch ? parseFloat(maxMatch[1]) : null;

    results.push({
      mediaQuery,
      mediaType,
      hasMinWidth: minWidth !== null,
      hasMaxWidth: maxWidth !== null,
      minWidth,
      maxWidth,
      rules,
    });
  }

  return results;
}

// ============================================================================
// Viewport Measurement
// ============================================================================

/**
 * Get current viewport dimensions.
 * Replaces Respond.js's `docElem.clientWidth` / `doc.body.clientWidth` approach.
 *
 * Uses `window.innerWidth` for consistency with CSS media queries.
 * Falls back to `document.documentElement.clientWidth` if needed.
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 }; // SSR default
  }

  return {
    width: window.innerWidth || document.documentElement?.clientWidth || 1024,
    height: window.innerHeight || document.documentElement?.clientHeight || 768,
  };
}

/**
 * Get device pixel ratio.
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Get current orientation.
 */
export function getOrientation(): Orientation {
  if (typeof window === 'undefined') return 'landscape';

  // Use screen.orientation API if available
  if (screen.orientation) {
    return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
  }

  // Fallback: use matchMedia
  if (window.matchMedia) {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }

  // Last resort: compare dimensions
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Check if user prefers dark color scheme.
 */
export function prefersDarkColorScheme(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// Resize Throttle
// ============================================================================

/**
 * Throttle function using requestAnimationFrame.
 * Replaces Respond.js's `resizeThrottle = 30` + setTimeout approach.
 *
 * Modern approach uses rAF for smoother updates and avoids layout thrashing.
 */
export function createThrottledResizeHandler(
  callback: () => void,
  throttleMs: number = 100
): {
  handler: () => void;
  start: () => void;
  stop: () => void;
} {
  let lastCall = 0;
  let rafId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = () => {
    const now = Date.now();
    const elapsed = now - lastCall;

    if (elapsed >= throttleMs) {
      lastCall = now;
      callback();
    } else if (!timeoutId) {
      // Schedule a final call after the remaining throttle time
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        callback();
      }, throttleMs - elapsed);
    }
  };

  const rafHandler = () => {
    throttled();
    rafId = null;
  };

  const handler = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(rafHandler);
  };

  const start = () => {
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', handler, { passive: true });
  };

  const stop = () => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', handler);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { handler, start, stop };
}

// ============================================================================
// AJAX CSS Loading
// ============================================================================

/**
 * Fetch CSS text from a URL.
 * Replaces Respond.js's ajax() / xmlHttp() functions.
 *
 * Original used XMLHttpRequest with ActiveXObject fallback.
 * Modern version uses fetch() API.
 *
 * @param url - URL of the CSS file
 * @returns CSS text content
 */
export async function fetchCSS(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'text/css' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSS: ${response.status}`);
    }
    return response.text();
  } catch (error) {
    console.error(`IMS Respond: Error fetching CSS from ${url}:`, error);
    return '';
  }
}

/**
 * Parse a CSS stylesheet URL and extract media rules.
 * Replaces Respond.js's ripCSS() → makeRequests() → ajax() → translate() chain.
 *
 * @param url - URL of the CSS stylesheet
 * @returns Parsed media rules from the stylesheet
 */
export async function parseRemoteMediaRules(url: string): Promise<ParsedMediaRule[]> {
  const cssText = await fetchCSS(url);
  if (!cssText) return [];
  return parseMediaRules(cssText);
}
