'use client';

/**
 * IMS Validation - useFieldValidator Hook
 *
 * Provides field-level validation that can be used independently or alongside
 * useImsValidator. Implements per-field validation matching jQuery Validation
 * Plugin 1.11.1's onfocusin/onfocusout/onkeyup behavior in a React-friendly
 * hook API.
 *
 * Key mappings from jQuery Validation 1.11.1:
 *   - `onfocusout` → `onBlur` handler (validate on blur)
 *   - `onkeyup`   → `onChange` handler (validate on change)
 *   - `validator.element(element)` → `validate()` method
 *   - `validator.invalid[fieldName]` → `state` / `errors`
 *   - `validator.pendingRequest` → `isPending`
 *
 * @module ims-validation/use-field-validator
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

import type {
  NormalizedRules,
  RuleParameter,
  ValidateMode,
  FieldValidationState,
  FieldElement,
} from './types';

import { DEPENDENCY_MISMATCH, PENDING } from './types';

import { builtinValidators, defaultMessages } from './validators';

import { resolveMessage } from './message-formatter';

// ============================================================================
// Public Interfaces
// ============================================================================

/**
 * Options for the useFieldValidator hook.
 *
 * Each option maps to a jQuery Validation 1.11.1 concept:
 *   - `rules` → `$.validator.settings.rules[fieldName]`
 *   - `messages` → `$.validator.settings.messages[fieldName]`
 *   - `mode` → `onsubmit`/`onfocusout`/`onkeyup` boolean flags
 *   - `validate` → custom validation via `$.validator.addMethod()`
 */
export interface UseFieldValidatorOptions {
  /** Field name (maps to `element.name`) */
  name: string;
  /**
   * Validation rules (e.g., `{ required: true, minlength: 3 }`).
   * Maps `$.validator.settings.rules[fieldName]`.
   */
  rules?: NormalizedRules;
  /**
   * Custom messages for this field, keyed by method name.
   * Maps `$.validator.settings.messages[fieldName][method]`.
   */
  messages?: Record<string, string | ((params: RuleParameter) => string)>;
  /**
   * When to validate. Maps the jQuery Validation boolean flags:
   *   - `onSubmit`  → `onsubmit: true, others: false`
   *   - `onBlur`    → `onfocusout: true` (default)
   *   - `onChange`  → `onkeyup: true`
   *   - `onAll`     → all flags true
   */
  mode?: ValidateMode;
  /** Initial value for the field */
  initialValue?: string;
  /**
   * Custom validation callback.
   * Maps `$.validator.addMethod()` custom methods.
   * Return `true` for valid, `false` for invalid (use default message),
   * or a `string` for invalid (use as custom error message).
   */
  validate?: (value: string) => boolean | string | Promise<boolean | string>;
}

/**
 * Return value of the useFieldValidator hook.
 *
 * Provides the complete field validation API including current state,
 * event handlers for React inputs, and methods for programmatic control.
 */
