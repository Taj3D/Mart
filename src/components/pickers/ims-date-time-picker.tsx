"use client"

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  getISOWeek,
  getYear,
  getMonth,
  getDate,
  setMonth,
  setYear,
  setHours,
  setMinutes,
  setSeconds,
  setDate as dfSetDate,
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  startOfYear,
  parse,
} from "date-fns"
import type { Locale } from "date-fns"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  X,
  Crosshair,
  Trash2,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/* ================================================================
   TYPES & INTERFACES
   ================================================================ */

/** View modes for the date picker calendar */
export type CalendarViewMode = "days" | "months" | "years" | "decades"

/** Toolbar placement */
export type ToolbarPlacement = "top" | "default" | "bottom"

/** Widget positioning */
export interface WidgetPositioning {
  vertical?: "auto" | "top" | "bottom"
  horizontal?: "auto" | "left" | "right"
}

/** Time interval */
export interface TimeInterval {
  from: Date
  to: Date
}

/** Custom icon set — replaces the original Glyphicons with Lucide icons */
export interface DateTimePickerIcons {
  time?: LucideIcon
  date?: LucideIcon
  up?: LucideIcon
  down?: LucideIcon
  previous?: LucideIcon
  next?: LucideIcon
  today?: LucideIcon
  clear?: LucideIcon
  close?: LucideIcon
}

/** Custom tooltips — matching the original bootstrap-datetimepicker tooltips */
export interface DateTimePickerTooltips {
  today?: string
  clear?: string
  close?: string
  selectMonth?: string
  prevMonth?: string
  nextMonth?: string
  selectYear?: string
  prevYear?: string
  nextYear?: string
  selectDecade?: string
  prevDecade?: string
  nextDecade?: string
  prevCentury?: string
  nextCentury?: string
  pickHour?: string
  incrementHour?: string
  decrementHour?: string
  pickMinute?: string
  incrementMinute?: string
  decrementMinute?: string
  pickSecond?: string
  incrementSecond?: string
  decrementSecond?: string
  togglePeriod?: string
  selectTime?: string
}

/** Default tooltips */
const DEFAULT_TOOLTIPS: Required<DateTimePickerTooltips> = {
  today: "Go to today",
  clear: "Clear selection",
  close: "Close the picker",
  selectMonth: "Select Month",
  prevMonth: "Previous Month",
  nextMonth: "Next Month",
  selectYear: "Select Year",
  prevYear: "Previous Year",
  nextYear: "Next Year",
  selectDecade: "Select Decade",
  prevDecade: "Previous Decade",
  nextDecade: "Next Decade",
  prevCentury: "Previous Century",
  nextCentury: "Next Century",
  pickHour: "Pick Hour",
  incrementHour: "Increment Hour",
  decrementHour: "Decrement Hour",
  pickMinute: "Pick Minute",
  incrementMinute: "Increment Minute",
  decrementMinute: "Decrement Minute",
  pickSecond: "Pick Second",
  incrementSecond: "Increment Second",
  decrementSecond: "Decrement Second",
  togglePeriod: "Toggle AM/PM",
  selectTime: "Select Time",
}

/** Default icons — Lucide equivalents of Bootstrap Glyphicons */
const DEFAULT_ICONS: Required<DateTimePickerIcons> = {
  time: Clock,
  date: CalendarIcon,
  up: ChevronUp,
  down: ChevronDown,
  previous: ChevronLeft,
  next: ChevronRight,
  today: Crosshair,
  clear: Trash2,
  close: XCircle,
}

/** Props for IMSDateTimePicker — comprehensive API matching bootstrap-datetimepicker */
export interface IMSDateTimePickerProps {
  // ---- Value ----
  value?: Date
  onChange?: (date: Date | undefined) => void

  // ---- Format ----
  /** date-fns format string. Auto-detects 12/24 hour from format. Default: "dd/MM/yyyy HH:mm" */
  format?: string

  // ---- Date Restrictions ----
  minDate?: Date
  maxDate?: Date
  /** Array of specific dates to disable */
  disabledDates?: Date[]
  /** Array of dates that are the ONLY selectable ones (whitelist) */
  enabledDates?: Date[]
  /** Array of day-of-week indices to disable (0=Sun, 1=Mon, ..., 6=Sat) */
  daysOfWeekDisabled?: number[]

  // ---- Time Restrictions ----
  /** Minute stepping (e.g., 5 = 0, 5, 10, 15...). Default: 1 */
  stepping?: number
  /** Array of hour values (0-23) to disable */
  disabledHours?: number[]
  /** Array of hour values (0-23) that are the ONLY selectable ones */
  enabledHours?: number[]
  /** Array of time intervals to disable */
  disabledTimeIntervals?: TimeInterval[]

  // ---- Layout ----
  /** Always visible (no popover). Default: false */
  inline?: boolean
  /** Show date and time pickers side by side. Default: false */
  sideBySide?: boolean

  // ---- Toolbar ----
  showTodayButton?: boolean
  showClear?: boolean
  showClose?: boolean
  /** Toolbar button placement. Default: "default" */
  toolbarPlacement?: ToolbarPlacement

