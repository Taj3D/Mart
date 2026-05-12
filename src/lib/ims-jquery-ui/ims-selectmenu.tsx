/**
 * IMS jQuery UI SelectMenu Component
 * Replaces jQuery UI 1.12.1 selectmenu.js
 *
 * Features:
 * - Custom styled select dropdown with Deep Navy Blue theme
 * - Append to option (where dropdown renders)
 * - Position config (uses position utilities)
 * - Custom width
 * - Icons in options
 * - Optgroup support
 * - Disabled state
 * - Custom rendering of selected option
 * - Events: onCreate, onChange, onOpen, onClose, onFocus, onSelect
 *
 * Trigger button uses --navy-600 border, focused state uses --navy-500 ring.
 * Selected item in dropdown uses --navy-600 background with white text.
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectMenuOptions, PositionAlignment } from "./types";

// ============================================================================
// SelectMenu Context
// ============================================================================

interface ImsJuiSelectMenuContextValue {
  /** Whether the select menu is disabled */
  disabled: boolean;
  /** Custom width */
  width?: number | string | null;
  /** Position config */
  position?: PositionAlignment;
  /** Called when selection changes */
  onChange?: (event: React.SyntheticEvent, ui: { item: HTMLElement | null }) => void;
  /** Called when the menu opens */
  onOpen?: (event: React.SyntheticEvent) => void;
  /** Called when the menu closes */
  onClose?: (event: React.SyntheticEvent) => void;
  /** Called when a menu item is focused */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when a menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

const ImsJuiSelectMenuContext = React.createContext<ImsJuiSelectMenuContextValue | null>(null);

function useImsJuiSelectMenuContext(): ImsJuiSelectMenuContextValue | null {
  return React.useContext(ImsJuiSelectMenuContext);
}

// ============================================================================
// ImsJuiSelectMenu (Main Component)
// ============================================================================

export interface ImsJuiSelectMenuProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Root>, "onValueChange" | "defaultValue" | "className">,
    Omit<SelectMenuOptions, "onChange" | "onOpen" | "onClose" | "onFocus" | "onSelect"> {
  /** Selected value (controlled) */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Called when value changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom width for the trigger */
  width?: number | string | null;
  /** Custom rendering of the selected option display */
  renderValue?: (value: string, label: string) => React.ReactNode;
  /** Name for form submission */
  name?: string;
  /** Custom className for the trigger */
  className?: string;
  /** Children (ImsJuiSelectMenuOption / ImsJuiSelectMenuGroup) */
  children?: React.ReactNode;
  /** Whether disabled */
  disabled?: boolean;
  /** Append to */
  appendTo?: string | HTMLElement;
  /** Position config */
  position?: PositionAlignment;
  /** Icons */
  icons?: { button?: string };
  /** Called when menu is created */
  onCreate?: (event: React.SyntheticEvent) => void;
  /** Called when selection changes */
  onChange?: (event: React.SyntheticEvent, ui: { item: HTMLElement | null }) => void;
  /** Called when menu opens */
  onOpen?: (event: React.SyntheticEvent) => void;
  /** Called when menu closes */
  onClose?: (event: React.SyntheticEvent) => void;
  /** Called when menu item is focused */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

export function ImsJuiSelectMenu({
  disabled = false,
  appendTo,
  position,
  width,
  icons,
  onCreate,
  onChange,
  onOpen,
  onClose,
  onFocus,
  onSelect,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = "Select...",
  renderValue,
  name,
  className,
  children,
  ...props
}: ImsJuiSelectMenuProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Fire onCreate on mount
  React.useEffect(() => {
    onCreate?.({} as React.SyntheticEvent);
  }, [onCreate]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      onChange?.({} as React.SyntheticEvent, { item: null });
    },
    [isControlled, onValueChange, onChange]
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        onOpen?.({} as React.SyntheticEvent);
      } else {
        onClose?.({} as React.SyntheticEvent);
      }
    },
    [onOpen, onClose]
  );

  // Compute trigger width style
  const widthStyle: React.CSSProperties = {};
  if (width !== undefined && width !== null) {
    if (typeof width === "number") {
      widthStyle.width = `${width}px`;
    } else {
      widthStyle.width = width;
    }
  }

  const contextValue = React.useMemo<ImsJuiSelectMenuContextValue>(
    () => ({
      disabled,
      width,
      position,
      onChange,
      onOpen,
      onClose,
      onFocus,
      onSelect,
    }),
    [disabled, width, position, onChange, onOpen, onClose, onFocus, onSelect]
  );

  return (
    <ImsJuiSelectMenuContext.Provider value={contextValue}>
      <SelectPrimitive.Root
        value={currentValue || undefined}
        defaultValue={defaultValue || undefined}
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        name={name}
        {...props}
      >
        {/* Trigger Button */}
        <ImsJuiSelectMenuTrigger
          ref={triggerRef}
          renderValue={renderValue}
          placeholder={placeholder}
          icons={icons}
          className={className}
          style={widthStyle}
        />

        {/* Dropdown Content */}
        <ImsJuiSelectMenuContent appendTo={appendTo}>
          {children}
        </ImsJuiSelectMenuContent>
      </SelectPrimitive.Root>
    </ImsJuiSelectMenuContext.Provider>
  );
}