export interface UseFieldValidatorReturn {
  /** Current field value */
  value: string;
  /** Set the field value */
  setValue: (value: string) => void;
  /** Current validation error messages */
  errors: string[];
  /** First error message (convenience accessor) */
  error: string | undefined;
  /** Whether the field is currently valid (no errors and not pending) */
  isValid: boolean;
  /** Whether the field has been blurred / interacted with */
  isTouched: boolean;
  /** Whether the field value differs from the initial value */
  isDirty: boolean;
  /** Whether async validation is in progress */
  isPending: boolean;
  /**
   * Validate the field now.
   * Accepts an optional value to validate (defaults to current value).
   * Returns `boolean` for sync validation, `Promise<boolean>` for async.
   */
  validate: (value?: string) => boolean | Promise<boolean>;
  /** Mark the field as touched */
  touch: () => void;
  /** Reset field state to initial values */
  reset: () => void;
  /** Focus the field element via the attached ref */
  focus: () => void;
  /** Ref to attach to the field element for DOM access */
  ref: React.RefObject<HTMLElement | null>;
  /** Blur event handler — validates on blur if mode allows, marks touched */
  onBlur: (event: React.FocusEvent) => void;
  /** Change event handler — updates value, validates on change if mode allows */
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  /** Validation state for integration with useImsValidator */
  state: FieldValidationState;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Build a FieldElement-like object from the current value and the
 * attached DOM element ref. Provides enough context for validation
 * methods that inspect element properties (e.g., `required` checking
 * `element.type` for checkboxes/radios).
 */
function buildFieldElement(
  val: string,
  el: HTMLElement | null,
  fieldName: string,
): FieldElement {
  const inputEl = el as HTMLInputElement | null;

  return {
    name: fieldName,
    value: val,
    disabled: inputEl ? inputEl.disabled : false,
    readOnly: inputEl ? inputEl.readOnly : false,
    type: inputEl ? inputEl.type : 'text',
    checked: inputEl ? inputEl.checked : false,
    form: inputEl ? inputEl.form : null,
    id: el ? el.id : '',
    focus: () => {
      el?.focus();
    },
    getAttribute: (attrName: string) => (el ? el.getAttribute(attrName) : null),
    setCustomValidity: inputEl?.setCustomValidity
      ? inputEl.setCustomValidity.bind(inputEl)
      : undefined,
    checkValidity: inputEl?.checkValidity
      ? inputEl.checkValidity.bind(inputEl)
      : undefined,
  };
}

/**
 * Resolve the error message for a failed rule.
 *
 * Priority:
 *   1. Custom message from `messages[method]` (string or function)
 *   2. Default message from `defaultMessages[method]`
 *   3. Fallback from `resolveMessage()`
 */
function getFieldErrorMessage(
  method: string,
  parameters: RuleParameter,
  fieldName: string,
  fieldMessages?: Record<string, string | ((params: RuleParameter) => string)>,
): string {
  // Priority 1: custom per-field message
  const customMsg = fieldMessages?.[method];
  if (customMsg !== undefined) {
    if (typeof customMsg === 'function') {
      return customMsg(parameters);
    }
    return customMsg;
  }

  // Priority 2: default message via resolveMessage
  return resolveMessage({
    fieldName,
    method,
    parameters,
    defaultMessages: defaultMessages as Record<string, string>,
  });
}

/**
 * Check whether the given mode triggers validation on blur.
 *
 * Maps jQuery Validation: `onfocusout === true` → onBlur, onChange, onAll.
 */
function shouldValidateOnBlur(mode: ValidateMode): boolean {
  return mode === 'onBlur' || mode === 'onChange' || mode === 'onAll';
}

/**
 * Check whether the given mode triggers validation on change.
 *
 * Maps jQuery Validation: `onkeyup === true` → onChange, onAll.
 */
function shouldValidateOnChange(mode: ValidateMode): boolean {
  return mode === 'onChange' || mode === 'onAll';
}

// ============================================================================
// useFieldValidator Hook
// ============================================================================

/**
 * Per-field validation hook providing jQuery Validation 1.11.1 compatible
 * field-level validation in a React-friendly API.
 *
 * Can be used independently for individual fields, or alongside useImsValidator
 * for whole-form validation with the `state` property providing integration data.
 *
 * @example
 * ```tsx
 * function UsernameField() {
 *   const field = useFieldValidator({
 *     name: 'username',
 *     rules: { required: true, minlength: 3 },
 *     messages: { required: 'Username is required', minlength: 'Too short' },
 *     mode: 'onBlur',
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         ref={field.ref as React.RefObject<HTMLInputElement>}
 *         name="username"
 *         value={field.value}
 *         onBlur={field.onBlur}
 *         onChange={field.onChange}
 *       />
 *       {field.error && <span className="error">{field.error}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFieldValidator(
  options: UseFieldValidatorOptions,
): UseFieldValidatorReturn {
  const {
    name,
    rules = {},
    messages,
    mode = 'onBlur',
    initialValue = '',
    validate: customValidate,
  } = options;

  // ---------------------------------------------------------------------------
  // React State
  // ---------------------------------------------------------------------------

  const [value, setValueState] = useState<string>(initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const [isTouched, setIsTouched] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // ---------------------------------------------------------------------------
  // Refs — stable references to avoid re-creating callbacks on every render
  // ---------------------------------------------------------------------------

  /** DOM element ref for focus/blur operations */
  const elementRef = useRef<HTMLElement | null>(null);

  /** Synchronous mirror of value for use in async closures */
  const valueRef = useRef<string>(initialValue);

  /** Track initial value for reset and dirty detection */
  const initialValueRef = useRef<string>(initialValue);

  /**
   * Validation counter — incremented on each validate() call so that stale
   * async results are discarded when a newer validation has started.
   */
  const validationIdRef = useRef<number>(0);

  // Refs for options (to avoid re-creating callbacks when options change)
  const nameRef = useRef(name);
  const rulesRef = useRef(rules);
  const messagesRef = useRef(messages);
  const modeRef = useRef(mode);
  const customValidateRef = useRef(customValidate);

  // Keep refs in sync with latest props via useEffect to satisfy React Compiler
  useEffect(() => {
    nameRef.current = name;
    rulesRef.current = rules;
    messagesRef.current = messages;
    modeRef.current = mode;
    initialValueRef.current = initialValue;
    customValidateRef.current = customValidate;
  });

  // ---------------------------------------------------------------------------
  // setValue — update both state and ref
  // ---------------------------------------------------------------------------

