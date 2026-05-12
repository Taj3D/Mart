/**
 * IMS Validation Module - Type Definitions
 *
 * Converts jQuery Validation Plugin 1.11.1 type system to TypeScript equivalents.
 * Provides type-safe interfaces for jQuery Validation patterns in React/TypeScript.
 *
 * All types are framework-agnostic where possible for reuse in non-React contexts.
 * JSDoc comments reference the equivalent jQuery Validation 1.11.1 API.
 */

// ============================================================================
// Constants - Matching jQuery Validation 1.11.1 Return Values
// ============================================================================

/**
 * Special return value from validation methods indicating a dependency mismatch.
 * In jQuery Validation 1.11.1, methods return "dependency-mismatch" when a rule's
 * dependency condition is not met, causing the rule to be skipped rather than fail.
 * Equivalent to `$.validator.methods.*` returning `"dependency-mismatch"`.
 */
export const DEPENDENCY_MISMATCH = 'dependency-mismatch' as const;

/**
 * Special return value from validation methods indicating async validation is in progress.
 * In jQuery Validation 1.11.1, remote validation returns "pending" while the AJAX
 * request is in flight. The validator tracks pending requests and defers form
 * submission until all resolve.
 * Equivalent to `$.validator.pendingRequest` tracking and `"pending"` return.
 */
export const PENDING = 'pending' as const;

// ============================================================================
// Primitive / Utility Types
// ============================================================================

/**
 * Parameter value for a validation rule.
 * In jQuery Validation, rule parameters vary by method:
 *   - `required: true`           → boolean
 *   - `minlength: 5`             → number
 *   - `accept: "image/*"`        → string
 *   - `rangelength: [2, 8]`      → number[]
 *   - `required: { depends }`    → DependencyParam
 *
 * Maps `$.validator.methods[method].param` variants.
 */
export type RuleParameter =
  | boolean
  | number
  | string
  | number[]
  | DependencyParam;

/**
 * Dependency parameter object for conditional rule application.
 * In jQuery Validation 1.11.1, a rule can be conditional via:
 *   `{ required: { param: true, depends: function() { ... } } }`
 * The `depends` function is evaluated; if it returns false, the rule is skipped
 * (returns "dependency-mismatch").
 * Maps `$.validator.methods.*` dependency-mismatch pattern.
 */
export interface DependencyParam {
  /** The actual parameter value for the rule when dependency is satisfied */
  param: RuleParameter;
  /** Condition that must be true for the rule to apply */
  depends: ((element?: FieldElement) => boolean) | string;
}

/**
 * A single validation rule consisting of a method name and its parameters.
 * In jQuery Validation, rules are expressed as:
 *   `{ required: true }`          → { method: 'required', parameters: true }
 *   `{ minlength: 5 }`            → { method: 'minlength', parameters: 5 }
 *   `{ range: [2, 8] }`           → { method: 'range', parameters: [2, 8] }
 *   `{ required: { depends: fn }}` → { method: 'required', parameters: { param: true, depends: fn } }
 *
 * This is the normalized internal representation after parsing
 * `$.validator.settings.rules[fieldName]` entries.
 */
export interface ValidationRule {
  /** The validation method name (e.g., 'required', 'minlength', 'email', 'remote') */
  method: string;
  /** Parameters for the validation method */
  parameters: RuleParameter;
}

/**
 * Result of validating a single rule against a field value.
 * Produced internally by the validator when it calls each method.
 * In jQuery Validation 1.11.1, this corresponds to the per-method
 * validation result tracked in the errorMap and errorList.
 */
export interface ValidationResult {
  /** Whether the field passed this rule */
  isValid: boolean;
  /** The method name that was evaluated */
  method: string;
  /** The error message if invalid, or the success indicator */
  message: string;
  /** The parameters that were passed to the method */
  parameters: RuleParameter;
}

/**
 * Rules normalized to a consistent key-value format.
 * In jQuery Validation, after `$.validator.normalizeRules()`, all rule
 * definitions are reduced to `Record<method, parameter>` form.
 * For example: `{ required: true, minlength: 5, email: true }`.
 */
export type NormalizedRules = Record<string, RuleParameter>;

// ============================================================================
// Field Element Type
// ============================================================================

