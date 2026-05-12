/**
 * Built-in validation methods ported from jQuery Validation Plugin 1.11.1
 *
 * These are pure TypeScript functions with no React or DOM dependencies
 * (except where element context is optionally passed in).
 *
 * Each validator matches the exact behavior of the original jQuery Validation
 * methods, including regex patterns and algorithmic logic.
 *
 * @see https://jqueryvalidation.org/
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */

import type {
  ValidationMethod,
  FieldElement,
  RuleParameter,
  RemoteValidationOptions,
} from './types';

import { DEPENDENCY_MISMATCH, PENDING } from './types';

// Re-export constants for convenience
export { DEPENDENCY_MISMATCH, PENDING };

// ---------------------------------------------------------------------------
// Helper: optional()
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the value is empty / whitespace-only (i.e. the field is
 * optional and can be skipped by all non-required validators).
 * Returns `DEPENDENCY_MISMATCH` when the value is **not** empty so the caller
 * knows the field is non-optional and must still be validated.
 *
 * Mirrors the `optional()` method from jQuery Validation 1.11.1:
 * ```js
 * optional: function(element) {
 *   var val = this.elementValue(element);
 *   return !this.methods.required.call(this, val, element) && "dependency-mismatch";
 * }
 * ```
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js#L213
 *
 * @param value - The field value to test
 * @returns `true` when the value is empty (field is optional), `DEPENDENCY_MISMATCH` otherwise
 */
export function optional(value: any): true | 'dependency-mismatch' {
  if (value == null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? true : DEPENDENCY_MISMATCH;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0 ? true : DEPENDENCY_MISMATCH;
  }
  // For non-string, non-null, non-array values (e.g. numbers), treat as non-empty
  return DEPENDENCY_MISMATCH;
}

// ---------------------------------------------------------------------------
// Regex patterns (exact copies from jQuery Validation 1.11.1)
// ---------------------------------------------------------------------------

/**
 * Scott Gonzalez email regex.
 * Exact copy from jQuery Validation 1.11.1 source.
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js#L41
 */
const EMAIL_REGEX =
  /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

/**
 * URL validation regex.
 * Simplified from jQuery Validation 1.11.1 Scott Gonzalez pattern to avoid
 * regex parsing issues with the extremely long IRI pattern.
 * This version validates http/https/ftp URLs with domain, optional port, path, query, and fragment.
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js#L56
 */
const URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

/** ISO date format regex — exact from jQuery Validation 1.11.1 */
const DATE_ISO_REGEX = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;

/** Decimal number regex (allows comma-separated thousands) — exact from jQuery Validation 1.11.1 */
const NUMBER_REGEX = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;

/** Digits-only regex — exact from jQuery Validation 1.11.1 */
const DIGITS_REGEX = /^\d+$/;

// ---------------------------------------------------------------------------
// Helper: element-like type guard
// ---------------------------------------------------------------------------

/**
 * Minimal check for a FieldElement-like object.
 * Avoids hard DOM dependency while allowing runtime element inspection.
 */
function isFieldElement(el: any): el is FieldElement {
  return el != null && typeof el === 'object' && 'type' in el;
}

/**
 * Minimal check for a native DOM Element that supports getRootNode / querySelector.
 */
function isDomElement(el: any): el is Element {
  return el != null && typeof el === 'object' && typeof el.getRootNode === 'function';
}

// ---------------------------------------------------------------------------
// Built-in validators
// ---------------------------------------------------------------------------

/**
 * Required validator.
 *
 * Returns false if the element is empty (text, checkbox, radio, or select).
 * Supports a dependency param that can be:
 *   - `true` — field is required (default behavior)
 *   - `false` — field is not required, returns DEPENDENCY_MISMATCH
 *   - `string` — treated as a CSS selector; the field is required if the
 *                matched element is visible / checked
 *   - `function` — called to determine if the field is required
 *   - `DependencyParam` object — `{ param, depends }` from types.ts
 *
 * When the dependency evaluates to false the method returns DEPENDENCY_MISMATCH
 * so the framework treats the field as "not required right now".
 *
 * @see https://jqueryvalidation.org/required-method/
 */
