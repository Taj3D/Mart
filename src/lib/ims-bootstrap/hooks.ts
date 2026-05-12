/**
 * IMS Bootstrap Hooks
 * Replaces Bootstrap 3.0.0 JavaScript behaviors with React hooks
 */

"use client";

import * as React from "react";
import type { AffixState, TransitionEndEvent } from "./types";

// ============================================================================
// useTransitionEnd - Replaces Bootstrap transition.js
// ============================================================================

const TRANSITION_END_EVENTS: Record<string, string> = {
  WebkitTransition: "webkitTransitionEnd",
  MozTransition: "transitionend",
  OTransition: "oTransitionEnd otransitionend",
  transition: "transitionend",
};

/**
 * Detect CSS transition support and get the correct transitionend event name.
 * Replaces Bootstrap's transition.js detection logic.
 */
function detectTransitionSupport(): TransitionEndEvent | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.createElement("div");
  for (const [prop, event] of Object.entries(TRANSITION_END_EVENTS)) {
    if (el.style[prop as keyof CSSStyleDeclaration] !== undefined) {
      return { end: event };
    }
  }
  return undefined;
}

// Singleton detection (Bootstrap does this once on DOM ready)
let _transitionSupport: TransitionEndEvent | undefined | null = null;

function getTransitionSupport(): TransitionEndEvent | undefined {
  if (_transitionSupport === null) {
    _transitionSupport = detectTransitionSupport();
  }
  return _transitionSupport ?? undefined;
}

/**
 * Hook that provides CSS transition support detection.
 * Replaces Bootstrap's $.support.transition
 */
export function useTransitionSupport(): TransitionEndEvent | undefined {
  const [support, setSupport] = React.useState<TransitionEndEvent | undefined>();

  React.useEffect(() => {
    setSupport(getTransitionSupport());
  }, []);

  return support;
}

/**
 * Hook that fires a callback after a CSS transition ends, with a fallback timeout.
 * Replaces Bootstrap's $.fn.emulateTransitionEnd
 */
export function useEmulateTransitionEnd() {
  const support = useTransitionSupport();

  const emulateTransitionEnd = React.useCallback(
    (element: HTMLElement, duration: number, callback: () => void) => {
      let called = false;
      const onEnd = () => {
        if (!called) {
          called = true;
          callback();
        }
      };

      if (support?.end) {
        element.addEventListener(support.end, onEnd as EventListener, { once: true });
      }

      // Fallback timeout (like Bootstrap's emulateTransitionEnd)
      const timer = setTimeout(() => {
        if (!called) {
          called = true;
          callback();
        }
      }, duration);

      return () => {
        clearTimeout(timer);
        if (support?.end) {
          element.removeEventListener(support.end, onEnd as EventListener);
        }
      };
    },
    [support]
  );

  return emulateTransitionEnd;
}

// ============================================================================
// useScrollSpy - Replaces Bootstrap scrollspy.js
// ============================================================================

export interface UseScrollSpyOptions {
  /** Scroll container (defaults to window) */
  container?: React.RefObject<HTMLElement | null>;
  /** Offset from top for activation (default: 10) */
  offset?: number;
  /** Navigation link selector (default: 'a[href^="#"]') */
  selector?: string;
  /** Throttle scroll handler in ms (default: 100) */
  throttle?: number;
}

export interface UseScrollSpyReturn {
  /** Currently active section ID */
  activeId: string | null;
  /** Manually set active section */
  setActiveId: (id: string | null) => void;
  /** Refresh the scroll spy (recalculate offsets) */
  refresh: () => void;
}

/**
 * Hook that tracks which section is currently in view based on scroll position.
 * Replaces Bootstrap's scrollspy.js
 */
