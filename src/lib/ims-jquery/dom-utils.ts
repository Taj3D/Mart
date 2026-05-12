/**
 * IMS jQuery Compatibility Module - DOM Utilities
 * 
 * Converts jQuery DOM manipulation, offset, position, and dimension methods
 * to modern TypeScript equivalents using native DOM APIs.
 */

import type { ImsCoordinates, ImsOffset, ImsDimensions } from './types';
import { isWindow, nodeName } from './utils';

// ============================================================================
// Offset / Position (jQuery.fn.offset / position replacement)
// ============================================================================

/**
 * Get the current coordinates of the first element in the set of matched elements,
 * relative to the document.
 * Replaces: $(elem).offset()
 */
export function offset(element: Element): ImsCoordinates;
export function offset(element: Element, coordinates: ImsOffset): void;
export function offset(element: Element, coordinates?: ImsOffset): ImsCoordinates | void {
  if (!coordinates) {
    // Getter
    const rect = element.getBoundingClientRect();
    const doc = element.ownerDocument;
    if (!doc) return { top: 0, left: 0 };

    const docElem = doc.documentElement;
    const win = getWindow(doc);

    return {
      top: rect.top + (win ? win.pageYOffset : docElem.scrollTop) - (docElem.clientTop || 0),
      left: rect.left + (win ? win.pageXOffset : docElem.scrollLeft) - (docElem.clientLeft || 0),
    };
  }

  // Setter
  const curPosition = css(element, 'position');
  if (curPosition === 'static') {
    (element as HTMLElement).style.position = 'relative';
  }

  const curOffset = offset(element);
  const curCSSTop = css(element, 'top');
  const curCSSLeft = css(element, 'left');
  const calculatePosition = (curPosition === 'absolute' || curPosition === 'fixed') &&
    (curCSSTop === 'auto' || curCSSLeft === 'auto');

  let curTop: number;
  let curLeft: number;

  if (calculatePosition) {
    const curPosition = position(element);
    curTop = curPosition.top;
    curLeft = curPosition.left;
  } else {
    curTop = parseFloat(curCSSTop) || 0;
    curLeft = parseFloat(curCSSLeft) || 0;
  }

  const props: Record<string, string> = {};

  if (coordinates.top != null) {
    props.top = `${coordinates.top - curOffset.top + curTop}px`;
  }
  if (coordinates.left != null) {
    props.left = `${coordinates.left - curOffset.left + curLeft}px`;
  }

  Object.entries(props).forEach(([prop, value]) => {
    (element as HTMLElement).style[prop] = value;
  });

  if (coordinates.using) {
    coordinates.using({
      top: coordinates.top != null ? parseFloat(props.top) : curOffset.top,
      left: coordinates.left != null ? parseFloat(props.left) : curOffset.left,
    });
  }
}

/**
 * Get the current coordinates of the first element relative to the offset parent.
 * Replaces: $(elem).position()
 */
export function position(element: Element): ImsCoordinates {
  let offsetParent: Element | null;
  let offsetVal: ImsCoordinates;
  const parentOffset = { top: 0, left: 0 };

  // Fixed elements are offset from window
  if (css(element, 'position') === 'fixed') {
    offsetVal = element.getBoundingClientRect();
  } else {
    offsetParent = getOffsetParent(element);
    offsetVal = offset(element);

    if (offsetParent && !nodeName(offsetParent, 'html')) {
      const parentOff = offset(offsetParent);
      parentOffset.top += parentOff.top + parseFloat(css(offsetParent, 'borderTopWidth')) || 0;
      parentOffset.left += parentOff.left + parseFloat(css(offsetParent, 'borderLeftWidth')) || 0;
    }
  }

  return {
    top: offsetVal.top - parentOffset.top - (parseFloat(css(element, 'marginTop')) || 0),
    left: offsetVal.left - parentOffset.left - (parseFloat(css(element, 'marginLeft')) || 0),
  };
}

/**
 * Get the offset parent of an element.
 * Replaces: $(elem).offsetParent()
 */
export function getOffsetParent(element: Element): Element | null {
  let offsetParent = element.offsetParent || document.documentElement;

  while (offsetParent && !nodeName(offsetParent, 'html') && css(offsetParent, 'position') === 'static') {
    offsetParent = offsetParent.offsetParent;
  }

  return offsetParent || document.documentElement;
}

// ============================================================================
// Scroll Position (jQuery.fn.scrollTop / scrollLeft replacement)
// ============================================================================

