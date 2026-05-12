/**
 * IMS Modernizr - Feature Detection Types
 *
 * Replaces Modernizr v2.6.2 global feature detection with
 * TypeScript-friendly, React-compatible feature detection system.
 *
 * Modernizr provided browser feature detection via:
 * - `window.Modernizr.<feature>` boolean checks
 * - CSS classes on `<html>` element (e.g., "flexbox no-webgl")
 * - `Modernizr.mq()` for media query tests
 * - `Modernizr.hasEvent()` for event support
 * - `Modernizr.testProp()` / `Modernizr.testAllProps()` for CSS property tests
 * - `Modernizr.prefixed()` for vendor-prefixed properties
 * - `Modernizr.addTest()` for custom feature tests
 *
 * In modern React/Next.js:
 * - All Modernizr v2.6.2 features are natively supported in modern browsers
 * - Feature detection is done via CSS @supports, direct property checks, and matchMedia
 * - React hooks provide reactive feature detection
 * - No need for HTML5 Shiv, Function.prototype.bind polyfill, or IE workarounds
 */

// ============================================================================
// CSS Feature Detection Results
// ============================================================================

/**
 * CSS feature support flags.
 * Replaces Modernizr CSS tests: flexbox, flexboxlegacy, rgba, hsla,
 * multiplebgs, backgroundsize, borderimage, borderradius, boxshadow,
 * textshadow, opacity, cssanimations, csscolumns, cssgradients,
 * cssreflections, csstransforms, csstransforms3d, csstransitions,
 * fontface, generatedcontent
 */
export interface CSSFeatures {
  /** CSS Flexbox (modern spec: flex-wrap) - Modernizr.flexbox */
  flexbox: boolean;
  /** CSS Flexbox (legacy spec: box-direction) - Modernizr.flexboxlegacy */
  flexboxLegacy: boolean;
  /** CSS rgba() color - Modernizr.rgba */
  rgba: boolean;
  /** CSS hsla() color - Modernizr.hsla */
  hsla: boolean;
  /** CSS multiple backgrounds - Modernizr.multiplebgs */
  multipleBgs: boolean;
  /** CSS background-size - Modernizr.backgroundsize */
  backgroundSize: boolean;
  /** CSS border-image - Modernizr.borderimage */
  borderImage: boolean;
  /** CSS border-radius - Modernizr.borderradius */
  borderRadius: boolean;
  /** CSS box-shadow - Modernizr.boxshadow */
  boxShadow: boolean;
  /** CSS text-shadow - Modernizr.textshadow */
  textShadow: boolean;
  /** CSS opacity - Modernizr.opacity */
  opacity: boolean;
  /** CSS animations (@keyframes) - Modernizr.cssanimations */
  cssAnimations: boolean;
  /** CSS multi-column layout - Modernizr.csscolumns */
  cssColumns: boolean;
  /** CSS gradients (linear/radial) - Modernizr.cssgradients */
  cssGradients: boolean;
  /** CSS box-reflect - Modernizr.cssreflections */
  cssReflections: boolean;
  /** CSS 2D transforms - Modernizr.csstransforms */
  cssTransforms: boolean;
  /** CSS 3D transforms - Modernizr.csstransforms3d */
  cssTransforms3d: boolean;
  /** CSS transitions - Modernizr.csstransitions */
  cssTransitions: boolean;
  /** CSS @font-face - Modernizr.fontface */
  fontFace: boolean;
  /** CSS generated content (::before/::after) - Modernizr.generatedcontent */
  generatedContent: boolean;
}

// ============================================================================
// HTML5 Feature Detection Results
// ============================================================================

/**
 * HTML5 API feature support flags.
 * Replaces Modernizr HTML5 tests: canvas, canvastext, webgl, touch,
 * geolocation, postmessage, websqldatabase, indexedDB, hashchange,
 * history, draganddrop, websockets, localstorage, sessionstorage,
 * webworkers, applicationcache
 */
