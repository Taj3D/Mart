/**
 * IMS jQuery Compatibility Module - Type Definitions
 * 
 * Converts jQuery 1.10.2 type system to TypeScript equivalents.
 * Provides type-safe interfaces for jQuery-like patterns in React.
 */

// ============================================================================
// Core Type Definitions
// ============================================================================

/** jQuery-like element selector - string selector, Element, or null */
export type ImsSelector = string | Element | Element[] | NodeListOf<Element> | null | undefined;

/** Callback function type matching jQuery.each pattern */
export type ImsEachCallback<T> = (index: number, value: T) => void | false;

/** Map callback function type */
export type ImsMapCallback<T, R> = (value: T, index: number) => R | undefined | null;

/** Grep filter callback */
export type ImsGrepCallback<T> = (element: T, index: number) => boolean;

/** Generic event handler */
export type ImsEventHandler<T = Event> = (event: ImsEvent<T>, ...args: unknown[]) => void | false;

/** Plain object type for extend/merge operations */
export type ImsPlainObject<T = unknown> = Record<string, T>;

/** Function type that can be a string reference or direct function */
export type ImsFunctionRef = string | ((...args: unknown[]) => unknown);

// ============================================================================
// AJAX Types
// ============================================================================

/** AJAX request method */
export type ImsAjaxMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/** AJAX data type expected in response */
export type ImsAjaxDataType = 'xml' | 'json' | 'html' | 'script' | 'text' | 'jsonp';

/** AJAX content type */
export type ImsAjaxContentType = 'application/x-www-form-urlencoded' | 'application/json' | 'multipart/form-data' | 'text/plain';

/** AJAX request configuration - maps jQuery.ajax settings */
export interface ImsAjaxSettings {
  url: string;
  method?: ImsAjaxMethod;
  type?: ImsAjaxMethod; // jQuery compat alias for method
  dataType?: ImsAjaxDataType;
  contentType?: ImsAjaxContentType | string;
  data?: Record<string, unknown> | string | FormData | null;
  headers?: Record<string, string>;
  async?: boolean;
  cache?: boolean;
  timeout?: number;
  processData?: boolean;
  traditional?: boolean;
  crossDomain?: boolean;
  withCredentials?: boolean;
  beforeSend?: (xhr: XMLHttpRequest) => boolean | void;
  success?: (data: unknown, textStatus: string, xhr: XMLHttpRequest) => void;
  error?: (xhr: XMLHttpRequest, textStatus: string, errorThrown: string) => void;
  complete?: (xhr: XMLHttpRequest, textStatus: string) => void;
}

/** AJAX response wrapper */
export interface ImsAjaxResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  xhr: XMLHttpRequest;
  headers: Record<string, string>;
}

// ============================================================================
// Deferred / Promise Types
// ============================================================================

/** Deferred state */
export type ImsDeferredState = 'pending' | 'resolved' | 'rejected';

/** Deferred object - maps jQuery.Deferred to native Promise */
export interface ImsDeferred<T = unknown> {
  promise(): ImsPromise<T>;
  resolve(value?: T): ImsDeferred<T>;
  reject(reason?: unknown): ImsDeferred<T>;
  notify(value?: unknown): ImsDeferred<T>;
  done(callback: (value: T) => void): ImsDeferred<T>;
  fail(callback: (reason: unknown) => void): ImsDeferred<T>;
  progress(callback: (value: unknown) => void): ImsDeferred<T>;
  always(callback: (...args: unknown[]) => void): ImsDeferred<T>;
  state(): ImsDeferredState;
}

/** Promise object - read-only view of Deferred */
export interface ImsPromise<T = unknown> extends Promise<T> {
  done(callback: (value: T) => void): ImsPromise<T>;
  fail(callback: (reason: unknown) => void): ImsPromise<T>;
  progress(callback: (value: unknown) => void): ImsPromise<T>;
  always(callback: (...args: unknown[]) => void): ImsPromise<T>;
  state(): ImsDeferredState;
}

// ============================================================================
// Event System Types
// ============================================================================

/** Event namespace info */
export interface ImsEventNamespace {
  type: string;
  namespace: string;
  origType: string;
}