export function useScrollSpy(options: UseScrollSpyOptions = {}): UseScrollSpyReturn {
  const { container, offset = 10, throttle = 100 } = options;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const entriesRef = React.useRef<Array<{ id: string; offset: number }>>([]);
  const rafRef = React.useRef<number>(0);

  // Store options in refs to avoid useCallback dependency issues
  const offsetRef = React.useRef(offset);
  const containerRef = React.useRef(container);
  React.useEffect(() => {
    offsetRef.current = offset;
    containerRef.current = container;
  });

  const refresh = React.useCallback(() => {
    const containerEl = containerRef.current?.current;
    const currentOffset = offsetRef.current;
    const isWindow = !containerEl;
    const scrollTop = isWindow ? window.scrollY : containerEl.scrollTop;
    const scrollHeight = isWindow
      ? document.documentElement.scrollHeight
      : containerEl.scrollHeight;
    const clientHeight = isWindow ? window.innerHeight : containerEl.clientHeight;

    // Find all sections with IDs
    const sections = document.querySelectorAll("[id]");
    const newEntries: Array<{ id: string; offset: number }> = [];

    sections.forEach((section) => {
      const el = section as HTMLElement;
      const rect = el.getBoundingClientRect();
      const top = isWindow
        ? rect.top + scrollTop
        : rect.top - (containerEl?.getBoundingClientRect().top ?? 0) + scrollTop;

      newEntries.push({
        id: el.id,
        offset: top,
      });
    });

    newEntries.sort((a, b) => a.offset - b.offset);
    entriesRef.current = newEntries;

    // Determine active section
    const scrollPos = scrollTop + currentOffset;
    const maxScroll = scrollHeight - clientHeight;

    if (scrollPos >= maxScroll && newEntries.length > 0) {
      setActiveId(newEntries[newEntries.length - 1].id);
      return;
    }

    for (let i = newEntries.length - 1; i >= 0; i--) {
      if (scrollPos >= newEntries[i].offset) {
        if (!newEntries[i + 1] || scrollPos <= newEntries[i + 1].offset) {
          setActiveId(newEntries[i].id);
          return;
        }
      }
    }

    setActiveId(null);
  }, []);

  React.useEffect(() => {
    const containerEl = container?.current;
    const target = containerEl || window;

    let lastTime = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime < throttle) return;
      lastTime = now;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(refresh);
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    refresh();

    return () => {
      target.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [container, throttle, refresh]);

  return { activeId, setActiveId, refresh };
}

// ============================================================================
// useAffix - Replaces Bootstrap affix.js
// ============================================================================

export interface UseAffixOptions {
  /** Top offset for affix state (pixels or function) */
  offsetTop?: number | (() => number);
  /** Bottom offset for affix-bottom state (pixels or function) */
  offsetBottom?: number | (() => number);
  /** Called when affix state changes */
  onAffix?: (state: AffixState) => void;
  /** Throttle check in ms (default: 50) */
  throttle?: number;
}

export interface UseAffixReturn {
  /** Current affix state: 'top', 'bottom', or null (affixed) */
  affixState: AffixState;
  /** Element ref to attach */
  ref: React.RefCallback<HTMLElement>;
  /** Style to apply for positioning */
  style: React.CSSProperties;
  /** CSS class to apply */
  className: string;
}

/**
 * Hook that provides sticky/affix behavior.
 * Replaces Bootstrap's affix.js
 */
export function useAffix(options: UseAffixOptions = {}): UseAffixReturn {
  const { offsetTop, offsetBottom, onAffix, throttle = 50 } = options;
  const [affixState, setAffixState] = React.useState<AffixState>(null);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const unpinRef = React.useRef<number | null>(null);

  const checkPosition = React.useCallback(() => {
    const el = elementRef.current;
    if (!el || !el.offsetParent) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const position = el.getBoundingClientRect();
    const elTop = position.top + scrollTop;
    const elHeight = el.offsetHeight;

    const top = typeof offsetTop === "function" ? offsetTop() : offsetTop;
    const bottom = typeof offsetBottom === "function" ? offsetBottom() : offsetBottom;

    let newState: AffixState;

    if (unpinRef.current !== null && scrollTop + unpinRef.current <= elTop) {
      newState = false;
    } else if (bottom != null && elTop + elHeight >= scrollHeight - bottom) {
      newState = "bottom";
    } else if (top != null && scrollTop <= top) {
      newState = "top";
    } else {
      newState = null; // affixed
    }

    if (newState === false) {
      // Affixed state (null in our system)
      newState = null;
      unpinRef.current = null;
    }

    if (bottom != null && newState === "bottom") {
      unpinRef.current = elTop - scrollTop;
    }

    setAffixState((prev) => {
      if (prev !== newState) {
        onAffix?.(newState);
        return newState;
      }
      return prev;
    });
  }, [offsetTop, offsetBottom, onAffix]);

  React.useEffect(() => {
    let lastTime = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime < throttle) return;
      lastTime = now;
      checkPosition();
    };

    const handleClick = () => {
      setTimeout(checkPosition, 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick);
    checkPosition();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [checkPosition, throttle]);

  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      if (node) {
        checkPosition();
      }
    },
    [checkPosition]
  );

  const topValue = typeof offsetTop === "function" ? offsetTop() : offsetTop ?? 0;
  const bottomValue = typeof offsetBottom === "function" ? offsetBottom() : offsetBottom;

  const style: React.CSSProperties =
    affixState === "bottom" && offsetBottom != null
      ? {
          position: "absolute",
          top: "auto",
          bottom: bottomValue,
        }
      : affixState === null
        ? { position: "sticky", top: topValue }
        : {};

  const className =
    affixState === "top"
      ? "ims-affix-top"
      : affixState === "bottom"
        ? "ims-affix-bottom"
        : affixState === null
          ? "ims-affix"
          : "";

  return { affixState, ref, style, className };
}

