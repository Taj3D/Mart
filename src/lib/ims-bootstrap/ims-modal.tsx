/**
 * IMS Modal Utilities Component
 * Replaces Bootstrap 3.0.0 modal.js
 * Extended utilities for shadcn/ui Dialog to match Bootstrap modal features:
 * - Backdrop (static/clickable/none)
 * - Body scroll lock
 * - Focus trap
 * - Keyboard escape handling
 * - Size variants (sm, default, lg, xl, full)
 * - Deep Navy Blue theme
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
} from "./hooks";
import type { ImsModalProps } from "./types";

// ============================================================================
// ImsModalOverlay (Backdrop)
// ============================================================================

export interface ImsModalOverlayProps extends React.ComponentProps<"div"> {
  /** Whether the backdrop is visible */
  visible?: boolean;
  /** Fade animation */
  fade?: boolean;
  /** Click handler (for closing on backdrop click) */
  onClick?: (e: React.MouseEvent) => void;
  /** Static backdrop (no close on click) */
  static?: boolean;
}

export function ImsModalOverlay({
  visible = true,
  fade = true,
  onClick,
  static: isStatic = false,
  className,
  ...props
}: ImsModalOverlayProps) {
  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isStatic) {
        // Static backdrop: shake the modal instead of closing
        return;
      }
      onClick?.(e);
    },
    [isStatic, onClick]
  );

  return (
    <div
      className={cn(
        "ims-modal-backdrop",
        fade && "fade",
        visible ? "in" : "",
        className
      )}
      onClick={handleClick}
      aria-hidden="true"
      {...props}
    />
  );
}

// ============================================================================
// ImsModal - Full Bootstrap-compatible modal
// ============================================================================

export function ImsModal({
  open: controlledOpen,
  onOpenChange,
  backdrop = true,
  keyboard = true,
  focusTrap = true,
  lockBodyScroll = true,
  fade = true,
  size = "default",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ImsModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const modalRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const open = React.useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  }, [isControlled, onOpenChange]);

  // Body scroll lock
  useBodyScrollLock(lockBodyScroll && isOpen);

  // Escape key
  useEscapeKey({ enabled: keyboard && isOpen, onEscape: close });

  // Focus trap
  useFocusTrap({ ref: dialogRef, enabled: focusTrap && isOpen });

  // Backdrop click
  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (backdrop === true && e.target === e.currentTarget) {
        close();
      }
    },
    [backdrop, close]
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  return (
    <div
      className={cn("ims-modal", fade && "fade", isOpen && "in")}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {/* Backdrop */}
      {backdrop !== false && (
        <ImsModalOverlay
          visible={isOpen}
          fade={fade}
          static={backdrop === "static"}
          onClick={handleBackdropClick}
        />
      )}

      {/* Dialog */}
      <div
        className={cn(
          "ims-modal-dialog",
          sizeClasses[size],
          size === "sm" && "modal-sm",
          size === "lg" && "modal-lg",
          className
        )}
        ref={dialogRef}
        onClick={handleBackdropClick}
      >
        <div className="ims-modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ImsModalHeader
// ============================================================================

export interface ImsModalHeaderProps extends React.ComponentProps<"div"> {
  /** Close button visible */
  closeable?: boolean;
  /** Called when close button is clicked */
  onClose?: () => void;
  /** Variant style */
  variant?: "default" | "navy";
}

export function ImsModalHeader({
  closeable = true,
  onClose,
  variant = "navy",
  className,
  children,
  ...props
}: ImsModalHeaderProps) {
  return (
    <div
      className={cn(
        "ims-modal-header",
        variant === "navy" && "ims-modal-header-navy",
        className
      )}
      {...props}
    >
      {children}
      {closeable && (
        <button
          type="button"
          className="ims-modal-close close"
          onClick={onClose}
          aria-label="Close"
          data-dismiss="modal"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ImsModalBody
// ============================================================================

export function ImsModalBody({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("ims-modal-body", className)} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// ImsModalFooter
// ============================================================================

export function ImsModalFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ims-modal-footer", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsModalTitle
// ============================================================================

export function ImsModalTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn("ims-modal-title modal-title", className)}
      {...props}
    >
      {children}
    </h4>
  );
}
