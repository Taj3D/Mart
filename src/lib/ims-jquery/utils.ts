/**
 * IMS jQuery Compatibility Module - Core Utility Functions
 * 
 * Converts jQuery 1.10.2 utility methods to modern TypeScript equivalents.
 * Provides type-safe implementations of commonly used jQuery utilities.
 */

import type { ImsPlainObject, ImsEachCallback, ImsMapCallback, ImsGrepCallback } from './types';

// ============================================================================
// Type Checking Utilities
// ============================================================================

const class2type: Record<string, string> = {};

// Populate class2type map (mirrors jQuery's approach)
const typeNames = 'Boolean Number String Function Array Date RegExp Object Error Symbol BigInt'.split(' ');
typeNames.forEach((name) => {
  class2type[`[object ${name}]`] = name.toLowerCase();
});

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * Replaces: jQuery.type(obj)
 */
export function type(obj: unknown): string {
  if (obj == null) {
    return String(obj);
  }
  return typeof obj === 'object' || typeof obj === 'function'
    ? class2type[Object.prototype.toString.call(obj)] || 'object'
    : typeof obj;
}

/**
 * Check if obj is a function.
 * Replaces: jQuery.isFunction(obj)
 */
export function isFunction(obj: unknown): obj is (...args: unknown[]) => unknown {
  return typeof obj === 'function';
}

/**
 * Check if obj is an array.
 * Replaces: jQuery.isArray(obj)
 */
export function isArray(obj: unknown): obj is unknown[] {
  return Array.isArray(obj);
}

/**
 * Check if obj is a plain object (created by {} or new Object).
 * Replaces: jQuery.isPlainObject(obj)
 */
export function isPlainObject(obj: unknown): obj is ImsPlainObject {
  if (!obj || type(obj) !== 'object' || obj.nodeType || isWindow(obj)) {
    return false;
  }

  try {
    const proto = Object.getPrototypeOf(obj);
    if (!proto || !Object.prototype.hasOwnProperty.call(proto, 'constructor')) {
      return false;
    }
    // Check if constructor is Object
    if (typeof proto.constructor !== 'function') return false;
    return proto.constructor === Object || 
           Object.prototype.toString.call(proto.constructor) === '[object Object]';
  } catch {
    return false;
  }
}

/**
 * Check if obj is a window object.
 * Replaces: jQuery.isWindow(obj)
 */
export function isWindow(obj: unknown): obj is Window {
  return obj != null && obj === (obj as Record<string, unknown>).window;
}

/**
 * Check if obj is numeric (can be parsed as a finite number).
 * Replaces: jQuery.isNumeric(obj)
 */
