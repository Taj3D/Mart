/**
 * IMS jQuery UI Module
 * Replaces jQuery UI 1.12.1 library with React/TypeScript equivalents
 *
 * Original jQuery UI 1.12.1 components mapped to React:
 * - Core: widget.js → React component pattern with hooks
 * - Core: position.js → position.ts + usePosition hook
 * - Core: key-code.js → KeyCode constants
 * - Core: disable-selection.js → useDisableSelection hook
 * - Core: focusable.js → useFocusable hook
 * - Core: tabbable.js → useTabbable hook
 * - Core: labels.js → useLabels hook
 * - Core: scroll-parent.js → useScrollParent hook
 * - Core: unique-id.js → useUniqueId hook
 * - Core: form-reset-mixin.js → useFormReset hook
 * - Interaction: draggable.js → useDraggable hook
 * - Interaction: droppable.js → useDroppable hook
 * - Interaction: resizable.js → useResizable hook
 * - Interaction: selectable.js → useSelectable hook
 * - Interaction: sortable.js → useSortable hook
 * - Widget: accordion.js → ImsJuiAccordion, ImsJuiAccordionPanel
 * - Widget: autocomplete.js → ImsJuiAutocomplete, ImsJuiAutocompleteOption
 * - Widget: autocomplete-scroll.js → ScrollableAutocomplete, useScrollableDropdown (File 24)
 * - Widget: button.js → ImsJuiButton
 * - Widget: checkboxradio.js → ImsJuiCheckboxRadio
 * - Widget: controlgroup.js → ImsJuiControlGroup
 * - Widget: datepicker.js → ImsJuiDatepicker, ImsJuiDatepickerInput
 * - Widget: dialog.js → ImsJuiDialog, ImsJuiDialogHeader, ImsJuiDialogBody, ImsJuiDialogFooter
 * - Widget: menu.js → ImsJuiMenu, ImsJuiMenuBar, ImsJuiMenuItem
 * - Widget: progressbar.js → ImsJuiProgressbar
 * - Widget: selectmenu.js → ImsJuiSelectMenu, ImsJuiSelectMenuOption
 * - Widget: slider.js → ImsJuiSlider
 * - Widget: spinner.js → ImsJuiSpinner
 * - Widget: tabs.js → ImsJuiTabs, ImsJuiTabList, ImsJuiTab, ImsJuiTabPanel
 * - Widget: tooltip.js → ImsJuiTooltip, ImsJuiPopover
 * - Effects: blind, bounce, clip, drop, explode, fade, fold, highlight,
 *            puff, pulsate, scale, shake, size, slide, transfer → effects.ts
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

// ============================================================================
// Types
// ============================================================================
export type {
  WidgetState,
  WidgetOptions,
  PositionHorizontal,
  PositionVertical,
  PositionAlignment,
  PositionResult,
  AxisConstraint,
  DraggableOptions,
  DragUIState,
  DroppableOptions,
  DropUIState,
  ResizableOptions,
  ResizeUIState,
  SelectableOptions,
  SelectableUIState,
  SortableOptions,
  SortUIState,
  AccordionOptions,
  AccordionUIState,
  AutocompleteOptions,
  AutocompleteItem,
  ButtonOptions,
  CheckboxRadioOptions,
  ControlGroupOptions,
  ControlGroupItemOptions,
  DatepickerOptions,
  DialogOptions,
  DialogButton,
  MenuOptions,
  MenuItem,
  ProgressbarOptions,
  SelectMenuOptions,
  SliderOptions,
  SliderUIState,
  SpinnerOptions,
  TabsOptions,
  TabsUIState,
  TabsLoadUIState,
  TooltipOptions,
  EffectName,
  EffectDirection,
  EffectOptions,
  AnimationConfig,
  JQueryUIEventMap,
  JQueryUICallback,
} from "./types";

export { KeyCode } from "./types";
export type { KeyCodeValue } from "./types";

// ============================================================================
// Position Utilities (position.js)
// ============================================================================
export {
  parsePositionString,
  calculatePosition,
  PositionPresets,
  calculateArrowPosition,
} from "./position";

export type {
  ParsedPosition,
  CalculatePositionOptions,
  ArrowPosition,
} from "./position";

// ============================================================================
// Interaction Hooks (draggable.js, droppable.js, resizable.js, selectable.js, sortable.js)
// ============================================================================
export {
  // draggable.js
  useDraggable,
  // droppable.js
  useDroppable,
  // resizable.js
  useResizable,
  // selectable.js
  useSelectable,
  // sortable.js
  useSortable,
  // position.js
  usePosition,
} from "./hooks";

export type {
  UseDraggableOptions,
  UseDraggableReturn,
  UseDroppableOptions,
  UseDroppableReturn,
  UseResizableOptions,
  UseResizableReturn,
  UseSelectableOptions,
  UseSelectableReturn,
  UseSortableOptions,
  UseSortableReturn,
  UsePositionOptions,
  UsePositionReturn,
} from "./hooks";

// ============================================================================
// Core Utility Hooks (disable-selection.js, focusable.js, tabbable.js, etc.)
// ============================================================================
export {
  // disable-selection.js
  useDisableSelection,
  // focusable.js
  useFocusable,
  // tabbable.js
  useTabbable,
  // labels.js
  useLabels,
  // scroll-parent.js
  useScrollParent,
  // unique-id.js
  useUniqueId,
  // form-reset-mixin.js
  useFormReset,
} from "./hooks";

// ============================================================================
// Accordion Widget (accordion.js)
// ============================================================================
export {
  ImsJuiAccordion,
  ImsJuiAccordionPanel,
  ImsJuiAccordionContext,
  useImsJuiAccordion,
} from "./ims-accordion";

// ============================================================================
// Autocomplete Widget (autocomplete.js)
// ============================================================================
export {
  ImsJuiAutocomplete,
  ImsJuiAutocompleteOption,
  ImsJuiAutocompleteGroup,
} from "./ims-autocomplete";

// ============================================================================
// Scrollable Autocomplete Plugin (jquery-ui-autocomplete-scroll - File 24)
// Replaces: https://anseki.github.io/jquery-ui-autocomplete-scroll/
// Adds maxShowItems option with dynamic max-height and scrollbar compensation
// ============================================================================
export {
  // Hook for scrollable dropdown behavior
  useScrollableDropdown,
  // Enhanced autocomplete with scrollable dropdown
  ScrollableAutocomplete,
  // Standalone scrollable dropdown wrapper
  ImsScrollableDropdown,
  // Utility functions
  getScrollbarWidth,
  calculateScrollableMaxHeight,
} from "./scrollable-autocomplete";

export type {
  UseScrollableDropdownOptions,
  UseScrollableDropdownReturn,
  ScrollableAutocompleteProps,
  ImsScrollableDropdownProps,
} from "./scrollable-autocomplete";

// ============================================================================
// Datepicker Widget (datepicker.js)
// ============================================================================
export {
  ImsJuiDatepicker,
  ImsJuiDatepickerInput,
  ImsJuiDatepickerButton,
} from "./ims-datepicker";

// ============================================================================
// Dialog Widget (dialog.js)
// ============================================================================
export {
  ImsJuiDialog,
  ImsJuiDialogHeader,
  ImsJuiDialogBody,
  ImsJuiDialogFooter,
  ImsJuiDialogTitle,
  ImsJuiDialogClose,
} from "./ims-dialog";

// ============================================================================
// Slider Widget (slider.js)
// ============================================================================
export {
  ImsJuiSlider,
  ImsJuiSliderLabel,
} from "./ims-slider";

// ============================================================================
// Spinner Widget (spinner.js)
// ============================================================================
export {
  ImsJuiSpinner,
} from "./ims-spinner";

// ============================================================================
// Tabs Widget (tabs.js)
// ============================================================================
export {
  ImsJuiTabs,
  ImsJuiTabList,
  ImsJuiTab,
  ImsJuiTabPanel,
} from "./ims-tabs";

// ============================================================================
// Tooltip/Popover Widget (tooltip.js / popover.js)
// ============================================================================
export {
  ImsJuiTooltip,
  ImsJuiPopover,
} from "./ims-tooltip";

// ============================================================================
// Progressbar Widget (progressbar.js)
// ============================================================================
export {
  ImsJuiProgressbar,
} from "./ims-progressbar";

// ============================================================================
// Menu Widget (menu.js)
// ============================================================================
export {
  ImsJuiMenu,
  ImsJuiMenuBar,
  ImsJuiMenuItem,
  ImsJuiMenuSeparator,
  ImsJuiSubMenu,
} from "./ims-menu";

// ============================================================================
// SelectMenu Widget (selectmenu.js)
// ============================================================================
export {
  ImsJuiSelectMenu,
  ImsJuiSelectMenuOption,
  ImsJuiSelectMenuGroup,
  ImsJuiSelectMenuSeparator,
  ImsJuiSelectMenuData,
} from "./ims-selectmenu";

// ============================================================================
// Button/CheckboxRadio/ControlGroup Widgets (button.js, checkboxradio.js, controlgroup.js)
// ============================================================================
export {
  ImsJuiButton,
  ImsJuiCheckboxRadio,
  ImsJuiCheckboxRadioGroup,
  ImsJuiControlGroup,
  ImsJuiControlGroupItem,
  ImsJuiControlGroupLabel,
  ImsJuiControlGroupSeparator,
} from "./ims-button";

// ============================================================================
// Effects (effects.js + all 15 effects)
// ============================================================================
export {
  // Core effect functions
  animateEffect,
  showEffect,
  hideEffect,
  toggleClassEffect,
  // Individual effects
  effectBlind,
  effectBounce,
  effectClip,
  effectDrop,
  effectExplode,
  effectFade,
  effectFold,
  effectHighlight,
  effectPuff,
  effectPulsate,
  effectScale,
  effectShake,
  effectSize,
  effectSlide,
  effectTransfer,
  // React hooks
  useJuiEffect,
  useEffectAnimation,
  // CSS class constants
  CSS_CLASSES,
} from "./effects";
