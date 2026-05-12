/**
 * IMS Validation - Validator Registry
 *
 * Provides rule normalization utilities that implement the
 * `$.validator.normalizeRule()` and `$.validator.normalizeRules()` functions
 * from jQuery Validation 1.11.1.
 *
 * These functions convert rule data from various formats into a consistent
 * `NormalizedRules` object, handling dependency parameters, function
 * parameters, and numeric conversions.
 *
 * @module ims-validation/validator-registry
 */

import type {
  NormalizedRules,
  ValidationRule,
  RuleParameter,
  DependencyParam,
  FieldElement,
} from './types';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for native DOM Element.
 * Distinguishes from FieldElement by checking for `nodeName` or `tagName`
 * properties that exist on native DOM elements but not on FieldElement.
 */
function isNativeElement(el: unknown): el is Element {
  return (
    el != null &&
    typeof el === 'object' &&
    typeof (el as Element).getAttribute === 'function' &&
    ('nodeName' in (el as object) || 'tagName' in (el as object))
  );
}

// ============================================================================
// normalizeRule
// ============================================================================

/**
 * Normalize a single field's rule definition into `NormalizedRules` format.
 *
 * Maps `$.validator.normalizeRule(data)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * normalizeRule: function(data) {
 *     if (typeof data === "string") {
 *         return {method: data, parameters: true};
 *     }
 *     return data;
 * }
 * ```
 *
 * This TypeScript version handles the broader type system where
 * `FieldRules[fieldName]` can be:
 *   - A `string` like `"required"` → `{ required: true }`
 *   - A `ValidationRule[]` like `[{ method: 'required', parameters: true }]`
 *   - A `NormalizedRules` like `{ required: true, minlength: 5 }`
 *   - `undefined` (no rules for this field)
 *
 * @param data - The rule data to normalize
 * @returns Normalized rules object, or empty object if data is falsy
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function normalizeRule(
  data: ValidationRule[] | NormalizedRules | string | undefined,
): NormalizedRules {
  if (!data) {
    return {};
  }

  if (typeof data === 'string') {
    return { [data]: true };
  }

  if (Array.isArray(data)) {
    // ValidationRule[] → NormalizedRules
    const rules: NormalizedRules = {};
    for (const rule of data) {
      rules[rule.method] = rule.parameters;
    }
    return rules;
  }

  // Already NormalizedRules — return a shallow copy to avoid mutation
  return { ...data };
}

// ============================================================================
// normalizeRules
// ============================================================================

/**
 * Normalize a combined rules object by processing dependency parameters,
 * evaluating function parameters, and converting numeric rules.
 *
 * Maps `$.validator.normalizeRules(rules, element)` from jQuery Validation 1.11.1.
 *
 * In the original source:
 * ```js
 * normalizeRules: function(rules, element) {
 *     $.each(rules, function(prop, val) {
 *         if (val === undefined || val === false) {
 *             delete rules[prop];
 *             return;
 *         }
 *         if (val.param || val.depends) {
 *             var keepRule = true;
 *             switch (typeof val.depends) {
 *                 case "string":
 *                     keepRule = !!$(val.depends, element.form).length;
 *                     break;
 *                 case "function":
 *                     keepRule = val.depends.call(element, element);
 *                     break;
 *             }
 *             if (keepRule) {
 *                 rules[prop] = val.param !== undefined ? val.param : true;
 *             } else {
 *                 delete rules[prop];
 *             }
 *         }
 *     });
 *     $.each(rules, function(rule, parameter) {
 *         rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
 *     });
 *     $.each(['min', 'max'], function(i, minMax) {
 *         if (rules[minMax]) {
 *             rules[minMax] = Number(rules[minMax]);
 *         }
 *     });
 *     $.each(['maxlength', 'minlength'], function(i, minMaxLength) {
 *         if (rules[minMaxLength]) {
 *             rules[minMaxLength] = Number(rules[minMaxLength]);
 *         }
 *     });
 *     return rules;
 * }
 * ```
 *
 * @param rules - The combined rules object to normalize
 * @param element - Optional element context for evaluating dependencies
 * @returns A new NormalizedRules object with all values processed
 *
 * @see https://github.com/jzaefferer/jquery-validation/blob/1.11.1/jquery.validate.js
 */
export function normalizeRules(
  rules: NormalizedRules,
  element?: FieldElement | Element,
): NormalizedRules {
  const normalized: NormalizedRules = {};

  for (const method of Object.keys(rules)) {
    let value: RuleParameter | undefined = rules[method];

    // Skip undefined or explicitly false rules
    if (value === undefined || value === false) {
      continue;
    }

    // Handle DependencyParam: { param, depends }
    if (
      value != null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'depends' in (value as object)
    ) {
      const dep = value as unknown as DependencyParam;
      let keepRule = true;

      if (typeof dep.depends === 'function') {
        try {
          keepRule = dep.depends(element as FieldElement);
        } catch {
          keepRule = false;
        }
      } else if (typeof dep.depends === 'string') {
        // String selector dependency — in the original jQuery code this uses
        // `$(selector, element.form).length` to check if the selector matches.
        // Without jQuery/DOM query capability here, we conservatively set
        // keepRule = false unless we have a native DOM element to query against.
        keepRule = false;

        if (isNativeElement(element)) {
          try {
            const root = element.getRootNode() as Document | ShadowRoot;
            const target = root.querySelector(dep.depends);
            if (target) {
              // If the target is a checkbox, check if it's checked
              if (
                (target as HTMLInputElement).type === 'checkbox' &&
                !(target as HTMLInputElement).checked
              ) {
                keepRule = false;
              } else {
                keepRule = true;
              }
            }
          } catch {
            keepRule = false;
          }
        }
      }

      if (keepRule) {
        value = dep.param !== undefined ? dep.param : true;
      } else {
        // Dependency not met — skip this rule
        continue;
      }
    }

    // Evaluate function parameters
    if (typeof value === 'function') {
      try {
        value = (value as (el?: FieldElement | Element) => RuleParameter)(
          element as FieldElement,
        );
      } catch {
        continue;
      }
    }

    normalized[method] = value;
  }

  // Convert numeric rule parameters (matching jQuery Validation behavior)
  const numericMethods = ['min', 'max', 'minlength', 'maxlength'] as const;
  for (const numMethod of numericMethods) {
    if (numMethod in normalized && normalized[numMethod] !== undefined) {
      normalized[numMethod] = Number(normalized[numMethod]);
    }
  }

  return normalized;
}
