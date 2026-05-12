'use client';

/**
 * IMS Validation - useImsValidator Hook
 *
 * Main React hook that replaces `$(form).validate(options)` from jQuery
 * Validation Plugin 1.11.1, providing a React-friendly API for form
 * validation with all the same capabilities.
 *
 * This hook bridges the gap between jQuery Validation's imperative API and
 * React's declarative model. It manages form validation state, field
 * registrations, rule resolution, message formatting, and remote (async)
 * validation within a single cohesive interface.
 *
 * **Key mappings from jQuery Validation 1.11.1:**
 *   - `$(form).validate(options)` → `useImsValidator(options)`
 *   - `validator.form()` → `validate()`
 *   - `validator.element(name)` → `validateField(name)`
 *   - `validator.resetForm()` → `resetForm()`
 *   - `validator.showErrors(errors)` → `showErrors(errors)`
 *   - `validator.numberOfInvalids()` → `numberOfInvalids`
 *   - `validator.valid()` → `isValid`
 *   - `validator.errorMap` → `errorMap`
 *   - `validator.errorList` → `errorList`
 *   - `validator.pendingRequest` → internal ref tracking
 *   - `validator.settings.submitHandler` → `submitHandler` option
 *   - `validator.settings.invalidHandler` → `invalidHandler` option
 *   - `validator.settings.highlight/unhighlight` → `highlight/unhighlight` options
 *   - `validator.settings.showErrors` → `showErrors` callback option
 *
 * @module ims-validation/use-ims-validator
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

import type {
  FieldRules,
  ValidationMessages,
  ValidateMode,
  ValidationGroup,
  ErrorListEntry,
  FormValidationState,
  FieldValidationState,
  FieldElement,
  NormalizedRules,
  ValidationRule,
  RuleParameter,
  ValidatorSettings,
  RemoteValidationOptions,
} from './types';

import { DEPENDENCY_MISMATCH, PENDING } from './types';

import { builtinValidators, defaultMessages } from './validators';
import { normalizeRule, normalizeRules } from './validator-registry';
import { resolveRules, rulesToList, getFieldNames } from './rule-resolver';
import { resolveMessage } from './message-formatter';
import {
  useRemoteValidator,
  validateRemote,
  PendingRequestManager,
} from './remote-validator';

import type {
  ValidateRemoteInput,
  RemoteValidationResult,
  RemoteValidatorCache,
} from './remote-validator';

// ============================================================================
// Hook Option Types
// ============================================================================

/**
 * Options for the useImsValidator hook.
 *
 * Maps the options object passed to `$(form).validate(options)` in jQuery
 * Validation 1.11.1, adapted for React's declarative model.
 *
 * Key differences from jQuery Validation options:
 *   - `mode` replaces the individual `onsubmit`/`onfocusout`/`onkeyup`/`onclick` booleans
 *   - `submitHandler` receives `FormData` instead of a raw form element
 *   - `highlight`/`unhighlight` receive field name strings instead of DOM elements
 *   - `showErrors` receives `Record<string, string>` instead of jQuery errorMap
 */
export interface UseImsValidatorOptions {
  /** Validation rules per field. Maps `$.validator.settings.rules`. */
  rules?: FieldRules;

  /** Custom messages. Maps `$.validator.settings.messages`. */
  messages?: ValidationMessages;

  /** When to validate (default: 'onBlur'). Replaces onsubmit/onfocusout/onkeyup/onclick booleans. */
  mode?: ValidateMode;

  /** Focus first invalid field on submit (default: true). Maps `$.validator.defaults.focusInvalid`. */
  focusInvalid?: boolean;

  /**
   * Custom submit handler (called when form is valid).
   * Maps `$.validator.defaults.submitHandler(form)`.
   * Return false to prevent default submission.
   */
  submitHandler?: (
    formData: FormData,
    form?: HTMLFormElement,
  ) => boolean | void | Promise<boolean | void>;

  /**
   * Invalid form handler.
   * Maps `$.validator.defaults.invalidHandler(event, validator)`.
   */
  invalidHandler?: (
    errors: ErrorListEntry[],
    formState: FormValidationState,
  ) => void;

  /**
   * Highlight an invalid field.
   * Maps `$.validator.defaults.highlight(element, errorClass, validClass)`.
   * Receives field name string instead of DOM element for React compatibility.
   */
  highlight?: (fieldName: string, errorClass: string, validClass: string) => void;

  /**
   * Unhighlight a valid field.
   * Maps `$.validator.defaults.unhighlight(element, errorClass, validClass)`.
   */
  unhighlight?: (fieldName: string, errorClass: string, validClass: string) => void;

  /**
   * Custom showErrors callback.
   * Maps `$.validator.defaults.showErrors(errorMap, errorList)`.
   */
  showErrors?: (errorMap: Record<string, string>, errorList: ErrorListEntry[]) => void;

  /** CSS class for invalid fields (default: 'error'). Maps `$.validator.defaults.errorClass`. */
  errorClass?: string;

  /** CSS class for valid fields (default: 'valid'). Maps `$.validator.defaults.validClass`. */
  validClass?: string;

