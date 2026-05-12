'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SpinnerSize = 'sm' | 'default' | 'lg'

export interface NumberSpinnerProps {
  /** Controlled value */
  value?: number
  /** Callback when value changes */
  onValueChange?: (value: number) => void
  /** Default value for uncontrolled usage (default 0) */
  defaultValue?: number
  /** Minimum allowed value */
  min?: number
  /** Maximum allowed value */
  max?: number
  /** Increment/decrement step (default 1) */
  step?: number
  /** Number of decimal places (default 0) */
  precision?: number
  /** Text displayed before the number (e.g. "$") */
  prefix?: string
  /** Text displayed after the number (e.g. "units", "%") */
  suffix?: string
  /** Show comma separators for thousands (default false) */
  thousandsSeparator?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: SpinnerSize
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS class */
  className?: string
  /** Enable mouse wheel to change value (default true) */
  wheelable?: boolean
  /** Custom format function for display */
  formatValue?: (value: number) => string
  /** HTML id attribute */
  id?: string
  /** HTML name attribute */
  name?: string
  /** ARIA label */
  ariaLabel?: string
}

export interface SpinnerInputProps extends Omit<NumberSpinnerProps, 'size'> {
  /** Size variant */
  size?: SpinnerSize
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min?: number, max?: number): number {
  let result = value
  if (min !== undefined && result < min) result = min
  if (max !== undefined && result > max) result = max
  return result
}

function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

