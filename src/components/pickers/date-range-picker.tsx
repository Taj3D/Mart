"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
  showClear?: boolean
  id?: string
  minDate?: Date
  maxDate?: Date
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  className,
  formatStr = "dd/MM/yyyy",
  showClear = true,
  id,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const displayValue = React.useMemo(() => {
    if (value?.from) {
      if (value.to) {
        return `${format(value.from, formatStr)} → ${format(value.to, formatStr)}`
      }
      return format(value.from, formatStr)
    }
    return null
  }, [value, formatStr])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-navy-500 shrink-0" />
          {displayValue ? (
            <span className="truncate">{displayValue}</span>
          ) : (
            <span>{placeholder}</span>
          )}
          {showClear && value?.from && (
            <X
              className="ml-auto h-3.5 w-3.5 text-muted-foreground hover:text-foreground shrink-0"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange?.(range)
            if (range?.to) {
              setOpen(false)
            }
          }}
          numberOfMonths={2}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
