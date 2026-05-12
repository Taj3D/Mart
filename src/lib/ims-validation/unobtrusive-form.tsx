'use client';

/**
 * IMS Validation - Unobtrusive Form Component
 *
 * React component that wraps a form with unobtrusive validation, replacing
 * the jQuery pattern of `$(form).validate()` + `$.validator.unobtrusive.parse()`.
 *
 * Key mappings from Microsoft jQuery Unobtrusive Validation:
 *   - `$.validator.unobtrusive.parse(form)` → auto-parsing children on mount
 *   - `validationInfo(form).attachValidation()` → ImsValidationProvider integration
 *   - `validationInfo(form).validate()` → form submit handler
 *   - `onReset(event)` → form reset handler
 *   - `onError(error, inputElement)` → error display via ImsFormField
 *   - `onSuccess(error)` → error removal on valid input
 *   - `onErrors(event, validator)` → validation summary update
 *   - `data-valmsg-for` → per-field error display
 *   - `data-valmsg-summary` → validation summary display
 *
 * @module ims-validation/unobtrusive-form
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  ImsUnobtrusiveFormProps,
  UnobtrusiveFieldConfig,
} from './unobtrusive-types';

import type {
  ErrorListEntry,
  FieldRules,
  FormValidationState,
  ValidationMessages,
} from './types';

import { ImsValidationProvider, useImsValidation } from './ims-validation-provider';

import {
  parseForm,
  parseFieldConfig,
  toValidationConfig,
} from './unobtrusive-parser';

import { ImsAdapterRegistry } from './unobtrusive-adapters';

// ============================================================================
// Internal Types
// ============================================================================

/**
 * State for tracking which fields have been touched/interacted with.
 */
interface FieldInteractionState {
  /** Whether the field has been blurred (touched) */
  touched: boolean;
  /** Whether the field value has changed from initial (dirty) */
  dirty: boolean;
  /** Current error messages for this field */
  errors: string[];
}

// ============================================================================
// Unobtrusive Validation Summary Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveValidationSummary component.
 */
export interface ImsUnobtrusiveValidationSummaryProps {
  /** Additional CSS class */
  className?: string;
  /** Title for the summary (default: "Please fix the following errors:") */
  title?: string;
  /** List of errors to display */
  errors: Array<{ fieldName: string; message: string }>;
  /** Whether to show the summary */
  visible: boolean;
}

/**
 * Validation summary component styled with Deep Navy Blue theme.
 * Replaces the `[data-valmsg-summary=true]` container from the original library.
 */
