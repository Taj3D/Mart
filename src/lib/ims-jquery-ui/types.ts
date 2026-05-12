/**
 * IMS jQuery UI Types
 * Replaces jQuery UI 1.12.1 type definitions
 * Maps jQuery UI widget/interaction APIs to TypeScript/React equivalents
 *
 * jQuery UI 1.12.1 components mapped:
 * - Core: widget factory, position, key-code, form-reset-mixin
 * - Interactions: draggable, droppable, resizable, selectable, sortable
 * - Widgets: accordion, autocomplete, button, checkboxradio, controlgroup,
 *            datepicker, dialog, menu, progressbar, selectmenu, slider,
 *            spinner, tabs, tooltip
 * - Effects: blind, bounce, clip, drop, explode, fade, fold, highlight,
 *            puff, pulsate, scale, shake, size, slide, transfer
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

import type * as React from "react";

// ============================================================================
// Core Types (widget.js, key-code.js, position.js)
// ============================================================================

/** jQuery UI widget lifecycle state */
export type WidgetState = "init" | "create" | "refresh" | "destroy" | "disable" | "enable";

/** jQuery UI widget options base */
export interface WidgetOptions {
  /** Whether the widget is disabled */
  disabled?: boolean;
  /** Custom CSS classes */
  classes?: Record<string, string>;
  /** Called when widget is created */
  onCreate?: () => void;
}

/** jQuery UI KeyCode constants - replaces $.ui.keyCode */
export const KeyCode = {
  BACKSPACE: 8,
  COMMA: 188,
  DELETE: 46,
  DOWN: 40,
  END: 35,
  ENTER: 13,
  ESCAPE: 27,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  PERIOD: 190,
  RIGHT: 39,
  SPACE: 32,
  TAB: 9,
  UP: 38,
} as const;

export type KeyCodeValue = (typeof KeyCode)[keyof typeof KeyCode];

// ============================================================================
// Position Types (position.js)
// ============================================================================

export type PositionHorizontal = "left" | "center" | "right";
export type PositionVertical = "top" | "center" | "bottom";

/** jQuery UI position alignment */
export interface PositionAlignment {
  /** Horizontal alignment */
  at: `${PositionVertical} ${PositionHorizontal}`;
  /** Target alignment */
  my: `${PositionVertical} ${PositionHorizontal}`;
  /** Collision handling */
  collision?: "flip" | "fit" | "flipfit" | "none";
  /** Offset from calculated position */
  offset?: string;
  /** Within container */
  within?: HTMLElement | Window;
}

/** Calculated position result */
export interface PositionResult {
  top: number;
  left: number;
  placement: string;
  flipped: boolean;
}

// ============================================================================
// Interaction Types (draggable, droppable, resizable, selectable, sortable)
// ============================================================================

/** Axis constraint for draggable/resizable */
export type AxisConstraint = "x" | "y" | false;

/** Draggable options - replaces $(el).draggable({...}) */
export interface DraggableOptions {
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Constrain to axis */
  axis?: AxisConstraint;
  /** Containment: 'parent', 'window', 'document', or selector */
  containment?: string | HTMLElement | "parent" | "window" | "document";
  /** Cursor style during drag */
  cursor?: string;
  /** Cursor offset from element */
  cursorAt?: { top?: number; left?: number; bottom?: number; right?: number };
  /** Drag handle selector */
  handle?: string;
  /** Cancel drag on these selectors */
  cancel?: string;
  /** Opacity during drag */
  opacity?: number;
  /** Snap to grid [x, y] */
  grid?: [number, number];
  /** Snap to other elements */
  snap?: boolean | string;
  /** Snap tolerance in pixels */
  snapTolerance?: number;
  /** Revert on stop */
  revert?: boolean | "valid" | "invalid";
  /** Revert duration in ms */
  revertDuration?: number;
  /** Z-index during drag */
  zIndex?: number;
  /** Distance before drag starts (px) */
  distance?: number;
  /** Time before drag starts (ms) */
  delay?: number;
  /** Called when drag starts */
  onStart?: (event: DragEvent, ui: DragUIState) => void;
  /** Called during drag */
  onDrag?: (event: DragEvent, ui: DragUIState) => void | false;
  /** Called when drag stops */
  onStop?: (event: DragEvent, ui: DragUIState) => void;
}

