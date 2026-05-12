/**
 * IMS Select2 React Hooks
 * Replaces Select2 4.0.3 behavioral logic with React hooks
 * Provides: infinite scroll, input validation, tag creation, keyboard navigation,
 * dropdown management, and selection behavior hooks
 *
 * Converted from: Select2 4.0.3 data adapters, dropdown behaviors, selection behaviors
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  KEYS,
  defaultMatcher,
  fuzzyMatcher,
  tokenize,
  normalizeItem,
  ensureHighlightVisible,
  EN_TRANSLATIONS,
  BN_TRANSLATIONS,
  IMSSelect2Option,
  IMSSelect2Query,
  IMSSelect2Results,
  IMSSelect2Translations,
} from './select2-utils';

// ============================================================================
// useSelect2Search - Search/Filter Hook
// ============================================================================

export interface UseSelect2SearchOptions {
  /** All available options */
  options: IMSSelect2Option[];
  /** Matcher function: 'default' | 'fuzzy' | 'starts-with' | custom */
  matcher?: 'default' | 'fuzzy' | 'starts-with' | ((params: IMSSelect2Query, option: IMSSelect2Option) => IMSSelect2Option | null);
  /** Minimum input length before search triggers */
  minimumInputLength?: number;
  /** Maximum input length for search */
  maximumInputLength?: number;
  /** Sort results */
  sorter?: (results: IMSSelect2Option[]) => IMSSelect2Option[];
}

export interface UseSelect2SearchResult {
  /** Current search term */
  searchTerm: string;
  /** Set search term */
  setSearchTerm: (term: string) => void;
  /** Filtered results */
  results: IMSSelect2Option[];
  /** Whether search is active */
  isSearching: boolean;
  /** Validation message (if input too short/long) */
  validationMessage: string | null;
  /** Translations */
  translations: IMSSelect2Translations;
}

/**
 * Hook for Select2-style search/filter with diacritics support.
 * Replaces: select2/data/select query + select2/dropdown/search
 */
export function useSelect2Search({
  options,
  matcher = 'default',
  minimumInputLength = 0,
  maximumInputLength = 0,
  sorter,
}: UseSelect2SearchOptions): UseSelect2SearchResult {
  const [searchTerm, setSearchTerm] = useState('');
  const translations = EN_TRANSLATIONS;

  const matcherFn = useMemo(() => {
    if (typeof matcher === 'function') return matcher;
    switch (matcher) {
      case 'fuzzy': return fuzzyMatcher;
      case 'starts-with': return fuzzyMatcher; // fallback; startsWithMatcher available
      default: return defaultMatcher;
    }
  }, [matcher]);

  const validationMessage = useMemo(() => {
    if (minimumInputLength > 0 && searchTerm.length > 0 && searchTerm.length < minimumInputLength) {
      return translations.inputTooShort({ minimum: minimumInputLength, input: searchTerm });
    }
    if (maximumInputLength > 0 && searchTerm.length > maximumInputLength) {
      return translations.inputTooLong({ maximum: maximumInputLength, input: searchTerm });
    }
    return null;
  }, [searchTerm, minimumInputLength, maximumInputLength, translations]);

  const results = useMemo(() => {
    // Don't filter if below minimum input length
    if (minimumInputLength > 0 && searchTerm.length < minimumInputLength) {
      return options;
    }

    const query: IMSSelect2Query = { term: searchTerm };
    const filtered = options
      .map(option => matcherFn(query, option))
      .filter((option): option is IMSSelect2Option => option !== null);

    return sorter ? sorter(filtered) : filtered;
  }, [options, searchTerm, matcherFn, minimumInputLength, sorter]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching: searchTerm.length > 0,
    validationMessage,
    translations,
  };
}

// ============================================================================
// useSelect2Selection - Selection State Hook
// ============================================================================

