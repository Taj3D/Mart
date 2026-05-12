/**
 * IMS jQuery UI Autocomplete Component
 * Replaces jQuery UI 1.12.1 autocomplete.js
 * Enhanced with Scrollable jQuery UI Autocomplete plugin support
 * (https://anseki.github.io/jquery-ui-autocomplete-scroll/)
 *
 * Features:
 * - Search input with dropdown suggestions
 * - minLength filtering
 * - Delay before search
 * - Auto-focus first item
 * - Custom item rendering
 * - Group support
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Loading state
 * - Deep Navy Blue themed dropdown
 * - Events: onSearch, onResponse, onFocus, onSelect, onClose, onOpen, onChange
 * - Scrollable dropdown with maxShowItems option (File 24)
 * - Dynamic max-height calculation based on item height × maxShowItems
 * - Scrollbar width compensation
 * - Input width matching
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, X, Search } from "lucide-react";
import type { AutocompleteOptions, AutocompleteItem, KeyCode } from "./types";
import { useScrollableDropdown } from "./scrollable-autocomplete";

// ============================================================================
// Types
// ============================================================================

export interface ImsJuiAutocompleteProps<T = unknown>
  extends Omit<React.ComponentProps<"div">, "onChange" | "onFocus">,
    AutocompleteOptions<T> {
  /** Input value (controlled) */
  value?: string;
  /** Default input value */
  defaultValue?: string;
  /** Called when input value changes */
  onInputChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** Aria label */
  "aria-label"?: string;
  /** Max visible items in dropdown (for data filtering) */
  maxItems?: number;
  /**
   * Maximum number of items visible without scrolling.
   * When total items exceed this number, the dropdown becomes scrollable
   * with a calculated max-height = itemHeight × maxShowItems + 1px.
   * The dropdown width is automatically compensated for the scrollbar.
   * Equivalent to the Scrollable jQuery UI Autocomplete plugin's maxShowItems.
   * Default: undefined (uses fixed max-h-[300px])
   */
  maxShowItems?: number;
  /**
   * Whether to compensate for scrollbar width by expanding the dropdown.
   * Only applies when maxShowItems is set. Default: true
   */
  compensateScrollbar?: boolean;
  /**
   * Whether to ensure the dropdown is at least as wide as the input.
   * Only applies when maxShowItems is set. Default: true
   */
  matchInputWidth?: boolean;
  /** Custom CSS class for the dropdown */
  dropdownClassName?: string;
}

export interface ImsJuiAutocompleteOptionProps<T = unknown>
  extends Omit<React.ComponentProps<"div">, "onSelect"> {
  /** The autocomplete item data */
  item: AutocompleteItem<T>;
  /** Whether this option is currently focused */
  focused?: boolean;
  /** Whether this option is selected */
  selected?: boolean;
  /** Click handler */
  onSelect?: (item: AutocompleteItem<T>) => void;
  /** Mouse enter handler */
  onMouseEnter?: () => void;
  /** Index in the flat list */
  index?: number;
}

export interface ImsJuiAutocompleteGroupProps extends React.ComponentProps<"div"> {
  /** Group label */
  label: string;
}

// ============================================================================
// ImsJuiAutocomplete (Main Component)
// ============================================================================