/** Drag UI state - replaces $.ui.draggable UI hash */
export interface DragUIState {
  position: { top: number; left: number };
  offset: { top: number; left: number };
  originalPosition: { top: number; left: number };
  originalOffset: { top: number; left: number };
  helper: HTMLElement;
}

/** Droppable options - replaces $(el).droppable({...}) */
export interface DroppableOptions {
  /** Whether droppable is disabled */
  disabled?: boolean;
  /** Accepted draggable selectors */
  accept?: string | ((draggable: HTMLElement) => boolean);
  /** Tolerance mode */
  tolerance?: "fit" | "intersect" | "pointer" | "touch";
  /** CSS class for active state */
  activeClass?: string;
  /** CSS class for hover state */
  hoverClass?: string;
  /** Scope for drag-drop pairing */
  scope?: string;
  /** Greedy - don't propagate to parent droppables */
  greedy?: boolean;
  /** Called when draggable is activated */
  onActivate?: (event: DragEvent, ui: DropUIState) => void;
  /** Called when draggable is deactivated */
  onDeactivate?: (event: DragEvent, ui: DropUIState) => void;
  /** Called when draggable enters */
  onOver?: (event: DragEvent, ui: DropUIState) => void;
  /** Called when draggable leaves */
  onOut?: (event: DragEvent, ui: DropUIState) => void;
  /** Called when draggable is dropped */
  onDrop?: (event: DragEvent, ui: DropUIState) => void;
}

/** Drop UI state - replaces $.ui.droppable UI hash */
export interface DropUIState {
  draggable: HTMLElement;
  helper: HTMLElement;
  position: { top: number; left: number };
  offset: { top: number; left: number };
}

/** Resizable options - replaces $(el).resizable({...}) */
export interface ResizableOptions {
  /** Whether resizable is disabled */
  disabled?: boolean;
  /** Also resize these elements */
  alsoResize?: string | HTMLElement;
  /** Animate resize */
  animate?: boolean;
  /** Animation duration */
  animateDuration?: number | "slow" | "fast";
  /** Animation easing */
  animateEasing?: string;
  /** Aspect ratio constraint */
  aspectRatio?: boolean | number;
  /** Auto-hide handles */
  autoHide?: boolean;
  /** Containment */
  containment?: string | HTMLElement;
  /** Delay before resize starts (ms) */
  delay?: number;
  /** Distance before resize starts (px) */
  distance?: number;
  /** Ghost element during resize */
  ghost?: boolean;
  /** Grid [x, y] */
  grid?: [number, number];
  /** Resize handles */
  handles?: "e,s,se" | "n,e,s,w,ne,se,sw,nw" | "all" | string;
  /** Max width */
  maxWidth?: number;
  /** Max height */
  maxHeight?: number;
  /** Min width */
  minWidth?: number;
  /** Min height */
  minHeight?: number;
  /** Called when resize starts */
  onStart?: (event: MouseEvent, ui: ResizeUIState) => void;
  /** Called during resize */
  onResize?: (event: MouseEvent, ui: ResizeUIState) => void;
  /** Called when resize stops */
  onStop?: (event: MouseEvent, ui: ResizeUIState) => void;
}

/** Resize UI state - replaces $.ui.resizable UI hash */
export interface ResizeUIState {
  element: HTMLElement;
  size: { width: number; height: number };
  position: { top: number; left: number };
  originalSize: { width: number; height: number };
  originalPosition: { top: number; left: number };
}

