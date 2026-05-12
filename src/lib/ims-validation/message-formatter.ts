/**
 * IMS Validation - Message Formatter
 *
 * Implements the jQuery Validation 1.11.1 message formatting system,
 * specifically the `$.validator.format()` function for parameter substitution
 * in message templates, and the message resolution priority logic from
 * `defaultMessage()` / `findDefined()`.
 *
 * @module ims-validation/message-formatter
 */

import type { RuleParameter } from './types';

// ============================================================================
// Types
// ============================================================================

/** Options for resolving the final error message for a field+method combination */
export interface MessageResolveOptions {
  /** The field/element name */
  fieldName: string;
  /** The validation method name (e.g., 'required', 'minlength') */
  method: string;
  /** Rule parameters (e.g., 5 for minlength(5), [2,8] for range) */
  parameters?: RuleParameter;
  /** Custom messages from settings.messages (field → method → message) */
  customMessages?: Record<string, string | Record<string, string>>;
  /** Custom data messages from data-msg-{method} attributes */
  dataMessages?: Record<string, string>;
  /** Element title attribute value */
  title?: string;
  /** Whether to ignore the title attribute as a message source */
  ignoreTitle?: boolean;
  /** Default messages registry (method → message template) */
  defaultMessages?: Record<string, string | ((...args: any[]) => string)>;
}

/** Curried format function returned when only a template is provided */
export type FormatCurried = (...params: unknown[]) => string;

// ============================================================================
// Constants
// ============================================================================

/**
 * Regex pattern for matching `{n}` placeholders in message templates.
 * Matches `{0}`, `{1}`, `{2}`, etc. — exactly as used in jQuery Validation.
 */
const PARAM_PLACEHOLDER_REGEX = /\{(\d+)\}/g;

/**
 * Fallback message format when no message is defined for a field+method.
 * Matches the jQuery Validation warning pattern.
 */
const NO_MESSAGE_FALLBACK = 'Warning: No message defined for {fieldName}';

// ============================================================================
// formatMessage
// ============================================================================

/**
 * Main formatting function — implements `$.validator.format()` from jQuery Validation 1.11.1.
 *
 * Performs parameter substitution in message templates, replacing `{0}`, `{1}`, etc.
 * with the corresponding parameter values.
 *
 * **Currying behavior** (matches jQuery Validation):
 * - If only `template` is provided (no `params`), returns a curried function
 *   that takes params and returns the formatted string.
 * - If both `template` and `params` are provided, returns the formatted string immediately.
 *
 * **Parameter handling** (matches jQuery Validation):
 * - If `params` is an array, each element maps to its corresponding `{n}` placeholder.
 * - If `params` is not an array (a single value), it is wrapped into `[params]`.
 * - When called via the curried function, multiple arguments are collected into an array.
 * - If only one non-array argument is passed to the curried function, it is wrapped into an array.
 *
 * @example
 * ```ts
 * // Direct usage with single param
 * formatMessage("Please enter no more than {0} characters.", 5)
 * // → "Please enter no more than 5 characters."
 *
 * // Direct usage with array params
 * formatMessage("Please enter a value between {0} and {1}.", [2, 8])
 * // → "Please enter a value between 2 and 8."
 *
 * // Curried usage (only template provided)
 * const minMsg = formatMessage("Please enter a value greater than or equal to {0}.");
 * minMsg(5) // → "Please enter a value greater than or equal to 5."
 *
 * // Curried with multiple params
 * const rangeMsg = formatMessage("Value between {0} and {1}.");
 * rangeMsg(2, 8) // → "Value between 2 and 8."
 * ```
 *
 * @param template - Message template with `{n}` placeholders
 * @param params - Parameter value(s) for substitution (array or single value)
 * @returns Formatted string, or a curried function if only template is provided
 */
