/**
 * IMS Validation - Rule Resolver
 *
 * Implements the multi-source rule resolution system from jQuery Validation 1.11.1,
 * which collects validation rules from class attributes, HTML attributes,
 * data attributes, and static settings.
 *
 * In jQuery Validation, rules for a field are assembled from four sources:
 *   1. CSS class names → `$.validator.classRules(element)`
 *   2. HTML attributes → `$.validator.attributeRules(element)`
 *   3. Data attributes  → `$.validator.dataRules(element)`
 *   4. Static settings  → `$.validator.staticRules(element)`
 *
 * These are combined in `$.validator.prototype.rules()` which also moves
 * `required` to the front and normalizes the result.
 *
 * All functions accept both `FieldElement` interface objects AND native DOM
 * elements, using type guards to handle both cases.
 *
 * @module ims-validation/rule-resolver
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */

import type {
  NormalizedRules,
  ValidationRule,
  FieldElement,
  ClassRuleSettings,
  ValidatorSettings,
} from './types';

import { BUILTIN_METHOD_NAMES } from './types';
import { normalizeRule, normalizeRules } from './validator-registry';

// ============================================================================
// Resolve Rules Options
// ============================================================================

/**
 * Options for the master rule resolver.
 *
 * Provides all the context needed to assemble rules from every source:
 * the element itself (for class/attribute/data rules), the class rule
 * settings, and the validator settings (for static rules).
 */
export interface ResolveRulesOptions {
  /** The form field element (FieldElement or native DOM Element) */
  element: FieldElement | Element;
  /** CSS class-to-rules mapping (maps `$.validator.classRuleSettings`) */
  classRuleSettings?: ClassRuleSettings;
  /** Validator configuration with static rules (maps `$.validator.settings`) */
  settings?: ValidatorSettings;
}

// ============================================================================
// Type Guards & Element Helpers
// ============================================================================

/**
 * Type guard for native DOM Element.
 *
 * Distinguishes from `FieldElement` by checking for `nodeName` or `tagName`
 * properties that exist on native DOM elements but not on the `FieldElement`
 * interface.
 *
 * @param el - The value to check
 * @returns `true` if the value is a native DOM Element
 */
function isNativeElement(el: unknown): el is Element {
  return (
    el != null &&
    typeof el === 'object' &&
    typeof (el as Element).getAttribute === 'function' &&
    ('nodeName' in (el as object) || 'tagName' in (el as object))
  );
}

/**
 * Get the class names from an element as an array of strings.
 *
 * Handles both `FieldElement` (via `getAttribute('class')`) and native DOM
 * elements (via `className`, `classList`, or `getAttribute('class')`).
 * Also handles SVG elements where `className` is an `SVGAnimatedString`.
 *
 * @param element - The element to get class names from
 * @returns Array of class name strings (empty if none)
 */
function getClassNames(element: FieldElement | Element): string[] {
  if (isNativeElement(element)) {
    const el = element as HTMLElement;

    // SVG elements have SVGAnimatedString for className
    const rawClassName: string | SVGAnimatedString | null = el.className;

    // Handle SVGAnimatedString (SVG elements)
    if (rawClassName != null && typeof rawClassName === 'object') {
      const svgClass = rawClassName as SVGAnimatedString;
      if (svgClass.baseVal) {
        return svgClass.baseVal.split(/\s+/).filter(Boolean);
      }
    } else if (typeof rawClassName === 'string' && rawClassName) {
      return rawClassName.split(/\s+/).filter(Boolean);
    }

    if (el.classList && el.classList.length > 0) {
      return Array.from(el.classList);
    }

    // Fallback: getAttribute
    const classAttr = el.getAttribute('class');
    if (classAttr) {
      return classAttr.split(/\s+/).filter(Boolean);
    }

    return [];
  }

  // FieldElement: use getAttribute('class')
  const classAttr = (element as FieldElement).getAttribute('class');
  if (classAttr) {
    return classAttr.split(/\s+/).filter(Boolean);
  }

  return [];
}

/**
 * Get an attribute value from an element (FieldElement or native DOM).
 *
 * Both `FieldElement` and native DOM elements support `getAttribute()`,
 * so this is a simple delegation.
 *
 * @param element - The element to query
 * @param name - The attribute name
 * @returns The attribute value, or `null` if not present
 */
function getAttribute(
  element: FieldElement | Element,
  name: string,
): string | null {
  return element.getAttribute(name);
}

/**
 * Get the input type of an element.
 *
 * For native DOM elements, reads `element.type`. For `FieldElement`,
 * reads the `type` property directly.
 *
 * @param element - The element to get the type from
 * @returns The input type string, or empty string if unavailable
 */
