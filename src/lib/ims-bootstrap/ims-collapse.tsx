/**
 * IMS Collapse Component
 * Replaces Bootstrap 3.0.0 collapse.js
 * Features:
 * - Animated expand/collapse with height/width dimension
 * - Accordion mode (parent group: only one open at a time)
 * - Bootstrap event callbacks
 * - Deep Navy Blue theme
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ImsCollapseProps } from "./types";

// ============================================================================
// ImsCollapse
// ============================================================================

export function ImsCollapse({
  open: controlledOpen,
  defaultOpen = false,
  onOpen,
  onClose,
  duration = 350,
  dimension = "height",
  parent,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ImsCollapseProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [animating, setAnimating] = React.useState(false);
  const [animDirection, setAnimDirection] = React.useState<"show" | "hide" | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = React.useCallback(() => {
    if (animating) return;

    const newOpen = !isOpen;

    if (!isControlled) {
      setInternalOpen(newOpen);
    }

    // Handle accordion parent
    if (newOpen && parent && typeof document !== "undefined") {
      const parentEl = document.querySelector(parent);
      if (parentEl) {
        parentEl.querySelectorAll<HTMLElement>("[data-collapse-group]").forEach((el) => {
          if (el !== contentRef.current) {
            el.style[dimension] = "0px";
            el.classList.remove("in");
          }
        });
      }
    }

    setAnimating(true);
    setAnimDirection(newOpen ? "show" : "hide");

    if (newOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }

    setTimeout(() => {
      setAnimating(false);
      setAnimDirection(null);
    }, duration);
  }, [isOpen, isControlled, animating, parent, dimension, duration, onOpen, onClose]);

  // Expose toggle via data attribute
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    (el as HTMLElement & { imsCollapseToggle?: () => void }).imsCollapseToggle = toggle;
  }, [toggle]);

  const dimensionProp = dimension === "width" ? "width" : "height";

  const getStyle = (): React.CSSProperties => {
    if (animDirection === "show") {
      return {
        [dimensionProp]: "auto",
        overflow: "hidden",
        transition: `${dimensionProp} ${duration}ms ease-in-out`,
      };
    }

    if (animDirection === "hide") {
      return {
        [dimensionProp]: 0,
        overflow: "hidden",
        transition: `${dimensionProp} ${duration}ms ease-in-out`,
      };
    }

    if (isOpen) {
      return {};
    }

    return { [dimensionProp]: 0, overflow: "hidden" };
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        "ims-collapse",
        isOpen && !animating && "in",
        animating && "collapsing",
        !isOpen && !animating && "collapse",
        className
      )}
      style={getStyle()}
      data-collapse-group={parent || undefined}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsCollapseTrigger
// ============================================================================

export interface ImsCollapseTriggerProps extends React.ComponentProps<"button"> {
  /** Target collapse ID selector (e.g., "#myCollapse") */
  target?: string;
  /** Or pass toggle function directly */
  onToggle?: () => void;
}

export function ImsCollapseTrigger({
  target,
  onToggle,
  className,
  children,
  ...props
}: ImsCollapseTriggerProps) {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (onToggle) {
        onToggle();
        return;
      }

      if (target && typeof document !== "undefined") {
        const el = document.querySelector(target);
        if (el) {
          const toggleFn = (el as HTMLElement & { imsCollapseToggle?: () => void }).imsCollapseToggle;
          if (toggleFn) {
            toggleFn();
          }
        }
      }
    },
    [onToggle, target]
  );

  return (
    <button
      className={cn("ims-collapse-trigger", className)}
      onClick={handleClick}
      data-toggle="collapse"
      data-target={target || undefined}
      aria-expanded={false}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// ImsAccordion (Bootstrap panel-group with collapse behavior)
// ============================================================================

export interface ImsAccordionProps extends React.ComponentProps<"div"> {
  /** Accordion group ID for parent relationship */
  groupId?: string;
}

export function ImsAccordion({
  groupId = "ims-accordion",
  className,
  children,
  ...props
}: ImsAccordionProps) {
  return (
    <div
      className={cn("ims-accordion", "panel-group", className)}
      id={groupId}
      role="tablist"
      aria-multiselectable="false"
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsAccordionPanel
// ============================================================================

export interface ImsAccordionPanelProps extends React.ComponentProps<"div"> {
  /** Panel header text */
  header: React.ReactNode;
  /** Whether this panel is open by default */
  defaultOpen?: boolean;
  /** Panel variant */
  variant?: "default" | "primary" | "success" | "info" | "warning" | "danger";
  /** Unique ID for this panel */
  panelId?: string;
}

export function ImsAccordionPanel({
  header,
  defaultOpen = false,
  variant = "default",
  panelId,
  className,
  children,
  ...props
}: ImsAccordionPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const generatedId = React.useId();
  const id = panelId || `panel-${generatedId}`;

  return (
    <div
      className={cn(
        "ims-accordion-panel",
        "panel",
        variant !== "default" && `panel-${variant}`,
        className
      )}
      {...props}
    >
      <div
        className="ims-accordion-panel-heading panel-heading"
        role="tab"
        id={`${id}-heading`}
      >
        <h4 className="panel-title">
          <button
            className="ims-accordion-panel-toggle w-full text-left"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={`${id}-collapse`}
            data-toggle="collapse"
            data-parent={`#${id}-accordion`}
          >
            {header}
            <span className={cn(
              "float-right transition-transform duration-200",
              isOpen && "rotate-180"
            )}>
              ▼
            </span>
          </button>
        </h4>
      </div>
      <div
        id={`${id}-collapse`}
        className={cn(
          "ims-accordion-panel-body panel-collapse",
          isOpen ? "in" : "collapse"
        )}
        role="tabpanel"
        aria-labelledby={`${id}-heading`}
      >
        <div className="panel-body">
          {children}
        </div>
      </div>
    </div>
  );
}
