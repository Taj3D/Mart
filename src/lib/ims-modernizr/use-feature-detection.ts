/**
 * IMS Modernizr - useFeatureDetection Hook
 *
 * React hook that provides feature detection results and utility functions.
 * Replaces accessing `window.Modernizr` directly in jQuery code.
 *
 * Migration patterns:
 * - `Modernizr.flexbox` → `const { features } = useFeatureDetection(); features.css.flexbox`
 * - `Modernizr.mq('(min-width: 768px)')` → `const { mq } = useFeatureDetection(); mq('(min-width: 768px)')`
 * - `Modernizr.hasEvent('click')` → `const { hasEvent } = useFeatureDetection(); hasEvent('click')`
 * - `Modernizr.testProp('pointerEvents')` → `const { testProp } = useFeatureDetection(); testProp('pointerEvents')`
 * - `Modernizr.testAllProps('boxSizing')` → `const { testAllProps } = useFeatureDetection(); testAllProps('boxSizing')`
 * - `Modernizr.prefixed('requestAnimationFrame', window)` → `const { prefixed } = useFeatureDetection(); prefixed('requestAnimationFrame', window)`
 * - `Modernizr.addTest('myFeature', fn)` → `const { addTest } = useFeatureDetection(); addTest('myFeature', fn)`
 */

'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import type {
  FeatureDetectionResult,
  UseFeatureDetectionReturn,
} from './types';
import {
  detectAllFeatures,
  testMediaQuery,
  testEventSupport,
  testProp as _testProp,
  testAllProps as _testAllProps,
  getPrefixed as _getPrefixed,
  testStyles as _testStyles,
  CustomTestRegistry,
  generateFeatureClasses,
} from './feature-tests';

// ============================================================================
// Feature Detection Store (for useSyncExternalStore)
// ============================================================================

/**
 * Global feature detection store.
 * Uses useSyncExternalStore pattern for SSR-compatible, lint-clean detection.
 */
class FeatureDetectionStore {
  private result: FeatureDetectionResult | null = null;
  private listeners = new Set<() => void>();

  /**
   * Subscribe to store changes.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Get the current snapshot (for useSyncExternalStore).
   */
  getSnapshot = (): FeatureDetectionResult => {
    if (!this.result) {
      this.result = detectAllFeatures();
    }
    return this.result;
  };

  /**
   * Get SSR snapshot.
   */
  getServerSnapshot = (): FeatureDetectionResult => {
    return detectAllFeatures();
  };

