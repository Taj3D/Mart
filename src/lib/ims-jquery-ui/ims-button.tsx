/**
 * IMS jQuery UI Button, CheckboxRadio, and ControlGroup Components
 * Replaces jQuery UI 1.12.1 button.js, checkboxradio.js, and controlgroup.js
 *
 * ImsJuiButton Features:
 * - Icon support (primary/secondary)
 * - Text only, icon only, or text+icon modes
 * - Disabled state
 * - Deep Navy Blue themed
 * - Primary buttons use --navy-600 background
 *
 * ImsJuiCheckboxRadio Features:
 * - Custom styled checkbox/radio with labels
 * - Icon support
 * - Disabled state
 * - Deep Navy Blue themed (--navy-600 when checked)
 *
 * ImsJuiControlGroup Features:
 * - Horizontal/vertical button groups
 * - Consistent styling across grouped controls
 * - Deep Navy Blue themed
 * - Disabled state
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  ButtonOptions,
  CheckboxRadioOptions,
  ControlGroupOptions,
  ControlGroupItemOptions,
} from "./types";

// ============================================================================
// ImsJuiButton - Replaces jQuery UI button.js
// ============================================================================

export interface ImsJuiButtonProps
  extends Omit<React.ComponentProps<"button">, "type">,
    ButtonOptions {
  /** Button variant */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  /** Button size */
  size?: "xs" | "sm" | "default" | "lg" | "icon";
  /** Primary icon element (displayed at beginning or per iconPosition) */
  primaryIcon?: React.ReactNode;
  /** Secondary icon element (displayed at end or per iconPosition) */
  secondaryIcon?: React.ReactNode;
  /** Icon position */
  iconPosition?: "beginning" | "end" | "top" | "bottom";
  /** Whether to show only the icon (no text) */
  iconOnly?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Type attribute for the button */
  type?: "button" | "submit" | "reset";
  /** Whether the button is in active/pressed state */
  active?: boolean;
  /** Custom className */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export function ImsJuiButton({
  disabled = false,
  text = true,
  label,
  primaryIcon,
  secondaryIcon,
  iconPosition = "beginning",
  iconOnly = false,
  variant = "primary",
  size = "default",
  active = false,
  type = "button",
  className,
  children,
  ...props
}: ImsJuiButtonProps) {
  const displayLabel = label ?? (typeof children === "string" ? children : undefined);
  const showLabel = text && !iconOnly && (displayLabel || children);

  // Map variant to classes
  const variantClasses: Record<string, string> = {
    primary: cn(
      "bg-[var(--navy-600,#1e3a5f)] text-white shadow-xs",
      "hover:bg-[var(--navy-700,#162d4a)]",
      "focus-visible:ring-[var(--navy-500,#2a5a8f)]/30",
      "active:bg-[var(--navy-800,#0f2040)]"
    ),
    secondary: cn(
      "bg-[var(--navy-100,#d0ddef)] text-[var(--navy-800,#0f2040)] shadow-xs",
      "hover:bg-[var(--navy-200,#a8c4dd)]",
      "dark:bg-[var(--navy-800,#0f2040)] dark:text-[var(--navy-200,#a8c4dd)]",
      "dark:hover:bg-[var(--navy-700,#162d4a)]"
    ),
    outline: cn(
      "border border-[var(--navy-600,#1e3a5f)] bg-transparent",
      "text-[var(--navy-600,#1e3a5f)]",
      "hover:bg-[var(--navy-50,#e8f0f8)] hover:text-[var(--navy-700,#162d4a)]",
      "dark:border-[var(--navy-400,#5b8abf)] dark:text-[var(--navy-300,#6d9ecb)]",
      "dark:hover:bg-[var(--navy-800,#0f2040)] dark:hover:text-[var(--navy-200,#a8c4dd)]"
    ),
    ghost: cn(
      "bg-transparent text-[var(--navy-600,#1e3a5f)]",
      "hover:bg-[var(--navy-50,#e8f0f8)] hover:text-[var(--navy-700,#162d4a)]",
      "dark:text-[var(--navy-300,#6d9ecb)]",
      "dark:hover:bg-[var(--navy-800,#0f2040)] dark:hover:text-[var(--navy-200,#a8c4dd)]"
    ),
    danger: cn(
      "bg-red-600 text-white shadow-xs",
      "hover:bg-red-700",
      "focus-visible:ring-red-500/30",
      "active:bg-red-800"
    ),
    success: cn(
      "bg-emerald-600 text-white shadow-xs",
      "hover:bg-emerald-700",
      "focus-visible:ring-emerald-500/30",
      "active:bg-emerald-800"
    ),
  };

  // Map size to classes
  const sizeClasses: Record<string, string> = {
    xs: "h-7 rounded gap-1 px-2 text-xs",
    sm: "h-8 rounded-md gap-1.5 px-3 text-sm",
    default: "h-9 rounded-md px-4 text-sm",
    lg: "h-10 rounded-md px-6 text-base",
    icon: "size-9",
  };

  // Icon layout based on iconPosition
  const isVertical = iconPosition === "top" || iconPosition === "bottom";
  const isEnd = iconPosition === "end";
  const isBottom = iconPosition === "bottom";

  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={active || undefined}
      data-slot="ims-jui-button"
      className={cn(
        "ims-jui-button",
        "inline-flex items-center justify-center font-medium transition-all outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-offset-1",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isVertical && "flex-col gap-0.5",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.default,
        active && "ring-2 ring-[var(--navy-500,#2a5a8f)]/30",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Icon at beginning / top */}
      {primaryIcon && !isEnd && !isBottom && (
        <span className="shrink-0">{primaryIcon}</span>
      )}
      {primaryIcon && isBottom === false && isVertical && iconPosition === "top" && (
        <span className="shrink-0">{primaryIcon}</span>
      )}

      {/* Label */}
      {showLabel && <span>{displayLabel ?? children}</span>}

      {/* Icon at end / bottom */}
      {secondaryIcon && !isVertical && (
        <span className="shrink-0">{secondaryIcon}</span>
      )}
      {primaryIcon && isEnd && !isVertical && (
        <span className="shrink-0">{primaryIcon}</span>
      )}
      {primaryIcon && isBottom && (
        <span className="shrink-0">{primaryIcon}</span>
      )}

      {/* Icon only - show primary icon centered */}
      {iconOnly && !primaryIcon && !secondaryIcon && children}
    </button>
  );
}