function getElementType(element: FieldElement | Element): string {
  if (isNativeElement(element)) {
    return (element as HTMLInputElement).type || '';
  }
  return (element as FieldElement).type || '';
}

/**
 * Get the value of a `data-rule-{method}` attribute from an element.
 *
 * In jQuery Validation 1.11.1, data attributes are accessed via:
 * ```js
 * $element.data("rule" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase())
 * ```
 *
 * jQuery's `.data()` method converts kebab-case attribute names to camelCase
 * data keys. For example, `data-rule-required` is accessed as
 * `$element.data("ruleRequired")`.
 *
 * Since we use `getAttribute()` directly, we try multiple attribute name
 * formats to cover common authoring patterns:
 *   - `data-rule-{method}` — exact method name (e.g., `data-rule-required`)
 *   - `data-rule-{method.toLowerCase()}` — all lowercase
 *   - `data-rule-{kebab-case}` — for camelCase methods (e.g., `data-rule-date-iso` for `dateISO`)
 *
 * @param element - The element to query
 * @param method - The validation method name
 * @returns The attribute value, or `null` if not found
 */
function getDataRuleValue(
  element: FieldElement | Element,
  method: string,
): string | null {
  // Try exact method name: data-rule-{method}
  let value = getAttribute(element, 'data-rule-' + method);
  if (value !== null) return value;

  // Try all lowercase: data-rule-{method.toLowerCase()}
  const lowerMethod = method.toLowerCase();
  if (lowerMethod !== method) {
    value = getAttribute(element, 'data-rule-' + lowerMethod);
    if (value !== null) return value;
  }

  // Try kebab-case for camelCase methods: data-rule-date-iso for dateISO
  const kebabMethod = method.replace(/([A-Z])/g, '-$1').toLowerCase();
  if (kebabMethod !== method.toLowerCase()) {
    value = getAttribute(element, 'data-rule-' + kebabMethod);
    if (value !== null) return value;
  }

  return null;
}

/**
 * Convert a string value to an appropriate type for rule parameters.
 *
 * - Boolean-like strings (`"true"`, `"false"`) become actual booleans
 * - Number-like strings (`"5"`, `"3.14"`) become actual numbers
 * - Other strings remain as strings
 *
 * @param value - The string value to convert
 * @returns The converted value (boolean, number, or string)
 */
function convertParamValue(value: string): boolean | number | string {
  if (value === 'true') return true;
  if (value === 'false') return false;

  const trimmed = value.trim();
  if (trimmed === '') return value;

  const num = Number(trimmed);
  if (!isNaN(num)) return num;

  return value;
}

// ============================================================================
// classRules
// ============================================================================