  // ---- Behavior ----
  /** Don't close picker after selection. Default: false */
  keepOpen?: boolean
  /** Allow invalid dates to remain in input. Default: false */
  keepInvalid?: boolean
  /** Auto-focus input when picker opens. Default: true */
  focusOnShow?: boolean
  /** Focus on input opens picker. Default: false */
  allowInputToggle?: boolean
  /** Auto-fill current date/time on empty input. Default: false */
  useCurrent?: boolean | "year" | "month" | "day" | "hour" | "minute"
  /** Default date when no value */
  defaultDate?: Date
  /** Initial calendar view mode. Default: "days" */
  viewMode?: CalendarViewMode

  // ---- Calendar ----
  /** Show ISO week numbers. Default: false */
  calendarWeeks?: boolean
  /** Format for the day view header. Default: "MMMM yyyy" */
  dayViewHeaderFormat?: string

  // ---- Widget ----
  widgetPositioning?: WidgetPositioning

  // ---- Customization ----
  icons?: DateTimePickerIcons
  tooltips?: DateTimePickerTooltips

  // ---- General ----
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  locale?: Locale
}

/* ================================================================
   HELPERS
   ================================================================ */

/** Parse format string to detect which components are enabled */
function parseFormatComponents(fmt: string) {
  const clean = fmt.replace(/\[[^\]]*\]/g, "") // remove escaped parts
  const lower = clean.toLowerCase()
  return {
    hasYear: /y/i.test(clean),
    hasMonth: /m(?!o)/i.test(clean) && lower.indexOf("m") !== -1,
    hasDay: /d/i.test(clean) && lower.indexOf("d") !== -1,
    hasHours: lower.indexOf("h") !== -1,
    hasMinutes: lower.indexOf("m") !== -1 && !/mo/i.test(clean),
    hasSeconds: lower.indexOf("s") !== -1,
    is12Hour: lower.indexOf("a") !== -1 || (lower.indexOf("h") !== -1 && lower.indexOf("hh") === -1 && /[h]/.test(lower)),
  }
}

/** Check if a date is disabled based on restriction rules */
function isDateDisabled(
  date: Date,
  opts: {
    minDate?: Date
    maxDate?: Date
    disabledDates?: Date[]
    enabledDates?: Date[]
    daysOfWeekDisabled?: number[]
  }
): boolean {
  const { minDate, maxDate, disabledDates, enabledDates, daysOfWeekDisabled } = opts

  if (minDate && isBefore(date, minDate) && !isSameDay(date, minDate)) return true
  if (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate)) return true
  if (daysOfWeekDisabled && daysOfWeekDisabled.length > 0 && daysOfWeekDisabled.includes(getDay(date))) return true
  if (disabledDates && disabledDates.length > 0 && disabledDates.some((d) => isSameDay(date, d))) return true
  if (enabledDates && enabledDates.length > 0 && !enabledDates.some((d) => isSameDay(date, d))) return true

  return false
}

/** Check if an hour is disabled */
function isHourDisabled(
  hour: number,
  date: Date,
  opts: {
    disabledHours?: number[]
    enabledHours?: number[]
    disabledTimeIntervals?: TimeInterval[]
  }
): boolean {
  const { disabledHours, enabledHours, disabledTimeIntervals } = opts

  if (disabledHours && disabledHours.length > 0 && disabledHours.includes(hour)) return true
  if (enabledHours && enabledHours.length > 0 && !enabledHours.includes(hour)) return true
  if (disabledTimeIntervals && disabledTimeIntervals.length > 0) {
    const testDate = setHours(setMinutes(setSeconds(date, 0), 0), hour)
    for (const interval of disabledTimeIntervals) {
      if ((isAfter(testDate, interval.from) || testDate.getTime() === interval.from.getTime()) &&
          (isBefore(testDate, interval.to) || testDate.getTime() === interval.to.getTime())) {
        return true
      }
    }
  }
  return false
}

/** Snap minutes to stepping */
function snapToStepping(minutes: number, stepping: number): number {
  if (stepping <= 1) return minutes
  return Math.round(minutes / stepping) * stepping
}

/** Get decade range for a given year */
function getDecadeRange(year: number): { start: number; end: number } {
  const start = year - (year % 10)
  return { start, end: start + 9 }
}

/** Get century range for a given year */
function getCenturyRange(year: number): { start: number; end: number } {
  const start = year - (year % 100) - 1
  return { start, end: start + 99 }
}

/* ================================================================
   CALENDAR VIEWS
   ================================================================ */

