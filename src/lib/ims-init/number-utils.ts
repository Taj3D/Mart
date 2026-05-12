/**
 * IMS Init - Number Utility Functions
 *
 * Replaces the global functions getDefaultFloatIfEmpty() and getDefaultIntIfEmpty()
 * from the original IMS ERP script.
 *
 * Original:
 * ```js
 * function getDefaultFloatIfEmpty(val) {
 *     if (val == undefined || val == '' || isNaN(val))
 *         return 0.0;
 *     else
 *         return parseFloat(val);
 * }
 *
 * function getDefaultIntIfEmpty(val) {
 *     if (val == undefined || val == '' || isNaN(val))
 *         return 0;
 *     else
 *         return parseInt(val);
 * }
 * ```
 *
 * Modern TypeScript version adds:
 * - Type safety
 * - Configurable default values
 * - Min/max clamping
 * - Precision control
 * - Additional number utilities commonly needed in ERP
 */

import type { NumberParseOptions } from './types';

// ============================================================================
// Core Parsing Functions
// ============================================================================

/**
 * Parse a value as float, returning default if empty/invalid.
 * Replaces `getDefaultFloatIfEmpty(val)`.
 *
 * @param val - Value to parse (string, number, null, undefined)
 * @param defaultValue - Default value (default: 0.0)
 * @returns Parsed float or default
 *
 * @example
 * ```ts
 * getDefaultFloatIfEmpty('3.14')   // 3.14
 * getDefaultFloatIfEmpty('')       // 0.0
 * getDefaultFloatIfEmpty(null)     // 0.0
 * getDefaultFloatIfEmpty('abc')    // 0.0
 * getDefaultFloatIfEmpty(undefined) // 0.0
 * ```
 */
export function getDefaultFloatIfEmpty(
  val: string | number | null | undefined,
  defaultValue: number = 0.0
): number {
  if (val === undefined || val === null || val === '' || Number.isNaN(Number(val))) {
    return defaultValue;
  }
  return parseFloat(String(val));
}

/**
 * Parse a value as integer, returning default if empty/invalid.
 * Replaces `getDefaultIntIfEmpty(val)`.
 *
 * @param val - Value to parse (string, number, null, undefined)
 * @param defaultValue - Default value (default: 0)
 * @returns Parsed integer or default
 *
 * @example
 * ```ts
 * getDefaultIntIfEmpty('42')     // 42
 * getDefaultIntIfEmpty('')       // 0
 * getDefaultIntIfEmpty(null)     // 0
 * getDefaultIntIfEmpty('3.14')   // 3 (truncated)
 * ```
 */
export function getDefaultIntIfEmpty(
  val: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (val === undefined || val === null || val === '' || Number.isNaN(Number(val))) {
    return defaultValue;
  }
  return parseInt(String(val), 10);
}

// ============================================================================
// Enhanced Parsing with Options
// ============================================================================

/**
 * Parse a value as float with advanced options.
 * Enhanced version of getDefaultFloatIfEmpty with clamping and precision.
 *
 * @param val - Value to parse
 * @param options - Parse options
 * @returns Parsed and processed number
 *
 * @example
 * ```ts
 * parseNumber('3.14159', { precision: 2 })    // 3.14
 * parseNumber('150', { min: 0, max: 100 })    // 100 (clamped)
 * parseNumber('', { defaultValue: 1.5 })       // 1.5
 * ```
 */
export function parseNumber(
  val: string | number | null | undefined,
  options: NumberParseOptions = {}
): number {
  const { defaultValue = 0, min, max, precision } = options;

  let result: number;

  if (val === undefined || val === null || val === '' || Number.isNaN(Number(val))) {
    result = defaultValue;
  } else {
    result = parseFloat(String(val));
  }

  // Clamp to min/max
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;

  // Apply precision
  if (precision !== undefined) {
    result = parseFloat(result.toFixed(precision));
  }

  return result;
}

// ============================================================================
// Additional ERP Number Utilities
// ============================================================================

/**
 * Check if a value is a valid number (not NaN, not undefined, not empty string).
 * Common guard condition in ERP calculations.
 *
 * @example
 * ```ts
 * isValidNumber('42')     // true
 * isValidNumber('')       // false
 * isValidNumber(NaN)      // false
 * isValidNumber(null)     // false
 * ```
 */
export function isValidNumber(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return false;
  const num = Number(val);
  return !Number.isNaN(num) && Number.isFinite(num);
}

/**
 * Safely divide two numbers, returning fallback for division by zero or invalid inputs.
 * Essential for ERP calculations (unit price, tax rate, etc.).
 *
 * @example
 * ```ts
 * safeDivide(100, 5)        // 20
 * safeDivide(100, 0)        // 0 (fallback)
 * safeDivide(null, 5)       // 0 (fallback)
 * ```
 */
export function safeDivide(
  numerator: number | string | null | undefined,
  denominator: number | string | null | undefined,
  fallback: number = 0
): number {
  const num = getDefaultFloatIfEmpty(numerator);
  const denom = getDefaultFloatIfEmpty(denominator);
  if (denom === 0) return fallback;
  return num / denom;
}

/**
 * Calculate percentage with safe division.
 *
 * @example
 * ```ts
 * calculatePercentage(25, 100)   // 25
 * calculatePercentage(0, 100)    // 0
 * calculatePercentage(50, 0)     // 0 (fallback)
 * ```
 */
export function calculatePercentage(
  value: number | string | null | undefined,
  total: number | string | null | undefined,
  precision: number = 2
): number {
  const val = getDefaultFloatIfEmpty(value);
  const tot = getDefaultFloatIfEmpty(total);
  if (tot === 0) return 0;
  return parseFloat(((val / tot) * 100).toFixed(precision));
}

/**
 * Format a number as currency string.
 *
 * @example
 * ```ts
 * formatCurrency(1234.5)    // '1,234.50'
 * formatCurrency(0)         // '0.00'
 * ```
 */
export function formatCurrency(
  value: number | string | null | undefined,
  decimals: number = 2,
  prefix: string = ''
): string {
  const num = getDefaultFloatIfEmpty(value);
  const formatted = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return prefix + formatted;
}

/**
 * Round a number to specified decimal places.
 *
 * @example
 * ```ts
 * roundTo(3.14159, 2)   // 3.14
 * roundTo(3.145, 2)     // 3.15
 * ```
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp a number between min and max.
 *
 * @example
 * ```ts
 * clamp(150, 0, 100)   // 100
 * clamp(-5, 0, 100)    // 0
 * clamp(50, 0, 100)    // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get the sum of numeric values in an array.
 * Returns 0 for empty arrays or arrays with no valid numbers.
 *
 * @example
 * ```ts
 * sum([1, 2, 3])          // 6
 * sum(['1', '2', 'abc'])  // 3
 * sum([])                 // 0
 * ```
 */
export function sum(values: (string | number | null | undefined)[]): number {
  return values.reduce((acc, val) => acc + getDefaultFloatIfEmpty(val), 0);
}