/** Selectable options - replaces $(el).selectable({...}) */
export interface SelectableOptions {
  /** Whether selectable is disabled */
  disabled?: boolean;
  /** Auto-refresh positions */
  autoRefresh?: boolean;
  /** Cancel selection on these selectors */
  cancel?: string;
  /** Delay before selection (ms) */
  delay?: number;
  /** Distance before selection (px) */
  distance?: number;
  /** Filter selector for selectable children */
  filter?: string;
  /** Tolerance mode */
  tolerance?: "touch" | "fit";
  /** Called when selection starts */
  onStart?: (event: MouseEvent, ui: SelectableUIState) => void;
  /** Called during selection */
  onSelecting?: (event: MouseEvent, ui: SelectableUIState) => void;
  /** Called when item is selected */
  onSelected?: (event: MouseEvent, ui: SelectableUIState) => void;
  /** Called when item is unselected */
  onUnselected?: (event: MouseEvent, ui: SelectableUIState) => void;
  /** Called when selection stops */
  onStop?: (event: MouseEvent, ui: SelectableUIState) => void;
}

/** Selectable UI state */
export interface SelectableUIState {
  selecting: HTMLElement[];
  selected: HTMLElement[];
  unselecting: HTMLElement[];
  unselected: HTMLElement[];
}

/** Sortable options - replaces $(el).sortable({...}) */
export interface SortableOptions<T = unknown> {
  /** Whether sortable is disabled */
  disabled?: boolean;
  /** Append helper to */
  appendTo?: string | HTMLElement;
  /** Axis constraint */
  axis?: AxisConstraint;
  /** Cancel sorting on these selectors */
  cancel?: string;
  /** Connect with other sortable lists */
  connectWith?: string;
  /** Containment */
  containment?: string | HTMLElement;
  /** Cursor style */
  cursor?: string;
  /** Cursor offset */
  cursorAt?: { top?: number; left?: number; bottom?: number; right?: number };
  /** Delay before sort starts (ms) */
  delay?: number;
  /** Distance before sort starts (px) */
  distance?: number;
  /** Drop on empty container */
  dropOnEmpty?: boolean;
  /** Force helper size */
  forceHelperSize?: boolean;
  /** Force placeholder size */
  forcePlaceholderSize?: boolean;
  /** Grid [x, y] */
  grid?: [number, number];
  /** Sortable items selector */
  items?: string;
  /** Opacity during sort */
  opacity?: number;
  /** Placeholder class */
  placeholder?: string;
  /** Revert */
  revert?: boolean | number;
  /** Scroll while sorting */
  scroll?: boolean;
  /** Scroll sensitivity */
  scrollSensitivity?: number;
  /** Scroll speed */
  scrollSpeed?: number;
  /** Tolerance mode */
  tolerance?: "intersect" | "pointer";
  /** Z-index during sort */
  zIndex?: number;
  /** Called when sort starts */
  onStart?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called during sort */
  onSort?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when sort changes */
  onChange?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called before sort stops */
  onBeforeStop?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when sort stops */
  onStop?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when sort updates */
  onUpdate?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when item is received from connected list */
  onReceive?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when item is removed to connected list */
  onRemove?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when list is overloaded */
  onOver?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when list is out */
  onOut?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when sort activates */
  onActivate?: (event: DragEvent, ui: SortUIState<T>) => void;
  /** Called when sort deactivates */
  onDeactivate?: (event: DragEvent, ui: SortUIState<T>) => void;
}

/** Sort UI state - replaces $.ui.sortable UI hash */
export interface SortUIState<T = unknown> {
  item: HTMLElement;
  placeholder: HTMLElement;
  position: { top: number; left: number };
  offset: { top: number; left: number };
  originalPosition: { top: number; left: number };
  originalOffset: { top: number; left: number };
  sender: HTMLElement | null;
  helper: HTMLElement;
  data?: T;
}

// ============================================================================
// Widget Types (accordion, autocomplete, button, checkboxradio, controlgroup,
//               datepicker, dialog, menu, progressbar, selectmenu, slider,
//               spinner, tabs, tooltip)
// ============================================================================