/**
 * Get or set the vertical scroll position.
 * Replaces: $(elem).scrollTop([val])
 */
export function scrollTop(element: Element | Window, val?: number): number {
  if (isWindow(element)) {
    if (val !== undefined) {
      (element as Window).scrollTo((element as Window).pageXOffset, val);
      return val;
    }
    return (element as Window).pageYOffset || document.documentElement.scrollTop;
  }

  const el = element as HTMLElement;
  if (val !== undefined) {
    el.scrollTop = val;
    return val;
  }
  return el.scrollTop;
}

/**
 * Get or set the horizontal scroll position.
 * Replaces: $(elem).scrollLeft([val])
 */
export function scrollLeft(element: Element | Window, val?: number): number {
  if (isWindow(element)) {
    if (val !== undefined) {
      (element as Window).scrollTo(val, (element as Window).pageYOffset);
      return val;
    }
    return (element as Window).pageXOffset || document.documentElement.scrollLeft;
  }

  const el = element as HTMLElement;
  if (val !== undefined) {
    el.scrollLeft = val;
    return val;
  }
  return el.scrollLeft;
}

// ============================================================================
// Dimensions (jQuery.fn.height / width / innerHeight / etc. replacement)
// ============================================================================

/**
 * Get all dimension info for an element.
 * Replaces: $(elem).height/width/innerHeight/innerWidth/outerHeight/outerWidth
 */
export function getDimensions(element: Element | Window): ImsDimensions {
  if (isWindow(element)) {
    return {
      width: (element as Window).innerWidth || 0,
      height: (element as Window).innerHeight || 0,
      innerWidth: (element as Window).innerWidth || 0,
      innerHeight: (element as Window).innerHeight || 0,
      outerWidth: (element as Window).outerWidth || 0,
      outerHeight: (element as Window).outerHeight || 0,
    };
  }

  if (element.nodeType === 9) {
    // Document
    const doc = element as Document;
    const docElem = doc.documentElement;
    return {
      width: Math.max(doc.body.scrollWidth, docElem.scrollWidth),
      height: Math.max(doc.body.scrollHeight, docElem.scrollHeight),
      innerWidth: docElem.clientWidth,
      innerHeight: docElem.clientHeight,
      outerWidth: docElem.offsetWidth,
      outerHeight: docElem.offsetHeight,
    };
  }

  const el = element as HTMLElement;
  const computed = getComputedStyle(el);

  return {
    width: el.offsetWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight) -
           parseFloat(computed.borderLeftWidth) - parseFloat(computed.borderRightWidth),
    height: el.offsetHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom) -
            parseFloat(computed.borderTopWidth) - parseFloat(computed.borderBottomWidth),
    innerWidth: el.clientWidth,
    innerHeight: el.clientHeight,
    outerWidth: el.offsetWidth,
    outerHeight: el.offsetHeight,
  };
}

/**
 * Get or set the height of an element.
 * Replaces: $(elem).height([val])
 */
export function height(element: Element | Window, val?: number | string): number {
  if (val !== undefined && !isWindow(element)) {
    (element as HTMLElement).style.height = typeof val === 'number' ? `${val}px` : val;
    return val as number;
  }
  return getDimensions(element).height;
}

/**
 * Get or set the width of an element.
 * Replaces: $(elem).width([val])
 */
export function width(element: Element | Window, val?: number | string): number {
  if (val !== undefined && !isWindow(element)) {
    (element as HTMLElement).style.width = typeof val === 'number' ? `${val}px` : val;
    return val as number;
  }
  return getDimensions(element).width;
}

/**
 * Get inner height (including padding).
 * Replaces: $(elem).innerHeight()
 */
export function innerHeight(element: Element | Window): number {
  return getDimensions(element).innerHeight;
}

/**
 * Get inner width (including padding).
 * Replaces: $(elem).innerWidth()
 */
export function innerWidth(element: Element | Window): number {
  return getDimensions(element).innerWidth;
}

/**
 * Get outer height (including padding, border, and optionally margin).
 * Replaces: $(elem).outerHeight([includeMargin])
 */
export function outerHeight(element: Element | Window, includeMargin = false): number {
  const dims = getDimensions(element);
  if (includeMargin && !isWindow(element)) {
    const computed = getComputedStyle(element as Element);
    return dims.outerHeight + 
           parseFloat(computed.marginTop) + 
           parseFloat(computed.marginBottom);
  }
  return dims.outerHeight;
}

