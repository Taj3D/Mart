/**
 * IMS jQuery Compatibility Module - CSS Utility Helpers
 * 
 * Converts jQuery CSS methods to modern TypeScript equivalents
 * using getComputedStyle and CSS custom properties.
 */

import { camelCase, isFunction } from './utils';

// ============================================================================
// CSS Number Properties (no 'px' suffix needed)
// ============================================================================

/**
 * Properties that should not have 'px' appended when set as numbers.
 * Replaces: jQuery.cssNumber
 */
export const cssNumber: Record<string, boolean> = {
  animationIterationCount: true,
  columnCount: true,
  fillOpacity: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  gridArea: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnStart: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowStart: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true,
};

// ============================================================================
// CSS Property Name Mapping
// ============================================================================

/**
 * CSS property name aliases.
 * Replaces: jQuery.cssProps
 */
export const cssProps: Record<string, string> = {
  float: 'cssFloat',
};

/**
 * Get the correct CSS property name (handle vendor prefixes).
 * Replaces: vendorPropName(style, name)
 */
export function getCssPropertyName(name: string): string {
  // Check aliases
  if (cssProps[name]) {
    return cssProps[name];
  }

  // Try camelCase
  const camel = camelCase(name);
  
  // Check if property exists on style object
  if (typeof document !== 'undefined' && document.documentElement) {
    const style = document.documentElement.style;
    if (camel in style) {
      return camel;
    }

    // Check vendor prefixes
    const prefixes = ['Webkit', 'O', 'Moz', 'ms'];
    const capName = camel.charAt(0).toUpperCase() + camel.slice(1);
    
    for (const prefix of prefixes) {
      const prefixed = prefix + capName;
      if (prefixed in style) {
        cssProps[name] = prefixed;
        return prefixed;
      }
    }
  }

  return camel;
}

// ============================================================================
// CSS Get / Set
// ============================================================================

/**
 * Get the computed style of an element.
 * Replaces: $(elem).css(propertyName)
 */
export function getCss(element: Element, propertyName: string): string {
  const name = getCssPropertyName(propertyName);
  const computed = getComputedStyle(element);
  
  // Try getPropertyValue first (for hyphenated names)
  let value = computed.getPropertyValue(propertyName);
  
  // Fallback to camelCase property
  if (!value && name in computed) {
    value = (computed as Record<string, string>)[name];
  }

  return value;
}

/**
 * Get multiple CSS properties at once.
 * Replaces: $(elem).css([propertyNames])
 */
export function getCssMultiple(element: Element, propertyNames: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  propertyNames.forEach((name) => {
    result[name] = getCss(element, name);
  });
  return result;
}

/**
 * Set CSS properties on an element.
 * Replaces: $(elem).css(propertyName, value) or $(elem).css(properties)
 */
export function setCss(
  element: HTMLElement,
  propertyName: string,
  value: string | number | ((index: number, currentValue: string) => string | number)
): void;
export function setCss(
  element: HTMLElement,
  properties: Record<string, string | number | ((index: number, currentValue: string) => string | number)>
): void;
export function setCss(
  element: HTMLElement,
  propertyNameOrProps: string | Record<string, string | number | ((index: number, currentValue: string) => string | number)>,
  value?: string | number | ((index: number, currentValue: string) => string | number)
): void {
  if (typeof propertyNameOrProps === 'object') {
    // Object of property-value pairs
    Object.entries(propertyNameOrProps).forEach(([prop, val]) => {
      setCssProperty(element, prop, val);
    });
  } else if (typeof propertyNameOrProps === 'string') {
    setCssProperty(element, propertyNameOrProps, value);
  }
}

/**
 * Set a single CSS property on an element.
 */
