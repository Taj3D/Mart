'use client'

import * as React from 'react'
import { Loader2, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AutocompleteSuggestion {
  value: string
  label: string
  group?: string
  icon?: React.ReactNode
  description?: string
}

export type AutocompleteSize = 'sm' | 'default' | 'lg'

export interface AutocompleteProps {
  /** Controlled input value */
  value?: string
  /** Callback when input value changes (free-text typing) */
  onValueChange?: (value: string) => void
  /** Uncontrolled default value */
  defaultValue?: string
  /** Local suggestions array (for local mode) */
  suggestions?: AutocompleteSuggestion[]
  /** Async search function (for async mode) */
  onSearch?: (query: string) => Promise<AutocompleteSuggestion[]>
  /** Debounce delay for async mode in ms (default 300) */
  debounceMs?: number
  /** Minimum characters before showing suggestions (default 1) */
  minChars?: number
  /** Maximum visible suggestions (default 8) */
  maxSuggestions?: number
  /** Input placeholder */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Show clear button (default true) */
  clearable?: boolean
  /** Field name to group suggestions by */
  groupField?: string
  /** Custom render function for each suggestion */
  renderSuggestion?: (
    suggestion: AutocompleteSuggestion,
    query: string,
  ) => React.ReactNode
  /** Function to get string value from suggestion object */
  getSuggestionValue?: (suggestion: AutocompleteSuggestion) => string
  /** Callback when a suggestion is selected */
  onSelect?: (suggestion: AutocompleteSuggestion) => void
  /** Highlight matching text in suggestions (default true) */
  highlightMatch?: boolean
  /** Array of recent items to show on focus */
  recentItems?: AutocompleteSuggestion[]
  /** Size variant */
  size?: AutocompleteSize
  /** Additional CSS class */
  className?: string
  /** Input id */
  id?: string
  /** Accessible label */
  'aria-label'?: string
  /** Name attribute for the input */
  name?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Case-insensitive fuzzy match: returns true if every character in `query`
 *  appears in `text` in order. Falls back to simple `includes` for
 *  single-word queries. */
function matchesQuery(text: string, query: string): boolean {
  const lText = text.toLowerCase()
  const lQuery = query.toLowerCase()

  if (lText.includes(lQuery)) return true

  // Fuzzy: each char of query must appear in order
  let qi = 0
  for (let ti = 0; ti < lText.length && qi < lQuery.length; ti++) {
    if (lText[ti] === lQuery[qi]) qi++
  }
  return qi === lQuery.length
}

/** Highlight the matching portion of `text` relative to `query`. */
function HighlightedText({
  text,
  query,
}: {
  text: string
  query: string
}) {
  if (!query) return <>{text}</>

  const lText = text.toLowerCase()
  const lQuery = query.toLowerCase()
  const idx = lText.indexOf(lQuery)

  if (idx === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-navy-100 text-navy-700 font-semibold dark:bg-navy-800/50 dark:text-navy-200">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

/** Group an array of suggestions by a given field. */
function groupSuggestions(
  items: AutocompleteSuggestion[],
  groupField: string | undefined,
): { group: string; items: AutocompleteSuggestion[] }[] {
  if (!groupField) return [{ group: '', items }]

  const map = new Map<string, AutocompleteSuggestion[]>()
  for (const item of items) {
    const key = (item as Record<string, unknown>)[groupField] as string | undefined || item.group || 'Other'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }))
}

// ---------------------------------------------------------------------------
// Size classes
// ---------------------------------------------------------------------------

const sizeConfig: Record<
  AutocompleteSize,
  { input: string; row: string; icon: string }
> = {
  sm: {
    input: 'h-8 text-xs px-2.5',
    row: 'px-2.5 py-1.5 text-xs',
    icon: 'size-3.5',
  },
  default: {
    input: 'h-9 text-sm px-3',
    row: 'px-3 py-2 text-sm',
    icon: 'size-4',
  },
  lg: {
    input: 'h-11 text-base px-4',
    row: 'px-4 py-2.5 text-base',
    icon: 'size-5',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Autocomplete({
  value: controlledValue,
  onValueChange,
  defaultValue,
  suggestions = [],
  onSearch,
  debounceMs = 300,
  minChars = 1,
  maxSuggestions = 8,
  placeholder = 'Type to search...',
  disabled = false,
  clearable = true,
  groupField,
  renderSuggestion,
  getSuggestionValue,
  onSelect,
  highlightMatch = true,
  recentItems = [],
  size = 'default',
  className,
  id,
  'aria-label': ariaLabel,
  name,
}: AutocompleteProps) {
  // ---- State ----
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')
  const inputValue = isControlled ? controlledValue : internalValue

  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredItems, setFilteredItems] = React.useState<AutocompleteSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [showRecent, setShowRecent] = React.useState(false)

  // Refs
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isComposing = React.useRef(false)

  // ---- Derived ----
  const isAsync = !!onSearch
  const effectiveGroupField = groupField ?? (suggestions.some((s) => s.group) ? 'group' : undefined)

  /** Flat list of *visible* suggestions (before maxSuggestions clamp) – used for keyboard nav. */
  const flatVisible = React.useMemo(() => {
    const groups = groupSuggestions(filteredItems, effectiveGroupField)
    const flat: AutocompleteSuggestion[] = []
    for (const g of groups) {
      for (const item of g.items) {
        flat.push(item)
      }
    }
    return flat.slice(0, maxSuggestions)
  }, [filteredItems, effectiveGroupField, maxSuggestions])

  // ---- Handlers ----

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange],
  )

  /** Filter local suggestions based on query. */
  const filterLocal = React.useCallback(
    (query: string) => {
      if (!query) return suggestions
      return suggestions.filter(
        (s) =>
          matchesQuery(s.label, query) ||
          matchesQuery(s.value, query) ||
          (s.description ? matchesQuery(s.description, query) : false),
      )
    },
    [suggestions],
  )

  /** Core search trigger – called on every input change. */
  const handleSearch = React.useCallback(
    (query: string) => {
      setActiveIndex(-1)

      // Recent items: show when focused and empty
      if (!query && recentItems.length > 0) {
        setFilteredItems(recentItems)
        setShowRecent(true)
        setIsOpen(true)
        return
      }
      setShowRecent(false)

      // Below min chars – close
      if (query.length < minChars) {
        setFilteredItems([])
        setIsOpen(false)
        return
      }

      if (isAsync) {
        // Async mode with debounce
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setLoading(true)
        setIsOpen(true)
        debounceRef.current = setTimeout(async () => {
          try {
            const results = await onSearch(query)
            setFilteredItems(results)
          } catch {
            setFilteredItems([])
          } finally {
            setLoading(false)
          }
        }, debounceMs)
      } else {
        // Local mode – instant filter
        const results = filterLocal(query)
        setFilteredItems(results)
        setIsOpen(results.length > 0)
      }
    },
    [isAsync, onSearch, debounceMs, minChars, filterLocal, recentItems],
  )

  // Cleanup debounce
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  /** Close dropdown when clicking outside. */
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /** Scroll active item into view. */
  React.useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const activeEl = listRef.current.querySelector(
      `[data-ac-index="${activeIndex}"]`,
    )
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // ---- Event handlers ----

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing.current) return
    const v = e.target.value
    setValue(v)
    handleSearch(v)
  }

  const handleCompositionStart = () => {
    isComposing.current = true
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false
    const v = (e.target as HTMLInputElement).value
    setValue(v)
    handleSearch(v)
  }

  const handleFocus = () => {
    if (!inputValue && recentItems.length > 0) {
      setFilteredItems(recentItems)
      setShowRecent(true)
      setIsOpen(true)
    } else if (inputValue.length >= minChars && filteredItems.length > 0) {
      setIsOpen(true)
    }
  }

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    const val = getSuggestionValue ? getSuggestionValue(suggestion) : suggestion.value
    setValue(val)
    onSelect?.(suggestion)
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setValue('')
    setFilteredItems([])
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || (flatVisible.length === 0 && !loading)) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActiveIndex(-1)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < flatVisible.length - 1 ? prev + 1 : 0,
        )
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatVisible.length - 1,
        )
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < flatVisible.length) {
          handleSelect(flatVisible[activeIndex])
        }
        break
      }
      case 'Escape': {
        setIsOpen(false)
        setActiveIndex(-1)
        break
      }
    }
  }

  // ---- Render helpers ----

  const renderSuggestionContent = (
    suggestion: AutocompleteSuggestion,
    query: string,
  ) => {
    if (renderSuggestion) return renderSuggestion(suggestion, query)

    const label = highlightMatch && !showRecent ? (
      <HighlightedText text={suggestion.label} query={query} />
    ) : (
      suggestion.label
    )

    return (
      <div className="flex items-center gap-2 min-w-0">
        {suggestion.icon && (
          <span className="shrink-0 text-muted-foreground">{suggestion.icon}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate">{label}</div>
          {suggestion.description && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {highlightMatch && !showRecent ? (
                <HighlightedText text={suggestion.description} query={query} />
              ) : (
                suggestion.description
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---- Build grouped list ----

  const grouped = React.useMemo(
    () => groupSuggestions(flatVisible, effectiveGroupField),
    [flatVisible, effectiveGroupField],
  )

  // Flatten for index mapping
  const indexMap = React.useMemo(() => {
    const map = new Map<AutocompleteSuggestion, number>()
    flatVisible.forEach((item, idx) => map.set(item, idx))
    return map
  }, [flatVisible])

  // ---- JSX ----

  const s = sizeConfig[size]

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="autocomplete-listbox"
      aria-haspopup="listbox"
    >
      {/* Input */}
      <div className="relative">
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
          aria-controls="autocomplete-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined
          }
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex w-full rounded-lg border bg-transparent shadow-xs transition-[color,box-shadow] outline-none',
            'border-input dark:bg-input/30',
            'placeholder:text-muted-foreground',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            // Focus
            'focus:border-navy-500 focus:ring-navy-500/30 focus:ring-[3px]',
            // Invalid
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            s.input,
            clearable && inputValue ? 'pr-8' : '',
          )}
        />

        {/* Loading spinner */}
        {loading && (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className={cn('animate-spin text-navy-500', s.icon)} />
          </span>
        )}

        {/* Clear button */}
        {clearable && inputValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-navy-600 focus:outline-none focus:text-navy-600 transition-colors"
            aria-label="Clear"
          >
            <X className={s.icon} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="autocomplete-listbox"
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg dark:bg-navy-950',
            'border-navy-200 dark:border-navy-800',
            'max-h-[300px] overflow-y-auto overscroll-contain',
            'scrollbar-thin scrollbar-thumb-navy-300 scrollbar-track-transparent',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150',
          )}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-navy-500" />
              <span>Searching...</span>
            </div>
          )}

          {/* No results */}
          {!loading && flatVisible.length === 0 && inputValue.length >= minChars && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {/* Recent header */}
          {showRecent && !loading && flatVisible.length > 0 && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-navy-600 dark:text-navy-400 uppercase text-xs font-semibold px-3 pt-2 pb-1',
                s.row,
              )}
            >
              <Clock className="size-3.5" />
              Recent
            </div>
          )}

          {/* Grouped / ungrouped suggestions */}
          {!loading &&
            grouped.map((g) => {
              const hasGroupName = effectiveGroupField && g.group
              return (
                <div key={g.group || '__ungrouped'}>
                  {hasGroupName && (
                    <div className="text-navy-600 dark:text-navy-400 uppercase text-xs font-semibold px-3 pt-2 pb-1">
                      {g.group}
                    </div>
                  )}
                  {g.items.map((item) => {
                    const idx = indexMap.get(item) ?? -1
                    const isActive = idx === activeIndex
                    return (
                      <div
                        key={item.value}
                        id={`autocomplete-option-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        data-ac-index={idx}
                        className={cn(
                          'cursor-pointer transition-colors',
                          s.row,
                          isActive
                            ? 'bg-navy-100 dark:bg-navy-800/50 text-navy-900 dark:text-navy-100'
                            : 'hover:bg-navy-50 dark:hover:bg-navy-900/30 text-foreground',
                        )}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        {renderSuggestionContent(item, inputValue)}
                      </div>
                    )
                  })}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export { Autocomplete }
export default Autocomplete
