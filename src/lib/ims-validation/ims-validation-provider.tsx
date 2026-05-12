'use client';

/**
 * IMS Validation - Validation Provider
 *
 * React Context provider that wraps form validation, replacing the jQuery
 * pattern of `$(form).validate(options)` which creates a validator instance
 * attached to the form.
 *
 * Internally uses the `useImsValidator` hook for all validation logic,
 * providing its full return value through React Context so that child
 * `ImsFormField` components can access it declaratively.
 *
 * Key mappings from jQuery Validation 1.11.1:
 *   - `$(form).validate(options)` → `<ImsValidationProvider>`
 *   - `validator.form()` → `validate()`
 *   - `validator.element(name)` → `validateField(name)`
 *   - `validator.resetForm()` → `resetForm()`
 *   - `validator.settings.focusInvalid` → `focusInvalid` prop
 *   - `validator.settings.submitHandler` → `onSubmit` prop
 *   - `validator.settings.invalidHandler` → `onInvalid` prop
 *   - `validator.settings.errorClass` → `errorClass` prop
 *   - `validator.settings.validClass` → `validClass` prop
 *
 * @module ims-validation/ims-validation-provider
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';

import type {
  ErrorListEntry,
  FieldRules,
  FormValidationState,
  NormalizedRules,
  ValidateMode,
  ValidationMessages,
} from './types';

import type { UseImsValidatorReturn } from './use-ims-validator';
import { useImsValidator } from './use-ims-validator';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the ImsValidationProvider component.
 *
 * Maps the options object passed to `$(form).validate(options)` in jQuery
 * Validation 1.11.1, plus React-specific additions for declarative usage.
 */
export interface ImsValidationProviderProps {
  /** Children (should contain a form) */
  children: React.ReactNode;
  /** Validation rules per field. Maps `$.validator.settings.rules` */
  rules?: FieldRules;
  /** Custom validation messages. Maps `$.validator.settings.messages` */
  messages?: ValidationMessages;
  /** Validation mode. Consolidates `onsubmit`, `onfocusout`, `onkeyup` settings */
  mode?: ValidateMode;
  /** Focus first invalid field on submit. Maps `$.validator.defaults.focusInvalid`. Default: true */
  focusInvalid?: boolean;
  /** Submit handler called when form is valid. Maps `$.validator.defaults.submitHandler` */
  onSubmit?: (
    formData: FormData,
    form?: HTMLFormElement,
  ) => boolean | void | Promise<boolean | void>;
  /** Invalid handler called when form is invalid. Maps `$.validator.defaults.invalidHandler` */
  onInvalid?: (errors: ErrorListEntry[], formState: FormValidationState) => void;
  /** Error CSS class. Maps `$.validator.defaults.errorClass`. Default: 'ims-error' */
  errorClass?: string;
  /** Valid CSS class. Maps `$.validator.defaults.validClass`. Default: 'ims-valid' */
  validClass?: string;
  /** Debug mode. Maps `$.validator.defaults.debug`. Default: false */
  debug?: boolean;
}

/**
 * Extended context value that combines the full useImsValidator return value
 * with additional provider-level properties needed by ImsFormField components.
 */
export interface ImsValidationContextValue extends UseImsValidatorReturn {
  /** Error CSS class name for styling invalid fields */
  errorClass: string;
  /** Valid CSS class name for styling valid fields */
  validClass: string;
  /** Set per-field custom rules override (called by ImsFormField on mount) */
  setFieldRuleOverride: (fieldName: string, rules: NormalizedRules) => void;
  /** Clear per-field custom rules override (called by ImsFormField on unmount) */
  clearFieldRuleOverride: (fieldName: string) => void;
  /** Set per-field custom messages (called by ImsFormField on mount) */
  setFieldMessageOverride: (fieldName: string, messages: Record<string, string>) => void;
  /** Clear per-field custom messages (called by ImsFormField on unmount) */
  clearFieldMessageOverride: (fieldName: string) => void;
  /** Get all current field rule overrides (for validator access) */
  getFieldRuleOverrides: () => Record<string, NormalizedRules>;
  /** Get all current field message overrides (for validator access) */
  getFieldMessageOverrides: () => Record<string, Record<string, string>>;
}

// ============================================================================
// Context
// ============================================================================

/**
 * React context for IMS form validation.
 *
 * Created by `ImsValidationProvider` and consumed by `ImsFormField` components
 * via the `useImsValidation()` hook.
 *
 * In jQuery Validation 1.11.1, the validator instance is attached to the form
 * via `$.data(form, "validator")`. This context replaces that data-based
 * attachment pattern with React's context system.
 */
export const ImsValidationContext = createContext<ImsValidationContextValue | null>(null);

ImsValidationContext.displayName = 'ImsValidationContext';

// ============================================================================
// ImsValidationProvider Component
// ============================================================================

