/**
 * IMS jQuery Compatibility Module - Data Cache System
 * 
 * Converts jQuery.data / jQuery._data / jQuery.removeData to TypeScript
 * using WeakMap for automatic garbage collection and a Map for ID-based lookups.
 */

import { isPlainObject, camelCase, isArray } from './utils';

// ============================================================================
// Data Cache Implementation
// ============================================================================

/** Unique ID counter for elements */
let dataIdCounter = 0;

/** Map from element unique IDs to their data */
const dataCache = new Map<string, Record<string, unknown>>();

/** Map from element unique IDs to internal data (events, handles, etc.) */
const internalCache = new Map<string, Record<string, unknown>>();

/** WeakMap for associating elements with their unique IDs */
const elementIds = new WeakMap<Element, string>();

/** Property name used to store the data ID on elements */
const DATA_ID_PROP = '__imsDataId';

/**
 * Get or create a unique data ID for an element.
 */
function getDataId(element: Element | object): string {
  if (element instanceof Element) {
    let id = elementIds.get(element);
    if (!id) {
      id = `ims_${++dataIdCounter}`;
      elementIds.set(element, id);
      // Also store as expando property for compatibility
      try {
        (element as Element & { [key: string]: string })[DATA_ID_PROP] = id;
      } catch {
        // Some elements don't allow expando properties
      }
    }
    return id;
  }

  // For plain objects, use a simple approach
  if (typeof element === 'object' && element !== null) {
    const obj = element as Record<string, unknown>;
    if (!obj[DATA_ID_PROP]) {
      obj[DATA_ID_PROP] = `ims_obj_${++dataIdCounter}`;
    }
    return obj[DATA_ID_PROP] as string;
  }

  return `ims_${++dataIdCounter}`;
}

// ============================================================================
// Public API (jQuery.data / jQuery.removeData replacement)
// ============================================================================

/**
 * Store or retrieve data associated with an element.
 * Replaces: jQuery.data(elem, key [, value]) and $(elem).data(key [, value])
 */
export function data(element: Element | object, key: string): unknown;
export function data(element: Element | object, key: string, value: unknown): void;
export function data(element: Element | object, key: Record<string, unknown>): void;
export function data(element: Element | object): Record<string, unknown>;
export function data(
  element: Element | object,
  key?: string | Record<string, unknown>,
  value?: unknown
): unknown {
  const id = getDataId(element);
  
  // Get all data
  if (key === undefined) {
    if (!dataCache.has(id)) {
      dataCache.set(id, {});
    }
    // Also read HTML5 data-* attributes for elements
    if (element instanceof Element) {
      const cache = { ...dataCache.get(id)! };
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.name.startsWith('data-')) {
          const dataKey = camelCase(attr.name.slice(5));
          if (!(dataKey in cache)) {
            cache[dataKey] = parseDataValue(attr.value);
          }
        }
      }
      return cache;
    }
    return dataCache.get(id)!;
  }

  // Set multiple values via object
  if (isPlainObject(key)) {
    if (!dataCache.has(id)) {
      dataCache.set(id, {});
    }
    const cache = dataCache.get(id)!;
    Object.entries(key).forEach(([k, v]) => {
      cache[camelCase(k)] = v;
    });
    return;
  }

  const camelKey = camelCase(key);

  // Set single value
  if (value !== undefined) {
    if (!dataCache.has(id)) {
      dataCache.set(id, {});
    }
    dataCache.get(id)![camelKey] = value;
    return;
  }

  // Get single value
  const cache = dataCache.get(id);
  if (cache && camelKey in cache) {
    return cache[camelKey];
  }

  // Fallback to data-* attribute for elements
  if (element instanceof Element) {
    const attrName = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    const attrValue = element.getAttribute(attrName);
    if (attrValue !== null) {
      return parseDataValue(attrValue);
    }
  }

  return undefined;
}

/**
 * Remove data associated with an element.
 * Replaces: jQuery.removeData(elem [, key]) and $(elem).removeData([key])
 */