/** Days view — shows a full month calendar grid */
function DaysView({
  viewDate,
  selectedDate,
  calendarWeeks,
  dayViewHeaderFormat,
  minDate,
  maxDate,
  disabledDates,
  enabledDates,
  daysOfWeekDisabled,
  onNavigate,
  onSelectDay,
  onSwitchView,
  locale,
  tooltips,
  icons,
}: {
  viewDate: Date
  selectedDate?: Date
  calendarWeeks: boolean
  dayViewHeaderFormat: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  enabledDates?: Date[]
  daysOfWeekDisabled?: number[]
  onNavigate: (direction: "prev" | "next") => void
  onSelectDay: (date: Date) => void
  onSwitchView: () => void
  locale?: Locale
  tooltips: Required<DateTimePickerTooltips>
  icons: Required<DateTimePickerIcons>
}) {
  const PrevIcon = icons.previous
  const NextIcon = icons.next
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const today = new Date()

  // Weekday headers
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  })

  // Can navigate?
  const canPrev = !minDate || isAfter(viewDate, startOfMonth(minDate)) || isSameMonth(viewDate, minDate)
  const canNext = !maxDate || isBefore(viewDate, endOfMonth(maxDate)) || isSameMonth(viewDate, maxDate)

  return (
    <div className="ims-dtp-days">
      <div className="flex items-center justify-between px-1 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onNavigate("prev")}
          disabled={!canPrev}
          title={tooltips.prevMonth}
          type="button"
        >
          <PrevIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-sm font-semibold text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          onClick={onSwitchView}
          title={tooltips.selectMonth}
          type="button"
        >
          {format(viewDate, dayViewHeaderFormat, { locale })}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onNavigate("next")}
          disabled={!canNext}
          title={tooltips.nextMonth}
          type="button"
        >
          <NextIcon className="h-4 w-4" />
        </Button>
      </div>
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr>
            {calendarWeeks && <th className="w-8 text-[10px] text-muted-foreground font-normal pb-1">#</th>}
            {weekDays.map((day) => (
              <th key={day.toISOString()} className="w-8 text-[10px] text-muted-foreground font-normal pb-1">
                {format(day, "EEEEE", { locale })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIdx) => {
            const weekDays = days.slice(weekIdx * 7, (weekIdx + 1) * 7)
            return (
              <tr key={weekIdx}>
                {calendarWeeks && (
                  <td className="text-[10px] text-muted-foreground py-0.5">
                    {getISOWeek(weekDays[0])}
                  </td>
                )}
                {weekDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, viewDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, today)
                  const isDisabled = isDateDisabled(day, { minDate, maxDate, disabledDates, enabledDates, daysOfWeekDisabled })
                  const isWeekend = getDay(day) === 0 || getDay(day) === 6

                  return (
                    <td key={day.toISOString()} className="p-0">
                      <button
                        type="button"
                        disabled={isDisabled}
                        className={cn(
                          "h-7 w-7 rounded text-xs transition-colors inline-flex items-center justify-center",
                          "hover:bg-navy-50 dark:hover:bg-navy-900/30",
                          !isCurrentMonth && "text-muted-foreground/40",
                          isCurrentMonth && !isSelected && !isDisabled && "text-foreground",
                          isSelected && "bg-navy-600 text-white hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-600",
                          isToday && !isSelected && "ring-1 ring-navy-500 font-bold text-navy-700 dark:text-navy-300",
                          isDisabled && "text-muted-foreground/40 line-through cursor-not-allowed hover:bg-transparent",
                          isWeekend && isCurrentMonth && !isSelected && !isDisabled && "text-navy-400 dark:text-navy-500",
                        )}
                        onClick={() => !isDisabled && onSelectDay(day)}
                      >
                        {getDate(day)}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Months view — shows 12 months of the year */
function MonthsView({
  viewDate,
  selectedDate,
  onNavigate,
  onSelectMonth,
  onSwitchView,
  minDate,
  maxDate,
  tooltips,
  icons,
}: {
  viewDate: Date
  selectedDate?: Date
  onNavigate: (direction: "prev" | "next") => void
  onSelectMonth: (month: number) => void
  onSwitchView: () => void
  minDate?: Date
  maxDate?: Date
  tooltips: Required<DateTimePickerTooltips>
  icons: Required<DateTimePickerIcons>
}) {
  const PrevIcon = icons.previous
  const NextIcon = icons.next
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="ims-dtp-months">
      <div className="flex items-center justify-between px-1 py-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("prev")} title={tooltips.prevYear} type="button">
          <PrevIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-sm font-semibold text-navy-700 dark:text-navy-200" onClick={onSwitchView} title={tooltips.selectYear} type="button">
          {getYear(viewDate)}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("next")} title={tooltips.nextYear} type="button">
          <NextIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {months.map((m) => {
          const testDate = setMonth(viewDate, m)
          const isSelected = selectedDate && isSameMonth(testDate, selectedDate) && isSameYear(testDate, selectedDate)
          const isDisabled = isDateDisabled(startOfMonth(testDate), { minDate, maxDate })
          return (
            <button
              key={m}
              type="button"
              disabled={isDisabled}
              className={cn(
                "h-10 rounded text-xs font-medium transition-colors",
                "hover:bg-navy-50 dark:hover:bg-navy-900/30",
                isSelected && "bg-navy-600 text-white hover:bg-navy-700",
                isDisabled && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                !isSelected && !isDisabled && "text-foreground",
              )}
              onClick={() => !isDisabled && onSelectMonth(m)}
            >
              {format(testDate, "MMM")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Years view — shows a range of years */
function YearsView({
  viewDate,
  selectedDate,
  onNavigate,
  onSelectYear,
  onSwitchView,
  minDate,
  maxDate,
  tooltips,
  icons,
}: {
  viewDate: Date
  selectedDate?: Date
  onNavigate: (direction: "prev" | "next") => void
  onSelectYear: (year: number) => void
  onSwitchView: () => void
  minDate?: Date
  maxDate?: Date
  tooltips: Required<DateTimePickerTooltips>
  icons: Required<DateTimePickerIcons>
}) {
  const PrevIcon = icons.previous
  const NextIcon = icons.next
  const currentYear = getYear(viewDate)
  const startYear = currentYear - 5
  const endYear = currentYear + 6
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  return (
    <div className="ims-dtp-years">
      <div className="flex items-center justify-between px-1 py-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("prev")} title={tooltips.prevDecade} type="button">
          <PrevIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-sm font-semibold text-navy-700 dark:text-navy-200" onClick={onSwitchView} title={tooltips.selectDecade} type="button">
          {startYear}-{endYear}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("next")} title={tooltips.nextDecade} type="button">
          <NextIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {years.map((year) => {
          const testDate = setYear(startOfYear(viewDate), year)
          const isSelected = selectedDate && getYear(selectedDate) === year
          const isDisabled = isDateDisabled(startOfYear(testDate), { minDate, maxDate })
          return (
            <button
              key={year}
              type="button"
              disabled={isDisabled}
              className={cn(
                "h-10 rounded text-xs font-medium transition-colors",
                "hover:bg-navy-50 dark:hover:bg-navy-900/30",
                isSelected && "bg-navy-600 text-white hover:bg-navy-700",
                isDisabled && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                !isSelected && !isDisabled && "text-foreground",
              )}
              onClick={() => !isDisabled && onSelectYear(year)}
            >
              {year}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Decades view — shows 10 decades (100 years) */
function DecadesView({
  viewDate,
  selectedDate,
  onNavigate,
  onSelectDecade,
  minDate,
  maxDate,
  tooltips,
  icons,
}: {
  viewDate: Date
  selectedDate?: Date
  onNavigate: (direction: "prev" | "next") => void
  onSelectDecade: (decadeMiddleYear: number) => void
  minDate?: Date
  maxDate?: Date
  tooltips: Required<DateTimePickerTooltips>
  icons: Required<DateTimePickerIcons>
}) {
  const PrevIcon = icons.previous
  const NextIcon = icons.next
  const currentYear = getYear(viewDate)
  const centuryStart = currentYear - (currentYear % 100) - 1
  const decades: { label: string; year: number }[] = []

  for (let i = 0; i < 10; i++) {
    const decadeStart = centuryStart + i * 10 + 1
    const decadeEnd = decadeStart + 11
    decades.push({
      label: `${decadeStart} - ${decadeEnd}`,
      year: decadeStart + 5,
    })
  }

  return (
    <div className="ims-dtp-decades">
      <div className="flex items-center justify-between px-1 py-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("prev")} title={tooltips.prevCentury} type="button">
          <PrevIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-navy-700 dark:text-navy-200">
          {centuryStart + 1}-{centuryStart + 100}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("next")} title={tooltips.nextCentury} type="button">
          <NextIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {decades.map((d) => {
          const isSelected = selectedDate && getYear(selectedDate) >= d.year - 5 && getYear(selectedDate) <= d.year + 6
          const isDisabled = (minDate && d.year < getYear(minDate)) || (maxDate && d.year > getYear(maxDate))
          return (
            <button
              key={d.year}
              type="button"
              disabled={isDisabled}
              className={cn(
                "h-10 rounded text-xs font-medium transition-colors",
                "hover:bg-navy-50 dark:hover:bg-navy-900/30",
                isSelected && "bg-navy-600 text-white hover:bg-navy-700",
                isDisabled && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                !isSelected && !isDisabled && "text-foreground",
              )}
              onClick={() => !isDisabled && onSelectDecade(d.year)}
            >
              {d.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================
   TIME PICKER VIEWS
   ================================================================ */

/** Time spinner control */
function TimeSpinner({
  value,
  onIncrement,
  onDecrement,
  onInputChange,
  displayValue,
  incrementTitle,
  decrementTitle,
  inputTitle,
  isDisabled: spinnerDisabled,
  UpIcon,
  DownIcon,
}: {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  onInputChange: (val: number) => void
  displayValue: string
  incrementTitle: string
  decrementTitle: string
  inputTitle: string
  isDisabled?: boolean
  UpIcon: LucideIcon
  DownIcon: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onIncrement}
        disabled={spinnerDisabled}
        title={incrementTitle}
        type="button"
      >
        <UpIcon className="h-3.5 w-3.5" />
      </Button>
      <button
        type="button"
        className={cn(
          "h-8 w-12 text-center text-sm font-bold rounded border border-transparent",
          "hover:border-navy-300 dark:hover:border-navy-600 hover:bg-navy-50 dark:hover:bg-navy-900/30",
          "focus:border-navy-500 focus:outline-none",
          spinnerDisabled && "opacity-50 cursor-not-allowed",
        )}
        title={inputTitle}
        onClick={() => !spinnerDisabled && onInputChange(value)}
      >
        {displayValue}
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onDecrement}
        disabled={spinnerDisabled}
        title={decrementTitle}
        type="button"
      >
        <DownIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/** Time picker component with hours, minutes, seconds, and AM/PM */
function TimePickerPanel({
  selectedDate,
  onTimeChange,
  formatComponents,
  stepping,
  disabledHours,
  enabledHours,
  disabledTimeIntervals,
  tooltips,
  icons,
  is24Hour,
}: {
  selectedDate: Date
  onTimeChange: (date: Date) => void
  formatComponents: ReturnType<typeof parseFormatComponents>
  stepping: number
  disabledHours?: number[]
  enabledHours?: number[]
  disabledTimeIntervals?: TimeInterval[]
  tooltips: Required<DateTimePickerTooltips>
  icons: Required<DateTimePickerIcons>
  is24Hour: boolean
}) {
  const UpIcon = icons.up
  const DownIcon = icons.down
  const hours = selectedDate.getHours()
  const minutes = selectedDate.getMinutes()
  const seconds = selectedDate.getSeconds()
  const period: "AM" | "PM" = hours >= 12 ? "PM" : "AM"

  // Display values
  const displayHours = is24Hour ? String(hours).padStart(2, "0") : String(hours === 0 ? 12 : hours > 12 ? hours - 12 : hours).padStart(2, "0")
  const displayMinutes = String(minutes).padStart(2, "0")
  const displaySeconds = String(seconds).padStart(2, "0")

  // Time change handlers
  const incrementHours = () => {
    const newH = hours >= 23 ? 0 : hours + 1
    if (!isHourDisabled(newH, selectedDate, { disabledHours, enabledHours, disabledTimeIntervals })) {
      onTimeChange(setHours(selectedDate, newH))
    }
  }
  const decrementHours = () => {
    const newH = hours <= 0 ? 23 : hours - 1
    if (!isHourDisabled(newH, selectedDate, { disabledHours, enabledHours, disabledTimeIntervals })) {
      onTimeChange(setHours(selectedDate, newH))
    }
  }
  const incrementMinutes = () => {
    const step = stepping || 1
    let newM = minutes + step
    let newH = hours
    if (newM >= 60) {
      newM = newM - 60
      newH = hours + 1
      if (newH >= 24) newH = 0
    }
    const newDate = setHours(setMinutes(selectedDate, newM), newH)
    if (!isHourDisabled(newH, newDate, { disabledHours, enabledHours, disabledTimeIntervals })) {
      onTimeChange(newDate)
    }
  }
  const decrementMinutes = () => {
    const step = stepping || 1
    let newM = minutes - step
    let newH = hours
    if (newM < 0) {
      newM = 60 + newM
      newH = hours - 1
      if (newH < 0) newH = 23
    }
    const newDate = setHours(setMinutes(selectedDate, newM), newH)
    if (!isHourDisabled(newH, newDate, { disabledHours, enabledHours, disabledTimeIntervals })) {
      onTimeChange(newDate)
    }
  }
  const incrementSeconds = () => {
    let newS = seconds + 1
    let newM = minutes
    let newH = hours
    if (newS >= 60) { newS = 0; newM++ }
    if (newM >= 60) { newM = 0; newH++ }
    if (newH >= 24) newH = 0
    onTimeChange(setHours(setMinutes(setSeconds(selectedDate, newS), newM), newH))
  }
  const decrementSeconds = () => {
    let newS = seconds - 1
    let newM = minutes
    let newH = hours
    if (newS < 0) { newS = 59; newM-- }
    if (newM < 0) { newM = 59; newH-- }
    if (newH < 0) newH = 23
    onTimeChange(setHours(setMinutes(setSeconds(selectedDate, newS), newM), newH))
  }
  const togglePeriod = () => {
    const newH = hours >= 12 ? hours - 12 : hours + 12
    const newDate = setHours(selectedDate, newH)
    if (!isHourDisabled(newH, newDate, { disabledHours, enabledHours, disabledTimeIntervals })) {
      onTimeChange(newDate)
    }
  }

  const canIncH = !isHourDisabled(hours >= 23 ? 0 : hours + 1, selectedDate, { disabledHours, enabledHours })
  const canDecH = !isHourDisabled(hours <= 0 ? 23 : hours - 1, selectedDate, { disabledHours, enabledHours })

  return (
    <div className="ims-dtp-time-picker p-2">
      <div className="flex items-center justify-center gap-1">
        {formatComponents.hasHours && (
          <TimeSpinner
            value={hours}
            onIncrement={incrementHours}
            onDecrement={decrementHours}
            onInputChange={() => {}}
            displayValue={displayHours}
            incrementTitle={tooltips.incrementHour}
            decrementTitle={tooltips.decrementHour}
            inputTitle={tooltips.pickHour}
            UpIcon={UpIcon}
            DownIcon={DownIcon}
          />
        )}
        {formatComponents.hasHours && formatComponents.hasMinutes && (
          <span className="text-lg font-bold text-navy-600 dark:text-navy-300 mx-0.5">:</span>
        )}
        {formatComponents.hasMinutes && (
          <TimeSpinner
            value={minutes}
            onIncrement={incrementMinutes}
            onDecrement={decrementMinutes}
            onInputChange={() => {}}
            displayValue={displayMinutes}
            incrementTitle={tooltips.incrementMinute}
            decrementTitle={tooltips.decrementMinute}
            inputTitle={tooltips.pickMinute}
            UpIcon={UpIcon}
            DownIcon={DownIcon}
          />
        )}
        {formatComponents.hasMinutes && formatComponents.hasSeconds && (
          <span className="text-lg font-bold text-navy-600 dark:text-navy-300 mx-0.5">:</span>
        )}
        {formatComponents.hasSeconds && (
          <TimeSpinner
            value={seconds}
            onIncrement={incrementSeconds}
            onDecrement={decrementSeconds}
            onInputChange={() => {}}
            displayValue={displaySeconds}
            incrementTitle={tooltips.incrementSecond}
            decrementTitle={tooltips.decrementSecond}
            inputTitle={tooltips.pickSecond}
            UpIcon={UpIcon}
            DownIcon={DownIcon}
          />
        )}
        {!is24Hour && (
          <Button
            variant="outline"
            size="sm"
            className="ml-1.5 h-8 w-12 text-xs font-bold border-navy-200 dark:border-navy-700"
            onClick={togglePeriod}
            title={tooltips.togglePeriod}
            type="button"
          >
            {period}
          </Button>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   TOOLBAR
   ================================================================ */

function Toolbar({
  showToday,
  showClear,
  showClose,
  showToggle,
  onToday,
  onClear,
  onClose,
  onToggle,
  icons,
  tooltips,
}: {
  showToday: boolean
  showClear: boolean
  showClose: boolean
  showToggle: boolean
  onToday: () => void
  onClear: () => void
  onClose: () => void
  onToggle: () => void
  icons: Required<DateTimePickerIcons>
  tooltips: Required<DateTimePickerTooltips>
}) {
  const TodayIcon = icons.today
  const ClearIcon = icons.clear
  const CloseIcon = icons.close
  const TimeIcon = icons.time
  const DateIcon = icons.date

  return (
    <div className="flex items-center justify-center gap-1 py-1 border-t border-border">
      {showToday && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToday} title={tooltips.today} type="button">
          <TodayIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      {showToggle && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle} title={tooltips.selectTime} type="button">
          <TimeIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      {showClear && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} title={tooltips.clear} type="button">
          <ClearIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      {showClose && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title={tooltips.close} type="button">
          <CloseIcon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function IMSDateTimePicker({
  value,
  onChange,
  format: formatStr = "dd/MM/yyyy HH:mm",
  minDate,
  maxDate,
  disabledDates,
  enabledDates,
  daysOfWeekDisabled,
  stepping = 1,
  disabledHours,
  enabledHours,
  disabledTimeIntervals,
  inline = false,
  sideBySide = false,
  showTodayButton = false,
  showClear = true,
  showClose = false,
  toolbarPlacement = "default",
  keepOpen = false,
  keepInvalid = false,
  focusOnShow = true,
  allowInputToggle = false,
  useCurrent = false,
  defaultDate,
  viewMode = "days",
  calendarWeeks = false,
  dayViewHeaderFormat = "MMMM yyyy",
  widgetPositioning,
  icons: customIcons,
  tooltips: customTooltips,
  disabled = false,
  placeholder = "Select date & time",
  className,
  id,
  locale,
}: IMSDateTimePickerProps) {
  // Merge icons and tooltips
  const icons = { ...DEFAULT_ICONS, ...customIcons } as Required<DateTimePickerIcons>
  const tooltips = { ...DEFAULT_TOOLTIPS, ...customTooltips }

  // Parse format to detect components
  const formatComp = React.useMemo(() => parseFormatComponents(formatStr), [formatStr])
  const is24Hour = !formatComp.is12Hour
  const hasDatePart = formatComp.hasYear || formatComp.hasMonth || formatComp.hasDay
  const hasTimePart = formatComp.hasHours || formatComp.hasMinutes || formatComp.hasSeconds

  // State
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [viewDate, setViewDate] = React.useState<Date>(value || defaultDate || new Date())
  const [currentView, setCurrentView] = React.useState<CalendarViewMode>(viewMode)
  const [showTimeView, setShowTimeView] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value && isValid(value) ? format(value, formatStr, { locale }) : "")

  // View mode hierarchy index
  const viewModeOrder: CalendarViewMode[] = ["days", "months", "years", "decades"]
  const minViewIndex = formatComp.hasDay ? 0 : formatComp.hasMonth ? 1 : formatComp.hasYear ? 2 : 3

  // Sync with value prop
  React.useEffect(() => {
    if (value && isValid(value)) {
      setSelectedDate(value)
      setViewDate(value)
      setInputValue(format(value, formatStr, { locale }))
    } else if (value === undefined) {
      setSelectedDate(undefined)
      setInputValue("")
    }
  }, [value, formatStr, locale])

  // Handle defaultDate on mount
  React.useEffect(() => {
    if (!value && defaultDate) {
      setSelectedDate(defaultDate)
      setViewDate(defaultDate)
      setInputValue(format(defaultDate, formatStr, { locale }))
    }
  }, [])

  // Handle useCurrent on mount
  React.useEffect(() => {
    if (!value && !defaultDate && useCurrent && open) {
      const now = new Date()
      let dateToUse = now
      if (typeof useCurrent === "string") {
        switch (useCurrent) {
          case "year": dateToUse = setMonth(dfSetDate(now, 1), 0); break
          case "month": dateToUse = dfSetDate(now, 1); break
          case "day": dateToUse = setHours(now, 0); break
          case "hour": dateToUse = setMinutes(setHours(now, now.getHours()), 0); break
          case "minute": dateToUse = setSeconds(setMinutes(now, now.getMinutes()), 0); break
        }
      }
      setSelectedDate(dateToUse)
      setViewDate(dateToUse)
      setInputValue(format(dateToUse, formatStr, { locale }))
    }
  }, [open])

  // Date selection handler
  const handleSelectDay = (day: Date) => {
    let newDate: Date
    if (selectedDate) {
      newDate = new Date(selectedDate)
      newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    } else {
      newDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)
    }
    // Snap minutes to stepping
    const snappedMinutes = snapToStepping(newDate.getMinutes(), stepping)
    newDate.setMinutes(snappedMinutes)

    if (!isDateDisabled(newDate, { minDate, maxDate, disabledDates, enabledDates, daysOfWeekDisabled })) {
      setSelectedDate(newDate)
      setViewDate(newDate)
      setInputValue(format(newDate, formatStr, { locale }))
      onChange?.(newDate)
      if (!keepOpen && !hasTimePart) {
        setOpen(false)
      }
    }
  }

  const handleSelectMonth = (month: number) => {
    const newViewDate = setMonth(viewDate, month)
    setViewDate(newViewDate)
    if (minViewIndex >= 1) {
      // If we don't have days, select the month directly
      const newDate = selectedDate ? setMonth(selectedDate, month) : setMonth(newViewDate, month)
      setSelectedDate(newDate)
      setInputValue(format(newDate, formatStr, { locale }))
      onChange?.(newDate)
    } else {
      setCurrentView("days")
    }
  }

  const handleSelectYear = (year: number) => {
    const newViewDate = setYear(viewDate, year)
    setViewDate(newViewDate)
    if (minViewIndex >= 2) {
      const newDate = selectedDate ? setYear(selectedDate, year) : setYear(newViewDate, year)
      setSelectedDate(newDate)
      setInputValue(format(newDate, formatStr, { locale }))
      onChange?.(newDate)
    } else {
      setCurrentView("months")
    }
  }

  const handleSelectDecade = (decadeMiddleYear: number) => {
    const newViewDate = setYear(viewDate, decadeMiddleYear)
    setViewDate(newViewDate)
    setCurrentView("years")
  }

  // Navigation handlers
  const handleNavigate = (direction: "prev" | "next") => {
    switch (currentView) {
      case "days":
        setViewDate(direction === "prev" ? subMonths(viewDate, 1) : addMonths(viewDate, 1))
        break
      case "months":
        setViewDate(direction === "prev" ? subYears(viewDate, 1) : addYears(viewDate, 1))
        break
      case "years":
        setViewDate(direction === "prev" ? subYears(viewDate, 10) : addYears(viewDate, 10))
        break
      case "decades":
        setViewDate(direction === "prev" ? subYears(viewDate, 100) : addYears(viewDate, 100))
        break
    }
  }

  // Switch view (drill down)
  const handleSwitchView = () => {
    const nextViewMap: Record<CalendarViewMode, CalendarViewMode | null> = {
      days: "months",
      months: "years",
      years: "decades",
      decades: null,
    }
    const nextView = nextViewMap[currentView]
    if (nextView) setCurrentView(nextView)
  }

  // Time change handler
  const handleTimeChange = (date: Date) => {
    setSelectedDate(date)
    setInputValue(format(date, formatStr, { locale }))
    onChange?.(date)
  }

  // Today handler
  const handleToday = () => {
    const now = new Date()
    if (!isDateDisabled(now, { minDate, maxDate, disabledDates, enabledDates, daysOfWeekDisabled })) {
      setSelectedDate(now)
      setViewDate(now)
      setInputValue(format(now, formatStr, { locale }))
      onChange?.(now)
    }
  }

  // Clear handler
  const handleClear = () => {
    setSelectedDate(undefined)
    setInputValue("")
    onChange?.(undefined)
  }

  // Close handler
  const handleClose = () => {
    setOpen(false)
  }

  // Toggle date/time view
  const handleToggleView = () => {
    setShowTimeView((prev) => !prev)
  }

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (val.trim() === "") {
      if (!keepInvalid) {
        setSelectedDate(undefined)
        onChange?.(undefined)
      }
      return
    }
    try {
      const parsed = parse(val, formatStr, new Date(), { locale })
      if (isValid(parsed)) {
        if (!isDateDisabled(parsed, { minDate, maxDate, disabledDates, enabledDates, daysOfWeekDisabled })) {
          setSelectedDate(parsed)
          setViewDate(parsed)
          onChange?.(parsed)
        }
      }
    } catch {
      // Invalid date, keep input if keepInvalid
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key
    const ctrl = e.ctrlKey || e.metaKey

    switch (key) {
      case "ArrowUp":
        e.preventDefault()
        if (ctrl) {
          setViewDate(subYears(viewDate, 1))
        } else if (currentView === "days") {
          setViewDate(subDays(viewDate, 7))
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (ctrl) {
          setViewDate(addYears(viewDate, 1))
        } else if (currentView === "days") {
          setViewDate(addDays(viewDate, 7))
        }
        break
      case "ArrowLeft":
        if (currentView === "days") {
          setViewDate(subDays(viewDate, 1))
        }
        break
      case "ArrowRight":
        if (currentView === "days") {
          setViewDate(addDays(viewDate, 1))
        }
        break
      case "PageUp":
        e.preventDefault()
        setViewDate(subMonths(viewDate, 1))
        break
      case "PageDown":
        e.preventDefault()
        setViewDate(addMonths(viewDate, 1))
        break
      case "Enter":
        if (!keepOpen) setOpen(false)
        break
      case "Escape":
        setOpen(false)
        break
      case "t":
        if (!ctrl) handleToday()
        break
      case "Delete":
        handleClear()
        break
      case " ":
        if (ctrl && !is24Hour) {
          e.preventDefault()
          togglePeriod()
        }
        break
    }
  }

  const togglePeriod = () => {
    if (selectedDate) {
      const h = selectedDate.getHours()
      const newH = h >= 12 ? h - 12 : h + 12
      handleTimeChange(setHours(selectedDate, newH))
    }
  }

  // Render calendar part
  const renderCalendar = () => {
    switch (currentView) {
      case "months":
        return (
          <MonthsView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onNavigate={handleNavigate}
            onSelectMonth={handleSelectMonth}
            onSwitchView={handleSwitchView}
            minDate={minDate}
            maxDate={maxDate}
            tooltips={tooltips}
            icons={icons}
          />
        )
      case "years":
        return (
          <YearsView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onNavigate={handleNavigate}
            onSelectYear={handleSelectYear}
            onSwitchView={handleSwitchView}
            minDate={minDate}
            maxDate={maxDate}
            tooltips={tooltips}
            icons={icons}
          />
        )
      case "decades":
        return (
          <DecadesView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onNavigate={handleNavigate}
            onSelectDecade={handleSelectDecade}
            minDate={minDate}
            maxDate={maxDate}
            tooltips={tooltips}
            icons={icons}
          />
        )
      case "days":
      default:
        return (
          <DaysView
            viewDate={viewDate}
            selectedDate={selectedDate}
            calendarWeeks={calendarWeeks}
            dayViewHeaderFormat={dayViewHeaderFormat}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            enabledDates={enabledDates}
            daysOfWeekDisabled={daysOfWeekDisabled}
            onNavigate={handleNavigate}
            onSelectDay={handleSelectDay}
            onSwitchView={handleSwitchView}
            locale={locale}
            tooltips={tooltips}
            icons={icons}
          />
        )
    }
  }

  // Render time part
  const renderTimePicker = () => {
    if (!hasTimePart) return null
    const dateForTime = selectedDate || viewDate
    return (
      <TimePickerPanel
        selectedDate={dateForTime}
        onTimeChange={handleTimeChange}
        formatComponents={formatComp}
        stepping={stepping}
        disabledHours={disabledHours}
        enabledHours={enabledHours}
        disabledTimeIntervals={disabledTimeIntervals}
        tooltips={tooltips}
        icons={icons}
        is24Hour={is24Hour}
      />
    )
  }

  // Render toolbar
  const renderToolbar = () => {
    const showToggle = !sideBySide && hasDatePart && hasTimePart
    return (
      <Toolbar
        showToday={showTodayButton}
        showClear={showClear}
        showClose={showClose && !inline}
        showToggle={showToggle}
        onToday={handleToday}
        onClear={handleClear}
        onClose={handleClose}
        onToggle={handleToggleView}
        icons={icons}
        tooltips={tooltips}
      />
    )
  }

  // Render the widget content
  const renderWidget = () => {
    if (sideBySide && hasDatePart && hasTimePart) {
      return (
        <div className="ims-dtp-widget bg-popover rounded-lg border border-border shadow-lg">
          {toolbarPlacement === "top" && renderToolbar()}
          <div className="flex">
            <div className="flex-1 border-r border-border p-2">
              {renderCalendar()}
            </div>
            <div className="flex-1 p-2">
              {renderTimePicker()}
            </div>
          </div>
          {toolbarPlacement !== "top" && renderToolbar()}
        </div>
      )
    }

    // Default layout: stacked
    return (
      <div className="ims-dtp-widget bg-popover rounded-lg border border-border shadow-lg">
        {toolbarPlacement === "top" && renderToolbar()}
        {hasDatePart && !showTimeView && <div className="p-2">{renderCalendar()}</div>}
        {hasTimePart && showTimeView && <div className="p-2">{renderTimePicker()}</div>}
        {hasDatePart && showTimeView && hasTimePart && !sideBySide && (
          <div className="p-2">{renderCalendar()}</div>
        )}
        {toolbarPlacement === "default" && renderToolbar()}
        {hasTimePart && !showTimeView && !sideBySide && hasDatePart && (
          <div className="p-2 border-t border-border">{renderTimePicker()}</div>
        )}
        {toolbarPlacement === "bottom" && renderToolbar()}
      </div>
    )
  }

  // Inline mode
  if (inline) {
    return (
      <div className={cn("ims-dtp-inline", className)} id={id}>
        {renderWidget()}
      </div>
    )
  }

  // Popover mode
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Input
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("h-9 pr-9", open && "ring-2 ring-navy-500 border-navy-500")}
            onFocus={allowInputToggle ? () => setOpen(true) : undefined}
            onKeyDown={handleKeyDown}
          />
          <CalendarIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={widgetPositioning?.horizontal === "right" ? "end" : "start"}
        side={widgetPositioning?.vertical === "top" ? "top" : "bottom"}
      >
        {renderWidget()}
      </PopoverContent>
    </Popover>
  )
}