/**
 * Minimal DOM-like interface for a form field element.
 * Works with both native HTML elements and React ref objects.
 * In jQuery Validation 1.11.1, the `element` parameter in validation methods
 * is a DOM element accessed via `$(element)`. This interface provides the
 * minimal surface needed for validation logic without requiring a full
 * HTMLElement, enabling use with React refs and test mocks.
 *
 * Maps `$.validator.methods.*(value, element, param)` — the `element` argument.
 */
export interface FieldElement {
  /** The field's name attribute (maps to `element.name`) */
  name: string;
  /** The field's current value (maps to `element.value`) */
  value: string;
  /** Whether the field is disabled (maps to `element.disabled`) */
  disabled: boolean;
  /** Whether the field is read-only (maps to `element.readOnly`) */
  readOnly: boolean;
  /** The field's type attribute, e.g. 'text', 'checkbox', 'radio' (maps to `element.type`) */
  type: string;
  /** Whether the checkbox/radio is checked (maps to `element.checked`) */
  checked: boolean;
  /** The parent form element, if any (maps to `element.form`) */
  form: HTMLFormElement | null;
  /** The field's id attribute (maps to `element.id`) */
  id: string;
  /** Focus the field (maps to `element.focus()`) */
  focus(): void;
  /** Get attribute value (maps to `element.getAttribute()`) */
  getAttribute(name: string): string | null;
  /** Set a custom validity message for native constraint validation */
  setCustomValidity?(message: string): void;
  /** Check validity using native constraint validation */
  checkValidity?(): boolean;
}

// ============================================================================
// Validation Method Type
// ============================================================================

/**
 * A validation method function.
 * In jQuery Validation 1.11.1, methods are registered via
 * `$.validator.addMethod(name, method, message)` and called with
 * `(value, element, param)`.
 *
 * Return values:
 *   - `true`                    → field is valid
 *   - `false`                   → field is invalid (use default message)
 *   - `"dependency-mismatch"`   → rule dependency not met, skip this rule
 *   - `"pending"`               → async validation in progress (remote)
 *   - `string` (other)          → field is invalid, use this string as the message
 *   - `Promise<boolean|string>` → async validation (replaces jQuery AJAX)
 *
 * Maps `$.validator.methods[method]` signature.
 */
export type ValidationMethod = (
  value: string,
  element?: FieldElement,
  params?: RuleParameter,
) => boolean | string | Promise<boolean | string>;

// ============================================================================
// Messages Types
// ============================================================================

/**
 * Validation messages configuration.
 * In jQuery Validation 1.11.1, messages can be specified per-field and per-method:
 *   - Flat: `{ username: "This field is required" }`
 *   - Nested: `{ username: { required: "Username is required", minlength: "Too short" } }`
 *
 * Maps `$.validator.settings.messages` and `$.validator.messages` defaults.
 */
export type ValidationMessages = Record<
  string,
  | string
  | ((params: RuleParameter, element?: FieldElement) => string)
  | Record<string, string | ((params: RuleParameter, element?: FieldElement) => string)>
>;

// ============================================================================
// Field & Form State Types
// ============================================================================

/**
 * Per-field validation state.
 * In jQuery Validation 1.11.1, per-field state is tracked internally via
 * `$.validator.errorMap`, `$.validator.errorList`, `$.validator.pendingRequest`,
 * and `$.validator.invalid[fieldName]`. This consolidates that scattered state
 * into a single coherent object per field.
 */
export interface FieldValidationState {
  /** Current error messages for this field (from errorList) */
  errors: string[];
  /** Whether the field is currently valid (no errors, all sync rules pass) */
  isValid: boolean;
  /** Whether async validation is in progress (e.g., remote rule) */
  isPending: boolean;
  /** Whether the field value has changed from initial (was "dirty" in original) */
  isDirty: boolean;
  /** Whether the field has been blurred or interacted with (triggers validation) */
  isTouched: boolean;
}

/**
 * Whole-form validation state.
 * In jQuery Validation 1.11.1, form-level state is tracked via
 * `$.validator.form()`, `$.validator.numberOfInvalids()`,
 * `$.validator.pendingRequest`, and the submit handler flow.
 * This aggregates all field states into a form-level view.
 */
