/**
 * IMS Init - Global Initialization System
 *
 * Replaces the custom jQuery initialization script (File 30).
 *
 * Original script contained these jQuery patterns:
 * 1. $.fn.select2.defaults.set("theme", "bootstrap") → Select2 theme config
 * 2. $('.dropdown').on('show.bs.dropdown', slideDown) → Framer Motion dropdown variants
 * 3. rowStyle(row, index) → DataTable row styling config
 * 4. sorter(a, b) → Sort utility (descending)
 * 5. queryParams() → API request parameter builder
 * 6. detailFormatter(index, row) → DataTable expandable row renderer
 * 7. Login page body/footer class → Route-based styling system
 * 8. Order form column padding → Route-based styling system
 * 9. getDefaultFloatIfEmpty(val) → Number parsing utility
 * 10. getDefaultIntIfEmpty(val) → Number parsing utility
 * 11. Bootstrap table action buttons → Action column config
 * 12. input[type="number"] select on click → NumberSpinner behavior
 * 13. Status label classes → Badge variant mapping
 * 14. $(".table").addClass("text-nowrap") → CSS utility
 * 15. $("h4").addClass("inline-header") → InlineHeader component
 * 16. toastr.options.progressBar = true → Sonner toast config
 *
 * ============================================================================
 * MIGRATION GUIDE
 * ============================================================================
 *
 * Old (jQuery)                              → New (React + IMS Init)
 * ──────────────────────────────────────────────────────────────────────
 * $.fn.select2.defaults.set("theme", ...)   → SearchableSelect theme="navy"
 * $('.dropdown').slideDown(300)             → imsDropdownVariants (Framer Motion)
 * rowStyle(row, index)                      → getRowClassName(index, config)
 * sorter(a, b)                              → imsSorter(a, b)
 * queryParams()                             → getDefaultQueryParams(overrides)
 * detailFormatter(index, row)               → imsDetailFormatter(index, row)
 * $("body").addClass("login-bg")            → Route-based styling (auto)
 * $(".col-md-6").css("padding", "5px")     → Route-based styling (auto)
 * getDefaultFloatIfEmpty(val)               → getDefaultFloatIfEmpty(val)
 * getDefaultIntIfEmpty(val)                 → getDefaultIntIfEmpty(val)
 * $('td a:first').addClass('btn btn-xs')   → getDefaultActionButtons()
 * $('input[type="number"]').select()        → NumberSpinner component
 * $(".Transfer").addClass("label-info")     → getStatusLabel('Transfer').variant
 * $(".table").addClass("text-nowrap")       → ims-table-nowrap CSS class
 * $("h4").addClass("inline-header")         → <InlineHeader> component
 * toastr.options.progressBar = true         → IMSInitProvider toast config
 */

// ============================================================================
// Types
// ============================================================================

export type {
  Select2Theme,
  Select2Defaults,
  DropdownAnimationConfig,
  RowStyleConfig,
  TableQueryParams,
  DetailFormatterFn,
  ActionButtonConfig,
  ActionButtonSequence,
  NumberParseOptions,
  RouteStyleConfig,
  IMSRouteStyleRules,
  StatusVariant,
  StatusLabelConfig,
  StatusLabelMap,
  IMSToastConfig,
  IMSInitConfig,
  IMSInitProviderProps,
} from './types';

// ============================================================================
// Number Utilities
// ============================================================================

export {
  /** Parse float with default (replaces getDefaultFloatIfEmpty) */
  getDefaultFloatIfEmpty,
  /** Parse int with default (replaces getDefaultIntIfEmpty) */
  getDefaultIntIfEmpty,
  /** Parse number with advanced options */
  parseNumber,
  /** Check if value is a valid number */
  isValidNumber,
  /** Safely divide two numbers */
  safeDivide,
  /** Calculate percentage */
  calculatePercentage,
  /** Format number as currency */
  formatCurrency,
  /** Round to decimal places */
  roundTo,
  /** Clamp number between min and max */
  clamp,
  /** Sum array of numeric values */
  sum,
} from './number-utils';

// ============================================================================
// Table Utilities
// ============================================================================

export {
  /** Default row style config */
  getDefaultRowStyleConfig,
  /** Get row CSS class by index */
  getRowClassName,
  /** Get row style object */
  getRowStyle,
  /** Descending sort comparator (replaces original sorter) */
  imsSorter,
  /** Ascending sort comparator */
  ascendingSorter,
  /** Create object property sorter */
  createObjectSorter,
  /** Create numeric sorter */
  createNumericSorter,
  /** Default query params (replaces original queryParams) */
  getDefaultQueryParams,
  /** Build query string */
  buildQueryString,
  /** Build API URL */
  buildApiUrl,
  /** Format detail data (replaces detailFormatter) */
  formatDetail,
  /** Format detail as HTML */
  formatDetailHtml,
  /** Detail formatter function */
  imsDetailFormatter,
  /** Default action buttons config */
  getDefaultActionButtons,
  /** Get action button by position */
  getActionButton,
  /** Map action variant to shadcn/ui */
  mapButtonVariant,
} from './table-utils';

// ============================================================================
// Label/Status Utilities
// ============================================================================

export {
  /** Default status label map */
  DEFAULT_STATUS_LABELS,
  /** Get status label config by text */
  getStatusLabel,
  /** Get badge variant by status text */
  getStatusVariant,
  /** Check if status is defined */
  isStatusDefined,
  /** Get all status labels */
  getAllStatusLabels,
  /** Convert Bootstrap label class to variant */
  bootstrapLabelToVariant,
  /** Convert variant to Bootstrap label class */
  variantToBootstrapLabel,
} from './label-utils';

// ============================================================================
// Route Styling
// ============================================================================

export {
  /** Match pathname against route pattern */
  matchRoute,
  /** Default route style rules */
  getDefaultRouteStyles,
  /** Order form route list */
  ORDER_FORM_ROUTES,
  /** Check if pathname is order form page */
  isOrderFormPage,
  /** Check if pathname is login page */
  isLoginPage,
  /** Resolve route styles for pathname */
  resolveRouteStyles,
  /** Get body classes for pathname */
  getBodyClasses,
  /** Get navbar classes for pathname */
  getNavbarClasses,
  /** Get footer classes for pathname */
  getFooterClasses,
} from './route-styling';

export type { RouteStyleResult } from './route-styling';

// ============================================================================
// Dropdown Animations
// ============================================================================

export {
  /** Default dropdown animation config */
  getDefaultDropdownAnimation,
  /** Framer Motion dropdown variants (slide+fade) */
  imsDropdownVariants,
  /** Framer Motion slide-only variants */
  imsDropdownSlideVariants,
  /** Framer Motion scale variants */
  imsDropdownScaleVariants,
  /** Build transition from config */
  buildDropdownTransition,
  /** Build variants from config */
  buildDropdownVariants,
} from './dropdown-animations';

// ============================================================================
// Provider
// ============================================================================

export {
  /** Default IMS configuration */
  getDefaultIMSConfig,
  /** IMS Initialization Provider */
  IMSInitProvider,
  /** Access IMS config from context */
  useIMSInit,
  /** Get status label from context */
  useIMSStatusLabel,
} from './ims-init-provider';