/** Accordion options - replaces $(el).accordion({...}) */
export interface AccordionOptions {
  /** Whether accordion is disabled */
  disabled?: boolean;
  /** Active panel index (0-based), false for none */
  active?: number | false;
  /** Animate panels */
  animate?: boolean | number | "slide" | { easing?: string; duration?: number };
  /** Collapsible - allow closing all panels */
  collapsible?: boolean;
  /** Event to trigger panel change */
  event?: "click" | "mouseover" | string;
  /** Header selector */
  header?: string;
  /** Height style */
  heightStyle?: "auto" | "fill" | "content";
  /** Icons config */
  icons?: {
    header?: string;
    activeHeader?: string;
  };
  /** Called before panel activates */
  onBeforeActivate?: (event: React.MouseEvent, ui: AccordionUIState) => void | false;
  /** Called when panel is activated */
  onActivate?: (event: React.MouseEvent, ui: AccordionUIState) => void;
}

/** Accordion UI state */
export interface AccordionUIState {
  newHeader: HTMLElement | null;
  oldHeader: HTMLElement | null;
  newPanel: HTMLElement | null;
  oldPanel: HTMLElement | null;
}

/** Autocomplete options - replaces $(input).autocomplete({...}) */
export interface AutocompleteOptions<T = unknown> {
  /** Whether autocomplete is disabled */
  disabled?: boolean;
  /** Data source */
  source?: string | T[] | ((request: { term: string }, response: (data: T[]) => void) => void);
  /** Min characters before search */
  minLength?: number;
  /** Delay before search (ms) */
  delay?: number;
  /** Auto-focus first item */
  autoFocus?: boolean;
  /** Append menu to */
  appendTo?: string | HTMLElement;
  /** Position config */
  position?: PositionAlignment;
  /**
   * Maximum number of items visible without scrolling.
   * Scrollable jQuery UI Autocomplete plugin option.
   * When total items exceed this number, the dropdown becomes scrollable
   * with a calculated max-height = itemHeight × maxShowItems + 1px.
   * The dropdown width is automatically compensated for the scrollbar.
   * Default: undefined (no scrollable limit, uses fixed max-height)
   */
  maxShowItems?: number;
  /** Custom item rendering */
  renderItem?: (item: AutocompleteItem<T>) => React.ReactNode;
  /** Called when search begins */
  onSearch?: (event: React.KeyboardEvent, ui: { item?: AutocompleteItem<T> }) => void;
  /** Called when response received */
  onResponse?: (event: React.Event, ui: { content: AutocompleteItem<T>[] }) => void;
  /** Called when focus changes */
  onFocus?: (event: React.FocusEvent, ui: { item: AutocompleteItem<T> }) => void;
  /** Called when item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: AutocompleteItem<T> }) => void;
  /** Called when menu closes */
  onClose?: (event: React.Event) => void;
  /** Called when menu opens */
  onOpen?: (event: React.Event) => void;
  /** Called when input value changes */
  onChange?: (event: React.ChangeEvent, ui: { item: AutocompleteItem<T> | null }) => void;
}

/** Autocomplete item */
export interface AutocompleteItem<T = unknown> {
  label: string;
  value: string;
  data?: T;
  disabled?: boolean;
  group?: string;
}

/** Button options - replaces $(el).button({...}) */
export interface ButtonOptions {
  /** Whether button is disabled */
  disabled?: boolean;
  /** Show label */
  text?: boolean;
  /** Icon classes */
  icons?: { primary?: string; secondary?: string };
  /** Label text */
  label?: string;
  /** Icon position */
  iconPosition?: "beginning" | "end" | "top" | "bottom";
}

/** CheckboxRadio options - replaces $(input).checkboxradio({...}) */
export interface CheckboxRadioOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Show label */
  label?: string;
  /** Icon class */
  icon?: boolean | string;
}

/** ControlGroup options - replaces $(el).controlgroup({...}) */
export interface ControlGroupOptions {
  /** Direction */
  direction?: "horizontal" | "vertical";
  /** Only visible items */
  items?: Record<string, ControlGroupItemOptions>;
  /** Disabled */
  disabled?: boolean;
}

/** ControlGroup item options */
export interface ControlGroupItemOptions {
  classes?: string;
  disabled?: boolean;
  icon?: string;
  label?: string;
  showLabel?: boolean;
}

