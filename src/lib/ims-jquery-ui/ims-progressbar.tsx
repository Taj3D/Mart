/**
 * IMS jQuery UI Progressbar Component
 * Replaces jQuery UI 1.12.1 progressbar.js
 *
 * Features:
 * - Determinate mode (value 0-max)
 * - Indeterminate mode (animated)
 * - Custom max value
 * - Show value label
 * - Striped animation
 * - Deep Navy Blue themed progress bar
 * - Events: onChange, onComplete, onCreate
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import type { ProgressbarOptions } from "./types";

// ============================================================================
// ImsJuiProgressbar
// ============================================================================

export interface ImsJuiProgressbarProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    ProgressbarOptions {
  /** Controlled value (0 to max) */
  value?: number;
  /** Whether to show the value label */
  showLabel?: boolean;
  /** Whether to show striped animation */
  striped?: boolean;
  /** Whether indeterminate mode (animated, no value) */
  indeterminate?: boolean;
  /** Label position */
  labelPosition?: "inside" | "outside" | "right";
  /** Custom label renderer */
  renderLabel?: (value: number, max: number) => string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
}

export function ImsJuiProgressbar({
  disabled = false,
  max = 100,
  value: controlledValue = 0,
  showLabel = false,
  striped = false,
  indeterminate = false,
  labelPosition = "outside",
  renderLabel,
  size = "default",
  onChange,
  onComplete,
  onCreate,
  className,
  ...props
}: ImsJuiProgressbarProps) {
  const [internalValue, setInternalValue] = React.useState(controlledValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Percentage for display
  const percentage = Math.min(100, Math.max(0, (currentValue / max) * 100));
  const isComplete = currentValue >= max;

  // Fire onCreate on mount
  React.useEffect(() => {
    onCreate?.({} as React.Event);
  }, [onCreate]);

  // Fire onChange when value changes
  const prevValueRef = React.useRef(currentValue);
  React.useEffect(() => {
    if (prevValueRef.current !== currentValue) {
      onChange?.({} as React.Event, { value: currentValue });
      prevValueRef.current = currentValue;
    }
  }, [currentValue, onChange]);

  // Fire onComplete when value reaches max
  const prevCompleteRef = React.useRef(false);
  React.useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      onComplete?.({} as React.Event, { value: currentValue });
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, onComplete, currentValue]);

  // Size classes
  const sizeClasses = React.useMemo(() => {
    switch (size) {
      case "sm":
        return { track: "h-2", text: "text-xs" };
      case "lg":
        return { track: "h-5", text: "text-base" };
      default:
        return { track: "h-3.5", text: "text-sm" };
    }
  }, [size]);

  // Label text
  const labelText = React.useMemo(() => {
    if (renderLabel) return renderLabel(currentValue, max);
    return `${Math.round(percentage)}%`;
  }, [renderLabel, currentValue, max, percentage]);

  return (
    <div
      className={cn(
        "ims-jui-progressbar",
        "flex items-center gap-2 w-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : currentValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={indeterminate ? "Loading..." : labelText}
      aria-busy={indeterminate}
      {...props}
    >
      {/* Label above (outside) */}
      {showLabel && labelPosition === "outside" && !indeterminate && (
        <div
          className={cn(
            "ims-jui-progressbar-label-outside",
            "w-full flex justify-between mb-1",
            sizeClasses.text,
            "text-navy-600 dark:text-navy-300 font-medium"
          )}
        >
          <span>Progress</span>
          <span>{labelText}</span>
        </div>
      )}

      {/* Progress track */}
      <div
        className={cn(
          "ims-jui-progressbar-track-wrapper",
          "relative flex-1",
          labelPosition === "outside" && showLabel && "mt-0"
        )}
      >
        <ProgressPrimitive.Root
          data-slot="ims-jui-progressbar"
          className={cn(
            "relative overflow-hidden rounded-full",
            sizeClasses.track,
            "bg-navy-100 dark:bg-navy-800"
          )}
          value={indeterminate ? undefined : currentValue}
          max={max}
        >
          <ProgressPrimitive.Indicator
            data-slot="ims-jui-progressbar-indicator"
            className={cn(
              "h-full w-full flex-1 rounded-full transition-all",
              !indeterminate && "duration-300 ease-in-out"
            )}
            style={{
              transform: indeterminate
                ? "translateX(-100%)"
                : `translateX(-${100 - percentage}%)`,
              background: indeterminate
                ? "linear-gradient(90deg, var(--navy-600), var(--navy-500), var(--navy-600))"
                : "linear-gradient(90deg, var(--navy-700), var(--navy-600))",
            }}
          >
            {/* Striped overlay */}
            {striped && (
              <div
                className={cn(
                  "absolute inset-0",
                  "bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.08)_8px,rgba(255,255,255,0.08)_16px)]",
                  indeterminate && "animate-[ims-progressbar-stripe_1s_linear_infinite]"
                )}
              />
            )}

            {/* Indeterminate animation */}
            {indeterminate && (
              <div
                className="absolute inset-0 animate-[ims-progressbar-indeterminate_1.5s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                }}
              />
            )}

            {/* Label inside */}
            {showLabel && labelPosition === "inside" && !indeterminate && percentage > 15 && (
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "text-white font-semibold",
                  size === "sm" ? "text-[10px]" : "text-xs"
                )}
              >
                {labelText}
              </span>
            )}
          </ProgressPrimitive.Indicator>
        </ProgressPrimitive.Root>
      </div>

      {/* Label to the right */}
      {showLabel && labelPosition === "right" && !indeterminate && (
        <span
          className={cn(
            "ims-jui-progressbar-label-right",
            "shrink-0 text-navy-600 dark:text-navy-300 font-medium tabular-nums",
            sizeClasses.text,
            "min-w-[3em] text-right"
          )}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}
