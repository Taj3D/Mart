/**
 * IMS Init - Label/Status Badge Utilities
 *
 * Replaces the jQuery addClass patterns for status labels from the original script:
 *
 * ```js
 * $(".Transfer").addClass("label label-info");
 * $(".Return").addClass("label label-danger");
 * $(".Success").addClass("label label-info");
 * $(".Fail").addClass("label label-danger");
 * $(".Sales").addClass("label label-info");
 * $(".ProductReturn").addClass("label label-warning");
 * $(".Pending").addClass("label label-primary");
 * ```
 *
 * In React, these become Badge component variants determined by status text,
 * not by CSS class selectors on DOM elements.
 */

import type { StatusVariant, StatusLabelConfig, StatusLabelMap } from './types';

// ============================================================================
// Status Label Map
// ============================================================================

/**
 * Default status label mapping.
 * Maps ERP status text to badge variants, replacing the jQuery addClass patterns.
 *
 * Bootstrap 3 label → Deep Navy Blue Badge mapping:
 * - label-info → Badge variant "info" (Navy Blue background)
 * - label-danger → Badge variant "danger" (Red background)
 * - label-warning → Badge variant "warning" (Amber background)
 * - label-primary → Badge variant "default" (Navy Blue primary)
 * - label-success → Badge variant "success" (Emerald background)
 */
export const DEFAULT_STATUS_LABELS: StatusLabelMap = {
  // Transaction types
  Transfer: {
    label: 'Transfer',
    variant: 'info',
    icon: 'ArrowLeftRight',
    cssClass: 'label label-info',
  },
  Return: {
    label: 'Return',
    variant: 'danger',
    icon: 'Undo2',
    cssClass: 'label label-danger',
  },

  // Processing status
  Success: {
    label: 'Success',
    variant: 'info',
    icon: 'CheckCircle',
    cssClass: 'label label-info',
  },
  Fail: {
    label: 'Fail',
    variant: 'danger',
    icon: 'XCircle',
    cssClass: 'label label-danger',
  },

  // Sales types
  Sales: {
    label: 'Sales',
    variant: 'info',
    icon: 'ShoppingCart',
    cssClass: 'label label-info',
  },
  ProductReturn: {
    label: 'Product Return',
    variant: 'warning',
    icon: 'PackageOpen',
    cssClass: 'label label-warning',
  },

  // Order status
  Pending: {
    label: 'Pending',
    variant: 'default',
    icon: 'Clock',
    cssClass: 'label label-primary',
  },

  // Additional common ERP statuses (not in original but commonly needed)
  Completed: {
    label: 'Completed',
    variant: 'success',
    icon: 'CheckCircle',
    cssClass: 'label label-success',
  },
  Cancelled: {
    label: 'Cancelled',
    variant: 'danger',
    icon: 'Ban',
    cssClass: 'label label-danger',
  },
  Approved: {
    label: 'Approved',
    variant: 'success',
    icon: 'ThumbsUp',
    cssClass: 'label label-success',
  },
  Rejected: {
    label: 'Rejected',
    variant: 'danger',
    icon: 'ThumbsDown',
    cssClass: 'label label-danger',
  },
  Draft: {
    label: 'Draft',
    variant: 'default',
    icon: 'FileEdit',
    cssClass: 'label label-default',
  },
  Active: {
    label: 'Active',
    variant: 'success',
    icon: 'Check',
    cssClass: 'label label-success',
  },
  Inactive: {
    label: 'Inactive',
    variant: 'danger',
    icon: 'X',
    cssClass: 'label label-danger',
  },
  Processing: {
    label: 'Processing',
    variant: 'info',
    icon: 'Loader',
    cssClass: 'label label-info',
  },
  Shipped: {
    label: 'Shipped',
    variant: 'info',
    icon: 'Truck',
    cssClass: 'label label-info',
  },
  Delivered: {
    label: 'Delivered',
    variant: 'success',
    icon: 'PackageCheck',
    cssClass: 'label label-success',
  },
  Paid: {
    label: 'Paid',
    variant: 'success',
    icon: 'Banknote',
    cssClass: 'label label-success',
  },
  Unpaid: {
    label: 'Unpaid',
    variant: 'danger',
    icon: 'CircleDollarSign',
    cssClass: 'label label-danger',
  },
  Partial: {
    label: 'Partial',
    variant: 'warning',
    icon: 'Percent',
    cssClass: 'label label-warning',
  },
  Overdue: {
    label: 'Overdue',
    variant: 'danger',
    icon: 'AlertTriangle',
    cssClass: 'label label-danger',
  },
};