// ============================================================================
// ImsJuiCheckboxRadio - Replaces jQuery UI checkboxradio.js
// ============================================================================

export type CheckboxRadioType = "checkbox" | "radio";

export interface ImsJuiCheckboxRadioProps extends Omit<CheckboxRadioOptions, "icon"> {
  /** Type: checkbox or radio */
  type?: CheckboxRadioType;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Value (for radio groups) */
  value?: string;
  /** Name attribute */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Custom icon to replace the default check mark */
  icon?: React.ReactNode;
  /** Label position */
  labelPosition?: "start" | "end";
  /** Custom className */
  className?: string;
  /** Custom className for the label */
  labelClassName?: string;
  /** Children (label content) */
  children?: React.ReactNode;
}

export function ImsJuiCheckboxRadio({
  type = "checkbox",
  disabled = false,
  label,
  icon,
  checked: controlledChecked,
  defaultChecked,
  onCheckedChange,
  value,
  name,
  id,
  labelPosition = "end",
  className,
  labelClassName,
  children,
}: ImsJuiCheckboxRadioProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const displayLabel = label ?? (typeof children === "string" ? children : undefined);

  if (type === "radio") {
    return (
      <div
        data-slot="ims-jui-checkboxradio"
        className={cn(
          "ims-jui-checkboxradio",
          "flex items-center gap-2",
          labelPosition === "start" && "flex-row-reverse",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <RadioGroupPrimitive.Item
          id={inputId}
          value={value ?? ""}
          disabled={disabled}
          className={cn(
            "ims-jui-radio",
            "aspect-square size-4 shrink-0 rounded-full border shadow-xs",
            "transition-[color,box-shadow] outline-none",
            // Border
            "border-[var(--navy-400,#5b8abf)]",
            "dark:border-[var(--navy-500,#2a5a8f)]",
            // Background
            "bg-white dark:bg-[var(--navy-900,#0a1628)]",
            // Focus - navy-500 ring
            "focus-visible:ring-[3px] focus-visible:ring-[var(--navy-500,#2a5a8f)]/30",
            "focus-visible:border-[var(--navy-500,#2a5a8f)]",
            // Hover
            "hover:border-[var(--navy-600,#1e3a5f)]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-[var(--navy-600,#1e3a5f)] text-[var(--navy-600,#1e3a5f)]" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        {(displayLabel || children) && (
          <Label
            htmlFor={inputId}
            className={cn(
              "cursor-pointer text-sm font-medium",
              "text-[var(--navy-700,#162d4a)] dark:text-[var(--navy-200,#a8c4dd)]",
              disabled && "cursor-not-allowed",
              labelClassName
            )}
          >
            {displayLabel ?? children}
          </Label>
        )}
      </div>
    );
  }

  // Checkbox type
  return (
    <div
      data-slot="ims-jui-checkboxradio"
      className={cn(
        "ims-jui-checkboxradio",
        "flex items-center gap-2",
        labelPosition === "start" && "flex-row-reverse",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <CheckboxPrimitive.Root
        id={inputId}
        checked={controlledChecked}
        defaultChecked={defaultChecked}
        onCheckedChange={(val) => onCheckedChange?.(val === true)}
        disabled={disabled}
        className={cn(
          "ims-jui-checkbox",
          "size-4 shrink-0 rounded-[4px] border shadow-xs",
          "transition-[color,box-shadow] outline-none",
          // Border
          "border-[var(--navy-400,#5b8abf)]",
          "dark:border-[var(--navy-500,#2a5a8f)]",
          // Background
          "bg-white dark:bg-[var(--navy-900,#0a1628)]",
          // Checked state - navy-600 background
          "data-[state=checked]:bg-[var(--navy-600,#1e3a5f)]",
          "data-[state=checked]:border-[var(--navy-600,#1e3a5f)]",
          "data-[state=checked]:text-white",
          // Focus - navy-500 ring
          "focus-visible:ring-[3px] focus-visible:ring-[var(--navy-500,#2a5a8f)]/30",
          "focus-visible:border-[var(--navy-500,#2a5a8f)]",
          // Hover
          "hover:border-[var(--navy-600,#1e3a5f)]",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <CheckboxPrimitive.Indicator
          className="flex items-center justify-center text-current transition-none"
        >
          {icon ?? <CheckIcon className="size-3.5" />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(displayLabel || children) && (
        <Label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer text-sm font-medium",
            "text-[var(--navy-700,#162d4a)] dark:text-[var(--navy-200,#a8c4dd)]",
            disabled && "cursor-not-allowed",
            labelClassName
          )}
        >
          {displayLabel ?? children}
        </Label>
      )}
    </div>
  );
}

// ============================================================================
// ImsJuiCheckboxRadioGroup - Radio Group Container
// ============================================================================

export interface ImsJuiCheckboxRadioGroupProps {
  /** Name attribute for the radio group */
  name?: string;
  /** Currently selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Called when the selected value changes */
  onValueChange?: (value: string) => void;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Custom className */
  className?: string;
  /** Children (ImsJuiCheckboxRadio with type="radio") */
  children?: React.ReactNode;
}

export function ImsJuiCheckboxRadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  direction = "vertical",
  className,
  children,
}: ImsJuiCheckboxRadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(
        "ims-jui-radiogroup",
        direction === "horizontal" ? "flex flex-row gap-4" : "grid gap-3",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
}

// ============================================================================
// ImsJuiControlGroup - Replaces jQuery UI controlgroup.js
// ============================================================================

interface ImsJuiControlGroupContextValue {
  /** Direction of the control group */
  direction: "horizontal" | "vertical";
  /** Whether the group is disabled */
  disabled: boolean;
  /** Size variant */
  size: "xs" | "sm" | "default" | "lg";
}

const ImsJuiControlGroupContext = React.createContext<ImsJuiControlGroupContextValue>({
  direction: "horizontal",
  disabled: false,
  size: "default",
});

function useImsJuiControlGroupContext() {
  return React.useContext(ImsJuiControlGroupContext);
}

export interface ImsJuiControlGroupProps
  extends Omit<React.ComponentProps<"div">, "direction">,
    ControlGroupOptions {
  /** Size variant for all children */
  size?: "xs" | "sm" | "default" | "lg";
  /** Custom className */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export function ImsJuiControlGroup({
  direction = "horizontal",
  disabled = false,
  size = "default",
  className,
  children,
  ...props
}: ImsJuiControlGroupProps) {
  const contextValue = React.useMemo<ImsJuiControlGroupContextValue>(
    () => ({ direction, disabled, size }),
    [direction, disabled, size]
  );

  return (
    <ImsJuiControlGroupContext.Provider value={contextValue}>
      <div
        data-slot="ims-jui-controlgroup"
        role="group"
        aria-disabled={disabled}
        className={cn(
          "ims-jui-controlgroup",
          "inline-flex",
          direction === "vertical" ? "flex-col" : "flex-row",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ImsJuiControlGroupContext.Provider>
  );
}

// ============================================================================
// ImsJuiControlGroupItem - Individual button/item in a ControlGroup
// ============================================================================

export interface ImsJuiControlGroupItemProps
  extends React.ComponentProps<"button">,
    ControlGroupItemOptions {
  /** Whether the item is active/pressed */
  active?: boolean;
  /** Custom className */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

export function ImsJuiControlGroupItem({
  active = false,
  disabled: itemDisabled = false,
  icon,
  label,
  showLabel = true,
  className,
  children,
  ...props
}: ImsJuiControlGroupItemProps) {
  const { direction, disabled: groupDisabled, size } = useImsJuiControlGroupContext();
  const isDisabled = itemDisabled || groupDisabled;

  // Size map
  const sizeMap: Record<string, string> = {
    xs: "h-7 px-2 text-xs gap-1",
    sm: "h-8 px-3 text-sm gap-1.5",
    default: "h-9 px-4 text-sm gap-2",
    lg: "h-10 px-6 text-base gap-2",
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-pressed={active || undefined}
      data-slot="ims-jui-controlgroup-item"
      className={cn(
        "ims-jui-controlgroup-item",
        "inline-flex items-center justify-center font-medium transition-colors select-none",
        "border border-[var(--navy-300,#3d6098)] dark:border-[var(--navy-600,#1e3a5f)]",
        sizeMap[size] || sizeMap.default,
        // Connected borders
        direction === "horizontal"
          ? "rounded-none first:rounded-l-md last:rounded-r-md -ml-[1px] first:ml-0"
          : "rounded-none first:rounded-t-md last:rounded-b-md -mt-[1px] first:mt-0",
        // Default state
        "bg-white dark:bg-[var(--navy-900,#0a1628)]",
        "text-[var(--navy-700,#162d4a)] dark:text-[var(--navy-200,#a8c4dd)]",
        // Hover
        !isDisabled && "hover:bg-[var(--navy-50,#e8f0f8)] dark:hover:bg-[var(--navy-800,#0f2040)]",
        !isDisabled && "hover:border-[var(--navy-400,#5b8abf)] dark:hover:border-[var(--navy-500,#2a5a8f)]",
        !isDisabled && "hover:z-10",
        // Focus
        !isDisabled && "focus:z-20 focus:outline-none focus:ring-2 focus:ring-[var(--navy-500,#2a5a8f)]/30 focus:border-[var(--navy-500,#2a5a8f)]",
        // Active/pressed state - navy-600 background
        active && "bg-[var(--navy-600,#1e3a5f)] text-white border-[var(--navy-600,#1e3a5f)] z-10",
        active && !isDisabled && "hover:bg-[var(--navy-700,#162d4a)]",
        // Disabled
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        // Icon sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{typeof icon === "string" ? <span>{icon}</span> : icon}</span>}
      {showLabel !== false && (label ?? children)}
    </button>
  );
}

// ============================================================================
// ImsJuiControlGroupLabel - Label for a ControlGroup section
// ============================================================================

export interface ImsJuiControlGroupLabelProps extends React.ComponentProps<"div"> {
  /** Label text */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function ImsJuiControlGroupLabel({
  children,
  className,
  ...props
}: ImsJuiControlGroupLabelProps) {
  const { direction } = useImsJuiControlGroupContext();

  return (
    <div
      data-slot="ims-jui-controlgroup-label"
      className={cn(
        "ims-jui-controlgroup-label",
        "flex items-center px-3 py-1.5",
        "text-xs font-semibold uppercase tracking-wider",
        "text-[var(--navy-500,#2a5a8f)] dark:text-[var(--navy-400,#5b8abf)]",
        "bg-[var(--navy-50,#e8f0f8)]/50 dark:bg-[var(--navy-900,#0a1628)]/30",
        "border border-[var(--navy-300,#3d6098)] dark:border-[var(--navy-600,#1e3a5f)]",
        direction === "horizontal"
          ? "rounded-none first:rounded-l-md -ml-[1px] first:ml-0"
          : "rounded-none first:rounded-t-md -mt-[1px] first:mt-0",
        className
      )}
      {...props}
    >
      <span className="text-[80%]">{children}</span>
    </div>
  );
}

// ============================================================================
// ImsJuiControlGroupSeparator - Visual separator
// ============================================================================

export interface ImsJuiControlGroupSeparatorProps extends React.ComponentProps<"div"> {
  /** Custom className */
  className?: string;
}

export function ImsJuiControlGroupSeparator({
  className,
  ...props
}: ImsJuiControlGroupSeparatorProps) {
  const { direction } = useImsJuiControlGroupContext();

  return (
    <div
      role="separator"
      data-slot="ims-jui-controlgroup-separator"
      className={cn(
        "ims-jui-controlgroup-separator",
        direction === "horizontal"
          ? "w-[1px] self-stretch bg-[var(--navy-300,#3d6098)] dark:bg-[var(--navy-600,#1e3a5f)] mx-0.5"
          : "h-[1px] w-full bg-[var(--navy-300,#3d6098)] dark:bg-[var(--navy-600,#1e3a5f)] my-0.5",
        className
      )}
      {...props}
    />
  );
}

// Re-export context for advanced usage
export { ImsJuiControlGroupContext };