/**
 * React Context provider that wraps form validation.
 *
 * Replaces the jQuery pattern of `$(form).validate(options)` which creates
 * a validator instance attached to the form.
 *
 * Internally delegates all validation logic to the `useImsValidator` hook
 * and exposes the full return value through React Context.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   return (
 *     <ImsValidationProvider
 *       rules={{
 *         username: { required: true, minlength: 3 },
 *         email: { required: true, email: true },
 *       }}
 *       messages={{
 *         username: { required: 'Please enter a username' },
 *       }}
 *       onSubmit={async (formData) => {
 *         await saveUser(formData);
 *       }}
 *       onInvalid={(errors, formState) => {
 *         console.log('Form has errors:', errors);
 *       }}
 *     >
 *       <form>
 *         <ImsFormField name="username" label="Username">
 *           <input name="username" type="text" />
 *         </ImsFormField>
 *         <ImsFormField name="email" label="Email">
 *           <input name="email" type="email" />
 *         </ImsFormField>
 *         <button type="submit">Submit</button>
 *       </form>
 *     </ImsValidationProvider>
 *   );
 * }
 * ```
 */
export function ImsValidationProvider({
  children,
  rules,
  messages,
  mode,
  focusInvalid = true,
  onSubmit,
  onInvalid,
  errorClass = 'ims-error',
  validClass = 'ims-valid',
  debug = false,
}: ImsValidationProviderProps) {
  // ------------------------------------------------------------------------
  // Per-field rule/message overrides (populated by ImsFormField on mount)
  // ------------------------------------------------------------------------

  const fieldRuleOverrides = useRef<Record<string, NormalizedRules>>({});
  const fieldMessageOverrides = useRef<Record<string, Record<string, string>>>({});

  // Methods for ImsFormField to register/unregister overrides
  const setFieldRuleOverride = useCallback(
    (fieldName: string, rules: NormalizedRules) => { fieldRuleOverrides.current[fieldName] = rules; },
    [],
  );
  const clearFieldRuleOverride = useCallback(
    (fieldName: string) => { delete fieldRuleOverrides.current[fieldName]; },
    [],
  );
  const setFieldMessageOverride = useCallback(
    (fieldName: string, messages: Record<string, string>) => { fieldMessageOverrides.current[fieldName] = messages; },
    [],
  );
  const clearFieldMessageOverride = useCallback(
    (fieldName: string) => { delete fieldMessageOverrides.current[fieldName]; },
    [],
  );
  const getFieldRuleOverrides = useCallback(
    () => fieldRuleOverrides.current,
    [],
  );
  const getFieldMessageOverrides = useCallback(
    () => fieldMessageOverrides.current,
    [],
  );

  // ------------------------------------------------------------------------
  // Delegate to useImsValidator for all validation logic
  // ------------------------------------------------------------------------

  const validator = useImsValidator({
    rules,
    messages,
    mode,
    focusInvalid,
    submitHandler: onSubmit,
    invalidHandler: onInvalid,
    errorClass,
    validClass,
    debug,
  });

  // ------------------------------------------------------------------------
  // Context value — extends useImsValidator return with provider extras
  // ------------------------------------------------------------------------

  const contextValue = useMemo<ImsValidationContextValue>(
    () => ({
      ...validator,
      errorClass,
      validClass,
      setFieldRuleOverride,
      clearFieldRuleOverride,
      setFieldMessageOverride,
      clearFieldMessageOverride,
      getFieldRuleOverrides,
      getFieldMessageOverrides,
    }),
    [validator, errorClass, validClass, setFieldRuleOverride, clearFieldRuleOverride,
     setFieldMessageOverride, clearFieldMessageOverride, getFieldRuleOverrides, getFieldMessageOverrides],
  );

  return (
    <ImsValidationContext.Provider value={contextValue}>
      {children}
    </ImsValidationContext.Provider>
  );
}

// ============================================================================
// useImsValidation Hook
// ============================================================================

/**
 * Consumer hook for accessing the validation context.
 *
 * Must be used within an `ImsValidationProvider`. Throws an error if used
 * outside of a provider, matching the pattern of enforcing context boundaries.
 *
 * @example
 * ```tsx
 * function MyCustomField() {
 *   const { validateField, formState, errorMap } = useImsValidation();
 *   // ... custom field implementation
 * }
 * ```
 *
 * @returns The validation context value (full useImsValidator return + provider extras)
 * @throws Error if used outside of an ImsValidationProvider
 */
export function useImsValidation(): ImsValidationContextValue {
  const context = useContext(ImsValidationContext);

  if (context === null) {
    throw new Error(
      'useImsValidation must be used within an <ImsValidationProvider>. ' +
        'Wrap your form with <ImsValidationProvider> to enable validation.',
    );
  }

  return context;
}
