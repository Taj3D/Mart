/**
 * IMS Bootstrap Module
 * Replaces Bootstrap 3.0.0 JavaScript library with React/TypeScript equivalents
 *
 * Original Bootstrap JS components mapped to React:
 * - transition.js → useTransitionSupport, useEmulateTransitionEnd hooks
 * - alert.js → ImsDismissAlert, ImsAlertLink, ImsAlertHeading components
 * - button.js → ImsLoadingButton, ImsToggleButton, ImsButtonToolbar components
 * - carousel.js → ImsCarousel, ImsCarouselItem, ImsCarouselCaption, ImsCarouselIndicators, ImsCarouselControl
 * - collapse.js → ImsCollapse, ImsCollapseTrigger, ImsAccordion, ImsAccordionPanel components
 * - dropdown.js → useDropdownKeyboard, useOutsideClick hooks (shadcn/ui DropdownMenu for rendering)
 * - modal.js → ImsModal, ImsModalOverlay, ImsModalHeader, ImsModalBody, ImsModalFooter, ImsModalTitle
 * - tooltip.js → useTooltipPosition hook + getPosition, getCalculatedOffset, autoPlacement, applyPlacement utils
 * - popover.js → (extends tooltip.js) useTooltipPosition with wider default placement
 * - scrollspy.js → useScrollSpy hook
 * - tab.js → ImsTabs, ImsTabNav, ImsTabItem, ImsTabDropdown, ImsTabContent, ImsTabPane
 * - affix.js → useAffix hook
 *
 * Additional hooks replacing Bootstrap behaviors:
 * - useEscapeKey → Modal/dropdown escape handling
 * - useBodyScrollLock → Modal body scroll lock
 * - useFocusTrap → Modal focus trap
 * - useAutoPlay → Carousel auto-play
 * - useDismiss → Alert dismiss with animation
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

// ============================================================================
// Types
// ============================================================================
export type {
  TransitionEndEvent,
  TransitionSupport,
  ImsAlertProps,
  ButtonState,
  ImsLoadingButtonProps,
  ImsCarouselProps,
  CarouselState,
  ImsCollapseProps,
  ImsDropdownProps,
  ImsModalProps,
  TooltipPlacement,
  ImsTooltipProps,
  ImsPopoverProps,
  ImsScrollSpyProps,
  ScrollSpyEntry,
  ImsTabsProps,
  AffixState,
  ImsAffixProps,
  BootstrapEventMap,
  BootstrapEventCallback,
} from "./types";

// ============================================================================
// Hooks (replacing Bootstrap JS behaviors)
// ============================================================================
export {
  // transition.js
  useTransitionSupport,
  useEmulateTransitionEnd,
  // scrollspy.js
  useScrollSpy,
  // affix.js
  useAffix,
  // alert.js dismiss
  useDismiss,
  // modal.js escape
  useEscapeKey,
  // dropdown.js outside click
  useOutsideClick,
  // modal.js body scroll lock
  useBodyScrollLock,
  // modal.js focus trap
  useFocusTrap,
  // carousel.js auto-play
  useAutoPlay,
  // dropdown.js keyboard
  useDropdownKeyboard,
} from "./hooks";

export type {
  UseScrollSpyOptions,
  UseScrollSpyReturn,
  UseAffixOptions,
  UseAffixReturn,
  UseDismissOptions,
  UseEscapeKeyOptions,
  UseOutsideClickOptions,
  UseFocusTrapOptions,
  UseAutoPlayOptions,
  UseDropdownKeyboardOptions,
} from "./hooks";

// ============================================================================
// Carousel Components (carousel.js)
// ============================================================================
export {
  ImsCarousel,
  ImsCarouselItem,
  ImsCarouselCaption,
  ImsCarouselIndicators,
  ImsCarouselControl,
  ImsCarouselContext,
  useImsCarousel,
} from "./ims-carousel";

export type { ImsCarouselControlProps } from "./ims-carousel";

// ============================================================================
// Alert Components (alert.js)
// ============================================================================
export {
  ImsDismissAlert,
  ImsAlertLink,
  ImsAlertHeading,
} from "./ims-alert";

// ============================================================================
// Button Components (button.js)
// ============================================================================
export {
  ImsLoadingButton,
  ImsToggleButton,
  ImsButtonToolbar,
} from "./ims-button";

export type {
  ImsLoadingButtonPropsExtended,
  ImsToggleButtonProps,
  ImsButtonToolbarProps,
} from "./ims-button";

// ============================================================================
// Collapse Components (collapse.js)
// ============================================================================
export {
  ImsCollapse,
  ImsCollapseTrigger,
  ImsAccordion,
  ImsAccordionPanel,
} from "./ims-collapse";

export type {
  ImsCollapseTriggerProps,
  ImsAccordionProps,
  ImsAccordionPanelProps,
} from "./ims-collapse";

// ============================================================================
// Tab Components (tab.js)
// ============================================================================
export {
  ImsTabs,
  ImsTabNav,
  ImsTabItem,
  ImsTabDropdown,
  ImsTabContent,
  ImsTabPane,
} from "./ims-tabs";

export type { ImsTabItemProps, ImsTabDropdownProps, ImsTabPaneProps } from "./ims-tabs";

// ============================================================================
// Modal Components (modal.js)
// ============================================================================
export {
  ImsModalOverlay,
  ImsModal,
  ImsModalHeader,
  ImsModalBody,
  ImsModalFooter,
  ImsModalTitle,
} from "./ims-modal";

export type {
  ImsModalOverlayProps,
  ImsModalHeaderProps,
} from "./ims-modal";

// ============================================================================
// Tooltip/Popover Utilities (tooltip.js / popover.js)
// ============================================================================
export {
  getPosition,
  getCalculatedOffset,
  getViewportConstraints,
  autoPlacement,
  applyPlacement,
  replaceArrow,
  useTooltipPosition,
} from "./ims-tooltip";

export type {
  Position,
  ElementDimensions,
  ViewportConstraints,
  UseTooltipPositionOptions,
} from "./ims-tooltip";
