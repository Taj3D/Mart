/**
 * IMS Carousel Component
 * Replaces Bootstrap 3.0.0 carousel.js
 * Enhanced version of shadcn/ui Carousel with Bootstrap-specific features:
 * - Indicators/dots navigation
 * - Auto-play with pause-on-hover
 * - Keyboard navigation
 * - Slide/fade transitions
 * - Wrap-around navigation
 * - Bootstrap event callbacks
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAutoPlay } from "./hooks";
import type { ImsCarouselProps, CarouselState } from "./types";

// ============================================================================
// Context
// ============================================================================

interface ImsCarouselContextValue {
  activeIndex: number;
  isSliding: boolean;
  direction: "left" | "right" | null;
  isPaused: boolean;
  /** Total number of slides */
  totalSlides: number;
  /** Go to a specific slide */
  goTo: (index: number) => void;
  /** Go to next slide */
  next: () => void;
  /** Go to previous slide */
  prev: () => void;
  /** Pause auto-play */
  pause: () => void;
  /** Resume auto-play */
  resume: () => void;
}

const ImsCarouselContext = React.createContext<ImsCarouselContextValue | null>(null);

function useImsCarousel() {
  const ctx = React.useContext(ImsCarouselContext);
  if (!ctx) throw new Error("useImsCarousel must be used within <ImsCarousel>");
  return ctx;
}

// ============================================================================
// ImsCarousel (Root)
// ============================================================================

