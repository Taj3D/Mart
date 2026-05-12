/**
 * IMS Dismissable Alert Component
 * Replaces Bootstrap 3.0.0 alert.js
 * Features:
 * - Dismiss with animation (fade out)
 * - Auto-dismiss timer
 * - Bootstrap-style close button
 * - Deep Navy Blue themed variants
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ImsAlertProps } from "./types";

// ============================================================================
// ImsDismissAlert
// ============================================================================

export function ImsDismissAlert({
  variant = "default",
  dismissible = true,
  autoDismiss = 0,
  onDismiss,
  animate = true,
  fade = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ImsAlertProps) {
  const [visible, setVisible] = React.useState(true);
  const [dismissing, setDismissing] = React.useState(false);

  const handleDismiss = React.useCallback(() => {
    if (dismissing) return;

    if (animate) {
      setDismissing(true);
      setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 150);
    } else {
      setVisible(false);
      onDismiss?.();
    }
  }, [animate, dismissing, onDismiss]);

  // Auto-dismiss
  React.useEffect(() => {
    if (autoDismiss > 0 && visible) {
      const timer = setTimeout(handleDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, handleDismiss, visible]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={cn(
        "ims-alert",
        `ims-alert-${variant}`,
        fade && "fade",
        dismissing ? "out" : visible ? "in" : "",
        dismissible && "ims-alert-dismissible",
        className
      )}
      {...props}
    >
      {children}
      {dismissible && (
        <button
          type="button"
          className="ims-alert-close"
          onClick={handleDismiss}
          aria-label="Close"
          data-dismiss="alert"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ImsAlertLink
// ============================================================================

export function ImsAlertLink({
  className,
  href = "#",
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      href={href}
      className={cn("ims-alert-link", className)}
      {...props}
    />
  );
}

// ============================================================================
// ImsAlertHeading
// ============================================================================

export function ImsAlertHeading({
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn("ims-alert-heading", className)}
      {...props}
    />
  );
}
