/**
 * IMS jQuery UI Slider Component
 * Replaces jQuery UI 1.12.1 slider.js
 *
 * Features:
 * - Horizontal/vertical orientation
 * - Single value or range mode
 * - Min/max/step
 * - Range highlight (min, max, true)
 * - Animated
 * - Disabled state
 * - Custom tick marks and labels
 * - Deep Navy Blue themed track and thumb
 * - Events: onSlide, onStart, onStop, onChange, onCreate
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import type { SliderOptions, SliderUIState } from "./types";

// ============================================================================
// ImsJuiSliderLabel
// ============================================================================

export interface ImsJuiSliderLabelProps extends React.ComponentProps<"span"> {
  /** The value this label corresponds to */
  value: number;
  /** Display text (defaults to value) */
  text?: string;
  /** Whether this is a major tick mark */
  major?: boolean;
}

export function ImsJuiSliderLabel({
  value,
  text,
  major = false,
  className,
  ...props
}: ImsJuiSliderLabelProps) {
  return (
    <span
      className={cn(
        "ims-jui-slider-label",
        "absolute text-xs text-navy-500 dark:text-navy-300 -translate-x-1/2 select-none",
        major && "font-semibold text-navy-600 dark:text-navy-200",
        className
      )}
      data-value={value}
      {...props}
    >
      {text ?? value}
    </span>
  );
}

// ============================================================================
// ImsJuiSlider
// ============================================================================

export interface ImsJuiSliderProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    SliderOptions {
  /** Controlled value for single slider */
  value?: number;
  /** Controlled values for range slider */
  values?: number[];
  /** Default value for uncontrolled single slider */
  defaultValue?: number;
  /** Default values for uncontrolled range slider */
  defaultValues?: number[];
  /** Called when value changes */
  onValueChange?: (value: number | number[]) => void;
  /** Tick marks configuration */
  ticks?: {
    /** Step between ticks */
    step: number;
    /** Whether to show labels */
    showLabels?: boolean;
    /** Major tick interval (show bolder every N ticks) */
    majorEvery?: number;
  };
  /** Children (e.g., ImsJuiSliderLabel) */
  children?: React.ReactNode;
}