export function removeData(element: Element | object, key?: string | string[]): void {
  const id = getDataId(element);

  if (!dataCache.has(id)) return;

  if (key === undefined) {
    // Remove all data
    dataCache.delete(id);
    return;
  }

  const cache = dataCache.get(id)!;
  const keys = isArray(key) ? key : [key];

  keys.forEach((k) => {
    const camelKey = camelCase(k as string);
    delete cache[camelKey];
    // Also try the original key
    delete cache[k as string];
  });

  // Clean up empty cache
  if (Object.keys(cache).length === 0) {
    dataCache.delete(id);
  }
}

/**
 * Check if an element has any data associated with it.
 * Replaces: jQuery.hasData(elem)
 */
export function hasData(element: Element | object): boolean {
  const id = getDataId(element);
  const cache = dataCache.get(id);
  const internal = internalCache.get(id);

  if (cache && Object.keys(cache).length > 0) return true;
  if (internal && Object.keys(internal).length > 0) return true;

  return false;
}

// ============================================================================
// Internal Data API (jQuery._data / jQuery._removeData replacement)
// ============================================================================

/**
 * Store or retrieve internal data (events, handles, etc.).
 * Replaces: jQuery._data(elem, key [, value])
 */
export function internalData(element: Element | object, key: string): unknown;
export function internalData(element: Element | object, key: string, value: unknown): void;
export function internalData(element: Element | object, key: Record<string, unknown>): void;
export function internalData(
  element: Element | object,
  key?: string | Record<string, unknown>,
  value?: unknown
): unknown {
  const id = getDataId(element);

  // Set multiple values
  if (isPlainObject(key)) {
    if (!internalCache.has(id)) {
      internalCache.set(id, {});
    }
    Object.assign(internalCache.get(id)!, key);
    return;
  }

  // Get or set single value
  const cache = internalCache.get(id) || {};

  if (typeof key === 'string') {
    if (value !== undefined) {
      if (!internalCache.has(id)) {
        internalCache.set(id, {});
      }
      internalCache.get(id)![key] = value;
      return;
    }
    return cache[key];
  }

  return cache;
}

/**
 * Remove internal data.
 * Replaces: jQuery._removeData(elem, key)
 */
export function removeInternalData(element: Element | object, key: string): void {
  const id = getDataId(element);
  const cache = internalCache.get(id);

  if (cache) {
    delete cache[key];
    if (Object.keys(cache).length === 0) {
      internalCache.delete(id);
    }
  }
}

// ============================================================================
// Accept Data Check (jQuery.acceptData replacement)
// ============================================================================

/**
 * Check if an element can accept data.
 * Replaces: jQuery.acceptData(elem)
 */
export function acceptData(element: unknown): boolean {
  if (!element || typeof element !== 'object') return false;

  const el = element as Element;
  const nodeType = el.nodeType;

  // Accept elements and documents
  if (nodeType === 1 || nodeType === 9) return true;

  // Reject text, comment, attribute nodes
  if (nodeType === 3 || nodeType === 8 || nodeType === 2) return false;

  return true;
}

// ============================================================================
// Clean Data (jQuery.cleanData replacement)
// ============================================================================

/**
 * Clean up data and events for elements that are being removed from the DOM.
 * Replaces: jQuery.cleanData(elems)
 */
export function cleanData(elements: Element[]): void {
  elements.forEach((element) => {
    const id = getDataId(element);
    dataCache.delete(id);
    internalCache.delete(id);

    // Remove expando property
    try {
      delete (element as Element & { [key: string]: unknown })[DATA_ID_PROP];
    } catch {
      // Ignore
    }
  });
}

// ============================================================================
// Data Value Parsing
// ============================================================================

/**
 * Parse a data attribute value to its correct type.
 * Handles booleans, numbers, null, and JSON strings.
 */
function parseDataValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;

  // Try number
  const num = +value;
  if (value !== '' && !isNaN(num)) return num;

  // Try JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      // Not valid JSON
    }
  }

  return value;
}

// ============================================================================
// Cache Statistics (for debugging)
// ============================================================================

/**
 * Get cache statistics for debugging.
 */
export function getCacheStats(): { dataEntries: number; internalEntries: number } {
  return {
    dataEntries: dataCache.size,
    internalEntries: internalCache.size,
  };
}

/**
 * Clear all caches (for testing).
 */
export function clearAllCaches(): void {
  dataCache.clear();
  internalCache.clear();
  dataIdCounter = 0;
}
