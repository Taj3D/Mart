/**
 * IMS jQuery UI Dialog Component
 * Replaces jQuery UI 1.12.1 dialog.js
 *
 * Features:
 * - Modal/non-modal modes
 * - Draggable header (using useDraggable hook from ./hooks)
 * - Resizable (using useResizable hook from ./hooks)
 * - Close on Escape
 * - Close button in header
 * - Multiple sizes: sm, default, lg, xl, full
 * - Button panel at footer
 * - Auto-open on mount
 * - Deep Navy Blue themed header
 * - Events: onOpen, onClose, onBeforeClose, onDrag, onDragStart, onDragStop,
 *           onResize, onResizeStart, onResizeStop
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { XIcon, GripHorizontal } from "lucide-react";
import { useDraggable, useResizable } from "./hooks";
import type { DialogOptions, DialogButton } from "./types";

// ============================================================================
// Dialog Size Presets
// ============================================================================

const DIALOG_SIZES: Record<string, string> = {
  sm: "max-w-sm",
  default: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

// ============================================================================
// ImsJuiDialog (Main Container)
// ============================================================================

export interface ImsJuiDialogProps
  extends Omit<React.ComponentProps<"div">, "title">,
    DialogOptions {
  /** Whether the dialog is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog size variant */
  size?: "sm" | "default" | "lg" | "xl" | "full";
  /** Children content */
  children?: React.ReactNode;
}

export function ImsJuiDialog({
  disabled = false,
  autoOpen = true,
  closeOnEscape = true,
  closeText = "Close",
  appendTo,
  dialogClass,
  draggable = true,
  height,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  modal = true,
  position,
  resizable: resizableProp = false,
  width,
  title,
  hide,
  show,
  buttons,
  onOpen,
  onClose,
  onBeforeClose,
  onCreate,
  onDrag,
  onDragStart,
  onDragStop,
  onResize,
  onResizeStart,
  onResizeStop,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  size = "default",
  className,
  children,
  ...props
}: ImsJuiDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(
    defaultOpen ?? autoOpen
  );
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  // Draggable hook
  const draggableHook = useDraggable({
    disabled: disabled || !draggable,
    handle: ".ims-jui-dialog-header",
    onStart: onDragStart
      ? (event, ui) => {
          onDragStart(event as DragEvent, {
            position: ui.position,
            offset: ui.offset,
          });
        }
      : undefined,
    onDrag: onDrag
      ? (event, ui) => {
          onDrag(event as DragEvent, {
            position: ui.position,
            offset: ui.offset,
          });
        }
      : undefined,
    onStop: onDragStop
      ? (event, ui) => {
          onDragStop(event as DragEvent, {
            position: ui.position,
            offset: ui.offset,
          });
        }
      : undefined,
  });

  // Resizable hook
  const resizableHook = useResizable({
    disabled: disabled || !resizableProp,
    minWidth: minWidth ?? 150,
    minHeight: minHeight ?? 80,
    maxHeight: maxHeight ?? Infinity,
    maxWidth: maxWidth ?? Infinity,
    handles: "e,s,se",
    onStart: onResizeStart
      ? (event, ui) => {
          onResizeStart(event as MouseEvent, {
            size: ui.size,
            position: ui.position,
          });
        }
      : undefined,
    onResize: onResize
      ? (event, ui) => {
          onResize(event as MouseEvent, {
            size: ui.size,
            position: ui.position,
          });
        }
      : undefined,
    onStop: onResizeStop
      ? (event, ui) => {
          onResizeStop(event as MouseEvent, {
            size: ui.size,
            position: ui.position,
          });
        }
      : undefined,
  });

  // Open/close handlers
  const closeDialog = React.useCallback(() => {
    // onBeforeClose can prevent closing
    if (onBeforeClose) {
      const result = onBeforeClose({} as React.Event);
      if (result === false) return;
    }

    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    onClose?.({} as React.Event);
  }, [isControlled, onBeforeClose, onOpenChange, onClose]);

  const openDialog = React.useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
    onOpen?.({} as React.Event);
  }, [isControlled, onOpenChange, onOpen]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, closeDialog]);

  // Body scroll lock for modal
  React.useEffect(() => {
    if (modal && isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modal, isOpen]);

  // Fire onOpen when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      onOpen?.({} as React.Event);
    }
  }, [isOpen, onOpen]);

  // Fire onCreate on mount
  React.useEffect(() => {
    onCreate?.({} as React.Event);
  }, []);

  // Click outside to close for non-modal
  const handleOverlayClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (modal && e.target === e.currentTarget) {
        closeDialog();
      }
    },
    [modal, closeDialog]
  );

  if (!isOpen) return null;

  // Compute inline styles for width/height
  const dialogStyle: React.CSSProperties = {
    ...draggableHook.handleProps.style,
  };

  if (width && width !== "auto") {
    dialogStyle.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height && height !== "auto") {
    dialogStyle.height = typeof height === "number" ? `${height}px` : height;
  }

  if (resizableHook.size.width > 0 && resizableHook.size.height > 0) {
    dialogStyle.width = `${resizableHook.size.width}px`;
    dialogStyle.height = `${resizableHook.size.height}px`;
  }

  return (
    <div
      className={cn(
        "ims-jui-dialog-overlay",
        "fixed inset-0 z-50 flex items-center justify-center",
        modal && "bg-black/50",
        "animate-in fade-in-0 duration-200"
      )}
      onClick={handleOverlayClick}
    >
      <div
        ref={(node) => {
          // Combine refs for draggable and resizable
          (dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          draggableHook.ref(node);
          resizableHook.ref(node);
        }}
        role="dialog"
        aria-modal={modal}
        aria-labelledby={title ? "jui-dialog-title" : undefined}
        className={cn(
          "ims-jui-dialog",
          "relative bg-white dark:bg-navy-950 rounded-lg border shadow-xl",
          "border-navy-200 dark:border-navy-700",
          "flex flex-col",
          "animate-in zoom-in-95 duration-200",
          DIALOG_SIZES[size],
          disabled && "opacity-50 pointer-events-none",
          dialogClass,
          className
        )}
        style={dialogStyle}
        onMouseDown={draggableHook.handleProps.onMouseDown}
        {...props}
      >
        {children}

        {/* Resize handle */}
        {resizableProp && !disabled && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Trigger resize from se handle
              const resizeStart = resizableHook as { ref: React.RefCallback<HTMLElement> };
              // Use native event to trigger resize behavior
              const nativeEvent = new MouseEvent("mousedown", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
              });
              e.currentTarget.dispatchEvent(nativeEvent);
            }}
          >
            <GripHorizontal className="size-3 text-navy-400 absolute bottom-0.5 right-0.5 rotate-[-45deg]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ImsJuiDialogHeader
