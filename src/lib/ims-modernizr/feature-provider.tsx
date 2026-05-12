/**
 * IMS Modernizr - FeatureProvider Component
 *
 * React context provider that makes feature detection results available
 * to all child components. Optionally injects CSS classes on the <html>
 * element, replicating Modernizr's original behavior.
 *
 * Replaces:
 * - `window.Modernizr` global object (now via React context)
 * - Modernizr's automatic CSS class injection on <html>
 * - Modernizr.addTest() global mutation
 *
 * Usage:
 * ```tsx
 * // In root layout:
 * <FeatureProvider injectClasses>
 *   <App />
 * </FeatureProvider>
 *
 * // In any child component:
 * const { features } = useFeatureContext();
 * if (features.css.flexbox) { ... }
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
  FeatureDetectionResult,
  FeatureProviderProps,
  UseFeatureDetectionReturn,
} from './types';
import {
  detectAllFeatures,
  testMediaQuery,
  testEventSupport,
  testProp,
  testAllProps,
  getPrefixed,
  testStyles,
  CustomTestRegistry,
  generateFeatureClasses,
} from './feature-tests';

// ============================================================================
// Feature Detection Store (for useSyncExternalStore)
// ============================================================================

class FeatureDetectionStore {
  private result: FeatureDetectionResult;
  private listeners = new Set<() => void>();

  constructor() {
    this.result = detectAllFeatures();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): FeatureDetectionResult => {
    return this.result;
  };

  getServerSnapshot = (): FeatureDetectionResult => {
    return detectAllFeatures();
  };

  refresh(): void {
    this.result = detectAllFeatures();
    for (const listener of this.listeners) {
      listener();
    }
  }
}

// Singleton store instance
const globalFeatureStore = new FeatureDetectionStore();

// ============================================================================
// Context
// ============================================================================

/**
 * Feature detection context.
 * Provides the same data as `window.Modernizr` but through React context.
 */
const FeatureContext = createContext<UseFeatureDetectionReturn | null>(null);

/**
 * Display name for debugging
 */
FeatureContext.displayName = 'IMSFeatureContext';

// ============================================================================
// Provider
// ============================================================================

/**
 * Feature detection provider component.
 *
 * Wraps the application and provides feature detection results via context.
 * Optionally injects CSS classes on the <html> element like original Modernizr.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * import { FeatureProvider } from '@/lib/ims-modernizr';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FeatureProvider injectClasses>
 *           {children}
 *         </FeatureProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function FeatureProvider({
  children,
  injectClasses = true,
  customTests = [],
  onDetected,
}: FeatureProviderProps) {
  // Registry for custom tests (created once)
  const [registry] = useState(() => new CustomTestRegistry());

  // Compute custom results from tests (derived from customTests, not from effect)
  const customResults = useMemo(() => {
    // Register all custom tests and run them
    for (const test of customTests) {
      registry.add(test.name, test.test, test.description);
    }
    return registry.runAll();
  }, [customTests, registry]);

  // Use useSyncExternalStore for feature detection
  const features = useSyncExternalStore(
    globalFeatureStore.subscribe,
    globalFeatureStore.getSnapshot,
    globalFeatureStore.getServerSnapshot
  );

  // Inject CSS classes on <html> element (DOM side effect, valid use of effect)
  useEffect(() => {
    if (!injectClasses || typeof document === 'undefined') return;

    const htmlEl = document.documentElement;
    if (!htmlEl) return;

    const featureClasses = generateFeatureClasses(features);

    // Remove "no-js" class (like original Modernizr)
    const existingClasses = htmlEl.className.replace(/(^|\s)no-js(\s|$)/, '$1$2');

    // Remove any previous feature classes
    const cleanedClasses = existingClasses
      .split(/\s+/)
      .filter((cls) => {
        return (
          !cls.match(/^(no-)?(flexbox|flexboxlegacy|rgba|hsla|multiplebgs|backgroundsize|borderimage|borderradius|boxshadow|textshadow|opacity|cssanimations|csscolumns|cssgradients|cssreflections|csstransforms|csstransforms3d|csstransitions|fontface|generatedcontent|canvas|canvastext|webgl|touch|geolocation|postmessage|websqldatabase|indexeddb|hashchange|history|draganddrop|websockets|localstorage|sessionstorage|webworkers|applicationcache|svg|inlinesvg|smil|svgclippaths)$/) &&
          cls !== 'js'
        );
      })
      .join(' ');

    htmlEl.className = (cleanedClasses + ' ' + featureClasses).trim();
  }, [injectClasses, features]);

  // Notify on detection complete
  useEffect(() => {
    if (onDetected) {
      onDetected(features);
    }
  }, [onDetected, features]);

  // Utility functions
  const mq = useCallback((mediaQuery: string): boolean => {
    return testMediaQuery(mediaQuery);
  }, []);

  const hasEvent = useCallback((eventName: string, element?: HTMLElement): boolean => {
    return testEventSupport(eventName, element);
  }, []);

  const testPropFn = useCallback((propName: string): boolean => {
    return testProp(propName);
  }, []);

  const testAllPropsFn = useCallback((propName: string): string | boolean => {
    return testAllProps(propName);
  }, []);

  const prefixedFn = useCallback(
    (
      prop: string,
      obj?: Record<string, unknown>,
      elem?: HTMLElement
    ): string | boolean | (() => void) | undefined => {
      return getPrefixed(prop, obj, elem);
    },
    []
  );

  const testStylesFn = useCallback(
    (
      rule: string,
      callback: (node: HTMLElement, rule: string) => void,
      nodes?: number,
      testnames?: string[]
    ): boolean => {
      return testStyles(rule, callback, nodes, testnames);
    },
    []
  );

  const addTest = useCallback((name: string, test: () => boolean): void => {
    registry.add(name, test);
  }, [registry]);

  const getCSSClasses = useCallback((): string => {
    return generateFeatureClasses(features);
  }, [features]);

  const value = useMemo<UseFeatureDetectionReturn>(
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

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

/**
 * Hook to access feature detection results from context.
 * Must be used within a FeatureProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { features, mq } = useFeatureContext();
 *
 *   return features.css.flexbox ? <FlexLayout /> : <BlockLayout />;
 * }
 * ```
 */
export function useFeatureContext(): UseFeatureDetectionReturn {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error(
      'useFeatureContext must be used within a <FeatureProvider>. ' +
      'Wrap your component tree with <FeatureProvider>.'
    );
  }
  return context;
}

/**
 * Hook to safely access feature detection, falling back to standalone detection.
 * Use this when you're not sure if a FeatureProvider is available.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { features } = useFeatureDetectionSafe();
 *   // Works with or without FeatureProvider
 * }
 * ```
 */
export function useFeatureDetectionSafe(): UseFeatureDetectionReturn {
  const context = useContext(FeatureContext);

  // Use the global store directly as fallback (same as standalone hook)
  const fallbackFeatures = useSyncExternalStore(
    globalFeatureStore.subscribe,
    globalFeatureStore.getSnapshot,
    globalFeatureStore.getServerSnapshot
  );

  return useMemo(() => {
    if (context) return context;

    // Build a minimal fallback return matching the interface
    return {
      features: fallbackFeatures,
      isDetected: true,
      mq: testMediaQuery,
      hasEvent: testEventSupport,
      testProp,
      testAllProps,
      prefixed: getPrefixed,
      testStyles,
      addTest: () => {
        // No-op in safe fallback mode
      },
      customResults: {},
      getCSSClasses: () => generateFeatureClasses(fallbackFeatures),
    };
  }, [context, fallbackFeatures]);
}