  /**
   * Force refresh detection.
   */
  refresh(): void {
    this.result = detectAllFeatures();
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const featureStore = new FeatureDetectionStore();

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook for browser feature detection.
 * Replaces `window.Modernizr` global access pattern.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { features, mq, isDetected } = useFeatureDetection();
 *
 *   if (!features.css.flexbox) {
 *     return <FallbackLayout />;
 *   }
 *
 *   if (mq('(max-width: 768px)')) {
 *     return <MobileLayout />;
 *   }
 *
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useFeatureDetection(): UseFeatureDetectionReturn {
  // Use useSyncExternalStore for SSR-compatible, lint-clean feature detection
  const features = useSyncExternalStore(
    featureStore.subscribe,
    featureStore.getSnapshot,
    featureStore.getServerSnapshot
  );

  // Custom test registry (created once via useState initializer)
  const [registry] = useState(() => new CustomTestRegistry());
  const [customResults, setCustomResults] = useState<Record<string, boolean>>({});

  /**
   * Test a CSS media query.
   * Replaces Modernizr.mq(mediaQuery)
   */
  const mq = useCallback((mediaQuery: string): boolean => {
    return testMediaQuery(mediaQuery);
  }, []);

  /**
   * Check if an event is supported.
   * Replaces Modernizr.hasEvent(eventName, element)
   */
  const hasEvent = useCallback((eventName: string, element?: HTMLElement): boolean => {
    return testEventSupport(eventName, element);
  }, []);

  /**
   * Test a CSS property.
   * Replaces Modernizr.testProp(propName)
   */
  const testPropFn = useCallback((propName: string): boolean => {
    return _testProp(propName);
  }, []);

  /**
   * Test CSS property with vendor prefixes.
   * Replaces Modernizr.testAllProps(propName)
   */
  const testAllPropsFn = useCallback((propName: string): string | boolean => {
    return _testAllProps(propName);
  }, []);

  /**
   * Get vendor-prefixed property name.
   * Replaces Modernizr.prefixed(prop, obj, elem)
   */
  const prefixedFn = useCallback(
    (
      prop: string,
      obj?: Record<string, unknown>,
      elem?: HTMLElement
    ): string | boolean | (() => void) | undefined => {
      return _getPrefixed(prop, obj, elem);
    },
    []
  );

  /**
   * Test with injected styles.
   * Replaces Modernizr.testStyles(rule, callback, nodes, testnames)
   */
  const testStylesFn = useCallback(
    (
      rule: string,
      callback: (node: HTMLElement, rule: string) => void,
      nodes?: number,
      testnames?: string[]
    ): boolean => {
      return _testStyles(rule, callback, nodes, testnames);
    },
    []
  );

  /**
   * Add a custom feature test.
   * Replaces Modernizr.addTest(name, fn)
   */
  const addTest = useCallback((name: string, test: () => boolean): void => {
    registry.add(name, test);
    try {
      const result = test();
      setCustomResults((prev) => ({ ...prev, [name]: result }));
    } catch {
      setCustomResults((prev) => ({ ...prev, [name]: false }));
    }
  }, [registry]);

  /**
   * Generate CSS class string for <html> element.
   * Replaces Modernizr's automatic class injection.
   */
  const getCSSClasses = useCallback((): string => {
    return generateFeatureClasses(features);
  }, [features]);

  return useMemo(
    () => ({
      features,
      isDetected: true,
      mq,
      hasEvent,
      testProp: testPropFn,
      testAllProps: testAllPropsFn,
      prefixed: prefixedFn,
      testStyles: testStylesFn,
      addTest,
      customResults,
      getCSSClasses,
    }),
    [
      features,
      mq,
      hasEvent,
      testPropFn,
      testAllPropsFn,
      prefixedFn,
      testStylesFn,
      addTest,
      customResults,
      getCSSClasses,
    ]
  );
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to check a single CSS feature.
 * Simplified access pattern for common use case.
 *
 * @example
 * ```tsx
 * const hasFlexbox = useCSSFeature('flexbox');
 * const has3dTransforms = useCSSFeature('cssTransforms3d');
 * ```
 */
export function useCSSFeature(feature: keyof import('./types').CSSFeatures): boolean {
  const features = useSyncExternalStore(
    featureStore.subscribe,
    featureStore.getSnapshot,
    featureStore.getServerSnapshot
  );
  return features.css[feature];
}

/**
 * Hook to check a single HTML5 feature.
 *
 * @example
 * ```tsx
 * const hasWebGL = useHTML5Feature('webgl');
 * const hasTouch = useHTML5Feature('touch');
 * ```
 */
export function useHTML5Feature(feature: keyof import('./types').HTML5Features): boolean {
  const features = useSyncExternalStore(
    featureStore.subscribe,
    featureStore.getSnapshot,
    featureStore.getServerSnapshot
  );
  return features.html5[feature];
}

// ============================================================================
// Media Query Hook (using useSyncExternalStore)
// ============================================================================

/**
 * Media query store per query string.
 * Uses useSyncExternalStore for responsive state without setState-in-effect.
 */
const mediaQueryStores = new Map<string, {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
}>();

function getMediaQueryStore(mq: string) {
  if (!mediaQueryStores.has(mq)) {
    const listeners = new Set<() => void>();
    let mqlRef: MediaQueryList | null = null;
    let handlerRef: ((e: MediaQueryListEvent) => void) | null = null;
    let cachedResult = false;

    const store = {
      subscribe: (listener: () => void): (() => void) => {
        // Set up matchMedia listener on first subscription
        if (listeners.size === 0 && typeof window !== 'undefined' && window.matchMedia) {
          mqlRef = window.matchMedia(mq);
          cachedResult = mqlRef.matches;
          handlerRef = (e: MediaQueryListEvent) => {
            cachedResult = e.matches;
            for (const l of listeners) l();
          };
          mqlRef.addEventListener('change', handlerRef);
        }
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
          // Clean up when no more listeners
          if (listeners.size === 0 && mqlRef && handlerRef) {
            mqlRef.removeEventListener('change', handlerRef);
            mqlRef = null;
            handlerRef = null;
          }
        };
      },
      getSnapshot: (): boolean => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        if (!mqlRef) {
          mqlRef = window.matchMedia(mq);
          cachedResult = mqlRef.matches;
        }
        return cachedResult;
      },
      getServerSnapshot: (): boolean => false,
    };

    mediaQueryStores.set(mq, store);
  }
  return mediaQueryStores.get(mq)!;
}

/**
 * Hook to test a media query.
 * Simplified access for responsive design patterns.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(mediaQuery: string): boolean {
  const store = getMediaQueryStore(mediaQuery);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * Hook to check if touch events are supported.
 * Common pattern for touch/non-touch UI differentiation.
 *
 * @example
 * ```tsx
 * const isTouch = useTouchSupport();
 * // Use for hover behavior: only show tooltips on non-touch
 * ```
 */
export function useTouchSupport(): boolean {
  return useHTML5Feature('touch');
}

/**
 * Hook to check if WebGL is available.
 * Common pattern for chart rendering fallbacks.
 *
 * @example
 * ```tsx
 * const hasWebGL = useWebGLSupport();
 * // Use Canvas2D fallback if WebGL is not available
 * ```
 */
export function useWebGLSupport(): boolean {
  return useHTML5Feature('webgl');
}

// ============================================================================
// Online Status Hook (using useSyncExternalStore)
// ============================================================================

const onlineListeners = new Set<() => void>();
let onlineHandlerInstalled = false;
let onlineCachedResult = true;

function installOnlineHandlers(): void {
  if (onlineHandlerInstalled || typeof window === 'undefined') return;
  onlineHandlerInstalled = true;
  onlineCachedResult = navigator.onLine;

  const handleOnline = () => {
    onlineCachedResult = true;
    for (const l of onlineListeners) l();
  };
  const handleOffline = () => {
    onlineCachedResult = false;
    for (const l of onlineListeners) l();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

function subscribeOnline(listener: () => void): () => void {
  installOnlineHandlers();
  onlineListeners.add(listener);
  return () => {
    onlineListeners.delete(listener);
  };
}

function getOnlineSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

function getOnlineServerSnapshot(): boolean {
  return true;
}

/**
 * Hook to detect online/offline status.
 * Not in original Modernizr, but commonly needed alongside feature detection.
 *
 * @example
 * ```tsx
 * const isOnline = useOnlineStatus();
 * ```
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);
}
