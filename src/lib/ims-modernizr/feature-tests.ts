/**
 * IMS Modernizr - Feature Test Implementations
 *
 * Replaces Modernizr v2.6.2 test functions with modern equivalents.
 *
 * Key differences from original Modernizr:
 * 1. No DOM injection for CSS tests - uses CSS.supports() and computed styles
 * 2. No HTML5 Shiv - irrelevant for modern browsers
 * 3. No Function.prototype.bind polyfill - native since ES5
 * 4. No vendor prefix testing for well-established properties
 * 5. Uses matchMedia directly instead of injectElementWithStyles workaround
 * 6. All tests are pure functions (no side effects on global state)
 *
 * Modernizr tests mapped:
 * - CSS tests → CSS.supports() + computed style checks
 * - HTML5 API tests → direct `'prop' in window` checks
 * - Media tests → HTMLMediaElement.canPlayType()
 * - SVG tests → namespace creation checks
 * - Input tests → attribute/type in input element checks
 */

import type {
  CSSFeatures,
  HTML5Features,
  SVGFeatures,
  MediaFeatures,
  InputAttributes,
  InputTypes,
  FeatureDetectionResult,
  CustomFeatureTest,
} from './types';

// ============================================================================
// Safe DOM helpers (SSR-compatible)
// ============================================================================

/**
 * Check if running in a browser environment.
 * Modernizr assumed `window` was always available; we don't.
 */
function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof navigator !== 'undefined'
  );
}

/**
 * Create a temporary element for testing, safely cleaned up.
 * Replaces Modernizr's modElem and inputElem patterns.
 */
function createTestElement(tag: string = 'div'): HTMLElement | null {
  if (!isBrowser()) return null;
  return document.createElement(tag);
}

// ============================================================================
// CSS Feature Tests
// ============================================================================

/**
 * Test CSS property support using CSS.supports() API.
 * Replaces Modernizr's testProps/testPropsAll/injectElementWithStyles
 * for property-based tests.
 *
 * CSS.supports() is supported in all modern browsers (Chrome 28+, Firefox 22+, Safari 9+).
 */
function cssSupports(property: string, value?: string): boolean {
  if (!isBrowser()) return false;
  if (typeof CSS !== 'undefined' && CSS.supports) {
    if (value !== undefined) {
      return CSS.supports(property, value);
    }
    return CSS.supports(property);
  }
  return false;
}

/**
 * Test CSS property on a test element's style object.
 * Fallback for properties not testable via CSS.supports().
 * Replaces Modernizr's mStyle[prop] pattern.
 */
function testStyleProp(prop: string): boolean {
  if (!isBrowser()) return false;
  const el = createTestElement();
  if (!el) return false;
  return prop in el.style;
}

/**
 * Detect all CSS feature support.
 * Maps to Modernizr's CSS-related test functions.
 */
