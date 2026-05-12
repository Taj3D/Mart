/**
 * IMS Init - Types
 *
 * Replaces the global jQuery-based initialization script (File 30)
 * with typed React/TypeScript equivalents.
 *
 * Original script contained:
 * 1. Select2 default theme → SearchableSelect component theme
 * 2. Bootstrap dropdown animations → Framer Motion dropdown config
 * 3. Bootstrap table rowStyle → DataTable row styling config
 * 4. Custom sorter function → Sort utility
 * 5. queryParams → API request parameter builder
 * 6. detailFormatter → DataTable expandable row renderer
 * 7. Route-based body/footer class injection → Route styling system
 * 8. Order form column padding → Component-level styling
 * 9. getDefaultFloatIfEmpty / getDefaultIntIfEmpty → Number utilities
 * 10. Bootstrap table action button styling → Action column config
 * 11. Number input select on click → Input behavior config
 * 12. Label/status class assignments → Badge variant mapping
 * 13. Table text-nowrap → CSS utility
 * 14. Inline header class → InlineHeader component
 * 15. Toastr progress bar → Sonner toast config
 */

// ============================================================================
// Select2 Theme Configuration
// ============================================================================

/**
 * Select2 theme configuration.
 * Replaces `$.fn.select2.defaults.set("theme", "bootstrap")`.
 *
 * In the React system, this is configured via the SearchableSelect component
 * and its theme variant prop.
 */
export type Select2Theme = 'default' | 'bootstrap' | 'classic' | 'navy';

export interface Select2Defaults {
  /** Theme variant - replaces $.fn.select2.defaults.set("theme", "bootstrap") */
  theme: Select2Theme;
  /** Minimum input length before search */
  minimumInputLength?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Allow clear selection */
  allowClear?: boolean;
  /** Dropdown width */
  width?: string;
}

// ============================================================================
// Dropdown Animation Configuration
// ============================================================================

/**
 * Dropdown animation configuration.
 * Replaces jQuery slideDown/slideUp on Bootstrap dropdowns.
 *
 * Original:
 * ```js
 * $('.dropdown').on('show.bs.dropdown', function(e) {
 *     $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
 * });
 * $('.dropdown').on('hide.bs.dropdown', function(e) {
 *     $(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
 * });
 * ```
 *
 * In React, this is handled by Framer Motion variants.
 */
export interface DropdownAnimationConfig {
  /** Animation duration in ms (default: 300, matching original slideDown/slideUp) */
  duration: number;
  /** Animation easing (default: 'easeOut') */
  easing: string;
  /** Animation type */
  type: 'slide' | 'fade' | 'scale' | 'slide-fade';
  /** Origin for scale animation */
  origin?: 'top' | 'bottom' | 'left' | 'right';
}

// ============================================================================
// Table Configuration
// ============================================================================

/**
 * Row style configuration.
 * Replaces the rowStyle(row, index) function.
 *
 * Original applied 'info' class to even-indexed rows (0, 2 → info, info).
 * In React, this becomes a row className function.
 */
export interface RowStyleConfig {
  /** CSS classes to apply to alternating rows */
  alternatingClasses: string[];
  /** Custom function to determine row class */
  rowClassFn?: (row: Record<string, unknown>, index: number) => string;
}

/**
 * Query parameters for table data loading.
 * Replaces the queryParams() function.
 *
 * Original returned:
 * { type: 'owner', sort: 'updated', direction: 'desc', per_page: 1, page: 1 }
 */