export function ImsJuiAutocomplete<T = unknown>({
  disabled = false,
  source,
  minLength = 1,
  delay = 300,
  autoFocus = false,
  appendTo,
  position,
  renderItem,
  onSearch,
  onResponse,
  onFocus,
  onSelect,
  onClose,
  onOpen,
  onChange,
  value: controlledValue,
  defaultValue = "",
  onInputChange,
  placeholder = "Search...",
  name,
  id,
  "aria-label": ariaLabel,
  maxItems = 20,
  maxShowItems,
  compensateScrollbar = true,
  matchInputWidth = true,
  className,
  dropdownClassName,
  children,
  ...props
}: ImsJuiAutocompleteProps<T>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState<AutocompleteItem<T>[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isComposing = React.useRef(false);

  // ---- Scrollable dropdown hook (File 24: Scrollable jQuery UI Autocomplete) ----
  const isScrollable = maxShowItems !== undefined && maxShowItems > 0;

  const {
    needsScroll,
    maxHeight: scrollableMaxHeight,
    scrollbarWidth,
    dropdownWidth: scrollableDropdownWidth,
    recalculate,
  } = useScrollableDropdown({
    maxShowItems: maxShowItems ?? 0,
    itemCount: filteredItems.length,
    listRef,
    inputRef: matchInputWidth ? inputRef : undefined,
    isOpen,
  });

  // Build dynamic dropdown style based on scrollable calculations
  const scrollableDropdownStyle = React.useMemo<React.CSSProperties>(() => {
    if (!isScrollable) return {};
    const style: React.CSSProperties = {};
    if (needsScroll && scrollableMaxHeight) {
      style.maxHeight = `${scrollableMaxHeight}px`;
      style.overflowX = "hidden";
      style.overflowY = "auto";
    }
    if (compensateScrollbar && scrollbarWidth > 0 && scrollableDropdownWidth) {
      style.width = `${scrollableDropdownWidth}px`;
    }
    return style;
  }, [isScrollable, needsScroll, scrollableMaxHeight, compensateScrollbar, scrollbarWidth, scrollableDropdownWidth]);

  // Helper to set input value
  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) {
        setInternalValue(v);
      }
      onInputChange?.(v);
    },
    [isControlled, onInputChange]
  );

  // Process source data
  const processSource = React.useCallback(
    (items: AutocompleteItem<T>[]) => {
      const filtered = items.slice(0, maxItems);
      setFilteredItems(filtered);
      setLoading(false);

      if (autoFocus && filtered.length > 0) {
        setFocusedIndex(0);
      }

      onResponse?.({} as React.Event, { content: filtered });
    },
    [maxItems, autoFocus, onResponse]
  );

  // Perform search
  const performSearch = React.useCallback(
    (term: string) => {
      if (term.length < minLength) {
        setFilteredItems([]);
        setIsOpen(false);
        return;
      }

      onSearch?.({} as React.KeyboardEvent, { item: undefined });

      if (Array.isArray(source)) {
        // Filter local array
        const results = source.filter(
          (item) =>
            item.label.toLowerCase().includes(term.toLowerCase()) ||
            item.value.toLowerCase().includes(term.toLowerCase())
        );
        processSource(results);
        setIsOpen(results.length > 0);
      } else if (typeof source === "function") {
        // Callback-based source
        setLoading(true);
        setIsOpen(true);
        source({ term }, (data) => {
          processSource(data);
        });
      } else if (typeof source === "string") {
        // URL-based source (fetch)
        setLoading(true);
        setIsOpen(true);
        fetch(`${source}?term=${encodeURIComponent(term)}`)
          .then((res) => res.json())
          .then((data: AutocompleteItem<T>[]) => {
            processSource(data);
          })
          .catch(() => {
            processSource([]);
          });
      } else {
        setFilteredItems([]);
        setIsOpen(false);
      }
    },
    [source, minLength, onSearch, processSource]
  );

  // Debounced search
  const debouncedSearch = React.useCallback(
    (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        performSearch(term);
      }, delay);
    },
    [delay, performSearch]
  );

  // Cleanup debounce
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          onClose?.({} as React.Event);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return;
    const focusedEl = listRef.current.querySelector(`[data-autocomplete-index="${focusedIndex}"]`);
    focusedEl?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  // Auto-open on mount if autoFocus and has value
  React.useEffect(() => {
    if (autoFocus && inputValue.length >= minLength) {
      performSearch(inputValue);
    }
  }, []);

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing.current) return;
    const v = e.target.value;
    setValue(v);
    debouncedSearch(v);
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    const v = (e.target as HTMLInputElement).value;
    setValue(v);
    debouncedSearch(v);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue.length >= minLength && filteredItems.length > 0) {
      setIsOpen(true);
      onOpen?.({} as React.Event);
    }
    onFocus?.(e, { item: { label: inputValue, value: inputValue } });
  };

  const handleSelect = React.useCallback(
    (item: AutocompleteItem<T>) => {
      setValue(item.label);
      setIsOpen(false);
      setFocusedIndex(-1);
      onSelect?.({} as React.KeyboardEvent | React.MouseEvent, { item });
      onChange?.({} as React.ChangeEvent, { item });
      inputRef.current?.focus();
    },
    [setValue, onSelect, onChange, inputValue]
  );

  const handleClear = () => {
    setValue("");
    setFilteredItems([]);
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange?.({} as React.ChangeEvent, { item: null });
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredItems.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
        onClose?.({} as React.Event);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          handleSelect(filteredItems[focusedIndex]);
        }
        break;
      }
      case "Escape": {
        setIsOpen(false);
        setFocusedIndex(-1);
        onClose?.({} as React.Event);
        break;
      }
      case "Tab": {
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          handleSelect(filteredItems[focusedIndex]);
        } else {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      }
    }
  };

  // Group items by their `group` field
  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, AutocompleteItem<T>[]>();
    for (const item of filteredItems) {
      const key = item.group ?? "";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filteredItems]);

  // Flat index mapping for keyboard navigation
  const flatIndexMap = React.useMemo(() => {
    const map = new Map<AutocompleteItem<T>, number>();
    filteredItems.forEach((item, idx) => map.set(item, idx));
    return map;
  }, [filteredItems]);

  // Build index counter for rendering
  let renderItemIndex = 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="jui-autocomplete-listbox"
      aria-haspopup="listbox"
      {...props}
    >
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-controls="jui-autocomplete-listbox"
          aria-activedescendant={
            focusedIndex >= 0 ? `jui-autocomplete-option-${focusedIndex}` : undefined
          }
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
            "border-input dark:bg-input/30",
            "h-9 text-sm pl-9 pr-8 py-1",
            "placeholder:text-muted-foreground",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus:border-navy-500 focus:ring-navy-500/30 focus:ring-[3px]"
          )}
        />

        {/* Loading spinner */}
        {loading && (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-navy-500" />
          </span>
        )}

        {/* Clear button */}
        {inputValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-navy-600 focus:outline-none focus:text-navy-600 transition-colors"
            aria-label="Clear"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="jui-autocomplete-listbox"
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border shadow-lg",
            "bg-white dark:bg-navy-950",
            "border-navy-200 dark:border-navy-700",
            // Use fixed max-height when maxShowItems is not set,
            // otherwise the hook manages overflow dynamically
            !isScrollable && "max-h-[300px] overflow-y-auto",
            "overscroll-contain",
            "scrollbar-thin scrollbar-thumb-navy-300 scrollbar-track-transparent",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150",
            dropdownClassName
          )}
          style={isScrollable ? scrollableDropdownStyle : undefined}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-navy-500" />
              <span>Searching...</span>
            </div>
          )}

          {/* No results */}
          {!loading && filteredItems.length === 0 && inputValue.length >= minLength && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {/* Grouped items */}
          {!loading &&
            groupedItems.map(([group, items]) => {
              const hasGroup = !!group;
              return (
                <ImsJuiAutocompleteGroup key={group || "__ungrouped"} label={group}>
                  {items.map((item) => {
                    const idx = flatIndexMap.get(item) ?? renderItemIndex;
                    renderItemIndex++;
                    const isFocused = idx === focusedIndex;
                    return (
                      <ImsJuiAutocompleteOption
                        key={`${item.value}-${idx}`}
                        item={item}
                        focused={isFocused}
                        index={idx}
                        onSelect={handleSelect}
                        onMouseEnter={() => setFocusedIndex(idx)}
                      >
                        {renderItem
                          ? renderItem(item)
                          : item.label}
                      </ImsJuiAutocompleteOption>
                    );
                  })}
                </ImsJuiAutocompleteGroup>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ImsJuiAutocompleteOption
// ============================================================================

export function ImsJuiAutocompleteOption<T = unknown>({
  item,
  focused = false,
  selected = false,
  onSelect,
  onMouseEnter,
  index = 0,
  className,
  children,
  ...props
}: ImsJuiAutocompleteOptionProps<T>) {
  const handleClick = React.useCallback(() => {
    if (!item.disabled) {
      onSelect?.(item);
    }
  }, [item, onSelect]);

  return (
    <div
      id={`jui-autocomplete-option-${index}`}
      role="option"
      aria-selected={focused || selected}
      data-autocomplete-index={index}
      className={cn(
        "ims-jui-autocomplete-option",
        "px-3 py-2 text-sm cursor-pointer transition-colors",
        focused
          ? "bg-navy-100 dark:bg-navy-800/50 text-navy-900 dark:text-navy-100"
          : "hover:bg-navy-50 dark:hover:bg-navy-900/30 text-foreground",
        item.disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      {...props}
    >
      {children ?? item.label}
    </div>
  );
}

// ============================================================================
// ImsJuiAutocompleteGroup
// ============================================================================

export function ImsJuiAutocompleteGroup({
  label,
  className,
  children,
  ...props
}: ImsJuiAutocompleteGroupProps) {
  if (!label) {
    return <>{children}</>;
  }

  return (
    <div className={cn("ims-jui-autocomplete-group", className)} {...props}>
      <div className="text-navy-600 dark:text-navy-400 uppercase text-xs font-semibold px-3 pt-2 pb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