export interface FormValidationState {
  /** Per-field validation states, keyed by field name */
  fieldStates: Record<string, FieldValidationState>;
  /** Whether the entire form is valid (all fields valid, no pending) */
  isValid: boolean;
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Number of times the form has been submitted (maps to internal submit counter) */
  submitCount: number;
  /** Total number of invalid fields (maps to `$.validator.numberOfInvalids()`) */
  errorCount: number;
}

// ============================================================================
// Settings / Configuration Types
// ============================================================================

/**
 * Validator configuration options.
 * Maps `jQuery.validator.defaults` and the options object passed to `$(form).validate(options)`.
 * Each property corresponds to the equivalent jQuery Validation 1.11.1 setting.
 */
export interface ValidatorSettings {
  /**
   * Custom validation messages.
   * Maps `$.validator.defaults.messages`.
   * Per-field and per-method message overrides.
   */
  messages?: ValidationMessages;

  /**
   * Field grouping for shared error display.
   * Maps `$.validator.defaults.groups`.
   * Groups multiple fields so they share a single error message.
   * Example: `{ birthday: 'year month day' }` or `{ birthday: ['year', 'month', 'day'] }`
   */
  groups?: ValidationGroup;

  /**
   * Validation rules per field.
   * Maps `$.validator.defaults.rules`.
   * Example: `{ username: { required: true, minlength: 2 } }`
   */
  rules?: FieldRules;

  /**
   * CSS class applied to field with validation error.
   * Maps `$.validator.defaults.errorClass`. Default: "error"
   */
  errorClass?: string;

  /**
   * CSS class applied to valid field.
   * Maps `$.validator.defaults.validClass`. Default: "valid"
   */
  validClass?: string;

  /**
   * HTML element type used for error labels.
   * Maps `$.validator.defaults.errorElement`. Default: "label"
   */
  errorElement?: string;

  /**
   * Whether to focus the first invalid field on form submission.
   * Maps `$.validator.defaults.focusInvalid`. Default: true
   */
  focusInvalid?: boolean;

  /**
   * Whether to validate on form submission.
   * Maps `$.validator.defaults.onsubmit`. Default: true
   */
  onsubmit?: boolean;

  /**
   * Selector for elements to ignore during validation.
   * Maps `$.validator.defaults.ignore`.
   * Example: ":hidden", ".ignore"
   */
  ignore?: string;

  /**
   * When validation is triggered on field focus.
   * Maps `$.validator.defaults.onfocusin`.
   */
  onfocusin?: ValidatorCallbacks['onfocusin'];

  /**
   * When validation is triggered on field blur.
   * Maps `$.validator.defaults.onfocusout`.
   */
  onfocusout?: ValidatorCallbacks['onfocusout'];

  /**
   * When validation is triggered on keyup.
   * Maps `$.validator.defaults.onkeyup`.
   */
  onkeyup?: ValidatorCallbacks['onkeyup'];

  /**
   * When validation is triggered on click (checkboxes/radios).
   * Maps `$.validator.defaults.onclick`.
   */
  onclick?: ValidatorCallbacks['onclick'];

  /**
   * Callback to highlight an invalid field.
   * Maps `$.validator.defaults.highlight`.
   */
  highlight?: ValidatorCallbacks['highlight'];

  /**
   * Callback to unhighlight a valid field.
   * Maps `$.validator.defaults.unhighlight`.
   */
  unhighlight?: ValidatorCallbacks['unhighlight'];

  /**
   * Custom showErrors callback.
   * Maps `$.validator.defaults.showErrors`.
   */
  showErrors?: ValidatorCallbacks['showErrors'];

  /**
   * Custom error placement callback.
   * Maps `$.validator.defaults.errorPlacement`.
   */
  errorPlacement?: ValidatorCallbacks['errorPlacement'];

  /**
   * Callback when a field becomes valid.
   * Maps `$.validator.defaults.success`.
   */
  success?: ValidatorCallbacks['success'];

  /**
   * Custom submit handler when form is valid.
   * Maps `$.validator.defaults.submitHandler`.
   */
  submitHandler?: ValidatorCallbacks['submitHandler'];

  /**
   * Callback when form is invalid.
   * Maps `$.validator.defaults.invalidHandler`.
   */
  invalidHandler?: ValidatorCallbacks['invalidHandler'];

