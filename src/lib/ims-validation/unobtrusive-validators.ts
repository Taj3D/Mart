/**
 * IMS Validation - Unobtrusive Custom Validators
 *
 * Additional validation methods added by the Microsoft jQuery Unobtrusive
 * Validation library, converted from jQuery to TypeScript.
 *
 * The unobtrusive validation library extends jQuery Validate with three
 * additional methods:
 *   - `__dummy__` — A no-op validator used as a workaround for rule detection
 *   - `regex` — Full-string regex matching validator
 *   - `nonalphamin` — Minimum non-alphabetic character count
 *
 * It also includes a composite `password` adapter that combines minlength,
 * nonalphamin, and regex rules for password complexity validation.
 *
 * @module ims-validation/unobtrusive-validators
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import type { ValidationMethod } from './types';
import { optional } from './validators';

// ============================================================================
// __dummy__ Validator
// ============================================================================

/**
 * Dummy validator that always returns true.
 *
 * In the original unobtrusive validation library, this is added as a
 * workaround to ensure that fields with validation attributes are
 * included in the validation process even if no other rules are detected:
 *
 * ```js
 * $jQval.addMethod("__dummy__", function(value, element, params) {
 *     return true;
 * });
 * ```
 *
 * And during `parseElement`:
 * ```js
 * $.extend(rules, { "__dummy__": true });
 * ```
 *
 * This ensures the field appears in the validator's internal tracking
 * even if only custom adapters are used. In React, this is less critical
 * since we use explicit field registration, but it's preserved for
 * compatibility with the original behavior.
 *
 * @param _value - The field value (unused)
 * @param _element - The field element (unused)
 * @param _params - Additional parameters (unused)
 * @returns Always `true`
 */
export const dummyValidator: ValidationMethod = (
  _value,
  _element?,
  _params?,
): boolean => {
  return true;
};

// ============================================================================
// Regex Validator
// ============================================================================

/**
 * Regular expression validator — validates that the entire value matches
 * a given pattern.
 *
 * In the original unobtrusive validation library:
 * ```js
 * $jQval.addMethod("regex", function(value, element, params) {
 *     var match;
 *     if (this.optional(element)) {
 *         return true;
 *     }
 *     match = new RegExp(params).exec(value);
 *     return (match && (match.index === 0) && (match[0].length === value.length));
 * });
 * ```
 *
 * Key behaviors:
 *   - Returns `true` for optional (empty) fields
 *   - The regex must match the **entire** value (not just a substring)
 *   - Uses `exec()` with index and length checks to ensure full match,
 *     rather than using `^` and `$` anchors (which could conflict with
 *     user-provided patterns)
 *   - The `params` value is the regex pattern string
 *
 * Used by the `regex` adapter which maps from `data-val-regex` and
 * `data-val-regex-pattern` attributes:
 * ```html
 * <input data-val="true"
 *        data-val-regex="Invalid format"
 *        data-val-regex-pattern="^[A-Za-z]+$" />
 * ```
 *
 * @param value - The field value to validate
 * @param _element - The field element (unused, optional check done via value)
 * @param params - The regex pattern string
 * @returns `true` if the value matches the pattern, `false` otherwise
 *
 * @example
 * ```ts
 * regexValidator('hello', undefined, '^[a-z]+$'); // true
 * regexValidator('hello123', undefined, '^[a-z]+$'); // false
 * regexValidator('', undefined, '^[a-z]+$'); // true (optional/empty)
 * ```
 */
export const regexValidator: ValidationMethod = (
  value,
  _element?,
  params?,
): boolean => {
  // Skip validation on optional (empty) fields
  if (optional(value) === true) {
    return true;
  }

  if (!params) {
    return true;
  }

  try {
    const regex = new RegExp(String(params));
    const match = regex.exec(String(value));
    return !!(match && match.index === 0 && match[0].length === String(value).length);
  } catch {
    // Invalid regex pattern — treat as valid to avoid breaking the form
    return true;
  }
};

// ============================================================================
// Non-Alphabetic Minimum Validator
// ============================================================================

/**
 * Non-alphabetic character minimum validator.
 *
 * Validates that the value contains at least a specified number of
 * non-alphabetic characters (symbols, digits, etc.).
 *
 * In the original unobtrusive validation library:
 * ```js
 * $jQval.addMethod("nonalphamin", function(value, element, nonalphamin) {
 *     var match;
 *     if (nonalphamin) {
 *         match = value.match(/\W/g);
 *         match = match && match.length >= nonalphamin;
 *     }
 *     return match;
 * });
 * ```
 *
 * Note: The original uses `/\W/g` which matches any non-word character
 * (equivalent to `[^a-zA-Z0-9_]`). This means underscores are treated
 * as word characters and don't count toward the non-alphabetic minimum.
 *
 * Key behaviors:
 *   - Returns `undefined`/`false` if `nonalphamin` param is falsy or 0
 *     (meaning the rule is effectively disabled)
 *   - Counts matches of `/\W/g` and checks if count >= nonalphamin
 *   - Empty/optional fields pass (since `\W` won't match empty strings)
 *
 * Used by the `password` adapter via `data-val-password-nonalphamin`:
 * ```html
 * <input data-val="true"
 *        data-val-password="Password does not meet requirements"
 *        data-val-password-nonalphamin="2" />
 * ```
 *
 * @param value - The field value to validate
 * @param _element - The field element (unused)
 * @param params - The minimum number of non-alphabetic characters required
 * @returns `true` if the value has enough non-alphabetic characters, `false` otherwise
 *
 * @example
 * ```ts
 * nonalphaminValidator('hello!@#', undefined, 2); // true (2 non-alpha chars: !@)
 * nonalphaminValidator('hello!', undefined, 2);    // false (only 1 non-alpha char)
 * nonalphaminValidator('hello', undefined, 1);     // false (0 non-alpha chars)
 * nonalphaminValidator('hello', undefined, 0);     // false (rule disabled, returns false)
 * ```
 */