/** Enhanced event object - maps jQuery.Event */
export interface ImsEvent<T = Event> {
  originalEvent: T | null;
  type: string;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  relatedTarget: EventTarget | null;
  timeStamp: number;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  isImmediatePropagationStopped: () => boolean;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
  namespace: string;
  data: unknown;
  result: unknown;
}

/** Event handler registration */
export interface ImsEventBinding {
  event: string;
  selector?: string;
  handler: ImsEventHandler;
  namespace: string;
  guid: number;
}

// ============================================================================
// Animation Types
// ============================================================================

/** Easing function type */
export type ImsEasingFunction = (t: number, duration: number, start: number, end: number) => number;

/** Animation properties */
export interface ImsAnimationProps {
  duration?: number;
  easing?: string | ImsEasingFunction;
  complete?: () => void;
  step?: (now: number, tween: ImsTween) => void;
  queue?: boolean | string;
  specialEasing?: Record<string, string | ImsEasingFunction>;
}

/** Tween object for animation */
export interface ImsTween {
  elem: Element;
  prop: string;
  easing: string;
  start: number;
  end: number;
  unit: string;
  now: number;
  pos: number;
  run(percent: number): void;
  cur(): number;
}

/** Animation speed presets - maps jQuery.fx.speeds */
export interface ImsAnimationSpeeds {
  slow: number;
  fast: number;
  _default: number;
}

// ============================================================================
// DOM / Offset Types
// ============================================================================

/** Position coordinates */
export interface ImsCoordinates {
  top: number;
  left: number;
}

/** Dimension info */
export interface ImsDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}

/** Offset info with position */
export interface ImsOffset extends ImsCoordinates {
  /** Set offset using a function */
  using?: (coords: ImsCoordinates) => void;
}

// ============================================================================
// CSS Types
// ============================================================================

/** CSS property-value pair */
export interface ImsCssProperties {
  [property: string]: string | number | undefined;
}

/** CSS number properties that don't need 'px' suffix */
export type ImsCssNumberProperty = 
  | 'columnCount' | 'fillOpacity' | 'fontWeight' | 'lineHeight' 
  | 'opacity' | 'order' | 'orphans' | 'widows' | 'zIndex' | 'zoom';

// ============================================================================
// Data Cache Types
// ============================================================================

/** Data cache entry */
export interface ImsDataEntry {
  data: Record<string, unknown>;
  events?: Record<string, ImsEventBinding[]>;
  handle?: ImsEventHandler;
}

/** Data cache structure */
export interface ImsDataCache {
  [id: string]: ImsDataEntry;
}

// ============================================================================
// Callback Types (jQuery.Callbacks replacement)
// ============================================================================

/** Callback list options */
export interface ImsCallbacksOptions {
  once?: boolean;
  memory?: boolean;
  unique?: boolean;
  stopOnFalse?: boolean;
}

/** Callback list - maps jQuery.Callbacks */
export interface ImsCallbacks {
  add(...fn: ((...args: unknown[]) => unknown)[]): ImsCallbacks;
  remove(...fn: ((...args: unknown[]) => unknown)[]): ImsCallbacks;
  has(fn?: (...args: unknown[]) => unknown): boolean;
  empty(): ImsCallbacks;
  disable(): ImsCallbacks;
  disabled(): boolean;
  lock(): ImsCallbacks;
  locked(): boolean;
  fireWith(context: unknown, args?: unknown[]): ImsCallbacks;
  fire(...args: unknown[]): ImsCallbacks;
  fired(): boolean;
}

// ============================================================================
// Form Serialization Types
// ============================================================================

/** Serialized form field */
export interface ImsSerializedField {
  name: string;
  value: string;
}

// ============================================================================
// Version Info
// ============================================================================

/** Module version info */
export const IMS_JQUERY_VERSION = '1.10.2-ims' as const;

/** Module metadata */
export interface ImsJqueryMeta {
  version: typeof IMS_JQUERY_VERSION;
  originalLibrary: 'jQuery';
  originalVersion: '1.10.2';
  convertedTo: 'TypeScript/React';
  conversionDate: string;
}
