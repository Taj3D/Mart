"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  dateFormat?: string
  showClear?: boolean
  id?: string
  showSeconds?: boolean
  hour12?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled = false,
  className,
  dateFormat = "dd/MM/yyyy HH:mm",
  showClear = true,
  id,
  showSeconds = false,
  hour12 = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [hours, setHours] = React.useState(value ? value.getHours() : 0)
  const [minutes, setMinutes] = React.useState(value ? value.getMinutes() : 0)
  const [seconds, setSeconds] = React.useState(value ? value.getSeconds() : 0)
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    value && value.getHours() >= 12 ? "PM" : "AM"
  )

  // Sync state with value prop
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setHours(value.getHours())
      setMinutes(value.getMinutes())
      setSeconds(value.getSeconds())
      setPeriod(value.getHours() >= 12 ? "PM" : "AM")
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Apply current time to the selected date
      const newDate = new Date(date)
      if (hour12) {
        const h = period === "PM" && hours < 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours
        newDate.setHours(h, minutes, seconds)
      } else {
        newDate.setHours(hours, minutes, seconds)
      }
      onChange?.(newDate)
    }
  }

  const handleTimeChange = (newHours: number, newMinutes: number, newSeconds?: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
    if (newSeconds !== undefined) setSeconds(newSeconds)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (hour12) {
        const h = period === "PM" && newHours < 12 ? newHours + 12 : newHours === 12 && period === "AM" ? 0 : newHours
        newDate.setHours(h, newMinutes, newSeconds ?? seconds)
      } else {
        newDate.setHours(newHours, newMinutes, newSeconds ?? seconds)
      }
      onChange?.(newDate)
    }
  }

  const handlePeriodToggle = () => {
    const newPeriod = period === "AM" ? "PM" : "AM"
    setPeriod(newPeriod)
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (newPeriod === "PM" && hours < 12) {
        newDate.setHours(hours + 12)
      } else if (newPeriod === "AM" && hours >= 12) {
        newDate.setHours(hours - 12)
      }
      onChange?.(newDate)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(undefined)
    setHours(0)
    setMinutes(0)
    setSeconds(0)
    setPeriod("AM")
    onChange?.(undefined)
  }

  const incrementHours = () => {
    const max = hour12 ? 12 : 23
    const newHours = hours >= max ? (hour12 ? 1 : 0) : hours + 1
    handleTimeChange(newHours, minutes)
  }

  const decrementHours = () => {
    const min = hour12 ? 1 : 0
    const newHours = hours <= min ? (hour12 ? 12 : 23) : hours - 1
    handleTimeChange(newHours, minutes)
  }

  const incrementMinutes = () => {
    const newMinutes = minutes >= 59 ? 0 : minutes + 1
    handleTimeChange(hours, newMinutes)
  }

  const decrementMinutes = () => {
    const newMinutes = minutes <= 0 ? 59 : minutes - 1
    handleTimeChange(hours, newMinutes)
  }

  const incrementSeconds = () => {
    const newSeconds = seconds >= 59 ? 0 : seconds + 1
    handleTimeChange(hours, minutes, newSeconds)
  }

  const decrementSeconds = () => {
    const newSeconds = seconds <= 0 ? 59 : seconds - 1
    handleTimeChange(hours, minutes, newSeconds)
  }

  const setNow = () => {
    const now = new Date()
    setSelectedDate(now)
    setHours(now.getHours())
    setMinutes(now.getMinutes())
    setSeconds(now.getSeconds())
    setPeriod(now.getHours() >= 12 ? "PM" : "AM")
    onChange?.(now)
  }

  const displayFormat = showSeconds
    ? dateFormat.replace("HH:mm", "HH:mm:ss")
    : dateFormat

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-navy-500" />
          {value ? format(value, displayFormat) : <span>{placeholder}</span>}
          {showClear && value && (
            <X
              className="ml-auto h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />

          {/* Time Picker */}
          <div className="border-t sm:border-t-0 sm:border-l border-border p-3">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="h-3.5 w-3.5 text-navy-500" />
              <span className="text-xs font-medium text-navy-600 dark:text-navy-300">Time</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              {/* Hours */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={incrementHours}
                  type="button"
                >
                  <span className="text-xs">▲</span>
                </Button>
                <Input
                  className="h-8 w-12 text-center text-sm font-bold p-0"
                  value={hour12 ? (hours === 0 ? 12 : hours > 12 ? hours - 12 : hours) : hours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) {
                      handleTimeChange(hour12 ? (val > 12 ? val : val) : Math.min(23, Math.max(0, val)), minutes)
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={decrementHours}
                  type="button"
                >
                  <span className="text-xs">▼</span>
                </Button>
              </div>

              <span className="text-lg font-bold">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={incrementMinutes}
                  type="button"
                >
                  <span className="text-xs">▲</span>
                </Button>
                <Input
                  className="h-8 w-12 text-center text-sm font-bold p-0"
                  value={String(minutes).padStart(2, "0")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val)) {
                      handleTimeChange(hours, Math.min(59, Math.max(0, val)))
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={decrementMinutes}
                  type="button"
                >
                  <span className="text-xs">▼</span>
                </Button>
              </div>

              {/* Seconds (optional) */}
              {showSeconds && (
                <>
                  <span className="text-lg font-bold">:</span>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={incrementSeconds}
                      type="button"
                    >
                      <span className="text-xs">▲</span>
                    </Button>
                    <Input
                      className="h-8 w-12 text-center text-sm font-bold p-0"
                      value={String(seconds).padStart(2, "0")}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) {
                          handleTimeChange(hours, minutes, Math.min(59, Math.max(0, val)))
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={decrementSeconds}
                      type="button"
                    >
                      <span className="text-xs">▼</span>
                    </Button>
                  </div>
                </>
              )}

              {/* AM/PM Toggle */}
              {hour12 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-1 h-8 w-12 text-xs font-bold"
                  onClick={handlePeriodToggle}
                  type="button"
                >
                  {period}
                </Button>
              )}
            </div>

            {/* Now button */}
            <div className="mt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-navy-600 dark:text-navy-300"
                onClick={setNow}
                type="button"
              >
                Now
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