export interface UseSelect2SelectionOptions {
  /** Initial selected values */
  initialSelected?: IMSSelect2Option[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Maximum number of selections (multi-select only) */
  maximumSelectionLength?: number;
  /** Placeholder option */
  placeholder?: IMSSelect2Option;
  /** Allow clearing selection */
  allowClear?: boolean;
  /** Close dropdown on select */
  closeOnSelect?: boolean;
}

export interface UseSelect2SelectionResult {
  /** Currently selected items */
  selected: IMSSelect2Option[];
  /** Select an item */
  select: (item: IMSSelect2Option) => void;
  /** Unselect an item */
  unselect: (item: IMSSelect2Option) => void;
  /** Clear all selections */
  clear: () => void;
  /** Whether an item is selected */
  isSelected: (item: IMSSelect2Option) => boolean;
  /** Display value (for single select) */
  displayValue: string;
  /** Whether at maximum selection */
  isAtMaximum: boolean;
  /** Validation message for maximum selection */
  maximumMessage: string | null;
}

/**
 * Hook for managing Select2-style selection state.
 * Replaces: select2/selection/single, select2/selection/multiple
 */
export function useSelect2Selection({
  initialSelected = [],
  multiple = false,
  maximumSelectionLength = 0,
  placeholder,
  allowClear = true,
}: UseSelect2SelectionOptions): UseSelect2SelectionResult {
  const [selected, setSelected] = useState<IMSSelect2Option[]>(initialSelected);

  const select = useCallback((item: IMSSelect2Option) => {
    if (multiple) {
      setSelected(prev => {
        if (prev.some(s => s.id === item.id)) return prev;
        if (maximumSelectionLength > 0 && prev.length >= maximumSelectionLength) return prev;
        return [...prev, item];
      });
    } else {
      setSelected([item]);
    }
  }, [multiple, maximumSelectionLength]);

  const unselect = useCallback((item: IMSSelect2Option) => {
    setSelected(prev => prev.filter(s => s.id !== item.id));
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback((item: IMSSelect2Option) => {
    return selected.some(s => s.id === item.id);
  }, [selected]);

  const displayValue = useMemo(() => {
    if (selected.length === 0) return placeholder?.text || '';
    if (selected.length === 1) return selected[0].text;
    return `${selected.length} items selected`;
  }, [selected, placeholder]);

  const isAtMaximum = maximumSelectionLength > 0 && selected.length >= maximumSelectionLength;

  const maximumMessage = isAtMaximum
    ? EN_TRANSLATIONS.maximumSelected({ maximum: maximumSelectionLength })
    : null;

  return {
    selected,
    select,
    unselect,
    clear,
    isSelected,
    displayValue,
    isAtMaximum,
    maximumMessage,
  };
}

// ============================================================================
// useSelect2Keyboard - Keyboard Navigation Hook
// ============================================================================

export interface UseSelect2KeyboardOptions {
  /** Is the dropdown open */
  isOpen: boolean;
  /** Open dropdown */
  open: () => void;
  /** Close dropdown */
  close: () => void;
  /** Select highlighted item */
  selectHighlighted: () => void;
  /** Move highlight up */
  highlightPrevious: () => void;
  /** Move highlight down */
  highlightNext: () => void;
  /** Toggle highlighted item (multi-select) */
  toggleHighlighted?: () => void;
}

/**
 * Hook for Select2-style keyboard navigation.
 * Replaces: select2/core _registerEvents keypress handler
 *
 * Key bindings (matching Select2):
 * - Enter: Select highlighted / Open dropdown
 * - Space: Toggle highlighted (multi) / Open dropdown
 * - Escape: Close dropdown
 * - Tab: Close dropdown
 * - Up Arrow: Previous option
 * - Down Arrow: Next option
 * - Alt+Up: Close dropdown
 * - Alt+Down: Open dropdown
 */
export function useSelect2Keyboard({
  isOpen,
  open,
  close,
  selectHighlighted,
  highlightPrevious,
  highlightNext,
  toggleHighlighted,
}: UseSelect2KeyboardOptions) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const key = event.which || event.keyCode;

    if (isOpen) {
      switch (key) {
        case KEYS.ESC:
        case KEYS.TAB:
          close();
          event.preventDefault();
          break;
        case KEYS.ENTER:
          selectHighlighted();
          event.preventDefault();
          break;
        case KEYS.SPACE:
          if (event.ctrlKey && toggleHighlighted) {
            toggleHighlighted();
            event.preventDefault();
          }
          break;
        case KEYS.UP:
          if (event.altKey) {
            close();
          } else {
            highlightPrevious();
          }
          event.preventDefault();
          break;
        case KEYS.DOWN:
          highlightNext();
          event.preventDefault();
          break;
      }
    } else {
      // Closed state
      if (key === KEYS.ENTER || key === KEYS.SPACE || (key === KEYS.DOWN && event.altKey)) {
        open();
        event.preventDefault();
      }
    }
  }, [isOpen, open, close, selectHighlighted, highlightPrevious, highlightNext, toggleHighlighted]);

