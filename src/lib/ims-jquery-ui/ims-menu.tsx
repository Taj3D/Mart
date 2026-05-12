/**
 * IMS jQuery UI Menu Component
 * Replaces jQuery UI 1.12.1 menu.js
 *
 * Features:
 * - Nested submenus
 * - Keyboard navigation (arrow keys, enter, escape, first letter search)
 * - Icons for menu items
 * - Disabled items
 * - Separator
 * - Shortcut labels
 * - Deep Navy Blue themed menus
 * - Events: onBlur, onFocus, onSelect
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuOptions, MenuItem } from "./types";

// ============================================================================
// Menu Context
// ============================================================================

interface ImsJuiMenuContextValue {
  /** Whether the menu is disabled */
  disabled: boolean;
  /** Called when an item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
  /** Called when the menu gains focus */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when the menu loses focus */
  onBlur?: (event: React.FocusEvent) => void;
}

const ImsJuiMenuContext = React.createContext<ImsJuiMenuContextValue | null>(null);

function useImsJuiMenuContext(): ImsJuiMenuContextValue | null {
  return React.useContext(ImsJuiMenuContext);
}

// ============================================================================
// ImsJuiMenu (Standalone Menu Container)
// ============================================================================

export interface ImsJuiMenuProps
  extends Omit<React.ComponentProps<"div">, "onSelect" | "onBlur" | "onFocus">,
    MenuOptions {
  /** Menu items data */
  items?: MenuItem[];
  /** Children (alternative to items prop) */
  children?: React.ReactNode;
  /** Called when a menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
  /** Called when the menu gains focus */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when the menu loses focus */
  onBlur?: (event: React.FocusEvent) => void;
}

export function ImsJuiMenu({
  disabled = false,
  items,
  icons,
  role = "menu",
  onBlur,
  onFocus,
  onSelect,
  className,
  children,
  ...props
}: ImsJuiMenuProps) {
  const contextValue = React.useMemo<ImsJuiMenuContextValue>(
    () => ({
      disabled,
      onSelect,
      onFocus,
      onBlur,
    }),
    [disabled, onSelect, onFocus, onBlur]
  );

  return (
    <ImsJuiMenuContext.Provider value={contextValue}>
      <div
        role={role}
        aria-disabled={disabled}
        className={cn(
          "ims-jui-menu",
          "min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
          "bg-white dark:bg-navy-900",
          "border-navy-200 dark:border-navy-700",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        tabIndex={0}
        onBlur={(e) => {
          // Only fire if focus leaves the menu entirely
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onBlur?.(e);
          }
        }}
        onFocus={(e) => {
          onFocus?.(e, { item: e.currentTarget as unknown as HTMLElement });
        }}
        onKeyDown={(e) => {
          // First letter search
          if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            const target = e.currentTarget.querySelector(
              `[data-menu-item-label^="${e.key.toUpperCase()}"]:not([disabled])`
            );
            if (target) {
              (target as HTMLElement).focus();
            }
          }
        }}
        {...props}
      >
        {items ? <MenuItemsRenderer items={items} /> : children}
      </div>
    </ImsJuiMenuContext.Provider>
  );
}

// ============================================================================
// ImsJuiMenuBar (Horizontal Menu Bar)
// ============================================================================

