/**
 * IMS Modernizr - Feature Detection System
 *
 * Modern replacement for Modernizr v2.6.2.
 *
 * Modernizr provided browser feature detection by:
 * 1. Testing CSS3/HTML5 feature support
 * 2. Adding CSS classes to <html> element (e.g., "flexbox no-webgl")
 * 3. Exposing results on `window.Modernizr` object
 * 4. Providing utility methods: mq(), hasEvent(), testProp(), testAllProps(), prefixed(), addTest(), testStyles()
 * 5. HTML5 Shiv polyfill for old IE browsers
 *
 * This module provides the same capabilities using modern APIs:
 * - CSS.supports() instead of DOM injection for CSS tests
 * - matchMedia() instead of injectElementWithStyles for media queries
 * - React hooks and context instead of global object mutation
 * - No HTML5 Shiv (irrelevant for modern browsers)
 * - No Function.prototype.bind polyfill (native since ES5)
 *
 * ============================================================================
 * MIGRATION GUIDE
 * ============================================================================
 *
 * Old (jQuery + Modernizr)              → New (React + IMS Modernizr)
 * ─────────────────────────────────────────────────────────────────────
 * window.Modernizr.flexbox              → features.css.flexbox
 * window.Modernizr.canvas              → features.html5.canvas
 * window.Modernizr.webgl               → features.html5.webgl
 * window.Modernizr.touch               → features.html5.touch
 * window.Modernizr.svg                 → features.svg.svg
 * window.Modernizr.video               → features.media.video
 * window.Modernizr.input.placeholder   → features.inputAttrs.placeholder
 * window.Modernizr.inputtypes.email    → features.inputTypes.email
 * Modernizr.mq('(min-width:768px)')    → mq('(min-width:768px)')
 * Modernizr.hasEvent('click')          → hasEvent('click')
 * Modernizr.testProp('pointerEvents')  → testProp('pointerEvents')
 * Modernizr.testAllProps('boxSizing')  → testAllProps('boxSizing')
 * Modernizr.prefixed('transform')      → prefixed('transform')
 * Modernizr.addTest('my', fn)          → addTest('my', fn)
 * Modernizr.testStyles(rule, cb)       → testStyles(rule, cb)
 * $('html').hasClass('no-flexbox')     → !features.css.flexbox
 * CSS: .no-webgl .chart-fallback       → Conditional rendering in JSX
 *
 * ============================================================================
 * USAGE PATTERNS
 * ============================================================================
 *
 * 1. Standalone Hook (no provider needed):
 *    ```tsx
 *    import { useFeatureDetection } from '@/lib/ims-modernizr';
 *    function MyComponent() {
 *      const { features, mq } = useFeatureDetection();
 *      return features.css.flexbox ? <FlexLayout /> : <Fallback />;
 *    }
 *    ```
 *
 * 2. Context Provider (recommended for app-wide use):
 *    ```tsx
 *    import { FeatureProvider, useFeatureContext } from '@/lib/ims-modernizr';
 *    // In layout:
 *    <FeatureProvider injectClasses>
 *      <App />
 *    </FeatureProvider>
 *    // In components:
 *    const { features } = useFeatureContext();
 *    ```
 *
 * 3. Convenience Hooks:
 *    ```tsx
 *    import { useCSSFeature, useMediaQuery, useTouchSupport } from '@/lib/ims-modernizr';
 *    const hasFlexbox = useCSSFeature('flexbox');
 *    const isMobile = useMediaQuery('(max-width: 768px)');
 *    const isTouch = useTouchSupport();
 *    ```
 *
 * 4. Direct Function Calls (no React):
 *    ```ts
 *    import { detectAllFeatures, testMediaQuery } from '@/lib/ims-modernizr';
 *    const features = detectAllFeatures();
 *    const isMobile = testMediaQuery('(max-width: 768px)');
 *    ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  CSSFeatures,
  HTML5Features,
  SVGFeatures,
  MediaFeatures,
  InputAttributes,
  InputTypes,
  FeatureDetectionResult,
  CustomFeatureTest,
  CSSClassOptions,
  FeatureProviderProps,
  UseFeatureDetectionReturn,
  MediaQueryTest,
  HasEventTest,
  TestPropFn,
  TestAllPropsFn,
  PrefixedFn,
  TestStylesFn,
} from './types';

// ============================================================================
// Feature Detection Functions (can be used without React)
// ============================================================================

export {
  /** Detect all CSS feature support */
  detectCSSFeatures,
  /** Detect all HTML5 API feature support */
  detectHTML5Features,
  /** Detect SVG feature support */
  detectSVGFeatures,
  /** Detect media codec support */
  detectMediaFeatures,
  /** Detect HTML5 input attribute support */
  detectInputAttributes,
  /** Detect HTML5 input type support */
  detectInputTypes,
  /** Run all feature detection tests */
  detectAllFeatures,
  /** Test a CSS media query - replaces Modernizr.mq() */
  testMediaQuery,
  /** Check event support - replaces Modernizr.hasEvent() */
  testEventSupport,
  /** Test CSS property support - replaces Modernizr.testProp() */
  testProp,
  /** Test CSS property with vendor prefixes - replaces Modernizr.testAllProps() */
  testAllProps,
  /** Get vendor-prefixed property name - replaces Modernizr.prefixed() */
  getPrefixed,
  /** Test with injected styles - replaces Modernizr.testStyles() */
  testStyles,
  /** Generate CSS class string from feature results */
  generateFeatureClasses,
  /** Custom test registry - replaces Modernizr.addTest() */
  CustomTestRegistry,
} from './feature-tests';

// ============================================================================
// React Hooks
// ============================================================================

export {
  /** Main feature detection hook (standalone, no provider needed) */
  useFeatureDetection,
  /** Check a single CSS feature */
  useCSSFeature,
  /** Check a single HTML5 feature */
  useHTML5Feature,
  /** Test a media query with live updates */
  useMediaQuery,
  /** Check touch support */
  useTouchSupport,
  /** Check WebGL support */
  useWebGLSupport,
  /** Check online/offline status */
  useOnlineStatus,
} from './use-feature-detection';

// ============================================================================
// React Context Provider
// ============================================================================

export {
  /** Feature detection context provider */
  FeatureProvider,
  /** Access feature detection from context */
  useFeatureContext,
  /** Safely access feature detection (with or without provider) */
  useFeatureDetectionSafe,
} from './feature-provider';