  /**
   * Whether to remove error class on field focus.
   * Maps `$.validator.defaults.focusCleanup`. Default: false
   */
  focusCleanup?: boolean;

  /**
   * Whether to ignore the title attribute for default messages.
   * Maps `$.validator.defaults.ignoreTitle`. Default: false
   */
  ignoreTitle?: boolean;

  /**
   * Container element(s) for additional error info.
   * Maps `$.validator.defaults.errorContainer`.
   */
  errorContainer?: string | string[];

  /**
   * Container element for error labels.
   * Maps `$.validator.defaults.errorLabelContainer`.
   */
  errorLabelContainer?: string;

  /**
   * Wrapper element around error labels.
   * Maps `$.validator.defaults.wrapper`. Default: undefined (no wrapper)
   */
  wrapper?: string;

  /**
   * Whether to enable debug mode (prevents form submission, logs to console).
   * Maps `$.validator.defaults.debug`. Default: false
   */
  debug?: boolean;
}

// ============================================================================
// Callback Types
// ============================================================================

/**
 * Lifecycle callbacks for the validator.
 * Maps the callback functions from `jQuery.validator.defaults` and the
 * options passed to `$(form).validate()`.
 */
export interface ValidatorCallbacks {
  /**
   * Called when a field receives focus.
   * Maps `$.validator.defaults.onfocusin(element, event)`.
   * Return false to prevent validation on this event.
   */
  onfocusin: (element: FieldElement, event: Event) => boolean | void;

  /**
   * Called when a field loses focus.
   * Maps `$.validator.defaults.onfocusout(element, event)`.
   * Return false to prevent validation on this event.
   */
  onfocusout: (element: FieldElement, event: Event) => boolean | void;

  /**
   * Called on keyup in a field.
   * Maps `$.validator.defaults.onkeyup(element, event)`.
   * Return false to prevent validation on this event.
   */
  onkeyup: (element: FieldElement, event: Event) => boolean | void;

  /**
   * Called on click of a checkbox or radio button.
   * Maps `$.validator.defaults.onclick(element, event)`.
   * Return false to prevent validation on this event.
   */
  onclick: (element: FieldElement, event: Event) => boolean | void;

  /**
   * Highlight an invalid field.
   * Maps `$.validator.defaults.highlight(element, errorClass, validClass)`.
   * Default behavior adds `errorClass` and removes `validClass`.
   */
  highlight: (
    element: FieldElement,
    errorClass: string,
    validClass: string,
  ) => void;

  /**
   * Unhighlight a valid field (restore to normal).
   * Maps `$.validator.defaults.unhighlight(element, errorClass, validClass)`.
   * Default behavior removes `errorClass` and adds `validClass`.
   */
  unhighlight: (
    element: FieldElement,
    errorClass: string,
    validClass: string,
  ) => void;

  /**
   * Custom error display. Replaces the default showErrors implementation.
   * Maps `$.validator.defaults.showErrors(errorMap, errorList)`.
   *   - errorMap: { fieldName: message }
   *   - errorList: [{ message, element, method }]
   */
  showErrors: (
    errorMap: Record<string, string>,
    errorList: ErrorListEntry[],
  ) => void;

  /**
   * Custom placement of a single error label.
   * Maps `$.validator.defaults.errorPlacement(error, element)`.
   * `error` is the error label/element, `element` is the input being validated.
   */
  errorPlacement: (
    error: ErrorLabelElement,
    element: FieldElement,
  ) => void;

  /**
   * Called when a field passes validation.
   * Maps `$.validator.defaults.success(label, element)`.
   * Can be a string (CSS class) or a function.
   */
  success: ((label: ErrorLabelElement, element: FieldElement) => void) | string;

  /**
   * Custom form submission handler. Called only when the form is valid.
   * Maps `$.validator.defaults.submitHandler(form)`.
   * Return false to prevent default form submission.
   */
  submitHandler: (form: HTMLFormElement | null) => boolean | void;

  /**
   * Called when the form is invalid.
   * Maps `$.validator.defaults.invalidHandler(event, validator)`.
   */
  invalidHandler: (
    event: Event | null,
    validator: ValidatorInfo,
  ) => void;
}

