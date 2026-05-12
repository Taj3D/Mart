/**
 * IMS jQuery UI Position Utilities
 * Replaces jQuery UI 1.12.1 position.js
 *
 * Provides positioning calculations for:
 * - Tooltip/Popover placement
 * - Dialog positioning
 * - Menu/Dropdown alignment
 * - Autocomplete dropdown positioning
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

import type { PositionAlignment, PositionResult, PositionHorizontal, PositionVertical } from "./types";

// ============================================================================
// Position Parser
// ============================================================================

interface ParsedPosition {
  vertical: PositionVertical;
  horizontal: PositionHorizontal;
  verticalOffset: number;
  horizontalOffset: number;
}

/**
 * Parse a jQuery UI position string like "center top+10" or "right bottom-5"
 * Supports offsets with +/- syntax: "top+10", "left-20"
 */
export function parsePositionString(pos: string): ParsedPosition {
  const parts = pos.trim().split(/\s+/);
  const result: ParsedPosition = {
    vertical: "center",
    horizontal: "center",
    verticalOffset: 0,
    horizontalOffset: 0,
  };

  for (const part of parts) {
    const match = part.match(/^(top|bottom|center|left|right)([+-]\d+)?$/);
    if (match) {
      const dir = match[1];
      const offset = match[2] ? parseInt(match[2], 10) : 0;

      if (dir === "top" || dir === "bottom" || dir === "center") {
        result.vertical = dir as PositionVertical;
        result.verticalOffset = offset;
      } else {
        result.horizontal = dir as PositionHorizontal;
        result.horizontalOffset = offset;
      }
    }
  }

  return result;
}

// ============================================================================
// Collision Resolution
// ============================================================================

/**
 * Flip collision: mirror the position when element overflows viewport
 */
function resolveFlip(
  pos: number,
  size: number,
  viewportStart: number,
  viewportSize: number,
  targetStart: number,
  targetSize: number,
  alignment: "start" | "center" | "end"
): number {
  const viewportEnd = viewportStart + viewportSize;
  const elementEnd = pos + size;

  if (elementEnd > viewportEnd) {
    // Overflows bottom/right - try flipping
    if (alignment === "start") {
      const flipped = targetStart - size;
      if (flipped >= viewportStart) return flipped;
    } else if (alignment === "end") {
      const flipped = targetStart + targetSize;
      if (flipped + size <= viewportEnd) return flipped;
    }
  }

  if (pos < viewportStart) {
    // Overflows top/left - try flipping
    if (alignment === "end") {
      const flipped = targetStart + targetSize;
      if (flipped + size <= viewportEnd) return flipped;
    } else if (alignment === "start") {
      const flipped = targetStart + targetSize - size;
      if (flipped >= viewportStart) return flipped;
    }
  }

  return pos;
}

/**
 * Fit collision: clamp the position to stay within viewport
 */
function resolveFit(
  pos: number,
  size: number,
  viewportStart: number,
  viewportSize: number
): number {
  const viewportEnd = viewportStart + viewportSize;
  if (pos < viewportStart) return viewportStart;
  if (pos + size > viewportEnd) return Math.max(viewportStart, viewportEnd - size);
  return pos;
}

// ============================================================================
// Position Calculator
// ============================================================================

export interface CalculatePositionOptions {
  /** The trigger/anchor element's bounding rect */
  triggerRect: DOMRect;
  /** The content element's bounding rect */
  contentRect: DOMRect;
  /** Position alignment config */
  alignment: PositionAlignment;
  /** Viewport rect (defaults to window) */
  viewport?: { width: number; height: number; scrollX: number; scrollY: number };
}

/**
 * Calculate the position of an element relative to a trigger.
 * Direct replacement for jQuery UI's $.position() utility.
 *
 * @example
 * ```ts
 * const result = calculatePosition({
 *   triggerRect: trigger.getBoundingClientRect(),
 *   contentRect: content.getBoundingClientRect(),
 *   alignment: {
 *     at: "left bottom",
 *     my: "left top",
 *     collision: "flipfit",
 *     offset: "5 0",
 *   },
 * });
 * ```
 */
