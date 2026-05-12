"use client"

import * as React from "react"
import { X, ChevronsUpDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export interface MultiSelectOption {
  value: string
  label: string
  group?: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  maxCount?: number
  clearable?: boolean
  id?: string
  size?: "sm" | "default" | "lg"
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  triggerClassName,
  maxCount,
  clearable = true,
  id,
  size = "default",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedOptions = options.filter((opt) => value.includes(opt.value))
  const displayedOptions = maxCount
    ? selectedOptions.slice(0, maxCount)
    : selectedOptions
  const remainingCount = maxCount
    ? selectedOptions.length - maxCount
    : 0

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange?.(newValue)
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(value.filter((v) => v !== optionValue))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.([])
  }

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  // Group filtered options
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, MultiSelectOption[]> = {}
    filteredOptions.forEach((opt) => {
      const group = opt.group || ""
      if (!groups[group]) groups[group] = []
      groups[group].push(opt)
    })
    return groups
  }, [filteredOptions])

  const sizeClasses = {
    sm: "min-h-8 text-xs",
    default: "min-h-9 text-sm",
    lg: "min-h-11 text-base",
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
            "w-full justify-between font-normal h-auto",
            value.length === 0 && "text-muted-foreground",
            sizeClasses[size],
            triggerClassName
          )}
        >
          <span className="flex flex-wrap gap-1 flex-1 items-center truncate">
            {value.length === 0 ? (
              placeholder
            ) : (
              <>
                {displayedOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200 hover:bg-navy-200 dark:hover:bg-navy-700 gap-0.5 px-1.5 py-0 text-xs"
                  >
                    {opt.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => handleRemove(opt.value, e)}
                    />
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-navy-200 text-navy-700 dark:bg-navy-700 dark:text-navy-200 px-1.5 py-0 text-xs"
                  >
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-1">
            {clearable && value.length > 0 && (
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
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
            />
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {Object.entries(groupedOptions).map(([group, opts]) => (
              <CommandGroup key={group} heading={group || undefined}>
                {opts.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    onSelect={() => handleSelect(opt.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-navy-300 dark:border-navy-600",
                        value.includes(opt.value)
                          ? "bg-navy-600 text-white border-navy-600"
                          : "opacity-50"
                      )}
                    >
                      {value.includes(opt.value) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    <span>{opt.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