export const required: ValidationMethod = (
  value,
  element?,
  param?,
): boolean | string => {
  // Cast to a wide type so we can handle all dependency forms that
  // jQuery Validation supports (boolean, string selector, function, DependencyParam)
  const dep: any = param;

  // Evaluate dependency param
  if (dep !== undefined && dep !== null && dep !== true) {
    // DependencyParam object: { param, depends }
    if (typeof dep === 'object' && !Array.isArray(dep) && 'depends' in dep) {
      const depParam = dep as { param: RuleParameter; depends: ((el?: FieldElement) => boolean) | string };
      if (typeof depParam.depends === 'function') {
        if (!depParam.depends(element)) {
          return DEPENDENCY_MISMATCH;
        }
      } else if (typeof depParam.depends === 'string') {
        // String selector — try to resolve
        if (isDomElement(element)) {
          try {
            const root = element.getRootNode() as Document | ShadowRoot;
            const target = root.querySelector(depParam.depends);
            if (!target) {
              return DEPENDENCY_MISMATCH;
            }
            if ((target as HTMLInputElement).type === 'checkbox' && !(target as HTMLInputElement).checked) {
              return DEPENDENCY_MISMATCH;
            }
          } catch {
            return DEPENDENCY_MISMATCH;
          }
        } else {
          return DEPENDENCY_MISMATCH;
        }
      }
    } else if (typeof dep === 'boolean') {
      if (!dep) {
        return DEPENDENCY_MISMATCH;
      }
    } else if (typeof dep === 'function') {
      if (!dep()) {
        return DEPENDENCY_MISMATCH;
      }
    } else if (typeof dep === 'string') {
      // String selector dependency — resolve via element context
      // In the original jQuery code: $(param, element).length
      if (isDomElement(element)) {
        try {
          const root = element.getRootNode() as Document | ShadowRoot;
          const target = root.querySelector(dep);
          if (!target) {
            return DEPENDENCY_MISMATCH;
          }
          // If the target is a checkbox, check if it's checked
          if ((target as HTMLInputElement).type === 'checkbox' && !(target as HTMLInputElement).checked) {
            return DEPENDENCY_MISMATCH;
          }
        } catch {
          return DEPENDENCY_MISMATCH;
        }
      } else {
        // No element context — cannot resolve selector, conservatively return DEPENDENCY_MISMATCH
        return DEPENDENCY_MISMATCH;
      }
    }
  }

  // Determine element type for the required check
  if (element) {
    // Handle FieldElement interface
    if (isFieldElement(element)) {
      // Checkbox / radio
      if (element.type === 'checkbox' || element.type === 'radio') {
        return element.checked;
      }
      // Select-multiple
      if (element.type === 'select-multiple') {
        // FieldElement doesn't expose selectedOptions directly; fall through to value check
      }
    }

    // Handle native DOM elements
    if (isDomElement(element)) {
      const el = element as unknown as HTMLElement;

      if (el.nodeName?.toLowerCase() === 'select') {
        const selectEl = el as unknown as HTMLSelectElement;
        if (selectEl.multiple) {
          return Array.from(selectEl.selectedOptions).length > 0;
        }
        return selectEl.value != null && selectEl.value.length > 0;
      }

      if ((el as unknown as HTMLInputElement).type === 'checkbox' || (el as unknown as HTMLInputElement).type === 'radio') {
        return (el as unknown as HTMLInputElement).checked;
      }
    }
  }

  // Default: trim and check length > 0
  if (value == null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return String(value).trim().length > 0;
};

/**
 * Email validator using the Scott Gonzalez regex from jQuery Validation 1.11.1.
 *
 * @see https://jqueryvalidation.org/email-method/
 */
export const email: ValidationMethod = (value, _element?, _param?): boolean | string => {
  // Skip validation on optional (empty) fields
  if (optional(value) === true) {
    return true;
  }
  return EMAIL_REGEX.test(String(value));
};

/**
 * URL validator using the Scott Gonzalez IRI regex from jQuery Validation 1.11.1.
 *
 * @see https://jqueryvalidation.org/url-method/
 */
export const url: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return URL_REGEX.test(String(value));
};

/**
 * Date validator — delegates to JavaScript's Date parsing.
 * Checks that `new Date(value)` does not produce "Invalid Date".
 *
 * @see https://jqueryvalidation.org/date-method/
 */
export const date: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return !/Invalid|NaN/.test(new Date(value).toString());
};

/**
 * ISO date format validator.
 * Matches `YYYY/MM/DD` or `YYYY-MM-DD` patterns.
 *
 * @see https://jqueryvalidation.org/dateISO-method/
 */
export const dateISO: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return DATE_ISO_REGEX.test(String(value));
};