// ============================================================================
// useDismiss - Replaces Bootstrap alert.js dismiss behavior
// ============================================================================

export interface UseDismissOptions {
  /** Called when element should be dismissed */
  onDismiss: () => void;
  /** Whether to animate the dismiss (default: true) */
  animate?: boolean;
  /** Fade transition duration in ms (default: 150) */
  duration?: number;
}

/**
 * Hook that provides Bootstrap-style dismiss behavior with fade animation.
 * Replaces Bootstrap's alert.js dismiss functionality.
 */
export function useDismiss(options: UseDismissOptions) {
  const { onDismiss, animate = true, duration = 150 } = options;
  const [isDismissing, setIsDismissing] = React.useState(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const emulateTransitionEnd = useEmulateTransitionEnd();

  const dismiss = React.useCallback(() => {
    if (!animate) {
      onDismiss();
      return;
    }

    setIsDismissing(true);

    if (elementRef.current) {
      const cleanup = emulateTransitionEnd(elementRef.current, duration, () => {
        onDismiss();
        setIsDismissing(false);
      });
      return cleanup;
    } else {
      const timer = setTimeout(() => {
        onDismiss();
        setIsDismissing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [animate, duration, onDismiss, emulateTransitionEnd]);

  return {
    dismiss,
    isDismissing,
    ref: elementRef,
    dismissProps: {
      "data-dismissing": isDismissing || undefined,
      className: isDismissing ? "fade out" : undefined,
    },
  };
}

// ============================================================================
// useEscapeKey - Replaces Bootstrap modal.js escape handling
// ============================================================================

export interface UseEscapeKeyOptions {
  /** Whether the escape key handler is active */
  enabled?: boolean;
  /** Called when Escape is pressed */
  onEscape: () => void;
}

/**
 * Hook that handles Escape key presses.
 * Replaces Bootstrap's modal escape and dropdown escape handling.
 */
export function useEscapeKey(options: UseEscapeKeyOptions) {
  const { enabled = true, onEscape } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEscape]);
}

// ============================================================================
// useOutsideClick - Replaces Bootstrap dropdown backdrop/click-outside
// ============================================================================

export interface UseOutsideClickOptions {
  /** Ref to the element to detect outside clicks for */
  ref: React.RefObject<HTMLElement | null>;
  /** Called when clicking outside the element */
  onOutsideClick: (event: MouseEvent | TouchEvent) => void;
  /** Whether the handler is enabled */
  enabled?: boolean;
}

/**
 * Hook that detects clicks outside an element.
 * Replaces Bootstrap's dropdown backdrop click handling.
 */
export function useOutsideClick(options: UseOutsideClickOptions) {
  const { ref, onOutsideClick, enabled = true } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick(e);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [ref, enabled]);
}

// ============================================================================
// useBodyScrollLock - Replaces Bootstrap modal body scroll lock
// ============================================================================

/**
 * Hook that locks body scroll when active.
 * Replaces Bootstrap's modal body scroll lock (modal-open class).
 */
export function useBodyScrollLock(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [enabled]);
}

// ============================================================================
// useFocusTrap - Replaces Bootstrap modal enforceFocus
// ============================================================================

export interface UseFocusTrapOptions {
  /** Ref to the container element */
  ref: React.RefObject<HTMLElement | null>;
  /** Whether the focus trap is active */
  enabled?: boolean;
}

/**
 * Hook that traps focus within an element.
 * Replaces Bootstrap's modal enforceFocus behavior.
 */
export function useFocusTrap(options: UseFocusTrapOptions) {
  const { ref, enabled = true } = options;

  React.useEffect(() => {
    if (!enabled || !ref.current) return;

    const container = ref.current;
    const FOCUSABLE_SELECTOR = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const handleFocusIn = (e: FocusEvent) => {
      if (!container.contains(e.target as Node)) {
        const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [ref, enabled]);
}

// ============================================================================
// useAutoPlay - Carousel auto-play behavior
// ============================================================================

export interface UseAutoPlayOptions {
  /** Whether auto-play is enabled */
  enabled?: boolean;
  /** Interval in ms (default: 5000) */
  interval?: number;
  /** Whether to pause (mouse hover, interaction) */
  paused?: boolean;
  /** Called on each tick */
  onNext: () => void;
}

/**
 * Hook that provides carousel auto-play with pause-on-hover.
 * Replaces Bootstrap's Carousel.cycle/pause behavior.
 */
export function useAutoPlay(options: UseAutoPlayOptions) {
  const { enabled = true, interval = 5000, paused = false, onNext } = options;
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const cycle = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (enabled && !paused && interval > 0) {
      intervalRef.current = setInterval(onNext, interval);
    }
  }, [enabled, interval, paused, onNext]);

  const pause = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    cycle();
    return pause;
  }, [cycle, pause]);

  return { cycle, pause };
}