/**
 * Get outer width (including padding, border, and optionally margin).
 * Replaces: $(elem).outerWidth([includeMargin])
 */
export function outerWidth(element: Element | Window, includeMargin = false): number {
  const dims = getDimensions(element);
  if (includeMargin && !isWindow(element)) {
    const computed = getComputedStyle(element as Element);
    return dims.outerWidth + 
           parseFloat(computed.marginLeft) + 
           parseFloat(computed.marginRight);
  }
  return dims.outerWidth;
}

// ============================================================================
// Element Selection / Traversal Helpers
// ============================================================================

/**
 * Find elements matching a selector within a parent.
 * Replaces: $(parent).find(selector)
 */
export function find(selector: string, parent: Element | Document = document): Element[] {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Filter a set of elements to those matching a selector.
 * Replaces: $(elems).filter(selector)
 */
export function filter(elements: Element[], selector: string): Element[] {
  return elements.filter((el) => el.matches(selector));
}

/**
 * Check if an element matches a selector.
 * Replaces: $(elem).is(selector)
 */
export function is(element: Element, selector: string): boolean {
  return element.matches(selector);
}

/**
 * Get the closest ancestor matching a selector.
 * Replaces: $(elem).closest(selector)
 */
export function closest(element: Element, selector: string): Element | null {
  return element.closest(selector);
}

/**
 * Get the parent element.
 * Replaces: $(elem).parent()
 */
export function parent(element: Element): Element | null {
  return element.parentElement;
}

/**
 * Get all ancestor elements up to (but not including) the element matched by the selector.
 * Replaces: $(elem).parentsUntil(selector)
 */
export function parentsUntil(element: Element, untilSelector?: string): Element[] {
  const result: Element[] = [];
  let current = element.parentElement;

  while (current) {
    if (untilSelector && current.matches(untilSelector)) break;
    result.push(current);
    current = current.parentElement;
  }

  return result;
}

/**
 * Get the next sibling element.
 * Replaces: $(elem).next()
 */
export function next(element: Element): Element | null {
  return element.nextElementSibling;
}

/**
 * Get the previous sibling element.
 * Replaces: $(elem).prev()
 */
export function prev(element: Element): Element | null {
  return element.previousElementSibling;
}

/**
 * Get all following sibling elements.
 * Replaces: $(elem).nextAll()
 */
export function nextAll(element: Element): Element[] {
  const result: Element[] = [];
  let current = element.nextElementSibling;
  while (current) {
    result.push(current);
    current = current.nextElementSibling;
  }
  return result;
}

/**
 * Get all preceding sibling elements.
 * Replaces: $(elem).prevAll()
 */
export function prevAll(element: Element): Element[] {
  const result: Element[] = [];
  let current = element.previousElementSibling;
  while (current) {
    result.push(current);
    current = current.previousElementSibling;
  }
  return result;
}

/**
 * Get sibling elements.
 * Replaces: $(elem).siblings()
 */
export function siblings(element: Element): Element[] {
  const parent = element.parentElement;
  if (!parent) return [];
  return Array.from(parent.children).filter((child) => child !== element);
}

/**
 * Get child elements.
 * Replaces: $(elem).children()
 */
export function children(element: Element): Element[] {
  return Array.from(element.children);
}

// ============================================================================
// DOM Manipulation Helpers
// ============================================================================

/**
 * Append a child element or HTML string.
 * Replaces: $(parent).append(child)
 */
export function append(parent: Element, child: Element | string): void {
  if (typeof child === 'string') {
    parent.insertAdjacentHTML('beforeend', child);
  } else {
    parent.appendChild(child);
  }
}

/**
 * Prepend a child element or HTML string.
 * Replaces: $(parent).prepend(child)
 */
export function prepend(parent: Element, child: Element | string): void {
  if (typeof child === 'string') {
    parent.insertAdjacentHTML('afterbegin', child);
  } else {
    parent.insertBefore(child, parent.firstChild);
  }
}

/**
 * Remove an element from the DOM.
 * Replaces: $(elem).remove()
 */
export function remove(element: Element): void {
  element.parentNode?.removeChild(element);
}

/**
 * Remove all child nodes.
 * Replaces: $(elem).empty()
 */
export function empty(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Clone an element.
 * Replaces: $(elem).clone([withEvents])
 */
export function clone(element: Element, deep = true): Element {
  return element.cloneNode(deep);
}

/**
 * Wrap an element with a wrapper element.
 * Replaces: $(elem).wrap(wrapper)
 */
export function wrap(element: Element, wrapper: Element | string): void {
  const wrapperEl = typeof wrapper === 'string'
    ? createFromHTML(wrapper)
    : wrapper;

  if (!wrapperEl) return;

  element.parentNode?.insertBefore(wrapperEl, element);
  wrapperEl.appendChild(element);
}

/**
 * Create an element from an HTML string.
 */
function createFromHTML(html: string): Element | null {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

// ============================================================================
// Class Manipulation (jQuery.fn.addClass/removeClass/toggleClass/hasClass)
// ============================================================================

/**
 * Add one or more classes to an element.
 * Replaces: $(elem).addClass(className)
 */
export function addClass(element: Element, className: string): void {
  if (className) {
    element.classList.add(...className.split(/\s+/).filter(Boolean));
  }
}

/**
 * Remove one or more classes from an element.
 * Replaces: $(elem).removeClass(className)
 */
export function removeClass(element: Element, className: string): void {
  if (className) {
    element.classList.remove(...className.split(/\s+/).filter(Boolean));
  }
}

/**
 * Toggle a class on an element.
 * Replaces: $(elem).toggleClass(className [, state])
 */
export function toggleClass(element: Element, className: string, state?: boolean): void {
  if (state !== undefined) {
    if (state) {
      addClass(element, className);
    } else {
      removeClass(element, className);
    }
  } else {
    element.classList.toggle(className);
  }
}

/**
 * Check if an element has a class.
 * Replaces: $(elem).hasClass(className)
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

// ============================================================================
// Attribute / Property Helpers
// ============================================================================

/**
 * Get or set an attribute.
 * Replaces: $(elem).attr(name [, value])
 */
export function attr(element: Element, name: string): string | null;
export function attr(element: Element, name: string, value: string | null): void;
export function attr(element: Element, name: string, value?: string | null): string | null | void {
  if (value === undefined) {
    return element.getAttribute(name);
  }
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

/**
 * Get or set a property.
 * Replaces: $(elem).prop(name [, value])
 */
export function prop<T = unknown>(element: Element, name: string): T;
export function prop(element: Element, name: string, value: unknown): void;
export function prop<T = unknown>(element: Element, name: string, value?: T): T | void {
  const el = element as Record<string, unknown>;
  if (value === undefined) {
    return el[name] as T;
  }
  el[name] = value;
}

/**
 * Get or set the value of a form element.
 * Replaces: $(elem).val([value])
 */
export function val(element: Element): string | string[] | null;
export function val(element: Element, value: string | string[] | number): void;
export function val(element: Element, value?: string | string[] | number): string | string[] | null | void {
  const el = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  if (value === undefined) {
    if (el.multiple && el instanceof HTMLSelectElement) {
      return Array.from(el.selectedOptions).map((opt) => opt.value);
    }
    return el.value;
  }

  if (el.type === 'checkbox' || el.type === 'radio') {
    (el as HTMLInputElement).checked = Array.isArray(value)
      ? value.includes((el as HTMLInputElement).value)
      : String(value) === el.value;
  } else {
    el.value = Array.isArray(value) ? value[0] : String(value);
  }
}

/**
 * Get or set the text content.
 * Replaces: $(elem).text([text])
 */
export function text(element: Element): string;
export function text(element: Element, content: string): void;
export function text(element: Element, content?: string): string | void {
  if (content === undefined) {
    return element.textContent || '';
  }
  element.textContent = content;
}

/**
 * Get or set the inner HTML.
 * Replaces: $(elem).html([htmlString])
 */
export function html(element: Element): string;
export function html(element: Element, content: string): void;
export function html(element: Element, content?: string): string | void {
  if (content === undefined) {
    return element.innerHTML;
  }
  element.innerHTML = content;
}

// ============================================================================
// Utility Helpers
// ============================================================================

/**
 * Get the window object from a document or element.
 */
function getWindow(obj: Document | Element): Window | null {
  if ('defaultView' in obj) {
    return obj.defaultView;
  }
  if (obj.ownerDocument) {
    return obj.ownerDocument.defaultView;
  }
  return null;
}

/**
 * Simple CSS getter (read-only computed style).
 * Used internally by offset/position helpers.
 */
function css(element: Element, prop: string): string {
  return getComputedStyle(element).getPropertyValue(prop) || 
         (getComputedStyle(element) as Record<string, string>)[prop] || '';
}