export function isNumeric(obj: unknown): boolean {
  if (typeof obj === 'number') {
    return !isNaN(obj) && isFinite(obj);
  }
  if (typeof obj === 'string') {
    const num = parseFloat(obj);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

/**
 * Check if an object is empty (has no enumerable properties).
 * Replaces: jQuery.isEmptyObject(obj)
 */
export function isEmptyObject(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return true;
  for (const _ in obj as Record<string, unknown>) {
    return false;
  }
  return true;
}

// ============================================================================
// String Utilities
// ============================================================================

const rmsPrefix = /^-ms-/;
const rdashAlpha = /-([\da-z])/gi;

/** CamelCase callback */
function fcamelCase(_all: string, letter: string): string {
  return letter.toUpperCase();
}

/**
 * Convert dashed string to camelCase.
 * Replaces: jQuery.camelCase(string)
 * e.g., "background-color" → "backgroundColor", "-ms-transform" → "msTransform"
 */
export function camelCase(string: string): string {
  return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
}

/**
 * Trim whitespace from string.
 * Replaces: jQuery.trim(text)
 */
export function trim(text: unknown): string {
  if (text == null) return '';
  return String(text).trim();
}

// ============================================================================
// Object Extension / Merge
// ============================================================================

/**
 * Merge the contents of two or more objects together into the first object.
 * Replaces: jQuery.extend([deep], target, object1, [objectN])
 * 
 * @param deep - If true, perform a deep merge
 * @param target - The target object to extend
 * @param sources - One or more source objects
 */
export function extend<T extends ImsPlainObject>(
  deep: boolean,
  target: T,
  ...sources: ImsPlainObject[]
): T;
export function extend<T extends ImsPlainObject>(target: T, ...sources: ImsPlainObject[]): T;
export function extend<T extends ImsPlainObject>(
  targetOrDeep: T | boolean,
  ...args: ImsPlainObject[]
): T {
  let deep = false;
  let target: ImsPlainObject;
  let i = 0;

  if (typeof targetOrDeep === 'boolean') {
    deep = targetOrDeep;
    target = args[0] || {};
    i = 1;
  } else {
    target = targetOrDeep as ImsPlainObject;
  }

  if (!target || typeof target !== 'object') {
    target = {};
  }

  for (; i < args.length; i++) {
    const source = args[i];
    if (source == null) continue;

    for (const name in source) {
      if (!Object.prototype.hasOwnProperty.call(source, name)) continue;
      
      const src = target[name];
      const copy = source[name];

      // Prevent never-ending loop
      if (target === copy) continue;

      // Recurse if merging plain objects or arrays
      if (deep && copy && (isPlainObject(copy) || isArray(copy))) {
        let clone: unknown;
        if (isArray(copy)) {
          clone = src && isArray(src) ? src : [];
        } else {
          clone = src && isPlainObject(src) ? src : {};
        }
        target[name] = extend(deep, clone as ImsPlainObject, copy);
      } else if (copy !== undefined) {
        target[name] = copy;
      }
    }
  }

  return target as T;
}

// ============================================================================
// Iteration Utilities
// ============================================================================

/**
 * Iterate over an array or object, executing a callback for each item.
 * Replaces: jQuery.each(obj, callback)
 * 
 * Returning false from the callback breaks the loop.
 */
export function each<T>(
  obj: T[] | readonly T[] | ArrayLike<T>,
  callback: ImsEachCallback<T>
): typeof obj;
export function each<T extends ImsPlainObject>(
  obj: T,
  callback: (key: string, value: T[keyof T]) => void | false
): T;
export function each(
  obj: unknown,
  callback: (keyOrIndex: number | string, value: unknown) => void | false
): unknown {
  if (obj == null) return obj;

  const objAny = obj as Record<string | number, unknown>;
  const length = (objAny as { length?: number }).length;
  const isArrayLike = typeof length === 'number' && length >= 0;

  if (isArrayLike) {
    for (let i = 0; i < (length as number); i++) {
      if (callback(i, objAny[i]) === false) break;
    }
  } else if (typeof obj === 'object') {
    for (const key in objAny) {
      if (Object.prototype.hasOwnProperty.call(objAny, key)) {
        if (callback(key, objAny[key]) === false) break;
      }
    }
  }

  return obj;
}

/**
 * Translate all items in an array or object to a new array of items.
 * Replaces: jQuery.map(elems, callback)
 */
export function map<T, R>(
  elems: T[] | readonly T[] | ArrayLike<T>,
  callback: ImsMapCallback<T, R>
): R[];
export function map<T extends ImsPlainObject, R>(
  obj: T,
  callback: (value: T[keyof T], key: string) => R | undefined | null
): R[];
export function map<T, R>(
  elems: T[] | ArrayLike<T> | ImsPlainObject,
  callback: ImsMapCallback<T, R> | ((value: unknown, key: string) => R | undefined | null)
): R[] {
  const result: R[] = [];

  if (elems == null) return result;

  const length = (elems as { length?: number }).length;
  const isArrayLike = typeof length === 'number';

  if (isArrayLike) {
    const arr = elems as ArrayLike<T>;
    for (let i = 0; i < arr.length; i++) {
      const value = (callback as ImsMapCallback<T, R>)(arr[i], i);
      if (value != null) {
        result.push(value);
      }
    }
  } else {
    const obj = elems as ImsPlainObject;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (callback as (value: unknown, key: string) => R | null | undefined)(
          obj[key], key
        );
        if (value != null) {
          result.push(value);
        }
      }
    }
  }

  // Flatten nested arrays (jQuery.map behavior)
  return result.flat(1) as R[];
}

/**
 * Filter elements of an array using a callback.
 * Replaces: jQuery.grep(elems, callback [, invert])
 */
export function grep<T>(
  elems: T[] | readonly T[] | ArrayLike<T>,
  callback: ImsGrepCallback<T>,
  invert = false
): T[] {
  const result: T[] = [];
  const arr = Array.from(elems);

  for (let i = 0; i < arr.length; i++) {
    const retVal = !!callback(arr[i], i);
    if (invert !== retVal) {
      result.push(arr[i]);
    }
  }

  return result;
}

/**
 * Find the index of an element in an array.
 * Replaces: jQuery.inArray(elem, arr [, fromIndex])
 */
