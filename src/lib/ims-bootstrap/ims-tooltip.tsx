/**
 * IMS Tooltip / Popover Positioning Utilities
 * Replaces Bootstrap 3.0.0 tooltip.js & popover.js positioning logic
 * Note: shadcn/ui Tooltip & Popover handle the actual rendering.
 * This module provides Bootstrap-compatible positioning calculations
 * and auto-placement logic for custom implementations.
 */

"use client";

import * as React from "react";
import type { TooltipPlacement } from "./types";

// ============================================================================
// Position Types
// ============================================================================

export interface Position {
  top: number;
  left: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
}

export interface ViewportConstraints {
  parentWidth: number;
  parentHeight: number;
  parentLeft: number;
  docScroll: number;
}

// ============================================================================
// getPosition - Get element position (replaces Bootstrap's getPosition)
// ============================================================================

export function getPosition(element: HTMLElement): Position & ElementDimensions {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

// ============================================================================
// getCalculatedOffset - Calculate tooltip/popover offset (replaces Bootstrap)
// ============================================================================

export function getCalculatedOffset(
  placement: TooltipPlacement,
  pos: Position & ElementDimensions,
  actualWidth: number,
  actualHeight: number
): Position {
  switch (placement) {
    case "bottom":
      return {
        top: pos.top + pos.height,
        left: pos.left + pos.width / 2 - actualWidth / 2,
      };
    case "top":
      return {
        top: pos.top - actualHeight,
        left: pos.left + pos.width / 2 - actualWidth / 2,
      };
    case "left":
      return {
        top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left - actualWidth,
      };
    case "right":
      return {
        top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left + pos.width,
      };
    default:
      return { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 };
  }
}

// ============================================================================
// getViewportConstraints - Get viewport/container constraints
// ============================================================================

export function getViewportConstraints(
  element: HTMLElement,
  container: string | boolean = "body"
): ViewportConstraints {
  const $parent = container === "body"
    ? null
    : document.querySelector(container as string);

  const docScroll = document.documentElement.scrollTop || document.body.scrollTop;

  return {
    parentWidth: $parent ? ($parent as HTMLElement).offsetWidth : window.innerWidth,
    parentHeight: $parent ? ($parent as HTMLElement).offsetHeight : window.innerHeight,
    parentLeft: $parent ? ($parent as HTMLElement).getBoundingClientRect().left : 0,
    docScroll,
  };
}

// ============================================================================
// autoPlacement - Determine best placement (replaces Bootstrap's auto placement)
// ============================================================================

export function autoPlacement(
  placement: TooltipPlacement,
  pos: Position & ElementDimensions,
  actualWidth: number,
  actualHeight: number,
  constraints: ViewportConstraints
): TooltipPlacement {
  if (placement !== "auto" && !/\s?auto?\s?/i.test(placement)) {
    return placement;
  }

  // Normalize: strip "auto" and use as fallback
  const basePlacement = placement.replace(/\s?auto?\s?/i, "") || "top";

  const { parentWidth, parentHeight, parentLeft, docScroll } = constraints;

  switch (basePlacement) {
    case "bottom":
      if (pos.top + pos.height + actualHeight - docScroll > parentHeight) {
        return "top";
      }
      return "bottom";
    case "top":
      if (pos.top - docScroll - actualHeight < 0) {
        return "bottom";
      }
      return "top";
    case "right":
      if (pos.left + pos.width + actualWidth > parentWidth) {
        return "left";
      }
      return "right";
    case "left":
      if (pos.left - actualWidth < parentLeft) {
        return "right";
      }
      return "left";
    default:
      return "top";
  }
}

// ============================================================================
// applyPlacement - Apply offset with margin correction (replaces Bootstrap's applyPlacement)
// ============================================================================

export function applyPlacement(
  offset: Position,
  placement: TooltipPlacement,
  tipElement: HTMLElement
): void {
  const marginTop = parseInt(getComputedStyle(tipElement).marginTop, 10) || 0;
  const marginLeft = parseInt(getComputedStyle(tipElement).marginLeft, 10) || 0;

  offset.top += marginTop;
  offset.left += marginLeft;

  tipElement.style.top = `${offset.top}px`;
  tipElement.style.left = `${offset.left}px`;
  tipElement.classList.add("in");
}

// ============================================================================
// replaceArrow - Position tooltip/popover arrow (replaces Bootstrap's replaceArrow)
// ============================================================================

export function replaceArrow(
  delta: number,
  dimension: number,
  position: "left" | "top",
  arrowElement: HTMLElement
): void {
  const value = delta ? `${50 * (1 - delta / dimension)}%` : "";
  arrowElement.style[position] = value;
}

// ============================================================================
// useTooltipPosition - Hook for tooltip positioning
// ============================================================================

export interface UseTooltipPositionOptions {
  /** Target element ref */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Tooltip element ref */
  tooltipRef: React.RefObject<HTMLElement | null>;
  /** Placement */
  placement?: TooltipPlacement;
  /** Container selector */
  container?: string | boolean;
  /** Auto-update on scroll/resize */
  autoUpdate?: boolean;
}

export function useTooltipPosition(options: UseTooltipPositionOptions) {
  const { targetRef, tooltipRef, placement = "top", container = "body", autoUpdate = true } = options;
  const [calculatedPlacement, setCalculatedPlacement] = React.useState<TooltipPlacement>(placement);
  const [offset, setOffset] = React.useState<Position>({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    const pos = getPosition(targetRef.current);
    const actualWidth = tooltipRef.current.offsetWidth;
    const actualHeight = tooltipRef.current.offsetHeight;
    const constraints = getViewportConstraints(targetRef.current, container);

    const finalPlacement = autoPlacement(placement, pos, actualWidth, actualHeight, constraints);
    const calculatedOffset = getCalculatedOffset(finalPlacement, pos, actualWidth, actualHeight);

    setCalculatedPlacement(finalPlacement);
    setOffset(calculatedOffset);
  }, [targetRef, tooltipRef, placement, container]);

  React.useEffect(() => {
    updatePosition();

    if (autoUpdate) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [updatePosition, autoUpdate]);

  return { placement: calculatedPlacement, offset, updatePosition };
}