/** Datepicker options - replaces $(input).datepicker({...}) */
export interface DatepickerOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Animation */
  showAnim?: "show" | "slideDown" | "fadeIn" | "blind" | "bounce" | "clip" | "drop" | "fold" | "slide" | "";
  /** Duration */
  duration?: number | "slow" | "fast" | "";
  /** Date format */
  dateFormat?: string;
  /** Min date */
  minDate?: Date | string | number | null;
  /** Max date */
  maxDate?: Date | string | number | null;
  /** Default date */
  defaultDate?: Date | string | number | null;
  /** First day of week (0=Sunday) */
  firstDay?: number;
  /** Number of months to show */
  numberOfMonths?: number | [number, number];
  /** Show button panel */
  showButtonPanel?: boolean;
  /** Show week numbers */
  showWeek?: boolean;
  /** Change month dropdown */
  changeMonth?: boolean;
  /** Change year dropdown */
  changeYear?: boolean;
  /** Year range */
  yearRange?: string;
  /** Show on focus or button */
  showOn?: "focus" | "button" | "both";
  /** Button text */
  buttonText?: string;
  /** Button icon */
  buttonImage?: string;
  /** Constrain input */
  constrainInput?: boolean;
  /** Regional settings */
  regional?: string;
  /** Before show day callback */
  beforeShowDay?: (date: Date) => [boolean, string?, string?];
  /** Before show callback */
  beforeShow?: (input: HTMLElement, instance: unknown) => { [key: string]: unknown } | void;
  /** Called when date is selected */
  onSelect?: (dateText: string, instance: unknown) => void;
  /** Called when month/year changes */
  onChangeMonthYear?: (year: number, month: number, instance: unknown) => void;
  /** Called when datepicker closes */
  onClose?: (dateText: string, instance: unknown) => void;
}

/** Dialog options - replaces $(el).dialog({...}) */
export interface DialogOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Auto-open */
  autoOpen?: boolean;
  /** Close on escape */
  closeOnEscape?: boolean;
  /** Close text */
  closeText?: string;
  /** Append to */
  appendTo?: string | HTMLElement;
  /** Dialog class */
  dialogClass?: string;
  /** Draggable */
  draggable?: boolean;
  /** Height */
  height?: number | "auto";
  /** Max height */
  maxHeight?: number;
  /** Max width */
  maxWidth?: number;
  /** Min height */
  minHeight?: number;
  /** Min width */
  minWidth?: number;
  /** Modal */
  modal?: boolean;
  /** Position */
  position?: PositionAlignment | { my: string; at: string; of: HTMLElement | string };
  /** Resizable */
  resizable?: boolean;
  /** Width */
  width?: number | "auto";
  /** Title */
  title?: string;
  /** Hide animation */
  hide?: boolean | number | string | object;
  /** Show animation */
  show?: boolean | number | string | object;
  /** Buttons */
  buttons?: DialogButton[];
  /** Called when dialog opens */
  onOpen?: (event: React.Event) => void;
  /** Called when dialog closes */
  onClose?: (event: React.Event) => void;
  /** Called before close (return false to prevent) */
  onBeforeClose?: (event: React.Event) => boolean | void;
  /** Called when dialog is created */
  onCreate?: (event: React.Event) => void;
  /** Called when dialog gains focus */
  onFocus?: (event: React.Event) => void;
  /** Called during drag */
  onDrag?: (event: DragEvent, ui: { position: { top: number; left: number }; offset: { top: number; left: number } }) => void;
  /** Called when drag starts */
  onDragStart?: (event: DragEvent, ui: { position: { top: number; left: number }; offset: { top: number; left: number } }) => void;
  /** Called when drag stops */
  onDragStop?: (event: DragEvent, ui: { position: { top: number; left: number }; offset: { top: number; left: number } }) => void;
  /** Called during resize */
  onResize?: (event: MouseEvent, ui: { size: { width: number; height: number }; position: { top: number; left: number } }) => void;
  /** Called when resize starts */
  onResizeStart?: (event: MouseEvent, ui: { size: { width: number; height: number }; position: { top: number; left: number } }) => void;
  /** Called when resize stops */
  onResizeStop?: (event: MouseEvent, ui: { size: { width: number; height: number }; position: { top: number; left: number } }) => void;
}

