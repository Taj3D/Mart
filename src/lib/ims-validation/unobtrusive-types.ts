/**
 * IMS Validation - Unobtrusive Validation Types
 *
 * Type definitions for the Microsoft jQuery Unobtrusive Validation support library,
 * converted from the original jQuery plugin to TypeScript/React.
 *
 * The unobtrusive validation library bridges HTML data-val-* attributes with
 * the jQuery Validate plugin's rule system. In React, this becomes a declarative
 * validation configuration system where adapters convert rule definitions into
 * validation methods.
 *
 * Key mappings from Microsoft jQuery Unobtrusive Validation:
 *   - `data-val="true"` → Field validation enabled flag
 *   - `data-val-{rule}` → Validation rule message
 *   - `data-val-{rule}-{param}` → Rule parameter values
 *   - `data-valmsg-for` → Error display container target
 *   - `data-valmsg-replace` → Whether to replace container content
 *   - `data-valmsg-summary` → Validation summary container
 *   - `adapters.addBool()` → Boolean adapter (no params)
 *   - `adapters.addMinMax()` → Min/max adapter (range rules)
 *   - `adapters.addSingleVal()` → Single value adapter
 *   - `adapters.add()` → Full custom adapter
 *
 * @module ims-validation/unobtrusive-types
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import type { NormalizedRules, ValidationMethod, RuleParameter } from './types';

// ============================================================================
// Adapter Types
// ============================================================================

/**
 * Context object passed to adapter functions.
 *
 * In the original jQuery Unobtrusive Validation, each adapter receives an
 * options object with the element, form, message, params, rules, and messages.
 * The adapter's job is to populate the `rules` and `messages` objects.
 *
 * Maps the `options` parameter in:
 * ```js
 * adapters.add("adapterName", ["param1", "param2"], function(options) {
 *     options.rules[ruleName] = value;
 *     options.messages[ruleName] = options.message;
 * });
 * ```
 */
export interface AdapterOptions {
  /** The field element being validated. Maps to `options.element` */
  element: HTMLElement;
  /** The parent form element. Maps to `options.form` */
  form: HTMLFormElement;
  /** The validation message from `data-val-{adapterName}` attribute */
  message: string;
  /** Parameter values from `data-val-{adapterName}-{param}` attributes */
  params: Record<string, string | undefined>;
  /** Rules object to populate — adapter writes validation rules here */
  rules: NormalizedRules;
  /** Messages object to populate — adapter writes per-rule messages here */
  messages: Record<string, string>;
}

/**
 * An adapter definition that converts unobtrusive HTML attributes into
 * jQuery Validate rules and messages.
 *
 * In the original source:
 * ```js
 * this.push({ name: adapterName, params: params, adapt: fn });
 * ```
 *
 * Maps the adapter objects stored in `$.validator.unobtrusive.adapters`.
 */
export interface ValidationAdapter {
  /** The adapter name, matching the `data-val-{name}` attribute prefix */
  name: string;
  /** Parameter names expected from `data-val-{name}-{param}` attributes */
  params: string[];
  /** The adapter function that populates rules and messages */
  adapt: (options: AdapterOptions) => void;
}

/**
 * The adapter registry — a collection of ValidationAdapter objects.
 *
 * In the original source, this is `$.validator.unobtrusive.adapters`,
 * an array-like object with helper methods:
 *   - `add(name, params, fn)` — add a full custom adapter
 *   - `addBool(name, ruleName)` — add a boolean adapter
 *   - `addMinMax(name, minRule, maxRule, minMaxRule, minAttr, maxAttr)` — add a min/max adapter
 *   - `addSingleVal(name, attribute, ruleName)` — add a single-value adapter
 *
 * In TypeScript, we model this as a class that extends Array with these methods.
 */
export interface AdapterRegistry {
  /** The list of registered adapters */
  adapters: ValidationAdapter[];
  /** Add a full custom adapter */
  add(adapterName: string, params: string[], fn: (options: AdapterOptions) => void): AdapterRegistry;
  /** Add a boolean adapter (no parameter values) */
  addBool(adapterName: string, ruleName?: string): AdapterRegistry;
  /** Add a min/max adapter (supports min-only, max-only, or both) */
  addMinMax(
    adapterName: string,
    minRuleName: string,
    maxRuleName: string,
    minMaxRuleName: string,
    minAttribute?: string,
    maxAttribute?: string,
  ): AdapterRegistry;
  /** Add a single-value adapter */
  addSingleVal(adapterName: string, attribute?: string, ruleName?: string): AdapterRegistry;
}

// ============================================================================
// Parsed Field Validation Types
// ============================================================================

/**
 * Parsed validation rules and messages for a single field.
 *
 * This is the result of parsing a field's `data-val-*` attributes through
 * all registered adapters. It represents the resolved rules and messages
 * that should be applied to the field.
 *
 * Maps the internal state created by `parseElement()`:
 * ```js
 * valInfo.options.rules[element.name] = rules = {};
 * valInfo.options.messages[element.name] = messages = {};
 * ```
 */
export interface ParsedFieldValidation {
  /** The field name (from `element.name`) */
  fieldName: string;
  /** Resolved validation rules for this field */
  rules: NormalizedRules;
  /** Resolved validation messages for this field */
  messages: Record<string, string>;
  /** Whether the field has validation enabled (`data-val="true"`) */
  hasValidation: boolean;
}

/**
 * Parsed validation info for an entire form.
 *
 * Maps the result of `validationInfo(form)` which stores the combined
 * rules, messages, and validation options for a form element.
 */
