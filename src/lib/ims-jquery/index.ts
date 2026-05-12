/**
 * IMS jQuery Compatibility Module - Main Entry Point
 * 
 * Converts jQuery 1.10.2 API to modern TypeScript/React equivalents.
 * This module provides a compatibility layer that maps jQuery concepts
 * to native browser APIs, React patterns, and modern TypeScript.
 * 
 * Usage:
 *   import { $, ajax, Deferred, easing, ... } from '@/lib/ims-jquery';
 * 
 * Original: jQuery JavaScript Library v1.10.2
 * Converted: IMS jQuery Compatibility Module v1.10.2-ims
 */

// ============================================================================
// Type Exports
// ============================================================================
export type {
  ImsSelector,
  ImsEachCallback,
  ImsMapCallback,
  ImsGrepCallback,
  ImsEventHandler,
  ImsPlainObject,
  ImsAjaxMethod,
  ImsAjaxDataType,
  ImsAjaxContentType,
  ImsAjaxSettings,
  ImsAjaxResponse,
  ImsDeferredState,
  ImsDeferred,
  ImsPromise,
  ImsEventNamespace,
  ImsEvent,
  ImsEventBinding,
  ImsEasingFunction,
  ImsAnimationProps,
  ImsTween,
  ImsAnimationSpeeds,
  ImsCoordinates,
  ImsDimensions,
  ImsOffset,
  ImsCssProperties,
  ImsCssNumberProperty,
  ImsDataEntry,
  ImsDataCache,
  ImsCallbacksOptions,
  ImsCallbacks,
  ImsSerializedField,
  ImsJqueryMeta,
} from './types';

export { IMS_JQUERY_VERSION } from './types';

// ============================================================================
// Utility Function Exports
// ============================================================================
export {
  // Type checking
  type,
  isFunction,
  isArray,
  isPlainObject,
  isWindow,
  isNumeric,
  isEmptyObject,
  
  // String utilities
  camelCase,
  trim,
  
  // Object/Array operations
  extend,
  each,
  map,
  grep,
  inArray,
  merge,
  makeArray,
  
  // Function utilities
  guid,
  resetGuid,
  proxy,
  noop,
  now,
  
  // DOM/Element utilities
  contains,
  nodeName,
  isXMLDoc,
  parseJSON,
  parseHTML,
  parseXML,
  
  // Form utilities
  param,
  serializeArray,
  serialize,
} from './utils';

// ============================================================================
// Deferred / Callbacks Exports
// ============================================================================
export {
  createCallbacks,
  createDeferred,
  when,
} from './deferred';

// ============================================================================
// AJAX Exports
// ============================================================================
export {
  ajax,
  get,
  post,
  getJSON,
  getScript,
  ajaxSetup,
  getAjaxSettings,
  ajaxPrefilter,
  ajaxTransport,
  onAjaxEvent,
  offAjaxEvent,
} from './ajax';

// ============================================================================
// Event Bus Exports
// ============================================================================
export {
  globalEventBus,
  createEventBus,
  createFromNativeEvent,
  simulateEvent,
  specialEvents,
} from './event-bus';

export type { ImsEventBus } from './event-bus';

// ============================================================================
// Animation Exports
// ============================================================================
export {
  easing,
  getEasing,
  speeds,
  resolveDuration,
  applyTransition,
  cssEasingFromJQuery,
  showElement,
  hideElement,
  toggleElement,
  slideDown,
  slideUp,
  slideToggle,
  fadeIn,
  fadeOut,
  fadeToggle,
  fadeTo,
  getQueue,
  queue,
  dequeue,
  clearQueue,
  isAnimated,
  fx,
  setAnimationsEnabled,
} from './animation';

// ============================================================================
// DOM Utility Exports
// ============================================================================
export {
  // Offset / Position
  offset,
  position,
  getOffsetParent,
  scrollTop,
  scrollLeft,
  
  // Dimensions
  getDimensions,
  height,
  width,
  innerHeight,
  innerWidth,
  outerHeight,
  outerWidth,
  
  // Selection / Traversal
  find,
  filter,
  is,
  closest,
  parent,
  parentsUntil,
  next,
  prev,
  nextAll,
  prevAll,
  siblings,
  children,
  
  // DOM Manipulation
  append,
  prepend,
  remove,
  empty,
  clone,
  wrap,
  
  // Class manipulation
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  
  // Attribute / Property
  attr,
  prop,
  val,
  text,
  html,
} from './dom-utils';

// ============================================================================
// CSS Utility Exports
// ============================================================================
export {
  cssNumber,
  cssProps,
  getCssPropertyName,
  getCss,
  getCssMultiple,
  setCss,
  cssShow,
  cssHide,
  cssToggle,
  cssHooks,
  swap,
  isHidden,
  isVisible,
} from './css-utils';

// ============================================================================
// Data Cache Exports
// ============================================================================
export {
  data,
  removeData,
  hasData,
  internalData,
  removeInternalData,
  acceptData,
  cleanData,
  getCacheStats,
  clearAllCaches,
} from './data-cache';

// ============================================================================
// Unobtrusive Ajax Exports (File 25 - Microsoft jQuery Unobtrusive Ajax)
// ============================================================================
export {
  // Core hook
  useUnobtrusiveAjax,
  useAjaxForm,
  // Utility functions
  isSimpleMethod,
  serializeFormData,
  insertContent,
  resolveUpdateTarget,
  defaultConfirmHandler,
  resolveCallback,
  isJavaScriptContentType,
} from './ims-unobtrusive-ajax';