export interface HTML5Features {
  /** Canvas 2D context - Modernizr.canvas */
  canvas: boolean;
  /** Canvas text fillText - Modernizr.canvastext */
  canvasText: boolean;
  /** WebGL - Modernizr.webgl */
  webgl: boolean;
  /** Touch events - Modernizr.touch */
  touch: boolean;
  /** Geolocation API - Modernizr.geolocation */
  geolocation: boolean;
  /** window.postMessage - Modernizr.postmessage */
  postMessage: boolean;
  /** Web SQL Database (deprecated) - Modernizr.websqldatabase */
  webSqlDatabase: boolean;
  /** IndexedDB - Modernizr.indexedDB */
  indexedDB: boolean;
  /** hashchange event - Modernizr.hashchange */
  hashChange: boolean;
  /** History API (pushState) - Modernizr.history */
  history: boolean;
  /** Drag and Drop API - Modernizr.draganddrop */
  dragAndDrop: boolean;
  /** WebSocket - Modernizr.websockets */
  webSockets: boolean;
  /** localStorage - Modernizr.localstorage */
  localStorage: boolean;
  /** sessionStorage - Modernizr.sessionstorage */
  sessionStorage: boolean;
  /** Web Workers - Modernizr.webworkers */
  webWorkers: boolean;
  /** Application Cache (deprecated) - Modernizr.applicationcache */
  applicationCache: boolean;
}

// ============================================================================
// SVG Feature Detection Results
// ============================================================================

/**
 * SVG feature support flags.
 * Replaces Modernizr SVG tests: svg, inlinesvg, smil, svgclippaths
 */
export interface SVGFeatures {
  /** SVG support - Modernizr.svg */
  svg: boolean;
  /** Inline SVG in HTML - Modernizr.inlinesvg */
  inlineSvg: boolean;
  /** SVG SMIL animation - Modernizr.smil */
  smil: boolean;
  /** SVG clip paths - Modernizr.svgclippaths */
  svgClipPaths: boolean;
}

// ============================================================================
// Media Feature Detection Results
// ============================================================================

/**
 * Media feature support flags.
 * Replaces Modernizr video/audio tests with codec support
 */
export interface MediaFeatures {
  /** HTML5 video element - Modernizr.video */
  video: boolean;
  /** Video: Ogg/Theora codec support - Modernizr.video.ogg */
  videoOgg: string;
  /** Video: H.264 codec support - Modernizr.video.h264 */
  videoH264: string;
  /** Video: WebM codec support - Modernizr.video.webm */
  videoWebm: string;
  /** HTML5 audio element - Modernizr.audio */
  audio: boolean;
  /** Audio: Ogg/Vorbis codec support - Modernizr.audio.ogg */
  audioOgg: string;
  /** Audio: MP3 codec support - Modernizr.audio.mp3 */
  audioMp3: string;
  /** Audio: WAV codec support - Modernizr.audio.wav */
  audioWav: string;
  /** Audio: M4A/AAC codec support - Modernizr.audio.m4a */
  audioM4a: string;
}

// ============================================================================
// Input Feature Detection Results
// ============================================================================

/**
 * HTML5 input attribute support flags.
 * Replaces Modernizr.input object
 */
export interface InputAttributes {
  autocomplete: boolean;
  autofocus: boolean;
  list: boolean;
  placeholder: boolean;
  max: boolean;
  min: boolean;
  multiple: boolean;
  pattern: boolean;
  required: boolean;
  step: boolean;
}

/**
 * HTML5 input type support flags.
 * Replaces Modernizr.inputtypes object
 */
export interface InputTypes {
  search: boolean;
  tel: boolean;
  url: boolean;
  email: boolean;
  datetime: boolean;
  date: boolean;
  month: boolean;
  week: boolean;
  time: boolean;
  datetimeLocal: boolean;
  number: boolean;
  range: boolean;
  color: boolean;
}

// ============================================================================
// Aggregated Feature Detection Results
// ============================================================================

/**
 * Complete feature detection results.
 * Replaces the entire `window.Modernizr` object.
 */
