/**
 * IMS jQuery UI Accordion Component
 * Replaces jQuery UI 1.12.1 accordion.js
 *
 * Features:
 * - Single/multiple panel expand
 * - Animated expand/collapse transitions
 * - Collapsible mode (allow closing all panels)
 * - Height style: auto, fill, content
 * - Custom header icons (chevron rotation)
 * - Disabled state
 * - Deep Navy Blue themed headers
 * - Events: onBeforeActivate, onActivate
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { AccordionOptions, AccordionUIState } from "./types";

// ============================================================================
// Accordion Context
// ============================================================================

interface ImsJuiAccordionContextValue {
  /** Whether the accordion is disabled */
  disabled: boolean;
  /** Active panel index (-1 = none) */
  activeIndex: number;
  /** Collapsible - allow closing all panels */
  collapsible: boolean;
  /** Animation config */
  animate: AccordionOptions["animate"];
  /** Height style mode */
  heightStyle: "auto" | "fill" | "content";
  /** Event trigger type */
  event: string;
  /** Icons config */
  icons: { header: string; activeHeader: string };
  /** Activate a panel by index */
  activate: (index: number, event?: React.MouseEvent) => void;
  /** Total number of panels registered */
  panelCount: number;
  /** Register a panel and get its index */
  registerPanel: () => number;
}

const ImsJuiAccordionContext = React.createContext<ImsJuiAccordionContextValue | null>(null);

/**
 * Hook to access the accordion context.
 * Must be used within an <ImsJuiAccordion> component.
 */
export function useImsJuiAccordion(): ImsJuiAccordionContextValue {
  const ctx = React.useContext(ImsJuiAccordionContext);
  if (!ctx) {
    throw new Error("useImsJuiAccordion must be used within <ImsJuiAccordion>");
  }
  return ctx;
}

// ============================================================================
// Animation helpers
// ============================================================================

function getAnimationDuration(animate: AccordionOptions["animate"]): number {
  if (animate === false) return 0;
  if (animate === true) return 200;
  if (typeof animate === "number") return animate;
  if (typeof animate === "object" && animate.duration !== undefined) {
    return typeof animate.duration === "number" ? animate.duration : 200;
  }
  // "slide" or other string defaults
  return 200;
}

// ============================================================================
// ImsJuiAccordion (Root)
// ============================================================================

export interface ImsJuiAccordionProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    AccordionOptions {
  /** Children - typically ImsJuiAccordionPanel components */
  children?: React.ReactNode;
}