  /** Debug mode — prevents actual submission, logs to console. Maps `$.validator.defaults.debug`. */
  debug?: boolean;

  /** Selector for elements to ignore during validation. Maps `$.validator.defaults.ignore`. */
  ignore?: string;

  /** Field groups for shared error display. Maps `$.validator.defaults.groups`. */
  groups?: ValidationGroup;

  /** Whether to validate on form submit (default: true). Maps `$.validator.defaults.onsubmit`. */
  onsubmit?: boolean;

  /** Whether to cleanup errors on focus (default: false). Maps `$.validator.defaults.focusCleanup`. */
  focusCleanup?: boolean;
}

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Return type of the useImsValidator hook.
 *
 * Provides the complete validation API that replaces the jQuery Validation
 * validator instance (`$(form).validate()` return value).
 */
export interface UseImsValidatorReturn {
  /** Form validation state (immutable — new object on each change). */
  formState: FormValidationState;

  /** Error map: fieldName → message. Maps `validator.errorMap`. */
  errorMap: Record<string, string>;

  /** Error list. Maps `validator.errorList`. */
  errorList: ErrorListEntry[];

  /** Validate entire form. Maps `validator.form()`. */
  validate: () => boolean;

  /** Validate a single field. Maps `validator.element(name)`. Supports async (remote). */
  validateField: (fieldName: string, value?: string) => boolean | Promise<boolean>;

  /** Whether the entire form is currently valid. Maps `validator.valid()`. */
  isValid: boolean;

  /** Reset form validation state. Maps `validator.resetForm()`. */
  resetForm: () => void;

  /** Show custom errors. Maps `validator.showErrors(errors)`. */
  showErrors: (errors: Record<string, string>) => void;

  /** Number of invalid fields. Maps `validator.numberOfInvalids()`. */
  numberOfInvalids: number;

  /** Handle form submit (use in onSubmit). Replaces `$(form).submit()` flow. */
  handleSubmit: (event?: React.FormEvent) => Promise<boolean>;

  /** Register a field with the validator. No jQuery Validation equivalent (React-specific). */
  registerField: (
    fieldName: string,
    elementOrRef?: HTMLElement | React.RefObject<HTMLElement>,
  ) => void;

  /** Unregister a field. React-specific cleanup. */
  unregisterField: (fieldName: string) => void;

  /** Set field value for controlled components. */
  setFieldValue: (fieldName: string, value: string) => void;

  /** Touch a field (mark as interacted). */
  touchField: (fieldName: string) => void;

  /** Focus the first invalid field. Maps `validator.focusInvalid()`. */
  focusInvalid: () => void;

  /** Form ref to attach to the <form> element. */
  formRef: React.RefObject<HTMLFormElement | null>;

  /** Whether the form is currently submitting. */
  isSubmitting: boolean;

  /** Total number of submit attempts. */
  submitCount: number;
}

// ============================================================================
// Internal Helper Types
// ============================================================================

/**
 * Internal field registration data.
 */
interface FieldRegistration {
  /** The field name */
  name: string;
  /** Optional direct DOM element reference */
  element: HTMLElement | null;
  /** Current cached value (for controlled components) */
  value: string;
  /** Whether the field has been touched (blurred or interacted with) */
  touched: boolean;
  /** Whether the field value has changed from initial */
  dirty: boolean;
  /** Initial value for dirty tracking */
  initialValue: string;
}

/**
 * Internal structure for group → field names mapping.
 */
type ResolvedGroups = Record<string, string[]>;

// ============================================================================
// Default Field State
// ============================================================================

const DEFAULT_FIELD_STATE: FieldValidationState = {
  errors: [],
  isValid: true,
  isPending: false,
  isDirty: false,
  isTouched: false,
};

const DEFAULT_FORM_STATE: FormValidationState = {
  fieldStates: {},
  isValid: true,
  isSubmitting: false,
  submitCount: 0,
  errorCount: 0,
};

// ============================================================================
// useImsValidator Hook
// ============================================================================

/**
 * React hook that replaces `$(form).validate(options)` from jQuery Validation 1.11.1.
 *
 * Provides a complete form validation API with React-friendly state management,
 * supporting both synchronous and asynchronous (remote) validation.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const {
 *     formRef,
 *     handleSubmit,
 *     formState,
 *     errorMap,
 *     registerField,
 *     validateField,
 *   } = useImsValidator({
 *     rules: {
 *       username: { required: true, minlength: 3 },
 *       email: { required: true, email: true },
 *     },
 *     messages: {
 *       username: { required: 'Username is required' },
 *     },
 *     submitHandler: async (formData) => {
 *       await fetch('/api/submit', { method: 'POST', body: formData });
 *     },
 *   });
 *
 *   return (
 *     <form ref={formRef} onSubmit={handleSubmit}>
 *       <input name="username" onBlur={() => validateField('username')} />
 *       {errorMap.username && <span>{errorMap.username}</span>}
 *       <input name="email" type="email" />
 *       <button type="submit" disabled={formState.isSubmitting}>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @param options - Validation options (maps `$(form).validate(options)`)
 * @returns Complete validation API
 */