export function formatMessage(template: string): FormatCurried;
export function formatMessage(template: string, params: RuleParameter): string;
export function formatMessage(template: string, params?: RuleParameter): string | FormatCurried {
  // If only template is provided (1 argument), return a curried function
  // This matches: if (arguments.length === 1) in jQuery Validation
  if (params === undefined) {
    return function (this: unknown, ...args: unknown[]): string {
      // Collect args: if single non-array arg, wrap in array
      // This matches: if (args.length === 1 && args.constructor !== Array) { args = [args]; }
      let normalizedArgs: unknown[];
      if (args.length === 1 && !Array.isArray(args[0])) {
        normalizedArgs = [args[0]];
      } else if (args.length === 1 && Array.isArray(args[0])) {
        normalizedArgs = args[0] as unknown[];
      } else {
        normalizedArgs = args;
      }
      return substituteParams(template, normalizedArgs);
    };
  }

  // Direct substitution when params are provided
  let normalizedParams: unknown[];

  if (Array.isArray(params)) {
    // Array params: use directly
    normalizedParams = params;
  } else {
    // Single non-array param: wrap in array
    normalizedParams = [params];
  }

  return substituteParams(template, normalizedParams);
}

// ============================================================================
// formatTemplate
// ============================================================================

/**
 * Curried version of `formatMessage`. Always returns a function that takes
 * params and returns the formatted string.
 *
 * This is a convenience wrapper for pre-creating message formatters
 * that can be reused with different parameter values.
 *
 * @example
 * ```ts
 * const minMsg = formatTemplate("Please enter a value greater than or equal to {0}.");
 * minMsg(5) // → "Please enter a value greater than or equal to 5."
 * minMsg(10) // → "Please enter a value greater than or equal to 10."
 *
 * const rangeMsg = formatTemplate("Please enter a value between {0} and {1}.");
 * rangeMsg([2, 8]) // → "Please enter a value between 2 and 8."
 * rangeMsg(0, 100) // → "Please enter a value between 0 and 100."
 * ```
 *
 * @param template - Message template with `{n}` placeholders
 * @returns A function that takes params and returns the formatted string
 */
export function formatTemplate(template: string): FormatCurried {
  return formatMessage(template);
}

// ============================================================================
// resolveMessage
// ============================================================================

/**
 * Resolves the final error message for a field+method combination.
 *
 * Follows the exact priority order from jQuery Validation's `findDefined()`
 * and `defaultMessage()` functions:
 *
 * 1. Custom message from `settings.messages[fieldName][methodName]` (function or string)
 * 2. Custom data message from `data-msg-{method}` attribute
 * 3. Element `title` attribute (if `ignoreTitle` is false)
 * 4. Default message from `$.validator.messages[methodName]`
 * 5. Fallback: `"Warning: No message defined for {fieldName}"`
 *
 * If the resolved message is a function, it is called with `(parameters, element)`.
 * If the resolved message contains `{n}` patterns, it is formatted with parameters.
 *
 * @example
 * ```ts
 * resolveMessage({
 *   fieldName: 'username',
 *   method: 'required',
 *   customMessages: {
 *     username: { required: 'Username is mandatory' }
 *   },
 *   defaultMessages: {
 *     required: 'This field is required.'
 *   }
 * })
 * // → 'Username is mandatory' (custom message takes priority)
 *
 * resolveMessage({
 *   fieldName: 'age',
 *   method: 'min',
 *   parameters: 18,
 *   defaultMessages: {
 *     min: 'Please enter a value greater than or equal to {0}.'
 *   }
 * })
 * // → 'Please enter a value greater than or equal to 18.'
 * ```
 *
 * @param options - Message resolution options
 * @returns The resolved and formatted error message string
 */
export function resolveMessage(options: MessageResolveOptions): string {
  const {
    fieldName,
    method,
    parameters,
    customMessages,
    dataMessages,
    title,
    ignoreTitle = false,
    defaultMessages,
  } = options;

  // Priority 1: Custom message from settings.messages[fieldName][methodName]
  const fieldMessages = customMessages?.[fieldName];
  if (fieldMessages !== undefined) {
    let message: string | ((...args: any[]) => string) | undefined;

    if (typeof fieldMessages === 'string') {
      // If the entire field entry is a string, it's typically for the 'required' method
      // or it's a shorthand. In jQuery Validation, settings.messages[field] can be
      // either a string (for the method implied by the rule) or an object.
      // We only use it if the method matches; string-only applies as a direct message.
      message = fieldMessages;
    } else if (typeof fieldMessages === 'object' && fieldMessages !== null) {
      message = (fieldMessages as Record<string, string | ((...args: any[]) => string)>)[method];
    }

    if (message !== undefined) {
      return applyMessage(message, parameters);
    }
  }

  // Priority 2: Custom data message from data-msg-{method} attribute
  if (dataMessages !== undefined) {
    const dataMessage = dataMessages[method];
    if (dataMessage !== undefined && dataMessage !== '') {
      return applyMessage(dataMessage, parameters);
    }
  }

  // Priority 3: Element title attribute (if not ignored)
  if (!ignoreTitle && title !== undefined && title !== '') {
    return applyMessage(title, parameters);
  }

  // Priority 4: Default message from $.validator.messages[methodName]
  if (defaultMessages !== undefined) {
    const defaultMessage = defaultMessages[method];
    if (defaultMessage !== undefined) {
      return applyMessage(defaultMessage, parameters);
    }
  }

  // Priority 5: Fallback warning message
  return NO_MESSAGE_FALLBACK.replace('{fieldName}', fieldName);
}