export function ImsJuiAccordion({
  disabled = false,
  active: controlledActive,
  animate = true,
  collapsible = false,
  event = "click",
  header,
  heightStyle = "auto",
  icons,
  onBeforeActivate,
  onActivate,
  className,
  children,
  ...props
}: ImsJuiAccordionProps) {
  const [internalActive, setInternalActive] = React.useState<number>(
    controlledActive === false ? -1 : controlledActive ?? 0
  );
  const isControlled = controlledActive !== undefined;
  const activeIndex = isControlled
    ? controlledActive === false
      ? -1
      : controlledActive
    : internalActive;

  const panelCounterRef = React.useRef(0);

  const registerPanel = React.useCallback(() => {
    const index = panelCounterRef.current;
    panelCounterRef.current += 1;
    return index;
  }, []);

  const activate = React.useCallback(
    (index: number, nativeEvent?: React.MouseEvent) => {
      // If clicking the already-active panel
      if (index === activeIndex) {
        if (!collapsible) return; // can't close if not collapsible
        // Allow closing (set active to -1)
        const uiState: AccordionUIState = {
          newHeader: null,
          oldHeader: null,
          newPanel: null,
          oldPanel: null,
        };

        if (onBeforeActivate) {
          const result = onBeforeActivate(nativeEvent ?? ({} as React.MouseEvent), uiState);
          if (result === false) return;
        }

        if (!isControlled) {
          setInternalActive(-1);
        }

        onActivate?.(nativeEvent ?? ({} as React.MouseEvent), uiState);
        return;
      }

      const uiState: AccordionUIState = {
        newHeader: null,
        oldHeader: null,
        newPanel: null,
        oldPanel: null,
      };

      if (onBeforeActivate) {
        const result = onBeforeActivate(nativeEvent ?? ({} as React.MouseEvent), uiState);
        if (result === false) return;
      }

      if (!isControlled) {
        setInternalActive(index);
      }

      onActivate?.(nativeEvent ?? ({} as React.MouseEvent), uiState);
    },
    [activeIndex, collapsible, isControlled, onBeforeActivate, onActivate]
  );

  const defaultIcons = {
    header: "chevron-down",
    activeHeader: "chevron-up",
  };

  const contextValue = React.useMemo<ImsJuiAccordionContextValue>(
    () => ({
      disabled,
      activeIndex,
      collapsible,
      animate,
      heightStyle,
      event,
      icons: icons ?? defaultIcons,
      activate,
      panelCount: 0,
      registerPanel,
    }),
    [disabled, activeIndex, collapsible, animate, heightStyle, event, icons, activate, registerPanel]
  );

  // Compute fill height style
  const fillStyle = React.useMemo<React.CSSProperties>(() => {
    if (heightStyle !== "fill") return {};
    return { height: "100%", display: "flex", flexDirection: "column" };
  }, [heightStyle]);

  return (
    <ImsJuiAccordionContext.Provider value={contextValue}>
      <div
        className={cn(
          "ims-jui-accordion",
          "border border-navy-200 dark:border-navy-700 rounded-md overflow-hidden",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        style={fillStyle}
        role="tablist"
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    </ImsJuiAccordionContext.Provider>
  );
}

// ============================================================================
// ImsJuiAccordionPanel
// ============================================================================

export interface ImsJuiAccordionPanelProps extends React.ComponentProps<"div"> {
  /** Panel header text or custom content */
  header: React.ReactNode;
  /** Whether this specific panel is disabled */
  disabled?: boolean;
  /** Custom content for the panel body */
  children?: React.ReactNode;
}

export function ImsJuiAccordionPanel({
  header,
  disabled: panelDisabled = false,
  className,
  children,
  ...props
}: ImsJuiAccordionPanelProps) {
  const ctx = React.useContext(ImsJuiAccordionContext);
  const [panelIndex] = React.useState(() => ctx?.registerPanel() ?? 0);
  const isActive = ctx ? ctx.activeIndex === panelIndex : false;
  const isDisabled = ctx ? ctx.disabled || panelDisabled : panelDisabled;

  const animDuration = React.useMemo(
    () => getAnimationDuration(ctx?.animate),
    [ctx?.animate]
  );

  const handleToggle = React.useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return;
      ctx?.activate(panelIndex, e);
    },
    [ctx, panelIndex, isDisabled]
  );

  const handleMouseOver = React.useCallback(
    (e: React.MouseEvent) => {
      if (ctx?.event === "mouseover" && !isDisabled) {
        ctx.activate(panelIndex, e);
      }
    },
    [ctx, panelIndex, isDisabled]
  );

  // Height style
  const contentStyle = React.useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {};

    if (ctx?.heightStyle === "fill") {
      base.flex = "1";
    }

    if (ctx?.heightStyle === "content") {
      // content mode - no explicit height
      base.height = isActive ? "auto" : "0";
      base.overflow = "hidden";
    }

    if (animDuration > 0 && ctx?.heightStyle !== "content") {
      base.transition = `all ${animDuration}ms ease-in-out`;
    }

    return base;
  }, [ctx?.heightStyle, isActive, animDuration]);

  const generatedId = React.useId();
  const headerId = `jui-accordion-header-${generatedId}`;
  const panelId = `jui-accordion-panel-${generatedId}`;

  return (
    <div
      className={cn(
        "ims-jui-accordion-panel",
        "border-b border-navy-200 dark:border-navy-700 last:border-b-0",
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div
        id={headerId}
        role="tab"
        aria-selected={isActive}
        aria-expanded={isActive}
        aria-controls={panelId}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        className={cn(
          "ims-jui-accordion-header",
          "flex items-center justify-between px-4 py-3 cursor-pointer select-none",
          "text-white font-medium text-sm",
          "transition-colors duration-150",
          isActive
            ? "hover:brightness-110"
            : "hover:brightness-110",
          isDisabled && "cursor-not-allowed"
        )}
        style={{
          background: isActive
            ? "linear-gradient(to bottom, var(--navy-600), var(--navy-700))"
            : "linear-gradient(to bottom, var(--navy-500), var(--navy-600))",
        }}
        onClick={handleToggle}
        onMouseOver={handleMouseOver}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle(e as unknown as React.MouseEvent);
          }
        }}
      >
        <span className="flex-1">{header}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-white/80 transition-transform duration-200",
            isActive && "rotate-180"
          )}
        />
      </div>

      {/* Content */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={headerId}
        aria-hidden={!isActive}
        className={cn(
          "ims-jui-accordion-content",
          "overflow-hidden",
          !isActive && ctx?.heightStyle !== "content" && "h-0",
          isActive && ctx?.heightStyle === "content" && "h-auto"
        )}
        style={contentStyle}
      >
        <div className="px-4 py-3 bg-white dark:bg-navy-950 text-foreground text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

// Re-export context for advanced usage
export { ImsJuiAccordionContext };
