/**
 * IMS Init - Table Utilities
 *
 * Replaces the table-related functions from the original IMS ERP script:
 *
 * 1. rowStyle(row, index) → Row styling configuration
 * 2. sorter(a, b) → Custom sort function (descending)
 * 3. queryParams() → API request parameter builder
 * 4. detailFormatter(index, row) → Expandable row renderer
 * 5. Bootstrap table action button styling → Action button configuration
 *
 * Original implementations:
 * ```js
 * function rowStyle(row, index) {
 *     var classes = ['info', 'info'];
 *     if (index % 2 === 0 && index / 2 < classes.length) {
 *         return { classes: classes[index / 2] };
 *     }
 *     return {};
 * }
 *
 * function sorter(a, b) {
 *     if (a < b) return 1;
 *     if (a > b) return -1;
 *     return 0;
 * }
 *
 * function queryParams() {
 *     return { type: 'owner', sort: 'updated', direction: 'desc', per_page: 1, page: 1 };
 * }
 *
 * function detailFormatter(index, row) {
 *     var html = [];
 *     $.each(row, function (key, value) {
 *         html.push('<p><b>' + key + ':</b> ' + value + '</p>');
 *     });
 *     return html.join('');
 * }
 * ```
 */

import type {
  RowStyleConfig,
  TableQueryParams,
  DetailFormatterFn,
  ActionButtonConfig,
  ActionButtonSequence,
} from './types';

// ============================================================================
// Row Styling
// ============================================================================

/**
 * Default row style configuration.
 * Replaces the original rowStyle(row, index) function.
 *
 * Original logic: Even-indexed rows (0, 2) get 'info' class.
 * In the Deep Navy Blue theme, 'info' → Navy Blue background tint.
 *
 * @example
 * ```tsx
 * const config = getDefaultRowStyleConfig();
 * // Use in DataTable:
 * <DataTable rowClassName={getRowClassName(config)} />
 * ```
 */
export function getDefaultRowStyleConfig(): RowStyleConfig {
  return {
    alternatingClasses: ['ims-row-info', 'ims-row-info'],
  };
}

/**
 * Get CSS class for a table row based on index.
 * Replaces the rowStyle(row, index) function.
 *
 * @param index - Row index
 * @param config - Row style configuration
 * @returns CSS class string
 */
export function getRowClassName(
  index: number,
  config: RowStyleConfig = getDefaultRowStyleConfig()
): string {
  // Custom function takes precedence
  if (config.rowClassFn) {
    return config.rowClassFn({}, index);
  }

  // Original logic: apply alternating classes to even-indexed rows
  if (index % 2 === 0 && index / 2 < config.alternatingClasses.length) {
    return config.alternatingClasses[index / 2];
  }

  return '';
}

/**
 * Get row style object for a table row.
 * Enhanced version that also supports inline styles.
 */
export function getRowStyle(
  row: Record<string, unknown>,
  index: number,
  config: RowStyleConfig = getDefaultRowStyleConfig()
): { className: string; style?: React.CSSProperties } {
  if (config.rowClassFn) {
    return { className: config.rowClassFn(row, index) };
  }

  if (index % 2 === 0 && index / 2 < config.alternatingClasses.length) {
    return { className: config.alternatingClasses[index / 2] };
  }

  return { className: '' };
}

// ============================================================================
// Sorter
// ============================================================================

/**
 * Descending sort comparator.
 * Replaces the original sorter(a, b) function.
 *
 * Original: sorts in descending order (a < b → 1, a > b → -1).
 * Note: This is the reverse of a standard ascending comparator.
 *
 * @example
 * ```ts
 * [3, 1, 2].sort(imsSorter)  // [3, 2, 1] (descending)
 * ```
 */
export function imsSorter<T extends string | number>(a: T, b: T): number {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

/**
 * Ascending sort comparator.
 * Standard ascending sort for convenience.
 *
 * @example
 * ```ts
 * [3, 1, 2].sort(ascendingSorter)  // [1, 2, 3]
 * ```
 */
export function ascendingSorter<T extends string | number>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Create a sort comparator for a specific object property.
 * Useful for sorting arrays of objects by a key.
 *
 * @example
 * ```ts
 * const items = [{name: 'B'}, {name: 'A'}, {name: 'C'}];
 * items.sort(createObjectSorter('name', 'asc'));  // A, B, C
 * items.sort(createObjectSorter('name', 'desc')); // C, B, A
 * ```
 */
export function createObjectSorter<T extends Record<string, unknown>>(
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aVal = a[key] as string | number;
    const bVal = b[key] as string | number;

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  };
}

/**
 * Create a numeric sort comparator.
 * Handles NaN and undefined values safely.
 *
 * @example
 * ```ts
 * const items = [{qty: 5}, {qty: 1}, {qty: 10}];
 * items.sort(createNumericSorter('qty', 'desc'));
 * ```
 */
export function createNumericSorter<T extends Record<string, unknown>>(
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aVal = Number(a[key]) || 0;
    const bVal = Number(b[key]) || 0;

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  };
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Get default query parameters for table data loading.
 * Replaces the original queryParams() function.
 *
 * Original returned: { type: 'owner', sort: 'updated', direction: 'desc', per_page: 1, page: 1 }
 *
 * @param overrides - Override default parameters
 * @returns Query parameter object
 *
 * @example
 * ```ts
 * const params = getDefaultQueryParams({ per_page: 25, page: 2 });
 * // { type: 'owner', sort: 'updated', direction: 'desc', per_page: 25, page: 2 }
 * ```
 */