export function inArray<T>(elem: T, arr: T[] | readonly T[], fromIndex?: number): number {
  if (!arr) return -1;
  return arr.indexOf(elem, fromIndex);
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Merge two arrays together.
 * Replaces: jQuery.merge(first, second)
 */
export function merge<T>(first: T[], second: T[] | ArrayLike<T>): T[] {
  const len = second.length;
  let i = first.length;
  let j = 0;

  while (j < len) {
    first[i++] = (second as T[])[j++];
  }
  first.length = i;

  return first;
}

/**
 * Convert an array-like object to a true array.
 * Replaces: jQuery.makeArray(obj)
 */
export function makeArray<T>(obj: T | ArrayLike<T> | ImsPlainObject): T[] {
  const ret: T[] = [];

  if (obj != null) {
    if (isArrayLike(obj)) {
      merge(ret, typeof obj === 'string' ? [obj] as unknown as T[] : obj as ArrayLike<T>);
    } else {
      ret.push(obj as T);
    }
  }

  return ret;
}

/**
 * Check if an object is array-like.
 */
function isArrayLike(obj: unknown): obj is ArrayLike<unknown> {
  if (obj == null || isWindow(obj)) return false;
  const length = (obj as { length?: number }).length;
  if (typeof length === 'number' && length >= 0 && 
      ((obj as unknown[]).length === 0 || (length > 0 && (length - 1) in (obj as unknown[])))) {
    return true;
  }
  return false;
}

// ============================================================================
// Function Utilities
// ============================================================================

/** GUID counter for unique IDs */
let guidCounter = 1;

/**
 * Get or assign a unique GUID to a function.
 * Replaces: jQuery.guid
 */
export function guid(fn?: (...args: unknown[]) => unknown): number {
  if (fn && !fn.guid) {
    fn.guid = guidCounter++;
  }
  return fn?.guid ?? guidCounter++;
}

/**
 * Reset the GUID counter (for testing).
 */
export function resetGuid(): void {
  guidCounter = 1;
}

/**
 * Bind a function to a context, optionally partially applying arguments.
 * Replaces: jQuery.proxy(fn, context)
 */
export function proxy<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: unknown
): T {
  if (!isFunction(fn)) {
    return fn;
  }

  const bound = fn.bind(context);
  bound.guid = fn.guid || guid(fn);

  return bound as T;
}

/**
 * No-op function.
 * Replaces: jQuery.noop()
 */
export function noop(): void {
  // intentionally empty
}

/**
 * Return current timestamp in milliseconds.
 * Replaces: jQuery.now()
 */
export function now(): number {
  return Date.now();
}

// ============================================================================
// DOM / Element Utilities
// ============================================================================

/**
 * Check if an element contains another element.
 * Replaces: jQuery.contains(a, b)
 */
export function contains(a: Element | Node | null, b: Element | Node | null): boolean {
  if (!a || !b) return false;
  
  const ad = a as Element;
  const bd = b as Element;

  if (ad.contains) {
    return ad.contains(bd);
  }
  
  if (ad.compareDocumentPosition) {
    return !!(ad.compareDocumentPosition(bd) & 16);
  }

  // Fallback: walk up from b
  let parent = bd.parentNode;
  while (parent) {
    if (parent === ad) return true;
    parent = parent.parentNode;
  }
  return false;
}

/**
 * Check the node name of an element, case-insensitively.
 * Replaces: jQuery.nodeName(elem, name)
 */
export function nodeName(elem: Element | Node | null, name: string): boolean {
  if (!elem) return false;
  return (elem as Element).nodeName?.toLowerCase() === name.toLowerCase();
}

/**
 * Check if a document is XML.
 * Replaces: jQuery.isXMLDoc(elem)
 */
export function isXMLDoc(elem: Element | Document | null): boolean {
  if (!elem) return false;
  const docElem = (elem as Document).documentElement || 
                  (elem as Element).ownerDocument?.documentElement;
  return docElem ? docElem.nodeName !== 'HTML' : false;
}

/**
 * Parse JSON string safely.
 * Replaces: jQuery.parseJSON(data)
 */
