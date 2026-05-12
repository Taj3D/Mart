/**
 * IMS jQuery UI Spinner Component
 * Replaces jQuery UI 1.12.1 spinner.js
 *
 * Features:
 * - Up/down spinner buttons
 * - Page up/down (configurable page size)
 * - Min/max value constraints
 * - Step increment
 * - Cultural number formatting
 * - Disabled state
 * - Keyboard support (up/down, page up/down, home/end)
 * - Deep Navy Blue themed buttons
 * - Events: onSpin, onStart, onStop, onChange
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpinnerOptions } from "./types";

// ============================================================================
// Helpers
// ============================================================================

function clamp(value: number, min?: number | string, max?: number | string): number {
  const minVal = typeof min === "string" ? parseFloat(min) : min;
  const maxVal = typeof max === "string" ? parseFloat(max) : max;
  let result = value;
  if (minVal !== undefined && !isNaN(minVal) && result < minVal) result = minVal;
  if (maxVal !== undefined && !isNaN(maxVal) && result > maxVal) result = maxVal;
  return result;
}

function parseNumeric(val: string | number | undefined): number | undefined {
  if (val === undefined) return undefined;
  const num = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(num) ? undefined : num;
}

/**
 * Format a number according to a culture and number format string.
 * Simplified implementation that supports common patterns:
 * - "N" or "n" → fixed-point with culture decimals
 * - "C" or "c" → currency
 * - "P" or "p" → percentage
 * - "D" or "d" → decimal (integer)
 * - "F" or "f" → fixed-point
 */