export interface ImsJuiMenuBarProps extends React.ComponentProps<"nav"> {
  /** Whether the menu bar is disabled */
  disabled?: boolean;
  /** Menu items data */
  items?: MenuItem[];
  /** Children */
  children?: React.ReactNode;
  /** Called when a menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

export function ImsJuiMenuBar({
  disabled = false,
  items,
  onSelect,
  className,
  children,
  ...props
}: ImsJuiMenuBarProps) {
  return (
    <nav
      role="menubar"
      aria-disabled={disabled}
      className={cn(
        "ims-jui-menubar",
        "inline-flex items-center gap-0",
        "bg-navy-700 dark:bg-navy-900",
        "rounded-md overflow-hidden",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {items ? (
        items.map((item, index) => (
          <MenuBarItem key={item.value ?? index} item={item} onSelect={onSelect} />
        ))
      ) : (
        children
      )}
    </nav>
  );
}

// ============================================================================
// ImsJuiMenuItem (Individual Menu Item)
// ============================================================================

export interface ImsJuiMenuItemProps extends React.ComponentProps<"div"> {
  /** Menu item label */
  label: string;
  /** Menu item value */
  value?: string;
  /** Icon for the menu item */
  icon?: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Shortcut key label */
  shortcut?: string;
  /** Whether the item has an inset (for alignment with items that have icons) */
  inset?: boolean;
  /** Custom data payload */
  data?: unknown;
  /** Children (for submenu) */
  children?: React.ReactNode;
  /** Called when this item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export function ImsJuiMenuItem({
  label,
  value,
  icon,
  disabled = false,
  shortcut,
  inset = false,
  data,
  children,
  onSelect,
  className,
  ...props
}: ImsJuiMenuItemProps) {
  const hasSubmenu = Boolean(children);

  const handleSelect = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled) return;
      onSelect?.(e);
    },
    [disabled, onSelect]
  );

  return (
    <div
      role="menuitem"
      aria-disabled={disabled}
      data-menu-item-label={label.charAt(0).toUpperCase()}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "ims-jui-menuitem",
        "relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "cursor-pointer select-none",
        "transition-colors duration-100",
        // Hover: navy-50 in light mode
        "hover:bg-navy-50 dark:hover:bg-navy-800",
        "hover:text-navy-800 dark:hover:text-navy-100",
        // Focus/selected: navy-600 with white text
        "focus:bg-navy-600 focus:text-white",
        "data-[selected=true]:bg-navy-600 data-[selected=true]:text-white",
        // Disabled
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        inset && "pl-8",
        hasSubmenu && "pr-1",
        className
      )}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect(e);
        }
        // Arrow right opens submenu
        if (e.key === "ArrowRight" && hasSubmenu) {
          const submenu = (e.currentTarget as HTMLElement).querySelector(
            "[role='menu']"
          );
          if (submenu) {
            const firstItem = submenu.querySelector('[role="menuitem"]') as HTMLElement;
            firstItem?.focus();
          }
        }
      }}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span className="shrink-0 [&_svg]:size-4">{icon}</span>
      )}
      {/* Inset spacer when no icon but other items have icons */}
      {!icon && inset && <span className="w-4" />}

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Shortcut */}
      {shortcut && (
        <span className="ml-auto text-xs tracking-widest opacity-60">
          {shortcut}
        </span>
      )}

      {/* Submenu chevron */}
      {hasSubmenu && (
        <ChevronRightIcon className="ml-auto size-4 shrink-0 opacity-60" />
      )}

      {/* Submenu content */}
      {hasSubmenu && (
        <div className="absolute left-full top-0 ml-1 hidden group-hover:block group-focus-within:block">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ImsJuiMenuSeparator (Separator Line)
// ============================================================================

export type ImsJuiMenuSeparatorProps = React.ComponentProps<"div">;

export function ImsJuiMenuSeparator({
  className,
  ...props
}: ImsJuiMenuSeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "ims-jui-menu-separator",
        "-mx-1 my-1 h-px",
        "bg-navy-200 dark:bg-navy-700",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// ImsJuiSubMenu (Submenu Container)
// ============================================================================

export interface ImsJuiSubMenuProps extends React.ComponentProps<"div"> {
  /** Submenu label */
  label: string;
  /** Submenu icon */
  icon?: React.ReactNode;
  /** Whether the submenu is disabled */
  disabled?: boolean;
  /** Submenu items */
  items?: MenuItem[];
  /** Children (alternative to items) */
  children?: React.ReactNode;
  /** Called when a menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

export function ImsJuiSubMenu({
  label,
  icon,
  disabled = false,
  items,
  onSelect,
  children,
  className,
  ...props
}: ImsJuiSubMenuProps) {
  return (
    <DropdownMenuPrimitive.Sub>
      <DropdownMenuPrimitive.SubTrigger
        data-slot="ims-jui-submenu-trigger"
        disabled={disabled}
        className={cn(
          "ims-jui-submenu-trigger",
          "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
          "cursor-pointer select-none",
          "transition-colors duration-100",
          // Hover
          "hover:bg-navy-50 dark:hover:bg-navy-800",
          "hover:text-navy-800 dark:hover:text-navy-100",
          // Focus/selected
          "focus:bg-navy-600 focus:text-white",
          "data-[state=open]:bg-navy-600 data-[state=open]:text-white",
          // Disabled
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0 [&_svg]:size-4">{icon}</span>}
        <span className="flex-1 truncate">{label}</span>
        <ChevronRightIcon className="ml-auto size-4 shrink-0 opacity-60" />
      </DropdownMenuPrimitive.SubTrigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          data-slot="ims-jui-submenu-content"
          className={cn(
            "ims-jui-submenu",
            "min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
            "bg-white dark:bg-navy-900",
            "border-navy-200 dark:border-navy-700",
            "z-50",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          {items ? <MenuItemsRenderer items={items} onSelect={onSelect} /> : children}
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
}

// ============================================================================
// Internal: MenuItemsRenderer - renders MenuItem[] data
// ============================================================================

interface MenuItemsRendererProps {
  items: MenuItem[];
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

function MenuItemsRenderer({ items, onSelect }: MenuItemsRendererProps) {
  return (
    <>
      {items.map((item, index) => {
        // Separator: item with no label
        if (!item.label && !item.items) {
          return <ImsJuiMenuSeparator key={`sep-${index}`} />;
        }

        // Submenu
        if (item.items && item.items.length > 0) {
          return (
            <ImsJuiSubMenu
              key={item.value ?? `submenu-${index}`}
              label={item.label}
              icon={item.icon ? <span>{item.icon}</span> : undefined}
              disabled={item.disabled}
              items={item.items}
              onSelect={onSelect}
            />
          );
        }

        // Regular menu item
        return (
          <ImsJuiMenuItem
            key={item.value ?? `item-${index}`}
            label={item.label}
            value={item.value}
            icon={item.icon ? <span>{item.icon}</span> : undefined}
            disabled={item.disabled}
            shortcut={item.shortcut}
            data={item.data}
            onSelect={(e) => {
              onSelect?.(e, { item: e.currentTarget as unknown as HTMLElement });
            }}
          />
        );
      })}
    </>
  );
}

// ============================================================================
// Internal: MenuBarItem - renders a MenuItem as a horizontal menu bar item
// ============================================================================

interface MenuBarItemProps {
  item: MenuItem;
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

function MenuBarItem({ item, onSelect }: MenuBarItemProps) {
  const [open, setOpen] = React.useState(false);

  if (item.items && item.items.length > 0) {
    return (
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
        <DropdownMenuPrimitive.Trigger
          asChild
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium",
            "text-white transition-colors duration-100",
            "hover:bg-navy-600 focus:bg-navy-600",
            "focus:outline-none",
            open && "bg-navy-600",
            item.disabled && "opacity-50 pointer-events-none"
          )}
        >
          <div role="menuitem" aria-haspopup="true">
            {item.icon && <span className="shrink-0 [&_svg]:size-4">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={2}
            className={cn(
              "min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
              "bg-white dark:bg-navy-900",
              "border-navy-200 dark:border-navy-700",
              "z-50",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            )}
          >
            <MenuItemsRenderer items={item.items} onSelect={onSelect} />
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }

  return (
    <div
      role="menuitem"
      tabIndex={0}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium",
        "text-white transition-colors duration-100",
        "hover:bg-navy-600 focus:bg-navy-600",
        "focus:outline-none cursor-pointer",
        item.disabled && "opacity-50 pointer-events-none"
      )}
      onClick={(e) => {
        if (item.disabled) return;
        onSelect?.(e, { item: e.currentTarget as unknown as HTMLElement });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (item.disabled) return;
          onSelect?.(e, { item: e.currentTarget as unknown as HTMLElement });
        }
      }}
    >
      {item.icon && <span className="shrink-0 [&_svg]:size-4">{item.icon}</span>}
      <span>{item.label}</span>
      {item.shortcut && (
        <span className="ml-2 text-xs opacity-60">{item.shortcut}</span>
      )}
    </div>
  );
}

// Re-export context for advanced usage
export { ImsJuiMenuContext };
