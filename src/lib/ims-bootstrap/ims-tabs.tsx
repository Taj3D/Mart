/**
 * IMS Tabs Component
 * Replaces Bootstrap 3.0.0 tab.js
 * Features:
 * - Fade transition between tabs
 * - Dropdown tab support
 * - Bootstrap event callbacks (show/shown)
 * - Deep Navy Blue theme
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ImsTabsProps } from "./types";

// ============================================================================
// ImsTabs Context
// ============================================================================

interface ImsTabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  fade: boolean;
  duration: number;
  previousTab: string | null;
}

const ImsTabsContext = React.createContext<ImsTabsContextValue | null>(null);

function useImsTabs() {
  const ctx = React.useContext(ImsTabsContext);
  if (!ctx) throw new Error("useImsTabs must be used within <ImsTabs>");
  return ctx;
}

// ============================================================================
// ImsTabs (Root)
// ============================================================================

export function ImsTabs({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  fade = true,
  duration = 150,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ImsTabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [previousTab, setPreviousTab] = React.useState<string | null>(null);

  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : internalValue;

  const setActiveTab = React.useCallback(
    (newValue: string) => {
      setPreviousTab(activeTab);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [activeTab, isControlled, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({ activeTab, setActiveTab, fade, duration, previousTab }),
    [activeTab, setActiveTab, fade, duration, previousTab]
  );

  return (
    <ImsTabsContext.Provider value={contextValue}>
      <div className={cn("ims-tabs", className)} {...props}>
        {children}
      </div>
    </ImsTabsContext.Provider>
  );
}

// ============================================================================
// ImsTabNav
// ============================================================================

export function ImsTabNav({
  className,
  variant = "tabs",
  children,
  ...props
}: React.ComponentProps<"ul"> & { variant?: "tabs" | "pills" }) {
  return (
    <ul
      className={cn(
        "ims-tab-nav nav",
        variant === "tabs" && "nav-tabs",
        variant === "pills" && "nav-pills",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </ul>
  );
}

// ============================================================================
// ImsTabItem
// ============================================================================

export interface ImsTabItemProps extends React.ComponentProps<"li"> {
  /** Tab value identifier */
  value: string;
  /** Disabled state */
  disabled?: boolean;
}

export function ImsTabItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: ImsTabItemProps) {
  const { activeTab, setActiveTab } = useImsTabs();
  const isActive = activeTab === value;

  return (
    <li
      className={cn(
        "ims-tab-item",
        isActive && "active",
        disabled && "disabled",
        className
      )}
      role="presentation"
      {...props}
    >
      <button
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && setActiveTab(value)}
        className={cn(
          "block w-full text-left",
          isActive
            ? "text-navy-700 dark:text-navy-300 font-medium"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
      </button>
    </li>
  );
}

// ============================================================================
// ImsTabDropdown
// ============================================================================

export interface ImsTabDropdownProps extends React.ComponentProps<"li"> {
  /** Dropdown title */
  title: React.ReactNode;
  /** Whether dropdown is open */
  open?: boolean;
}

export function ImsTabDropdown({
  title,
  open: controlledOpen,
  className,
  children,
  ...props
}: ImsTabDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <li
      className={cn("ims-tab-dropdown dropdown", isOpen && "open", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...props}
    >
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        data-toggle="dropdown"
      >
        {title} <span className="caret" />
      </button>
      <ul className="dropdown-menu" role="menu">
        {children}
      </ul>
    </li>
  );
}

// ============================================================================
// ImsTabContent
// ============================================================================

export function ImsTabContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ims-tab-content tab-content", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ImsTabPane
// ============================================================================

export interface ImsTabPaneProps extends React.ComponentProps<"div"> {
  /** Tab value identifier */
  value: string;
}

export function ImsTabPane({
  value,
  className,
  children,
  ...props
}: ImsTabPaneProps) {
  const { activeTab, fade, duration } = useImsTabs();
  const isActive = activeTab === value;
  const [shouldRender, setShouldRender] = React.useState(isActive);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      if (fade) {
        requestAnimationFrame(() => setIsAnimating(true));
      }
    } else {
      if (fade) {
        setIsAnimating(false);
        const timer = setTimeout(() => setShouldRender(false), duration);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(false);
      }
    }
  }, [isActive, fade, duration]);

  if (!shouldRender) return null;

  return (
    <div
      id={`panel-${value}`}
      className={cn(
        "ims-tab-pane tab-pane",
        isActive && "active",
        fade && "fade",
        isAnimating && "in",
        className
      )}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      style={fade ? { transitionDuration: `${duration}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
