/**
 * IMS Respond - React Hooks for Responsive Behavior
 *
 * React hooks that replace the jQuery + Respond.js responsive pattern.
 *
 * Original patterns:
 * - `$(window).on('resize', ...)` with Respond.js applyMedia() → useViewport()
 * - `respond.mediaQueriesSupported` check → useBreakpoint()
 * - Manual viewport width comparison → useIsAbove() / useIsBelow()
 * - CSS class-based responsive checks → useResponsiveClass()
 *
 * All hooks use useSyncExternalStore for:
 * - SSR compatibility
 * - No setState-in-effect lint issues
 * - Concurrent mode safe
 * - Optimal re-render performance
 */

'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type {
  BreakpointName,
  BreakpointMap,
  ViewportState,
  UseViewportReturn,
  MediaQueryDirection,
} from './types';
import {
  DEFAULT_BREAKPOINTS,
  resolveBreakpoint,
  buildBreakpointQuery,
  BREAKPOINT_ORDER,
} from './breakpoints';
import {
  getViewportDimensions,
  getPixelRatio,
  getOrientation,
  prefersDarkColorScheme,
  prefersReducedMotion,
  matchesMediaQuery,
  createThrottledResizeHandler,
} from './responsive-utils';

// ============================================================================
// Viewport Store (useSyncExternalStore)
// ============================================================================

/**
 * Global viewport state store.
 * Updates on resize (throttled), orientation change, and media query changes.
 */
class ViewportStore {
  private listeners = new Set<() => void>();
  private state: ViewportState;
  private throttle: ReturnType<typeof createThrottledResizeHandler> | null = null;
  private initialized = false;

  constructor(private breakpoints: BreakpointMap = DEFAULT_BREAKPOINTS) {
    // Initialize with defaults (SSR-safe)
    this.state = this.computeState();
  }

  private computeState(): ViewportState {
    const { width, height } = getViewportDimensions();
    const breakpoint = resolveBreakpoint(width, this.breakpoints);

    const matches = {} as Record<BreakpointName, boolean>;
    const bpIdx = BREAKPOINT_ORDER.indexOf(breakpoint);
    for (let i = 0; i < BREAKPOINT_ORDER.length; i++) {
      matches[BREAKPOINT_ORDER[i]] = i <= bpIdx;
    }

    return {
      width,
      height,
      breakpoint,
      matches,
      pixelRatio: getPixelRatio(),
      orientation: getOrientation(),
      prefersReducedMotion: prefersReducedMotion(),
      prefersDarkColorScheme: prefersDarkColorScheme(),
    };
  }

  private updateState = (): void => {
    const newState = this.computeState();
    // Only notify if something changed
    if (
      newState.width !== this.state.width ||
      newState.height !== this.state.height ||
      newState.breakpoint !== this.state.breakpoint ||
      newState.orientation !== this.state.orientation ||
      newState.prefersDarkColorScheme !== this.state.prefersDarkColorScheme ||
      newState.prefersReducedMotion !== this.state.prefersReducedMotion
    ) {
      this.state = newState;
      for (const listener of this.listeners) {
        listener();
      }
    }
  };

  /**
   * Set up event listeners on first subscription.
   */
  private ensureInitialized(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    this.throttle = createThrottledResizeHandler(this.updateState, 100);
    this.throttle.start();

    // Listen for orientation change
    if (screen.orientation) {
      screen.orientation.addEventListener('change', this.updateState);
    }

    // Listen for color scheme changes
    const darkMql = window.matchMedia('(prefers-color-scheme: dark)');
    darkMql.addEventListener('change', this.updateState);

    // Listen for reduced motion changes
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMql.addEventListener('change', this.updateState);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.ensureInitialized();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      // Clean up when no more listeners
      if (this.listeners.size === 0 && this.throttle) {
        this.throttle.stop();
        this.throttle = null;
        this.initialized = false;
      }
    };
  };

  getSnapshot = (): ViewportState => {
    return this.state;
  };

  getServerSnapshot = (): ViewportState => {
    // SSR defaults: assume desktop
    const matches = {} as Record<BreakpointName, boolean>;
    for (const bp of BREAKPOINT_ORDER) {
      matches[bp] = BREAKPOINT_ORDER.indexOf(bp) <= BREAKPOINT_ORDER.indexOf('md');
    }
    return {
      width: 1024,
      height: 768,
      breakpoint: 'md',
      matches,
      pixelRatio: 1,
      orientation: 'landscape',
      prefersReducedMotion: false,
      prefersDarkColorScheme: false,
    };
  };
}