// ============================================================================
// defaultMessage
// ============================================================================

/**
 * Get the default message for a field+method combination.
 *
 * This is a simplified convenience wrapper around `resolveMessage()` that
 * mirrors the `$.validator.prototype.defaultMessage()` function signature.
 * It resolves the message using the standard priority chain but accepts
 * a simpler set of parameters.
 *
 * @example
 * ```ts
 * defaultMessage('email', 'required', {
 *   defaultMessages: {
 *     required: 'This field is required.'
 *   }
 * })
 * // → 'This field is required.'
 *
 * defaultMessage('age', 'min', {
 *   parameters: 18,
 *   defaultMessages: {
 *     min: 'Please enter a value greater than or equal to {0}.'
 *   }
 * })
 * // → 'Please enter a value greater than or equal to 18.'
 * ```
 *
 * @param fieldName - The field/element name
 * @param method - The validation method name
 * @param options - Additional resolution options (parameters, messages, etc.)
 * @returns The resolved and formatted error message string
 */
export function defaultMessage(
  fieldName: string,
  method: string,
  options: Omit<MessageResolveOptions, 'fieldName' | 'method'> = {}
): string {
  return resolveMessage({
    fieldName,
    method,
    ...options,
  });
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Performs the actual `{n}` parameter substitution in a template string.
 *
 * Uses a single-pass regex replacement with `/\{(\d+)\}/g` for efficiency,
 * looking up each matched index in the params array.
 *
 * If a placeholder references an index beyond the params array length,
 * the placeholder is left unchanged in the output (matches jQuery Validation behavior
 * where `replace` with an undefined replacement value leaves the match intact or
 * replaces it with the string "undefined").
 *
 * @param template - Message template with `{n}` placeholders
 * @param params - Array of parameter values
 * @returns Formatted string with placeholders replaced
 */
function substituteParams(template: string, params: unknown[]): string {
  return template.replace(PARAM_PLACEHOLDER_REGEX, (match, indexStr: string) => {
    const index = parseInt(indexStr, 10);
    if (index < params.length && params[index] !== undefined && params[index] !== null) {
      return String(params[index]);
    }
    // If no matching param, leave the placeholder as-is
    // (jQuery Validation would produce "undefined" but leaving the placeholder
    // is more useful for debugging)
    return match;
  });
}

/**
 * Apply a message that can be a string or a function, then format it with parameters.
 *
 * - If the message is a function, call it with `(parameters)` and use the result.
 * - If the resulting string contains `{n}` patterns, format with parameters.
 *
 * @param message - The message (string or function)
 * @param parameters - The rule parameters for formatting
 * @returns The final formatted message string
 */
function applyMessage(
  message: string | ((...args: any[]) => string),
  parameters?: RuleParameter
): string {
  // If the message is a function, call it with the parameters
  let resolvedMessage: string;
  if (typeof message === 'function') {
    resolvedMessage = message(parameters);
  } else {
    resolvedMessage = message;
  }

  // If the message contains {n} patterns, format with parameters
  if (PARAM_PLACEHOLDER_REGEX.test(resolvedMessage) && parameters !== undefined) {
    // Normalize parameters for substitution
    let normalizedParams: unknown[];
    if (Array.isArray(parameters)) {
      normalizedParams = parameters;
    } else {
      normalizedParams = [parameters];
    }

    // Need to reset regex lastIndex since we used test() above
    PARAM_PLACEHOLDER_REGEX.lastIndex = 0;

    return substituteParams(resolvedMessage, normalizedParams);
  }

  // Reset regex lastIndex even if no substitution needed
  PARAM_PLACEHOLDER_REGEX.lastIndex = 0;

  return resolvedMessage;
}