/**
 * Minimal error label element for callback compatibility.
 * In jQuery Validation 1.11.1, the `error` parameter in `errorPlacement`
 * and `success` callbacks is a jQuery-wrapped label element. This provides
 * a framework-agnostic interface for error label manipulation.
 */
export interface ErrorLabelElement {
  /** The text content of the error label */
  text: string;
  /** The HTML content of the error label */
  html: string;
  /** The field name this error is associated with */
  htmlFor: string;
  /** CSS class list for the error label */
  className: string;
  /** Set the text content */
  setText(text: string): void;
  /** Set the HTML content */
  setHtml(html: string): void;
  /** Add a CSS class */
  addClass(className: string): void;
  /** Remove a CSS class */
  removeClass(className: string): void;
  /** Remove the error label from the DOM */
  remove(): void;
  /** Show the error label */
  show(): void;
  /** Hide the error label */
  hide(): void;
}

/**
 * Validator info object passed to `invalidHandler`.
 * In jQuery Validation 1.11.1, the second argument to `invalidHandler`
 * is the validator instance. This provides the essential read-only info.
 * Maps `$.validator` properties available in `invalidHandler(event, validator)`.
 */
export interface ValidatorInfo {
  /** Number of invalid fields (maps to `validator.numberOfInvalids()`) */
  numberOfInvalids: number;
  /** Map of field names to error messages (maps to `validator.errorMap`) */
  errorMap: Record<string, string>;
  /** List of error entries (maps to `validator.errorList`) */
  errorList: ErrorListEntry[];
  /** Current form validation state */
  formState: FormValidationState;
}

// ============================================================================
// Rules Configuration Types
// ============================================================================

/**
 * Field validation rules configuration.
 * In jQuery Validation 1.11.1, rules can be specified in two formats:
 *   - Array of normalized rules: [{ method: 'required', parameters: true }]
 *   - Method-to-parameter map: { required: true, minlength: 5 }
 * Both formats are supported for flexibility and backward compatibility.
 *
 * Maps `$.validator.settings.rules[fieldName]`.
 */
export type FieldRules = Record<
  string,
  | ValidationRule[]
  | NormalizedRules
>;

/**
 * CSS class-to-rules mapping.
 * In jQuery Validation 1.11.1, rules can be associated with CSS classes
 * via `$.validator.classRuleSettings`. When a field has a matching class,
 * the associated rules are automatically applied.
 * Example: `{ required: { required: true }, email: { email: true } }`
 *
 * Maps `$.validator.classRuleSettings`.
 */
export type ClassRuleSettings = Record<string, NormalizedRules>;

/**
 * Groups of fields that share a single error display.
 * In jQuery Validation 1.11.1, the `groups` option allows grouping fields
 * so they produce a single error message. Fields are specified as a
 * space-separated string or an array.
 * Example: `{ birthday: 'year month day' }` or `{ birthday: ['year', 'month', 'day'] }`
 *
 * Maps `$.validator.settings.groups`.
 */
export type ValidationGroup = Record<string, string | string[]>;

// ============================================================================
// Remote / Async Validation Types
// ============================================================================

/**
 * Options for remote (async/server-side) validation.
 * In jQuery Validation 1.11.1, the `remote` rule sends an AJAX request
 * to the server to validate the field. The server returns `true` (valid),
 * a string (invalid, string is the error message), or `"false"` (invalid,
 * use default message).
 *
 * Maps `$.validator.methods.remote` and the `remote` rule parameter object.
 */
export interface RemoteValidationOptions {
  /** The URL to send the validation request to */
  url: string;
  /** HTTP method (default: "GET") */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Additional data to send with the request */
  data?: Record<string, unknown> | ((value: string, element: FieldElement) => Record<string, unknown>);
  /** Expected response data type (default: "json") */
  dataType?: 'json' | 'text' | 'html' | 'xml' | 'script';
  /** Extra data fields to include in the request (always sent, not dependent on value) */
  extraData?: Record<string, unknown>;
  /** Custom headers for the request */
  headers?: Record<string, string>;
  /** Whether to use CORS credentials */
  withCredentials?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Cache bypass (default: true for GET requests) */
  cache?: boolean;
  /** Whether the field value is sent as the field name (default: true) */
  sendFieldName?: boolean;
}

// ============================================================================
// Validation Mode Types
// ============================================================================

