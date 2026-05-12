"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface AsyncSelectOption {
  value: string
  label: string
  group?: string
  disabled?: boolean
}

interface AsyncSelectProps {
  /** Function to load options. Receives search query, returns array of options */
  loadOptions: (query: string) => Promise<AsyncSelectOption[]>
  value?: string
  onChange?: (value: string | undefined) => void
  /** Initial options to display before search */
  defaultOptions?: AsyncSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  loadingMessage?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  clearable?: boolean
  id?: string
  /** Debounce delay in ms for search */
  debounceMs?: number
  /** Minimum characters to trigger search */
  minChars?: number
  size?: "sm" | "default" | "lg"
}

export function AsyncSelect({
  loadOptions,
  value,
  onChange,
  defaultOptions = [],
  placeholder = "Select an option",
  searchPlaceholder = "Type to search...",
  loadingMessage = "Loading...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  triggerClassName,
  clearable = true,
  id,
  debounceMs = 300,
  minChars = 1,
  size = "default",
}: AsyncSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<AsyncSelectOption[]>(defaultOptions)
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  // Find selected option from current options or default options
  const selectedOption = [...options, ...defaultOptions].find(
    (opt) => opt.value === value
  )

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearch(query)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (query.length < minChars) {
        setOptions(defaultOptions)
        return
      }

      setLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await loadOptions(query)
          setOptions(results)
        } catch (error) {
          console.error("Error loading options:", error)
          setOptions([])
        } finally {
          setLoading(false)
        }
      }, debounceMs)
    },
    [loadOptions, debounceMs, minChars, defaultOptions]
  )

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  // Group options
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, AsyncSelectOption[]> = {}
    options.forEach((opt) => {
      const group = opt.group || ""
      if (!groups[group]) groups[group] = []
      groups[group].push(opt)
    })
    return groups
  }, [options])

  const sizeClasses = {
    sm: "h-8 text-xs",
    default: "h-9 text-sm",
    lg: "h-11 text-base",
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            sizeClasses[size],
            triggerClassName
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-1">
            {clearable && value && (
              <X
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[--radix-popover-trigger-width] p-0", className)}
        align="start"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
          </div>
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                {loadingMessage}
              </div>
            ) : options.length === 0 && search.length >= minChars ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : options.length === 0 && search.length < minChars ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least {minChars} character(s) to search
              </div>
            ) : (
              Object.entries(groupedOptions).map(([group, opts]) => (
                <CommandGroup key={group} heading={group || undefined}>
                  {opts.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.disabled}
                      onSelect={(currentValue) => {
                        onChange?.(
                          currentValue === value ? undefined : currentValue
                        )
                        setOpen(false)
                        setSearch("")
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