function setCssProperty(
  element: HTMLElement,
  propertyName: string,
  value: string | number | ((index: number, currentValue: string) => string | number) | undefined
): void {
  const name = getCssPropertyName(propertyName);

  if (isFunction(value)) {
    const currentValue = getCss(element, propertyName);
    const resolved = (value as (index: number, val: string) => string | number)(0, currentValue);
    setCssProperty(element, propertyName, resolved);
    return;
  }

  if (value === undefined || value === null) return;

  // Handle relative values (+=, -=)
  if (typeof value === 'string') {
    const match = /^([+-])=([+-]?\d+\.?\d*)(.*)$/.exec(value);
    if (match) {
      const operator = match[1];
      const amount = parseFloat(match[2]);
      const unit = match[3] || 'px';
      const current = parseFloat(getCss(element, propertyName)) || 0;
      const result = operator === '+' ? current + amount : current - amount;
      element.style[name] = `${result}${unit}`;
      return;
    }
  }

  // Add 'px' to unitless numbers (except for cssNumber properties)
  if (typeof value === 'number' && !cssNumber[name]) {
    element.style[name] = `${value}px`;
  } else {
    element.style[name] = String(value);
  }
}

// ============================================================================
// CSS Class / Style Utilities
// ============================================================================

/**
 * Show an element by setting display.
 * Replaces: $(elem).show()
 */
export function cssShow(element: HTMLElement): void {
  element.style.display = '';
  
  // If still hidden, set to block
  if (getComputedStyle(element).display === 'none') {
    element.style.display = getDefaultDisplay(element.tagName);
  }
}

/**
 * Hide an element by setting display to none.
 * Replaces: $(elem).hide()
 */
export function cssHide(element: HTMLElement): void {
  element.style.display = 'none';
}

/**
 * Toggle element visibility.
 * Replaces: $(elem).toggle([state])
 */
export function cssToggle(element: HTMLElement, state?: boolean): void {
  if (state !== undefined) {
    if (state) cssShow(element);
    else cssHide(element);
  } else {
    if (getComputedStyle(element).display === 'none') {
      cssShow(element);
    } else {
      cssHide(element);
    }
  }
}

/**
 * Get the default display value for a tag name.
 * Used when showing elements that were hidden.
 */
function getDefaultDisplay(tagName: string): string {
  const displayMap: Record<string, string> = {
    div: 'block',
    span: 'inline',
    p: 'block',
    h1: 'block', h2: 'block', h3: 'block', h4: 'block', h5: 'block', h6: 'block',
    ul: 'block', ol: 'block', li: 'list-item',
    table: 'table',
    tr: 'table-row',
    td: 'table-cell',
    th: 'table-cell',
    thead: 'table-header-group',
    tbody: 'table-row-group',
    tfoot: 'table-footer-group',
    img: 'inline',
    a: 'inline',
    input: 'inline',
    button: 'inline-block',
    select: 'inline',
    textarea: 'inline',
    form: 'block',
    header: 'block',
    footer: 'block',
    nav: 'block',
    section: 'block',
    article: 'block',
    aside: 'block',
  };

  return displayMap[tagName.toLowerCase()] || 'block';
}

// ============================================================================
// CSS Hooks (jQuery.cssHooks replacement)
// ============================================================================

/**
 * CSS hooks for custom get/set behavior.
 * Replaces: jQuery.cssHooks
 */
export const cssHooks: Record<string, {
  get?: (elem: Element, computed: boolean, extra?: string) => string | number;
  set?: (elem: HTMLElement, value: string | number) => void;
}> = {};

// ============================================================================
// Style Swapping (jQuery.swap replacement)
// ============================================================================

/**
 * Temporarily swap CSS properties, execute a callback, then restore.
 * Replaces: jQuery.swap(elem, options, callback, args)
 * 
 * This is primarily used for measuring elements that are hidden.
 */
export function swap<T>(
  element: HTMLElement,
  options: Record<string, string>,
  callback: () => T
): T {
  const old: Record<string, string> = {};

  // Save old values
  for (const name in options) {
    old[name] = element.style[name];
    element.style[name] = options[name];
  }

  const result = callback();

  // Restore old values
  for (const name in options) {
    element.style[name] = old[name];
  }

  return result;
}

// ============================================================================
// Visibility Check
// ============================================================================

/**
 * Check if an element is hidden.
 * Replaces: $(elem).is(':hidden')
 */
export function isHidden(element: Element): boolean {
  if ((element as HTMLElement).style?.display === 'none') return true;
  if ((element as HTMLElement).offsetParent === null) return true;
  return getComputedStyle(element).display === 'none';
}

/**
 * Check if an element is visible.
 * Replaces: $(elem).is(':visible')
 */
export function isVisible(element: Element): boolean {
  return !isHidden(element);
}
