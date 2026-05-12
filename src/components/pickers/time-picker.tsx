"use client"

import * as React from "react"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value?: string // Format: "HH:mm" or "HH:mm:ss"
  onChange?: (time: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showSeconds?: boolean
  hour12?: boolean
  showClear?: boolean
  id?: string
  interval?: number // Minute interval for dropdown (e.g., 15 for 0, 15, 30, 45)
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  showSeconds = false,
  hour12 = false,
  showClear = true,
  id,
  interval,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse the value
  const parts = value ? value.split(":") : []
  const hours = parts[0] ? parseInt(parts[0]) : 0
  const minutes = parts[1] ? parseInt(parts[1]) : 0
  const seconds = parts[2] ? parseInt(parts[2]) : 0

  const [localHours, setLocalHours] = React.useState(hours)
  const [localMinutes, setLocalMinutes] = React.useState(minutes)
  const [localSeconds, setLocalSeconds] = React.useState(seconds)
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    hours >= 12 ? "PM" : "AM"
  )

  React.useEffect(() => {
    if (value) {
      const p = value.split(":")
      setLocalHours(p[0] ? parseInt(p[0]) : 0)
      setLocalMinutes(p[1] ? parseInt(p[1]) : 0)
      setLocalSeconds(p[2] ? parseInt(p[2]) : 0)
      setPeriod((p[0] ? parseInt(p[0]) : 0) >= 12 ? "PM" : "AM")
    }
  }, [value])

  const emitChange = (h: number, m: number, s: number) => {
    const timeStr = showSeconds
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    onChange?.(timeStr)
  }

  const handleHourChange = (newHours: number) => {
    setLocalHours(newHours)
    emitChange(newHours, localMinutes, localSeconds)
  }

  const handleMinuteChange = (newMinutes: number) => {
    setLocalMinutes(newMinutes)
    emitChange(localHours, newMinutes, localSeconds)
  }

  const handleSecondChange = (newSeconds: number) => {
    setLocalSeconds(newSeconds)
    emitChange(localHours, localMinutes, newSeconds)
  }

  const handlePeriodToggle = () => {
    const newPeriod = period === "AM" ? "PM" : "AM"
    setPeriod(newPeriod)
    let newHours = localHours
    if (newPeriod === "PM" && localHours < 12) {
      newHours = localHours + 12
    } else if (newPeriod === "AM" && localHours >= 12) {
      newHours = localHours - 12
    }
    setLocalHours(newHours)
    emitChange(newHours, localMinutes, localSeconds)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const setNow = () => {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    const s = now.getSeconds()
    setLocalHours(h)
    setLocalMinutes(m)
    setLocalSeconds(s)
    setPeriod(h >= 12 ? "PM" : "AM")
    emitChange(h, m, s)
  }

  const incrementHours = () => {
    const max = hour12 ? 12 : 23
    const newH = localHours >= max ? (hour12 ? 1 : 0) : localHours + 1
    handleHourChange(newH)
  }

  const decrementHours = () => {
    const min = hour12 ? 1 : 0
    const newH = localHours <= min ? (hour12 ? 12 : 23) : localHours - 1
    handleHourChange(newH)
  }

  const incrementMinutes = () => {
    const newM = localMinutes >= 59 ? 0 : localMinutes + (interval || 1)
    handleMinuteChange(Math.min(newM, 59))
  }

  const decrementMinutes = () => {
    const newM = localMinutes <= 0 ? 59 : localMinutes - (interval || 1)
    handleMinuteChange(Math.max(newM, 0))
  }

  const incrementSeconds = () => {
    const newS = localSeconds >= 59 ? 0 : localSeconds + 1
    handleSecondChange(newS)
  }

  const decrementSeconds = () => {
    const newS = localSeconds <= 0 ? 59 : localSeconds - 1
    handleSecondChange(newS)
  }

  // Display value
  const displayValue = React.useMemo(() => {
    if (!value) return null
    if (hour12) {
      const h12 = localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours
      const timeStr = showSeconds
        ? `${String(h12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")}:${String(localSeconds).padStart(2, "0")}`
        : `${String(h12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")}`
      return `${timeStr} ${period}`
    }
    return showSeconds
      ? `${String(localHours).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")}:${String(localSeconds).padStart(2, "0")}`
      : `${String(localHours).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")}`
  }, [value, localHours, localMinutes, localSeconds, period, hour12, showSeconds])

  // Generate quick select times
  const quickTimes = React.useMemo(() => {
    if (!interval) return []
    const times: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += interval) {
        times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
      }
    }
    return times
  }, [interval])

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
          <Clock className="mr-2 h-4 w-4 text-navy-500" />
          {displayValue ? <span>{displayValue}</span> : <span>{placeholder}</span>}
          {showClear && value && (
            <X
              className="ml-auto h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Clock className="h-3.5 w-3.5 text-navy-500" />
            <span className="text-xs font-medium text-navy-600 dark:text-navy-300">Select Time</span>
          </div>

          <div className="flex items-center justify-center gap-1">
            {/* Hours spinner */}
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={incrementHours} type="button">
                <span className="text-xs">▲</span>
              </Button>
              <Input
                className="h-8 w-14 text-center text-sm font-bold p-0"
                value={hour12 ? (localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours) : localHours}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val)) handleHourChange(hour12 ? val : Math.min(23, Math.max(0, val)))
                }}
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={decrementHours} type="button">
                <span className="text-xs">▼</span>
              </Button>
            </div>

            <span className="text-lg font-bold">:</span>

            {/* Minutes spinner */}
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={incrementMinutes} type="button">
                <span className="text-xs">▲</span>
              </Button>
              <Input
                className="h-8 w-14 text-center text-sm font-bold p-0"
                value={String(localMinutes).padStart(2, "0")}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val)) handleMinuteChange(Math.min(59, Math.max(0, val)))
                }}
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={decrementMinutes} type="button">
                <span className="text-xs">▼</span>
              </Button>
            </div>

            {/* Seconds (optional) */}
            {showSeconds && (
              <>
                <span className="text-lg font-bold">:</span>
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={incrementSeconds} type="button">
                    <span className="text-xs">▲</span>
                  </Button>
                  <Input
                    className="h-8 w-14 text-center text-sm font-bold p-0"
                    value={String(localSeconds).padStart(2, "0")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (!isNaN(val)) handleSecondChange(Math.min(59, Math.max(0, val)))
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={decrementSeconds} type="button">
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

          {/* Quick select times */}
          {quickTimes.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Quick Select</p>
              <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                {quickTimes.map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const [h, m] = time.split(":").map(Number)
                      handleHourChange(h)
                      handleMinuteChange(m)
                      setPeriod(h >= 12 ? "PM" : "AM")
                    }}
                    type="button"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Now button */}
          <div className="mt-3 flex justify-center gap-2 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-navy-600 dark:text-navy-300"
              onClick={setNow}
              type="button"
            >
              Now
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setOpen(false)}
              type="button"
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * A simple time input field without popover
 */
export function TimeInput({
  value,
  onChange,
  placeholder = "HH:mm",
  disabled = false,
  className,
  id,
}: {
  value?: string
  onChange?: (time: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type="time"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9"
      />
    </div>
  )
}
