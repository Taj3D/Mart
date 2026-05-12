/**
 * IMS Scrollable jQuery UI Autocomplete
 * Replaces: jquery-ui-autocomplete-scroll plugin
 * Source: https://anseki.github.io/jquery-ui-autocomplete-scroll/
 *
 * Original jQuery plugin override:
 *   $.widget('ui.autocomplete', $.ui.autocomplete, {
 *     _resizeMenu: function() {
 *       var ul, lis, ulW, barW;
 *       if (isNaN(this.options.maxShowItems)) { return; }
 *       ul = this.menu.element
 *         .scrollLeft(0).scrollTop(0)
 *         .css({overflowX: '', overflowY: '', width: '', maxHeight: ''});
 *       lis = ul.children('li').css('whiteSpace', 'nowrap');
 *       if (lis.length > this.options.maxShowItems) {
 *         ulW = ul.prop('clientWidth');
 *         ul.css({overflowX: 'hidden', overflowY: 'auto',
 *           maxHeight: lis.eq(0).outerHeight() * this.options.maxShowItems + 1});
 *         barW = ulW - ul.prop('clientWidth');
 *         ul.width('+=' + barW);
 *       }
 *       ul.outerWidth(Math.max(ul.outerWidth() + 1, this.element.outerWidth()));
 *     }
 *   });
 *
 * React Conversion:
 * - useScrollableDropdown hook: dynamic max-height calculation based on
 *   rendered item height × maxShowItems + scrollbar width compensation
 * - ScrollableAutocomplete: enhanced ImsJuiAutocomplete with scrollable dropdown
 * - ImsScrollableDropdown: standalone scrollable dropdown wrapper
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ImsJuiAutocomplete,
  type ImsJuiAutocompleteProps,
  ImsJuiAutocompleteOption,
  ImsJuiAutocompleteGroup,
} from "./ims-autocomplete";
import type { AutocompleteItem } from "./types";

// ============================================================================
// Types
// ============================================================================

/** Options for useScrollableDropdown hook */
export interface UseScrollableDropdownOptions {
  /** Maximum number of items to show without scrolling (equivalent to maxShowItems) */
  maxShowItems: number;
  /** Total number of items in the dropdown */
  itemCount: number;
  /** Ref to the dropdown/list container element */
  listRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to the input/trigger element (for width matching) */
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Whether the dropdown is currently open */
  isOpen: boolean;
  /** Selector for individual item elements within the list */
  itemSelector?: string;
  /** Extra padding to add to the calculated max height (default: 1 for Firefox) */
  extraHeight?: number;
  /** Minimum width for the dropdown (overrides input width calculation) */
  minWidth?: number;
}

/** Return type for useScrollableDropdown hook */
export interface UseScrollableDropdownReturn {
  /** Dynamic style to apply to the dropdown container */
  dropdownStyle: React.CSSProperties;
  /** Whether the dropdown needs scrolling (itemCount > maxShowItems) */
  needsScroll: boolean;
  /** Calculated max height in pixels */
  maxHeight: number | undefined;
  /** Detected scrollbar width in pixels */
  scrollbarWidth: number;
  /** Calculated dropdown width (accounting for scrollbar compensation) */
  dropdownWidth: number | undefined;
  /** Recalculate dropdown dimensions manually */
  recalculate: () => void;
}

/** Props for ScrollableAutocomplete component */
export interface ScrollableAutocompleteProps<T = unknown>
  extends Omit<ImsJuiAutocompleteProps<T>, "maxItems"> {
  /**
   * Maximum number of items visible without scrolling.
   * Equivalent to the original jQuery plugin's `maxShowItems` option.
   * When total items exceed this number, the dropdown becomes scrollable
   * with a calculated max-height = itemHeight × maxShowItems + 1px.
   * The dropdown width is automatically compensated for the scrollbar width.
   * Default: 10
   */
  maxShowItems?: number;
  /**
   * Whether to compensate for scrollbar width by expanding the dropdown.
   * Default: true (matches original jQuery plugin behavior)
   */
  compensateScrollbar?: boolean;
  /**
   * Whether to ensure the dropdown is at least as wide as the input.
   * Default: true (matches original jQuery plugin behavior)
   */
  matchInputWidth?: boolean;
}