/**
 * When validation should be triggered.
 * In jQuery Validation 1.11.1, validation timing is controlled by
 * `onsubmit`, `onfocusout`, `onkeyup`, and `onclick` settings.
 * This enum consolidates those boolean flags into a single mode.
 *
 * - `onSubmit` — validate only on form submit (onsubmit: true, others: false)
 * - `onBlur`   — validate on blur (onfocusout: true) and submit
 * - `onChange` — validate on every change/keyup (onkeyup: true) and blur/submit
 * - `onAll`    — validate on all events (submit, blur, keyup, click)
 */
export type ValidateMode = 'onSubmit' | 'onBlur' | 'onChange' | 'onAll';

/**
 * How error messages are inserted relative to the field.
 * In jQuery Validation 1.11.1, the default behavior inserts the error
 * label immediately after the field (`after` mode). This type generalizes
 * the insertion behavior for flexible error placement in React.
 *
 * - `after`   — Insert error element after the field (jQuery Validation default)
 * - `before`  — Insert error element before the field
 * - `append`  — Append error element to a container
 * - `prepend` — Prepend error element to a container
 * - `custom`  — Fully custom placement via `errorPlacement` callback
 */
export type InsertMode = 'after' | 'before' | 'append' | 'prepend' | 'custom';

// ============================================================================
// Error & Pending Request Types
// ============================================================================

/**
 * An entry in the validator's error list.
 * In jQuery Validation 1.11.1, `$.validator.errorList` is an array of
 * objects with `{ message, element }`. This extends that with a `method`
 * field and uses `fieldName` instead of a DOM element reference for
 * framework-agnostic usage.
 *
 * Maps `$.validator.errorList[i]`.
 */
export interface ErrorListEntry {
  /** The error message to display */
  message: string;
  /** The name of the field with the error (replaces `element` DOM reference) */
  fieldName: string;
  /** The validation method that produced this error */
  method: string;
}

/**
 * Tracks the state of pending (async) validation requests.
 * In jQuery Validation 1.11.1, `$.validator.pendingRequest` is a number
 * tracking how many AJAX requests are in flight, and the form submission
 * is deferred until it reaches zero. This extends that with per-field
 * abort controller tracking for modern cancellation support.
 *
 * Maps `$.validator.pendingRequest` and the internal request tracking.
 */
export interface PendingRequest {
  /** Number of currently in-flight async validations */
  count: number;
  /** Per-field abort controllers for cancelling in-flight requests */
  fields: Record<string, AbortController>;
}

// ============================================================================
// Built-in Method Name Constants
// ============================================================================

/**
 * Names of all built-in validation methods in jQuery Validation 1.11.1.
 * Maps `$.validator.methods` default set.
 */
export type BuiltinMethodName =
  | 'required'
  | 'email'
  | 'url'
  | 'date'
  | 'dateISO'
  | 'number'
  | 'digits'
  | 'creditcard'
  | 'equalTo'
  | 'maxlength'
  | 'minlength'
  | 'rangelength'
  | 'max'
  | 'min'
  | 'range'
  | 'remote';

/**
 * Complete set of built-in validation method names.
 * Corresponds to the default methods provided by jQuery Validation Plugin 1.11.1.
 */
export const BUILTIN_METHOD_NAMES: readonly BuiltinMethodName[] = [
  'required',
  'email',
  'url',
  'date',
  'dateISO',
  'number',
  'digits',
  'creditcard',
  'equalTo',
  'maxlength',
  'minlength',
  'rangelength',
  'max',
  'min',
  'range',
  'remote',
] as const;

/**
 * Default messages for all built-in validation methods.
 * Maps `$.validator.messages` defaults from jQuery Validation 1.11.1.
 * Values can be strings or functions that accept parameters and return a string.
 */