export const nonalphaminValidator: ValidationMethod = (
  value,
  _element?,
  params?,
): boolean => {
  const minCount = Number(params);

  if (!minCount || minCount <= 0) {
    // Rule is disabled — original returns false/undefined in this case
    // In the original: if (!nonalphamin) return undefined (falsy)
    return false;
  }

  const valueStr = String(value ?? '');
  const nonAlphaMatches = valueStr.match(/\W/g);
  return !!(nonAlphaMatches && nonAlphaMatches.length >= minCount);
};

// ============================================================================
// Password Composite Validator
// ============================================================================

/**
 * Password complexity validation rules.
 *
 * Represents the individual rules extracted from a `password` adapter's
 * parameters. The `password` adapter in the original unobtrusive validation
 * library is a composite adapter that decomposes into:
 *   - `minlength` (from `data-val-password-min`)
 *   - `nonalphamin` (from `data-val-password-nonalphamin`)
 *   - `regex` (from `data-val-password-regex`)
 *
 * In the original source:
 * ```js
 * adapters.add("password", ["min", "nonalphamin", "regex"], function(options) {
 *     if (options.params.min) {
 *         setValidationValues(options, "minlength", options.params.min);
 *     }
 *     if (options.params.nonalphamin) {
 *         setValidationValues(options, "nonalphamin", options.params.nonalphamin);
 *     }
 *     if (options.params.regex) {
 *         setValidationValues(options, "regex", options.params.regex);
 *     }
 * });
 * ```
 *
 * Note: The `password` adapter is special because it can set MULTIPLE rules
 * from a single adapter (unlike `addBool`/`addSingleVal`/`addMinMax` which
 * each set exactly one rule). The adapter iterates through its parameters
 * and conditionally adds rules for each one that has a value.
 */
export interface PasswordRules {
  /** Minimum password length (from `data-val-password-min`) */
  minlength?: number;
  /** Minimum non-alphabetic characters (from `data-val-password-nonalphamin`) */
  nonalphamin?: number;
  /** Regex pattern the password must match (from `data-val-password-regex`) */
  regex?: string;
}

/**
 * Validate password complexity against multiple criteria.
 *
 * This is a composite validator that checks all password rules in a single
 * function call, providing a comprehensive password validation result.
 * Unlike the original adapter which sets individual rules, this function
 * checks all criteria at once and returns the first failing rule's message.
 *
 * @param value - The password value to validate
 * @param rules - The password complexity rules to enforce
 * @returns Object with validity status and any error message
 *
 * @example
 * ```ts
 * validatePasswordComplexity('Abc123!', {
 *   minlength: 8,
 *   nonalphamin: 2,
 *   regex: '^(?=.*[A-Z])(?=.*[0-9])'
 * });
 * // → { isValid: true }
 *
 * validatePasswordComplexity('abc', {
 *   minlength: 8,
 *   nonalphamin: 1
 * });
 * // → { isValid: false, error: 'minlength', message: '...' }
 * ```
 */
export function validatePasswordComplexity(
  value: string,
  rules: PasswordRules,
): { isValid: boolean; error?: string; message?: string } {
  // Check minlength
  if (rules.minlength && rules.minlength > 0) {
    if (!value || value.length < rules.minlength) {
      return {
        isValid: false,
        error: 'minlength',
        message: `Please enter at least ${rules.minlength} characters.`,
      };
    }
  }

  // Check nonalphamin
  if (rules.nonalphamin && rules.nonalphamin > 0) {
    const nonAlphaMatches = value.match(/\W/g);
    const nonAlphaCount = nonAlphaMatches ? nonAlphaMatches.length : 0;
    if (nonAlphaCount < rules.nonalphamin) {
      return {
        isValid: false,
        error: 'nonalphamin',
        message: `Please enter at least ${rules.nonalphamin} non-alphabetic characters.`,
      };
    }
  }

  // Check regex
  if (rules.regex) {
    try {
      const regex = new RegExp(rules.regex);
      const match = regex.exec(value);
      const regexPass = !!(match && match.index === 0 && match[0].length === value.length);
      if (!regexPass) {
        return {
          isValid: false,
          error: 'regex',
          message: 'Please enter a value matching the required pattern.',
        };
      }
    } catch {
      // Invalid regex — skip this check
    }
  }

  return { isValid: true };
}

// ============================================================================
// Default Messages for Unobtrusive Validators
// ============================================================================

/**
 * Default messages for the unobtrusive validation methods.
 *
 * These are the messages shown when the corresponding validation rule fails.
 * In the original unobtrusive validation library, messages come from the
 * `data-val-{rule}` attributes. These defaults are used when no custom
 * message is provided.
 */
export const unobtrusiveDefaultMessages: Record<string, string> = {
  __dummy__: '',
  regex: 'Please enter a value matching the required pattern.',
  nonalphamin: 'Please enter at least {0} non-alphabetic characters.',
  password: 'Password does not meet the complexity requirements.',
};

// ============================================================================
// Aggregate Export
// ============================================================================

/**
 * All unobtrusive validators keyed by their method name.
 */
export const unobtrusiveValidators: Record<string, ValidationMethod> = {
  __dummy__: dummyValidator,
  regex: regexValidator,
  nonalphamin: nonalphaminValidator,
};