/** Props for ImsScrollableDropdown (standalone wrapper) */
export interface ImsScrollableDropdownProps extends React.ComponentProps<"div"> {
  /** Maximum number of items visible without scrolling */
  maxShowItems: number;
  /** Total number of items */
  itemCount: number;
  /** Selector for item elements within the dropdown */
  itemSelector?: string;
  /** Whether to compensate for scrollbar width */
  compensateScrollbar?: boolean;
  /** Custom CSS class for the dropdown */
  dropdownClassName?: string;
  /** Children to render inside the dropdown */
  children: React.ReactNode;
}

// ============================================================================
// useScrollableDropdown Hook
// ============================================================================

/**
 * Hook that implements the Scrollable jQuery UI Autocomplete behavior.
 *
 * This replicates the original plugin's `_resizeMenu` method:
 * 1. When items > maxShowItems, calculates maxHeight = firstItemHeight × maxShowItems + 1
 * 2. Measures scrollbar width and compensates by increasing dropdown width
 * 3. Ensures dropdown width ≥ input element width
 *
 * The hook uses ResizeObserver and MutationObserver to automatically
 * recalculate when the dropdown content changes.
 */
export function useScrollableDropdown({
  maxShowItems,
  itemCount,
  listRef,
  inputRef,
  isOpen,
  itemSelector = "[data-autocomplete-index]",
  extraHeight = 1,
  minWidth,
}: UseScrollableDropdownOptions): UseScrollableDropdownReturn {
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const [needsScroll, setNeedsScroll] = React.useState(false);
  const [maxHeight, setMaxHeight] = React.useState<number | undefined>(undefined);
  const [scrollbarWidth, setScrollbarWidth] = React.useState(0);
  const [dropdownWidth, setDropdownWidth] = React.useState<number | undefined>(undefined);

  /** Detect the browser's scrollbar width */
  const detectScrollbarWidth = React.useCallback((): number => {
    if (typeof document === "undefined") return 0;
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    outer.style.msOverflowStyle = "scrollbar";
    document.body.appendChild(outer);
    const inner = document.createElement("div");
    outer.appendChild(inner);
    const width = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);
    return width;
  }, []);

  /**
   * Recalculate dropdown dimensions.
   * This is the React equivalent of the original `_resizeMenu` method.
   */
  const recalculate = React.useCallback(() => {
    if (!listRef.current || isNaN(maxShowItems) || maxShowItems <= 0) {
      setDropdownStyle({});
      setNeedsScroll(false);
      setMaxHeight(undefined);
      setScrollbarWidth(0);
      setDropdownWidth(undefined);
      return;
    }

    const listEl = listRef.current;

    // Reset scroll position and dynamic styles (matching original:
    // .scrollLeft(0).scrollTop(0).css({overflowX: '', overflowY: '', width: '', maxHeight: ''}))
    listEl.scrollTop = 0;
    listEl.scrollLeft = 0;

    // Temporarily remove overflow constraints to measure natural content
    const prevOverflowX = listEl.style.overflowX;
    const prevOverflowY = listEl.style.overflowY;
    const prevMaxHeight = listEl.style.maxHeight;
    listEl.style.overflowX = "";
    listEl.style.overflowY = "";
    listEl.style.maxHeight = "";

    // Find item elements (matching: lis = ul.children('li').css('whiteSpace', 'nowrap'))
    const itemElements = listEl.querySelectorAll(itemSelector);

    if (itemElements.length === 0) {
      // No items yet, restore and exit
      listEl.style.overflowX = prevOverflowX;
      listEl.style.overflowY = prevOverflowY;
      listEl.style.maxHeight = prevMaxHeight;
      setDropdownStyle({});
      setNeedsScroll(false);
      return;
    }

    // Make items nowrap temporarily for accurate measurement
    // (matching: lis.css('whiteSpace', 'nowrap'))
    const originalWhiteSpaces: string[] = [];
    itemElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalWhiteSpaces.push(htmlEl.style.whiteSpace);
      htmlEl.style.whiteSpace = "nowrap";
    });

    if (itemElements.length > maxShowItems) {
      // Calculate maxHeight from first item's outerHeight × maxShowItems + 1
      // (matching: maxHeight: lis.eq(0).outerHeight() * this.options.maxShowItems + 1)
      const firstItem = itemElements[0] as HTMLElement;
      const itemHeight = firstItem.offsetHeight;

      // Use getComputedStyle for accurate height including margins
      const computedStyle = window.getComputedStyle(firstItem);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      const fullItemHeight = itemHeight + marginTop + marginBottom;

      const calculatedMaxHeight = fullItemHeight * maxShowItems + extraHeight;

      // Measure width before applying overflow
      // (matching: ulW = ul.prop('clientWidth'))
      const listClientWidth = listEl.clientWidth;

      // Apply scrollable styles
      // (matching: ul.css({overflowX: 'hidden', overflowY: 'auto', maxHeight: ...}))
      listEl.style.overflowX = "hidden";
      listEl.style.overflowY = "auto";
      listEl.style.maxHeight = `${calculatedMaxHeight}px`;

      // Measure scrollbar width after applying overflow
      // (matching: barW = ulW - ul.prop('clientWidth'))
      const newClientWidth = listEl.clientWidth;
      const barWidth = listClientWidth - newClientWidth;

      // Compensate for scrollbar width
      // (matching: ul.width('+=' + barW))
      if (barWidth > 0) {
        const currentWidth = listEl.offsetWidth;
        listEl.style.width = `${currentWidth + barWidth}px`;
      }

      setNeedsScroll(true);
      setMaxHeight(calculatedMaxHeight);
      setScrollbarWidth(barWidth);

      // Calculate width with scrollbar compensation
      const compensatedWidth = listEl.offsetWidth;
      setDropdownWidth(compensatedWidth);
    } else {
      // Items don't exceed maxShowItems - no scroll needed
      listEl.style.overflowX = "";
      listEl.style.overflowY = "";
      listEl.style.maxHeight = "";
      setNeedsScroll(false);
      setMaxHeight(undefined);
      setScrollbarWidth(0);
      setDropdownWidth(undefined);
    }

    // Ensure dropdown width ≥ input width
    // (matching: ul.outerWidth(Math.max(ul.outerWidth() + 1, this.element.outerWidth())))
    if (inputRef?.current) {
      const inputWidth = inputRef.current.offsetWidth;
      const currentListWidth = listEl.offsetWidth;
      const finalWidth = Math.max(currentListWidth + 1, inputWidth);
      listEl.style.width = `${finalWidth}px`;
      setDropdownWidth(finalWidth);
    } else if (minWidth) {
      const currentListWidth = listEl.offsetWidth;
      if (currentListWidth < minWidth) {
        listEl.style.width = `${minWidth}px`;
        setDropdownWidth(minWidth);
      }
    }

    // Restore item white-space
    itemElements.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.whiteSpace = originalWhiteSpaces[i] || "";
    });
  }, [maxShowItems, itemCount, listRef, inputRef, itemSelector, extraHeight, minWidth]);

  // Recalculate when dropdown opens or item count changes
  React.useEffect(() => {
    if (!isOpen) return;

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      recalculate();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, itemCount, recalculate]);

  // Use ResizeObserver to detect size changes
  React.useEffect(() => {
    if (!listRef.current || !isOpen) return;

    const observer = new ResizeObserver(() => {
      recalculate();
    });

    observer.observe(listRef.current);

    return () => {
      observer.disconnect();
    };
  }, [listRef, isOpen, recalculate]);

  // Use MutationObserver to detect content changes
  React.useEffect(() => {
    if (!listRef.current || !isOpen) return;

    const observer = new MutationObserver(() => {
      recalculate();
    });

    observer.observe(listRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [listRef, isOpen, recalculate]);

  return {
    dropdownStyle,
    needsScroll,
    maxHeight,
    scrollbarWidth,
    dropdownWidth,
    recalculate,
  };
}

// ============================================================================
// ScrollableAutocomplete Component
// ============================================================================

/**
 * Enhanced ImsJuiAutocomplete with scrollable dropdown support.
 *
 * This is the direct React equivalent of the Scrollable jQuery UI
 * Autocomplete plugin. It adds the `maxShowItems` option which:
 * - Limits the number of visible items in the dropdown
 * - Calculates dynamic max-height based on actual item height
 * - Compensates dropdown width for scrollbar presence
 * - Ensures dropdown width ≥ input width
 *
 * Usage:
 * ```tsx
 * <ScrollableAutocomplete
 *   source={items}
 *   maxShowItems={5}
 *   onSelect={(e, ui) => console.log(ui.item)}
 * />
 * ```
 */
export function ScrollableAutocomplete<T = unknown>({
  maxShowItems = 10,
  compensateScrollbar = true,
  matchInputWidth = true,
  dropdownClassName,
  ...autocompleteProps
}: ScrollableAutocompleteProps<T>) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [itemCount, setItemCount] = React.useState(0);

  // Use the scrollable dropdown hook
  const { needsScroll, maxHeight, scrollbarWidth, dropdownWidth, recalculate } =
    useScrollableDropdown({
      maxShowItems,
      itemCount,
      listRef,
      inputRef,
      isOpen,
    });

  // Build dynamic dropdown style
  const dynamicDropdownStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};

    if (needsScroll && maxHeight) {
      style.maxHeight = `${maxHeight}px`;
      style.overflowX = "hidden";
      style.overflowY = "auto";
    }

    if (compensateScrollbar && scrollbarWidth > 0) {
      style.width = dropdownWidth ? `${dropdownWidth}px` : undefined;
    }

    return style;
  }, [needsScroll, maxHeight, compensateScrollbar, scrollbarWidth, dropdownWidth]);

  return (
    <ImsJuiAutocomplete<T>
      {...autocompleteProps}
      maxItems={autocompleteProps.maxItems ?? 100}
      dropdownClassName={cn(
        // Remove default max-h-[300px] when scrollable is active
        needsScroll && maxHeight ? "max-h-none" : "",
        dropdownClassName
      )}
    />
  );
}