/** Dialog button definition */
export interface DialogButton {
  text: string;
  icon?: string;
  class?: string;
  click: () => void;
  disabled?: boolean;
  showText?: boolean;
}

/** Menu options - replaces $(el).menu({...}) */
export interface MenuOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Menu items selector */
  items?: string;
  /** Icons */
  icons?: { submenu?: string };
  /** Role */
  role?: string;
  /** Called when menu blurs */
  onBlur?: (event: React.FocusEvent) => void;
  /** Called when menu item is focused */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

/** Menu item definition */
export interface MenuItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  items?: MenuItem[];
  shortcut?: string;
  data?: unknown;
}

/** Progressbar options - replaces $(el).progressbar({...}) */
export interface ProgressbarOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Maximum value */
  max?: number;
  /** Current value */
  value?: number;
  /** Called when value changes */
  onChange?: (event: React.Event, ui: { value: number }) => void;
  /** Called when progress is complete */
  onComplete?: (event: React.Event, ui: { value: number }) => void;
  /** Called when progress is created */
  onCreate?: (event: React.Event) => void;
}

/** SelectMenu options - replaces $(select).selectmenu({...}) */
export interface SelectMenuOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Append to */
  appendTo?: string | HTMLElement;
  /** Position config */
  position?: PositionAlignment;
  /** Width */
  width?: number | string | null;
  /** Icons */
  icons?: { button?: string };
  /** Called when menu is created */
  onCreate?: (event: React.Event) => void;
  /** Called when selection changes */
  onChange?: (event: React.ChangeEvent, ui: { item: HTMLElement | null }) => void;
  /** Called when menu opens */
  onOpen?: (event: React.Event) => void;
  /** Called when menu closes */
  onClose?: (event: React.Event) => void;
  /** Called when menu item is focused */
  onFocus?: (event: React.FocusEvent, ui: { item: HTMLElement }) => void;
  /** Called when menu item is selected */
  onSelect?: (event: React.KeyboardEvent | React.MouseEvent, ui: { item: HTMLElement }) => void;
}

/** Slider options - replaces $(el).slider({...}) */
export interface SliderOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Animate */
  animate?: boolean | "slow" | "fast" | number;
  /** Maximum value */
  max?: number;
  /** Minimum value */
  min?: number;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Step */
  step?: number;
  /** Current value (or range values) */
  value?: number;
  values?: number[];
  /** Range mode */
  range?: boolean | "min" | "max";
  /** Called when slider value changes */
  onSlide?: (event: MouseEvent | TouchEvent, ui: SliderUIState) => void;
  /** Called when slide starts */
  onStart?: (event: MouseEvent | TouchEvent, ui: SliderUIState) => void;
  /** Called when slide stops */
  onStop?: (event: MouseEvent | TouchEvent, ui: SliderUIState) => void;
  /** Called when slider is created */
  onCreate?: (event: React.Event) => void;
  /** Called when value changes */
  onChange?: (event: MouseEvent | TouchEvent, ui: SliderUIState) => void;
}

/** Slider UI state */
export interface SliderUIState {
  value: number;
  values: number[];
  handle: HTMLElement;
  handleIndex: number;
}

/** Spinner options - replaces $(input).spinner({...}) */
export interface SpinnerOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Cultural format */
  culture?: string;
  /** Increment settings */
  increment?: boolean | number | ((count: number) => number);
  /** Maximum value */
  max?: number | string;
  /** Minimum value */
  min?: number | string;
  /** Number format */
  numberFormat?: string;
  /** Page size for page up/down */
  page?: number;
  /** Step increment */
  step?: number | string;
  /** Called when value changes */
  onSpin?: (event: React.KeyboardEvent | React.MouseEvent, ui: { value: number }) => void;
  /** Called when spin starts */
  onStart?: (event: React.KeyboardEvent | React.MouseEvent, ui: { value: number }) => void;
  /** Called when spin stops */
  onStop?: (event: React.KeyboardEvent | React.MouseEvent, ui: { value: number }) => void;
  /** Called when value changes */
  onChange?: (event: React.ChangeEvent, ui: { value: number }) => void;
}