function addThousandsSeparator(value: string): string {
  const parts = value.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function formatNumber(
  value: number,
  precision: number,
  thousandsSeparator: boolean,
  prefix?: string,
  suffix?: string,
  formatValue?: (value: number) => string
): string {
  if (formatValue) return formatValue(value)

  let str = value.toFixed(precision)
  if (thousandsSeparator) {
    str = addThousandsSeparator(str)
  }
  if (prefix) str = prefix + str
  if (suffix) str = str + suffix
  return str
}

function parseInput(
  raw: string,
  prefix?: string,
  suffix?: string
): number | null {
  let cleaned = raw
  if (prefix) {
    // Remove all occurrences of the prefix
    while (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length)
    }
  }
  if (suffix) {
    while (cleaned.endsWith(suffix)) {
      cleaned = cleaned.slice(0, cleaned.length - suffix.length)
    }
  }
  // Remove thousands separators (commas)
  cleaned = cleaned.replace(/,/g, '')
  // Trim whitespace
  cleaned = cleaned.trim()

  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null

  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

// ---------------------------------------------------------------------------
// Size maps
// ---------------------------------------------------------------------------

const sizeClasses: Record<SpinnerSize, { wrapper: string; input: string; btn: string; icon: string }> = {
  sm: {
    wrapper: 'h-8',
    input: 'text-xs',
    btn: 'w-[1.6em]',
    icon: 'size-3',
  },
  default: {
    wrapper: 'h-10',
    input: 'text-sm',
    btn: 'w-[1.6em]',
    icon: 'size-3.5',
  },
  lg: {
    wrapper: 'h-12',
    input: 'text-base',
    btn: 'w-[1.6em]',
    icon: 'size-4',
  },
}

const spinnerInputSizeClasses: Record<SpinnerSize, { wrapper: string; input: string; btn: string; icon: string }> = {
  sm: {
    wrapper: 'h-8',
    input: 'text-xs w-12',
    btn: 'h-8 w-8',
    icon: 'size-3',
  },
  default: {
    wrapper: 'h-10',
    input: 'text-sm w-16',
    btn: 'h-10 w-10',
    icon: 'size-4',
  },
  lg: {
    wrapper: 'h-12',
    input: 'text-base w-20',
    btn: 'h-12 w-12',
    icon: 'size-5',
  },
}

// ---------------------------------------------------------------------------
// NumberSpinner (jQuery UI .ui-spinner style – vertical up/down on the right)
// ---------------------------------------------------------------------------

export function NumberSpinner({
  value: controlledValue,
  onValueChange,
  defaultValue = 0,
  min,
  max,
  step = 1,
  precision = 0,
  prefix,
  suffix,
  thousandsSeparator = false,
  disabled = false,
  size = 'default',
  placeholder,
  className,
  wheelable = true,
  formatValue,
  id,
  name,
  ariaLabel,
}: NumberSpinnerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef = React.useRef(300)

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState<number>(defaultValue)
  const [isFocused, setIsFocused] = React.useState(false)
  // Track the raw input text when the user is typing in the field
  const [inputText, setInputText] = React.useState<string | null>(null)

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  // -----------------------------------------------------------------------
  // Value helpers
  // -----------------------------------------------------------------------

  const updateValue = React.useCallback(
    (next: number) => {
      const clamped = clamp(roundToPrecision(next, precision), min, max)
      if (!isControlled) setInternalValue(clamped)
      onValueChange?.(clamped)
    },
    [isControlled, onValueChange, precision, min, max]
  )

  const increment = React.useCallback(
    (s: number = step) => {
      updateValue(currentValue + s)
    },
    [currentValue, step, updateValue]
  )

  const decrement = React.useCallback(
    (s: number = step) => {
      updateValue(currentValue - s)
    },
    [currentValue, step, updateValue]
  )

  // -----------------------------------------------------------------------
  // Hold-button acceleration (continuous spin while pressing)
  // -----------------------------------------------------------------------

  const startSpin = React.useCallback(
    (direction: 'up' | 'down') => {
      const spin = direction === 'up' ? increment : decrement
      spin()
      speedRef.current = 300

      // After an initial delay, start repeating; accelerate over time
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          spin()
          // Accelerate: reduce interval by ~15% each tick, floor at 40ms
          speedRef.current = Math.max(40, speedRef.current * 0.85)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = setInterval(spin, speedRef.current)
          }
        }, speedRef.current)
      }, 400) // initial delay before repeat kicks in
    },
    [increment, decrement]
  )

  const stopSpin = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    speedRef.current = 300
  }, [])

  // Clean up on unmount
  React.useEffect(() => {
    return () => stopSpin()
  }, [stopSpin])

  // -----------------------------------------------------------------------
  // Keyboard
  // -----------------------------------------------------------------------

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          increment()
          break
        case 'ArrowDown':
          e.preventDefault()
          decrement()
          break
        case 'PageUp':
          e.preventDefault()
          increment(step * 10)
          break
        case 'PageDown':
          e.preventDefault()
          decrement(step * 10)
          break
        case 'Home':
          e.preventDefault()
          if (min !== undefined) updateValue(min)
          break
        case 'End':
          e.preventDefault()
          if (max !== undefined) updateValue(max)
          break
      }
    },
    [increment, decrement, step, min, max, updateValue]
  )

  // -----------------------------------------------------------------------
  // Mouse wheel
  // -----------------------------------------------------------------------

  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      if (!wheelable || disabled) return
      if (!isFocused && document.activeElement !== inputRef.current) return
      e.preventDefault()
      if (e.deltaY < 0) increment()
      else decrement()
    },
    [wheelable, disabled, isFocused, increment, decrement]
  )

  // -----------------------------------------------------------------------
  // Direct input editing
  // -----------------------------------------------------------------------

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value)
    },
    []
  )

  const commitInput = React.useCallback(() => {
    if (inputText !== null) {
      const parsed = parseInput(inputText, prefix, suffix)
      if (parsed !== null) {
        updateValue(parsed)
      }
      setInputText(null)
    }
    setIsFocused(false)
  }, [inputText, prefix, suffix, updateValue])

  const handleFocus = React.useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = React.useCallback(() => {
    commitInput()
  }, [commitInput])

  // -----------------------------------------------------------------------
  // Display value
  // -----------------------------------------------------------------------

  const displayValue = React.useMemo(() => {
    if (inputText !== null) return inputText
    if (currentValue === 0 && placeholder && !isControlled && internalValue === 0 && !isFocused) {
      // Show placeholder when appropriate
      return ''
    }
    return formatNumber(currentValue, precision, thousandsSeparator, prefix, suffix, formatValue)
  }, [currentValue, precision, thousandsSeparator, prefix, suffix, formatValue, inputText, isControlled, internalValue, isFocused, placeholder])

  const showPlaceholder = !isFocused && (inputText === null) && (currentValue === defaultValue) && placeholder

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const sizeInfo = sizeClasses[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center',
        sizeInfo.wrapper,
        'rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
        isFocused && 'border-navy-500 ring-[3px] ring-navy-500/20',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onWheel={handleWheel}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        className={cn(
          'flex-1 h-full min-w-0 bg-transparent px-3 py-1 outline-none',
          sizeInfo.input,
          'text-foreground placeholder:text-muted-foreground',
          'pr-0' // no right padding – buttons sit flush
        )}
        value={showPlaceholder ? '' : displayValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {/* Spinner buttons – stacked vertically on the right (jQuery UI layout) */}
      <div className="flex flex-col self-stretch border-l border-input">
        <button
          type="button"
          tabIndex={-1}
          className={cn(
            'flex items-center justify-center flex-1 rounded-tr-md',
            sizeInfo.btn,
            'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700',
            'text-navy-600 dark:text-navy-200',
            'transition-colors duration-100',
            'border-b border-input',
            disabled && 'cursor-not-allowed'
          )}
          onMouseDown={(e) => {
            e.preventDefault() // keep focus off the button
            startSpin('up')
          }}
          onMouseUp={stopSpin}
          onMouseLeave={stopSpin}
          aria-label="Increment"
        >
          <ChevronUp className={sizeInfo.icon} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          className={cn(
            'flex items-center justify-center flex-1 rounded-br-md',
            sizeInfo.btn,
            'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700',
            'text-navy-600 dark:text-navy-200',
            'transition-colors duration-100',
            disabled && 'cursor-not-allowed'
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            startSpin('down')
          }}
          onMouseUp={stopSpin}
          onMouseLeave={stopSpin}
          aria-label="Decrement"
        >
          <ChevronDown className={sizeInfo.icon} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpinnerInput – compact horizontal layout with +/- buttons on each side
// ---------------------------------------------------------------------------

export function SpinnerInput({
  value: controlledValue,
  onValueChange,
  defaultValue = 0,
  min,
  max,
  step = 1,
  precision = 0,
  prefix,
  suffix,
  thousandsSeparator = false,
  disabled = false,
  size = 'default',
  placeholder,
  className,
  wheelable = true,
  formatValue,
  id,
  name,
  ariaLabel,
}: SpinnerInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef = React.useRef(300)

  const [internalValue, setInternalValue] = React.useState<number>(defaultValue)
  const [isFocused, setIsFocused] = React.useState(false)
  const [inputText, setInputText] = React.useState<string | null>(null)

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  // -----------------------------------------------------------------------
  // Value helpers
  // -----------------------------------------------------------------------

  const updateValue = React.useCallback(
    (next: number) => {
      const clamped = clamp(roundToPrecision(next, precision), min, max)
      if (!isControlled) setInternalValue(clamped)
      onValueChange?.(clamped)
    },
    [isControlled, onValueChange, precision, min, max]
  )

  const increment = React.useCallback(
    (s: number = step) => {
      updateValue(currentValue + s)
    },
    [currentValue, step, updateValue]
  )

  const decrement = React.useCallback(
    (s: number = step) => {
      updateValue(currentValue - s)
    },
    [currentValue, step, updateValue]
  )

  // -----------------------------------------------------------------------
  // Hold-button acceleration
  // -----------------------------------------------------------------------

  const startSpin = React.useCallback(
    (direction: 'up' | 'down') => {
      const spin = direction === 'up' ? increment : decrement
      spin()
      speedRef.current = 300

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          spin()
          speedRef.current = Math.max(40, speedRef.current * 0.85)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = setInterval(spin, speedRef.current)
          }
        }, speedRef.current)
      }, 400)
    },
    [increment, decrement]
  )

  const stopSpin = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    speedRef.current = 300
  }, [])

  React.useEffect(() => {
    return () => stopSpin()
  }, [stopSpin])

  // -----------------------------------------------------------------------
  // Keyboard
  // -----------------------------------------------------------------------

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          increment()
          break
        case 'ArrowDown':
          e.preventDefault()
          decrement()
          break
        case 'PageUp':
          e.preventDefault()
          increment(step * 10)
          break
        case 'PageDown':
          e.preventDefault()
          decrement(step * 10)
          break
        case 'Home':
          e.preventDefault()
          if (min !== undefined) updateValue(min)
          break
        case 'End':
          e.preventDefault()
          if (max !== undefined) updateValue(max)
          break
      }
    },
    [increment, decrement, step, min, max, updateValue]
  )

  // -----------------------------------------------------------------------
  // Mouse wheel
  // -----------------------------------------------------------------------

  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      if (!wheelable || disabled) return
      if (!isFocused && document.activeElement !== inputRef.current) return
      e.preventDefault()
      if (e.deltaY < 0) increment()
      else decrement()
    },
    [wheelable, disabled, isFocused, increment, decrement]
  )

  // -----------------------------------------------------------------------
  // Direct input editing
  // -----------------------------------------------------------------------

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value)
    },
    []
  )

  const commitInput = React.useCallback(() => {
    if (inputText !== null) {
      const parsed = parseInput(inputText, prefix, suffix)
      if (parsed !== null) {
        updateValue(parsed)
      }
      setInputText(null)
    }
    setIsFocused(false)
  }, [inputText, prefix, suffix, updateValue])

  const handleFocus = React.useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = React.useCallback(() => {
    commitInput()
  }, [commitInput])

  // -----------------------------------------------------------------------
  // Display value
  // -----------------------------------------------------------------------

  const displayValue = React.useMemo(() => {
    if (inputText !== null) return inputText
    return formatNumber(currentValue, precision, thousandsSeparator, prefix, suffix, formatValue)
  }, [currentValue, precision, thousandsSeparator, prefix, suffix, formatValue, inputText])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const sizeInfo = spinnerInputSizeClasses[size]

  return (
    <div
      className={cn(
        'inline-flex items-center',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onWheel={handleWheel}
    >
      {/* Minus button */}
      <button
        type="button"
        tabIndex={-1}
        className={cn(
          'inline-flex items-center justify-center rounded-l-md border border-input border-r-0',
          sizeInfo.btn,
          'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700',
          'text-navy-600 dark:text-navy-200',
          'transition-colors duration-100',
          disabled && 'cursor-not-allowed'
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          startSpin('down')
        }}
        onMouseUp={stopSpin}
        onMouseLeave={stopSpin}
        aria-label="Decrement"
      >
        <Minus className={sizeInfo.icon} />
      </button>

      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        className={cn(
          'h-full bg-transparent text-center outline-none border border-input px-1 py-1',
          sizeInfo.input,
          'text-foreground placeholder:text-muted-foreground',
          isFocused && 'border-navy-500 ring-[3px] ring-navy-500/20'
        )}
        value={displayValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {/* Plus button */}
      <button
        type="button"
        tabIndex={-1}
        className={cn(
          'inline-flex items-center justify-center rounded-r-md border border-input border-l-0',
          sizeInfo.btn,
          'bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700',
          'text-navy-600 dark:text-navy-200',
          'transition-colors duration-100',
          disabled && 'cursor-not-allowed'
        )}
        onMouseDown={(e) => {
          e.preventDefault()
          startSpin('up')
        }}
        onMouseUp={stopSpin}
        onMouseLeave={stopSpin}
        aria-label="Increment"
      >
        <Plus className={sizeInfo.icon} />
      </button>
    </div>
  )
}