  return { handleKeyDown };
}

// ============================================================================
// useSelect2Highlight - Option Highlighting Hook
// ============================================================================

export interface UseSelect2HighlightOptions {
  /** Total number of options */
  optionCount: number;
  /** Scroll container ref */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Hook for managing highlighted option in dropdown.
 * Replaces: select2/results highlightFirstItem, getHighlightedResults
 */
export function useSelect2Highlight({
  optionCount,
  scrollContainerRef,
}: UseSelect2HighlightOptions) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const highlightNext = useCallback(() => {
    setHighlightedIndex(prev => {
      const next = prev + 1;
      return next >= optionCount ? prev : next;
    });
  }, [optionCount]);

  const highlightPrevious = useCallback(() => {
    setHighlightedIndex(prev => {
      const next = prev - 1;
      return next < 0 ? 0 : next;
    });
  }, []);

  const highlightFirst = useCallback(() => {
    setHighlightedIndex(0);
  }, []);

  const highlightIndex = useCallback((index: number) => {
    if (index >= 0 && index < optionCount) {
      setHighlightedIndex(index);
    }
  }, [optionCount]);

  const clearHighlight = useCallback(() => {
    setHighlightedIndex(-1);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !scrollContainerRef?.current) return;

    const container = scrollContainerRef.current;
    const items = container.querySelectorAll('[aria-selected]');
    if (highlightedIndex < items.length) {
      ensureHighlightVisible(container, items[highlightedIndex] as HTMLElement);
    }
  }, [highlightedIndex, scrollContainerRef]);

  return {
    highlightedIndex,
    highlightNext,
    highlightPrevious,
    highlightFirst,
    highlightIndex,
    clearHighlight,
    isHighlighted: (index: number) => index === highlightedIndex,
  };
}

// ============================================================================
// useSelect2InfiniteScroll - Infinite Scroll Hook
// ============================================================================

export interface UseSelect2InfiniteScrollOptions {
  /** Is there more data to load */
  hasMore: boolean;
  /** Load more callback */
  onLoadMore: (page: number) => void;
  /** Scroll container ref */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Threshold in px from bottom to trigger load */
  threshold?: number;
}

/**
 * Hook for Select2-style infinite scroll in dropdown.
 * Replaces: select2/dropdown/infiniteScroll
 */
export function useSelect2InfiniteScroll({
  hasMore,
  onLoadMore,
  scrollContainerRef,
  threshold = 50,
}: UseSelect2InfiniteScrollOptions) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = currentPage + 1;
    setIsLoading(true);
    onLoadMore(nextPage);
    setCurrentPage(nextPage);
    // Reset loading after a tick (real implementation would wait for response)
    setTimeout(() => setIsLoading(false), 100);
  }, [currentPage, isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < threshold && !isLoading) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, hasMore, isLoading, loadMore, threshold]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
    setIsLoading(false);
  }, []);

  return {
    currentPage,
    isLoading,
    loadMore,
    resetPage,
  };
}

// ============================================================================
// useSelect2Tags - Tag Creation Hook
// ============================================================================