// ============================================================================

export interface ImsJuiDialogHeaderProps extends React.ComponentProps<"div"> {
  /** Called when close button is clicked */
  onClose?: () => void;
  /** Whether to show the close button */
  closeable?: boolean;
  /** Close button text (for sr-only) */
  closeText?: string;
}

export function ImsJuiDialogHeader({
  onClose,
  closeable = true,
  closeText = "Close",
  className,
  children,
  ...props
}: ImsJuiDialogHeaderProps) {
  return (
    <div
      className={cn(
        "ims-jui-dialog-header",
        "flex items-center justify-between px-4 py-3",
        "cursor-move select-none",
        "rounded-t-lg",
        "text-white font-medium",
        className
      )}
      style={{
        background: "linear-gradient(to bottom, var(--navy-600), var(--navy-700))",
      }}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {closeable && (
        <button
          type="button"
          className={cn(
            "ml-3 shrink-0 rounded-sm p-1",
            "text-white/70 hover:text-white",
            "hover:bg-white/10 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-1 focus:ring-offset-navy-700"
          )}
          onClick={onClose}
          aria-label={closeText}
        >
          <XIcon className="size-4" />
          <span className="sr-only">{closeText}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ImsJuiDialogBody
// ============================================================================

export type ImsJuiDialogBodyProps = React.ComponentProps<"div">;

export function ImsJuiDialogBody({
  className,
  children,
  ...props
}: ImsJuiDialogBodyProps) {
  return (
    <div
      className={cn(
        "ims-jui-dialog-body",
        "flex-1 overflow-y-auto px-6 py-4",
        "text-sm text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsJuiDialogFooter
// ============================================================================

export interface ImsJuiDialogFooterProps extends React.ComponentProps<"div"> {
  /** Button definitions (jQuery UI dialog buttons format) */
  buttons?: DialogButton[];
}

export function ImsJuiDialogFooter({
  buttons,
  className,
  children,
  ...props
}: ImsJuiDialogFooterProps) {
  return (
    <div
      className={cn(
        "ims-jui-dialog-footer",
        "flex items-center justify-end gap-2 px-6 py-3",
        "border-t border-navy-200 dark:border-navy-700",
        "bg-navy-50/50 dark:bg-navy-900/30",
        "rounded-b-lg",
        className
      )}
      {...props}
    >
      {buttons?.map((btn, idx) => (
        <Button
          key={idx}
          btn={btn}
        />
      ))}
      {children}
    </div>
  );
}

// ============================================================================
// ImsJuiDialogTitle
// ============================================================================

export type ImsJuiDialogTitleProps = React.ComponentProps<"h2">;

export function ImsJuiDialogTitle({
  className,
  children,
  ...props
}: ImsJuiDialogTitleProps) {
  return (
    <h2
      id="jui-dialog-title"
      className={cn(
        "ims-jui-dialog-title",
        "text-base font-semibold text-white truncate",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

// ============================================================================
// ImsJuiDialogClose
// ============================================================================

export interface ImsJuiDialogCloseProps extends React.ComponentProps<"button"> {
  /** Called when close button is clicked */
  onClose?: () => void;
}

export function ImsJuiDialogClose({
  onClose,
  className,
  children,
  ...props
}: ImsJuiDialogCloseProps) {
  return (
    <button
      type="button"
      className={cn(
        "ims-jui-dialog-close",
        "rounded-sm p-1",
        "text-white/70 hover:text-white",
        "hover:bg-white/10 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        className
      )}
      onClick={onClose}
      aria-label="Close"
      {...props}
    >
      {children ?? (
        <>
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </>
      )}
    </button>
  );
}

// ============================================================================
// DialogButton - Internal helper for jQuery UI-style button rendering
// ============================================================================

interface ButtonProps {
  btn: DialogButton;
}

function Button({ btn }: ButtonProps) {
  const isPrimary = !btn.class || btn.class.includes("primary");
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        btn.disabled && "opacity-50 cursor-not-allowed",
        isPrimary
          ? "bg-navy-600 text-white hover:bg-navy-700 focus:ring-navy-500"
          : "border border-navy-300 dark:border-navy-600 text-navy-700 dark:text-navy-200 bg-white dark:bg-navy-900 hover:bg-navy-50 dark:hover:bg-navy-800 focus:ring-navy-500",
        btn.class
      )}
      onClick={btn.click}
      disabled={btn.disabled}
    >
      {btn.icon && <span className="size-4">{btn.icon}</span>}
      {btn.showText !== false && btn.text}
    </button>
  );
}
