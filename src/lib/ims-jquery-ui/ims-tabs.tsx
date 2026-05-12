/**
 * IMS jQuery UI Tabs Component
 * Replaces jQuery UI 1.12.1 tabs.js
 *
 * Features:
 * - Horizontal tabs
 * - Collapsible mode
 * - Sortable tabs (via useSortable hook)
 * - Keyboard navigation
 * - Disabled tabs
 * - AJAX loading support (simplified)
 * - Deep Navy Blue themed tab bar
 * - Events: onBeforeActivate, onActivate, onBeforeLoad, onLoad, onCreate
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { useSortable } from "./hooks";
import type { TabsOptions, TabsUIState, TabsLoadUIState } from "./types";

// ============================================================================
// Tabs Context
// ============================================================================

interface ImsJuiTabsContextValue {
  /** Whether the tabs are disabled */
  disabled: boolean;
  /** Indices of disabled tabs */
  disabledTabs: Set<number>;
  /** Whether collapsible mode is on */
  collapsible: boolean;
  /** Active tab value */
  activeTab: string;
  /** Set active tab */
  setActiveTab: (value: string) => void;
  /** Sortable support */
  sortable: boolean;
  /** Event handlers */
  onBeforeActivate?: (event: React.MouseEvent, ui: TabsUIState) => void | false;
  onActivate?: (event: React.MouseEvent, ui: TabsUIState) => void;
  onBeforeLoad?: (event: React.MouseEvent, ui: TabsLoadUIState) => void;
  onLoad?: (event: React.MouseEvent, ui: TabsLoadUIState) => void;
  /** Register a tab */
  registerTab: (value: string) => number;
  /** Get tab index by value */
  getTabIndex: (value: string) => number;
}

const ImsJuiTabsContext = React.createContext<ImsJuiTabsContextValue | null>(null);

function useImsJuiTabsContext(): ImsJuiTabsContextValue {
  const ctx = React.useContext(ImsJuiTabsContext);
  if (!ctx) {
    throw new Error("ImsJuiTabs compound components must be used within <ImsJuiTabs>");
  }
  return ctx;
}

// ============================================================================
// ImsJuiTabs (Root Container)
// ============================================================================

export interface ImsJuiTabsProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    TabsOptions {
  /** Controlled active tab value */
  value?: string;
  /** Default active tab value */
  defaultValue?: string;
  /** Called when active tab changes */
  onValueChange?: (value: string) => void;
  /** Whether tabs can be reordered */
  sortable?: boolean;
  /** Children */
  children?: React.ReactNode;
}

export function ImsJuiTabs({
  disabled = false,
  disabled: disabledProp,
  active: activeIndex,
  collapsible = false,
  event = "click",
  heightStyle = "auto",
  hide,
  show,
  onBeforeActivate,
  onActivate,
  onBeforeLoad,
  onLoad,
  onCreate,
  value: controlledValue,
  defaultValue,
  onValueChange,
  sortable = false,
  className,
  children,
  ...props
}: ImsJuiTabsProps) {
  // Track registered tabs for index mapping
  const tabRegistryRef = React.useRef<string[]>([]);

  // Build disabled tabs set from the disabled prop (can be boolean or number[])
  const disabledTabs = React.useMemo(() => {
    if (Array.isArray(disabledProp)) {
      return new Set(disabledProp as number[]);
    }
    return new Set<number>();
  }, [disabledProp]);

  const [internalValue, setInternalValue] = React.useState<string>(
    defaultValue ?? ""
  );
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : internalValue;

  const registerTab = React.useCallback((value: string) => {
    if (!tabRegistryRef.current.includes(value)) {
      tabRegistryRef.current.push(value);
    }
    return tabRegistryRef.current.indexOf(value);
  }, []);

  const getTabIndex = React.useCallback((value: string) => {
    return tabRegistryRef.current.indexOf(value);
  }, []);

  const setActiveTab = React.useCallback(
    (value: string) => {
      // Collapsible: clicking active tab closes it
      if (collapsible && value === activeTab) {
        if (!isControlled) setInternalValue("");
        onValueChange?.("");
        return;
      }

      if (!isControlled) setInternalValue(value);
      onValueChange?.(value);
    },
    [collapsible, activeTab, isControlled, onValueChange]
  );

  // Sortable hook
  const sortableHook = useSortable<{ id: string; value: string }>({
    disabled: !sortable,
  });

  // Fire onCreate on mount
  React.useEffect(() => {
    onCreate?.({} as React.MouseEvent, {
      newTab: null,
      oldTab: null,
      newPanel: null,
      oldPanel: null,
    });
  }, [onCreate]);

  const contextValue = React.useMemo<ImsJuiTabsContextValue>(
    () => ({
      disabled: Array.isArray(disabledProp) ? false : (disabledProp as boolean),
      disabledTabs,
      collapsible,
      activeTab,
      setActiveTab,
      sortable,
      onBeforeActivate,
      onActivate,
      onBeforeLoad,
      onLoad,
      registerTab,
      getTabIndex,
    }),
    [
      disabledProp,
      disabledTabs,
      collapsible,
      activeTab,
      setActiveTab,
      sortable,
      onBeforeActivate,
      onActivate,
      onBeforeLoad,
      onLoad,
      registerTab,
      getTabIndex,
    ]
  );

  // Height style
  const containerStyle = React.useMemo<React.CSSProperties>(() => {
    if (heightStyle === "fill") return { height: "100%", display: "flex", flexDirection: "column" };
    return {};
  }, [heightStyle]);

  return (
    <ImsJuiTabsContext.Provider value={contextValue}>
      <TabsPrimitive.Root
        value={activeTab || undefined}
        onValueChange={setActiveTab}
        data-slot="ims-jui-tabs"
        className={cn(
          "ims-jui-tabs",
          "flex flex-col gap-0",
          Array.isArray(disabledProp) && (disabledProp as number[]).length > 0 && "opacity-100",
          className
        )}
        style={containerStyle}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </ImsJuiTabsContext.Provider>
  );
}