export function useImsValidator(options: UseImsValidatorOptions = {}): UseImsValidatorReturn {
  // -------------------------------------------------------------------------
  // Destructure options with defaults
  // -------------------------------------------------------------------------
  const {
    rules: fieldRules = {},
    messages: customMessages = {},
    mode = 'onBlur',
    focusInvalid: shouldFocusInvalid = true,
    submitHandler,
    invalidHandler,
    highlight: highlightFn,
    unhighlight: unhighlightFn,
    showErrors: showErrorsCallback,
    errorClass = 'error',
    validClass = 'valid',
    debug = false,
    ignore: ignoreSelector,
    groups: validationGroups = {},
    onsubmit = true,
    focusCleanup = false,
  } = options;

  // -------------------------------------------------------------------------
  // React State
  // -------------------------------------------------------------------------
  const [formState, setFormState] = useState<FormValidationState>(DEFAULT_FORM_STATE);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [errorList, setErrorList] = useState<ErrorListEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // -------------------------------------------------------------------------
  // Refs (mutable, no re-render)
  // -------------------------------------------------------------------------
  const formRef = useRef<HTMLFormElement | null>(null);
  const fieldsRef = useRef<Map<string, FieldRegistration>>(new Map());
  const pendingManagerRef = useRef(new PendingRequestManager());
  const remoteCacheRef = useRef<Map<string, RemoteValidatorCache>>(new Map());
  const pendingValidationsRef = useRef<Set<string>>(new Set());

  // Stabilized options refs (avoid useCallback dep churn on option changes)
  // Updated via useEffect to satisfy React Compiler
  const optionsRef = useRef(options);
  const fieldRulesRef = useRef(fieldRules);
  const customMessagesRef = useRef(customMessages);
  const resolvedGroupsRef = useRef<ResolvedGroups>({});

  useEffect(() => {
    optionsRef.current = options;
    fieldRulesRef.current = fieldRules;
    customMessagesRef.current = customMessages;
  });

  // -------------------------------------------------------------------------
  // Remote validator hook
  // -------------------------------------------------------------------------
  const remoteValidator = useRemoteValidator();

  // -------------------------------------------------------------------------
  // Resolved Groups
  // -------------------------------------------------------------------------
  const resolvedGroups = useMemo<ResolvedGroups>(() => {
    const result: ResolvedGroups = {};
    for (const [groupName, fieldSpec] of Object.entries(validationGroups)) {
      if (typeof fieldSpec === 'string') {
        result[groupName] = fieldSpec.split(/\s+/).filter(Boolean);
      } else if (Array.isArray(fieldSpec)) {
        result[groupName] = fieldSpec;
      }
    }
    return result;
  }, [validationGroups]);

  useEffect(() => {
    resolvedGroupsRef.current = resolvedGroups;
  }, [resolvedGroups]);

  // -------------------------------------------------------------------------
  // Helper: Get field element as FieldElement interface
  // -------------------------------------------------------------------------
  const getFieldElement = useCallback(
    (fieldName: string): FieldElement | null => {
      const registration = fieldsRef.current.get(fieldName);
      if (!registration) return null;

      const el = registration.element;
      if (el && 'nodeName' in el) {
        // Native DOM element — adapt to FieldElement interface
        const inputEl = el as HTMLInputElement;
        return {
          name: inputEl.name || fieldName,
          value: inputEl.value ?? registration.value,
          disabled: inputEl.disabled,
          readOnly: inputEl.readOnly,
          type: inputEl.type || 'text',
          checked: inputEl.checked,
          form: inputEl.form,
          id: inputEl.id || '',
          focus: () => inputEl.focus(),
          getAttribute: (name: string) => inputEl.getAttribute(name),
          setCustomValidity: (msg: string) => inputEl.setCustomValidity(msg),
          checkValidity: () => inputEl.checkValidity(),
        };
      }

      // No DOM element — create a minimal FieldElement from cached values
      return {
        name: fieldName,
        value: registration.value,
        disabled: false,
        readOnly: false,
        type: 'text',
        checked: false,
        form: formRef.current,
        id: '',
        focus: () => {},
        getAttribute: () => null,
      };
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Helper: Get field value
  // -------------------------------------------------------------------------
  const getFieldValue = useCallback(
    (fieldName: string): string => {
      const registration = fieldsRef.current.get(fieldName);
      if (!registration) return '';

      // Prefer DOM element value if available
      if (registration.element && 'value' in registration.element) {
        return (registration.element as HTMLInputElement).value;
      }

      return registration.value;
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Helper: Resolve rules for a field
  // -------------------------------------------------------------------------
  const resolveFieldRules = useCallback(
    (fieldName: string): NormalizedRules => {
      const element = getFieldElement(fieldName);

      // Build ValidatorSettings for rule-resolver
      const settings: ValidatorSettings = {
        rules: fieldRulesRef.current,
      };

      if (element) {
        try {
          return resolveRules(fieldName, {
            element,
            settings,
          });
        } catch {
          // Fallback: use static rules only
        }
      }

      // Fallback: normalize rules directly from settings
      const staticRules = fieldRulesRef.current[fieldName];
      if (staticRules) {
        return normalizeRules(normalizeRule(staticRules));
      }

      return {};
    },
    [getFieldElement],
  );

  // -------------------------------------------------------------------------
  // Helper: Resolve error message for a field+method
  // -------------------------------------------------------------------------
  const resolveErrorMessage = useCallback(
    (fieldName: string, method: string, parameters: RuleParameter): string => {
      const element = getFieldElement(fieldName);
      const title = element?.getAttribute('title') || undefined;

      // Build data-msg-{method} messages from the element
      const dataMessages: Record<string, string> = {};
      if (element) {
        const dataMsg = element.getAttribute(`data-msg-${method}`);
        if (dataMsg) {
          dataMessages[method] = dataMsg;
        }
        // Also try lowercase and kebab-case
        const dataMsgLower = element.getAttribute(`data-msg-${method.toLowerCase()}`);
        if (dataMsgLower) {
          dataMessages[method] = dataMsgLower;
        }
      }

      // Prepare custom messages
      const messages = customMessagesRef.current as Record<
        string,
        string | Record<string, string>
      >;

      return resolveMessage({
        fieldName,
        method,
        parameters,
        customMessages: messages,
        dataMessages: Object.keys(dataMessages).length > 0 ? dataMessages : undefined,
        title: title || undefined,
        ignoreTitle: optionsRef.current.debug,
        defaultMessages,
      });
    },
    [getFieldElement],
  );

  // -------------------------------------------------------------------------
  // Helper: Apply highlight/unhighlight to a field
  // -------------------------------------------------------------------------
  const applyHighlight = useCallback(
    (fieldName: string, isValid: boolean) => {
      const hl = optionsRef.current.highlight;
      const uhl = optionsRef.current.unhighlight;

      if (isValid) {
        uhl?.(fieldName, optionsRef.current.errorClass ?? 'error', optionsRef.current.validClass ?? 'valid');
      } else {
        hl?.(fieldName, optionsRef.current.errorClass ?? 'error', optionsRef.current.validClass ?? 'valid');
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Helper: Update error state for fields
  // -------------------------------------------------------------------------
  const updateErrorState = useCallback(
    (
      newErrorMap: Record<string, string>,
      newErrorList: ErrorListEntry[],
      pendingFields?: Set<string>,
    ) => {
      setErrorMap(newErrorMap);
      setErrorList(newErrorList);

      // Build new FormValidationState
      const fieldStates: Record<string, FieldValidationState> = {};
      const allFieldNames = new Set<string>([
        ...Array.from(fieldsRef.current.keys()),
        ...Object.keys(newErrorMap),
      ]);

      let errorCount = 0;
      let hasPending = false;

      Array.from(allFieldNames).forEach((fieldName) => {
        const errors: string[] = [];
        if (newErrorMap[fieldName]) {
          errors.push(newErrorMap[fieldName]);
          errorCount++;
        }

        const isPending = pendingFields?.has(fieldName) ?? false;
        if (isPending) hasPending = true;

        const registration = fieldsRef.current.get(fieldName);
        const isValid = errors.length === 0 && !isPending;

        fieldStates[fieldName] = {
          errors,
          isValid,
          isPending,
          isDirty: registration?.dirty ?? false,
          isTouched: registration?.touched ?? false,
        };
      });

      const isValid = errorCount === 0 && !hasPending;

      setFormState({
        fieldStates,
        isValid,
        isSubmitting: false,
        submitCount: submitCount,
        errorCount,
      });

      // Invoke showErrors callback
      optionsRef.current.showErrors?.(newErrorMap, newErrorList);
    },
    [submitCount],
  );

  // -------------------------------------------------------------------------
  // validateField — validate a single field
  // -------------------------------------------------------------------------
  const validateFieldFn = useCallback(
    (fieldName: string, valueOverride?: string): boolean | Promise<boolean> => {
      const registration = fieldsRef.current.get(fieldName);
      if (!registration) {
        // Field not registered — nothing to validate
        return true;
      }

      const value = valueOverride ?? getFieldValue(fieldName);
      const element = getFieldElement(fieldName);
      const normalizedRules = resolveFieldRules(fieldName);
      const rulesList = rulesToList(normalizedRules);

      // If no rules, field is valid
      if (rulesList.length === 0) {
        return true;
      }

      // Track if we need async validation
      let hasAsync = false;
      const syncErrors: Array<{ method: string; message: string }> = [];

      for (const rule of rulesList) {
        const validationMethod = builtinValidators[rule.method];

        if (!validationMethod) {
          // Unknown method — skip
          if (debug) {
            console.warn(`[ims-validation] Unknown validation method: ${rule.method}`);
          }
          continue;
        }

        try {
          const result = validationMethod(value, element ?? undefined, rule.parameters);

          if (result === DEPENDENCY_MISMATCH) {
            // Dependency not met — skip this rule
            continue;
          }

          if (result === PENDING) {
            // Remote validation needed — mark as async
            hasAsync = true;
            continue;
          }

          // Handle Promise (async methods)
          if (result instanceof Promise) {
            hasAsync = true;
            continue;
          }

          // Sync result
          if (result === true) {
            // Valid — continue to next rule
            continue;
          }

          if (result === false) {
            // Invalid — use default message
            const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
            syncErrors.push({ method: rule.method, message });
            continue;
          }

          // String result — if it's not a known constant, it's a custom error message
          if (typeof result === 'string') {
            syncErrors.push({ method: rule.method, message: result });
            continue;
          }
        } catch (err) {
          if (debug) {
            console.error(`[ims-validation] Error in method "${rule.method}" for field "${fieldName}":`, err);
          }
          // On error, treat as invalid with default message
          const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
          syncErrors.push({ method: rule.method, message });
        }
      }

      // If there are sync errors, immediately return false
      if (syncErrors.length > 0) {
        // Update state for this field
        const newErrorMap = { ...errorMap };
        const newErrorList = [...errorList];

        // Remove existing errors for this field
        delete newErrorMap[fieldName];
        const filteredList = newErrorList.filter((e) => e.fieldName !== fieldName);

        // Add first error for the field
        const firstError = syncErrors[0];
        newErrorMap[fieldName] = firstError.message;
        filteredList.push({
          message: firstError.message,
          fieldName,
          method: firstError.method,
        });

        updateErrorState(newErrorMap, filteredList);
        applyHighlight(fieldName, false);
        return false;
      }

      // If there are async rules, return a Promise
      if (hasAsync) {
        return (async () => {
          // Mark field as pending
          pendingValidationsRef.current.add(fieldName);

          const asyncErrors: Array<{ method: string; message: string }> = [];

          for (const rule of rulesList) {
            const validationMethod = builtinValidators[rule.method];
            if (!validationMethod) continue;

            try {
              const result = await validationMethod(value, element ?? undefined, rule.parameters);

              if (result === DEPENDENCY_MISMATCH) {
                continue;
              }

              if (result === PENDING) {
                // Delegate to remote validator
                const remoteResult = await executeRemoteValidation(
                  fieldName,
                  value,
                  rule.parameters,
                  element,
                );

                if (remoteResult === DEPENDENCY_MISMATCH) {
                  continue;
                }

                if (!remoteResult.isValid) {
                  const message =
                    remoteResult.message ??
                    resolveErrorMessage(fieldName, rule.method, rule.parameters);
                  asyncErrors.push({ method: rule.method, message });
                }
                continue;
              }

              if (result === true) {
                continue;
              }

              if (result === false) {
                const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
                asyncErrors.push({ method: rule.method, message });
                continue;
              }

              if (typeof result === 'string') {
                asyncErrors.push({ method: rule.method, message: result });
              }
            } catch (err) {
              if (debug) {
                console.error(
                  `[ims-validation] Async error in method "${rule.method}" for field "${fieldName}":`,
                  err,
                );
              }
              const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
              asyncErrors.push({ method: rule.method, message });
            }
          }

          // Remove from pending
          pendingValidationsRef.current.delete(fieldName);

          // Update state
          const newErrorMap = { ...errorMap };
          const newErrorList = [...errorList];

          delete newErrorMap[fieldName];
          const filteredList = newErrorList.filter((e) => e.fieldName !== fieldName);

          if (asyncErrors.length > 0) {
            const firstError = asyncErrors[0];
            newErrorMap[fieldName] = firstError.message;
            filteredList.push({
              message: firstError.message,
              fieldName,
              method: firstError.method,
            });
          }

          // We need fresh state from closures — read current
          updateErrorState(newErrorMap, filteredList, pendingValidationsRef.current);
          const isValid = asyncErrors.length === 0;
          applyHighlight(fieldName, isValid);
          return isValid;
        })();
      }

      // All sync rules passed — clear errors for this field
      const newErrorMap = { ...errorMap };
      const newErrorList = errorList.filter((e) => e.fieldName !== fieldName);
      delete newErrorMap[fieldName];

      updateErrorState(newErrorMap, newErrorList);
      applyHighlight(fieldName, true);
      return true;
    },
    [
      getFieldValue,
      getFieldElement,
      resolveFieldRules,
      resolveErrorMessage,
      updateErrorState,
      applyHighlight,
      errorMap,
      errorList,
      debug,
    ],
  );

  // -------------------------------------------------------------------------
  // Helper: Execute remote validation for a field
  // -------------------------------------------------------------------------
  const executeRemoteValidation = useCallback(
    async (
      fieldName: string,
      value: string,
      parameters: RuleParameter,
      element: FieldElement | null,
    ): Promise<RemoteValidationResult | typeof DEPENDENCY_MISMATCH> => {
      // Normalize remote param
      let remoteOptions: RemoteValidationOptions;
      if (typeof parameters === 'string') {
        remoteOptions = { url: parameters };
      } else if (
        typeof parameters === 'object' &&
        parameters !== null &&
        'url' in parameters
      ) {
        remoteOptions = parameters as RemoteValidationOptions;
      } else {
        // No URL — can't do remote validation
        if (debug) {
          console.warn(`[ims-validation] Remote validation for "${fieldName}" has no URL`);
        }
        return { isValid: true, value };
      }

      const registration = fieldsRef.current.get(fieldName);
      const abortController = new AbortController();

      // Track pending request
      pendingManagerRef.current.startRequest(fieldName, abortController);

      try {
        const result = await remoteValidator.validateRemote({
          value,
          fieldName,
          url: remoteOptions.url,
          method: remoteOptions.method,
          data: remoteOptions.data,
          dataType: remoteOptions.dataType,
          headers: remoteOptions.headers,
          withCredentials: remoteOptions.withCredentials,
          timeout: remoteOptions.timeout,
          cache: remoteOptions.cache,
          sendFieldName: remoteOptions.sendFieldName ?? true,
          element: element ?? undefined,
        });

        // Update remote cache
        if (result !== DEPENDENCY_MISMATCH) {
          remoteCacheRef.current.set(fieldName, {
            old: value,
            valid: result.isValid,
            message: result.message,
          });
        }

        return result;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return DEPENDENCY_MISMATCH;
        }
        // Network error — treat as invalid
        return { isValid: false, value };
      } finally {
        pendingManagerRef.current.stopRequest(fieldName);
      }
    },
    [debug, remoteValidator],
  );

  // -------------------------------------------------------------------------
  // validate — validate the entire form
  // -------------------------------------------------------------------------
  const validate = useCallback((): boolean => {
    const fieldNames = Array.from(fieldsRef.current.keys());

    // Also discover field names from the form DOM if available
    if (formRef.current) {
      const domFieldNames = getFieldNames(formRef.current);
      for (const name of domFieldNames) {
        if (!fieldsRef.current.has(name)) {
          // Auto-register DOM fields
          const el = formRef.current.elements.namedItem(name) as HTMLElement | null;
          if (el) {
            fieldsRef.current.set(name, {
              name,
              element: el,
              value: (el as HTMLInputElement).value ?? '',
              touched: false,
              dirty: false,
              initialValue: (el as HTMLInputElement).value ?? '',
            });
          }
        }
      }
    }

    let allValid = true;
    const newErrorMap: Record<string, string> = {};
    const newErrorList: ErrorListEntry[] = [];

    for (const fieldName of fieldNames) {
      const value = getFieldValue(fieldName);
      const element = getFieldElement(fieldName);
      const normalizedRules = resolveFieldRules(fieldName);
      const rulesList = rulesToList(normalizedRules);

      let fieldValid = true;
      let firstError: { method: string; message: string } | null = null;

      for (const rule of rulesList) {
        const validationMethod = builtinValidators[rule.method];
        if (!validationMethod) continue;

        try {
          const result = validationMethod(value, element ?? undefined, rule.parameters);

          if (result === DEPENDENCY_MISMATCH || result === PENDING) {
            // Skip dependency mismatch; pending is handled asynchronously
            continue;
          }

          if (result instanceof Promise) {
            // Skip promises in sync validate — use validateField for async
            continue;
          }

          if (result === true) {
            continue;
          }

          if (result === false) {
            const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
            if (!firstError) {
              firstError = { method: rule.method, message };
            }
            fieldValid = false;
            break; // Stop on first error per field (jQuery Validation behavior)
          }

          if (typeof result === 'string') {
            if (!firstError) {
              firstError = { method: rule.method, message: result };
            }
            fieldValid = false;
            break;
          }
        } catch (err) {
          if (debug) {
            console.error(`[ims-validation] Error validating "${fieldName}" with "${rule.method}":`, err);
          }
          const message = resolveErrorMessage(fieldName, rule.method, rule.parameters);
          if (!firstError) {
            firstError = { method: rule.method, message };
          }
          fieldValid = false;
          break;
        }
      }

      if (!fieldValid && firstError) {
        newErrorMap[fieldName] = firstError.message;
        newErrorList.push({
          message: firstError.message,
          fieldName,
          method: firstError.method,
        });
        allValid = false;
      }

      applyHighlight(fieldName, fieldValid);
    }

    updateErrorState(newErrorMap, newErrorList);

    // Handle groups: for grouped fields, only show one error per group
    if (Object.keys(resolvedGroupsRef.current).length > 0) {
      applyGroupErrors(newErrorMap, newErrorList);
    }

    return allValid;
  }, [
    getFieldValue,
    getFieldElement,
    resolveFieldRules,
    resolveErrorMessage,
    updateErrorState,
    applyHighlight,
    debug,
  ]);

  // -------------------------------------------------------------------------
  // Helper: Apply group error rules
  // -------------------------------------------------------------------------
  const applyGroupErrors = useCallback(
    (newErrorMap: Record<string, string>, newErrorList: ErrorListEntry[]) => {
      const groups = resolvedGroupsRef.current;

      for (const [, fieldNames] of Object.entries(groups)) {
        // Find errors in this group
        const groupErrors = newErrorList.filter((e) => fieldNames.includes(e.fieldName));

        if (groupErrors.length > 0) {
          // Keep only the first error in the group
          const firstError = groupErrors[0];
          const otherErrors = groupErrors.slice(1);

          // Remove other errors from errorMap and errorList
          for (const err of otherErrors) {
            // If a field has only this one error, remove it from the map
            if (newErrorMap[err.fieldName] === err.message) {
              delete newErrorMap[err.fieldName];
            }
          }

          // Filter the error list
          const otherFieldNames = new Set(otherErrors.map((e) => e.fieldName));
          for (let i = newErrorList.length - 1; i >= 0; i--) {
            const entry = newErrorList[i];
            if (
              otherFieldNames.has(entry.fieldName) &&
              entry.message === otherErrors.find((e) => e.fieldName === entry.fieldName)?.message
            ) {
              newErrorList.splice(i, 1);
            }
          }
        }
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // resetForm — reset all validation state
  // -------------------------------------------------------------------------
  const resetForm = useCallback(() => {
    // Abort all pending remote validations
    pendingManagerRef.current.abortAll();
    remoteValidator.abort();
    remoteCacheRef.current.clear();
    pendingValidationsRef.current.clear();

    // Reset field registrations
    fieldsRef.current.forEach((registration) => {
      registration.touched = false;
      registration.dirty = false;
      registration.initialValue = registration.value;
    });

    // Unhighlight all fields
    Array.from(fieldsRef.current.keys()).forEach((fieldName) => {
      applyHighlight(fieldName, true);
    });

    // Reset React state
    setErrorMap({});
    setErrorList([]);
    setFormState({
      fieldStates: {},
      isValid: true,
      isSubmitting: false,
      submitCount: 0,
      errorCount: 0,
    });
  }, [applyHighlight, remoteValidator]);

  // -------------------------------------------------------------------------
  // showErrors — display custom errors
  // -------------------------------------------------------------------------
  const displayErrors = useCallback(
    (errors: Record<string, string>) => {
      const newErrorMap = { ...errorMap, ...errors };
      const newErrorList = [...errorList];

      // Remove existing entries for fields in the new errors
      for (const fieldName of Object.keys(errors)) {
        const idx = newErrorList.findIndex((e) => e.fieldName === fieldName);
        if (idx !== -1) {
          newErrorList.splice(idx, 1);
        }
      }

      // Add new entries
      for (const [fieldName, message] of Object.entries(errors)) {
        newErrorList.push({
          message,
          fieldName,
          method: 'custom',
        });
      }

      updateErrorState(newErrorMap, newErrorList);

      // Apply highlight/unhighlight
      for (const fieldName of Object.keys(errors)) {
        applyHighlight(fieldName, false);
      }

      // Invoke the custom showErrors callback if provided
      optionsRef.current.showErrors?.(newErrorMap, newErrorList);
    },
    [errorMap, errorList, updateErrorState, applyHighlight],
  );

  // -------------------------------------------------------------------------
  // handleSubmit — handle form submission
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (event?: React.FormEvent): Promise<boolean> => {
      // Prevent default form submission
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Debug mode: log and prevent submission
      if (debug) {
        console.log('[ims-validation] Form submit intercepted (debug mode)');
      }

      // Increment submit count
      const newSubmitCount = submitCount + 1;
      setSubmitCount(newSubmitCount);
      setIsSubmitting(true);

      try {
        // If onsubmit is true, validate the form first
        if (onsubmit) {
          // Wait for any pending remote validations
          await waitForPendingValidations();

          const isFormValid = validate();

          if (!isFormValid) {
            // Call invalidHandler
            optionsRef.current.invalidHandler?.(errorList, {
              ...formState,
              isSubmitting: false,
              submitCount: newSubmitCount,
            });

            // Focus first invalid field
            if (shouldFocusInvalid) {
              focusInvalidFn();
            }

            setIsSubmitting(false);
            return false;
          }
        }

        // If a submitHandler is provided, call it
        if (submitHandler) {
          const formData = formRef.current
            ? new FormData(formRef.current)
            : new FormData();

          const handlerResult = await submitHandler(formData, formRef.current ?? undefined);

          if (handlerResult === false) {
            setIsSubmitting(false);
            return false;
          }
        }

        setIsSubmitting(false);
        return true;
      } catch (err) {
        if (debug) {
          console.error('[ims-validation] Submit handler error:', err);
        }
        setIsSubmitting(false);
        return false;
      }
    },
    [
      debug,
      onsubmit,
      shouldFocusInvalid,
      submitHandler,
      submitCount,
      formState,
      errorList,
      validate,
    ],
  );

  // -------------------------------------------------------------------------
  // waitForPendingValidations — wait for all in-flight remote validations
  // -------------------------------------------------------------------------
  const waitForPendingValidations = useCallback(async (): Promise<void> => {
    // Poll until all pending requests resolve
    const maxWait = 30000; // 30 second timeout
    const interval = 50;
    let waited = 0;

    while (pendingManagerRef.current.pendingCount > 0 && waited < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      waited += interval;
    }
  }, []);

  // -------------------------------------------------------------------------
  // registerField — register a field with the validator
  // -------------------------------------------------------------------------
  const registerField = useCallback(
    (fieldName: string, elementOrRef?: HTMLElement | React.RefObject<HTMLElement>) => {
      let element: HTMLElement | null = null;

      if (elementOrRef) {
        if ('current' in elementOrRef) {
          // React.RefObject
          element = elementOrRef.current;
        } else {
          // Direct HTMLElement
          element = elementOrRef;
        }
      } else if (formRef.current) {
        // Try to find the element in the form
        const found = formRef.current.elements.namedItem(fieldName) as HTMLElement | null;
        element = found;
      }

      const initialValue = element && 'value' in element
        ? (element as HTMLInputElement).value
        : '';

      fieldsRef.current.set(fieldName, {
        name: fieldName,
        element,
        value: initialValue,
        touched: false,
        dirty: false,
        initialValue,
      });
    },
    [],
  );

  // -------------------------------------------------------------------------
  // unregisterField — unregister a field
  // -------------------------------------------------------------------------
  const unregisterField = useCallback(
    (fieldName: string) => {
      fieldsRef.current.delete(fieldName);

      // Abort any pending remote validation for this field
      pendingManagerRef.current.abortRequest(fieldName);
      remoteValidator.abortField(fieldName);
      remoteCacheRef.current.delete(fieldName);
      pendingValidationsRef.current.delete(fieldName);

      // Remove errors for this field
      const newErrorMap = { ...errorMap };
      const newErrorList = errorList.filter((e) => e.fieldName !== fieldName);
      delete newErrorMap[fieldName];

      if (Object.keys(newErrorMap).length !== Object.keys(errorMap).length) {
        updateErrorState(newErrorMap, newErrorList);
      }
    },
    [errorMap, errorList, updateErrorState, remoteValidator],
  );

  // -------------------------------------------------------------------------
  // setFieldValue — set field value (for controlled components)
  // -------------------------------------------------------------------------
  const setFieldValue = useCallback(
    (fieldName: string, value: string) => {
      const registration = fieldsRef.current.get(fieldName);
      if (registration) {
        registration.value = value;
        registration.dirty = value !== registration.initialValue;

        // Update DOM element if available
        if (registration.element && 'value' in registration.element) {
          (registration.element as HTMLInputElement).value = value;
        }
      } else {
        // Auto-register the field
        fieldsRef.current.set(fieldName, {
          name: fieldName,
          element: null,
          value,
          touched: false,
          dirty: false,
          initialValue: '',
        });
      }

      // If focusCleanup is enabled, clear error for this field
      if (focusCleanup && errorMap[fieldName]) {
        const newErrorMap = { ...errorMap };
        const newErrorList = errorList.filter((e) => e.fieldName !== fieldName);
        delete newErrorMap[fieldName];
        updateErrorState(newErrorMap, newErrorList);
        applyHighlight(fieldName, true);
      }
    },
    [errorMap, errorList, updateErrorState, applyHighlight, focusCleanup],
  );

  // -------------------------------------------------------------------------
  // touchField — mark a field as interacted
  // -------------------------------------------------------------------------
  const touchField = useCallback(
    (fieldName: string) => {
      const registration = fieldsRef.current.get(fieldName);
      if (registration) {
        registration.touched = true;
      }

      // Update form state's field touched flag
      setFormState((prev) => {
        const fieldStates = { ...prev.fieldStates };
        if (fieldStates[fieldName]) {
          fieldStates[fieldName] = {
            ...fieldStates[fieldName],
            isTouched: true,
          };
        }
        return { ...prev, fieldStates };
      });
    },
    [],
  );

  // -------------------------------------------------------------------------
  // focusInvalid — focus the first invalid field
  // -------------------------------------------------------------------------
  const focusInvalidFn = useCallback(() => {
    if (errorList.length === 0) return;

    const firstError = errorList[0];
    const registration = fieldsRef.current.get(firstError.fieldName);

    if (registration?.element && 'focus' in registration.element) {
      try {
        (registration.element as HTMLElement).focus();
      } catch {
        // Element may not be focusable
      }
    } else if (formRef.current) {
      // Try to find the element in the form
      const el = formRef.current.elements.namedItem(firstError.fieldName) as HTMLElement | null;
      if (el && 'focus' in el) {
        try {
          el.focus();
        } catch {
          // Element may not be focusable
        }
      }
    }
  }, [errorList]);

  // -------------------------------------------------------------------------
  // Computed values
  // -------------------------------------------------------------------------
  const isValid = formState.isValid;
  const numberOfInvalids = formState.errorCount;

  // -------------------------------------------------------------------------
  // Lifecycle: cleanup on unmount
  // -------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      // Abort all pending remote validations
      pendingManagerRef.current.abortAll();
      remoteCacheRef.current.clear();
      pendingValidationsRef.current.clear();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Return the hook API
  // -------------------------------------------------------------------------
  return {
    formState,
    errorMap,
    errorList,
    validate,
    validateField: validateFieldFn,
    isValid,
    resetForm,
    showErrors: displayErrors,
    numberOfInvalids,
    handleSubmit,
    registerField,
    unregisterField,
    setFieldValue,
    touchField,
    focusInvalid: focusInvalidFn,
    formRef,
    isSubmitting,
    submitCount,
  };
}