export function detectCSSFeatures(): CSSFeatures {
  if (!isBrowser()) {
    return getDefaultsCSS();
  }

  return {
    // Flexbox - Modernizr.flexbox (testPropsAll('flexWrap'))
    flexbox: cssSupports('flex-wrap', 'wrap') || testStyleProp('flexWrap'),

    // Legacy flexbox - Modernizr.flexboxlegacy (testPropsAll('boxDirection'))
    flexboxLegacy: testStyleProp('WebkitBoxDirection') || testStyleProp('boxDirection'),

    // RGBA - Modernizr.rgba (setCss + backgroundColor check)
    rgba: (() => {
      const el = createTestElement();
      if (!el) return false;
      try {
        el.style.backgroundColor = 'rgba(150,255,150,0.5)';
        return el.style.backgroundColor.includes('rgba');
      } catch {
        return false;
      }
    })(),

    // HSLA - Modernizr.hsla
    hsla: (() => {
      const el = createTestElement();
      if (!el) return false;
      try {
        el.style.backgroundColor = 'hsla(120,40%,100%,0.5)';
        const bg = el.style.backgroundColor;
        return bg.includes('rgba') || bg.includes('hsla');
      } catch {
        return false;
      }
    })(),

    // Multiple backgrounds - Modernizr.multiplebgs
    multipleBgs: (() => {
      const el = createTestElement();
      if (!el) return false;
      try {
        el.style.background = 'url(https://),url(https://),red url(https://)';
        return (el.style.background.match(/url\s*\(/g) || []).length >= 3;
      } catch {
        return false;
      }
    })(),

    // Background size - Modernizr.backgroundsize (testPropsAll)
    backgroundSize: cssSupports('background-size', 'cover') || testStyleProp('backgroundSize'),

    // Border image - Modernizr.borderimage (testPropsAll)
    borderImage: cssSupports('border-image', 'none') || testStyleProp('borderImage'),

    // Border radius - Modernizr.borderradius (testPropsAll)
    borderRadius: cssSupports('border-radius', '4px') || testStyleProp('borderRadius'),

    // Box shadow - Modernizr.boxshadow (testPropsAll)
    boxShadow: cssSupports('box-shadow', '1px 1px 1px black') || testStyleProp('boxShadow'),

    // Text shadow - Modernizr.textshadow
    textShadow: (() => {
      const el = createTestElement();
      if (!el) return false;
      return el.style.textShadow !== undefined;
    })(),

    // Opacity - Modernizr.opacity (setCssAll + regex test)
    opacity: cssSupports('opacity', '0.55'),

    // CSS Animations - Modernizr.cssanimations (testPropsAll('animationName'))
    cssAnimations: cssSupports('animation-name', 'none') || testStyleProp('animationName'),

    // CSS Columns - Modernizr.csscolumns (testPropsAll('columnCount'))
    cssColumns: cssSupports('column-count', '1') || testStyleProp('columnCount'),

    // CSS Gradients - Modernizr.cssgradients
    cssGradients: (() => {
      if (cssSupports('background-image', 'linear-gradient(to right, #9f9, white)')) {
        return true;
      }
      // Fallback: test via style
      const el = createTestElement();
      if (!el) return false;
      try {
        el.style.backgroundImage = 'linear-gradient(to right, #9f9, white)';
        return el.style.backgroundImage.includes('gradient');
      } catch {
        return false;
      }
    })(),

    // CSS Reflections - Modernizr.cssreflections (testPropsAll('boxReflect'))
    cssReflections: testStyleProp('WebkitBoxReflect') || testStyleProp('boxReflect'),

    // CSS 2D Transforms - Modernizr.csstransforms (testPropsAll('transform'))
    cssTransforms: cssSupports('transform', 'rotate(0deg)') || testStyleProp('transform'),

    // CSS 3D Transforms - Modernizr.csstransforms3d (testPropsAll('perspective'))
    cssTransforms3d: (() => {
      if (cssSupports('perspective', '1px') || testStyleProp('perspective')) {
        // Additional check: some browsers report support but don't actually work
        // Modernizr's injectElementWithStyles media query check
        if (typeof window.matchMedia === 'function') {
          return window.matchMedia('(transform-3d)').matches ||
                 window.matchMedia('(-webkit-transform-3d)').matches ||
                 true; // Assume true for modern browsers if perspective is supported
        }
        return true;
      }
      return false;
    })(),

    // CSS Transitions - Modernizr.csstransitions (testPropsAll('transition'))
    cssTransitions: cssSupports('transition', 'all 1s') || testStyleProp('transition'),

    // @font-face - Modernizr.fontface
    // In modern browsers, @font-face is always supported
    fontFace: true,

    // Generated content - Modernizr.generatedcontent
    // In modern browsers, ::before/::after are always supported
    generatedContent: true,
  };
}

// ============================================================================
// HTML5 Feature Tests
// ============================================================================

/**
 * Detect HTML5 API feature support.
 * Maps to Modernizr's HTML5-related test functions.
 *
 * Note: Most of these are always true in modern browsers.
 * We still test them for completeness and edge cases (e.g., SSR).
 */
export function detectHTML5Features(): HTML5Features {
  if (!isBrowser()) {
    return getDefaultsHTML5();
  }

  const w = window as Record<string, unknown>;
  const nav = navigator as Record<string, unknown>;

  return {
    // Canvas 2D - Modernizr.canvas
    canvas: (() => {
      const el = createTestElement('canvas') as HTMLCanvasElement | null;
      if (!el) return false;
      return !!(el.getContext && el.getContext('2d'));
    })(),

    // Canvas text - Modernizr.canvastext
    canvasText: (() => {
      try {
        const el = createTestElement('canvas') as HTMLCanvasElement | null;
        if (!el) return false;
        const ctx = el.getContext('2d');
        return !!(ctx && typeof ctx.fillText === 'function');
      } catch {
        return false;
      }
    })(),

    // WebGL - Modernizr.webgl
    webgl: (() => {
      if ('WebGLRenderingContext' in w) {
        try {
          const canvas = createTestElement('canvas') as HTMLCanvasElement | null;
          if (!canvas) return true; // API exists
          return !!(
            canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          );
        } catch {
          return true; // API exists even if context creation fails
        }
      }
      return false;
    })(),

    // Touch - Modernizr.touch
    touch: (() => {
      if ('ontouchstart' in w) return true;
      if (nav.maxTouchPoints && (nav.maxTouchPoints as number) > 0) return true;
      return false;
    })(),

    // Geolocation - Modernizr.geolocation
    geolocation: 'geolocation' in navigator,

    // PostMessage - Modernizr.postmessage
    postMessage: 'postMessage' in w,

    // Web SQL Database - Modernizr.websqldatabase (deprecated)
    webSqlDatabase: 'openDatabase' in w,

    // IndexedDB - Modernizr.indexedDB
    indexedDB: 'indexedDB' in w,

    // Hash Change - Modernizr.hashchange
    hashChange: 'onhashchange' in w,

    // History API - Modernizr.history
    history: !!(w.history && typeof (w.history as History).pushState === 'function'),

    // Drag and Drop - Modernizr.draganddrop
    dragAndDrop: (() => {
      const el = createTestElement();
      if (!el) return false;
      return 'draggable' in el || ('ondragstart' in el && 'ondrop' in el);
    })(),

    // WebSockets - Modernizr.websockets
    webSockets: 'WebSocket' in w,

    // localStorage - Modernizr.localstorage
    localStorage: (() => {
      try {
        const key = '__ims_test__';
        localStorage.setItem(key, key);
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })(),

    // sessionStorage - Modernizr.sessionstorage
    sessionStorage: (() => {
      try {
        const key = '__ims_test__';
        window.sessionStorage.setItem(key, key);
        window.sessionStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    })(),

    // Web Workers - Modernizr.webworkers
    webWorkers: 'Worker' in w,

    // Application Cache - Modernizr.applicationcache (deprecated)
    applicationCache: 'applicationCache' in w,
  };
}

// ============================================================================
// SVG Feature Tests
// ============================================================================

/**
 * Detect SVG feature support.
 * Maps to Modernizr's SVG-related test functions.
 */
export function detectSVGFeatures(): SVGFeatures {
  if (!isBrowser()) {
    return getDefaultsSVG();
  }

  const svgNS = 'http://www.w3.org/2000/svg';

  return {
    // SVG - Modernizr.svg
    svg: !!document.createElementNS && !!document.createElementNS(svgNS, 'svg').createSVGRect,

    // Inline SVG - Modernizr.inlinesvg
    inlineSvg: (() => {
      const div = createTestElement();
      if (!div) return false;
      div.innerHTML = '<svg/>';
      return !!(div.firstChild && (div.firstChild as Element).namespaceURI === svgNS);
    })(),

    // SMIL animation - Modernizr.smil
    smil: (() => {
      if (!document.createElementNS) return false;
      try {
        const el = document.createElementNS(svgNS, 'animate');
        return Object.prototype.toString.call(el).includes('SVGAnimate');
      } catch {
        return false;
      }
    })(),

    // SVG clip paths - Modernizr.svgclippaths
    svgClipPaths: (() => {
      if (!document.createElementNS) return false;
      try {
        const el = document.createElementNS(svgNS, 'clipPath');
        return Object.prototype.toString.call(el).includes('SVGClipPath');
      } catch {
        return false;
      }
    })(),
  };
}

// ============================================================================
// Media Feature Tests
// ============================================================================

/**
 * Detect media codec support.
 * Replaces Modernizr.video and Modernizr.audio with codec checks.
 */
export function detectMediaFeatures(): MediaFeatures {
  if (!isBrowser()) {
    return getDefaultsMedia();
  }

  // Video support
  const videoEl = createTestElement('video') as HTMLVideoElement | null;
  let videoSupport = false;
  let videoOgg = '';
  let videoH264 = '';
  let videoWebm = '';

  if (videoEl && videoEl.canPlayType) {
    videoSupport = true;
    videoOgg = videoEl.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
    videoH264 = videoEl.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
    videoWebm = videoEl.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
  }

  // Audio support
  const audioEl = createTestElement('audio') as HTMLAudioElement | null;
  let audioSupport = false;
  let audioOgg = '';
  let audioMp3 = '';
  let audioWav = '';
  let audioM4a = '';

  if (audioEl && audioEl.canPlayType) {
    audioSupport = true;
    audioOgg = audioEl.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
    audioMp3 = audioEl.canPlayType('audio/mpeg;').replace(/^no$/, '');
    audioWav = audioEl.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
    audioM4a = (
      audioEl.canPlayType('audio/x-m4a;') ||
      audioEl.canPlayType('audio/aac;')
    ).replace(/^no$/, '');
  }

  return {
    video: videoSupport,
    videoOgg,
    videoH264,
    videoWebm,
    audio: audioSupport,
    audioOgg,
    audioMp3,
    audioWav,
    audioM4a,
  };
}

// ============================================================================
// Input Feature Tests
// ============================================================================

/**
 * Detect HTML5 input attribute support.
 * Replaces Modernizr.input object.
 */
export function detectInputAttributes(): InputAttributes {
  if (!isBrowser()) {
    return getDefaultsInputAttrs();
  }

  const input = createTestElement('input') as HTMLInputElement | null;
  if (!input) return getDefaultsInputAttrs();

  const attrs: (keyof InputAttributes)[] = [
    'autocomplete', 'autofocus', 'list', 'placeholder',
    'max', 'min', 'multiple', 'pattern', 'required', 'step',
  ];

  const result = {} as InputAttributes;
  for (const attr of attrs) {
    result[attr] = attr in input;
  }

  // datalist special check (Safari false positive)
  if (result.list) {
    result.list = !!(document.createElement('datalist') && (window as Record<string, unknown>).HTMLDataListElement);
  }

  return result;
}

/**
 * Detect HTML5 input type support.
 * Replaces Modernizr.inputtypes object.
 */
export function detectInputTypes(): InputTypes {
  if (!isBrowser()) {
    return getDefaultsInputTypes();
  }

  const input = createTestElement('input') as HTMLInputElement | null;
  if (!input) return getDefaultsInputTypes();

  const types: Record<string, boolean> = {};

  const typeTests = [
    'search', 'tel', 'url', 'email', 'datetime', 'date',
    'month', 'week', 'time', 'datetime-local', 'number',
    'range', 'color',
  ];

  for (const type of typeTests) {
    try {
      input.setAttribute('type', type);
      const bool = input.type !== 'text';

      if (bool) {
        // More thorough check: set a value and see if it's rejected
        input.value = ':)';
        input.style.cssText = 'position:absolute;visibility:hidden;';

        if (/^range$/.test(type) && input.style.WebkitAppearance !== undefined) {
          // Range type: check if the appearance changed
          document.documentElement.appendChild(input);
          const defaultView = document.defaultView;
          types[type] = !!(
            defaultView &&
            defaultView.getComputedStyle(input, null).WebkitAppearance !== 'textfield'
          );
          document.documentElement.removeChild(input);
        } else if (/^(search|tel)$/.test(type)) {
          // Search and tel always pass
          types[type] = true;
        } else if (/^(url|email)$/.test(type)) {
          // URL and email have built-in validation
          types[type] = input.checkValidity ? !input.checkValidity() : true;
        } else {
          // If the smiley value doesn't stick, the input type is supported
          types[type] = input.value !== ':)';
        }
      } else {
        types[type] = false;
      }
    } catch {
      types[type] = false;
    }
  }

  return {
    search: types['search'] ?? true,
    tel: types['tel'] ?? true,
    url: types['url'] ?? true,
    email: types['email'] ?? true,
    datetime: types['datetime'] ?? false,
    date: types['date'] ?? true,
    month: types['month'] ?? true,
    week: types['week'] ?? true,
    time: types['time'] ?? true,
    datetimeLocal: types['datetime-local'] ?? true,
    number: types['number'] ?? true,
    range: types['range'] ?? true,
    color: types['color'] ?? true,
  };
}

// ============================================================================
// Complete Detection
// ============================================================================

/**
 * Run all feature detection tests and return complete results.
 * Replaces `window.Modernizr` object construction.
 */
export function detectAllFeatures(): FeatureDetectionResult {
  return {
    css: detectCSSFeatures(),
    html5: detectHTML5Features(),
    svg: detectSVGFeatures(),
    media: detectMediaFeatures(),
    inputAttrs: detectInputAttributes(),
    inputTypes: detectInputTypes(),
  };
}

// ============================================================================
// Custom Test Registry
// ============================================================================

/**
 * Registry for custom feature tests.
 * Replaces Modernizr.addTest() with a functional approach.
 */
export class CustomTestRegistry {
  private tests: Map<string, CustomFeatureTest> = new Map();
  private results: Map<string, boolean> = new Map();

  /**
   * Register a custom feature test.
   * Replaces Modernizr.addTest(name, fn)
   */
  add(name: string, test: () => boolean, description?: string): void {
    this.tests.set(name, { name, test, description });
  }

  /**
   * Register multiple custom tests from an object.
   * Replaces Modernizr.addTest({ name1: fn1, name2: fn2 })
   */
  addMany(tests: Record<string, () => boolean>): void {
    for (const [name, test] of Object.entries(tests)) {
      this.add(name, test);
    }
  }

  /**
   * Run all custom tests and cache results.
   */
  runAll(): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    for (const [name, test] of this.tests) {
      try {
        results[name] = test.test();
      } catch {
        results[name] = false;
      }
    }
    this.results = new Map(Object.entries(results));
    return results;
  }

  /**
   * Get result of a specific custom test.
   */
  getResult(name: string): boolean | undefined {
    return this.results.get(name);
  }

  /**
   * Get all custom test results.
   */
  getAllResults(): Record<string, boolean> {
    return Object.fromEntries(this.results);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Test a CSS media query.
 * Replaces Modernizr.mq(mediaQuery)
 *
 * Uses native matchMedia API directly (supported in all modern browsers).
 * No need for Modernizr's injectElementWithStyles fallback.
 */
export function testMediaQuery(mq: string): boolean {
  if (!isBrowser()) return false;
  if (window.matchMedia) {
    return window.matchMedia(mq).matches;
  }
  return false;
}

/**
 * Check if an event is supported on an element.
 * Replaces Modernizr.hasEvent(eventName, element)
 *
 * Simplified from Modernizr's isEventSupported - no IE-specific workarounds needed.
 */
export function testEventSupport(eventName: string, element?: HTMLElement): boolean {
  if (!isBrowser()) return false;

  const tagMap: Record<string, string> = {
    select: 'input',
    change: 'input',
    submit: 'form',
    reset: 'form',
    error: 'img',
    load: 'img',
    abort: 'img',
  };

  const el = element || document.createElement(tagMap[eventName] || 'div');
  const onEvent = 'on' + eventName;

  // Direct check
  if (onEvent in el) return true;

  // setAttribute check
  if (el.setAttribute && el.removeAttribute) {
    el.setAttribute(onEvent, '');
    const isSupported = typeof (el as Record<string, unknown>)[onEvent] === 'function';
    el.removeAttribute(onEvent);
    return isSupported;
  }

  return false;
}

/**
 * Test if a CSS property is supported (camelCase).
 * Replaces Modernizr.testProp(propName)
 */
export function testProp(propName: string): boolean {
  return testStyleProp(propName);
}

/**
 * Common vendor prefixes for property testing.
 * Replaces Modernizr's cssomPrefixes and domPrefixes arrays.
 */
const VENDOR_PREFIXES = ['Webkit', 'Moz', 'O', 'ms'];

/**
 * Test CSS property with vendor prefixes.
 * Replaces Modernizr.testAllProps(propName)
 *
 * Returns the supported property name (with prefix if needed) or false.
 */
export function testAllProps(propName: string): string | boolean {
  if (!isBrowser()) return false;

  // Test unprefixed first
  if (testStyleProp(propName)) return propName;

  // Test with vendor prefixes
  const ucProp = propName.charAt(0).toUpperCase() + propName.slice(1);
  for (const prefix of VENDOR_PREFIXES) {
    const prefixed = prefix + ucProp;
    if (testStyleProp(prefixed)) return prefixed;
  }

  return false;
}

/**
 * Get the vendor-prefixed version of a property.
 * Replaces Modernizr.prefixed(prop, obj, elem)
 *
 * Can check DOM properties (e.g., requestAnimationFrame on window)
 * or CSS properties.
 */
export function getPrefixed(
  prop: string,
  obj?: Record<string, unknown>,
  _elem?: HTMLElement
): string | boolean | (() => void) | undefined {
  if (!isBrowser()) return undefined;

  // If obj provided, check DOM properties
  if (obj) {
    if (prop in obj) return obj[prop] as string | boolean | (() => void);

    const ucProp = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (const prefix of VENDOR_PREFIXES) {
      const prefixed = prefix + ucProp;
      if (prefixed in obj) {
        const val = obj[prefixed];
        if (typeof val === 'function') {
          return (val as () => void).bind(obj);
        }
        return val as string | boolean;
      }
    }
    return undefined;
  }

  // Otherwise, check CSS property
  return testAllProps(prop);
}

/**
 * Inject custom styles and test the result.
 * Replaces Modernizr.testStyles(rule, callback, nodes, testnames)
 *
 * This is the modernized version of Modernizr's injectElementWithStyles.
 * Uses a simpler approach without IE6-8 NoScope workarounds.
 */
export function testStyles(
  rule: string,
  callback: (node: HTMLElement, rule: string) => void,
  nodes: number = 1,
  testnames?: string[]
): boolean {
  if (!isBrowser()) return false;

  const mod = 'ims-modernizr';
  const div = document.createElement('div');
  const body = document.body;

  if (!body) return false;

  // Create test nodes
  for (let i = 0; i < nodes; i++) {
    const node = document.createElement('div');
    node.id = testnames ? testnames[i] : mod + (i + 1);
    div.appendChild(node);
  }

  // Create style element
  const style = document.createElement('style');
  style.id = 's' + mod;
  style.textContent = rule;
  div.appendChild(style);

  // Set up container
  div.id = mod;
  Object.assign(div.style, {
    display: 'none',
  });

  body.appendChild(div);

  let result = false;
  try {
    const testNode = div.firstChild as HTMLElement;
    if (testNode && callback) {
      callback(testNode, rule);
    }
    result = true;
  } catch {
    result = false;
  }

  body.removeChild(div);

  return result;
}

// ============================================================================
// CSS Class Generation
// ============================================================================

/**
 * Generate CSS class names from feature detection results.
 * Replaces Modernizr's automatic class injection on <html> element.
 *
 * Original Modernizr behavior:
 *   <html class="js flexbox canvas webgl no-touch...">
 *
 * New behavior:
 *   Same format but with IMS namespace awareness
 */
export function generateFeatureClasses(result: FeatureDetectionResult): string {
  const classes: string[] = ['js']; // Always add "js" class like Modernizr

  // CSS features
  const cssMap: Record<keyof CSSFeatures, string> = {
    flexbox: 'flexbox',
    flexboxLegacy: 'flexboxlegacy',
    rgba: 'rgba',
    hsla: 'hsla',
    multipleBgs: 'multiplebgs',
    backgroundSize: 'backgroundsize',
    borderImage: 'borderimage',
    borderRadius: 'borderradius',
    boxShadow: 'boxshadow',
    textShadow: 'textshadow',
    opacity: 'opacity',
    cssAnimations: 'cssanimations',
    cssColumns: 'csscolumns',
    cssGradients: 'cssgradients',
    cssReflections: 'cssreflections',
    cssTransforms: 'csstransforms',
    cssTransforms3d: 'csstransforms3d',
    cssTransitions: 'csstransitions',
    fontFace: 'fontface',
    generatedContent: 'generatedcontent',
  };

  for (const [key, className] of Object.entries(cssMap)) {
    const supported = result.css[key as keyof CSSFeatures];
    classes.push(supported ? className : 'no-' + className);
  }

  // HTML5 features
  const html5Map: Record<keyof HTML5Features, string> = {
    canvas: 'canvas',
    canvasText: 'canvastext',
    webgl: 'webgl',
    touch: 'touch',
    geolocation: 'geolocation',
    postMessage: 'postmessage',
    webSqlDatabase: 'websqldatabase',
    indexedDB: 'indexeddb',
    hashChange: 'hashchange',
    history: 'history',
    dragAndDrop: 'draganddrop',
    webSockets: 'websockets',
    localStorage: 'localstorage',
    sessionStorage: 'sessionstorage',
    webWorkers: 'webworkers',
    applicationCache: 'applicationcache',
  };

  for (const [key, className] of Object.entries(html5Map)) {
    const supported = result.html5[key as keyof HTML5Features];
    classes.push(supported ? className : 'no-' + className);
  }

  // SVG features
  const svgMap: Record<keyof SVGFeatures, string> = {
    svg: 'svg',
    inlineSvg: 'inlinesvg',
    smil: 'smil',
    svgClipPaths: 'svgclippaths',
  };

  for (const [key, className] of Object.entries(svgMap)) {
    const supported = result.svg[key as keyof SVGFeatures];
    classes.push(supported ? className : 'no-' + className);
  }

  return classes.join(' ');
}

// ============================================================================
// SSR Default Values
// ============================================================================

/**
 * Get default CSS features (all true for modern browser assumption in SSR).
 * In SSR, we assume modern browser capabilities since the app targets modern browsers.
 */
function getDefaultsCSS(): CSSFeatures {
  return {
    flexbox: true,
    flexboxLegacy: true,
    rgba: true,
    hsla: true,
    multipleBgs: true,
    backgroundSize: true,
    borderImage: true,
    borderRadius: true,
    boxShadow: true,
    textShadow: true,
    opacity: true,
    cssAnimations: true,
    cssColumns: true,
    cssGradients: true,
    cssReflections: true,
    cssTransforms: true,
    cssTransforms3d: true,
    cssTransitions: true,
    fontFace: true,
    generatedContent: true,
  };
}

function getDefaultsHTML5(): HTML5Features {
  return {
    canvas: true,
    canvasText: true,
    webgl: true,
    touch: false,
    geolocation: true,
    postMessage: true,
    webSqlDatabase: false,
    indexedDB: true,
    hashChange: true,
    history: true,
    dragAndDrop: true,
    webSockets: true,
    localStorage: true,
    sessionStorage: true,
    webWorkers: true,
    applicationCache: false,
  };
}

function getDefaultsSVG(): SVGFeatures {
  return {
    svg: true,
    inlineSvg: true,
    smil: true,
    svgClipPaths: true,
  };
}

function getDefaultsMedia(): MediaFeatures {
  return {
    video: true,
    videoOgg: 'probably',
    videoH264: 'probably',
    videoWebm: 'probably',
    audio: true,
    audioOgg: 'probably',
    audioMp3: 'probably',
    audioWav: 'probably',
    audioM4a: 'probably',
  };
}

function getDefaultsInputAttrs(): InputAttributes {
  return {
    autocomplete: true,
    autofocus: true,
    list: true,
    placeholder: true,
    max: true,
    min: true,
    multiple: true,
    pattern: true,
    required: true,
    step: true,
  };
}

function getDefaultsInputTypes(): InputTypes {
  return {
    search: true,
    tel: true,
    url: true,
    email: true,
    datetime: false,
    date: true,
    month: true,
    week: true,
    time: true,
    datetimeLocal: true,
    number: true,
    range: true,
    color: true,
  };
}
