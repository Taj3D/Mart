/**
 * IMS Validation - Unobtrusive Parser
 *
 * Implements the HTML attribute parsing system from Microsoft jQuery
 * Unobtrusive Validation, which scans DOM elements for `data-val-*`
 * attributes and converts them into validation rules and messages.
 *
 * The parser replaces two key functions from the original library:
 *   - `parseElement(element, skipAttach)` — Parse a single element
 *   - `parse(selector)` — Parse all elements within a selector
 *
 * In the original source:
 * ```js
 * parseElement: function(element, skipAttach) {
 *     var $element = $(element),
 *         form = $element.parents("form")[0],
 *         valInfo, rules, messages;
 *     if (!form) return;
 *     valInfo = validationInfo(form);
 *     valInfo.options.rules[element.name] = rules = {};
 *     valInfo.options.messages[element.name] = messages = {};
 *     $.each(this.adapters, function() {
 *         var prefix = "data-val-" + this.name,
 *             message = $element.attr(prefix),
 *             paramValues = {};
 *         if (message !== undefined) {
 *             prefix += "-";
 *             $.each(this.params, function() {
 *                 paramValues[this] = $element.attr(prefix + this);
 *             });
 *             this.adapt({
 *                 element: element,
 *                 form: form,
 *                 message: message,
 *                 params: paramValues,
 *                 rules: rules,
 *                 messages: messages
 *             });
 *         }
 *     });
 *     $.extend(rules, { "__dummy__": true });
 *     if (!skipAttach) { valInfo.attachValidation(); }
 * }
 * ```
 *
 * @module ims-validation/unobtrusive-parser
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import type {
  AdapterOptions,
  ParsedFieldValidation,
  ParsedFormValidation,
  UnobtrusiveGlobalOptions,
} from './unobtrusive-types';

import type { NormalizedRules, FieldRules, ValidationMessages } from './types';

import { ImsAdapterRegistry, globalAdapterRegistry } from './unobtrusive-adapters';

// ============================================================================
// Parse Element
// ============================================================================

/**
 * Parse a single HTML element for unobtrusive validation attributes.
 *
 * Maps `$.validator.unobtrusive.parseElement(element, skipAttach)` from
 * the original source.
 *
 * For each registered adapter, checks if the element has a corresponding
 * `data-val-{adapterName}` attribute. If found, extracts the message
 * and parameter values, then calls the adapter's `adapt` function to
 * populate the rules and messages.
 *
 * The original behavior of adding `__dummy__: true` to rules is preserved
 * to ensure the field is tracked even if no real rules are detected.
 *
 * @param element - The HTML element to parse (must be within a form)
 * @param registry - The adapter registry to use (default: global registry)
 * @returns Parsed field validation, or `null` if the element has no
 *   validation attributes or is not within a form
 *
 * @example
 * ```ts
 * // Given: <input name="email" data-val="true" data-val-email="Invalid email" data-val-required="Required">
 * const parsed = parseElement(inputElement);
 * // → {
 * //     fieldName: 'email',
 * //     rules: { required: true, email: true, __dummy__: true },
 * //     messages: { required: 'Required', email: 'Invalid email' },
 * //     hasValidation: true
 * //   }
 * ```
 */
export function parseElement(
  element: HTMLElement,
  registry: ImsAdapterRegistry = globalAdapterRegistry,
): ParsedFieldValidation | null {
  // Find the parent form
  const form = element.closest('form');
  if (!form) {
    // Cannot do client-side validation without a form
    return null;
  }

  // Check if validation is enabled on this element
  const hasValidation = element.getAttribute('data-val') === 'true';

  const fieldName = (element as HTMLInputElement).name || element.id || '';
  if (!fieldName) {
    return null;
  }

  const rules: NormalizedRules = {};
  const messages: Record<string, string> = {};

  // Process each adapter
  for (const adapter of registry.adapters) {
    const prefix = `data-val-${adapter.name}`;
    const message = element.getAttribute(prefix);

    // Compare against undefined (empty message is legal and falsy)
    if (message !== null && message !== undefined) {
      const paramPrefix = `${prefix}-`;
      const paramValues: Record<string, string | undefined> = {};

      // Extract parameter values from data-val-{adapterName}-{param} attributes
      for (const paramName of adapter.params) {
        const paramValue = element.getAttribute(`${paramPrefix}${paramName}`);
        if (paramValue !== null) {
          paramValues[paramName] = paramValue;
        }
      }

      // Create the adapter options and call the adapter function
      const options: AdapterOptions = {
        element,
        form,
        message,
        params: paramValues,
        rules,
        messages,
      };

      adapter.adapt(options);
    }
  }

  // Add __dummy__ rule to ensure the field is tracked
  // (original: $.extend(rules, { "__dummy__": true }))
  if (hasValidation || Object.keys(rules).length > 0) {
    rules.__dummy__ = true;
  }

  return {
    fieldName,
    rules,
    messages,
    hasValidation,
  };
}

