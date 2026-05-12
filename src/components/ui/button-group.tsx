'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ================================================================
   TYPES
   ================================================================ */

export type ButtonGroupOrientation = 'horizontal' | 'vertical'
export type ButtonGroupSize = 'sm' | 'default' | 'lg'

export interface ButtonGroupProps {
  /** Orientation of the button group */
  orientation?: ButtonGroupOrientation
  /** Size variant for all buttons in the group */
  size?: ButtonGroupSize
  /** Whether the group is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Button children */
  children: React.ReactNode
}

export interface ButtonGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether this item is active/selected */
  active?: boolean
  /** Icon to show before the label */
  icon?: React.ElementType
  /** Additional CSS class */
  className?: string
  /** Button content */
  children: React.ReactNode
}

export interface ButtonGroupLabelProps {
  /** Label text */
  children: React.ReactNode
  /** Additional CSS class */
  className?: string
}

export interface ButtonGroupDividerProps {
  /** Orientation of the divider (auto-detected from group) */
  orientation?: ButtonGroupOrientation
  /** Additional CSS class */
  className?: string
}

/* ================================================================
   CONTEXT
   ================================================================ */

interface ButtonGroupContextValue {
  orientation: ButtonGroupOrientation
  size: ButtonGroupSize
  disabled: boolean
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({
  orientation: 'horizontal',
  size: 'default',
  disabled: false,
})

function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

/* ================================================================
   SIZE MAP
   ================================================================ */

const sizeMap: Record<ButtonGroupSize, { button: string; icon: string }> = {
  sm: {
    button: 'h-7 px-2.5 text-xs gap-1',
    icon: 'h-3.5 w-3.5',
  },
  default: {
    button: 'h-9 px-3 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    button: 'h-11 px-4 text-base gap-2',
    icon: 'h-5 w-5',
  },
}

/* ================================================================
   BUTTON GROUP
   ================================================================ */

/**
 * ButtonGroup - Replaces jQuery UI's .ui-controlgroup
 *
 * Groups buttons together with connected borders, supporting
 * horizontal and vertical orientations.
 *
 * @example
 * <ButtonGroup orientation="horizontal" size="default">
 *   <ButtonGroupItem icon={Bold}>Bold</ButtonGroupItem>
 *   <ButtonGroupItem icon={Italic}>Italic</ButtonGroupItem>
 *   <ButtonGroupItem icon={Underline}>Underline</ButtonGroupItem>
 * </ButtonGroup>
 *
 * // With label and divider
 * <ButtonGroup orientation="vertical">
 *   <ButtonGroupLabel>Alignment</ButtonGroupLabel>
 *   <ButtonGroupItem icon={AlignLeft}>Left</ButtonGroupItem>
 *   <ButtonGroupItem icon={AlignCenter}>Center</ButtonGroupItem>
 *   <ButtonGroupDivider />
 *   <ButtonGroupItem icon={AlignRight}>Right</ButtonGroupItem>
 * </ButtonGroup>
 */
export function ButtonGroup({
  orientation = 'horizontal',
  size = 'default',
  disabled = false,
  className,
  children,
}: ButtonGroupProps) {
  return (
    <ButtonGroupContext.Provider value={{ orientation, size, disabled }}>
      <div
        className={cn(
          'ims-controlgroup inline-flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className
        )}
        role={orientation === 'vertical' ? 'listbox' : 'group'}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
}

/* ================================================================
   BUTTON GROUP ITEM
   ================================================================ */

/**
 * ButtonGroupItem - Individual button within a ButtonGroup
 *
 * Automatically connects borders with siblings and applies
 * Navy Blue theme styling.
 */
export function ButtonGroupItem({
  active = false,
  icon: Icon,
  className,
  children,
  disabled: itemDisabled,
  ...props
}: ButtonGroupItemProps) {
  const { orientation, size, disabled: groupDisabled } = useButtonGroup()
  const isDisabled = itemDisabled || groupDisabled
  const sizes = sizeMap[size]

  return (
    <button
      type="button"
      className={cn(
        // Base styles
        'ims-controlgroup-item inline-flex items-center justify-center',
        'font-medium transition-colors select-none',
        'border border-border',
        sizes.button,

        // Connected borders (remove inner borders to avoid doubles)
        orientation === 'horizontal'
          ? 'rounded-none first:rounded-l-md last:rounded-r-md -ml-[1px] first:ml-0'
          : 'rounded-none first:rounded-t-md last:rounded-b-md -mt-[1px] first:mt-0',

        // Default state (matching .ui-state-default)
        'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200',

        // Hover state (matching .ui-state-hover)
        !isDisabled && 'hover:bg-navy-50 dark:hover:bg-navy-700 hover:text-navy-900 dark:hover:text-white hover:border-navy-300 dark:hover:border-navy-600 hover:z-10',

        // Focus state (matching .ui-state-focus)
        !isDisabled && 'focus:z-20 focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500',

        // Active state (matching .ui-state-active)
        active && 'bg-navy-600 dark:bg-navy-700 text-white border-navy-600 dark:border-navy-700 z-10',
        active && !isDisabled && 'hover:bg-navy-700 dark:hover:bg-navy-600',

        // Disabled state (matching .ui-state-disabled)
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',

        className
      )}
      disabled={isDisabled}
      aria-pressed={active}
      {...props}
    >
      {Icon && <Icon className={sizes.icon} />}
      {children}
    </button>
  )
}

/* ================================================================
   BUTTON GROUP LABEL
   ================================================================ */

/**
 * ButtonGroupLabel - Label for a section of buttons
 *
 * Replaces jQuery UI's .ui-controlgroup-label
 */
export function ButtonGroupLabel({ children, className }: ButtonGroupLabelProps) {
  const { orientation } = useButtonGroup()

  return (
    <div
      className={cn(
        'ims-controlgroup-label flex items-center px-3 py-1.5',
        'text-xs font-semibold uppercase tracking-wider',
        'text-navy-500 dark:text-navy-400',
        'bg-navy-50/50 dark:bg-navy-900/30',
        'border border-border',
        orientation === 'horizontal'
          ? 'rounded-none first:rounded-l-md -ml-[1px] first:ml-0'
          : 'rounded-none first:rounded-t-md -mt-[1px] first:mt-0',
        className
      )}
    >
      <span className="text-[80%]">{children}</span>
    </div>
  )
}

/* ================================================================
   BUTTON GROUP DIVIDER
   ================================================================ */

/**
 * ButtonGroupDivider - Visual separator between button groups
 *
 * Replaces the visual gap between control group sections
 */
export function ButtonGroupDivider({ className }: ButtonGroupDividerProps) {
  const { orientation } = useButtonGroup()

  return (
    <div
      className={cn(
        'ims-controlgroup-divider',
        orientation === 'horizontal'
          ? 'w-[1px] self-stretch bg-border mx-0.5'
          : 'h-[1px] w-full bg-border my-0.5',
        className
      )}
      role="separator"
    />
  )
}

/* ================================================================
   SEGMENTED CONTROL VARIANT
   ================================================================ */

export interface SegmentedControlProps {
  /** Available options */
  options: Array<{
    value: string
    label: string
    icon?: React.ElementType
  }>
  /** Currently selected value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** Callback when selection changes */
  onValueChange?: (value: string) => void
  /** Size variant */
  size?: ButtonGroupSize
  /** Whether disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * SegmentedControl - A single-select button group where one item is always active
 *
 * Useful for view mode switches (List/Grid/Table), alignment options, etc.
 */
export function SegmentedControl({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  size = 'default',
  disabled = false,
  className,
}: SegmentedControlProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || options[0]?.value)
  const currentValue = controlledValue ?? internalValue

  const handleChange = (newValue: string) => {
    if (disabled) return
    if (!controlledValue) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div
      className={cn(
        'ims-segmented-control inline-flex rounded-md border border-border p-0.5',
        'bg-navy-50/50 dark:bg-navy-900/30',
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = currentValue === option.value
        const Icon = option.icon
        const sizes = sizeMap[size]

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={cn(
              'inline-flex items-center justify-center font-medium transition-all',
              sizes.button,
              'rounded-md',
              isActive
                ? 'bg-navy-600 dark:bg-navy-700 text-white shadow-sm'
                : 'text-navy-600 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white',
              disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              !disabled && !isActive && 'cursor-pointer'
            )}
            onClick={() => handleChange(option.value)}
            disabled={disabled}
          >
            {Icon && <Icon className={sizes.icon} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