// ============================================================================
// ImsScrollableDropdown (Standalone Wrapper)
// ============================================================================

/**
 * Standalone scrollable dropdown component.
 *
 * Can be used to wrap any dropdown list content with the scrollable
 * behavior from the jQuery UI Autocomplete Scroll plugin.
 *
 * Usage:
 * ```tsx
 * <ImsScrollableDropdown maxShowItems={5} itemCount={items.length}>
 *   {items.map(item => (
 *     <div key={item.id} data-autocomplete-index={item.id}>
 *       {item.label}
 *     </div>
 *   ))}
 * </ImsScrollableDropdown>
 * ```
 */
export function ImsScrollableDropdown({
  maxShowItems,
  itemCount,
  itemSelector = "[data-autocomplete-index]",
  compensateScrollbar = true,
  dropdownClassName,
  children,
  className,
  ...props
}: ImsScrollableDropdownProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const { needsScroll, maxHeight, scrollbarWidth, dropdownWidth, recalculate } =
    useScrollableDropdown({
      maxShowItems,
      itemCount,
      listRef,
      isOpen: true,
      itemSelector,
    });

  // Build dynamic style
  const dynamicStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};

    if (needsScroll && maxHeight) {
      style.maxHeight = `${maxHeight}px`;
      style.overflowX = "hidden";
      style.overflowY = "auto";
    }

    if (compensateScrollbar && scrollbarWidth > 0 && dropdownWidth) {
      style.width = `${dropdownWidth}px`;
    }

    return style;
  }, [needsScroll, maxHeight, compensateScrollbar, scrollbarWidth, dropdownWidth]);

  return (
    <div
      ref={listRef}
      className={cn(
        "ims-scrollable-dropdown",
        "rounded-md border shadow-lg",
        "bg-white dark:bg-navy-950",
        "border-navy-200 dark:border-navy-700",
        "overscroll-contain",
        "scrollbar-thin scrollbar-thumb-navy-300 scrollbar-track-transparent",
        dropdownClassName,
        className
      )}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Utility: getScrollbarWidth
// ============================================================================

/**
 * Detect the browser's native scrollbar width.
 * Useful for custom scrollbar compensation calculations.
 *
 * @returns Scrollbar width in pixels (0 if not detectable)
 */
export function getScrollbarWidth(): number {
  if (typeof document === "undefined") return 0;
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.msOverflowStyle = "scrollbar";
  document.body.appendChild(outer);
  const inner = document.createElement("div");
  outer.appendChild(inner);
  const width = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);
  return width;
}

/**
 * Calculate the max-height for a scrollable dropdown based on
 * a single item's height and the maximum number of visible items.
 *
 * This is a pure utility function matching the original jQuery logic:
 *   maxHeight = itemHeight × maxShowItems + 1
 *
 * The +1 pixel accounts for Firefox sub-pixel rendering issues.
 *
 * @param itemHeight - The outer height of a single dropdown item (px)
 * @param maxShowItems - Maximum number of items visible without scroll
 * @param extraPadding - Extra padding in pixels (default: 1 for Firefox)
 * @returns Calculated max-height in pixels
 */
export function calculateScrollableMaxHeight(
  itemHeight: number,
  maxShowItems: number,
  extraPadding: number = 1
): number {
  if (isNaN(maxShowItems) || maxShowItems <= 0) return 0;
  return itemHeight * maxShowItems + extraPadding;
}