export function ImsCarousel({
  interval = 5000,
  pauseOnHover = true,
  wrap = true,
  indicators = true,
  controls = true,
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onSlide,
  onSlid,
  keyboard = true,
  duration = 600,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ImsCarouselProps) {
  const [state, setState] = React.useState<CarouselState>({
    activeIndex: controlledIndex ?? defaultIndex,
    isSliding: false,
    direction: null,
    isPaused: false,
  });

  // Count slides from children (React.Children.count)
  const totalSlides = React.Children.count(children);

  const goTo = React.useCallback(
    (index: number) => {
      setState((prev) => {
        if (prev.isSliding) return prev;
        if (index === prev.activeIndex) return prev;

        const bsDirection = index > prev.activeIndex ? "left" : "right";

        onSlide?.(index, bsDirection);

        // Simulate transition end with timeout
        setTimeout(() => {
          setState((p) => ({
            ...p,
            activeIndex: index,
            isSliding: false,
            direction: null,
          }));
          onSlid?.(index, bsDirection);
        }, duration);

        return {
          ...prev,
          isSliding: true,
          direction: bsDirection,
        };
      });
    },
    [onSlide, onSlid, duration]
  );

  const next = React.useCallback(() => {
    const currentIndex = state.activeIndex;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalSlides) {
      if (wrap) {
        goTo(0);
      }
    } else {
      goTo(nextIndex);
    }
  }, [state.activeIndex, totalSlides, wrap, goTo]);

  const prev = React.useCallback(() => {
    const currentIndex = state.activeIndex;
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (wrap) {
        goTo(totalSlides - 1);
      }
    } else {
      goTo(prevIndex);
    }
  }, [state.activeIndex, totalSlides, wrap, goTo]);

  const { cycle, pause: autoPause } = useAutoPlay({
    enabled: interval > 0,
    interval,
    paused: state.isPaused,
    onNext: next,
  });

  const pause = React.useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
    autoPause();
  }, [autoPause]);

  const resume = React.useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
    cycle();
  }, [cycle]);

  // Controlled mode sync
  React.useEffect(() => {
    if (controlledIndex !== undefined && controlledIndex !== state.activeIndex) {
      setState((prev) => ({ ...prev, activeIndex: controlledIndex }));
    }
  }, [controlledIndex, state.activeIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!keyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keyboard, next, prev]);

  // Pause on hover
  const handleMouseEnter = React.useCallback(() => {
    if (pauseOnHover) pause();
  }, [pauseOnHover, pause]);

  const handleMouseLeave = React.useCallback(() => {
    if (pauseOnHover) resume();
  }, [pauseOnHover, resume]);

  const contextValue = React.useMemo(
    () => ({
      ...state,
      totalSlides,
      goTo,
      next,
      prev,
      pause,
      resume,
    }),
    [state, totalSlides, goTo, next, prev, pause, resume]
  );

  return (
    <ImsCarouselContext.Provider value={contextValue}>
      <div
        className={cn(
          "ims-carousel relative overflow-hidden",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {/* Indicators */}
        {indicators && <ImsCarouselIndicators />}

        {/* Slides wrapper */}
        <div className="ims-carousel-inner">
          {children}
        </div>

        {/* Controls */}
        {controls && (
          <>
            <ImsCarouselControl direction="prev" />
            <ImsCarouselControl direction="next" />
          </>
        )}
      </div>
    </ImsCarouselContext.Provider>
  );
}

// ============================================================================
// ImsCarouselItem
// ============================================================================

export function ImsCarouselItem({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { activeIndex, isSliding, direction } = useImsCarousel();
  // Use a data attribute from parent to determine index
  // Or use a simple approach: find our position among siblings
  const itemRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(-1);

  React.useEffect(() => {
    if (!itemRef.current) return;
    const parent = itemRef.current.parentElement;
    if (!parent) return;
    const siblings = Array.from(parent.children).filter(
      (el) => el.classList.contains("ims-carousel-item")
    );
    const idx = siblings.indexOf(itemRef.current);
    setIndex(idx);
  }, []);

  const isActive = index === activeIndex;
  const isNext = isSliding && direction === "left" && index === activeIndex + 1;
  const isPrev = isSliding && direction === "right" && index === activeIndex - 1;

  return (
    <div
      ref={itemRef}
      className={cn(
        "ims-carousel-item",
        isActive && "active",
        isNext && "next",
        isPrev && "prev",
        isSliding && isActive && direction === "left" && "left",
        isSliding && isActive && direction === "right" && "right",
        className
      )}
      role="group"
      aria-roledescription="slide"
      aria-hidden={!isActive}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsCarouselCaption
// ============================================================================

export function ImsCarouselCaption({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ims-carousel-caption", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsCarouselIndicators
// ============================================================================

export function ImsCarouselIndicators({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  const { activeIndex, totalSlides, goTo } = useImsCarousel();

  return (
    <ol
      className={cn("ims-carousel-indicators", className)}
      role="tablist"
      aria-label="Slide indicators"
      {...props}
    >
      {Array.from({ length: totalSlides }, (_, i) => (
        <li
          key={i}
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Slide ${i + 1}`}
          className={cn(
            "ims-carousel-indicator",
            i === activeIndex && "active"
          )}
          onClick={() => goTo(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goTo(i);
            }
          }}
          tabIndex={i === activeIndex ? 0 : -1}
        />
      ))}
    </ol>
  );
}

// ============================================================================
// ImsCarouselControl
// ============================================================================

export interface ImsCarouselControlProps extends React.ComponentProps<"a"> {
  direction: "prev" | "next";
}

export function ImsCarouselControl({
  direction,
  className,
  children,
  ...props
}: ImsCarouselControlProps) {
  const { next, prev } = useImsCarousel();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (direction === "prev") prev();
    else next();
  };

  const isPrev = direction === "prev";

  return (
    <a
      className={cn(
        "ims-carousel-control",
        isPrev ? "ims-carousel-control-prev" : "ims-carousel-control-next",
        className
      )}
      href="#"
      role="button"
      onClick={handleClick}
      aria-label={isPrev ? "Previous slide" : "Next slide"}
      {...props}
    >
      {children || (
        <>
          <span className={cn("ims-carousel-control-icon", isPrev ? "icon-prev" : "icon-next")} aria-hidden="true" />
          <span className="sr-only">{isPrev ? "Previous" : "Next"}</span>
        </>
      )}
    </a>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  ImsCarouselContext,
  useImsCarousel,
};