// ============================================================================
// Status Lookup Functions
// ============================================================================

/**
 * Get status label configuration by status text.
 * Replaces the jQuery `$(".StatusText").addClass("label label-*")` pattern.
 *
 * @param status - Status text (e.g., 'Transfer', 'Success', 'Pending')
 * @param customMap - Optional custom label map (merged with defaults)
 * @returns Status label config or default config
 *
 * @example
 * ```tsx
 * const config = getStatusLabel('Transfer');
 * // { label: 'Transfer', variant: 'info', icon: 'ArrowLeftRight' }
 *
 * <Badge variant={config.variant}>{config.label}</Badge>
 * ```
 */
export function getStatusLabel(
  status: string,
  customMap?: Partial<StatusLabelMap>
): StatusLabelConfig {
  const map = { ...DEFAULT_STATUS_LABELS, ...customMap };
  const key = Object.keys(map).find(
    (k) => k.toLowerCase() === status.toLowerCase()
  );

  if (key && map[key]) {
    return map[key];
  }

  // Default fallback
  return {
    label: status,
    variant: 'default',
    cssClass: 'label label-default',
  };
}

/**
 * Get badge variant for a status text.
 * Quick lookup for Badge component variant prop.
 *
 * @example
 * ```tsx
 * <Badge variant={getStatusVariant('Transfer')}>Transfer</Badge>
 * ```
 */
export function getStatusVariant(status: string): StatusVariant {
  return getStatusLabel(status).variant;
}

/**
 * Check if a status text has a defined label configuration.
 */
export function isStatusDefined(status: string): boolean {
  return Object.keys(DEFAULT_STATUS_LABELS).some(
    (k) => k.toLowerCase() === status.toLowerCase()
  );
}

/**
 * Get all defined status labels.
 * Useful for rendering filter dropdowns or legends.
 */
export function getAllStatusLabels(): StatusLabelMap {
  return { ...DEFAULT_STATUS_LABELS };
}

// ============================================================================
// CSS Class Mapping (for backward compatibility)
// ============================================================================

/**
 * Map Bootstrap 3 label class to modern Badge variant.
 * For backward compatibility with existing CSS patterns.
 *
 * @example
 * ```ts
 * bootstrapLabelToVariant('label-info')    // 'info'
 * bootstrapLabelToVariant('label-danger')  // 'danger'
 * bootstrapLabelToVariant('label-success') // 'success'
 * ```
 */
export function bootstrapLabelToVariant(labelClass: string): StatusVariant {
  const classMap: Record<string, StatusVariant> = {
    'label-info': 'info',
    'label-danger': 'danger',
    'label-warning': 'warning',
    'label-primary': 'default',
    'label-success': 'success',
    'label-default': 'default',
  };

  for (const [cls, variant] of Object.entries(classMap)) {
    if (labelClass.includes(cls)) return variant;
  }

  return 'default';
}

/**
 * Get the Bootstrap CSS class for a status variant.
 * Inverse of bootstrapLabelToVariant.
 */
export function variantToBootstrapLabel(variant: StatusVariant): string {
  const variantMap: Record<StatusVariant, string> = {
    info: 'label label-info',
    danger: 'label label-danger',
    warning: 'label label-warning',
    primary: 'label label-primary',
    success: 'label label-success',
    default: 'label label-default',
  };
  return variantMap[variant] || 'label label-default';
}
