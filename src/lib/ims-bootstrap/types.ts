/**
 * IMS Bootstrap Types
 * Replaces Bootstrap 3.0.0 JavaScript type definitions
 * Maps Bootstrap JS component APIs to TypeScript/React equivalents
 */

// ============================================================================
// Transition Types (transition.js)
// ============================================================================
export type TransitionEndEvent = {
  end: string;
};

export interface TransitionSupport {
  transition: TransitionEndEvent | undefined;
}

// ============================================================================
// Alert Types (alert.js)
// ============================================================================
export interface ImsAlertProps {
  /** Alert variant style */
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Called when alert is dismissed */
  onDismiss?: () => void;
  /** Whether to animate the dismiss */
  animate?: boolean;
  /** Fade animation on mount */
  fade?: boolean;
}

// ============================================================================
// Button Types (button.js)
// ============================================================================
export type ButtonState = 'loading' | 'reset' | 'success' | 'error';

export interface ImsLoadingButtonProps {
  /** Loading state */
  loading?: boolean;
  /** Custom loading text (replaces Bootstrap's data-loading-text) */
  loadingText?: string;
  /** Whether the button is in a toggle state */
  toggled?: boolean;
  /** Called when toggle state changes */
  onToggle?: (toggled: boolean) => void;
}

// ============================================================================
// Carousel Types (carousel.js)
// ============================================================================
export interface ImsCarouselProps {
  /** Auto-play interval in ms (default: 5000) */
  interval?: number;
  /** Pause on hover (default: true) */
  pauseOnHover?: boolean;
  /** Whether to wrap around (default: true) */
  wrap?: boolean;
  /** Whether to show indicators/dots */
  indicators?: boolean;
  /** Whether to show prev/next controls */
  controls?: boolean;
  /** Initial slide index */
  defaultIndex?: number;
  /** Controlled active index */
  activeIndex?: number;
  /** Called when slide changes */
  onSlide?: (index: number, direction: 'left' | 'right') => void;
  /** Called after slide transition completes */
  onSlid?: (index: number, direction: 'left' | 'right') => void;
  /** Keyboard navigation */
  keyboard?: boolean;
  /** Slide transition duration in ms */
  duration?: number;
}

export interface CarouselState {
  activeIndex: number;
  isSliding: boolean;
  direction: 'left' | 'right' | null;
  isPaused: boolean;
}

// ============================================================================
// Collapse Types (collapse.js)
// ============================================================================
export interface ImsCollapseProps {
  /** Whether the collapse is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when collapse opens */
  onOpen?: () => void;
  /** Called when collapse closes */
  onClose?: () => void;
  /** Animation duration in ms */
  duration?: number;
  /** Collapse dimension */
  dimension?: 'height' | 'width';
  /** Accordion parent group ID */
  parent?: string;
}

// ============================================================================
// Dropdown Types (dropdown.js)
// ============================================================================
export interface ImsDropdownProps {
  /** Whether the dropdown is open */
  open?: boolean;
  /** Called when dropdown opens */
  onOpenChange?: (open: boolean) => void;
  /** Dropdown placement */
  placement?: 'bottom' | 'top' | 'left' | 'right';
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Keyboard navigation enabled */
  keyboard?: boolean;
}

// ============================================================================
// Modal Types (modal.js)
// ============================================================================
export interface ImsModalProps {
  /** Whether the modal is open */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Backdrop behavior: true = close on click, 'static' = no close, false = no backdrop */
  backdrop?: boolean | 'static';
  /** Close on Escape key */
  keyboard?: boolean;
  /** Focus trap inside modal */
  focusTrap?: boolean;
  /** Lock body scroll when open */
  lockBodyScroll?: boolean;
  /** Animation */
  fade?: boolean;
  /** Modal size */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

// ============================================================================
// Tooltip/Popover Types (tooltip.js / popover.js)
// ============================================================================
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface ImsTooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Placement */
  placement?: TooltipPlacement;
  /** Trigger mode */
  trigger?: 'hover' | 'focus' | 'click' | 'manual';
  /** Show delay in ms */
  delayShow?: number;
  /** Hide delay in ms */
  delayHide?: number;
  /** Allow HTML content */
  html?: boolean;
  /** Animation */
  animation?: boolean;
  /** Container selector for portal */
  container?: string;
  /** Whether tooltip is enabled */
  enabled?: boolean;
}

export interface ImsPopoverProps extends ImsTooltipProps {
  /** Popover title */
  title?: React.ReactNode;
}

// ============================================================================
// ScrollSpy Types (scrollspy.js)
// ============================================================================
export interface ImsScrollSpyProps {
  /** Scroll container (window or element) */
  target?: React.RefObject<HTMLElement | null>;
  /** Offset from top for activation */
  offset?: number;
  /** Navigation selector */
  navSelector?: string;
  /** Active class to apply */
  activeClass?: string;
}

export interface ScrollSpyEntry {
  id: string;
  offset: number;
  element: HTMLElement;
}

// ============================================================================
// Tab Types (tab.js)
// ============================================================================
export interface ImsTabsProps {
  /** Default active tab */
  defaultValue?: string;
  /** Controlled active tab */
  value?: string;
  /** Called when tab changes */
  onValueChange?: (value: string) => void;
  /** Whether to use fade animation */
  fade?: boolean;
  /** Animation duration in ms */
  duration?: number;
}

// ============================================================================
// Affix Types (affix.js)
// ============================================================================
export type AffixState = 'top' | 'bottom' | null;

export interface ImsAffixProps {
  /** Top offset for affix-top state */
  offsetTop?: number;
  /** Bottom offset for affix-bottom state */
  offsetBottom?: number;
  /** Called when affix state changes */
  onAffix?: (state: AffixState) => void;
}

// ============================================================================
// Common Types
// ============================================================================
export interface BootstrapEventMap {
  'show.bs.alert': void;
  'shown.bs.alert': void;
  'close.bs.alert': void;
  'closed.bs.alert': void;
  'show.bs.modal': { relatedTarget?: HTMLElement };
  'shown.bs.modal': { relatedTarget?: HTMLElement };
  'hide.bs.modal': void;
  'hidden.bs.modal': void;
  'show.bs.collapse': void;
  'shown.bs.collapse': void;
  'hide.bs.collapse': void;
  'hidden.bs.collapse': void;
  'show.bs.dropdown': void;
  'shown.bs.dropdown': void;
  'hide.bs.dropdown': void;
  'hidden.bs.dropdown': void;
  'show.bs.tab': { relatedTarget?: HTMLElement };
  'shown.bs.tab': { relatedTarget?: HTMLElement };
  'slide.bs.carousel': { relatedTarget: HTMLElement; direction: 'left' | 'right' };
  'slid.bs.carousel': { relatedTarget: HTMLElement; direction: 'left' | 'right' };
  'show.bs.tooltip': void;
  'shown.bs.tooltip': void;
  'hide.bs.tooltip': void;
  'hidden.bs.tooltip': void;
  'show.bs.popover': void;
  'shown.bs.popover': void;
  'hide.bs.popover': void;
  'hidden.bs.popover': void;
  'activate.bs.scrollspy': void;
}

/** Callback type for Bootstrap-style events */
export type BootstrapEventCallback<T extends keyof BootstrapEventMap = keyof BootstrapEventMap> = 
  T extends keyof BootstrapEventMap 
    ? BootstrapEventMap[T] extends void 
      ? () => void 
      : (event: BootstrapEventMap[T]) => void
    : never;
