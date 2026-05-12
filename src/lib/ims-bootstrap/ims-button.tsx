/**
 * IMS Loading Button Component
 * Replaces Bootstrap 3.0.0 button.js
 * Features:
 * - Loading state with spinner and text change
 * - Toggle state (checkbox/radio button style)
 * - Bootstrap setState API compatibility
 * - Deep Navy Blue theme
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImsLoadingButtonProps, ButtonState } from "./types";

// ============================================================================
// ImsLoadingButton
// ============================================================================

export interface ImsLoadingButtonPropsExtended
  extends React.ComponentProps<typeof Button>,
    ImsLoadingButtonProps {
  /** Text to show during loading (replaces Bootstrap's data-loading-text) */
  loadingText?: string;
  /** Success state text (replaces Bootstrap's data-success-text) */
  successText?: string;
  /** Error state text */
  errorText?: string;
  /** Spinner position */
  spinnerPosition?: "left" | "right";
  /** Custom spinner component */
  spinner?: React.ReactNode;
}

export function ImsLoadingButton({
  loading = false,
  loadingText = "Loading...",
  successText,
  errorText,
  toggled = false,
  onToggle,
  spinnerPosition = "left",
  spinner,
  disabled,
  children,
  className,
  onClick,
  ...props
}: ImsLoadingButtonPropsExtended) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [state, setState] = React.useState<ButtonState>("reset");
  const isToggled = toggled;

  // Support both controlled and internal loading
  const isLoading = loading || internalLoading;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onToggle) {
        onToggle(!isToggled);
      }
      onClick?.(e);
    },
    [onClick, onToggle, isToggled]
  );

  // Bootstrap-compatible setState API
  const setButtonState = React.useCallback(
    (newState: ButtonState) => {
      setState(newState);
      if (newState === "loading") {
        setInternalLoading(true);
      } else {
        setInternalLoading(false);
      }
    },
    []
  );

  const getDisplayText = () => {
    if (isLoading) return loadingText;
    if (state === "success" && successText) return successText;
    if (state === "error" && errorText) return errorText;
    return children;
  };

  const defaultSpinner = <Loader2 className="size-4 animate-spin" />;
  const spinnerElement = spinner ?? defaultSpinner;

  return (
    <Button
      className={cn(
        "ims-loading-button",
        isToggled && "active",
        isLoading && "ims-btn-loading",
        state === "success" && "ims-btn-success",
        state === "error" && "ims-btn-error",
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      data-loading={isLoading || undefined}
      data-state={state !== "reset" ? state : undefined}
      data-toggle={isToggled ? "buttons" : undefined}
      {...props}
    >
      {isLoading && spinnerPosition === "left" && spinnerElement}
      {getDisplayText()}
      {isLoading && spinnerPosition === "right" && spinnerElement}
    </Button>
  );
}

// ============================================================================
// ImsToggleButton
// ============================================================================

export interface ImsToggleButtonProps extends React.ComponentProps<typeof Button> {
  /** Whether the button is pressed/active */
  pressed?: boolean;
  /** Called when pressed state changes */
  onPressedChange?: (pressed: boolean) => void;
  /** Button group type */
  type?: "checkbox" | "radio";
}

export function ImsToggleButton({
  pressed = false,
  onPressedChange,
  type = "checkbox",
  className,
  onClick,
  children,
  ...props
}: ImsToggleButtonProps) {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Radio buttons can't be un-toggled
      if (type === "radio" && pressed) return;
      onPressedChange?.(!pressed);
      onClick?.(e);
    },
    [pressed, onPressedChange, type, onClick]
  );

  return (
    <Button
      className={cn(
        "ims-toggle-button",
        pressed && "active",
        className
      )}
      onClick={handleClick}
      role={type}
      aria-checked={pressed}
      data-toggle="button"
      variant={pressed ? "default" : "outline"}
      {...props}
    >
      {children}
    </Button>
  );
}

// ============================================================================
// ImsButtonToolbar
// ============================================================================

export interface ImsButtonToolbarProps extends React.ComponentProps<"div"> {
  /** ARIA label for the toolbar */
  label?: string;
}

export function ImsButtonToolbar({
  label = "Toolbar",
  className,
  children,
  ...props
}: ImsButtonToolbarProps) {
  return (
    <div
      className={cn("ims-button-toolbar", "flex flex-wrap gap-2", className)}
      role="toolbar"
      aria-label={label}
      {...props}
    >
      {children}
    </div>
  );
}
