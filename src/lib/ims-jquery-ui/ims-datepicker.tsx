/**
 * IMS jQuery UI Datepicker Component
 * Replaces jQuery UI 1.12.1 datepicker.js
 *
 * Features:
 * - Calendar popup on input focus or button click
 * - Date format string support (dd/mm/yyyy, mm/dd/yyyy, etc.)
 * - Min/max date constraints
 * - First day of week setting
 * - Multi-month display
 * - Button panel (Today, Done buttons)
 * - Week numbers
 * - Month/year dropdown navigation
 * - BeforeShowDay callback for custom day styling
 * - Deep Navy Blue themed calendar (using existing rdp-* CSS)
 * - Events: onSelect, onChangeMonthYear, onClose
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DatepickerOptions } from "./types";

// ============================================================================
// Date Format Utilities
// ============================================================================

const FORMAT_TOKENS: Record<string, (date: Date) => string> = {
  dd: (d) => String(d.getDate()).padStart(2, "0"),
  d: (d) => String(d.getDate()),
  mm: (d) => String(d.getMonth() + 1).padStart(2, "0"),
  m: (d) => String(d.getMonth() + 1),
  MM: (d) =>
    d.toLocaleString("default", { month: "long" }),
  M: (d) =>
    d.toLocaleString("default", { month: "short" }),
  yyyy: (d) => String(d.getFullYear()),
  yy: (d) => String(d.getFullYear()).slice(-2),
};

function formatDate(date: Date, format: string): string {
  let result = format;
  // Replace longer tokens first to avoid partial matches
  const sortedTokens = Object.keys(FORMAT_TOKENS).sort(
    (a, b) => b.length - a.length
  );
  for (const token of sortedTokens) {
    if (result.includes(token)) {
      result = result.replace(
        new RegExp(token, "g"),
        FORMAT_TOKENS[token](date)
      );
    }
  }
  return result;
}

function parseDate(value: string, format: string): Date | undefined {
  // Simple parser: extract date parts based on format tokens
  const formatParts: { token: string; index: number; length: number }[] = [];
  let formatStr = format;
  const sortedTokens = Object.keys(FORMAT_TOKENS).sort(
    (a, b) => b.length - a.length
  );

  for (const token of sortedTokens) {
    let idx: number;
    while ((idx = formatStr.indexOf(token)) !== -1) {
      formatParts.push({ token, index: idx, length: token.length });
      formatStr =
        formatStr.slice(0, idx) + " ".repeat(token.length) + formatStr.slice(idx + token.length);
    }
  }

  formatParts.sort((a, b) => a.index - b.index);

  let day = 1;
  let month = 0;
  let year = new Date().getFullYear();

  for (const part of formatParts) {
    const strPart = value.slice(part.index, part.index + part.length);
    const numVal = parseInt(strPart, 10);

    if (part.token.startsWith("d")) {
      day = numVal || 1;
    } else if (part.token.startsWith("M")) {
      // Named month - try parsing
      const monthNames = Array.from({ length: 12 }, (_, i) =>
        new Date(2000, i).toLocaleString("default", {
          month: part.token === "MM" ? "long" : "short",
        })
      );
      const found = monthNames.findIndex((m) =>
        m.toLowerCase() === strPart.toLowerCase()
      );
      month = found >= 0 ? found : numVal - 1 || 0;
    } else if (part.token.startsWith("m")) {
      month = (numVal || 1) - 1;
    } else if (part.token.startsWith("y")) {
      year = numVal;
      if (part.token === "yy" && year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
    }
  }

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return undefined;
  return date;
}

function resolveDateConstraint(
  value: Date | string | number | null | undefined
): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    // Number of days from today
    const d = new Date();
    d.setDate(d.getDate() + value);
    return d;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

// ============================================================================
// ImsJuiDatepicker
// ============================================================================

export interface ImsJuiDatepickerProps
  extends Omit<React.ComponentProps<"div">, "onSelect">,
    DatepickerOptions {
  /** Controlled selected date */
  value?: Date | string;
  /** Default selected date */
  defaultValue?: Date | string;
  /** Called when selected date changes */
  onValueChange?: (date: Date | undefined, dateText: string) => void;
  /** CSS class for the input element */
  inputClassName?: string;
  /** CSS class for the popover content */
  popoverClassName?: string;
}

