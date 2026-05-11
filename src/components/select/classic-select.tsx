"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SelectOption } from "./searchable-select"

/**
 * ClassicSelect - Classic Select2-style dropdown with gradient arrow
 * Matches the select2-container--classic theme
 */
interface ClassicSelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  clearable?: boolean
  id?: string
  size?: "sm" | "default" | "lg"
}

export function ClassicSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  triggerClassName,
  clearable = true,
  id,
  size = "default",
}: ClassicSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const sizeClasses = {
    sm: "h-[30px] text-xs",
    default: "h-[28px] text-sm",
    lg: "h-[46px] text-lg",
  }

  return (
    <div className={cn("ims-select-container ims-select-container--single ims-select-theme-classic", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls="classic-select-listbox"
            aria-haspopup="listbox"
            disabled={disabled}
            className={cn(
              "ims-select-trigger flex items-center w-full rounded-md border text-left font-normal",
              "bg-gradient-to-b from-white to-navy-50 dark:from-navy-800 dark:to-navy-900",
              "border-navy-300 dark:border-navy-600",
              "focus:border-navy-500 focus:outline-none focus:ring-[3px] focus:ring-navy-500/20",
              "transition-colors",
              !value && "text-navy-300 dark:text-navy-500",
              open && "border-navy-500",
              disabled && "opacity-65 cursor-not-allowed bg-navy-50 dark:bg-navy-900",
              sizeClasses[size],
              triggerClassName
            )}
          >
            <span className="ims-select-rendered flex-1 truncate px-2">
              {selectedOption ? (
                <span className="text-navy-700 dark:text-navy-100">{selectedOption.label}</span>
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
            <span className="flex items-center gap-1 shrink-0 mr-1">
              {clearable && value && (
                <X
                  className="h-3.5 w-3.5 text-navy-400 hover:text-navy-700 dark:hover:text-navy-200"
                  onClick={handleClear}
                />
              )}
              <span className="ims-select-arrow w-5 h-5 flex items-center justify-center border-l border-navy-200 dark:border-navy-600 rounded-r bg-gradient-to-b from-navy-50 to-navy-100 dark:from-navy-700 dark:to-navy-800">
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 text-navy-500 dark:text-navy-300 transition-transform duration-200",
                  open && "rotate-180"
                )} />
              </span>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 border-navy-300 dark:border-navy-600"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    onSelect={(currentValue) => {
                      onChange?.(currentValue === value ? undefined : currentValue)
                      setOpen(false)
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