export function ImsJuiSlider({
  disabled = false,
  animate = false,
  max = 100,
  min = 0,
  orientation = "horizontal",
  step = 1,
  value: controlledValue,
  values: controlledValues,
  defaultValue,
  defaultValues,
  range,
  onSlide,
  onStart,
  onStop,
  onChange,
  onCreate,
  onValueChange,
  ticks,
  className,
  children,
  ...props
}: ImsJuiSliderProps) {
  const sliderRef = React.useRef<HTMLSpanElement>(null);

  // Determine if we are in range mode
  const isRange = range === true;
  const isRangeMin = range === "min";
  const isRangeMax = range === "max";

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState<number>(
    defaultValue ?? min
  );
  const [internalValues, setInternalValues] = React.useState<number[]>(
    defaultValues ?? [min, max]
  );

  // Resolve current values
  const isControlledSingle = controlledValue !== undefined;
  const isControlledRange = controlledValues !== undefined;

  const currentValue = isControlledSingle ? controlledValue : internalValue;
  const currentValues = isControlledRange ? controlledValues : internalValues;

  // Slider primitive value: always an array for Radix
  const sliderValue = React.useMemo(() => {
    if (isRange) return currentValues;
    if (isRangeMin || isRangeMax) return [currentValue];
    return [currentValue];
  }, [isRange, currentValues, currentValue, isRangeMin, isRangeMax]);

  // Animation duration
  const animDuration = React.useMemo(() => {
    if (animate === false) return 0;
    if (animate === true) return 200;
    if (typeof animate === "number") return animate;
    if (animate === "slow") return 600;
    if (animate === "fast") return 200;
    return 200;
  }, [animate]);

  // Fire onCreate on mount
  React.useEffect(() => {
    onCreate?.({} as React.Event);
  }, [onCreate]);

  // Build UI state for event handlers
  const buildUIState = React.useCallback(
    (val: number | number[], handleIndex: number = 0): SliderUIState => ({
      value: Array.isArray(val) ? val[handleIndex] : val,
      values: Array.isArray(val) ? val : [val],
      handle: sliderRef.current ?? document.createElement("span"),
      handleIndex,
    }),
    []
  );

  const handleValueChange = React.useCallback(
    (newValues: number[]) => {
      if (isRange) {
        if (!isControlledRange) setInternalValues(newValues);
        onValueChange?.(newValues);
        onChange?.({} as MouseEvent, buildUIState(newValues));
      } else {
        const v = newValues[0];
        if (!isControlledSingle) setInternalValue(v);
        onValueChange?.(v);
        onChange?.({} as MouseEvent, buildUIState(v));
      }
    },
    [
      isRange,
      isControlledRange,
      isControlledSingle,
      onValueChange,
      onChange,
      buildUIState,
    ]
  );

  const handleSlideStart = React.useCallback(
    (newValues: number[]) => {
      const uiState = buildUIState(isRange ? newValues : newValues[0]);
      onStart?.({} as MouseEvent, uiState);
    },
    [isRange, onStart, buildUIState]
  );

  const handleSlideEnd = React.useCallback(
    (newValues: number[]) => {
      const uiState = buildUIState(isRange ? newValues : newValues[0]);
      onStop?.({} as MouseEvent, uiState);
    },
    [isRange, onStop, buildUIState]
  );

  // Generate tick marks
  const tickMarks = React.useMemo(() => {
    if (!ticks) return [];
    const marks: { value: number; major: boolean }[] = [];
    const tickStep = ticks.step;
    for (let v = min; v <= max; v += tickStep) {
      const major =
        ticks.majorEvery !== undefined
          ? (v - min) % (tickStep * ticks.majorEvery) === 0
          : false;
      marks.push({ value: v, major });
    }
    return marks;
  }, [ticks, min, max]);

  // Compute tick label positions
  const tickLabels = React.useMemo(() => {
    if (!ticks?.showLabels) return [];
    return tickMarks;
  }, [ticks?.showLabels, tickMarks]);

  // Determine range highlight styling
  const rangeStyle = React.useMemo<React.CSSProperties>(() => {
    if (isRangeMin) {
      // Fill from min to current value
      const pct = ((currentValue - min) / (max - min)) * 100;
      return {
        background: `linear-gradient(to right, var(--navy-600) ${pct}%, var(--navy-100) ${pct}%)`,
      };
    }
    if (isRangeMax) {
      // Fill from current value to max
      const pct = ((currentValue - min) / (max - min)) * 100;
      return {
        background: `linear-gradient(to right, var(--navy-100) ${pct}%, var(--navy-600) ${pct}%)`,
      };
    }
    return {};
  }, [isRangeMin, isRangeMax, currentValue, min, max]);

  return (
    <div
      className={cn(
        "ims-jui-slider",
        "relative",
        orientation === "vertical" ? "flex flex-col items-center h-full" : "flex flex-col w-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Tick marks (above/beside the track) */}
      {tickMarks.length > 0 && (
        <div
          className={cn(
            "ims-jui-slider-ticks relative w-full",
            orientation === "vertical" ? "h-full w-2" : "h-2 mb-1"
          )}
        >
          {tickMarks.map((tick) => {
            const pct = ((tick.value - min) / (max - min)) * 100;
            return (
              <span
                key={tick.value}
                className={cn(
                  "absolute bg-navy-300 dark:bg-navy-600",
                  tick.major && "bg-navy-400 dark:bg-navy-500",
                  orientation === "vertical"
                    ? "w-full h-px left-0"
                    : "h-full w-px top-0"
                )}
                style={
                  orientation === "vertical"
                    ? { bottom: `${pct}%` }
                    : { left: `${pct}%` }
                }
              />
            );
          })}
        </div>
      )}

      {/* Slider track */}
      <SliderPrimitive.Root
        ref={sliderRef}
        className={cn(
          "relative flex touch-none select-none",
          orientation === "vertical"
            ? "flex-col h-full w-1.5 items-center"
            : "w-full items-center h-1.5"
        )}
        orientation={orientation}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onValueChange={handleValueChange}
        onValueCommit={handleSlideEnd}
        disabled={disabled}
        style={animDuration > 0 ? { transition: `all ${animDuration}ms ease` } : undefined}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative grow overflow-hidden rounded-full",
            orientation === "vertical" ? "w-1.5 h-full" : "h-1.5 w-full",
            isRangeMin || isRangeMax ? "" : "bg-navy-100 dark:bg-navy-800"
          )}
          style={isRangeMin || isRangeMax ? rangeStyle : undefined}
        >
          {!(isRangeMin || isRangeMax) && (
            <SliderPrimitive.Range
              className={cn(
                "absolute rounded-full",
                orientation === "vertical" ? "w-full" : "h-full",
                "bg-navy-600"
              )}
            />
          )}
        </SliderPrimitive.Track>

        {sliderValue.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              "block size-5 shrink-0 rounded-full border-2 shadow-md",
              "transition-[box-shadow,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              "hover:scale-110 hover:shadow-lg",
              "bg-white border-navy-700 dark:bg-navy-100 dark:border-navy-500",
              disabled && "cursor-not-allowed hover:scale-100"
            )}
            onPointerDown={() => handleSlideStart(sliderValue)}
            aria-label={
              isRange
                ? index === 0
                  ? "Minimum value"
                  : "Maximum value"
                : "Slider value"
            }
          />
        ))}
      </SliderPrimitive.Root>

      {/* Tick labels */}
      {tickLabels.length > 0 && (
        <div
          className={cn(
            "ims-jui-slider-labels relative w-full",
            orientation === "vertical"
              ? "h-full ml-2 flex flex-col justify-between"
              : "h-5 mt-1"
          )}
        >
          {tickLabels.map((tick) => {
            const pct = ((tick.value - min) / (max - min)) * 100;
            return (
              <ImsJuiSliderLabel
                key={tick.value}
                value={tick.value}
                major={tick.major}
                className={
                  orientation === "vertical"
                    ? "relative left-auto translate-y-1/2 text-right w-8"
                    : undefined
                }
                style={
                  orientation === "vertical"
                    ? { bottom: `${pct}%`, position: "absolute", left: "100%" }
                    : { left: `${pct}%` }
                }
              />
            );
          })}
        </div>
      )}

      {/* Custom children (e.g., additional labels) */}
      {children}
    </div>
  );
}