export function ImsJuiDatepicker({
  disabled = false,
  showAnim = "fadeIn",
  duration: animDuration = "fast",
  dateFormat = "mm/dd/yyyy",
  minDate,
  maxDate,
  defaultDate,
  firstDay = 0,
  numberOfMonths = 1,
  showButtonPanel = false,
  showWeek = false,
  changeMonth = false,
  changeYear = false,
  yearRange,
  showOn = "focus",
  buttonText,
  buttonImage,
  constrainInput = true,
  beforeShowDay,
  beforeShow,
  onSelect,
  onChangeMonthYear,
  onClose,
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  inputClassName,
  popoverClassName,
  ...props
}: ImsJuiDatepickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue
      ? defaultValue instanceof Date
        ? defaultValue
        : parseDate(String(defaultValue), dateFormat)
      : undefined
  );

  const isControlled = controlledValue !== undefined;
  const selectedDate = isControlled
    ? controlledValue instanceof Date
      ? controlledValue
      : controlledValue
        ? parseDate(String(controlledValue), dateFormat)
        : undefined
    : internalDate;

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    selectedDate ? formatDate(selectedDate, dateFormat) : ""
  );
  const [displayMonth, setDisplayMonth] = React.useState<Date>(
    selectedDate ?? new Date()
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  const resolvedMinDate = resolveDateConstraint(minDate);
  const resolvedMaxDate = resolveDateConstraint(maxDate);

  // Sync input value with selected date
  React.useEffect(() => {
    if (selectedDate) {
      setInputValue(formatDate(selectedDate, dateFormat));
    } else {
      setInputValue("");
    }
  }, [selectedDate, dateFormat]);

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      if (!isControlled) {
        setInternalDate(date);
      }

      const dateText = date ? formatDate(date, dateFormat) : "";
      onValueChange?.(date, dateText);
      onSelect?.(dateText, undefined);

      setInputValue(dateText);
      setIsOpen(false);
      onClose?.(dateText, undefined);
    },
    [isControlled, dateFormat, onValueChange, onSelect, onClose]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);

      if (!v) {
        handleSelect(undefined);
        return;
      }

      // Constrain input to valid date chars if enabled
      if (constrainInput && dateFormat) {
        // Only allow digits, separator chars, and letters
        const validPattern = /^[\d/.\-,\s_a-zA-Z]*$/;
        if (!validPattern.test(v)) return;
      }

      const parsed = parseDate(v, dateFormat);
      if (parsed) {
        // Validate min/max
        if (resolvedMinDate && parsed < resolvedMinDate) return;
        if (resolvedMaxDate && parsed > resolvedMaxDate) return;
        handleSelect(parsed);
      }
    },
    [dateFormat, constrainInput, resolvedMinDate, resolvedMaxDate, handleSelect]
  );

  const handleMonthChange = React.useCallback(
    (year: number, month: number) => {
      const newDisplay = new Date(year, month - 1, 1);
      setDisplayMonth(newDisplay);
      onChangeMonthYear?.(year, month, undefined);
    },
    [onChangeMonthYear]
  );

  const handleToday = React.useCallback(() => {
    const today = new Date();
    handleSelect(today);
    setDisplayMonth(today);
  }, [handleSelect]);

  const handleDone = React.useCallback(() => {
    setIsOpen(false);
    onClose?.(inputValue, undefined);
    inputRef.current?.focus();
  }, [inputValue, onClose]);

  // Compute numberOfMonths for react-day-picker
  const calendarMonths = React.useMemo(() => {
    if (typeof numberOfMonths === "number") return numberOfMonths;
    // [rows, cols] format
    return (numberOfMonths as [number, number])[0] * (numberOfMonths as [number, number])[1];
  }, [numberOfMonths]);

  // beforeShowDay support - creates modifiers and classnames
  const dayModifiers = React.useMemo(() => {
    if (!beforeShowDay) return {};

    return {
      // Custom modifier function for beforeShowDay
      modifiers: {
        juiCustom: (date: Date) => {
          const result = beforeShowDay(date);
          // [selectable, className, tooltip]
          return result[0] === false;
        },
      },
      modifiersClassNames: {
        juiCustom: "jui-datepicker-disabled-day",
      },
    };
  }, [beforeShowDay]);

  // Determine showOn behavior
  const showOnFocus = showOn === "focus" || showOn === "both";
  const showOnButton = showOn === "button" || showOn === "both";

  return (
    <div
      className={cn("ims-jui-datepicker relative", className)}
      {...props}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-1">
          {/* Input */}
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={dateFormat.toUpperCase()}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={() => {
              if (showOnFocus && !isOpen) {
                setIsOpen(true);
              }
            }}
            className={cn(
              "pr-8",
              inputClassName
            )}
          />

          {/* Trigger button */}
          {(showOnButton || !showOnFocus) && (
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={disabled}
                className="shrink-0"
                type="button"
                aria-label={buttonText ?? "Open datepicker"}
              >
                {buttonImage ? (
                  <img
                    src={buttonImage}
                    alt={buttonText ?? "Calendar"}
                    className="size-4"
                  />
                ) : (
                  <CalendarIcon className="size-4" />
                )}
              </Button>
            </PopoverTrigger>
          )}

          {/* Hidden trigger for focus mode */}
          {showOnFocus && !showOnButton && (
            <PopoverTrigger asChild>
              <button
                type="button"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              >
                Open
              </button>
            </PopoverTrigger>
          )}
        </div>

        <PopoverContent
          className={cn(
            "w-auto p-0 border-navy-200 dark:border-navy-700",
            "ims-jui-datepicker-popover",
            popoverClassName
          )}
          align="start"
          sideOffset={4}
        >
          <div className="ims-jui-datepicker-calendar">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={displayMonth}
              month={displayMonth}
              onMonthChange={(date) => {
                setDisplayMonth(date);
                handleMonthChange(date.getFullYear(), date.getMonth() + 1);
              }}
              numberOfMonths={calendarMonths}
              showOutsideDays={true}
              weekStartsOn={firstDay as 0 | 1 | 2 | 3 | 4 | 5 | 6}
              showWeekNumber={showWeek}
              captionLayout={
                changeMonth || changeYear ? "dropdown" : "label"
              }
              fromYear={
                changeYear
                  ? yearRange
                    ? parseInt(yearRange.split(":")[0], 10) || new Date().getFullYear() - 10
                    : new Date().getFullYear() - 100
                  : undefined
              }
              toYear={
                changeYear
                  ? yearRange
                    ? parseInt(yearRange.split(":")[1], 10) || new Date().getFullYear() + 10
                    : new Date().getFullYear() + 100
                  : undefined
              }
              disabled={(date) => {
                if (resolvedMinDate && date < resolvedMinDate) return true;
                if (resolvedMaxDate && date > resolvedMaxDate) return true;
                if (beforeShowDay) {
                  const result = beforeShowDay(date);
                  return result[0] === false;
                }
                return false;
              }}
              {...dayModifiers}
              classNames={{
                day: "relative w-full h-full p-0 text-center select-none aspect-square",
              }}
            />

            {/* Button panel */}
            {showButtonPanel && (
              <div className="flex items-center justify-between border-t border-navy-200 dark:border-navy-700 px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-navy-600 dark:text-navy-300 text-xs h-7"
                  onClick={handleToday}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-navy-600 dark:text-navy-300 text-xs h-7"
                  onClick={handleDone}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ============================================================================
// ImsJuiDatepickerInput
// ============================================================================

export interface ImsJuiDatepickerInputProps extends React.ComponentProps<"input"> {
  /** Date format string */
  dateFormat?: string;
  /** Called when the input value changes */
  onDateChange?: (dateText: string) => void;
}

export function ImsJuiDatepickerInput({
  dateFormat: fmt = "mm/dd/yyyy",
  onDateChange,
  className,
  ...props
}: ImsJuiDatepickerInputProps) {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDateChange?.(e.target.value);
      props.onChange?.(e);
    },
    [onDateChange, props]
  );

  return (
    <Input
      type="text"
      placeholder={fmt.toUpperCase()}
      className={cn("ims-jui-datepicker-input", className)}
      onChange={handleChange}
      {...props}
    />
  );
}

// ============================================================================
// ImsJuiDatepickerButton
// ============================================================================

export interface ImsJuiDatepickerButtonProps
  extends React.ComponentProps<"button"> {
  /** Button text */
  buttonText?: string;
  /** Button icon image URL */
  buttonImage?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

export function ImsJuiDatepickerButton({
  buttonText = "Choose date",
  buttonImage,
  disabled = false,
  className,
  children,
  ...props
}: ImsJuiDatepickerButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      disabled={disabled}
      className={cn("ims-jui-datepicker-button shrink-0", className)}
      aria-label={buttonText}
      {...props}
    >
      {children ?? (
        buttonImage ? (
          <img
            src={buttonImage}
            alt={buttonText}
            className="size-4"
          />
        ) : (
          <CalendarIcon className="size-4" />
        )
      )}
    </Button>
  );
}