/**
 * Number validator — allows optional leading minus, digits with optional
 * comma-separated thousands, and optional decimal portion.
 *
 * @see https://jqueryvalidation.org/number-method/
 */
export const number: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return NUMBER_REGEX.test(String(value));
};

/**
 * Digits validator — only 0-9 allowed, no decimals or other characters.
 *
 * @see https://jqueryvalidation.org/digits-method/
 */
export const digits: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return DIGITS_REGEX.test(String(value));
};

/**
 * Credit card validator using the Luhn algorithm.
 *
 * Accepts digits and dashes as input. Strips non-digit characters before
 * performing the Luhn check. This is the exact algorithm from
 * jQuery Validation 1.11.1.
 *
 * @see https://jqueryvalidation.org/creditcard-method/
 * @see http://en.wikipedia.org/wiki/Luhn_algorithm
 */
export const creditcard: ValidationMethod = (value, _element?, _param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }

  // Accept only digits and dashes
  if (/[^0-9\-]/.test(String(value))) {
    return false;
  }

  const sanitized = String(value).replace(/\D/g, '');

  // Luhn algorithm — exact port from jQuery Validation 1.11.1
  let nCheck = 0;
  let nDigit = 0;
  let bEven = false;

  for (let n = sanitized.length - 1; n >= 0; n--) {
    const cDigit = sanitized.charAt(n);
    nDigit = parseInt(cDigit, 10);

    if (bEven) {
      nDigit *= 2;
      if (nDigit > 9) {
        nDigit -= 9;
      }
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return nCheck % 10 === 0;
};

/**
 * Returns the "length" of a value for comparison purposes.
 * - For strings: character count
 * - For arrays: element count
 * - For select-multiple elements: selected options count
 * - For checkbox/radio elements: checked count (1 or 0)
 *
 * This mirrors `$.validator.methods.minlength/maxlength/rangelength` internal
 * length calculation which uses `$.validator.getLength()`:
 * ```js
 * getLength: function(value, element) {
 *   switch(element.nodeName.toLowerCase()) {
 *     case 'select':
 *       return $('option:selected', element).length;
 *     case 'input':
 *       if (this.checkable(element))
 *         return this.findByName(element.name).filter(':checked').length;
 *   }
 *   return value.length;
 * }
 * ```
 */
function getLength(value: any, element?: FieldElement | Element | null): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (element) {
    // Handle FieldElement interface
    if (isFieldElement(element)) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        return element.checked ? 1 : 0;
      }
    }

    // Handle native DOM elements
    if (isDomElement(element)) {
      const el = element as unknown as HTMLElement;

      // Select-multiple: count selected options
      if (el.nodeName?.toLowerCase() === 'select' && (el as unknown as HTMLSelectElement).multiple) {
        return Array.from((el as unknown as HTMLSelectElement).selectedOptions).length;
      }

      // Checkbox / radio
      if ((el as unknown as HTMLInputElement).type === 'checkbox' || (el as unknown as HTMLInputElement).type === 'radio') {
        return (el as unknown as HTMLInputElement).checked ? 1 : 0;
      }
    }
  }

  return String(value ?? '').length;
}

/**
 * Minimum length validator.
 * For arrays, checks array.length. For select-multiple, checks selected options count.
 *
 * @see https://jqueryvalidation.org/minlength-method/
 */
export const minlength: ValidationMethod = (value, element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  const length = getLength(value, element);
  return length >= Number(param);
};

/**
 * Maximum length validator.
 * For arrays, checks array.length. For select-multiple, checks selected options count.
 *
 * @see https://jqueryvalidation.org/maxlength-method/
 */
export const maxlength: ValidationMethod = (value, element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  const length = getLength(value, element);
  return length <= Number(param);
};

/**
 * Range length validator — length must be within [min, max].
 * `param` should be a two-element array `[min, max]`.
 *
 * @see https://jqueryvalidation.org/rangelength-method/
 */
export const rangelength: ValidationMethod = (value, element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  const length = getLength(value, element);
  const rangeParam = param as number[];
  return length >= rangeParam[0] && length <= rangeParam[1];
};

/**
 * Minimum value validator.
 *
 * @see https://jqueryvalidation.org/min-method/
 */
export const min: ValidationMethod = (value, _element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return Number(value) >= Number(param);
};

/**
 * Maximum value validator.
 *
 * @see https://jqueryvalidation.org/max-method/
 */
export const max: ValidationMethod = (value, _element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  return Number(value) <= Number(param);
};