// ============================================================================
// Parse Form / Container
// ============================================================================

/**
 * Parse all elements within a container for unobtrusive validation attributes.
 *
 * Maps `$.validator.unobtrusive.parse(selector)` from the original source:
 * ```js
 * parse: function(selector) {
 *     var $selector = $(selector),
 *         $forms = $selector.parents().addBack().filter("form")
 *                       .add($selector.find("form"))
 *                       .has("[data-val=true]");
 *     $selector.find("[data-val=true]").each(function() {
 *         $jQval.unobtrusive.parseElement(this, true);
 *     });
 *     $forms.each(function() {
 *         var info = validationInfo(this);
 *         if (info) { info.attachValidation(); }
 *     });
 * }
 * ```
 *
 * This function:
 *   1. Finds all elements with `data-val="true"` within the container
 *   2. Parses each element individually
 *   3. Collects all rules and messages into a combined result
 *
 * @param container - The container element to parse within
 * @param registry - The adapter registry to use (default: global registry)
 * @returns Parsed form validation with all collected rules and messages
 *
 * @example
 * ```ts
 * const parsed = parseForm(document.getElementById('myForm'));
 * // → {
 * //     form: <form>,
 * //     fields: { email: {...}, password: {...} },
 * //     rules: { email: { required: true, email: true }, password: { minlength: 8 } },
 * //     messages: { email: { required: 'Required', email: 'Invalid' }, ... },
 * //     errorClass: 'input-validation-error',
 * //     validClass: 'input-validation-valid',
 * //     errorElement: 'span'
 * //   }
 * ```
 */
export function parseForm(
  container: HTMLElement,
  registry: ImsAdapterRegistry = globalAdapterRegistry,
): ParsedFormValidation {
  const form = container.tagName === 'FORM'
    ? container as HTMLFormElement
    : container.querySelector('form') as HTMLFormElement | null;

  const fields: Record<string, ParsedFieldValidation> = {};
  const rules: Record<string, NormalizedRules> = {};
  const messages: Record<string, Record<string, string>> = {};

  // Find all elements with data-val="true"
  const validatedElements = container.querySelectorAll('[data-val="true"]');

  for (let i = 0; i < validatedElements.length; i++) {
    const element = validatedElements[i] as HTMLElement;
    const parsed = parseElement(element, registry);

    if (parsed && parsed.hasValidation) {
      fields[parsed.fieldName] = parsed;
      rules[parsed.fieldName] = parsed.rules;
      messages[parsed.fieldName] = parsed.messages;
    }
  }

  return {
    form: form || (container as HTMLFormElement),
    fields,
    rules,
    messages,
    errorClass: 'input-validation-error',
    validClass: 'input-validation-valid',
    errorElement: 'span',
  };
}

// ============================================================================
// Parse to React Hook Form Config
// ============================================================================

/**
 * Convert parsed unobtrusive validation into a format compatible with
 * the ImsValidationProvider component.
 *
 * This bridges the gap between HTML attribute-based validation config
 * and the React props-based configuration used by ImsValidationProvider.
 *
 * @param parsed - The parsed form validation result
 * @returns Object with `rules` and `messages` in ImsValidationProvider format
 *
 * @example
 * ```ts
 * const parsed = parseForm(formElement);
 * const { rules: fieldRules, messages: fieldMessages } = toValidationConfig(parsed);
 *
 * <ImsValidationProvider rules={fieldRules} messages={fieldMessages}>
 *   <form>...</form>
 * </ImsValidationProvider>
 * ```
 */
export function toValidationConfig(parsed: ParsedFormValidation): {
  rules: FieldRules;
  messages: ValidationMessages;
} {
  // Remove __dummy__ rules from the output — they're only needed internally
  const cleanRules: FieldRules = {};
  for (const [fieldName, fieldRules] of Object.entries(parsed.rules)) {
    const { __dummy__, ...rest } = fieldRules as Record<string, unknown>;
    cleanRules[fieldName] = rest as NormalizedRules;
  }

  // Convert messages to ValidationMessages format
  const validationMessages: ValidationMessages = {};
  for (const [fieldName, fieldMessages] of Object.entries(parsed.messages)) {
    validationMessages[fieldName] = fieldMessages;
  }

  return {
    rules: cleanRules,
    messages: validationMessages,
  };
}

// ============================================================================
// Parse from Props Configuration
// ============================================================================