// Singleton store
const globalViewportStore = new ViewportStore();

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook to access viewport state and responsive utilities.
 * Replaces `$(window).on('resize', ...)` + Respond.js's applyMedia().
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { breakpoint, isMobile, isDesktop, viewport } = useViewport();
 *
 *   if (isMobile) return <MobileLayout />;
 *   if (isDesktop) return <DesktopLayout />;
 *   return <TabletLayout />;
 * }
 * ```
 */
export function useViewport(breakpoints?: BreakpointMap): UseViewportReturn {
  // If custom breakpoints are provided, create a new store
  // Otherwise use the global singleton
  const store = useMemo(() => {
    if (breakpoints) {
      return new ViewportStore(breakpoints);
    }
    return globalViewportStore;
  }, [breakpoints]);

  const viewport = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const bpIdx = BREAKPOINT_ORDER.indexOf(viewport.breakpoint);

  const isAbove = useCallback(
    (bp: BreakpointName): boolean => {
      return bpIdx >= BREAKPOINT_ORDER.indexOf(bp);
    },
    [bpIdx]
  );

  const isBelow = useCallback(
    (bp: BreakpointName): boolean => {
      return bpIdx < BREAKPOINT_ORDER.indexOf(bp);
    },
    [bpIdx]
  );

  const isOnly = useCallback(
    (bp: BreakpointName): boolean => {
      return viewport.breakpoint === bp;
    },
    [viewport.breakpoint]
  );

  const matchesQueryFn = useCallback(
    (query: string): boolean => {
      return matchesMediaQuery(query);
    },
    []
  );

  const getBreakpointQueryFn = useCallback(
    (bp: BreakpointName, direction: MediaQueryDirection = 'up'): string => {
      return buildBreakpointQuery(bp, direction, breakpoints);
    },
    [breakpoints]
  );

  return useMemo(
    () => ({
      viewport,
      isAbove,
      isBelow,
      isOnly,
      matchesQuery: matchesQueryFn,
      getBreakpointQuery: getBreakpointQueryFn,
      breakpoint: viewport.breakpoint,
      isMobile: bpIdx <= BREAKPOINT_ORDER.indexOf('xs') || (viewport.width < (breakpoints ?? DEFAULT_BREAKPOINTS).sm),
      isTablet: viewport.width >= (breakpoints ?? DEFAULT_BREAKPOINTS).sm && viewport.width < (breakpoints ?? DEFAULT_BREAKPOINTS).md,
      isDesktop: viewport.width >= (breakpoints ?? DEFAULT_BREAKPOINTS).md,
      isLargeDesktop: viewport.width >= (breakpoints ?? DEFAULT_BREAKPOINTS).lg,
    }),
    [
      viewport,
      isAbove,
      isBelow,
      isOnly,
      matchesQueryFn,
      getBreakpointQueryFn,
      bpIdx,
      breakpoints,
    ]
  );
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get the current breakpoint name.
 * Simplified access for the most common responsive check.
 *
 * @example
 * ```tsx
 * const bp = useBreakpoint();
 * // bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * ```
 */
export function useBreakpoint(): BreakpointName {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return viewport.breakpoint;
}

/**
 * Hook to check if viewport is at or above a breakpoint.
 * Replaces `if (window.innerWidth >= 768)` patterns.
 *
 * @example
 * ```tsx
 * const isDesktop = useIsAbove('md');
 * ```
 */
export function useIsAbove(bp: BreakpointName): boolean {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return BREAKPOINT_ORDER.indexOf(viewport.breakpoint) >= BREAKPOINT_ORDER.indexOf(bp);
}

/**
 * Hook to check if viewport is below a breakpoint.
 * Replaces `if (window.innerWidth < 768)` patterns.
 *
 * @example
 * ```tsx
 * const isMobile = useIsBelow('sm');
 * ```
 */
export function useIsBelow(bp: BreakpointName): boolean {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return BREAKPOINT_ORDER.indexOf(viewport.breakpoint) < BREAKPOINT_ORDER.indexOf(bp);
}

/**
 * Hook for mobile detection.
 * True when viewport is below the 'sm' breakpoint (< 768px).
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * ```
 */
export function useIsMobile(): boolean {
  return useIsBelow('sm');
}

/**
 * Hook for tablet detection.
 * True when viewport is at 'sm' but below 'md' (768px - 991px).
 */
export function useIsTablet(): boolean {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return viewport.width >= DEFAULT_BREAKPOINTS.sm && viewport.width < DEFAULT_BREAKPOINTS.md;
}

/**
 * Hook for desktop detection.
 * True when viewport is at or above 'md' (≥ 992px).
 */
export function useIsDesktop(): boolean {
  return useIsAbove('md');
}

/**
 * Hook to check an arbitrary media query.
 * Replaces the matchMedia polyfill usage pattern.
 *
 * @example
 * ```tsx
 * const isLandscape = useMatchMedia('(orientation: landscape)');
 * const isHighDPI = useMatchMedia('(min-resolution: 2dppx)');
 * ```
 */
export function useMatchMedia(query: string): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      const handler = () => listener();
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    },
    [query]
  );

  const getSnapshot = useCallback((): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback((): boolean => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook for viewport width.
 * Returns current width in pixels.
 *
 * @example
 * ```tsx
 * const width = useViewportWidth();
 * ```
 */
export function useViewportWidth(): number {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return viewport.width;
}

/**
 * Hook for orientation.
 * Returns current orientation ('portrait' | 'landscape').
 *
 * @example
 * ```tsx
 * const orientation = useOrientation();
 * ```
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const viewport = useSyncExternalStore(
    globalViewportStore.subscribe,
    globalViewportStore.getSnapshot,
    globalViewportStore.getServerSnapshot
  );
  return viewport.orientation;
}
