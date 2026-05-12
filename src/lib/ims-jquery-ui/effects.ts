/**
 * IMS jQuery UI Effects
 * Replaces jQuery UI 1.12.1 effects core + all 15 effect animations
 *
 * Provides:
 * 1. Effect Functions - Each jQuery UI effect as a reusable function
 *    (blind, bounce, clip, drop, explode, fade, fold, highlight,
 *     puff, pulsate, scale, shake, size, slide, transfer)
 * 2. Core Utilities - animateEffect, showEffect, hideEffect, toggleClassEffect
 * 3. React Hooks - useJuiEffect, useEffectAnimation
 * 4. CSS Animation Classes - Constants for CSS class names
 *
 * Uses Web Animations API where possible, falling back to CSS classes.
 * All effect highlights use Deep Navy Blue (#1e3a5f / --navy-600)
 * instead of jQuery UI's default yellow.
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

import * as React from "react";
import type { EffectName, EffectDirection, EffectOptions, AnimationConfig } from "./types";

// ============================================================================
// Constants - Deep Navy Blue highlight color
// ============================================================================

/** Navy-600 hex value used as highlight color instead of jQuery UI yellow */
export const NAVY_HIGHLIGHT = "#1e3a5f";
/** Navy-600 with transparency for softer highlights */
export const NAVY_HIGHLIGHT_SOFT = "rgba(30, 58, 95, 0.4)";

// ============================================================================
// CSS Animation Class Names
// ============================================================================

export const CSS_CLASSES = {
  /** Base class for all jui effects */
  effectBase: "jui-effect",
  /** Blind effect classes */
  blindUp: "jui-effect-blind-up",
  blindDown: "jui-effect-blind-down",
  blindLeft: "jui-effect-blind-left",
  blindRight: "jui-effect-blind-right",
  /** Bounce effect classes */
  bounce: "jui-effect-bounce",
  /** Clip effect classes */
  clipIn: "jui-effect-clip-in",
  clipOut: "jui-effect-clip-out",
  /** Drop effect classes */
  dropUp: "jui-effect-drop-up",
  dropDown: "jui-effect-drop-down",
  dropLeft: "jui-effect-drop-left",
  dropRight: "jui-effect-drop-right",
  /** Explode effect classes */
  explode: "jui-effect-explode",
  explodePiece: "jui-effect-explode-piece",
  /** Fade effect classes */
  fadeIn: "jui-effect-fade-in",
  fadeOut: "jui-effect-fade-out",
  /** Fold effect classes */
  foldIn: "jui-effect-fold-in",
  foldOut: "jui-effect-fold-out",
  /** Highlight effect classes */
  highlight: "jui-effect-highlight",
  /** Puff effect classes */
  puffIn: "jui-effect-puff-in",
  puffOut: "jui-effect-puff-out",
  /** Pulsate effect classes */
  pulsate: "jui-effect-pulsate",
  /** Scale effect classes */
  scaleIn: "jui-effect-scale-in",
  scaleOut: "jui-effect-scale-out",
  /** Shake effect classes */
  shake: "jui-effect-shake",
  /** Size effect classes */
  sizeGrow: "jui-effect-size-grow",
  sizeShrink: "jui-effect-size-shrink",
  /** Slide effect classes */
  slideUp: "jui-effect-slide-up",
  slideDown: "jui-effect-slide-down",
  slideLeft: "jui-effect-slide-left",
  slideRight: "jui-effect-slide-right",
  /** Transfer effect classes */
  transfer: "jui-effect-transfer",
  transferHelper: "jui-effect-transfer-helper",
} as const;

// ============================================================================
// Default Duration & Easing
// ============================================================================

const DEFAULT_DURATION = 400;
const DEFAULT_EASING = "ease-in-out";

// ============================================================================
// Helper: Resolve duration from jQuery UI format
// ============================================================================

function resolveDuration(duration: number | "slow" | "fast" | undefined): number {
  if (duration === "slow") return 600;
  if (duration === "fast") return 200;
  if (typeof duration === "number") return duration;
  return DEFAULT_DURATION;
}

// ============================================================================
// Helper: Get computed dimensions
// ============================================================================