export interface UseSelect2TagsOptions {
  /** Token separator characters (e.g., [',']) */
  tokenSeparators?: string[];
  /** Custom tag creation function */
  createTag?: (term: string) => IMSSelect2Option | null;
  /** Custom tag insertion position */
  insertTag?: (results: IMSSelect2Option[], tag: IMSSelect2Option) => IMSSelect2Option[];
  /** Whether tags feature is enabled */
  enabled?: boolean;
}

/**
 * Hook for Select2-style tag creation from search input.
 * Replaces: select2/data/tags + select2/data/tokenizer
 */
export function useSelect2Tags({
  tokenSeparators = [],
  createTag,
  enabled = true,
}: UseSelect2TagsOptions) {
  const [tags, setTags] = useState<IMSSelect2Option[]>([]);

  const defaultCreateTag = useCallback((term: string): IMSSelect2Option | null => {
    const trimmed = term.trim();
    return trimmed === '' ? null : { id: trimmed, text: trimmed };
  }, []);

  const handleTokenize = useCallback((
    term: string
  ): { remainingTerm: string; newTags: IMSSelect2Option[] } => {
    if (!enabled || tokenSeparators.length === 0) {
      return { remainingTerm: term, newTags: [] };
    }

    const result = tokenize(term, tokenSeparators, createTag || defaultCreateTag);
    return { remainingTerm: result.term, newTags: result.tokens };
  }, [enabled, tokenSeparators, createTag, defaultCreateTag]);

  const addTag = useCallback((tag: IMSSelect2Option) => {
    setTags(prev => {
      if (prev.some(t => t.id === tag.id)) return prev;
      return [...prev, tag];
    });
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  }, []);

  const clearTags = useCallback(() => {
    setTags([]);
  }, []);

  return {
    tags,
    addTag,
    removeTag,
    clearTags,
    handleTokenize,
  };
}

// ============================================================================
// useSelect2Dropdown - Dropdown State Management Hook
// ============================================================================

export interface UseSelect2DropdownOptions {
  /** Close on select */
  closeOnSelect?: boolean;
  /** Select on close */
  selectOnClose?: boolean;
}

/**
 * Hook for managing Select2 dropdown open/close state.
 * Replaces: select2/core toggleDropdown, open, close
 */
export function useSelect2Dropdown({
  closeOnSelect = true,
}: UseSelect2DropdownOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleSelect = useCallback(() => {
    if (closeOnSelect) {
      close();
    }
  }, [closeOnSelect, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    handleSelect,
  };
}

// ============================================================================
// useSelect2Ajax - AJAX Data Loading Hook
// ============================================================================

export interface UseSelect2AjaxOptions<T = unknown> {
  /** AJAX fetch function */
  fetchFn: (params: IMSSelect2Query) => Promise<T>;
  /** Process AJAX response into Select2 results */
  processResults: (data: T, params: IMSSelect2Query) => IMSSelect2Results;
  /** Debounce delay in ms */
  delay?: number;
  /** Minimum input length to trigger search */
  minimumInputLength?: number;
}

/**
 * Hook for Select2-style AJAX data loading with debounce.
 * Replaces: select2/data/ajax query function
 */
export function useSelect2Ajax<T = unknown>({
  fetchFn,
  processResults,
  delay = 250,
  minimumInputLength = 0,
}: UseSelect2AjaxOptions<T>) {
  const [results, setResults] = useState<IMSSelect2Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useCallback(async (params: IMSSelect2Query) => {
    // Validate minimum input length
    if (minimumInputLength > 0 && (params.term || '').length < minimumInputLength) {
      setResults([]);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Debounce
    await new Promise<void>(resolve => {
      timeoutRef.current = setTimeout(resolve, delay);
    });

    if (controller.signal.aborted) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFn(params);
      if (!controller.signal.aborted) {
        const processed = processResults(data, params);
        setResults(processed.results);
        setHasMore(processed.pagination?.more ?? false);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(EN_TRANSLATIONS.errorLoading());
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, processResults, delay, minimumInputLength]);

  const loadMore = useCallback(async (page: number) => {
    return query({ term: '', page });
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    hasMore,
    query,
    loadMore,
  };
}