export function calculatePosition(options: CalculatePositionOptions): PositionResult {
  const {
    triggerRect,
    contentRect,
    alignment,
    viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    },
  } = options;

  const { at = "left bottom", my = "left top", collision = "flipfit", offset } = alignment;

  const atParsed = parsePositionString(at);
  const myParsed = parsePositionString(my);

  // Calculate anchor point on trigger (at)
  let anchorX = triggerRect.left;
  let anchorY = triggerRect.top;

  switch (atParsed.horizontal) {
    case "center": anchorX += triggerRect.width / 2; break;
    case "right": anchorX += triggerRect.width; break;
  }

  switch (atParsed.vertical) {
    case "center": anchorY += triggerRect.height / 2; break;
    case "bottom": anchorY += triggerRect.height; break;
  }

  // Apply offset to anchor
  anchorX += atParsed.horizontalOffset;
  anchorY += atParsed.verticalOffset;

  // Calculate position of content (my)
  let left = anchorX;
  let top = anchorY;

  switch (myParsed.horizontal) {
    case "center": left -= contentRect.width / 2; break;
    case "right": left -= contentRect.width; break;
  }

  switch (myParsed.vertical) {
    case "center": top -= contentRect.height / 2; break;
    case "bottom": top -= contentRect.height; break;
  }

  // Apply global offset
  if (offset) {
    const offsetParts = offset.trim().split(/\s+/);
    const offsetY = parseInt(offsetParts[0], 10) || 0;
    const offsetX = offsetParts.length > 1 ? parseInt(offsetParts[1], 10) : 0;
    top += offsetY;
    left += offsetX;
  }

  // Add scroll offset
  left += viewport.scrollX;
  top += viewport.scrollY;

  let flipped = false;

  // Collision resolution
  if (collision !== "none") {
    const vStart = viewport.scrollY;
    const hStart = viewport.scrollX;
    const originalTop = top;
    const originalLeft = left;

    if (collision === "flip" || collision === "flipfit") {
      const vAlignment = myParsed.vertical === "top" ? "start" as const : myParsed.vertical === "bottom" ? "end" as const : "center" as const;
      const hAlignment = myParsed.horizontal === "left" ? "start" as const : myParsed.horizontal === "right" ? "end" as const : "center" as const;

      top = resolveFlip(
        top - viewport.scrollY,
        contentRect.height,
        0,
        viewport.height,
        triggerRect.top,
        triggerRect.height,
        vAlignment
      ) + viewport.scrollY;

      left = resolveFlip(
        left - viewport.scrollX,
        contentRect.width,
        0,
        viewport.width,
        triggerRect.left,
        triggerRect.width,
        hAlignment
      ) + viewport.scrollX;

      flipped = top !== originalTop || left !== originalLeft;
    }

    if (collision === "fit" || collision === "flipfit") {
      top = resolveFit(top - viewport.scrollY, contentRect.height, 0, viewport.height) + viewport.scrollY;
      left = resolveFit(left - viewport.scrollX, contentRect.width, 0, viewport.width) + viewport.scrollX;
    }
  }

  // Determine placement string
  const placement = determinePlacement(top, left, triggerRect, contentRect, viewport);

  return { top, left, placement, flipped };
}

/**
 * Determine the CSS placement string based on position
 */
function determinePlacement(
  top: number,
  left: number,
  triggerRect: DOMRect,
  _contentRect: DOMRect,
  _viewport: CalculatePositionOptions["viewport"]
): string {
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;

  // Relative to trigger center
  const dx = left - triggerCenterX;
  const dy = top - triggerCenterY;

  if (Math.abs(dy) > Math.abs(dx)) {
    return dy < 0 ? "top" : "bottom";
  }
  return dx < 0 ? "left" : "right";
}

// ============================================================================
// Position Presets (common jQuery UI position configs)
// ============================================================================

export const PositionPresets = {
  /** Tooltip below, aligned left */
  tooltipBottom: { at: "left bottom+5", my: "left top", collision: "flipfit" as const },
  /** Tooltip above, aligned left */
  tooltipTop: { at: "left top-5", my: "left bottom", collision: "flipfit" as const },
  /** Menu below trigger */
  menuBelow: { at: "left bottom", my: "left top", collision: "flipfit" as const },
  /** Menu above trigger */
  menuAbove: { at: "left top", my: "left bottom", collision: "flipfit" as const },
  /** Autocomplete dropdown */
  autocompleteDropdown: { at: "left bottom", my: "left top", collision: "flipfit" as const },
  /** Dialog centered */
  dialogCenter: { at: "center center", my: "center center", collision: "fit" as const },
  /** Popover right */
  popoverRight: { at: "right+10 center", my: "left center", collision: "flipfit" as const },
  /** Popover left */
  popoverLeft: { at: "left-10 center", my: "right center", collision: "flipfit" as const },
} as const;

// ============================================================================
// Arrow Position Calculator
// ============================================================================

export interface ArrowPosition {
  placement: string;
  x: number;
  y: number;
  side: "top" | "bottom" | "left" | "right";
}

/**
 * Calculate arrow position for a tooltip/popover relative to its trigger.
 * Used with shadcn/ui Tooltip/Popover arrow rendering.
 */
export function calculateArrowPosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  placement: string
): ArrowPosition {
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;

  let x = 0;
  let y = 0;
  let side: ArrowPosition["side"] = "bottom";

  switch (placement) {
    case "top":
      x = triggerCenterX - contentRect.left;
      y = contentRect.height;
      side = "bottom";
      break;
    case "bottom":
      x = triggerCenterX - contentRect.left;
      y = 0;
      side = "top";
      break;
    case "left":
      x = contentRect.width;
      y = triggerCenterY - contentRect.top;
      side = "right";
      break;
    case "right":
      x = 0;
      y = triggerCenterY - contentRect.top;
      side = "left";
      break;
  }

  // Clamp arrow position to content bounds
  const padding = 8;
  if (side === "top" || side === "bottom") {
    x = Math.max(padding, Math.min(x, contentRect.width - padding));
  } else {
    y = Math.max(padding, Math.min(y, contentRect.height - padding));
  }

  return { placement, x, y, side };
}