// ============================================================================
// useDropdownKeyboard - Replaces Bootstrap dropdown keyboard navigation
// ============================================================================

export interface UseDropdownKeyboardOptions {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Called when dropdown should close */
  onClose: () => void;
  /** Container ref for finding items */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Item selector within container (default: '[role="menuitem"], [role="option"]') */
  itemSelector?: string;
}

/**
 * Hook that provides keyboard navigation for dropdowns.
 * Replaces Bootstrap's dropdown.js keyboard navigation (Arrow/Escape).
 */
export function useDropdownKeyboard(options: UseDropdownKeyboardOptions) {
  const { isOpen, onClose, containerRef, itemSelector = '[role="menuitem"], [role="option"]' } = options;

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(itemSelector);
      const visibleItems = Array.from(items).filter(
        (item) => !((item as HTMLElement).offsetParent === null)
      );

      if (visibleItems.length === 0) return;

      const currentIndex = visibleItems.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < visibleItems.length - 1) {
            (visibleItems[currentIndex + 1] as HTMLElement).focus();
          } else {
            (visibleItems[0] as HTMLElement).focus();
          }
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            (visibleItems[currentIndex - 1] as HTMLElement).focus();
          } else {
            (visibleItems[visibleItems.length - 1] as HTMLElement).focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Home":
          e.preventDefault();
          (visibleItems[0] as HTMLElement).focus();
          break;
        case "End":
          e.preventDefault();
          (visibleItems[visibleItems.length - 1] as HTMLElement).focus();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, containerRef, itemSelector]);
}