export type {
  ImsAjaxInsertMode,
  ImsAjaxHttpMethod,
  ImsAjaxState,
  ImsAjaxContext,
  UseUnobtrusiveAjaxOptions,
  UseUnobtrusiveAjaxReturn,
  UseAjaxFormOptions,
} from './ims-unobtrusive-ajax';

// ============================================================================
// Convenience Re-exports (jQuery-style aliases)
// ============================================================================

import { createDeferred, when } from './deferred';
import { ajax, get, post, getJSON, getScript } from './ajax';
import { globalEventBus, simulateEvent as domSimulateEvent } from './event-bus';
import { easing, getEasing, speeds, resolveDuration } from './animation';
import { fx } from './animation';
import {
  extend, each, map, grep, inArray, merge, makeArray,
  isFunction, isArray, isPlainObject, isNumeric, isEmptyObject,
  type as typeOf, trim, camelCase, noop, now, proxy, contains,
  parseJSON, param, serialize, serializeArray,
} from './utils';
import {
  offset, position, scrollTop, scrollLeft,
  height, width, innerHeight, innerWidth, outerHeight, outerWidth,
  find, filter, closest, parent, next, prev, siblings, children,
  addClass, removeClass, toggleClass, hasClass,
  attr, prop, val, text, html,
  append, prepend, remove as domRemove, empty as domEmpty,
  clone as domClone, nodeName as domNodeName, isWindow as domIsWindow,
  parseHTML as domParseHTML, parseXML as domParseXML,
} from './dom-utils';
import {
  getCss, setCss, cssShow, cssHide, cssToggle,
  isHidden, isVisible, swap,
} from './css-utils';
import {
  data, removeData, hasData, internalData, removeInternalData, cleanData,
  acceptData as domAcceptData,
} from './data-cache';
import { IMS_JQUERY_VERSION } from './types';

/**
 * IMS jQuery Compatibility Object
 * 
 * Provides a jQuery-like namespace object with all utility methods.
 * This can be used as a drop-in replacement for code that references
 * jQuery methods directly (e.g., $.each, $.extend, $.ajax).
 * 
 * Usage:
 *   import { $ } from '@/lib/ims-jquery';
 *   $.each(array, callback);
 *   $.extend({}, defaults, options);
 *   $.ajax({ url: '/api/data' });
 */
export const $ = {
  // Version info
  version: IMS_JQUERY_VERSION,
  jquery: IMS_JQUERY_VERSION,

  // ---- Core Utilities ----
  each,
  map,
  grep,
  inArray,
  merge,
  makeArray,
  extend,
  proxy,
  noop,
  now,
  guid: 1,

  // ---- Type Checking ----
  type: typeOf,
  isFunction,
  isArray,
  isPlainObject,
  isNumeric,
  isEmptyObject,
  isWindow: domIsWindow,

  // ---- String Utilities ----
  trim,
  camelCase,

  // ---- DOM Utilities ----
  contains,
  nodeName: domNodeName,
  parseJSON,
  parseHTML: domParseHTML,
  parseXML: domParseXML,

  // ---- Deferred / Promise ----
  Deferred: createDeferred,
  when,

  // ---- AJAX ----
  ajax,
  get,
  post,
  getJSON,
  getScript,

  // ---- Events ----
  event: {
    special: {} as Record<string, unknown>,
    global: {} as Record<string, boolean>,
    trigger: (event: string, data?: unknown[], elem?: Element) => {
      globalEventBus.trigger(event, data);
    },
    simulate: (type: string, elem: Element, event?: Event, bubble?: boolean) => {
      domSimulateEvent(type, elem, event, bubble);
    },
  },

  // ---- Animation ----
  easing,
  fx,

  // ---- CSS ----
  css: {
    hooks: {} as Record<string, unknown>,
    number: {} as Record<string, boolean>,
    props: {} as Record<string, string>,
  },

  // ---- Data ----
  data,
  removeData,
  hasData,
  _data: internalData,
  _removeData: removeInternalData,
  acceptData: domAcceptData,
  cleanData,

  // ---- Form ----
  param,
  serialize,
  serializeArray,

  // ---- Offset / Position ----
  offset: {
    setOffset: (elem: Element, options: Record<string, number>, i: number) => {
      offset(elem, options);
    },
  },

  // ---- Support (feature detection - all true in modern browsers) ----
  support: {
    ajax: true,
    cors: true,
    noCloneChecked: true,
    boxSizing: true,
    html5Clone: true,
    opacity: true,
    cssFloat: true,
    checkOn: true,
    optSelected: true,
    optDisabled: true,
    focusinBubbles: false,
    deleteExpando: true,
  },

  // ---- Callbacks ----
  Callbacks: createCallbacks,

  // ---- No Conflict (no-op in React environment) ----
  noConflict: () => {
    // No-op: In React/TypeScript, there's no global $ to restore
    return $;
  },

  // ---- Error ----
  error: (msg: string): never => {
    throw new Error(msg);
  },

  // ---- Ready (no-op, React handles this) ----
  ready: (fn: () => void) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  },

  // ---- Hold Ready (no-op) ----
  holdReady: (_hold: boolean) => {
    // No-op in React environment
  },

  // ---- Browser (deprecated, return minimal info) ----
  browser: {
    msie: false,
    version: '0',
  },
} as const;

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export - the full IMS jQuery compatibility namespace.
 */
export default $;
