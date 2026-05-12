/**
 * IMS Respond - Responsive Context Provider
 *
 * Provides responsive state via React context, optionally injecting
 * CSS classes on the <html> element (like Respond.js's approach but modern).
 *
 * Replaces:
 * - Respond.js's dynamic CSS class/style injection
 * - Global `respond` namespace
 * - Manual resize event listeners with throttling
 *
 * Usage:
 * ```tsx
 * <ResponsiveProvider injectClasses>
 *   <App />
 * </ResponsiveProvider>
 *
 * // In any child:
 * const { viewport, isMobile } = useResponsiveContext();
 * ```
 */

'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from 'react';
import type {
  BreakpointName,
  BreakpointMap,
  ViewportState,
  UseViewportReturn,
  MediaQueryDirection,
  ResponsiveProviderProps,
} from './types';
import {
  DEFAULT_BREAKPOINTS,
  resolveBreakpoint,
  buildBreakpointQuery,
  BREAKPOINT_ORDER,
  generateResponsiveClasses,
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
// Viewport Store (for context provider, supports custom breakpoints)
// ============================================================================

class ProviderViewportStore {
  private listeners = new Set<() => void>();
  private state: ViewportState;
  private throttle: ReturnType<typeof createThrottledResizeHandler> | null = null;
  private initialized = false;

  constructor(private breakpoints: BreakpointMap) {
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

  private ensureInitialized(throttleMs: number): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    this.throttle = createThrottledResizeHandler(this.updateState, throttleMs);
    this.throttle.start();

    if (screen.orientation) {
      screen.orientation.addEventListener('change', this.updateState);
    }

    const darkMql = window.matchMedia('(prefers-color-scheme: dark)');
    darkMql.addEventListener('change', this.updateState);

    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMql.addEventListener('change', this.updateState);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.throttle) {
        this.throttle.stop();
        this.throttle = null;
        this.initialized = false;
      }
    };
  };

  getSnapshot = (): ViewportState => this.state;

  getServerSnapshot = (): ViewportState => {
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

  init(throttleMs: number): void {
    this.ensureInitialized(throttleMs);
  }
}

// ============================================================================
// Context
// ============================================================================

const ResponsiveContext = createContext<UseViewportReturn | null>(null);
ResponsiveContext.displayName = 'IMSResponsiveContext';

// ============================================================================
// Provider
// ============================================================================

/**
 * Responsive context provider.
 *
 * Wraps the application and provides responsive viewport state via context.
 * Optionally injects responsive CSS classes on the <html> element.
 *
 * @example
 * ```tsx
 * <ResponsiveProvider injectClasses throttleMs={100}>
 *   <App />
 * </ResponsiveProvider>
 * ```
 */