// ============================================================================
// ImsJuiSelectMenuTrigger (Internal - Styled Trigger)
// ============================================================================

interface ImsJuiSelectMenuTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  placeholder?: string;
  renderValue?: (value: string, label: string) => React.ReactNode;
  icons?: { button?: string };
}

const ImsJuiSelectMenuTrigger = React.forwardRef<HTMLButtonElement, ImsJuiSelectMenuTriggerProps>(
  ({ placeholder, renderValue, icons, className, style, ...props }, ref) => {
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="ims-jui-selectmenu-trigger"
        className={cn(
          "ims-jui-selectmenu-button",
          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm",
          "border border-[var(--navy-600,#1e3a5f)]",
          "bg-white dark:bg-navy-900",
          "text-navy-800 dark:text-navy-100",
          "shadow-xs transition-[color,box-shadow] outline-none",
          // Hover
          "hover:border-[var(--navy-700,#162d4a)]",
          "hover:bg-navy-50/50 dark:hover:bg-navy-800",
          // Focus - navy-500 ring
          "focus-visible:ring-[3px] focus-visible:ring-[var(--navy-500,#2a5a8f)]",
          "focus-visible:border-[var(--navy-500,#2a5a8f)]",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Placeholder
          "data-[placeholder]:text-muted-foreground",
          className
        )}
        style={style}
        {...props}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 shrink-0 opacity-60 text-[var(--navy-600,#1e3a5f)]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);
ImsJuiSelectMenuTrigger.displayName = "ImsJuiSelectMenuTrigger";

// ============================================================================
// ImsJuiSelectMenuContent (Internal - Styled Dropdown)
// ============================================================================

interface ImsJuiSelectMenuContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content> {
  appendTo?: string | HTMLElement;
}

function ImsJuiSelectMenuContent({
  appendTo,
  className,
  children,
  ...props
}: ImsJuiSelectMenuContentProps) {
  // Use position from context if available
  const ctx = useImsJuiSelectMenuContext();

  // Determine portal container for appendTo
  const portalContainer = React.useMemo(() => {
    if (!appendTo) return undefined;
    if (typeof appendTo === "string") {
      if (typeof document !== "undefined") {
        return document.querySelector(appendTo);
      }
      return undefined;
    }
    return appendTo;
  }, [appendTo]);

  const content = (
    <SelectPrimitive.Content
      data-slot="ims-jui-selectmenu-content"
      className={cn(
        "ims-jui-selectmenu-menu",
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-lg",
        // Deep Navy Blue themed dropdown
        "bg-white dark:bg-navy-900",
        "border-[var(--navy-300,#3d6098)] dark:border-[var(--navy-700,#162d4a)]",
        // Animation
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        className
      )}
      position="popper"
      sideOffset={4}
      align={ctx?.position ? undefined : "start"}
      onCloseAutoFocus={(e) => {
        // Prevent focus from returning to trigger on close (jQuery UI behavior)
        e.preventDefault();
      }}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          "h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  );

  if (portalContainer) {
    return (
      <SelectPrimitive.Portal container={portalContainer}>
        {content}
      </SelectPrimitive.Portal>
    );
  }

  return <SelectPrimitive.Portal>{content}</SelectPrimitive.Portal>;
}

// ============================================================================
// ImsJuiSelectMenuOption (Individual Option)
// ============================================================================

export interface ImsJuiSelectMenuOptionProps
  extends Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "value"> {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Custom data payload */
  data?: unknown;
  /** Custom className */
  className?: string;
  /** Children (for custom rendering) */
  children?: React.ReactNode;
}

export function ImsJuiSelectMenuOption({
  value,
  label,
  icon,
  disabled = false,
  data,
  className,
  children,
  ...props
}: ImsJuiSelectMenuOptionProps) {
  const ctx = useImsJuiSelectMenuContext();

  const handleFocus = React.useCallback(
    (e: React.FocusEvent) => {
      if (ctx?.onFocus) {
        ctx.onFocus(e, { item: e.currentTarget as unknown as HTMLElement });
      }
    },
    [ctx]
  );

  const handleSelect = React.useCallback(
    (e: React.SyntheticEvent) => {
      if (ctx?.onSelect) {
        ctx.onSelect(e as React.KeyboardEvent, { item: e.currentTarget as unknown as HTMLElement });
      }
    },
    [ctx]
  );

  return (
    <SelectPrimitive.Item
      data-slot="ims-jui-selectmenu-item"
      value={value}
      disabled={disabled}
      data-data={data}
      onFocus={handleFocus}
      onSelect={handleSelect as unknown as (e: React.SyntheticEvent) => void}
      className={cn(
        "ims-jui-selectmenu-item",
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none",
        "select-none transition-colors duration-100",
        // Hover
        "hover:bg-navy-50 dark:hover:bg-navy-800",
        "hover:text-navy-800 dark:hover:text-navy-100",
        // Focus / Selected - navy-600 background with white text
        "focus:bg-[var(--navy-600,#1e3a5f)] focus:text-white",
        "data-[highlighted]:bg-[var(--navy-600,#1e3a5f)] data-[highlighted]:text-white",
        // Disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span className="shrink-0 [&_svg]:size-4">{icon}</span>
      )}

      {/* Label */}
      <SelectPrimitive.ItemText>
        {children ?? label}
      </SelectPrimitive.ItemText>

      {/* Check indicator */}
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

// ============================================================================
// ImsJuiSelectMenuGroup (Option Group / Optgroup)
// ============================================================================

export interface ImsJuiSelectMenuGroupProps extends React.ComponentProps<typeof SelectPrimitive.Group> {
  /** Group label (like <optgroup label="...">) */
  label: string;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Children (ImsJuiSelectMenuOption) */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function ImsJuiSelectMenuGroup({
  label,
  disabled = false,
  children,
  className,
  ...props
}: ImsJuiSelectMenuGroupProps) {
  return (
    <SelectPrimitive.Group
      data-slot="ims-jui-selectmenu-group"
      className={cn(
        "ims-jui-selectmenu-optgroup",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Group Label */}
      <SelectPrimitive.Label
        className={cn(
          "ims-jui-selectmenu-optgroup-label",
          "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider",
          "text-[var(--navy-600,#1e3a5f)] dark:text-[var(--navy-300,#6d9ecb)]",
          "select-none"
        )}
      >
        {label}
      </SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  );
}

// ============================================================================
// ImsJuiSelectMenuSeparator
// ============================================================================

export type ImsJuiSelectMenuSeparatorProps = React.ComponentProps<typeof SelectPrimitive.Separator>;

export function ImsJuiSelectMenuSeparator({
  className,
  ...props
}: ImsJuiSelectMenuSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="ims-jui-selectmenu-separator"
      className={cn(
        "ims-jui-selectmenu-separator",
        "-mx-1 my-1 h-px",
        "bg-[var(--navy-200,#a8c4dd)] dark:bg-[var(--navy-700,#162d4a)]",
        "pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// Internal Scroll Buttons
// ============================================================================

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        "text-[var(--navy-600,#1e3a5f)]",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        "text-[var(--navy-600,#1e3a5f)]",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

// ============================================================================
// Data-Driven Option Rendering Helper
// ============================================================================

export interface SelectMenuOptionData {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Disabled */
  disabled?: boolean;
  /** Custom data */
  data?: unknown;
}

export interface SelectMenuGroupData {
  /** Group label */
  label: string;
  /** Group options */
  options: SelectMenuOptionData[];
  /** Disabled */
  disabled?: boolean;
}

export interface ImsJuiSelectMenuDataProps extends ImsJuiSelectMenuProps {
  /** Flat list of options (no grouping) */
  options?: SelectMenuOptionData[];
  /** Grouped options */
  groups?: SelectMenuGroupData[];
}

/**
 * Convenience component that renders options from data arrays.
 * Supports both flat `options` and grouped `groups` props.
 */
export function ImsJuiSelectMenuData({
  options,
  groups,
  children,
  ...props
}: ImsJuiSelectMenuDataProps) {
  return (
    <ImsJuiSelectMenu {...props}>
      {children}
      {groups &&
        groups.map((group) => (
          <ImsJuiSelectMenuGroup
            key={group.label}
            label={group.label}
            disabled={group.disabled}
          >
            {group.options.map((opt) => (
              <ImsJuiSelectMenuOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
                icon={opt.icon}
                disabled={opt.disabled}
                data={opt.data}
              />
            ))}
          </ImsJuiSelectMenuGroup>
        ))}
      {!groups &&
        options?.map((opt) => (
          <ImsJuiSelectMenuOption
            key={opt.value}
            value={opt.value}
            label={opt.label}
            icon={opt.icon}
            disabled={opt.disabled}
            data={opt.data}
          />
        ))}
    </ImsJuiSelectMenu>
  );
}

// Re-export context for advanced usage
export { ImsJuiSelectMenuContext };