function getElementDimensions(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const computed = getComputedStyle(el);
  return {
    width: rect.width,
    height: rect.height,
    paddingTop: parseFloat(computed.paddingTop),
    paddingBottom: parseFloat(computed.paddingBottom),
    borderTop: parseFloat(computed.borderTopWidth),
    borderBottom: parseFloat(computed.borderBottomWidth),
    paddingLeft: parseFloat(computed.paddingLeft),
    paddingRight: parseFloat(computed.paddingRight),
    borderLeft: parseFloat(computed.borderLeftWidth),
    borderRight: parseFloat(computed.borderRightWidth),
    marginTop: parseFloat(computed.marginTop),
    marginBottom: parseFloat(computed.marginBottom),
    marginLeft: parseFloat(computed.marginLeft),
    marginRight: parseFloat(computed.marginRight),
  };
}

// ============================================================================
// Effect: Blind - Element slides in/out like window blinds
// ============================================================================

export function effectBlind(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const direction: EffectDirection = options.direction ?? "up";
  const mode = options.mode ?? "effect";

  const dims = getElementDimensions(el);
  let keyframes: Keyframe[];

  switch (direction) {
    case "up":
      keyframes = mode === "hide"
        ? [
            { overflow: "hidden", paddingTop: `${dims.paddingTop}px`, paddingBottom: `${dims.paddingBottom}px`, height: `${dims.height}px` },
            { overflow: "hidden", paddingTop: "0px", paddingBottom: "0px", height: "0px" },
          ]
        : [
            { overflow: "hidden", paddingTop: "0px", paddingBottom: "0px", height: "0px" },
            { overflow: "hidden", paddingTop: `${dims.paddingTop}px`, paddingBottom: `${dims.paddingBottom}px`, height: `${dims.height}px` },
          ];
      break;
    case "down":
      keyframes = mode === "hide"
        ? [
            { overflow: "hidden", paddingTop: `${dims.paddingTop}px`, paddingBottom: `${dims.paddingBottom}px`, height: `${dims.height}px` },
            { overflow: "hidden", paddingTop: "0px", paddingBottom: "0px", height: "0px" },
          ]
        : [
            { overflow: "hidden", paddingTop: "0px", paddingBottom: "0px", height: "0px" },
            { overflow: "hidden", paddingTop: `${dims.paddingTop}px`, paddingBottom: `${dims.paddingBottom}px`, height: `${dims.height}px` },
          ];
      break;
    case "left":
      keyframes = mode === "hide"
        ? [
            { overflow: "hidden", paddingLeft: `${dims.paddingLeft}px`, paddingRight: `${dims.paddingRight}px`, width: `${dims.width}px` },
            { overflow: "hidden", paddingLeft: "0px", paddingRight: "0px", width: "0px" },
          ]
        : [
            { overflow: "hidden", paddingLeft: "0px", paddingRight: "0px", width: "0px" },
            { overflow: "hidden", paddingLeft: `${dims.paddingLeft}px`, paddingRight: `${dims.paddingRight}px`, width: `${dims.width}px` },
          ];
      break;
    case "right":
      keyframes = mode === "hide"
        ? [
            { overflow: "hidden", paddingLeft: `${dims.paddingLeft}px`, paddingRight: `${dims.paddingRight}px`, width: `${dims.width}px` },
            { overflow: "hidden", paddingLeft: "0px", paddingRight: "0px", width: "0px" },
          ]
        : [
            { overflow: "hidden", paddingLeft: "0px", paddingRight: "0px", width: "0px" },
            { overflow: "hidden", paddingLeft: `${dims.paddingLeft}px`, paddingRight: `${dims.paddingRight}px`, width: `${dims.width}px` },
          ];
      break;
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    if (mode === "hide") {
      el.style.display = "none";
    }
    el.style.overflow = "";
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Bounce - Element bounces
// ============================================================================

export function effectBounce(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const times = options.times ?? 5;
  const distance = options.distance ?? 20;
  const mode = options.mode ?? "effect";

  // Build keyframes for bouncing
  const keyframes: Keyframe[] = [];
  const segmentDuration = ms / (times * 2);

  for (let i = 0; i < times; i++) {
    const progress = i / times;
    const dampening = 1 - progress * 0.3; // Reduce amplitude over time
    keyframes.push(
      { transform: `translateY(-${distance * dampening}px)`, offset: (i * 2) / (times * 2) },
      { transform: "translateY(0px)", offset: (i * 2 + 1) / (times * 2) }
    );
  }
  // Final resting
  keyframes.push({ transform: "translateY(0px)", offset: 1 });

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? "ease-out",
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Clip - Element clips in/out from center
// ============================================================================

export function effectClip(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const direction: EffectDirection = options.direction ?? "up";
  const mode = options.mode ?? "effect";

  const dims = getElementDimensions(el);
  const h = dims.height;
  const w = dims.width;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    // Clip from full to center
    keyframes = [
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(50% 50% 50% 50%)" },
    ];
  } else if (mode === "show") {
    // Clip from center to full
    keyframes = [
      { clipPath: "inset(50% 50% 50% 50%)" },
      { clipPath: "inset(0% 0% 0% 0%)" },
    ];
  } else {
    // Effect mode: clip in then out
    keyframes = [
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(50% 50% 50% 50%)" },
      { clipPath: "inset(0% 0% 0% 0%)" },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.clipPath = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Drop - Element drops in/out
// ============================================================================

export function effectDrop(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const direction: EffectDirection = options.direction ?? "left";
  const distance = options.distance ?? 50;
  const mode = options.mode ?? "effect";

  let translateX = "0px";
  let translateY = "0px";

  switch (direction) {
    case "left": translateX = `-${distance}px`; break;
    case "right": translateX = `${distance}px`; break;
    case "up": translateY = `-${distance}px`; break;
    case "down": translateY = `${distance}px`; break;
  }

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { opacity: 1, transform: "translate(0, 0)" },
      { opacity: 0, transform: `translate(${translateX}, ${translateY})` },
    ];
  } else if (mode === "show") {
    keyframes = [
      { opacity: 0, transform: `translate(${translateX}, ${translateY})` },
      { opacity: 1, transform: "translate(0, 0)" },
    ];
  } else {
    keyframes = [
      { opacity: 1, transform: "translate(0, 0)" },
      { opacity: 0, transform: `translate(${translateX}, ${translateY})` },
      { opacity: 1, transform: "translate(0, 0)" },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Explode - Element breaks into pieces
// ============================================================================

export function effectExplode(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  const pieces = options.times ?? 9; // 3x3 grid by default
  const cols = Math.ceil(Math.sqrt(pieces));
  const rows = Math.ceil(pieces / cols);

  const dims = getElementDimensions(el);
  const pieceW = dims.width / cols;
  const pieceH = dims.height / rows;

  // Create overlay container
  const container = document.createElement("div");
  container.style.cssText = `position:relative;width:${dims.width}px;height:${dims.height}px;overflow:hidden;`;
  container.className = CSS_CLASSES.explode;

  // Clone the element's appearance into pieces
  const animations: Animation[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const piece = document.createElement("div");
      piece.className = CSS_CLASSES.explodePiece;
      piece.style.cssText = `
        position:absolute;
        width:${pieceW}px;height:${pieceH}px;
        left:${c * pieceW}px;top:${r * pieceH}px;
        overflow:hidden;
        background: inherit;
      `;
      // Clone element content offset
      const inner = el.cloneNode(true) as HTMLElement;
      inner.style.cssText = `
        position:absolute;
        width:${dims.width}px;height:${dims.height}px;
        left:${-c * pieceW}px;top:${-r * pieceH}px;
        pointer-events:none;
      `;
      piece.appendChild(inner);
      container.appendChild(piece);

      // Animate each piece flying outward
      const cx = (c + 0.5) / cols - 0.5;
      const cy = (r + 0.5) / rows - 0.5;
      const distance = Math.max(dims.width, dims.height);

      const anim = piece.animate(
        mode === "hide"
          ? [
              { transform: "translate(0,0) scale(1)", opacity: 1 },
              { transform: `translate(${cx * distance}px,${cy * distance}px) scale(0.2)`, opacity: 0 },
            ]
          : [
              { transform: `translate(${cx * distance}px,${cy * distance}px) scale(0.2)`, opacity: 0 },
              { transform: "translate(0,0) scale(1)", opacity: 1 },
            ],
        {
          duration: ms,
          easing: options.easing ?? "ease-in",
          fill: "forwards",
        }
      );
      animations.push(anim);
    }
  }

  // Replace element with container
  const parent = el.parentNode;
  if (!parent) return null;

  const nextSibling = el.nextSibling;
  if (mode === "hide") {
    el.style.visibility = "hidden";
  }
  parent.insertBefore(container, nextSibling);

  // Clean up after animation
  const lastAnim = animations[animations.length - 1];
  if (lastAnim) {
    lastAnim.onfinish = () => {
      container.remove();
      if (mode === "hide") {
        el.style.display = "none";
        el.style.visibility = "";
      }
      callback?.();
    };
  }

  return lastAnim;
}

// ============================================================================
// Effect: Fade - Element fades in/out
// ============================================================================

export function effectFade(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { opacity: 1 },
      { opacity: 0 },
    ];
  } else if (mode === "show") {
    keyframes = [
      { opacity: 0 },
      { opacity: 1 },
    ];
  } else {
    keyframes = [
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Fold - Element folds in/out
// ============================================================================

export function effectFold(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  const dims = getElementDimensions(el);

  // Fold: first reduce height to a thin line, then reduce width
  const halfMs = ms / 2;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { height: `${dims.height}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: "0px", overflow: "hidden" },
    ];
  } else if (mode === "show") {
    keyframes = [
      { height: "0px", width: "0px", overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${dims.height}px`, width: `${dims.width}px`, overflow: "hidden" },
    ];
  } else {
    keyframes = [
      { height: `${dims.height}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: "0px", overflow: "hidden" },
      { height: `${Math.max(dims.height * 0.15, 2)}px`, width: `${dims.width}px`, overflow: "hidden" },
      { height: `${dims.height}px`, width: `${dims.width}px`, overflow: "hidden" },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.overflow = "";
    el.style.height = "";
    el.style.width = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Highlight - Element highlights with color flash (navy-600)
// ============================================================================

export function effectHighlight(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  // Deep Navy Blue highlight instead of jQuery UI's default yellow
  const highlightColor = NAVY_HIGHLIGHT;
  const originalBg = getComputedStyle(el).backgroundColor;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { backgroundColor: originalBg },
      { backgroundColor: highlightColor },
      { backgroundColor: originalBg, opacity: 0 },
    ];
  } else if (mode === "show") {
    keyframes = [
      { backgroundColor: highlightColor, opacity: 0 },
      { backgroundColor: highlightColor, opacity: 1 },
      { backgroundColor: originalBg },
    ];
  } else {
    keyframes = [
      { backgroundColor: originalBg },
      { backgroundColor: highlightColor },
      { backgroundColor: originalBg },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.backgroundColor = "";
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Puff - Element scales and fades
// ============================================================================

export function effectPuff(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  const percent = options.percent ?? 150;

  const scaleVal = percent / 100;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: `scale(${scaleVal})` },
    ];
  } else if (mode === "show") {
    keyframes = [
      { opacity: 0, transform: `scale(${scaleVal})` },
      { opacity: 1, transform: "scale(1)" },
    ];
  } else {
    keyframes = [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: `scale(${scaleVal})` },
      { opacity: 1, transform: "scale(1)" },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Pulsate - Element pulsates
// ============================================================================

export function effectPulsate(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const times = options.times ?? 4;
  const mode = options.mode ?? "effect";

  const keyframes: Keyframe[] = [];
  const totalSteps = times * 2 + 1;

  for (let i = 0; i <= totalSteps; i++) {
    const isOdd = i % 2 === 1;
    keyframes.push({
      opacity: isOdd ? 0.2 : 1,
      transform: isOdd ? "scale(0.95)" : "scale(1)",
      offset: i / totalSteps,
    });
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? "ease-in-out",
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    el.style.opacity = "";
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Scale - Element scales
// ============================================================================

export function effectScale(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  const percent = options.percent ?? 0;
  const direction = options.direction ?? "both";
  const scale = percent !== 0 ? percent / 100 : mode === "hide" ? 0 : 1.5;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { transform: "scale(1)", opacity: 1 },
      { transform: `scale(${scale})`, opacity: 0 },
    ];
  } else if (mode === "show") {
    keyframes = [
      { transform: `scale(${scale})`, opacity: 0 },
      { transform: "scale(1)", opacity: 1 },
    ];
  } else {
    keyframes = [
      { transform: "scale(1)", opacity: 1 },
      { transform: `scale(${1 + (scale - 1) * 0.5})`, opacity: 0.8 },
      { transform: "scale(1)", opacity: 1 },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Shake - Element shakes
// ============================================================================

export function effectShake(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const times = options.times ?? 3;
  const distance = options.distance ?? 20;
  const direction: EffectDirection = options.direction ?? "left";

  const keyframes: Keyframe[] = [];
  const isHorizontal = direction === "left" || direction === "right";
  const sign = direction === "right" || direction === "down" ? 1 : -1;
  const prop = isHorizontal ? "translateX" : "translateY";

  // Starting position
  keyframes.push({ transform: "translate(0, 0)", offset: 0 });

  for (let i = 0; i < times; i++) {
    const progress = (i + 0.5) / (times + 0.5);
    const dampening = 1 - i * 0.1;
    // Move one direction
    keyframes.push({
      transform: `${prop}(${sign * distance * dampening}px)`,
      offset: (i * 2 + 1) / (times * 2 + 1),
    });
    // Move other direction
    keyframes.push({
      transform: `${prop}(${sign * -distance * dampening}px)`,
      offset: (i * 2 + 2) / (times * 2 + 1),
    });
  }

  // End at center
  keyframes.push({ transform: "translate(0, 0)", offset: 1 });

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? "ease-in-out",
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Size - Element changes size
// ============================================================================

export function effectSize(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const mode = options.mode ?? "effect";
  const to = options.to;
  const dims = getElementDimensions(el);

  if (!to) {
    callback?.();
    return null;
  }

  const targetWidth = to.width ?? dims.width;
  const targetHeight = to.height ?? dims.height;

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { width: `${dims.width}px`, height: `${dims.height}px`, overflow: "hidden" },
      { width: `${targetWidth}px`, height: `${targetHeight}px`, overflow: "hidden" },
    ];
  } else if (mode === "show") {
    keyframes = [
      { width: `${targetWidth}px`, height: `${targetHeight}px`, overflow: "hidden" },
      { width: `${dims.width}px`, height: `${dims.height}px`, overflow: "hidden" },
    ];
  } else {
    keyframes = [
      { width: `${dims.width}px`, height: `${dims.height}px`, overflow: "hidden" },
      { width: `${targetWidth}px`, height: `${targetHeight}px`, overflow: "hidden" },
      { width: `${dims.width}px`, height: `${dims.height}px`, overflow: "hidden" },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.overflow = "";
    el.style.width = "";
    el.style.height = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Slide - Element slides in/out
// ============================================================================

export function effectSlide(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const direction: EffectDirection = options.direction ?? "left";
  const distance = options.distance ?? 50;
  const mode = options.mode ?? "effect";

  let translateX = "0px";
  let translateY = "0px";

  switch (direction) {
    case "left": translateX = `-${distance}px`; break;
    case "right": translateX = `${distance}px`; break;
    case "up": translateY = `-${distance}px`; break;
    case "down": translateY = `${distance}px`; break;
  }

  let keyframes: Keyframe[];

  if (mode === "hide") {
    keyframes = [
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: `translate(${translateX}, ${translateY})`, opacity: 0 },
    ];
  } else if (mode === "show") {
    keyframes = [
      { transform: `translate(${translateX}, ${translateY})`, opacity: 0 },
      { transform: "translate(0, 0)", opacity: 1 },
    ];
  } else {
    keyframes = [
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: `translate(${translateX}, ${translateY})`, opacity: 0.5 },
      { transform: "translate(0, 0)", opacity: 1 },
    ];
  }

  const anim = el.animate(keyframes, {
    duration: ms,
    easing: options.easing ?? DEFAULT_EASING,
    fill: "forwards",
  });

  anim.onfinish = () => {
    el.style.transform = "";
    el.style.opacity = "";
    if (mode === "hide") {
      el.style.display = "none";
    }
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect: Transfer - Transfer effect to another element
// ============================================================================

export function effectTransfer(
  el: HTMLElement,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const ms = resolveDuration(duration);
  const toSelector = options.toSelector;
  const className = options.className ?? CSS_CLASSES.transferHelper;

  if (!toSelector) {
    callback?.();
    return null;
  }

  const target = document.querySelector(toSelector) as HTMLElement;
  if (!target) {
    callback?.();
    return null;
  }

  // Create transfer element (outline that moves from source to target)
  const sourceRect = el.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const transferEl = document.createElement("div");
  transferEl.className = `${CSS_CLASSES.transfer} ${className}`;
  transferEl.style.cssText = `
    position:fixed;
    z-index:10000;
    pointer-events:none;
    border:2px dotted ${NAVY_HIGHLIGHT};
    background:${NAVY_HIGHLIGHT_SOFT};
    border-radius:2px;
    top:${sourceRect.top}px;
    left:${sourceRect.left}px;
    width:${sourceRect.width}px;
    height:${sourceRect.height}px;
  `;
  document.body.appendChild(transferEl);

  const anim = transferEl.animate(
    [
      {
        top: `${sourceRect.top}px`,
        left: `${sourceRect.left}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        opacity: 0.8,
      },
      {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        opacity: 0.2,
      },
    ],
    {
      duration: ms,
      easing: options.easing ?? DEFAULT_EASING,
      fill: "forwards",
    }
  );

  anim.onfinish = () => {
    transferEl.remove();
    callback?.();
  };

  return anim;
}

// ============================================================================
// Effect Registry - Maps effect names to functions
// ============================================================================

export const effectRegistry: Record<EffectName, typeof effectBlind> = {
  blind: effectBlind,
  bounce: effectBounce,
  clip: effectClip,
  drop: effectDrop,
  explode: effectExplode,
  fade: effectFade,
  fold: effectFold,
  highlight: effectHighlight,
  puff: effectPuff,
  pulsate: effectPulsate,
  scale: effectScale,
  shake: effectShake,
  size: effectSize,
  slide: effectSlide,
  transfer: effectTransfer,
};

// ============================================================================
// Core Utility: animateEffect
// ============================================================================

/**
 * Main animation function - replaces $(el).effect(name, options, duration, callback)
 *
 * @param element - Target HTMLElement
 * @param effectName - Name of the effect to apply
 * @param options - Effect-specific options
 * @param duration - Animation duration in ms, or "slow"/"fast"
 * @param callback - Called when animation completes
 */
export function animateEffect(
  element: HTMLElement,
  effectName: EffectName,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  const effectFn = effectRegistry[effectName];
  if (!effectFn) {
    console.warn(`[ims-jquery-ui] Unknown effect: ${effectName}`);
    callback?.();
    return null;
  }
  return effectFn(element, options, duration, callback);
}

// ============================================================================
// Core Utility: showEffect
// ============================================================================

/**
 * Show an element with an effect - replaces $(el).show(effectName, options, duration, callback)
 *
 * @param element - Target HTMLElement
 * @param effectName - Name of the effect to apply
 * @param options - Effect-specific options (mode will be set to "show")
 * @param duration - Animation duration in ms, or "slow"/"fast"
 * @param callback - Called when animation completes
 */
export function showEffect(
  element: HTMLElement,
  effectName: EffectName,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  element.style.display = "";
  return animateEffect(element, effectName, { ...options, mode: "show" }, duration, callback);
}

// ============================================================================
// Core Utility: hideEffect
// ============================================================================

/**
 * Hide an element with an effect - replaces $(el).hide(effectName, options, duration, callback)
 *
 * @param element - Target HTMLElement
 * @param effectName - Name of the effect to apply
 * @param options - Effect-specific options (mode will be set to "hide")
 * @param duration - Animation duration in ms, or "slow"/"fast"
 * @param callback - Called when animation completes
 */
export function hideEffect(
  element: HTMLElement,
  effectName: EffectName,
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION,
  callback?: () => void
): Animation | null {
  return animateEffect(element, effectName, { ...options, mode: "hide" }, duration, callback);
}

// ============================================================================
// Core Utility: toggleClassEffect
// ============================================================================

/**
 * Toggle a CSS class on an element with an effect animation.
 * Replaces $(el).toggleClass(className) with animation.
 *
 * @param element - Target HTMLElement
 * @param className - CSS class to toggle
 * @param effectName - Name of the effect to apply
 * @param options - Effect-specific options
 * @param duration - Animation duration in ms, or "slow"/"fast"
 */
export function toggleClassEffect(
  element: HTMLElement,
  className: string,
  effectName: EffectName = "highlight",
  options: EffectOptions = {},
  duration: number | "slow" | "fast" = DEFAULT_DURATION
): void {
  const hasClass = element.classList.contains(className);
  element.classList.toggle(className);

  // Apply a subtle highlight effect when toggling
  animateEffect(element, effectName, {
    ...options,
    mode: "effect",
  }, duration);
}

// ============================================================================
// React Hook: useJuiEffect
// ============================================================================

/**
 * Hook that provides effect functions for React components.
 * Returns a set of bound effect functions that can be called imperatively.
 *
 * @example
 * ```tsx
 * const { animate, show, hide, toggleClass } = useJuiEffect();
 *
 * const handleClick = () => {
 *   animate(ref.current!, "bounce", { times: 3 }, 500);
 * };
 * ```
 */
export function useJuiEffect() {
  const animationsRef = React.useRef<Animation[]>([]);

  /** Cancel all running animations */
  const cancelAll = React.useCallback(() => {
    animationsRef.current.forEach((anim) => {
      try { anim.cancel(); } catch { /* ignore */ }
    });
    animationsRef.current = [];
  }, []);

  /** Animate an element with an effect */
  const animate = React.useCallback(
    (element: HTMLElement, effectName: EffectName, options?: EffectOptions, duration?: number | "slow" | "fast", callback?: () => void) => {
      const anim = animateEffect(element, effectName, options ?? {}, duration ?? DEFAULT_DURATION, callback);
      if (anim) {
        animationsRef.current.push(anim);
        anim.onfinish = () => {
          animationsRef.current = animationsRef.current.filter((a) => a !== anim);
        };
      }
      return anim;
    },
    []
  );

  /** Show an element with an effect */
  const show = React.useCallback(
    (element: HTMLElement, effectName: EffectName, options?: EffectOptions, duration?: number | "slow" | "fast", callback?: () => void) => {
      const anim = showEffect(element, effectName, options ?? {}, duration ?? DEFAULT_DURATION, callback);
      if (anim) {
        animationsRef.current.push(anim);
        anim.onfinish = () => {
          animationsRef.current = animationsRef.current.filter((a) => a !== anim);
        };
      }
      return anim;
    },
    []
  );

  /** Hide an element with an effect */
  const hide = React.useCallback(
    (element: HTMLElement, effectName: EffectName, options?: EffectOptions, duration?: number | "slow" | "fast", callback?: () => void) => {
      const anim = hideEffect(element, effectName, options ?? {}, duration ?? DEFAULT_DURATION, callback);
      if (anim) {
        animationsRef.current.push(anim);
        anim.onfinish = () => {
          animationsRef.current = animationsRef.current.filter((a) => a !== anim);
        };
      }
      return anim;
    },
    []
  );

  /** Toggle a class with an effect */
  const toggleClass = React.useCallback(
    (element: HTMLElement, className: string, effectName?: EffectName, options?: EffectOptions, duration?: number | "slow" | "fast") => {
      toggleClassEffect(element, className, effectName ?? "highlight", options ?? {}, duration ?? DEFAULT_DURATION);
    },
    []
  );

  /** Trigger a highlight effect on an element */
  const highlight = React.useCallback(
    (element: HTMLElement, duration?: number | "slow" | "fast") => {
      return animate(element, "highlight", {}, duration ?? 400);
    },
    [animate]
  );

  /** Trigger a shake effect on an element */
  const shake = React.useCallback(
    (element: HTMLElement, times?: number, duration?: number | "slow" | "fast") => {
      return animate(element, "shake", { times: times ?? 3 }, duration ?? 400);
    },
    [animate]
  );

  /** Trigger a bounce effect on an element */
  const bounce = React.useCallback(
    (element: HTMLElement, times?: number, duration?: number | "slow" | "fast") => {
      return animate(element, "bounce", { times: times ?? 5 }, duration ?? 400);
    },
    [animate]
  );

  /** Trigger a pulsate effect on an element */
  const pulsate = React.useCallback(
    (element: HTMLElement, times?: number, duration?: number | "slow" | "fast") => {
      return animate(element, "pulsate", { times: times ?? 4 }, duration ?? 400);
    },
    [animate]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cancelAll();
    };
  }, [cancelAll]);

  return {
    animate,
    show,
    hide,
    toggleClass,
    highlight,
    shake,
    bounce,
    pulsate,
    cancelAll,
  };
}

// ============================================================================
// React Hook: useEffectAnimation
// ============================================================================

export interface UseEffectAnimationOptions extends EffectOptions {
  /** Whether the effect is enabled */
  enabled?: boolean;
  /** Duration */
  duration?: number | "slow" | "fast";
  /** Auto-trigger on mount */
  triggerOnMount?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Hook to trigger effects on a ref-based element.
 * Provides imperative control and auto-trigger options.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const { trigger } = useEffectAnimation(ref, "bounce", { times: 3 });
 *
 * return (
 *   <div ref={ref}>
 *     <button onClick={() => trigger()}>Bounce!</button>
 *   </div>
 * );
 * ```
 */
export function useEffectAnimation(
  ref: React.RefObject<HTMLElement | null>,
  effectName: EffectName,
  options: UseEffectAnimationOptions = {}
) {
  const {
    enabled = true,
    duration = DEFAULT_DURATION,
    triggerOnMount = false,
    onComplete,
    ...effectOptions
  } = options;

  const animationRef = React.useRef<Animation | null>(null);

  /** Trigger the effect */
  const trigger = React.useCallback(
    (overrideOptions?: EffectOptions, overrideDuration?: number | "slow" | "fast") => {
      if (!enabled || !ref.current) return;

      // Cancel any running animation
      if (animationRef.current) {
        try { animationRef.current.cancel(); } catch { /* ignore */ }
      }

      animationRef.current = animateEffect(
        ref.current,
        effectName,
        { ...effectOptions, ...overrideOptions },
        overrideDuration ?? duration,
        onComplete
      );
    },
    [enabled, ref, effectName, effectOptions, duration, onComplete]
  );

  /** Cancel the current animation */
  const cancel = React.useCallback(() => {
    if (animationRef.current) {
      try { animationRef.current.cancel(); } catch { /* ignore */ }
      animationRef.current = null;
    }
  }, []);

  // Auto-trigger on mount if requested
  React.useEffect(() => {
    if (triggerOnMount && enabled) {
      trigger();
    }
  }, [triggerOnMount, enabled, trigger]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { trigger, cancel };
}

// ============================================================================
// AnimationConfig Helper - Creates Web Animations API config
// ============================================================================

/**
 * Creates an AnimationConfig object for use with the Web Animations API.
 * Useful for custom animations that follow the same patterns as jQuery UI effects.
 */
export function createAnimationConfig(
  keyframes: Keyframe[],
  duration: number = DEFAULT_DURATION,
  options: Partial<Omit<AnimationConfig, "keyframes" | "duration">> = {}
): AnimationConfig {
  return {
    keyframes,
    duration,
    easing: options.easing ?? DEFAULT_EASING,
    fill: options.fill ?? "forwards",
    delay: options.delay ?? 0,
    iterations: options.iterations ?? 1,
    direction: options.direction ?? "normal",
  };
}

/**
 * Plays an AnimationConfig on an element using the Web Animations API.
 */
export function playAnimation(
  element: HTMLElement,
  config: AnimationConfig,
  callback?: () => void
): Animation {
  const anim = element.animate(config.keyframes, {
    duration: config.duration,
    easing: config.easing,
    fill: config.fill,
    delay: config.delay,
    iterations: config.iterations,
    direction: config.direction,
  });

  if (callback) {
    anim.onfinish = callback;
  }

  return anim;
}
