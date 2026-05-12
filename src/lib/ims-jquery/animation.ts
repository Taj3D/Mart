/**
 * IMS jQuery Compatibility Module - Animation Utilities
 * 
 * Converts jQuery animation system (easing functions, fx speeds, animation helpers)
 * to TypeScript with CSS transitions and Framer Motion patterns.
 */

import type { ImsEasingFunction, ImsAnimationSpeeds, ImsAnimationProps, ImsTween } from './types';

// ============================================================================
// Easing Functions (jQuery.easing replacement)
// ============================================================================

/**
 * Easing functions collection.
 * Replaces: jQuery.easing
 * 
 * All easing functions follow the signature:
 * (t: progress fraction 0-1, durationMs, startValue, endValue) => current value
 */
export const easing: Record<string, ImsEasingFunction> = {
  /**
   * Linear easing - constant speed.
   * Replaces: jQuery.easing.linear
   */
  linear(t: number): number {
    return t;
  },

  /**
   * Swing easing - default jQuery animation easing (sinusoidal).
   * Replaces: jQuery.easing.swing
   */
  swing(t: number): number {
    return 0.5 - Math.cos(t * Math.PI) / 2;
  },

  // ---- Standard CSS easing equivalents ----

  /** Ease-in (accelerating) */
  easeIn(t: number): number {
    return t * t;
  },

  /** Ease-out (decelerating) */
  easeOut(t: number): number {
    return t * (2 - t);
  },

  /** Ease-in-out (accelerate then decelerate) */
  easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  // ---- Robert Penner easing functions ----

  /** Quad ease-in */
  easeInQuad(t: number): number {
    return t * t;
  },

  /** Quad ease-out */
  easeOutQuad(t: number): number {
    return t * (2 - t);
  },

  /** Quad ease-in-out */
  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  /** Cubic ease-in */
  easeInCubic(t: number): number {
    return t * t * t;
  },

  /** Cubic ease-out */
  easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  },

  /** Cubic ease-in-out */
  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },

  /** Quart ease-in */
  easeInQuart(t: number): number {
    return t * t * t * t;
  },

  /** Quart ease-out */
  easeOutQuart(t: number): number {
    return 1 - (--t) * t * t * t;
  },

  /** Quart ease-in-out */
  easeInOutQuart(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  },

  /** Expo ease-in */
  easeInExpo(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  },

  /** Expo ease-out */
  easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  /** Expo ease-in-out */
  easeInOutExpo(t: number): number {
    if (t === 0 || t === 1) return t;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  /** Bounce ease-out */
  easeOutBounce(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  /** Bounce ease-in */
  easeInBounce(t: number): number {
    return 1 - easing.easeOutBounce(1 - t);
  },

  /** Bounce ease-in-out */
  easeInOutBounce(t: number): number {
    return t < 0.5
      ? (1 - easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + easing.easeOutBounce(2 * t - 1)) / 2;
  },

  /** Elastic ease-out */
  easeOutElastic(t: number): number {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },

  /** Back ease-out */
  easeOutBack(t: number): number {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
};

/**
 * Get an easing function by name.
 * Falls back to 'swing' (jQuery default) if not found.
 */
export function getEasing(name?: string | ImsEasingFunction): ImsEasingFunction {
  if (typeof name === 'function') return name;
  if (!name || name === 'swing') return easing.swing;
  if (name === 'linear') return easing.linear;
  return easing[name] || easing.swing;
}

// ============================================================================
// Animation Speed Presets (jQuery.fx.speeds replacement)
// ============================================================================

/**
 * Animation speed presets.
 * Replaces: jQuery.fx.speeds
 */
export const speeds: ImsAnimationSpeeds = {
  slow: 600,
  fast: 200,
  _default: 400,
};

/**
 * Resolve a duration value to milliseconds.
 * Handles named speeds ('slow', 'fast'), numeric values, and defaults.
 */
export function resolveDuration(duration?: number | string | null): number {
  if (duration == null) return speeds._default;
  if (typeof duration === 'number') return duration;
  if (duration in speeds) return speeds[duration as keyof ImsAnimationSpeeds];
  const parsed = parseFloat(duration);
  return isNaN(parsed) ? speeds._default : parsed;
}

// ============================================================================
// CSS Animation Helpers
// ============================================================================

/** CSS transition properties */
export interface CssTransitionOptions {
  property?: string;
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * Apply a CSS transition to an element.
 * Modern replacement for jQuery.animate() using CSS transitions.
 */
export function applyTransition(
  element: HTMLElement,
  properties: Record<string, string | number>,
  options: ImsAnimationProps = {}
): Promise<void> {
  return new Promise((resolve) => {
    const duration = resolveDuration(options.duration);
    const easingName = typeof options.easing === 'string'
      ? cssEasingFromJQuery(options.easing)
      : 'ease';
    const delay = 0;

    // Set transition
    element.style.transition = `all ${duration}ms ${easingName} ${delay}ms`;

    // Force reflow
    void element.offsetHeight;

    // Apply properties
    Object.entries(properties).forEach(([prop, value]) => {
      element.style[prop] = String(value);
    });

    // Listen for transition end
    const onEnd = () => {
      element.style.transition = '';
      element.removeEventListener('transitionend', onEnd);
      if (options.complete) options.complete();
      resolve();
    };

    element.addEventListener('transitionend', onEnd, { once: true });

    // Fallback timeout in case transitionend doesn't fire
    setTimeout(onEnd, duration + 100);
  });
}

/**
 * Map jQuery easing name to CSS cubic-bezier or named easing.
 */
export function cssEasingFromJQuery(name: string): string {
  const map: Record<string, string> = {
    swing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    linear: 'linear',
    easeIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  };

  return map[name] || name;
}

// ============================================================================
// Show/Hide/Toggle Helpers (jQuery.fn.show/hide/toggle replacement)
// ============================================================================

/**
 * Show an element with optional animation.
 * Replaces: $(elem).show([duration] [, complete])
 */
export function showElement(element: HTMLElement, duration?: number, complete?: () => void): void {
  if (duration && duration > 0) {
    element.style.opacity = '0';
    element.style.display = '';
    element.style.overflow = 'hidden';
    
    applyTransition(element, { opacity: '1' }, { duration, complete });
  } else {
    element.style.display = '';
    element.style.opacity = '';
    if (complete) complete();
  }
}

/**
 * Hide an element with optional animation.
 * Replaces: $(elem).hide([duration] [, complete])
 */
export function hideElement(element: HTMLElement, duration?: number, complete?: () => void): void {
  if (duration && duration > 0) {
    element.style.overflow = 'hidden';
    
    applyTransition(element, { opacity: '0' }, {
      duration,
      complete: () => {
        element.style.display = 'none';
        element.style.opacity = '';
        if (complete) complete();
      },
    });
  } else {
    element.style.display = 'none';
    if (complete) complete();
  }
}

/**
 * Toggle element visibility.
 * Replaces: $(elem).toggle([duration] [, complete])
 */
export function toggleElement(element: HTMLElement, duration?: number, complete?: () => void): void {
  const isHidden = element.style.display === 'none' || 
                   getComputedStyle(element).display === 'none';
  
  if (isHidden) {
    showElement(element, duration, complete);
  } else {
    hideElement(element, duration, complete);
  }
}

// ============================================================================
// Slide Animations (jQuery.fn.slideDown/slideUp/slideToggle replacement)
// ============================================================================

/**
 * Slide an element down (expand from hidden).
 * Replaces: $(elem).slideDown([duration] [, complete])
 */
export function slideDown(element: HTMLElement, duration?: number, complete?: () => void): void {
  const dur = resolveDuration(duration);
  
  // Get target height
  element.style.display = '';
  element.style.overflow = 'hidden';
  const height = element.scrollHeight;
  
  element.style.height = '0px';
  element.style.opacity = '1';
  
  // Force reflow
  void element.offsetHeight;
  
  applyTransition(element, { height: `${height}px` }, {
    duration: dur,
    complete: () => {
      element.style.height = '';
      element.style.overflow = '';
      if (complete) complete();
    },
  });
}

/**
 * Slide an element up (collapse to hidden).
 * Replaces: $(elem).slideUp([duration] [, complete])
 */
export function slideUp(element: HTMLElement, duration?: number, complete?: () => void): void {
  const dur = resolveDuration(duration);
  
  element.style.overflow = 'hidden';
  element.style.height = `${element.scrollHeight}px`;
  
  // Force reflow
  void element.offsetHeight;
  
  applyTransition(element, { height: '0px' }, {
    duration: dur,
    complete: () => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      if (complete) complete();
    },
  });
}

/**
 * Toggle slide an element.
 * Replaces: $(elem).slideToggle([duration] [, complete])
 */
export function slideToggle(element: HTMLElement, duration?: number, complete?: () => void): void {
  const isHidden = element.style.display === 'none' ||
                   getComputedStyle(element).display === 'none';
  
  if (isHidden) {
    slideDown(element, duration, complete);
  } else {
    slideUp(element, duration, complete);
  }
}

// ============================================================================
// Fade Animations (jQuery.fn.fadeIn/fadeOut/fadeToggle/fadeTo replacement)
// ============================================================================

/**
 * Fade an element in.
 * Replaces: $(elem).fadeIn([duration] [, complete])
 */
export function fadeIn(element: HTMLElement, duration?: number, complete?: () => void): void {
  const dur = resolveDuration(duration);
  element.style.display = '';
  element.style.opacity = '0';
  
  // Force reflow
  void element.offsetHeight;
  
  applyTransition(element, { opacity: '1' }, {
    duration: dur,
    complete: () => {
      element.style.opacity = '';
      if (complete) complete();
    },
  });
}

/**
 * Fade an element out.
 * Replaces: $(elem).fadeOut([duration] [, complete])
 */
export function fadeOut(element: HTMLElement, duration?: number, complete?: () => void): void {
  const dur = resolveDuration(duration);
  
  applyTransition(element, { opacity: '0' }, {
    duration: dur,
    complete: () => {
      element.style.display = 'none';
      element.style.opacity = '';
      if (complete) complete();
    },
  });
}

/**
 * Toggle fade an element.
 * Replaces: $(elem).fadeToggle([duration] [, complete])
 */
export function fadeToggle(element: HTMLElement, duration?: number, complete?: () => void): void {
  const isHidden = element.style.display === 'none' ||
                   getComputedStyle(element).opacity === '0';
  
  if (isHidden) {
    fadeIn(element, duration, complete);
  } else {
    fadeOut(element, duration, complete);
  }
}

/**
 * Fade an element to a specific opacity.
 * Replaces: $(elem).fadeTo(duration, opacity [, complete])
 */
export function fadeTo(
  element: HTMLElement,
  duration: number,
  opacity: number,
  complete?: () => void
): void {
  const dur = resolveDuration(duration);
  
  if (getComputedStyle(element).display === 'none') {
    element.style.display = '';
    element.style.opacity = '0';
    void element.offsetHeight;
  }
  
  applyTransition(element, { opacity: String(opacity) }, {
    duration: dur,
    complete,
  });
}

// ============================================================================
// Animation Queue (simplified jQuery.fx.queue replacement)
// ============================================================================

/** Animation queue entry */
interface QueueEntry {
  fn: (next: () => void) => void;
  duration?: number;
}

const animationQueues = new WeakMap<Element, QueueEntry[]>();

/**
 * Get or create an animation queue for an element.
 */
export function getQueue(element: Element, queueName = 'fx'): QueueEntry[] {
  if (!animationQueues.has(element)) {
    animationQueues.set(element, []);
  }
  return animationQueues.get(element)!;
}

/**
 * Add a function to the animation queue.
 * Replaces: jQuery.queue(elem, queueName, fn)
 */
export function queue(element: Element, fn: (next: () => void) => void, queueName = 'fx'): void {
  const q = getQueue(element, queueName);
  q.push({ fn });
  
  // If this is the only item, execute immediately
  if (q.length === 1) {
    dequeue(element, queueName);
  }
}

/**
 * Remove and execute the next function in the animation queue.
 * Replaces: jQuery.dequeue(elem, queueName)
 */
export function dequeue(element: Element, queueName = 'fx'): void {
  const q = getQueue(element, queueName);
  if (q.length === 0) return;
  
  const entry = q.shift()!;
  entry.fn(() => dequeue(element, queueName));
}

/**
 * Clear the animation queue.
 * Replaces: jQuery.fn.clearQueue([queueName])
 */
export function clearQueue(element: Element, queueName = 'fx'): void {
  animationQueues.set(element, []);
}

/**
 * Check if an element is currently being animated.
 * Replaces: $(elem).is(':animated')
 */
export function isAnimated(element: Element): boolean {
  const q = getQueue(element);
  return q.length > 0;
}

// ============================================================================
// FX Module Configuration (jQuery.fx replacement)
// ============================================================================

/** FX module configuration */
export const fx = {
  /** Disable all animations globally */
  off: false,
  
  /** Animation tick interval in ms */
  interval: 13,
  
  /** Speed presets */
  speeds,
  
  /** Default step function */
  step: {} as Record<string, (tween: ImsTween) => void>,
};

/**
 * Globally enable or disable animations.
 * Replaces: jQuery.fx.off = true/false
 */
export function setAnimationsEnabled(enabled: boolean): void {
  fx.off = !enabled;
}