export interface FeatureDetectionResult {
  /** CSS feature support */
  css: CSSFeatures;
  /** HTML5 API feature support */
  html5: HTML5Features;
  /** SVG feature support */
  svg: SVGFeatures;
  /** Media feature support */
  media: MediaFeatures;
  /** Input attribute support */
  inputAttrs: InputAttributes;
  /** Input type support */
  inputTypes: InputTypes;
}

// ============================================================================
// Custom Test Definition
// ============================================================================

/**
 * Custom feature test definition.
 * Replaces Modernizr.addTest(featureName, testFn)
 */
export interface CustomFeatureTest {
  /** Feature name (lowercase) */
  name: string;
  /** Test function that returns boolean */
  test: () => boolean;
  /** Optional description */
  description?: string;
}

// ============================================================================
// CSS Class Generation
// ============================================================================

/**
 * Options for CSS class generation.
 * Replaces Modernizr's automatic HTML class injection.
 */
export interface CSSClassOptions {
  /** Whether to generate CSS classes (default: true) */
  enabled: boolean;
  /** Prefix for unsupported features (default: "no-") */
  noPrefix: string;
  /** Whether to add "js" class (default: true) */
  addJsClass: boolean;
}

// ============================================================================
// Feature Provider Props
// ============================================================================

/**
 * Props for the FeatureProvider component.
 */
export interface FeatureProviderProps {
  /** Child elements */
  children: React.ReactNode;
  /** Whether to inject CSS classes on <html> element (default: true) */
  injectClasses?: boolean;
  /** Custom feature tests to add */
  customTests?: CustomFeatureTest[];
  /** Callback when feature detection is complete */
  onDetected?: (result: FeatureDetectionResult) => void;
}

// ============================================================================
// Utility Function Types
// ============================================================================

/**
 * Media query test function.
 * Replaces Modernizr.mq(mediaQuery)
 */
export type MediaQueryTest = (mq: string) => boolean;

/**
 * Event support test function.
 * Replaces Modernizr.hasEvent(eventName, element)
 */
export type HasEventTest = (eventName: string, element?: HTMLElement) => boolean;

/**
 * CSS property test function.
 * Replaces Modernizr.testProp(propName)
 */
export type TestPropFn = (propName: string) => boolean;

/**
 * CSS property test function (with vendor prefixes).
 * Replaces Modernizr.testAllProps(propName)
 */
export type TestAllPropsFn = (propName: string) => string | boolean;

/**
 * Vendor-prefixed property lookup.
 * Replaces Modernizr.prefixed(prop, obj, elem)
 */
export type PrefixedFn = (
  prop: string,
  obj?: Record<string, unknown>,
  elem?: HTMLElement
) => string | boolean | (() => void) | undefined;

/**
 * Custom style injection test.
 * Replaces Modernizr.testStyles(rule, callback, nodes, testnames)
 */
export type TestStylesFn = (
  rule: string,
  callback: (node: HTMLElement, rule: string) => void,
  nodes?: number,
  testnames?: string[]
) => boolean;

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Return type for the useFeatureDetection hook.
 * Provides both the detection results and utility functions.
 */
export interface UseFeatureDetectionReturn {
  /** Complete feature detection results */
  features: FeatureDetectionResult;
  /** Whether detection has been completed */
  isDetected: boolean;
  /** Test a media query - replaces Modernizr.mq() */
  mq: MediaQueryTest;
  /** Check event support - replaces Modernizr.hasEvent() */
  hasEvent: HasEventTest;
  /** Test a CSS property - replaces Modernizr.testProp() */
  testProp: TestPropFn;
  /** Test CSS property with vendor prefixes - replaces Modernizr.testAllProps() */
  testAllProps: TestAllPropsFn;
  /** Get vendor-prefixed property name - replaces Modernizr.prefixed() */
  prefixed: PrefixedFn;
  /** Test with injected styles - replaces Modernizr.testStyles() */
  testStyles: TestStylesFn;
  /** Add a custom feature test - replaces Modernizr.addTest() */
  addTest: (name: string, test: () => boolean) => void;
  /** Custom test results (keyed by name) */
  customResults: Record<string, boolean>;
  /** Generate CSS class string for html element */
  getCSSClasses: () => string;
}
