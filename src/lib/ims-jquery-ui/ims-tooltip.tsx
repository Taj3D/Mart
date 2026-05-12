/**
 * IMS jQuery UI Tooltip Component
 * Replaces jQuery UI 1.12.1 tooltip.js
 *
 * Features:
 * - Four placement directions (top, bottom, left, right)
 * - Auto-placement with collision detection
 * - Mouse tracking mode
 * - Show/hide delay
 * - HTML content support
 * - Custom tooltip class
 * - Animation
 * - Deep Navy Blue themed tooltip background
 * - Events: onOpen, onClose
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import type { TooltipOptions } from "./types";

// ============================================================================
// Placement type mapping
// ============================================================================

type TooltipSide = "top" | "bottom" | "left" | "right";

// ============================================================================
// ImsJuiTooltip
// ============================================================================

export interface ImsJuiTooltipProps
  extends Omit<React.ComponentProps<"div">, "content">,
    TooltipOptions {
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip content (string or React node for HTML content) */
  content: React.ReactNode;
  /** Placement direction */
  side?: TooltipSide;
  /** Show delay in ms (default 0) */
  showDelay?: number;
  /** Hide delay in ms (default 0) */
  hideDelay?: number;
  /** Whether mouse tracking is enabled */
  trackMouse?: boolean;
  /** Custom CSS class for the tooltip */
  tooltipClassName?: string;
  /** Whether the tooltip is open (controlled) */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Offset from trigger (default 6) */
  sideOffset?: number;
}

export function ImsJuiTooltip({
  disabled = false,
  content,
  side = "top",
  showDelay = 0,
  hideDelay = 0,
  trackMouse = false,
  tooltipClass,
  tooltipClassName,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  onOpen,
  onClose,
  sideOffset = 6,
  className,
  children,
  ...props
}: ImsJuiTooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Mouse tracking state
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (disabled) return;
      if (!isControlled) setInternalOpen(open);
      onOpenChange?.(open);

      if (open) {
        onOpen?.({} as React.Event, {
          tooltip: tooltipRef.current ?? document.createElement("div"),
        });
      } else {
        onClose?.({} as React.Event, {
          tooltip: tooltipRef.current ?? document.createElement("div"),
        });
      }
    },
    [disabled, isControlled, onOpenChange, onOpen, onClose]
  );

  // Mouse tracking handler
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (trackMouse && isOpen) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    },
    [trackMouse, isOpen]
  );

  // Compute delay duration for Radix (use the show delay)
  const delayDuration = showDelay;

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        disableHoverableContent={hideDelay > 0}
      >
        <TooltipPrimitive.Trigger
          asChild
          onMouseMove={handleMouseMove}
        >
          <div
            className={cn(
              "ims-jui-tooltip-trigger",
              "inline-flex",
              disabled && "pointer-events-none opacity-50",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            ref={tooltipRef}
            side={side}
            sideOffset={sideOffset}
            collisionPadding={8}
            avoidCollisions={true}
            className={cn(
              "ims-jui-tooltip",
              "z-50 rounded-md px-3 py-2 text-xs text-balance shadow-lg",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2",
              "data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2",
              "data-[side=top]:slide-in-from-bottom-2",
              "max-w-xs",
              tooltipClass,
              tooltipClassName
            )}
            style={{
              background: "var(--navy-800)",
              color: "white",
              border: "1px solid var(--navy-900)",
            }}
            // Mouse tracking offset
            {...(trackMouse && isOpen
              ? {
                  style: {
                    background: "var(--navy-800)",
                    color: "white",
                    border: "1px solid var(--navy-900)",
                    position: "fixed" as const,
                    left: mousePos.x + 12,
                    top: mousePos.y + 12,
                  },
                }
              : {})}
          >
            {typeof content === "string" ? (
              <span>{content}</span>
            ) : (
              content
            )}
            <TooltipPrimitive.Arrow
              className="size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
              style={{
                fill: "var(--navy-800)",
                background: "var(--navy-800)",
              }}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// ============================================================================
// ImsJuiPopover (Tooltip with title + content)
// ============================================================================

export interface ImsJuiPopoverProps extends Omit<ImsJuiTooltipProps, "content"> {
  /** Popover title */
  title: string;
  /** Popover body content */
  content: React.ReactNode;
  /** Placement direction */
  side?: TooltipSide;
  /** Show delay in ms */
  showDelay?: number;
  /** Hide delay in ms */
  hideDelay?: number;
  /** Whether mouse tracking is enabled */
  trackMouse?: boolean;
  /** Custom CSS class for the popover */
  tooltipClassName?: string;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Offset from trigger (default 8) */
  sideOffset?: number;
}

export function ImsJuiPopover({
  title,
  content,
  side = "top",
  showDelay = 0,
  hideDelay = 0,
  trackMouse = false,
  tooltipClassName,
  open,
  defaultOpen,
  onOpenChange,
  onOpen,
  onClose,
  sideOffset = 8,
  children,
  ...props
}: ImsJuiPopoverProps) {
  return (
    <ImsJuiTooltip
      side={side}
      showDelay={showDelay}
      hideDelay={hideDelay}
      trackMouse={trackMouse}
      tooltipClassName={tooltipClassName}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onOpen={onOpen}
      onClose={onClose}
      sideOffset={sideOffset}
      content={
        <div className="space-y-1.5">
          <div
            className="font-semibold text-sm border-b pb-1.5"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            {title}
          </div>
          <div className="text-xs opacity-90">{content}</div>
        </div>
      }
      {...props}
    >
      {children}
    </ImsJuiTooltip>
  );
}