/**
 * Extract validation rules from CSS class names on an element.
 *
 * Maps `$.validator.classRules(element)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * classRules: function(element) {
 *     var rules = {};
 *     var classes = $(element).attr('class');
 *     if (classes) {
 *         $.each(classes.split(' '), function() {
 *             if (this in $.validator.classRuleSettings) {
 *                 $.extend(rules, $.validator.classRuleSettings[this]);
 *             }
 *         });
 *     }
 *     return rules;
 * }
 * ```
 *
 * Each CSS class is looked up in `classRuleSettings`. If found, the
 * associated rules are merged into the result. Later classes override
 * earlier ones for the same method.
 *
 * @example
 * ```ts
 * // With classRuleSettings = { required: { required: true }, email: { email: true } }
 * // And element with class="required email"
 * classRules(element, classRuleSettings)
 * // → { required: true, email: true }
 * ```
 *
 * @param element - The form field element (FieldElement or native DOM)
 * @param classRuleSettings - Mapping of CSS class names to validation rules.
 *   Maps `$.validator.classRuleSettings`. If not provided, returns empty rules.
 * @returns Merged NormalizedRules from all matching classes
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function classRules(
  element: FieldElement | Element,
  classRuleSettings?: ClassRuleSettings,
): NormalizedRules {
  const rules: NormalizedRules = {};

  if (!classRuleSettings) {
    return rules;
  }

  const classNames = getClassNames(element);

  for (const cls of classNames) {
    if (cls in classRuleSettings) {
      const classRulesForClass = classRuleSettings[cls];
      // Merge each class's rules (later classes override earlier ones)
      for (const method of Object.keys(classRulesForClass)) {
        rules[method] = classRulesForClass[method];
      }
    }
  }

  return rules;
}

// ============================================================================
// attributeRules
// ============================================================================

/**
 * Extract validation rules from HTML attributes on an element.
 *
 * Maps `$.validator.attributeRules(element)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * attributeRules: function(element) {
 *     var rules = {};
 *     var $element = $(element);
 *     for (var method in $.validator.methods) {
 *         var value;
 *         if (method === "required") {
 *             value = $element.get(0).getAttribute(method);
 *             if (value === "") { value = true; }
 *         } else {
 *             value = $element.attr(method);
 *         }
 *         if (value) {
 *             rules[method] = value;
 *         }
 *     }
 *     if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
 *         delete rules.maxlength;
 *     }
 *     return rules;
 * }
 * ```
 *
 * Rule extraction behavior:
 *   - For each known validation method, checks if the element has a matching
 *     HTML attribute (e.g., `required`, `minlength`, `min`)
 *   - **required**: Empty string (boolean attribute present) is treated as `true`;
 *     `"false"` explicitly means not required
 *   - **min/max**: For inputs of type `number`, `range`, or `text`, the value
 *     is converted to a `Number`
 *   - **maxlength**: Removed if the value is `-1`, `2147483647`, or `524288`
 *     (these are browser defaults that don't represent actual constraints)
 *   - **type-to-method mapping**: If the input type matches a validation method
 *     name (e.g., `type="email"` → `{ email: true }`), the rule is added
 *   - **Exception**: HTML5 `type="range"` does NOT trigger the `range` validation
 *     method (the `range` input type is a numeric slider, not a range validator)
 *
 * @example
 * ```ts
 * // <input required minlength="5" type="email">
 * attributeRules(element)
 * // → { required: true, minlength: "5", email: true }
 * ```
 *
 * @param element - The form field element (FieldElement or native DOM)
 * @returns NormalizedRules extracted from HTML attributes
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function attributeRules(element: FieldElement | Element): NormalizedRules {
  const rules: NormalizedRules = {};
  const elementType = getElementType(element);

  // Check each known validation method for a matching HTML attribute
  for (const method of BUILTIN_METHOD_NAMES) {
    const attrValue = getAttribute(element, method);

    if (attrValue === null) {
      continue;
    }

    // Special handling for the 'required' attribute
    if (method === 'required') {
      if (attrValue === '' || attrValue === 'required') {
        // HTML5 boolean attribute present (e.g., <input required>)
        rules.required = true;
      } else if (attrValue === 'false') {
        // Explicitly not required — skip
        continue;
      } else {
        // Could be a selector or dependency expression
        rules.required = convertParamValue(attrValue);
      }
      continue;
    }

    // For min/max with number/range/text inputs, convert to Number
    if (
      (method === 'min' || method === 'max') &&
      (elementType === 'number' || elementType === 'range' || elementType === 'text')
    ) {
      const numValue = Number(attrValue);
      if (!isNaN(numValue)) {
        rules[method] = numValue;
      } else {
        rules[method] = attrValue;
      }
      continue;
    }

    // General case: add the attribute value as a string
    // (normalizeRules will convert numeric parameters later)
    if (attrValue !== null) {
      rules[method] = attrValue;
    }
  }

  // Remove maxlength with browser default values that don't represent real constraints.
  // Browsers set these as defaults:
  //   - -1: Opera/old browsers
  //   - 2147483647: IE (max 32-bit signed int)
  //   - 524288: Safari
  if ('maxlength' in rules) {
    const maxlengthStr = String(rules.maxlength);
    if (
      maxlengthStr === '-1' ||
      maxlengthStr === '2147483647' ||
      maxlengthStr === '524288'
    ) {
      delete rules.maxlength;
    }
  }

  // Type-to-method mapping: HTML5 input types that correspond to validation methods.
  // Exception: type="range" should NOT trigger the "range" validation method.
  const typeMethodMap: Record<string, string> = {
    email: 'email',
    url: 'url',
    number: 'number',
    date: 'date',
    digits: 'digits',
  };

  if (elementType && elementType !== 'range' && elementType in typeMethodMap) {
    const mappedMethod = typeMethodMap[elementType];
    // Only add if not already present from explicit attributes (attribute takes precedence)
    if (!(mappedMethod in rules)) {
      rules[mappedMethod] = true;
    }
  }

  return rules;
}

// ============================================================================
// dataRules
// ============================================================================

/**
 * Extract validation rules from `data-rule-*` attributes on an element.
 *
 * Maps `$.validator.dataRules(element)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * dataRules: function(element) {
 *     var method, value,
 *         rules = {},
 *         $element = $(element);
 *     for (method in $.validator.methods) {
 *         value = $element.data("rule" + method.charAt(0).toUpperCase()
 *                               + method.substring(1).toLowerCase());
 *         if (value !== undefined) {
 *             rules[method] = value;
 *         }
 *     }
 *     return rules;
 * }
 * ```
 *
 * jQuery's `.data()` method reads `data-*` attributes with automatic
 * camelCase conversion. For example, `data-rule-required` is read as
 * `$element.data("ruleRequired")`.
 *
 * In this implementation, we use `getAttribute()` directly and try
 * multiple attribute name formats (see `getDataRuleValue()`).
 *
 * Value conversion:
 *   - Boolean-like strings (`"true"`, `"false"`) → actual booleans
 *   - Number-like strings (`"5"`, `"3.14"`) → actual numbers
 *   - Other strings remain as strings
 *
 * @example
 * ```ts
 * // <input data-rule-required="true" data-rule-minlength="5">
 * dataRules(element)
 * // → { required: true, minlength: 5 }
 * ```
 *
 * @param element - The form field element (FieldElement or native DOM)
 * @returns NormalizedRules extracted from data-rule-* attributes
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function dataRules(element: FieldElement | Element): NormalizedRules {
  const rules: NormalizedRules = {};

  for (const method of BUILTIN_METHOD_NAMES) {
    const value = getDataRuleValue(element, method);

    if (value !== null) {
      rules[method] = convertParamValue(value);
    }
  }

  return rules;
}

// ============================================================================
// staticRules
// ============================================================================

/**
 * Get validation rules from the static `settings.rules` configuration.
 *
 * Maps `$.validator.staticRules(element)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * staticRules: function(element) {
 *     var rules = {};
 *     var validator = $.data(element.form, "validator");
 *     if (validator.settings.rules) {
 *         rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || rules;
 *     }
 *     return rules;
 * }
 * ```
 *
 * Looks up `settings.rules[fieldName]` and normalizes the result via
 * `normalizeRule()`. The field rules can be in any of these formats:
 *   - `NormalizedRules` (e.g., `{ required: true, minlength: 5 }`)
 *   - `ValidationRule[]` (e.g., `[{ method: 'required', parameters: true }]`)
 *   - `string` (e.g., `"required"` → `{ required: true }`)
 *   - `undefined` (no static rules for this field)
 *
 * @example
 * ```ts
 * const settings = {
 *   rules: {
 *     username: { required: true, minlength: 2 },
 *     email: [{ method: 'required', parameters: true }, { method: 'email', parameters: true }]
 *   }
 * };
 * staticRules('username', settings) // → { required: true, minlength: 2 }
 * staticRules('email', settings)    // → { required: true, email: true }
 * staticRules('phone', settings)    // → {}
 * ```
 *
 * @param fieldName - The field name to look up in settings.rules
 * @param settings - Validator settings containing the rules configuration.
 *   Maps `$.validator.settings`. If not provided or has no rules, returns empty.
 * @returns NormalizedRules from static configuration
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function staticRules(
  fieldName: string,
  settings?: ValidatorSettings,
): NormalizedRules {
  if (!settings?.rules) {
    return {};
  }

  const fieldRules = settings.rules[fieldName];
  return normalizeRule(fieldRules);
}

// ============================================================================
// resolveRules
// ============================================================================

/**
 * Master rule resolver that combines rules from all sources.
 *
 * Maps the combined logic of `$.validator.prototype.rules()` from
 * jQuery Validation 1.11.1, which assembles rules from four sources:
 *
 *   1. **classRules** — CSS class-to-rule mappings
 *   2. **attributeRules** — HTML attribute-based rules
 *   3. **dataRules** — `data-rule-*` attribute rules
 *   4. **staticRules** — `settings.rules[fieldName]` configuration
 *
 * In the original source:
 * ```js
 * rules: function() {
 *     var element = this[0];
 *     var data = $.validator.normalizeRule(
 *         $(element).data("rules")  // metadata extension
 *     ) || {};
 *     // ... combines classRules, attributeRules, dataRules, staticRules
 *     var rules = {};
 *     $.extend(rules, classRules, attributeRules, dataRules, staticRules, data);
 *     if (rules.required) {
 *         var param = rules.required;
 *         delete rules.required;
 *         rules = $.extend({required: param}, rules);
 *     }
 *     return $.validator.normalizeRules(rules, element);
 * }
 * ```
 *
 * After combining, if the `required` rule is present, it is moved to the
 * front of the rules object (jQuery Validation convention so that required
 * is always evaluated first). The combined rules are then normalized via
 * `normalizeRules()`.
 *
 * @example
 * ```ts
 * resolveRules('email', {
 *   element: inputElement,
 *   classRuleSettings: { required: { required: true } },
 *   settings: {
 *     rules: {
 *       email: { email: true }
 *     }
 *   }
 * })
 * // If element has class="required" and type="email":
 * // → { required: true, email: true }
 * ```
 *
 * @param fieldName - The field name (for static rules lookup)
 * @param options - Resolve options containing the element and settings
 * @returns The final normalized rules for the field
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function resolveRules(
  fieldName: string,
  options: ResolveRulesOptions,
): NormalizedRules {
  const { element, classRuleSettings, settings } = options;

  // Combine all sources (later sources override earlier for same method)
  const combined: NormalizedRules = {
    ...classRules(element, classRuleSettings),
    ...attributeRules(element),
    ...dataRules(element),
    ...staticRules(fieldName, settings),
  };

  // Move 'required' to the front (jQuery Validation behavior).
  // This ensures the required rule is always evaluated first, which matters
  // for error display order and dependency-mismatch short-circuiting.
  if ('required' in combined) {
    const requiredValue = combined.required;
    delete combined.required;
    const reordered: NormalizedRules = { required: requiredValue };
    // Copy remaining rules after required
    for (const key of Object.keys(combined)) {
      reordered[key] = combined[key];
    }
    return normalizeRules(reordered, element);
  }

  return normalizeRules(combined, element);
}

// ============================================================================
// rulesToList
// ============================================================================

/**
 * Convert a `NormalizedRules` object to a `ValidationRule[]` array format.
 *
 * This is the inverse of the normalization that produces `NormalizedRules`.
 * Useful when you need to iterate over rules in order or serialize them.
 *
 * @example
 * ```ts
 * rulesToList({ required: true, minlength: 5 })
 * // → [
 * //     { method: 'required', parameters: true },
 * //     { method: 'minlength', parameters: 5 }
 * //   ]
 * ```
 *
 * @param rules - The normalized rules object to convert
 * @returns Array of `ValidationRule` objects, one per rule
 */