  const setValue = useCallback((newValue: string) => {
    setValueState(newValue);
    valueRef.current = newValue;
    setIsDirty(newValue !== initialValueRef.current);
  }, []);

  // ---------------------------------------------------------------------------
  // Core validation logic
  // ---------------------------------------------------------------------------

  /**
   * Run all configured rules against the given value.
   *
   * Matches jQuery Validation 1.11.1's `check()` method:
   *   - Rules are executed in order
   *   - `dependency-mismatch` → skip this rule
   *   - `pending` → mark field as pending, continue
   *   - `false` → format error message, stop (first error wins)
   *   - string (other) → use as error message, stop
   *   - `true` → continue to next rule
   *
   * After all rules pass, the optional `validate` callback is executed.
   *
   * Returns `boolean` if all rules resolve synchronously, or
   * `Promise<boolean>` if any rule is async.
   */
  const validate = useCallback(
    (valueToValidate?: string): boolean | Promise<boolean> => {
      const val =
        valueToValidate !== undefined ? valueToValidate : valueRef.current;
      const currentRules = rulesRef.current;
      const ruleEntries = Object.entries(currentRules);
      const currentName = nameRef.current;
      const currentMessages = messagesRef.current;

      // Increment validation ID to invalidate any in-flight async results
      const thisValidationId = ++validationIdRef.current;

      // Track whether we encountered any async rule
      let hasAsync = false;

      // Collect errors — we stop at the first error per jQuery Validation behavior
      const collectedErrors: string[] = [];

      // -----------------------------------------------------------------
      // Phase 1: Try to resolve all rules synchronously
      // -----------------------------------------------------------------
      for (const [method, parameters] of ruleEntries) {
        const validatorFn = builtinValidators[method];
        if (!validatorFn) continue;

        const element = buildFieldElement(val, elementRef.current, currentName);
        const result = validatorFn(val, element, parameters);

        // Skip dependency-mismatch rules
        if (result === DEPENDENCY_MISMATCH) continue;

        // Pending signals async validation is needed
        if (result === PENDING) {
          hasAsync = true;
          continue;
        }

        // Async result — switch to async path
        if (result instanceof Promise) {
          hasAsync = true;
          continue;
        }

        // Sync false → format error and stop
        if (result === false) {
          const msg = getFieldErrorMessage(
            method,
            parameters,
            currentName,
            currentMessages,
          );
          collectedErrors.push(msg);
          setErrors(collectedErrors);
          return false;
        }

        // Sync string → custom error message, stop
        if (typeof result === 'string') {
          collectedErrors.push(result);
          setErrors(collectedErrors);
          return false;
        }

        // result === true → continue to next rule
      }

      // If no async rules were encountered, finish synchronously
      if (!hasAsync) {
        // Run custom validate callback
        if (customValidateRef.current) {
          const customResult = customValidateRef.current(val);

          if (customResult instanceof Promise) {
            // Custom validate is async — switch to async path
            hasAsync = true;
          } else if (customResult === false) {
            const msg = getFieldErrorMessage(
              'custom',
              true,
              currentName,
              currentMessages,
            );
            collectedErrors.push(msg);
            setErrors(collectedErrors);
            return false;
          } else if (typeof customResult === 'string') {
            collectedErrors.push(customResult);
            setErrors(collectedErrors);
            return false;
          }
          // true → continue
        }

        if (!hasAsync) {
          // All validation passed synchronously
          setErrors([]);
          return true;
        }
      }

      // -----------------------------------------------------------------
      // Phase 2: Async validation — re-run rules to handle async ones
      // -----------------------------------------------------------------
      setIsPending(true);

      const asyncValidation = async (): Promise<boolean> => {
        const asyncErrors: string[] = [];

        for (const [method, parameters] of ruleEntries) {
          // Stale validation check
          if (validationIdRef.current !== thisValidationId) {
            return false; // A newer validation was triggered; discard this one
          }

          const validatorFn = builtinValidators[method];
          if (!validatorFn) continue;

          const element = buildFieldElement(
            val,
            elementRef.current,
            currentName,
          );

          let result: boolean | string;

          try {
            const rawResult = validatorFn(val, element, parameters);

            // Skip dependency-mismatch
            if (rawResult === DEPENDENCY_MISMATCH) continue;

            // Pending stub — skip (actual remote validation handled externally)
            if (rawResult === PENDING) continue;

            // Resolve Promise
            if (rawResult instanceof Promise) {
              const resolved = await rawResult;

              // Stale check after await
              if (validationIdRef.current !== thisValidationId) {
                return false;
              }

              if (resolved === DEPENDENCY_MISMATCH || resolved === PENDING) {
                continue;
              }
              result = resolved;
            } else {
              result = rawResult;
            }
          } catch {
            // Validation method threw — treat as invalid
            asyncErrors.push(
              getFieldErrorMessage(method, parameters, currentName, currentMessages),
            );
            break;
          }

          if (result === false) {
            asyncErrors.push(
              getFieldErrorMessage(method, parameters, currentName, currentMessages),
            );
            break;
          }

          if (typeof result === 'string') {
            asyncErrors.push(result);
            break;
          }

          // true → continue to next rule
        }

        // Custom validate callback (if rules passed)
        if (asyncErrors.length === 0 && customValidateRef.current) {
          try {
            const customResult = await customValidateRef.current(val);

            // Stale check after await
            if (validationIdRef.current !== thisValidationId) {
              return false;
            }

            if (customResult === false) {
              asyncErrors.push(
                getFieldErrorMessage('custom', true, currentName, currentMessages),
              );
            } else if (typeof customResult === 'string') {
              asyncErrors.push(customResult);
            }
          } catch {
            asyncErrors.push(
              getFieldErrorMessage('custom', true, currentName, currentMessages),
            );
          }
        }

        // Stale check before state update
        if (validationIdRef.current !== thisValidationId) {
          return false;
        }

        setErrors(asyncErrors);
        setIsPending(false);
        return asyncErrors.length === 0;
      };

      return asyncValidation();
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // touch — mark field as touched
  // ---------------------------------------------------------------------------

  const touch = useCallback(() => {
    setIsTouched(true);
  }, []);

  // ---------------------------------------------------------------------------
  // reset — restore field to initial state
  // ---------------------------------------------------------------------------

  const reset = useCallback(() => {
    setValueState(initialValueRef.current);
    valueRef.current = initialValueRef.current;
    setErrors([]);
    setIsTouched(false);
    setIsDirty(false);
    setIsPending(false);
    validationIdRef.current++;
  }, []);

  // ---------------------------------------------------------------------------
  // focus — focus the field element via ref
  // ---------------------------------------------------------------------------

  const focus = useCallback(() => {
    elementRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /**
   * onBlur — matches jQuery Validation's `onfocusout` handler.
   *
   * Marks the field as touched and validates if the mode includes onBlur
   * (i.e., 'onBlur', 'onChange', or 'onAll').
   *
   * Matches jQuery Validation:
   * ```js
   * onfocusout: function(element, event) {
   *     if (!this.checkable(element) && ...) {
   *         this.element(element);
   *     }
   * }
   * ```
   */
  const onBlur = useCallback(
    (event: React.FocusEvent) => {
      // Mark as touched on every blur
      setIsTouched(true);

      // Validate if mode allows
      if (shouldValidateOnBlur(modeRef.current)) {
        validate();
      }
    },
    [validate],
  );

  /**
   * onChange — matches jQuery Validation's `onkeyup` handler.
   *
   * Updates the value, marks dirty, and validates if mode includes onChange
   * (i.e., 'onChange' or 'onAll').
   *
   * Skips validation when the value is empty (matching jQuery Validation's
   * onkeyup behavior where Tab key on an empty field skips validation:
   * ```js
   * if (event.which === 9 && this.elementValue(element) === "") {
   *     return;
   * }
   * ```
   * Since React's onChange doesn't provide key information, we approximate
   * this by skipping validation when the new value is empty, preventing
   * spurious "required" errors during editing.
   */
  const onChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const newValue = event.target.value;

      // Update value state and ref synchronously
      setValueState(newValue);
      valueRef.current = newValue;

      // Mark dirty if value differs from initial
      setIsDirty(newValue !== initialValueRef.current);

      // Validate if mode allows, but skip on empty value
      // (matches jQuery Validation onkeyup Tab+empty skip behavior)
      if (shouldValidateOnChange(modeRef.current)) {
        if (newValue.trim().length > 0) {
          validate(newValue);
        } else {
          // Clear errors when value is empty to avoid showing stale errors
          // while the user is clearing the field. Errors will show on blur.
          setErrors([]);
        }
      }
    },
    [validate],
  );

  // ---------------------------------------------------------------------------
  // Computed state
  // ---------------------------------------------------------------------------

  const isValid = errors.length === 0 && !isPending;
  const error = errors.length > 0 ? errors[0] : undefined;

  /**
   * FieldValidationState for integration with useImsValidator.
   * Matches the FieldValidationState interface from types.ts.
   */
  const state: FieldValidationState = {
    errors,
    isValid,
    isPending,
    isDirty,
    isTouched,
  };

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    value,
    setValue,
    errors,
    error,
    isValid,
    isTouched,
    isDirty,
    isPending,
    validate,
    touch,
    reset,
    focus,
    ref: elementRef,
    onBlur,
    onChange,
    state,
  };
}