/**
 * A declarative validation field configuration that mirrors the
 * `data-val-*` attribute system but uses TypeScript objects instead.
 *
 * This is the React-friendly alternative to HTML attribute parsing.
 * Instead of writing:
 * ```html
 * <input data-val="true"
 *        data-val-required="This field is required"
 *        data-val-email="Invalid email"
 *        data-val-regex="Invalid format"
 *        data-val-regex-pattern="^[a-z]+$" />
 * ```
 *
 * You write:
 * ```ts
 * const fields: UnobtrusiveFieldConfig[] = [{
 *   name: 'email',
 *   adapters: {
 *     required: { message: 'This field is required' },
 *     email: { message: 'Invalid email' },
 *     regex: { message: 'Invalid format', params: { pattern: '^[a-z]+$' } }
 *   }
 * }];
 * ```
 */
export interface UnobtrusiveFieldConfig {
  /** Field name */
  name: string;
  /** Adapter configurations keyed by adapter name */
  adapters: Record<string, {
    /** The validation message for this adapter */
    message: string;
    /** Parameter values for this adapter */
    params?: Record<string, string | number | boolean>;
  }>;
}

/**
 * Parse a declarative field configuration into rules and messages.
 *
 * This is the React equivalent of `parseElement()` — instead of reading
 * HTML attributes, it processes a TypeScript configuration object through
 * the same adapter system.
 *
 * @param fields - Array of field configurations
 * @param registry - The adapter registry to use (default: global registry)
 * @returns Parsed form validation result
 *
 * @example
 * ```ts
 * const parsed = parseFieldConfig([
 *   {
 *     name: 'email',
 *     adapters: {
 *       required: { message: 'Email is required' },
 *       email: { message: 'Enter a valid email' }
 *     }
 *   },
 *   {
 *     name: 'password',
 *     adapters: {
 *       required: { message: 'Password is required' },
 *       password: {
 *         message: 'Password too weak',
 *         params: { min: '8', nonalphamin: '1' }
 *       }
 *     }
 *   }
 * ]);
 * ```
 */
export function parseFieldConfig(
  fields: UnobtrusiveFieldConfig[],
  registry: ImsAdapterRegistry = globalAdapterRegistry,
): ParsedFormValidation {
  const parsedFields: Record<string, ParsedFieldValidation> = {};
  const allRules: Record<string, NormalizedRules> = {};
  const allMessages: Record<string, Record<string, string>> = {};

  // Create a mock form element for adapters that need it
  const mockForm = typeof document !== 'undefined'
    ? document.createElement('form')
    : ({} as HTMLFormElement);

  for (const field of fields) {
    const rules: NormalizedRules = {};
    const messages: Record<string, string> = {};

    for (const [adapterName, adapterConfig] of Object.entries(field.adapters)) {
      // Find the adapter
      const adapter = registry.find(adapterName);
      if (!adapter) {
        continue;
      }

      // Build param values
      const paramValues: Record<string, string | undefined> = {};
      if (adapterConfig.params) {
        for (const [key, value] of Object.entries(adapterConfig.params)) {
          paramValues[key] = String(value);
        }
      }

      // Create mock element
      const mockElement = typeof document !== 'undefined'
        ? document.createElement('input')
        : ({} as HTMLElement);
      (mockElement as HTMLInputElement).name = field.name;

      // Create adapter options
      const options: AdapterOptions = {
        element: mockElement,
        form: mockForm,
        message: adapterConfig.message,
        params: paramValues,
        rules,
        messages,
      };

      // Run the adapter
      adapter.adapt(options);
    }

    // Add __dummy__ rule
    if (Object.keys(rules).length > 0) {
      rules.__dummy__ = true;
    }

    parsedFields[field.name] = {
      fieldName: field.name,
      rules,
      messages,
      hasValidation: true,
    };

    allRules[field.name] = rules;
    allMessages[field.name] = messages;
  }

  return {
    form: mockForm,
    fields: parsedFields,
    rules: allRules,
    messages: allMessages,
    errorClass: 'input-validation-error',
    validClass: 'input-validation-valid',
    errorElement: 'span',
  };
}

// ============================================================================
// Global Options
// ============================================================================

/**
 * Global unobtrusive validation options.
 *
 * Maps `$.validator.unobtrusive.options` from the original source,
 * which provides defaults for error class, error element, and lifecycle
 * callbacks that override the standard jQuery Validate defaults.
 */
export const unobtrusiveOptions: UnobtrusiveGlobalOptions = {
  errorClass: 'input-validation-error',
  errorElement: 'span',
};

/**
 * Update global unobtrusive validation options.
 *
 * @param options - Partial options to merge into the global config
 */
export function setUnobtrusiveOptions(
  options: Partial<UnobtrusiveGlobalOptions>,
): void {
  Object.assign(unobtrusiveOptions, options);
}