export interface ParsedFormValidation {
  /** The form element */
  form: HTMLFormElement;
  /** Per-field parsed validations, keyed by field name */
  fields: Record<string, ParsedFieldValidation>;
  /** Combined rules for all fields */
  rules: Record<string, NormalizedRules>;
  /** Combined messages for all fields */
  messages: Record<string, Record<string, string>>;
  /** Error CSS class (maps to `errorClass` option). Default: "input-validation-error" */
  errorClass: string;
  /** Valid CSS class (maps to `validClass` equivalent). Default: "input-validation-valid" */
  validClass: string;
  /** Error element tag (maps to `errorElement` option). Default: "span" */
  errorElement: string;
}

// ============================================================================
// Error Display Types
// ============================================================================

/**
 * Configuration for per-field error display.
 *
 * Maps the `data-valmsg-for` and `data-valmsg-replace` attributes from
 * the original unobtrusive validation library.
 *
 * In the original source:
 * ```js
 * var container = $(this).find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']");
 * var replaceAttrValue = container.attr("data-valmsg-replace");
 * var replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) !== false : null;
 * ```
 */
export interface FieldErrorConfig {
  /** The field name this error display targets (from `data-valmsg-for`) */
  fieldName: string;
  /** Whether to replace the container content with the error message.
   *  From `data-valmsg-replace`. Default: true */
  replace: boolean;
}

/**
 * Configuration for the validation summary display.
 *
 * Maps the `data-valmsg-summary="true"` attribute and the `onErrors`
 * callback that populates the summary.
 *
 * In the original source:
 * ```js
 * var container = $(this).find("[data-valmsg-summary=true]");
 * var list = container.find("ul");
 * // ... populate list with error items
 * ```
 */
export interface ValidationSummaryConfig {
  /** Whether the summary is enabled (from `data-valmsg-summary="true"`) */
  enabled: boolean;
  /** Title text for the summary (default: "Please fix the following errors:") */
  title?: string;
}

// ============================================================================
// Unobtrusive Form Component Props
// ============================================================================

/**
 * Props for the ImsUnobtrusiveForm component.
 *
 * Provides a declarative API that replaces the original `parse()` and
 * `parseElement()` functions which automatically scan the DOM for
 * `data-val-*` attributes.
 *
 * In the original library, parsing is triggered automatically on DOM ready:
 * ```js
 * $(function() { $jQval.unobtrusive.parse(document); });
 * ```
 *
 * In React, we use a component that parses its children or accepts
 * an explicit configuration object.
 */
export interface ImsUnobtrusiveFormProps {
  /** Form content (fields with validation) */
  children: React.ReactNode;
  /** Validation mode */
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onAll';
  /** Custom error class (maps to `defaultOptions.errorClass`). Default: "input-validation-error" */
  errorClass?: string;
  /** Custom error element tag (maps to `defaultOptions.errorElement`). Default: "span" */
  errorElement?: string;
  /** Whether to show validation summary (maps to `[data-valmsg-summary]`). Default: false */
  showSummary?: boolean;
  /** Title for the validation summary */
  summaryTitle?: string;
  /** Custom submit handler (called when form is valid) */
  onSubmit?: (formData: Record<string, string>, isValid: boolean) => void | Promise<void>;
  /** Custom invalid handler (called when form is invalid) */
  onInvalid?: (errors: Array<{ fieldName: string; message: string }>) => void;
  /** Whether to auto-parse children for data-val attributes (default: true) */
  autoParse?: boolean;
  /** CSS class for the form */
  className?: string;
}

// ============================================================================
// Unobtrusive Validation Global Options
// ============================================================================

/**
 * Global options for unobtrusive validation.
 *
 * Maps `$.validator.unobtrusive.options` which provides defaults
 * for error class, error element, and lifecycle callbacks.
 */
export interface UnobtrusiveGlobalOptions {
  /** Default error CSS class. Maps `defaultOptions.errorClass` */
  errorClass?: string;
  /** Default error element tag. Maps `defaultOptions.errorElement` */
  errorElement?: string;
  /** Custom error placement callback. Maps `defaultOptions.errorPlacement` */
  errorPlacement?: (error: HTMLElement, inputElement: HTMLElement) => void;
  /** Custom invalid handler callback. Maps `defaultOptions.invalidHandler` */
  invalidHandler?: (form: HTMLFormElement, validator: unknown) => void;
  /** Custom success callback. Maps `defaultOptions.success` */
  success?: (error: HTMLElement, inputElement: HTMLElement) => void;
}

// ============================================================================
// Helper Function Types
// ============================================================================

/**
 * A function that sets a validation value on an options object.
 *
 * Maps the `setValidationValues(options, ruleName, value)` helper from
 * the original source:
 * ```js
 * function setValidationValues(options, ruleName, value) {
 *     options.rules[ruleName] = value;
 *     if (options.message) {
 *         options.messages[ruleName] = options.message;
 *     }
 * }
 * ```
 */
export type SetValidationValueFn = (
  options: AdapterOptions,
  ruleName: string,
  value: RuleParameter,
) => void;

// ============================================================================
// Version Info
// ============================================================================

/** Unobtrusive validation module version */
export const UNOBTRUSIVE_VERSION = '3.2.11-ims' as const;

/** Unobtrusive validation metadata */
export interface UnobtrusiveValidationMeta {
  version: typeof UNOBTRUSIVE_VERSION;
  originalLibrary: 'Microsoft jQuery Unobtrusive Validation';
  originalVersion: '3.2.11';
  convertedTo: 'TypeScript/React';
  conversionDate: string;
}