export function getDefaultQueryParams(
  overrides?: Partial<TableQueryParams>
): TableQueryParams {
  return {
    type: 'owner',
    sort: 'updated',
    direction: 'desc',
    per_page: 25,
    page: 1,
    ...overrides,
  };
}

/**
 * Build query string from parameters.
 * Useful for API calls.
 *
 * @example
 * ```ts
 * buildQueryString({ sort: 'name', direction: 'asc', page: 2 })
 * // 'sort=name&direction=asc&page=2'
 * ```
 */
export function buildQueryString(params: TableQueryParams): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return entries.join('&');
}

/**
 * Build URL with query parameters.
 *
 * @example
 * ```ts
 * buildApiUrl('/api/products', { sort: 'name', page: 1 })
 * // '/api/products?sort=name&page=1'
 * ```
 */
export function buildApiUrl(baseUrl: string, params: TableQueryParams): string {
  const qs = buildQueryString(params);
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ============================================================================
// Detail Formatter
// ============================================================================

/**
 * Default detail formatter for expandable table rows.
 * Replaces the original detailFormatter(index, row) function.
 *
 * Original used $.each to iterate row properties:
 * ```js
 * $.each(row, function(key, value) {
 *     html.push('<p><b>' + key + ':</b> ' + value + '</p>');
 * });
 * ```
 *
 * In React, this returns structured data for JSX rendering.
 *
 * @param index - Row index
 * @param row - Row data object
 * @returns Array of key-value pairs for rendering
 */
export function formatDetail(
  index: number,
  row: Record<string, unknown>
): Array<{ key: string; value: unknown }> {
  return Object.entries(row).map(([key, value]) => ({ key, value }));
}

/**
 * Format detail as HTML string (for backward compatibility).
 * Matches the original detailFormatter output.
 */
export function formatDetailHtml(
  index: number,
  row: Record<string, unknown>
): string {
  return Object.entries(row)
    .map(([key, value]) => `<p><b>${key}:</b> ${value}</p>`)
    .join('');
}

/**
 * React-compatible detail formatter.
 * Returns structured data for use in JSX rendering.
 */
export const imsDetailFormatter: DetailFormatterFn = (
  index: number,
  row: Record<string, unknown>
) => {
  return formatDetail(index, row);
};

// ============================================================================
// Action Button Configuration
// ============================================================================

/**
 * Default action button sequence for IMS ERP table rows.
 * Replaces the jQuery DOM manipulation that styled action links.
 *
 * Original button sequence:
 * 1st link → btn btn-xs btn-primary (Edit)
 * 2nd link → btn btn-xs btn-info (View/Details)
 * 3rd link → btn btn-xs btn-danger (Delete)
 * 4th link → btn btn-xs btn-default (Other)
 * 5th link → btn btn-xs btn-info (Print/Export)
 * 6th link → btn btn-xs btn-danger (Cancel/Void)
 * 7th link → btn btn-xs btn-default (More)
 *
 * In the Deep Navy Blue theme:
 * - primary → Navy Blue
 * - info → Amber
 * - danger → Red
 * - default → Ghost/muted
 */
export function getDefaultActionButtons(): ActionButtonSequence {
  return [
    { variant: 'primary', size: 'xs', label: 'Edit', display: 'both' },
    { variant: 'info', size: 'xs', label: 'View', display: 'both' },
    { variant: 'danger', size: 'xs', label: 'Delete', display: 'both' },
    { variant: 'default', size: 'xs', label: 'More', display: 'both' },
    { variant: 'info', size: 'xs', label: 'Print', display: 'both' },
    { variant: 'danger', size: 'xs', label: 'Cancel', display: 'both' },
    { variant: 'default', size: 'xs', label: 'Other', display: 'both' },
  ];
}

/**
 * Get action button variant by position index.
 * Replaces the `nth-child` jQuery selectors.
 *
 * @param index - Button position (0-based)
 * @returns Button configuration
 */
export function getActionButton(index: number): ActionButtonConfig {
  const buttons = getDefaultActionButtons();
  return buttons[index] || { variant: 'default', size: 'xs', label: 'Action', display: 'both' };
}

/**
 * Map action button config to shadcn/ui Button variant.
 * Converts Bootstrap btn-* classes to shadcn/ui variants.
 *
 * Bootstrap → shadcn/ui mapping:
 * - btn-primary → variant="default" (Navy Blue in our theme)
 * - btn-info → variant="info"
 * - btn-danger → variant="danger"
 * - btn-default → variant="ghost"
 * - btn-success → variant="success"
 * - btn-warning → variant="warning"
 */
export function mapButtonVariant(variant: ActionButtonConfig['variant']): string {
  const variantMap: Record<ActionButtonConfig['variant'], string> = {
    primary: 'default',
    info: 'info',
    danger: 'danger',
    success: 'success',
    warning: 'warning',
    default: 'ghost',
  };
  return variantMap[variant] || 'ghost';
}
