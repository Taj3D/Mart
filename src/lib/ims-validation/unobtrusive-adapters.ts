/**
 * IMS Validation - Unobtrusive Adapter Registry
 *
 * Implements the adapter system from Microsoft jQuery Unobtrusive Validation,
 * which converts HTML `data-val-*` attributes into jQuery Validate rules.
 *
 * The adapter system is the core bridge between unobtrusive HTML attributes
 * and the validation engine. Each adapter handles a specific pattern of
 * attribute parsing:
 *
 *   - `addBool(name, ruleName)` — Boolean adapters (required, email, digits, etc.)
 *   - `addMinMax(name, minRule, maxRule, minMaxRule)` — Range adapters (length, range)
 *   - `addSingleVal(name, attr, ruleName)` — Single-value adapters (regex, extension)
 *   - `add(name, params, fn)` — Full custom adapters (equalto, remote, password)
 *
 * In the original source:
 * ```js
 * adapters = $jQval.unobtrusive.adapters;
 * adapters.addBool("creditcard").addBool("date").addBool("digits")...
 * adapters.addMinMax("length", "minlength", "maxlength", "rangelength")...
 * adapters.addSingleVal("regex", "pattern")...
 * adapters.add("equalto", ["other"], function(options) { ... })...
 * adapters.add("remote", ["url", "type", "additionalfields"], function(options) { ... })...
 * adapters.add("password", ["min", "nonalphamin", "regex"], function(options) { ... })...
 * ```
 *
 * @module ims-validation/unobtrusive-adapters
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import type {
  AdapterOptions,
  ValidationAdapter,
  AdapterRegistry as AdapterRegistryType,
} from './unobtrusive-types';

import type { RuleParameter } from './types';

// ============================================================================
// Helper: setValidationValues
// ============================================================================

/**
 * Set a validation rule value and optional message on an adapter options object.
 *
 * Maps the `setValidationValues(options, ruleName, value)` helper from
 * the original unobtrusive validation source:
 * ```js
 * function setValidationValues(options, ruleName, value) {
 *     options.rules[ruleName] = value;
 *     if (options.message) {
 *         options.messages[ruleName] = options.message;
 *     }
 * }
 * ```
 *
 * This is the fundamental operation performed by all adapters — setting
 * a rule with its parameter value and associating the message from the
 * `data-val-{adapterName}` attribute.
 *
 * @param options - The adapter options to populate
 * @param ruleName - The validation rule name (e.g., 'required', 'email')
 * @param value - The rule parameter value (e.g., `true`, `5`, `[2, 8]`)
 */
export function setValidationValues(
  options: AdapterOptions,
  ruleName: string,
  value: RuleParameter,
): void {
  options.rules[ruleName] = value;
  if (options.message) {
    options.messages[ruleName] = options.message;
  }
}

// ============================================================================
// Helper: splitAndTrim
// ============================================================================

/**
 * Split a comma-separated string and trim each value.
 *
 * Maps the `splitAndTrim(value)` helper from the original source.
 * Splits a string on commas, trimming whitespace from each part.
 *
 * Used by the `remote` adapter to parse the `additionalfields` parameter
 * (e.g., `"FirstName, LastName"` → `["FirstName", "LastName"]`).
 *
 * @param value - The comma-separated string to split
 * @returns Array of trimmed strings
 */
export function splitAndTrim(value: string): string[] {
  return value.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/g);
}

// ============================================================================
// Helper: escapeAttributeValue
// ============================================================================

/**
 * Escape special characters in a string for use as a CSS selector value.
 *
 * Maps the `escapeAttributeValue(value)` helper from the original source.
 * Escapes special CSS selector metacharacters by prefixing each with a backslash.
 *
 * This is needed when constructing jQuery selectors that include attribute
 * values containing special characters (e.g., field names with dots like
 * `Address.Street`). The special characters are escaped with a backslash
 * so jQuery doesn't interpret them as selector metacharacters.
 *
 * As noted in the original source: "As mentioned on http://api.jquery.com/category/selectors/"
 *
 * @param value - The string to escape
 * @returns The escaped string safe for use in CSS selectors
 */