export function ResponsiveProvider({
  children,
  breakpoints: customBreakpoints,
  throttleMs = 100,
  injectClasses = true,
  onViewportChange,
}: ResponsiveProviderProps) {
  const mergedBreakpoints = useMemo<BreakpointMap>(
    () => ({ ...DEFAULT_BREAKPOINTS, ...customBreakpoints }),
    [customBreakpoints]
  );

  // Create store with custom breakpoints
  const [store] = useState(() => new ProviderViewportStore(mergedBreakpoints));

  // Initialize event listeners
  useEffect(() => {
    store.init(throttleMs);
  }, [store, throttleMs]);

  const viewport = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const bpIdx = BREAKPOINT_ORDER.indexOf(viewport.breakpoint);

  // Inject CSS classes on <html> element
  useEffect(() => {
    if (!injectClasses || typeof document === 'undefined') return;

    const htmlEl = document.documentElement;
    if (!htmlEl) return;

    const responsiveClasses = generateResponsiveClasses(
      viewport.breakpoint,
      viewport.orientation,
      viewport.prefersDarkColorScheme,
      viewport.prefersReducedMotion
    );

    // Remove old responsive classes
    const cleanedClasses = htmlEl.className
      .split(/\s+/)
      .filter((cls) => !cls.startsWith('ims-bp-') && !cls.startsWith('ims-mobile') && !cls.startsWith('ims-tablet') && !cls.startsWith('ims-desktop') && !cls.startsWith('ims-orientation-') && !cls.startsWith('ims-prefers-'))
      .join(' ');

    htmlEl.className = (cleanedClasses + ' ' + responsiveClasses).trim();
  }, [injectClasses, viewport]);

  // Callback on viewport change
  useEffect(() => {
    if (onViewportChange) {
      onViewportChange(viewport);
    }
  }, [onViewportChange, viewport]);

  // Build utility functions
  const isAbove = useCallback(
    (bp: BreakpointName): boolean => bpIdx >= BREAKPOINT_ORDER.indexOf(bp),
    [bpIdx]
  );

  const isBelow = useCallback(
    (bp: BreakpointName): boolean => bpIdx < BREAKPOINT_ORDER.indexOf(bp),
    [bpIdx]
  );

  const isOnly = useCallback(
    (bp: BreakpointName): boolean => viewport.breakpoint === bp,
    [viewport.breakpoint]
  );

  const matchesQueryFn = useCallback(
    (query: string): boolean => matchesMediaQuery(query),
    []
  );

  const getBreakpointQueryFn = useCallback(
    (bp: BreakpointName, direction: MediaQueryDirection = 'up'): string =>
      buildBreakpointQuery(bp, direction, mergedBreakpoints),
    [mergedBreakpoints]
  );

  const value = useMemo<UseViewportReturn>(
    () => ({
      viewport,
      isAbove,
      isBelow,
      isOnly,
      matchesQuery: matchesQueryFn,
      getBreakpointQuery: getBreakpointQueryFn,
      breakpoint: viewport.breakpoint,
      isMobile: viewport.width < mergedBreakpoints.sm,
      isTablet: viewport.width >= mergedBreakpoints.sm && viewport.width < mergedBreakpoints.md,
      isDesktop: viewport.width >= mergedBreakpoints.md,
      isLargeDesktop: viewport.width >= mergedBreakpoints.lg,
    }),
    [viewport, isAbove, isBelow, isOnly, matchesQueryFn, getBreakpointQueryFn, mergedBreakpoints]
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

/**
 * Access responsive state from context.
 * Must be used within a ResponsiveProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, breakpoint, viewport } = useResponsiveContext();
 *   return isMobile ? <MobileView /> : <DesktopView />;
 * }
 * ```
 */
export function useResponsiveContext(): UseViewportReturn {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error(
      'useResponsiveContext must be used within a <ResponsiveProvider>. ' +
      'Wrap your component tree with <ResponsiveProvider>.'
    );
  }
  return context;
}

/**
 * Safely access responsive state, falling back to standalone viewport.
 * Works with or without a ResponsiveProvider.
 *
 * Uses the same useSyncExternalStore pattern as the standalone useViewport
 * hook when no provider is available.
 */
export function useResponsiveSafe(): UseViewportReturn {
  const context = useContext(ResponsiveContext);

  // Fallback: use the global viewport store directly
  // This matches the standalone useViewport hook behavior
  const fallbackViewport = useSyncExternalStore(
    globalStore.subscribe,
    globalStore.getSnapshot,
    globalStore.getServerSnapshot
  );

  const bpIdx = BREAKPOINT_ORDER.indexOf(fallbackViewport.breakpoint);

  const fallback = useMemo<UseViewportReturn>(() => ({
    viewport: fallbackViewport,
    isAbove: (bp: BreakpointName) => bpIdx >= BREAKPOINT_ORDER.indexOf(bp),
    isBelow: (bp: BreakpointName) => bpIdx < BREAKPOINT_ORDER.indexOf(bp),
    isOnly: (bp: BreakpointName) => fallbackViewport.breakpoint === bp,
    matchesQuery: matchesMediaQuery,
    getBreakpointQuery: (bp: BreakpointName, dir: MediaQueryDirection = 'up') =>
      buildBreakpointQuery(bp, dir),
    breakpoint: fallbackViewport.breakpoint,
    isMobile: fallbackViewport.width < DEFAULT_BREAKPOINTS.sm,
    isTablet: fallbackViewport.width >= DEFAULT_BREAKPOINTS.sm && fallbackViewport.width < DEFAULT_BREAKPOINTS.md,
    isDesktop: fallbackViewport.width >= DEFAULT_BREAKPOINTS.md,
    isLargeDesktop: fallbackViewport.width >= DEFAULT_BREAKPOINTS.lg,
  }), [fallbackViewport, bpIdx]);

  return context ?? fallback;
}

// Global store singleton for fallback (same as in use-responsive.ts)
const globalStore = new ProviderViewportStore(DEFAULT_BREAKPOINTS);