export function rulesToList(rules: NormalizedRules): ValidationRule[] {
  return Object.entries(rules).map(([method, parameters]) => ({
    method,
    parameters,
  }));
}

// ============================================================================
// getFieldNames
// ============================================================================

/**
 * Get all unique field names from a form element.
 *
 * Maps the logic of `$.validator.prototype.elements()` from
 * jQuery Validation 1.11.1, which queries the form for all submittable
 * elements and returns them.
 *
 * In the original source:
 * ```js
 * elements: function() {
 *     var validator = this,
 *         rulesCache = {};
 *     return $(this.currentForm)
 *         .find("input, select, textarea")
 *         .not(":submit, :reset, :image, [disabled]")
 *         .not(this.settings.ignore)
 *         .filter(function() {
 *             if (!this.name && validator.settings.debug) {
 *                 console.error(...);
 *             }
 *             rulesCache[this.name] = true;
 *             return true;
 *         });
 * }
 * ```
 *
 * This function:
 *   - Queries for all `input`, `select`, `textarea` elements within the form
 *   - Excludes `submit`, `reset`, `image`, and `button` type inputs
 *   - Excludes disabled elements
 *   - Excludes elements without a `name` attribute
 *   - Returns unique field names (first occurrence only, preserves DOM order)
 *
 * @example
 * ```ts
 * // Given a form with:
 * // <input name="email" type="email">
 * // <input name="password" type="password">
 * // <input type="submit">
 * // <input name="email" type="hidden">  <!-- duplicate name -->
 * getFieldNames(formElement)
 * // → ['email', 'password']
 * ```
 *
 * @param formElement - The form element to query. If not provided or null,
 *   returns an empty array.
 * @returns Array of unique field name strings in DOM order
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function getFieldNames(
  formElement?: HTMLFormElement | Element | null,
): string[] {
  if (!formElement) {
    return [];
  }

  // Input types to exclude (non-data inputs)
  const excludedTypes = new Set([
    'submit',
    'reset',
    'image',
    'button',
  ]);

  const seen = new Set<string>();
  const names: string[] = [];

  const elements = formElement.querySelectorAll('input, select, textarea');

  for (let i = 0; i < elements.length; i++) {
    const input = elements[i] as HTMLInputElement;

    // Skip elements without a name
    if (!input.name) {
      continue;
    }

    // Skip disabled elements
    if (input.disabled) {
      continue;
    }

    // Skip excluded input types
    if (input.type && excludedTypes.has(input.type.toLowerCase())) {
      continue;
    }

    // Skip duplicate names (keep first occurrence only)
    if (seen.has(input.name)) {
      continue;
    }

    seen.add(input.name);
    names.push(input.name);
  }

  return names;
}