export interface TableQueryParams {
  type?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Detail formatter for expandable table rows.
 * Replaces detailFormatter(index, row).
 *
 * Original used $.each to iterate row properties and build HTML.
 * In React, this is a render function that returns JSX.
 */
export type DetailFormatterFn = (
  index: number,
  row: Record<string, unknown>
) => React.ReactNode;

/**
 * Action button configuration for table rows.
 * Replaces the jQuery DOM manipulation that added btn classes to action links.
 *
 * Original:
 * ```js
 * $('td:last-child a:first-child').addClass('btn btn-xs btn-primary');
 * $('td:last-child a:nth-child(2)').addClass('btn btn-xs btn-info');
 * $('td:last-child a:nth-child(3)').addClass('btn btn-xs btn-danger');
 * ...
 * ```
 */
export interface ActionButtonConfig {
  /** Button variant matching shadcn/ui Button variants */
  variant: 'default' | 'primary' | 'info' | 'danger' | 'success' | 'warning' | 'ghost';
  /** Button size */
  size: 'xs' | 'sm' | 'default' | 'lg';
  /** Optional icon */
  icon?: string;
  /** Optional label */
  label?: string;
  /** Whether to show text or icon only */
  display: 'icon' | 'text' | 'both';
}

/**
 * Standard action button sequence for IMS ERP table rows.
 * Matches the original button ordering: primary, info, danger, default, info, danger, default
 */
export type ActionButtonSequence = ActionButtonConfig[];

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Number parsing options.
 */
export interface NumberParseOptions {
  /** Default value when input is empty/NaN (default: 0 for int, 0.0 for float) */
  defaultValue?: number;
  /** Minimum value clamp */
  min?: number;
  /** Maximum value clamp */
  max?: number;
  /** Decimal places for float */
  precision?: number;
}

// ============================================================================
// Route Styling Configuration
// ============================================================================

/**
 * Route-based styling configuration.
 * Replaces the $(function() { if (pathname.indexOf(...)) }) pattern.
 *
 * Original added CSS classes to body/footer/navbar based on current URL path.
 * In Next.js, this is handled via route-aware class injection.
 */
export interface RouteStyleConfig {
  /** Route pattern (supports wildcards) */
  pattern: string | RegExp;
  /** CSS classes to add to the main container */
  bodyClasses?: string[];
  /** CSS classes to add to the navbar */
  navbarClasses?: string[];
  /** CSS classes to add to the footer */
  footerClasses?: string[];
  /** CSS classes to add to specific elements */
  elementClasses?: Record<string, string[]>;
}

/**
 * Predefined route style rules matching the original IMS ERP routes.
 */
export interface IMSRouteStyleRules {
  /** Login page styling - replaces body.addClass("login-bg"), footer.addClass("login-footer-bg") */
  login: RouteStyleConfig;
  /** Credit sales order create/edit */
  creditSalesOrder: RouteStyleConfig;
  /** Sales order create/edit */
  salesOrder: RouteStyleConfig;
  /** Purchase order create/edit */
  purchaseOrder: RouteStyleConfig;
  /** PO return create */
  poReturn: RouteStyleConfig;
  /** Transfer create */
  transfer: RouteStyleConfig;
}

// ============================================================================
// Label/Status Badge Configuration
// ============================================================================

/**
 * Status label mapping.
 * Replaces the jQuery addClass patterns for status labels.
 *
 * Original:
 * $(".Transfer").addClass("label label-info");
 * $(".Return").addClass("label label-danger");
 * $(".Success").addClass("label label-info");
 * $(".Fail").addClass("label label-danger");
 * $(".Sales").addClass("label label-info");
 * $(".ProductReturn").addClass("label label-warning");
 * $(".Pending").addClass("label label-primary");
 */
export type StatusVariant =
  | 'info'     // label-info: Transfer, Success, Sales
  | 'danger'   // label-danger: Return, Fail
  | 'warning'  // label-warning: ProductReturn
  | 'primary'  // label-primary: Pending
  | 'success'
  | 'default';

/**
 * Status label configuration.
 * Maps status text to badge variant and optional icon.
 */
export interface StatusLabelConfig {
  /** Display text */
  label: string;
  /** Badge variant (replaces Bootstrap label-* classes) */
  variant: StatusVariant;
  /** Optional icon name */
  icon?: string;
  /** CSS class to apply (for backward compatibility) */
  cssClass?: string;
}

/**
 * Status-to-variant mapping.
 * Replaces the hardcoded jQuery selectors.
 */
export type StatusLabelMap = Record<string, StatusLabelConfig>;

// ============================================================================
// Toast Configuration
// ============================================================================

/**
 * Toast notification configuration.
 * Replaces `toastr.options.progressBar = true`.
 *
 * In the React system, this configures the Sonner Toaster component.
 */
export interface IMSToastConfig {
  /** Show progress bar (replaces toastr.options.progressBar = true) */
  progressBar: boolean;
  /** Default position */
  position: 'top-left' | 'top-right' | 'top-center' |
            'bottom-left' | 'bottom-right' | 'bottom-center';
  /** Auto-close duration in ms */
  duration: number;
  /** Whether to show close button */
  closeButton: boolean;
  /** Whether to prevent duplicates */
  preventDuplicates: boolean;
}

// ============================================================================
// Global Init Configuration
// ============================================================================

/**
 * Complete IMS initialization configuration.
 * Aggregates all the settings from the original script.
 */
export interface IMSInitConfig {
  /** Select2/searchable select theme */
  select2Theme: Select2Defaults;
  /** Dropdown animation settings */
  dropdownAnimation: DropdownAnimationConfig;
  /** Table row styling */
  rowStyle: RowStyleConfig;
  /** Table query parameters */
  queryParams: TableQueryParams;
  /** Action button sequence for table rows */
  actionButtons: ActionButtonSequence;
  /** Route-based styling rules */
  routeStyles: RouteStyleConfig[];
  /** Status label mapping */
  statusLabels: StatusLabelMap;
  /** Toast configuration */
  toast: IMSToastConfig;
  /** Whether to add text-nowrap to tables */
  tableNoWrap: boolean;
  /** Whether to add inline-header class to h4 elements */
  inlineHeaders: boolean;
}

// ============================================================================
// Provider Props
// ============================================================================

/**
 * Props for the IMSInitProvider component.
 */
export interface IMSInitProviderProps {
  /** Child elements */
  children: React.ReactNode;
  /** Custom configuration (merged with defaults) */
  config?: Partial<IMSInitConfig>;
}