function formatByCulture(
  value: number,
  culture?: string,
  numberFormat?: string
): string {
  if (!numberFormat) return value.toString();

  const locale = culture || undefined;

  const match = numberFormat.match(/^([a-zA-Z])(\d*)$/);
  if (!match) return value.toString();

  const formatType = match[1].toLowerCase();
  const precision = match[2] ? parseInt(match[2], 10) : 2;

  switch (formatType) {
    case "n":
      return value.toLocaleString(locale, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
    case "c":
      return value.toLocaleString(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
    case "p":
      return (value / 100).toLocaleString(locale, {
        style: "percent",
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
    case "d":
      return Math.round(value).toString().padStart(precision || 1, "0");
    case "f":
      return value.toFixed(precision);
    default:
      return value.toString();
  }
}

// ============================================================================
// ImsJuiSpinner
// ============================================================================

export interface ImsJuiSpinnerProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    SpinnerOptions {
  /** Controlled value */
  value?: number;
  /** Default value for uncontrolled usage */
  defaultValue?: number;
  /** Called when value changes (controlled mode) */
  onValueChange?: (value: number) => void;
  /** Input id */
  inputId?: string;
  /** Input name */
  inputName?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Custom format function (overrides culture/numberFormat) */
  formatValue?: (value: number) => string;
}

export function ImsJuiSpinner({
  disabled = false,
  culture,
  increment,
  max,
  min,
  numberFormat,
  page = 10,
  step = 1,
  onSpin,
  onStart,
  onStop,
  onChange,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  inputId,
  inputName,
  placeholder,
  size = "default",
  formatValue,
  className,
  ...props
}: ImsJuiSpinnerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = React.useRef(300);
  const spinningRef = React.useRef(false);

  const [internalValue, setInternalValue] = React.useState<number>(defaultValue);
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputText, setInputText] = React.useState<string | null>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const numericStep = parseNumeric(step) ?? 1;
  const numericMin = parseNumeric(min);
  const numericMax = parseNumeric(max);
  const pageSize = typeof page === "number" ? page : 10;

  // Resolve increment function (for accelerated spinning)
  const resolveIncrement = React.useCallback(
    (count: number): number => {
      if (increment === false) return numericStep;
      if (typeof increment === "number") return increment * count;
      if (typeof increment === "function") return increment(count);
      return numericStep;
    },
    [increment, numericStep]
  );

  // Update value with constraints
  const updateValue = React.useCallback(
    (next: number, event?: React.KeyboardEvent | React.MouseEvent) => {
      const clamped = clamp(next, numericMin, numericMax);
      if (!isControlled) setInternalValue(clamped);
      onValueChange?.(clamped);

      if (spinningRef.current) {
        onSpin?.(event ?? ({} as React.KeyboardEvent), { value: clamped });
      }
      onChange?.({} as React.ChangeEvent, { value: clamped });
    },
    [isControlled, onValueChange, onSpin, onChange, numericMin, numericMax]
  );

  const spinUp = React.useCallback(
    (s: number = numericStep, event?: React.KeyboardEvent | React.MouseEvent) => {
      updateValue(currentValue + s, event);
    },
    [currentValue, numericStep, updateValue]
  );

  const spinDown = React.useCallback(
    (s: number = numericStep, event?: React.KeyboardEvent | React.MouseEvent) => {
      updateValue(currentValue - s, event);
    },
    [currentValue, numericStep, updateValue]
  );

  // Hold-button acceleration (continuous spin while pressing)
  const spinCountRef = React.useRef(0);

  const startSpin = React.useCallback(
    (direction: "up" | "down") => {
      spinningRef.current = true;
      spinCountRef.current = 1;

      const spin = direction === "up" ? spinUp : spinDown;
      spin(resolveIncrement(1));
      onStart?.({} as React.KeyboardEvent, { value: currentValue });

      speedRef.current = 300;

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          spinCountRef.current += 1;
          const inc = resolveIncrement(spinCountRef.current);
          spin(inc);
          // Accelerate
          speedRef.current = Math.max(40, speedRef.current * 0.85);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              spinCountRef.current += 1;
              spin(resolveIncrement(spinCountRef.current));
            }, speedRef.current);
          }
        }, speedRef.current);
      }, 400);
    },
    [spinUp, spinDown, resolveIncrement, onStart, currentValue]
  );

  const stopSpin = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    speedRef.current = 300;

    if (spinningRef.current) {
      spinningRef.current = false;
      onStop?.({} as React.KeyboardEvent, { value: currentValue });
    }
    spinCountRef.current = 0;
  }, [onStop, currentValue]);

  React.useEffect(() => {
    return () => stopSpin();
  }, [stopSpin]);

  // Keyboard handler
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          spinUp(numericStep, e);
          break;
        case "ArrowDown":
          e.preventDefault();
          spinDown(numericStep, e);
          break;
        case "PageUp":
          e.preventDefault();
          spinUp(numericStep * pageSize, e);
          break;
        case "PageDown":
          e.preventDefault();
          spinDown(numericStep * pageSize, e);
          break;
        case "Home":
          e.preventDefault();
          if (numericMin !== undefined) updateValue(numericMin, e);
          break;
        case "End":
          e.preventDefault();
          if (numericMax !== undefined) updateValue(numericMax, e);
          break;
      }
    },
    [spinUp, spinDown, numericStep, pageSize, numericMin, numericMax, updateValue]
  );

  // Direct input editing
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
    },
    []
  );

  const commitInput = React.useCallback(() => {
    if (inputText !== null) {
      const parsed = parseFloat(inputText.replace(/,/g, ""));
      if (!isNaN(parsed)) {
        updateValue(parsed);
      }
      setInputText(null);
    }
    setIsFocused(false);
    onChange?.({} as React.ChangeEvent, { value: currentValue });
  }, [inputText, updateValue, onChange, currentValue]);

  // Display value
  const displayValue = React.useMemo(() => {
    if (inputText !== null) return inputText;
    if (formatValue) return formatValue(currentValue);
    if (numberFormat || culture) {
      return formatByCulture(currentValue, culture, numberFormat ?? "N");
    }
    return currentValue.toString();
  }, [currentValue, inputText, formatValue, numberFormat, culture]);

  // Size mapping
  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case "sm":
        return {
          wrapper: "h-8",
          input: "text-xs",
          btn: "w-[1.6em]",
          icon: "size-3",
        };
      case "lg":
        return {
          wrapper: "h-12",
          input: "text-base",
          btn: "w-[1.6em]",
          icon: "size-4",
        };
      default:
        return {
          wrapper: "h-10",
          input: "text-sm",
          btn: "w-[1.6em]",
          icon: "size-3.5",
        };
    }
  }, [size]);

  return (
    <div
      className={cn(
        "ims-jui-spinner",
        "relative inline-flex items-center",
        sizeClasses.wrapper,
        "rounded-md border border-input bg-transparent shadow-xs",
        "transition-[color,box-shadow]",
        isFocused && "border-navy-500 ring-[3px] ring-navy-500/20",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      <input
        ref={inputRef}
        id={inputId}
        name={inputName}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        className={cn(
          "flex-1 h-full min-w-0 bg-transparent px-3 py-1 outline-none",
          sizeClasses.input,
          "text-foreground placeholder:text-muted-foreground",
          "pr-0"
        )}
        value={displayValue}
        placeholder={placeholder}
        aria-label="Spinner value"
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={commitInput}
        onKeyDown={handleKeyDown}
      />

      {/* Spinner buttons – stacked vertically on the right (jQuery UI layout) */}
      <div className="ims-jui-spinner-buttons flex flex-col self-stretch border-l border-input">
        <button
          type="button"
          tabIndex={-1}
          className={cn(
            "ims-jui-spinner-up",
            "flex items-center justify-center flex-1 rounded-tr-md",
            sizeClasses.btn,
            "text-white transition-colors duration-100",
            "border-b border-input",
            disabled && "cursor-not-allowed"
          )}
          style={{ backgroundColor: "var(--navy-600)" }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "var(--navy-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--navy-600)";
            stopSpin();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            startSpin("up");
          }}
          onMouseUp={stopSpin}
          aria-label="Increment"
        >
          <ChevronUpIcon className={sizeClasses.icon} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          className={cn(
            "ims-jui-spinner-down",
            "flex items-center justify-center flex-1 rounded-br-md",
            sizeClasses.btn,
            "text-white transition-colors duration-100",
            disabled && "cursor-not-allowed"
          )}
          style={{ backgroundColor: "var(--navy-600)" }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = "var(--navy-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--navy-600)";
            stopSpin();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            startSpin("down");
          }}
          onMouseUp={stopSpin}
          aria-label="Decrement"
        >
          <ChevronDownIcon className={sizeClasses.icon} />
        </button>
      </div>
    </div>
  );
}