export function escapeAttributeValue(value: string): string {
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\]\\^`{|}~])/g, '\\$1');
}

// ============================================================================
// Helper: getModelPrefix
// ============================================================================

/**
 * Get the model prefix from a dotted field name.
 *
 * Maps the `getModelPrefix(fieldName)` helper from the original source:
 * ```js
 * function getModelPrefix(fieldName) {
 *     return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
 * }
 * ```
 *
 * Used by the `equalto` adapter to resolve the full name of the comparison
 * target field when using ASP.NET MVC model prefix conventions.
 *
 * For example, with `fieldName = "Address.Street"`, the prefix is `"Address."`.
 * This allows the `*.OtherField` wildcard pattern in `data-val-equalto-other`
 * to be resolved to `"Address.OtherField"`.
 *
 * @param fieldName - The dotted field name (e.g., "Address.Street")
 * @returns The model prefix (e.g., "Address."), or empty string if no dot
 */
export function getModelPrefix(fieldName: string): string {
  const lastDotIndex = fieldName.lastIndexOf('.');
  return lastDotIndex >= 0 ? fieldName.substring(0, lastDotIndex + 1) : '';
}

// ============================================================================
// Helper: appendModelPrefix
// ============================================================================

/**
 * Append a model prefix to a field name, handling the `*.` wildcard.
 *
 * Maps the `appendModelPrefix(value, prefix)` helper from the original source:
 * ```js
 * function appendModelPrefix(value, prefix) {
 *     if (value.indexOf("*.") === 0) {
 *         value = value.replace("*.", prefix);
 *     }
 *     return value;
 * }
 * ```
 *
 * In ASP.NET MVC, the `data-val-equalto-other` attribute can use the `*.`
 * wildcard prefix to reference another field relative to the current model
 * prefix. For example:
 *   - `data-val-equalto-other="*.ConfirmPassword"` with prefix `"User."`
 *   - Resolves to `"User.ConfirmPassword"`
 *
 * If the value doesn't start with `*.`, it's returned unchanged (absolute name).
 *
 * @param value - The field name, possibly with `*.` wildcard prefix
 * @param prefix - The model prefix to substitute (from `getModelPrefix()`)
 * @returns The resolved field name
 */
export function appendModelPrefix(value: string, prefix: string): string {
  if (value.indexOf('*.') === 0) {
    return value.replace('*.', prefix);
  }
  return value;
}

// ============================================================================
// Adapter Registry Class
// ============================================================================

/**
 * Registry of validation adapters.
 *
 * Implements the `$.validator.unobtrusive.adapters` interface from the
 * original unobtrusive validation library. This is both an array of
 * adapter definitions and a factory object with convenience methods.
 *
 * In the original source:
 * ```js
 * $jQval.unobtrusive.adapters = [];
 * adapters.add = function(adapterName, params, fn) { ... };
 * adapters.addBool = function(adapterName, ruleName) { ... };
 * adapters.addMinMax = function(adapterName, minRule, maxRule, minMaxRule, minAttr, maxAttr) { ... };
 * adapters.addSingleVal = function(adapterName, attribute, ruleName) { ... };
 * ```
 *
 * The registry is initialized with all the default adapters that match
 * the original unobtrusive validation library:
 *   - `addBool`: creditcard, date, digits, email, number, url
 *   - `addMinMax`: length, range, minlength, maxlength
 *   - `addSingleVal`: regex, extension/accept
 *   - `add`: equalto, required, remote, password
 *
 * @example
 * ```ts
 * const registry = new ImsAdapterRegistry();
 *
 * // All default adapters are pre-registered
 * registry.find('email'); // → ValidationAdapter
 *
 * // Add custom adapter
 * registry.addBool('customRequired', 'required');
 * registry.addSingleVal('customPattern', 'pattern', 'regex');
 * ```
 */
export class ImsAdapterRegistry implements AdapterRegistryType {
  /** The list of registered adapters */
  adapters: ValidationAdapter[] = [];

  // ------------------------------------------------------------------------
  // Core Methods
  // ------------------------------------------------------------------------

  /**
   * Add a full custom adapter.
   *
   * Maps `adapters.add(adapterName, params, fn)` from the original source:
   * ```js
   * adapters.add = function(adapterName, params, fn) {
   *     if (!fn) {
   *         fn = params;
   *         params = [];
   *     }
   *     this.push({ name: adapterName, params: params, adapt: fn });
   *     return this;
   * }
   * ```
   *
   * Note: The original supports calling with just `(name, fn)` (no params),
   * which is detected by checking if `fn` is undefined. In TypeScript, we
   * use overloads for type safety.
   *
   * @param adapterName - The adapter name (matches `data-val-{name}` attribute)
   * @param params - Array of parameter names (from `data-val-{name}-{param}`)
   * @param fn - The adapter function that sets rules and messages
   * @returns The registry (for chaining)
   */
  add(
    adapterName: string,
    params: string[],
    fn: (options: AdapterOptions) => void,
  ): ImsAdapterRegistry;
  add(
    adapterName: string,
    fn: (options: AdapterOptions) => void,
  ): ImsAdapterRegistry;
  add(
    adapterName: string,
    paramsOrFn: string[] | ((options: AdapterOptions) => void),
    fn?: (options: AdapterOptions) => void,
  ): ImsAdapterRegistry {
    let actualParams: string[];
    let actualFn: (options: AdapterOptions) => void;

    if (typeof paramsOrFn === 'function') {
      // Called as add(name, fn) — no params
      actualParams = [];
      actualFn = paramsOrFn;
    } else {
      actualParams = paramsOrFn;
      actualFn = fn!;
    }

    this.adapters.push({
      name: adapterName,
      params: actualParams,
      adapt: actualFn,
    });

    return this;
  }

  /**
   * Add a boolean adapter — a validation rule with no parameter values.
   *
   * Maps `adapters.addBool(adapterName, ruleName)` from the original source:
   * ```js
   * adapters.addBool = function(adapterName, ruleName) {
   *     return this.add(adapterName, function(options) {
   *         setValidationValues(options, ruleName || adapterName, true);
   *     });
   * }
   * ```
   *
   * Boolean adapters set the rule value to `true`. Used for validators
   * that don't need parameters, like `email`, `url`, `digits`, etc.
   *
   * @param adapterName - The adapter name (matches `data-val-{name}`)
   * @param ruleName - Optional rule name override (defaults to adapterName)
   * @returns The registry (for chaining)
   */
  addBool(adapterName: string, ruleName?: string): ImsAdapterRegistry {
    return this.add(adapterName, (options) => {
      setValidationValues(options, ruleName || adapterName, true);
    });
  }

  /**
   * Add a min/max adapter — handles three potential rules based on
   * whether min, max, or both values are provided.
   *
   * Maps `adapters.addMinMax(adapterName, minRule, maxRule, minMaxRule, minAttr, maxAttr)`:
   * ```js
   * adapters.addMinMax = function(adapterName, minRuleName, maxRuleName,
   *     minMaxRuleName, minAttribute, maxAttribute) {
   *     return this.add(adapterName,
   *         [minAttribute || "min", maxAttribute || "max"],
   *         function(options) {
   *             var min = options.params.min,
   *                 max = options.params.max;
   *             if (min && max) {
   *                 setValidationValues(options, minMaxRuleName, [min, max]);
   *             } else if (min) {
   *                 setValidationValues(options, minRuleName, min);
   *             } else if (max) {
   *                 setValidationValues(options, maxRuleName, max);
   *             }
   *         }
   *     );
   * }
   * ```
   *
   * This adapter pattern supports three scenarios:
   *   - Only min provided → use `minRuleName` (e.g., `minlength`)
   *   - Only max provided → use `maxRuleName` (e.g., `maxlength`)
   *   - Both min and max → use `minMaxRuleName` (e.g., `rangelength`)
   *
   * @param adapterName - The adapter name
   * @param minRuleName - Rule name when only min is provided
   * @param maxRuleName - Rule name when only max is provided
   * @param minMaxRuleName - Rule name when both min and max are provided
   * @param minAttribute - Attribute name for min value (default: "min")
   * @param maxAttribute - Attribute name for max value (default: "max")
   * @returns The registry (for chaining)
   */
  addMinMax(
    adapterName: string,
    minRuleName: string,
    maxRuleName: string,
    minMaxRuleName: string,
    minAttribute?: string,
    maxAttribute?: string,
  ): ImsAdapterRegistry {
    return this.add(
      adapterName,
      [minAttribute || 'min', maxAttribute || 'max'],
      (options) => {
        const min = options.params[minAttribute || 'min'];
        const max = options.params[maxAttribute || 'max'];

        if (min && max) {
          setValidationValues(options, minMaxRuleName, [Number(min), Number(max)]);
        } else if (min) {
          setValidationValues(options, minRuleName, Number(min));
        } else if (max) {
          setValidationValues(options, maxRuleName, Number(max));
        }
      },
    );
  }

  /**
   * Add a single-value adapter — a validation rule with one parameter.
   *
   * Maps `adapters.addSingleVal(adapterName, attribute, ruleName)`:
   * ```js
   * adapters.addSingleVal = function(adapterName, attribute, ruleName) {
   *     return this.add(adapterName, [attribute || "val"], function(options) {
   *         setValidationValues(options, ruleName || adapterName, options.params[attribute]);
   *     });
   * }
   * ```
   *
   * @param adapterName - The adapter name
   * @param attribute - The attribute name for the parameter value (default: "val")
   * @param ruleName - Optional rule name override (defaults to adapterName)
   * @returns The registry (for chaining)
   */
  addSingleVal(
    adapterName: string,
    attribute?: string,
    ruleName?: string,
  ): ImsAdapterRegistry {
    const attr = attribute || 'val';
    return this.add(adapterName, [attr], (options) => {
      setValidationValues(options, ruleName || adapterName, options.params[attr]);
    });
  }

  // ------------------------------------------------------------------------
  // Lookup Methods
  // ------------------------------------------------------------------------

  /**
   * Find an adapter by name.
   *
   * @param name - The adapter name to find
   * @returns The adapter, or `undefined` if not found
   */
  find(name: string): ValidationAdapter | undefined {
    return this.adapters.find((a) => a.name === name);
  }

  /**
   * Get all registered adapter names.
   *
   * @returns Array of adapter name strings
   */
  getNames(): string[] {
    return this.adapters.map((a) => a.name);
  }

  /**
   * Check if an adapter with the given name exists.
   *
   * @param name - The adapter name to check
   * @returns `true` if the adapter is registered
   */
  has(name: string): boolean {
    return this.adapters.some((a) => a.name === name);
  }

  /**
   * Remove an adapter by name.
   *
   * @param name - The adapter name to remove
   * @returns `true` if an adapter was removed
   */
  remove(name: string): boolean {
    const index = this.adapters.findIndex((a) => a.name === name);
    if (index >= 0) {
      this.adapters.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove all adapters from the registry.
   */
  clear(): void {
    this.adapters = [];
  }
}

// ============================================================================
// Global Adapter Registry (with default adapters)
// ============================================================================

/**
 * Create a new adapter registry with all the default adapters from the
 * original Microsoft jQuery Unobtrusive Validation library.
 *
 * Default adapters registered:
 *   - `addBool`: creditcard, date, digits, email, number, url
 *   - `addMinMax`: length, range, minlength, maxlength
 *   - `addSingleVal`: regex, extension/accept
 *   - `add` (custom): equalto, required, remote, password
 *
 * In the original source, these are registered at the bottom of the IIFE:
 * ```js
 * adapters.addSingleVal("accept", "mimtype");
 * adapters.addSingleVal("extension", "extension");
 * adapters.addSingleVal("regex", "pattern");
 * adapters.addBool("creditcard").addBool("date").addBool("digits")
 *         .addBool("email").addBool("number").addBool("url");
 * adapters.addMinMax("length", "minlength", "maxlength", "rangelength")
 *         .addMinMax("range", "min", "max", "range");
 * adapters.addMinMax("minlength", "minlength").addMinMax("maxlength", "minlength", "maxlength");
 * adapters.add("equalto", ["other"], function(options) { ... });
 * adapters.add("required", function(options) { ... });
 * adapters.add("remote", ["url", "type", "additionalfields"], function(options) { ... });
 * adapters.add("password", ["min", "nonalphamin", "regex"], function(options) { ... });
 * ```
 *
 * @returns A fully populated ImsAdapterRegistry
 */
export function createDefaultAdapterRegistry(): ImsAdapterRegistry {
  const registry = new ImsAdapterRegistry();

  // ------------------------------------------------------------------
  // addSingleVal adapters
  // ------------------------------------------------------------------

  // regex adapter — data-val-regex + data-val-regex-pattern
  registry.addSingleVal('regex', 'pattern');

  // extension adapter — for file extension validation
  // In the original: checks if $.validator.methods.extension exists
  // If it does: separate accept (mimetype) and extension adapters
  // If not: extension maps to accept method for backward compatibility
  // We register both with their standard mappings:
  registry.addSingleVal('accept', 'mimtype');
  registry.addSingleVal('extension', 'extension');

  // ------------------------------------------------------------------
  // addBool adapters
  // ------------------------------------------------------------------

  registry
    .addBool('creditcard')
    .addBool('date')
    .addBool('digits')
    .addBool('email')
    .addBool('number')
    .addBool('url');

  // ------------------------------------------------------------------
  // addMinMax adapters
  // ------------------------------------------------------------------

  // length adapter → minlength/maxlength/rangelength
  registry
    .addMinMax('length', 'minlength', 'maxlength', 'rangelength')
    .addMinMax('range', 'min', 'max', 'range');

  // minlength and maxlength also support min/max attribute syntax
  registry
    .addMinMax('minlength', 'minlength', 'minlength', 'minlength')
    .addMinMax('maxlength', 'minlength', 'maxlength', 'maxlength');

  // ------------------------------------------------------------------
  // Custom adapters (add with custom adapt functions)
  // ------------------------------------------------------------------

  // equalto adapter — compares two fields
  // data-val-equalto + data-val-equalto-other
  registry.add('equalto', ['other'], (options) => {
    const prefix = getModelPrefix(options.element.name);
    const other = options.params.other;
    const fullOtherName = other ? appendModelPrefix(other, prefix) : '';

    // In the original, the equalTo rule receives the target element as the param.
    // In React, we pass the field name string which the validator can resolve.
    setValidationValues(options, 'equalTo', fullOtherName);
  });

  // required adapter — special handling for checkboxes
  // In the original: checkboxes are not made "required" by the unobtrusive
  // adapter because jQuery Validate equates "required" with "mandatory" for
  // checkboxes. Instead, checkbox validation is handled by the required
  // validator itself which checks the `checked` property.
  registry.add('required', (options) => {
    const tagName = options.element.tagName?.toUpperCase();
    const inputType = (options.element as HTMLInputElement).type?.toUpperCase();

    // For non-checkbox/non-radio inputs, add the required rule
    if (tagName !== 'INPUT' || (inputType !== 'CHECKBOX' && inputType !== 'RADIO')) {
      setValidationValues(options, 'required', true);
    }
  });

  // remote adapter — server-side validation via AJAX
  // data-val-remote + data-val-remote-url + data-val-remote-type + data-val-remote-additionalfields
  registry.add('remote', ['url', 'type', 'additionalfields'], (options) => {
    const remoteValue: {
      url: string;
      type: string;
      data: Record<string, () => string>;
    } = {
      url: options.params.url || '',
      type: options.params.type || 'GET',
      data: {},
    };

    const prefix = getModelPrefix(options.element.name);
    const additionalFields = options.params.additionalfields || options.element.name;
    const fieldNames = splitAndTrim(additionalFields);

    for (const fieldName of fieldNames) {
      const paramName = appendModelPrefix(fieldName, prefix);

      // In the original, data[paramName] is a function that reads the field
      // value at validation time (lazy evaluation). In React, we store the
      // field name and resolve it during validation.
      remoteValue.data[paramName] = () => {
        // Try to find the field in the form
        const selector = `[name='${escapeAttributeValue(paramName)}']`;
        const field = options.form.querySelector(selector) as HTMLInputElement | null;

        if (!field) {
          return '';
        }

        // Checkbox handling
        if (field.type === 'checkbox') {
          const checkedField = options.form.querySelector(
            `${selector}:checked`,
          ) as HTMLInputElement | null;
          const hiddenField = options.form.querySelector(
            `${selector}:hidden`,
          ) as HTMLInputElement | null;
          return checkedField?.value || hiddenField?.value || '';
        }

        // Radio button handling
        if (field.type === 'radio') {
          const checkedRadio = options.form.querySelector(
            `${selector}:checked`,
          ) as HTMLInputElement | null;
          return checkedRadio?.value || '';
        }

        return field.value;
      };
    }

    setValidationValues(options, 'remote', remoteValue as unknown as RuleParameter);
  });

  // password adapter — composite rule for password complexity
  // data-val-password + data-val-password-min + data-val-password-nonalphamin + data-val-password-regex
  registry.add('password', ['min', 'nonalphamin', 'regex'], (options) => {
    if (options.params.min) {
      setValidationValues(options, 'minlength', Number(options.params.min));
    }
    if (options.params.nonalphamin) {
      setValidationValues(options, 'nonalphamin', Number(options.params.nonalphamin));
    }
    if (options.params.regex) {
      setValidationValues(options, 'regex', options.params.regex);
    }
  });

  return registry;
}

// ============================================================================
// Global Singleton Registry
// ============================================================================

/**
 * Global adapter registry instance with all default adapters pre-registered.
 *
 * This is the equivalent of `$.validator.unobtrusive.adapters` in the
 * original library — a single shared registry that holds all adapter
 * definitions.
 *
 * You can add custom adapters to this registry:
 * ```ts
 * import { globalAdapterRegistry } from './unobtrusive-adapters';
 * globalAdapterRegistry.addBool('customValidation', 'customRule');
 * ```
 *
 * Or create a separate registry for isolated usage:
 * ```ts
 * import { createDefaultAdapterRegistry } from './unobtrusive-adapters';
 * const myRegistry = createDefaultAdapterRegistry();
 * myRegistry.addBool('customValidation');
 * ```
 */
export const globalAdapterRegistry = createDefaultAdapterRegistry();