/** Tabs options - replaces $(el).tabs({...}) */
export interface TabsOptions {
  /** Whether disabled */
  disabled?: boolean | number[];
  /** Active tab index */
  active?: number | false;
  /** Collapsible */
  collapsible?: boolean;
  /** Event to activate tab */
  event?: "click" | "mouseover";
  /** Height style */
  heightStyle?: "auto" | "fill" | "content";
  /** Hide animation */
  hide?: boolean | number | string | object;
  /** Show animation */
  show?: boolean | number | string | object;
  /** Called before tab activates */
  onBeforeActivate?: (event: React.MouseEvent, ui: TabsUIState) => void | false;
  /** Called when tab is activated */
  onActivate?: (event: React.MouseEvent, ui: TabsUIState) => void;
  /** Called before tab loads (AJAX) */
  onBeforeLoad?: (event: React.MouseEvent, ui: TabsLoadUIState) => void;
  /** Called when tab loads */
  onLoad?: (event: React.MouseEvent, ui: TabsLoadUIState) => void;
  /** Called when tab is created */
  onCreate?: (event: React.MouseEvent, ui: TabsUIState) => void;
}

/** Tabs UI state */
export interface TabsUIState {
  newTab: HTMLElement;
  oldTab: HTMLElement;
  newPanel: HTMLElement;
  oldPanel: HTMLElement;
}

/** Tabs load UI state */
export interface TabsLoadUIState extends TabsUIState {
  tab: HTMLElement;
  panel: HTMLElement;
  ajaxSettings: XMLHttpRequest;
}

/** Tooltip options - replaces $(el).tooltip({...}) */
export interface TooltipOptions {
  /** Whether disabled */
  disabled?: boolean;
  /** Content */
  content?: string | (() => string);
  /** Content function */
  items?: string;
  /** Show animation */
  show?: boolean | number | string | object;
  /** Hide animation */
  hide?: boolean | number | string | object;
  /** Track mouse */
  track?: boolean;
  /** Position config */
  position?: PositionAlignment;
  /** Tooltip class */
  tooltipClass?: string;
  /** Called when tooltip opens */
  onOpen?: (event: React.Event, ui: { tooltip: HTMLElement }) => void;
  /** Called when tooltip closes */
  onClose?: (event: React.Event, ui: { tooltip: HTMLElement }) => void;
}

// ============================================================================
// Effects Types
// ============================================================================

/** jQuery UI effect names */
export type EffectName =
  | "blind"
  | "bounce"
  | "clip"
  | "drop"
  | "explode"
  | "fade"
  | "fold"
  | "highlight"
  | "puff"
  | "pulsate"
  | "scale"
  | "shake"
  | "size"
  | "slide"
  | "transfer";

/** Effect direction */
export type EffectDirection = "up" | "down" | "left" | "right";

/** Effect options - replaces $(el).effect(name, options, duration, callback) */
export interface EffectOptions {
  /** Effect direction */
  direction?: EffectDirection;
  /** Distance (px) */
  distance?: number;
  /** Number of times to repeat */
  times?: number;
  /** Mode: 'show', 'hide', or 'effect' (default) */
  mode?: "show" | "hide" | "effect";
  /** Easing function */
  easing?: string;
  /** Percent for scale/puff */
  percent?: number;
  /** Origin for scale */
  origin?: ["top" | "middle" | "bottom", "left" | "center" | "right"];
  /** Scale mode */
  scale?: "both" | "box" | "content";
  /** Size effect target dimensions */
  to?: { width: number; height: number };
  /** Transfer target selector */
  toSelector?: string;
  /** Transfer class name */
  className?: string;
}