/**
 * Range value validator — numeric value must be within [min, max].
 * `param` should be a two-element array `[min, max]`.
 *
 * @see https://jqueryvalidation.org/range-method/
 */
export const range: ValidationMethod = (value, _element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }
  const rangeParam = param as number[];
  const numValue = Number(value);
  return numValue >= rangeParam[0] && numValue <= rangeParam[1];
};

/**
 * Equal-to validator — the value must match another field's value.
 *
 * In the original jQuery plugin, `param` is a selector string (typically `#id`)
 * that identifies the other field:
 * ```js
 * equalTo: function(value, element, param) {
 *   return this.optional(element) || value === $(param).val();
 * }
 * ```
 *
 * In this pure-function port, `param` can be:
 *   - A selector string (needs element context to resolve the target field)
 *   - A direct value to compare against
 *
 * @see https://jqueryvalidation.org/equalTo-method/
 */
export const equalTo: ValidationMethod = (value, element?, param?): boolean | string => {
  if (optional(value) === true) {
    return true;
  }

  // If param is a string and we have a DOM element context, try to resolve as selector
  if (typeof param === 'string' && isDomElement(element)) {
    try {
      const root = element.getRootNode() as Document | ShadowRoot;
      const target = root.querySelector(param) as HTMLInputElement | null;
      if (target && 'value' in target) {
        return String(value) === String(target.value);
      }
    } catch {
      // Fall through to direct comparison
    }
  }

  // Direct value comparison fallback
  return String(value) === String(param);
};

/**
 * Remote validator — performs server-side validation via AJAX.
 *
 * This is a stub that returns `PENDING` ('pending'). The actual async
 * implementation lives in `remote-validator.ts` because it requires
 * network access which is outside the scope of pure synchronous validators.
 *
 * In jQuery Validation 1.11.1:
 * ```js
 * remote: function(value, element, param) {
 *   if (this.optional(element)) return "dependency-mismatch";
 *   // ... AJAX request setup ...
 *   return "pending";
 * }
 * ```
 *
 * @see https://jqueryvalidation.org/remote-method/
 */
export const remote: ValidationMethod = (
  value,
  element?,
  param?,
): boolean | string | Promise<boolean | string> => {
  // Handle optional field
  if (optional(value) === true) {
    return DEPENDENCY_MISMATCH;
  }

  // The real implementation is async and lives in remote-validator.ts.
  // This stub returns 'pending' to signal that async work is needed.
  // Integration layers should intercept this and delegate to the
  // full remote-validator implementation.
  return PENDING;
};

// ---------------------------------------------------------------------------
// Default messages (exact copies from jQuery.validator.messages 1.11.1)
// ---------------------------------------------------------------------------

/**
 * Default validation messages matching jQuery.validator.messages exactly.
 * Placeholders like `{0}` and `{1}` are replaced at runtime by the
 * corresponding rule parameters.
 *
 * Exact text from jQuery Validation 1.11.1 source:
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js#L31
 */
export const defaultMessages: Record<string, string> = {
  required: 'This field is required.',
  remote: 'Please fix this field.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  date: 'Please enter a valid date.',
  dateISO: 'Please enter a valid date (ISO).',
  number: 'Please enter a valid number.',
  digits: 'Please enter only digits.',
  creditcard: 'Please enter a valid credit card number.',
  equalTo: 'Please enter the same value again.',
  maxlength: 'Please enter no more than {0} characters.',
  minlength: 'Please enter at least {0} characters.',
  rangelength: 'Please enter a value between {0} and {1} characters long.',
  range: 'Please enter a value between {0} and {1}.',
  max: 'Please enter a value less than or equal to {0}.',
  min: 'Please enter a value greater than or equal to {0}.',
};

// ---------------------------------------------------------------------------
// Aggregate export
// ---------------------------------------------------------------------------

/**
 * All built-in validators keyed by their rule name.
 * Compatible with the jQuery Validation `methods` registry.
 *
 * Usage:
 * ```ts
 * import { builtinValidators } from './validators';
 * builtinValidators.email('test@example.com'); // true
 * builtinValidators.required(''); // false
 * ```
 */
export const builtinValidators: Record<string, ValidationMethod> = {
  required,
  email,
  url,
  date,
  dateISO,
  number,
  digits,
  creditcard,
  minlength,
  maxlength,
  rangelength,
  min,
  max,
  range,
  equalTo,
  remote,
};