export function ImsUnobtrusiveValidationSummary({
  className,
  title = 'Please fix the following errors:',
  errors,
  visible,
}: ImsUnobtrusiveValidationSummaryProps) {
  if (!visible || errors.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-md p-4 mb-4 border border-red-400/30 bg-red-400/5${
        className ? ` ${className}` : ''
      }`}
    >
      <p className="text-sm font-medium text-red-400 mb-2">{title}</p>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li
            key={`${error.fieldName}-${index}`}
            className="text-sm text-red-400"
          >
            <span className="font-medium text-red-300">{error.fieldName}</span>:{' '}
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Field Error Display Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveFieldError component.
 */
export interface ImsUnobtrusiveFieldErrorProps {
  /** The field name this error targets (from `data-valmsg-for`) */
  fieldName: string;
  /** The error message to display */
  message?: string;
  /** Whether to replace the container content (from `data-valmsg-replace`) */
  replace?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Per-field error display component.
 * Replaces the `[data-valmsg-for='fieldName']` container from the original library.
 */
export function ImsUnobtrusiveFieldError({
  fieldName,
  message,
  replace = true,
  className,
}: ImsUnobtrusiveFieldErrorProps) {
  if (!message) {
    return (
      <span
        data-valmsg-for={fieldName}
        className={`text-sm field-validation-valid${className ? ` ${className}` : ''}`}
        aria-hidden="true"
      />
    );
  }

  if (replace) {
    return (
      <span
        data-valmsg-for={fieldName}
        role="alert"
        aria-live="polite"
        className={`text-red-400 text-sm mt-1 block field-validation-error${
          className ? ` ${className}` : ''
        }`}
      >
        {message}
      </span>
    );
  }

  return (
    <span
      data-valmsg-for={fieldName}
      role="alert"
      aria-live="polite"
      className={`text-red-400 text-sm field-validation-error${
        className ? ` ${className}` : ''
      }`}
    >
      {message}
    </span>
  );
}

// ============================================================================
// Default validation context values (for when no provider is present)
// ============================================================================

const DEFAULT_VALIDATION_CONTEXT = {
  errorList: [] as ErrorListEntry[],
  formState: {
    fieldStates: {},
    isValid: true,
    isSubmitting: false,
    submitCount: 0,
    errorCount: 0,
  } as FormValidationState,
  validate: (): boolean => true,
  errorMap: {} as Record<string, string>,
};

// ============================================================================
// Main ImsUnobtrusiveForm Component
// ============================================================================

/**
 * Form wrapper component with unobtrusive validation.
 *
 * Combines the ImsValidationProvider with automatic parsing of HTML
 * `data-val-*` attributes, providing a drop-in replacement for the
 * jQuery unobtrusive validation pattern.
 *
 * @example
 * ```tsx
 * <ImsUnobtrusiveForm
 *   showSummary={true}
 *   onSubmit={(data, isValid) => console.log(data, isValid)}
 *   fields={[
 *     { name: 'email', adapters: { required: { message: 'Required' }, email: { message: 'Invalid' } } }
 *   ]}
 * >
 *   <input name="email" />
 *   <button type="submit">Submit</button>
 * </ImsUnobtrusiveForm>
 * ```
 */
export function ImsUnobtrusiveForm({
  children,
  mode = 'onBlur',
  errorClass = 'input-validation-error',
  showSummary = false,
  summaryTitle,
  onSubmit,
  onInvalid,
  autoParse = true,
  className,
  // Extended props for declarative configuration
  fields: fieldConfigs,
  rules: explicitRules,
  messages: explicitMessages,
}: ImsUnobtrusiveFormProps & {
  /** Declarative field configurations (alternative to auto-parsing) */
  fields?: UnobtrusiveFieldConfig[];
  /** Explicit rules (alternative to auto-parsing) */
  rules?: FieldRules;
  /** Explicit messages (alternative to auto-parsing) */
  messages?: ValidationMessages;
}) {
  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // State for DOM-parsed validation config (only for autoParse mode)
  const [domParsedConfig, setDomParsedConfig] = useState<{
    rules: FieldRules;
    messages: ValidationMessages;
  } | null>(null);

  // Compute parsed config from explicit rules or field configs using useMemo
  // (no setState in effect — this is purely derived from props)
  const propsParsedConfig = useMemo<{
    rules: FieldRules;
    messages: ValidationMessages;
  } | null>(() => {
    if (explicitRules && Object.keys(explicitRules).length > 0) {
      return {
        rules: explicitRules,
        messages: explicitMessages || {},
      };
    }

    if (fieldConfigs && fieldConfigs.length > 0) {
      const parsed = parseFieldConfig(fieldConfigs);
      return toValidationConfig(parsed);
    }

    return null;
  }, [explicitRules, explicitMessages, fieldConfigs]);

  // State for form validation errors (used in fallback mode without provider)
  const [errors, setErrors] = useState<Array<{ fieldName: string; message: string }>>([]);
  const [isValid, setIsValid] = useState(true);

  // Resolve which config to use: props-based takes priority, then DOM-parsed
  const activeConfig = propsParsedConfig || domParsedConfig;

  // Use a ref callback to parse DOM after form mounts
  const formRefCallback = useCallback(
    (node: HTMLFormElement | null) => {
      (formRef as React.MutableRefObject<HTMLFormElement | null>).current = node;

      if (!node) return;
      if (propsParsedConfig) return; // props take priority
      if (!autoParse) return;

      // Parse from DOM data-val-* attributes
      const parsed = parseForm(node);
      if (Object.keys(parsed.rules).length > 0) {
        const config = toValidationConfig(parsed);
        setDomParsedConfig(config);
      }
    },
    [propsParsedConfig, autoParse],
  );

  // Form reset handler
  const handleReset = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  // If we have an active config, wrap with ImsValidationProvider
  if (activeConfig) {
    return (
      <ImsValidationProvider
        rules={activeConfig.rules}
        messages={activeConfig.messages}
        mode={mode}
        errorClass={errorClass}
        onSubmit={onSubmit ? async (formData) => {
          onSubmit(Object.fromEntries(formData.entries()) as Record<string, string>, true);
        } : undefined}
        onInvalid={onInvalid ? (errs) => {
          onInvalid(errs.map(e => ({ fieldName: e.fieldName, message: e.message })));
        } : undefined}
      >
        <ImsUnobtrusiveFormInner
          formRef={formRefCallback}
          className={className}
          showSummary={showSummary}
          summaryTitle={summaryTitle}
          onReset={handleReset}
        >
          {children}
        </ImsUnobtrusiveFormInner>
      </ImsValidationProvider>
    );
  }

  // Without validation config, render plain form with manual error tracking
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    if (isValid) {
      onSubmit?.(data, true);
    } else {
      onInvalid?.(errors);
    }
  };

  return (
    <form
      ref={formRefCallback}
      className={className}
      onSubmit={handleSubmit}
      onReset={handleReset}
      noValidate
    >
      {showSummary && (
        <ImsUnobtrusiveValidationSummary
          errors={errors}
          visible={errors.length > 0}
          title={summaryTitle}
        />
      )}

      {children}

      <input type="hidden" data-ims-validation="unobtrusive" />
    </form>
  );
}

// ============================================================================
// Inner Form Component (uses ImsValidationProvider context)
// ============================================================================

/**
 * Props for the inner form component that has access to ImsValidationProvider context.
 */
interface ImsUnobtrusiveFormInnerProps {
  formRef: (node: HTMLFormElement | null) => void;
  className?: string;
  showSummary?: boolean;
  summaryTitle?: string;
  onReset: () => void;
  children: React.ReactNode;
}

/**
 * Inner form component that uses the ImsValidationProvider context.
 * Always rendered inside the provider, so the hook call is unconditional.
 */
function ImsUnobtrusiveFormInner({
  formRef,
  className,
  showSummary = false,
  summaryTitle,
  onReset,
  children,
}: ImsUnobtrusiveFormInnerProps) {
  // Always call the hook unconditionally — this component is only rendered
  // inside ImsValidationProvider, so the hook will always succeed
  let validationContext: {
    errorList: ErrorListEntry[];
    formState: FormValidationState;
    validate: () => boolean;
    errorMap: Record<string, string>;
  };

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- always called in same order within this component
    validationContext = useImsValidation();
  } catch {
    validationContext = DEFAULT_VALIDATION_CONTEXT;
  }

  const { errorList, formState, validate } = validationContext;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const isFormValid = validate();
      if (isFormValid) {
        // Form is valid — the ImsValidationProvider's onSubmit will handle it
      }
    },
    [validate],
  );

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  // Build summary errors
  const summaryErrors = useMemo(
    () => errorList.map((e) => ({ fieldName: e.fieldName, message: e.message })),
    [errorList],
  );

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={handleSubmit}
      onReset={handleReset}
      noValidate
    >
      {showSummary && (
        <ImsUnobtrusiveValidationSummary
          errors={summaryErrors}
          visible={formState.submitCount > 0 && errorList.length > 0}
          title={summaryTitle}
        />
      )}

      {children}

      <input type="hidden" data-ims-validation="unobtrusive" />
    </form>
  );
}

// ============================================================================
// Convenience Hook: useUnobtrusiveValidation
// ============================================================================

/**
 * Options for the useUnobtrusiveValidation hook.
 */
export interface UseUnobtrusiveValidationOptions {
  /** Field configurations */
  fields?: UnobtrusiveFieldConfig[];
  /** Explicit rules */
  rules?: FieldRules;
  /** Explicit messages */
  messages?: ValidationMessages;
  /** Adapter registry instance (default: global) */
  registry?: ImsAdapterRegistry;
}

/**
 * Return type for the useUnobtrusiveValidation hook.
 */
export interface UseUnobtrusiveValidationReturn {
  /** Resolved validation rules for ImsValidationProvider */
  rules: FieldRules;
  /** Resolved validation messages for ImsValidationProvider */
  messages: ValidationMessages;
  /** Whether the configuration has been parsed */
  isReady: boolean;
}

/**
 * Hook that parses unobtrusive validation configuration into a format
 * compatible with ImsValidationProvider.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { rules, messages, isReady } = useUnobtrusiveValidation({
 *     fields: [
 *       { name: 'email', adapters: { required: { message: 'Email is required' }, email: { message: 'Invalid' } } }
 *     ]
 *   });
 *
 *   return (
 *     <ImsValidationProvider rules={rules} messages={messages}>
 *       <form>...</form>
 *     </ImsValidationProvider>
 *   );
 * }
 * ```
 */
export function useUnobtrusiveValidation(
  options: UseUnobtrusiveValidationOptions = {},
): UseUnobtrusiveValidationReturn {
  const { fields, rules: explicitRules, messages: explicitMessages, registry } = options;

  const config = useMemo(() => {
    if (explicitRules && Object.keys(explicitRules).length > 0) {
      return {
        rules: explicitRules,
        messages: explicitMessages || {},
      };
    }

    if (fields && fields.length > 0) {
      const parsed = parseFieldConfig(fields, registry || undefined);
      return toValidationConfig(parsed);
    }

    return null;
  }, [fields, explicitRules, explicitMessages, registry]);

  return {
    rules: config?.rules || {},
    messages: config?.messages || {},
    isReady: config !== null,
  };
}