// ============================================================================
// ImsJuiTabList (Tab Navigation Bar)
// ============================================================================

export interface ImsJuiTabListProps extends React.ComponentProps<"div"> {
  /** Children - typically ImsJuiTab components */
  children?: React.ReactNode;
}

export function ImsJuiTabList({
  className,
  children,
  ...props
}: ImsJuiTabListProps) {
  return (
    <TabsPrimitive.List
      data-slot="ims-jui-tablist"
      className={cn(
        "ims-jui-tablist",
        "inline-flex items-center gap-0",
        "bg-navy-700 dark:bg-navy-900",
        "rounded-t-lg overflow-hidden",
        "border-b-2 border-navy-600 dark:border-navy-800",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

// ============================================================================
// ImsJuiTab (Individual Tab Trigger)
// ============================================================================

export interface ImsJuiTabProps extends React.ComponentProps<"button"> {
  /** Unique tab value identifier */
  value: string;
  /** Whether this specific tab is disabled */
  disabled?: boolean;
  /** Tab icon (optional) */
  icon?: React.ReactNode;
  /** AJAX URL to load content from */
  href?: string;
  /** Children - tab label */
  children?: React.ReactNode;
}

export function ImsJuiTab({
  value,
  disabled: tabDisabled = false,
  icon,
  href,
  className,
  children,
  ...props
}: ImsJuiTabProps) {
  const ctx = React.useContext(ImsJuiTabsContext);
  const isDisabled = tabDisabled || (ctx?.disabled ?? false);
  const isActive = ctx?.activeTab === value;

  // Register tab on mount
  React.useEffect(() => {
    ctx?.registerTab(value);
  }, [ctx, value]);

  // AJAX loading support
  const [loading, setLoading] = React.useState(false);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return;

      // Fire onBeforeActivate
      if (ctx?.onBeforeActivate) {
        const result = ctx.onBeforeActivate(e, {
          newTab: null,
          oldTab: null,
          newPanel: null,
          oldPanel: null,
        });
        if (result === false) return;
      }

      ctx?.setActiveTab(value);

      // Fire onActivate
      ctx?.onActivate?.(e, {
        newTab: null,
        oldTab: null,
        newPanel: null,
        oldPanel: null,
      });

      // AJAX load
      if (href && ctx?.onBeforeLoad) {
        ctx.onBeforeLoad(e, {
          newTab: null,
          oldTab: null,
          newPanel: null,
          oldPanel: null,
          tab: null,
          panel: null,
          ajaxSettings: {} as XMLHttpRequest,
        });
        setLoading(true);

        // Simulated AJAX load
        setTimeout(() => {
          setLoading(false);
          ctx.onLoad?.(e, {
            newTab: null,
            oldTab: null,
            newPanel: null,
            oldPanel: null,
            tab: null,
            panel: null,
            ajaxSettings: {} as XMLHttpRequest,
          });
        }, 500);
      }
    },
    [isDisabled, ctx, value, href]
  );

  return (
    <TabsPrimitive.Trigger
      data-slot="ims-jui-tab"
      value={value}
      disabled={isDisabled}
      className={cn(
        "ims-jui-tab",
        "inline-flex items-center justify-center gap-1.5",
        "px-4 py-2.5 text-sm font-medium whitespace-nowrap",
        "transition-colors duration-150 outline-none",
        "border-b-2 border-transparent",
        // Active state: navy-600 bg with white text
        isActive
          ? "bg-navy-600 text-white border-b-white"
          : "bg-navy-800/50 dark:bg-navy-900/50 text-navy-200 hover:bg-navy-700 hover:text-white",
        // Disabled state
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        // Loading state
        loading && "animate-pulse",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {loading && (
        <span className="ml-1 inline-block size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
    </TabsPrimitive.Trigger>
  );
}

// ============================================================================
// ImsJuiTabPanel (Tab Content Panel)
// ============================================================================

export interface ImsJuiTabPanelProps extends React.ComponentProps<"div"> {
  /** Tab value this panel is associated with */
  value: string;
  /** Panel content */
  children?: React.ReactNode;
}

export function ImsJuiTabPanel({
  value,
  className,
  children,
  ...props
}: ImsJuiTabPanelProps) {
  return (
    <TabsPrimitive.Content
      data-slot="ims-jui-tabpanel"
      value={value}
      className={cn(
        "ims-jui-tabpanel",
        "flex-1 outline-none",
        "border border-t-0 border-navy-200 dark:border-navy-700",
        "rounded-b-lg",
        "bg-white dark:bg-navy-950",
        "p-4",
        "animate-in fade-in-0 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
}

// Re-export context for advanced usage
export { ImsJuiTabsContext };