export function parseJSON<T = unknown>(data: string): T | null {
  if (data == null || typeof data !== 'string') return null;
  
  const trimmed = data.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

/**
 * Parse HTML string into an array of DOM nodes.
 * Replaces: jQuery.parseHTML(data [, context] [, keepScripts])
 */
export function parseHTML(
  data: string,
  context: Document = document,
  keepScripts = false
): Node[] {
  if (!data || typeof data !== 'string') return [];

  // Single tag match
  const singleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/.exec(data);
  if (singleTag) {
    return [context.createElement(singleTag[1])];
  }

  // Use DOMParser for complex HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');
  const nodes: Node[] = [];

  if (keepScripts) {
    nodes.push(...Array.from(doc.body.childNodes));
  } else {
    doc.body.querySelectorAll(':not(script)').forEach((el) => {
      nodes.push(el);
    });
  }

  return nodes;
}

/**
 * Parse XML string into a Document.
 * Replaces: jQuery.parseXML(data)
 */
export function parseXML(data: string): Document | null {
  if (!data || typeof data !== 'string') return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/xml');
    
    const parseError = doc.querySelector('parsererror');
    if (parseError) return null;
    
    return doc;
  } catch {
    return null;
  }
}

// ============================================================================
// Access / Multi-value setter/getter
// ============================================================================

/**
 * Multi-purpose getter/setter for collections.
 * Replaces: jQuery.access(elems, fn, key, value, chainable, emptyGet, raw)
 */
export function access<T, V>(
  elems: T[],
  fn: (elem: T, key: string, value: V) => unknown,
  key: string | Record<string, V>,
  value?: V | ((i: number, val: V) => V),
  chainable?: boolean
): V | T[] {
  let i = 0;
  const length = elems.length;

  // Multiple values via object
  if (typeof key === 'object') {
    for (const k in key) {
      if (Object.prototype.hasOwnProperty.call(key, k)) {
        access(elems, fn, k, key[k], true);
      }
    }
    return elems;
  }

  // Single value setter
  if (value !== undefined) {
    for (; i < length; i++) {
      const val = isFunction(value) 
        ? (value as (i: number, val: V) => V)(i, fn(elems[i], key, undefined as V) as V)
        : value;
      fn(elems[i], key, val as V);
    }
    return elems;
  }

  // Getter
  return length ? (fn(elems[0], key, undefined as V) as V) : undefined as V;
}

// ============================================================================
// Form Serialization
// ============================================================================

/**
 * Serialize a form or array of elements to a query string.
 * Replaces: jQuery.param(obj [, traditional])
 */
export function param(
  obj: Record<string, unknown> | [string, unknown][] | ArrayLike<unknown>,
  traditional = false
): string {
  const parts: string[] = [];

  function add(key: string, value: unknown): void {
    const v = isFunction(value) ? value() : (value == null ? '' : value);
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v)));
  }

  function buildParams(prefix: string, obj: unknown): void {
    if (isArray(obj)) {
      (obj as unknown[]).forEach((v, i) => {
        if (traditional || /\[\]$/.test(prefix)) {
          add(prefix, v);
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v);
        }
      });
    } else if (!traditional && isPlainObject(obj)) {
      for (const name in obj as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(obj, name)) {
          buildParams(prefix + '[' + name + ']', (obj as Record<string, unknown>)[name]);
        }
      }
    } else {
      add(prefix, obj);
    }
  }

  if (isArray(obj)) {
    (obj as [string, unknown][]).forEach((item) => {
      if (Array.isArray(item)) {
        add(item[0], item[1]);
      }
    });
  } else if (isPlainObject(obj)) {
    for (const prefix in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, prefix)) {
        buildParams(prefix, (obj as Record<string, unknown>)[prefix]);
      }
    }
  }

  return parts.join('&').replace(/%20/g, '+');
}

/**
 * Serialize form elements to an array of name/value objects.
 * Replaces: jQuery.fn.serializeArray()
 */
export function serializeArray(form: HTMLFormElement): { name: string; value: string }[] {
  const result: { name: string; value: string }[] = [];
  const elements = form.elements;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const type = (el as HTMLInputElement).type;

    if (!el.name || el.disabled || 
        /^(?:submit|button|image|reset|file)$/i.test(type) ||
        (/^(?:input|select|textarea|keygen)/i.test(el.nodeName) === false) ||
        ((type === 'checkbox' || type === 'radio') && !(el as HTMLInputElement).checked)) {
      continue;
    }

    const val = el.value;
    if (val != null) {
      if (isArray(val)) {
        (val as unknown as string[]).forEach((v) => {
          result.push({ name: el.name, value: v.replace(/\r?\n/g, '\r\n') });
        });
      } else {
        result.push({ name: el.name, value: String(val).replace(/\r?\n/g, '\r\n') });
      }
    }
  }

  return result;
}

/**
 * Serialize form elements to a URL-encoded string.
 * Replaces: jQuery.fn.serialize()
 */
export function serialize(form: HTMLFormElement): string {
  return param(serializeArray(form));
}