export interface BuiltinMessages {
  required: string | ((params: RuleParameter, element?: FieldElement) => string);
  email: string | ((params: RuleParameter, element?: FieldElement) => string);
  url: string | ((params: RuleParameter, element?: FieldElement) => string);
  date: string | ((params: RuleParameter, element?: FieldElement) => string);
  dateISO: string | ((params: RuleParameter, element?: FieldElement) => string);
  number: string | ((params: RuleParameter, element?: FieldElement) => string);
  digits: string | ((params: RuleParameter, element?: FieldElement) => string);
  creditcard: string | ((params: RuleParameter, element?: FieldElement) => string);
  equalTo: string | ((params: RuleParameter, element?: FieldElement) => string);
  maxlength: string | ((params: RuleParameter, element?: FieldElement) => string);
  minlength: string | ((params: RuleParameter, element?: FieldElement) => string);
  rangelength: string | ((params: RuleParameter, element?: FieldElement) => string);
  max: string | ((params: RuleParameter, element?: FieldElement) => string);
  min: string | ((params: RuleParameter, element?: FieldElement) => string);
  range: string | ((params: RuleParameter, element?: FieldElement) => string);
  remote: string | ((params: RuleParameter, element?: FieldElement) => string);
}

// ============================================================================
// Method Registry Type
// ============================================================================

/**
 * Registry of all validation methods (built-in + custom).
 * In jQuery Validation 1.11.1, methods are stored in `$.validator.methods`.
 * Custom methods are added via `$.validator.addMethod(name, method, message)`.
 */
export type MethodRegistry = Record<string, ValidationMethod>;

/**
 * Registry of validation method messages.
 * In jQuery Validation 1.11.1, messages are stored in `$.validator.messages`.
 * Custom method messages are set via the third argument to `addMethod()`.
 */
export type MessageRegistry = Record<
  string,
  string | ((params: RuleParameter, element?: FieldElement) => string)
>;

// ============================================================================
// Static Rules & Metadata Types
// ============================================================================

/**
 * Static rules extracted from element attributes and classes.
 * In jQuery Validation 1.11.1, `$.validator.staticRules(element)` extracts
 * rules from the element's class (via `classRuleSettings`) and any
 * `data-rule-*` attributes. This type represents that extracted set.
 */
export type StaticRules = NormalizedRules;

/**
 * Normalization result for rules.
 * In jQuery Validation 1.11.1, `$.validator.normalizeRules(rules, element)`
 * converts dependency-based rules and ensures consistent format.
 */
export interface NormalizedFieldRules {
  /** The field name */
  fieldName: string;
  /** Normalized rules for the field */
  rules: NormalizedRules;
}

// ============================================================================
// Validator Instance Type
// ============================================================================

/**
 * Core validator interface.
 * In jQuery Validation 1.11.1, the validator instance is returned by
 * `$(form).validate()` and provides the full validation API.
 * This is the framework-agnostic type; React-specific implementations
 * will wrap this in hooks.
 *
 * Maps the `$.validator` instance returned by `$(form).validate()`.
 */
export interface ImsValidator {
  /** Validate the entire form. Returns true if valid. Maps `validator.form()` */
  form(): boolean;

  /** Validate a single element. Returns true if valid. Maps `validator.element(element)` */
  element(nameOrElement: string | FieldElement): boolean | undefined;

  /** Reset the form validation state. Maps `validator.resetForm()` */
  resetForm(): void;

  /** Show validation errors. Maps `validator.showErrors(errors)` */
  showErrors(errors?: Record<string, string>): void;

  /** Number of invalid fields. Maps `validator.numberOfInvalids()` */
  numberOfInvalids(): number;

  /** Current default settings. Maps `validator.settings` */
  settings: ValidatorSettings;

  /** Current validation state */
  state: FormValidationState;

  /** Map of field name to error message. Maps `validator.errorMap` */
  errorMap: Record<string, string>;

  /** List of error entries. Maps `validator.errorList` */
  errorList: ErrorListEntry[];

  /** Current pending request count. Maps `validator.pendingRequest` */
  pendingRequest: number;

  /** Whether form is currently valid. Maps `validator.valid()` */
  valid(): boolean;

  /** Destroy the validator and clean up. No jQuery Validation equivalent. */
  destroy(): void;
}

// ============================================================================
// Version Info
// ============================================================================

/** Module version info */
export const IMS_VALIDATION_VERSION = '1.11.1-ims' as const;

/** Module metadata */
export interface ImsValidationMeta {
  version: typeof IMS_VALIDATION_VERSION;
  originalLibrary: 'jQuery Validation Plugin';
  originalVersion: '1.11.1';
  convertedTo: 'TypeScript/React';
  conversionDate: string;
}