/** Animation configuration */
export interface AnimationConfig {
  keyframes: Keyframe[];
  duration: number;
  easing?: string;
  fill?: FillMode;
  delay?: number;
  iterations?: number;
  direction?: PlaybackDirection;
}

// ============================================================================
// Event Map - jQuery UI widget events
// ============================================================================

export interface JQueryUIEventMap {
  // Accordion
  "accordionbeforeactivate": { newHeader: HTMLElement | null; oldHeader: HTMLElement | null; newPanel: HTMLElement | null; oldPanel: HTMLElement | null };
  "accordionactivate": { newHeader: HTMLElement | null; oldHeader: HTMLElement | null; newPanel: HTMLElement | null; oldPanel: HTMLElement | null };
  // Autocomplete
  "autocompletesearch": { item?: AutocompleteItem };
  "autocompleteresponse": { content: AutocompleteItem[] };
  "autocompleteselect": { item: AutocompleteItem };
  "autocompletechange": { item: AutocompleteItem | null };
  "autocompleteopen": void;
  "autocompleteclose": void;
  "autocompletefocus": { item: AutocompleteItem };
  // Dialog
  "dialogopen": void;
  "dialogclose": void;
  "dialogbeforeclose": void;
  "dialogfocus": void;
  "dialogdragstart": { position: { top: number; left: number }; offset: { top: number; left: number } };
  "dialogdrag": { position: { top: number; left: number }; offset: { top: number; left: number } };
  "dialogdragstop": { position: { top: number; left: number }; offset: { top: number; left: number } };
  "dialogresizestart": { size: { width: number; height: number }; position: { top: number; left: number } };
  "dialogresize": { size: { width: number; height: number }; position: { top: number; left: number } };
  "dialogresizestop": { size: { width: number; height: number }; position: { top: number; left: number } };
  // Slider
  "sliderstart": SliderUIState;
  "sliderslide": SliderUIState;
  "sliderstop": SliderUIState;
  "sliderchange": SliderUIState;
  // Spinner
  "spinnerspin": { value: number };
  "spinnerstart": { value: number };
  "spinnerstop": { value: number };
  "spinnerchange": { value: number };
  // Tabs
  "tabsbeforeactivate": TabsUIState;
  "tabsactivate": TabsUIState;
  "tabsbeforeload": TabsLoadUIState;
  "tabsload": TabsLoadUIState;
  // Tooltip
  "tooltipopen": { tooltip: HTMLElement };
  "tooltipclose": { tooltip: HTMLElement };
  // Progressbar
  "progressbarchange": { value: number };
  "progressbarcomplete": { value: number };
  // Sortable
  "sortstart": SortUIState;
  "sortsort": SortUIState;
  "sortchange": SortUIState;
  "sortbeforestop": SortUIState;
  "sortstop": SortUIState;
  "sortupdate": SortUIState;
  "sortreceive": SortUIState;
  "sortremove": SortUIState;
  "sortover": SortUIState;
  "sortout": SortUIState;
  "sortactivate": SortUIState;
  "sortdeactivate": SortUIState;
  // Draggable
  "dragstart": DragUIState;
  "drag": DragUIState;
  "dragstop": DragUIState;
  // Droppable
  "dropactivate": DropUIState;
  "dropdeactivate": DropUIState;
  "dropover": DropUIState;
  "dropout": DropUIState;
  "drop": DropUIState;
  // Resizable
  "resizestart": ResizeUIState;
  "resize": ResizeUIState;
  "resizestop": ResizeUIState;
  // Selectable
  "selectablestart": void;
  "selectableselecting": { selecting: HTMLElement[] };
  "selectableselected": { selected: HTMLElement[] };
  "selectableunselecting": { unselecting: HTMLElement[] };
  "selectableunselected": { unselected: HTMLElement[] };
  "selectablestop": void;
}

/** Callback type for jQuery UI events */
export type JQueryUICallback<T extends keyof JQueryUIEventMap = keyof JQueryUIEventMap> =
  T extends keyof JQueryUIEventMap
    ? JQueryUIEventMap[T] extends void
      ? () => void
      : (event: JQueryUIEventMap[T]) => void
    : never;
