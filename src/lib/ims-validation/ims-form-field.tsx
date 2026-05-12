'use client';

/**
 * IMS Validation - Form Field Component
 *
 * Creates a form field wrapper component that handles validation display,
 * replacing the jQuery Validation pattern of auto-creating error labels and
 * highlighting/unhighlighting fields.
 *
 * Key mappings from jQuery Validation 1.11.1:
 *   - Auto-created error `<label>` → `<ImsValidationError>`
 *   - `highlight(element, errorClass, validClass)` → wrapper CSS class toggling
 *   - `unhighlight(element, errorClass, validClass)` → wrapper CSS class toggling
 *   - `errorPlacement(error, element)` → `errorPlacement` prop
 *   - `errorLabelContainer` → `<ImsValidationSummary>`
 *   - Required indicator from `required` rule → `<ImsRequiredIndicator>`
 *
 * @module ims-validation/ims-form-field
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from 'react';

import type {
  ErrorListEntry,
  FormValidationState,
  InsertMode,
  NormalizedRules,
} from './types';

import { useImsValidation } from './ims-validation-provider';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the ImsFormField component.
 *
 * Provides a declarative API for wrapping form inputs with validation
 * display logic, replacing jQuery Validation's imperative DOM manipulation.
 */
export interface ImsFormFieldProps {
  /** Field name (must match a key in rules). Maps to `element.name` */
  name: string;
  /** Label text displayed above the field */
  label?: string;
  /** The input element(s) to wrap */
  children: React.ReactNode;
  /** Custom rules for this field only (overrides provider rules) */
  rules?: NormalizedRules;
  /** Custom messages for this field */
  messages?: Record<string, string>;
  /** Where to show the error (default: 'after'). Maps to `errorPlacement` */
  errorPlacement?: InsertMode;
  /** Show error only when touched (default: true) */
  showErrorOnTouched?: boolean;
  /** CSS class for the wrapper */
  className?: string;
  /** Whether this field is required (adds visual indicator) */
  required?: boolean;
  /** Help text shown below the field */
  helpText?: string;
  /** Whether to hide the error message */
  hideError?: boolean;
}

/**
 * Props for the ImsValidationError component.
 */
export interface ImsValidationErrorProps {
  /** The error message to display */
  message: string;
  /** The field name this error is associated with */
  fieldName?: string;
  /** Additional CSS class */
  className?: string;
  /** Whether to animate the error (default: true) */
  animate?: boolean;
  /** Unique ID for the error element (for aria-describedby) */
  id?: string;
}

/**
 * Props for the ImsValidationSummary component.
 *
 * Replaces the `errorContainer` / `errorLabelContainer` options from
 * jQuery Validation 1.11.1.
 */
export interface ImsValidationSummaryProps {
  /** Additional CSS class */
  className?: string;
  /** Title for the summary (default: "Please fix the following errors:") */
  title?: string;
  /** Custom render function for each error */
  renderItem?: (error: ErrorListEntry, index: number) => React.ReactNode;
  /** Whether to show the summary only after form submit attempt (default: true) */
  showAfterSubmit?: boolean;
  /** Whether to animate the summary (default: true) */
  animate?: boolean;
}

/**
 * Props for the ImsRequiredIndicator component.
 */
export interface ImsRequiredIndicatorProps {
  /** Additional CSS class */
  className?: string;
  /** Custom indicator character (default: '*') */
  indicator?: string;
}

// ============================================================================
// Animation CSS (injected once)
// ============================================================================

/** Whether the animation styles have been injected into the document */
let stylesInjected = false;

/** Unique style element ID */
const STYLE_ID = 'ims-validation-animations';

/**
 * Inject CSS animation styles for error display into the document head.
 * Uses a check to ensure styles are only injected once.
 */
function injectAnimationStyles(): void {
  if (stylesInjected) return;
  if (typeof document === 'undefined') return;

  // Check if already injected
  if (document.getElementById(STYLE_ID)) {
    stylesInjected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ims-error-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ims-error-fade-out {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-4px); }
    }
    .ims-error-enter {
      animation: ims-error-fade-in 0.2s ease-out forwards;
    }
    .ims-error-exit {
      animation: ims-error-fade-out 0.15s ease-in forwards;
    }
    @keyframes ims-summary-fade-in {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 500px; }
    }
    .ims-summary-enter {
      animation: ims-summary-fade-in 0.3s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ============================================================================
// ImsRequiredIndicator Component
// ============================================================================

/**
 * Required field indicator (*) component.
 *
 * Displays a red asterisk after the label for required fields,
 * matching the jQuery Validation convention of visually indicating
 * required fields.
 *
 * @example
 * ```tsx
 * <label>
 *   Username <ImsRequiredIndicator />
 * </label>
 * ```
 */
export function ImsRequiredIndicator({
  className,
  indicator = '*',
}: ImsRequiredIndicatorProps) {
  return (
    <span
      className={`text-red-400 ml-0.5${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {indicator}
    </span>
  );
}

// ============================================================================
// ImsValidationError Component
// ============================================================================

/**
 * Standalone error message component.
 *
 * Replaces the auto-created error `<label>` elements from jQuery Validation.
 * In jQuery Validation 1.11.1, errors are displayed as `<label>` elements
 * with the `errorClass` CSS class, inserted after the field via the
 * `errorPlacement` callback.
 *
 * This component provides the same functionality with React's declarative
 * approach, including fade-in/fade-out animations using CSS transitions.
 *
 * @example
 * ```tsx
 * <ImsValidationError message="This field is required" fieldName="username" />
 * ```
 */
export function ImsValidationError({
  message,
  fieldName,
  className,
  animate = true,
  id,
}: ImsValidationErrorProps) {
  // Inject animation styles on first render
  useEffect(() => {
    if (animate) {
      injectAnimationStyles();
    }
  }, [animate]);

  // Track visibility for animation — derived from message without effect-based setState
  const shouldRender = !!message;
  const isVisible = shouldRender;

  if (!shouldRender || !message) {
    return null;
  }

  const animationClass = animate
    ? isVisible
      ? 'ims-error-enter'
      : 'ims-error-exit'
    : '';

  return (
    <span
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-red-400 text-sm mt-1 block${className ? ` ${className}` : ''} ${animationClass}`}
      data-field={fieldName}
    >
      {message}
    </span>
  );
}

// ============================================================================
// ImsValidationSummary Component
// ============================================================================

/**
 * Summary of all form errors.
 *
 * Replaces the `errorContainer` / `errorLabelContainer` options from
 * jQuery Validation 1.11.1, which display a consolidated list of all
 * form errors in a designated container.
 *
 * In jQuery Validation:
 * ```js
 * $("#myform").validate({
 *   errorContainer: "#messageBox1, #messageBox2",
 *   errorLabelContainer: "#errorList",
 *   wrapper: "li"
 * });
 * ```
 *
 * @example
 * ```tsx
 * <ImsValidationProvider rules={...}>
 *   <ImsValidationSummary />
 *   <form>
 *     <ImsFormField name="username">...</ImsFormField>
 *   </form>
 * </ImsValidationProvider>
 * ```
 */
export function ImsValidationSummary({
  className,
  title = 'Please fix the following errors:',
  renderItem,
  showAfterSubmit = true,
  animate = true,
}: ImsValidationSummaryProps) {
  const { errorList, formState } = useImsValidation();

  // Inject animation styles
  useEffect(() => {
    if (animate) {
      injectAnimationStyles();
    }
  }, [animate]);

  // Don't show if no errors or if showAfterSubmit and form hasn't been submitted
  if (errorList.length === 0) {
    return null;
  }

  if (showAfterSubmit && formState.submitCount === 0) {
    return null;
  }

  const animationClass = animate ? 'ims-summary-enter' : '';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`border border-red-400/30 rounded-md p-4 mb-4 bg-red-400/5${className ? ` ${className}` : ''} ${animationClass}`}
    >
      <p className="text-sm font-medium text-red-400 mb-2">{title}</p>
      <ul className="list-disc list-inside space-y-1">
        {errorList.map((error, index) =>
          renderItem ? (
            renderItem(error, index)
          ) : (
            <li key={`${error.fieldName}-${error.method}-${index}`} className="text-sm text-red-400">
              <span className="font-medium">{error.fieldName}</span>: {error.message}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

// ============================================================================
// ImsFormField Component
// ============================================================================

/**
 * Form field wrapper component that handles validation display.
 *
 * Replaces the jQuery Validation pattern of auto-creating error labels and
 * highlighting/unhighlighting fields. In jQuery Validation 1.11.1:
 *
 * - `highlight(element, errorClass, validClass)` adds/removes CSS classes
 * - `unhighlight(element, errorClass, validClass)` restores normal styling
 * - `errorPlacement(error, element)` positions the error label
 * - `success(label, element)` handles valid state display
 *
 * This component provides all of these behaviors declaratively through
 * React component composition.
 *
 * @example
 * ```tsx
 * <ImsValidationProvider
 *   rules={{ email: { required: true, email: true } }}
 * >
 *   <form>
 *     <ImsFormField name="email" label="Email Address" required>
 *       <input
 *         name="email"
 *         type="email"
 *         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
 *       />
 *     </ImsFormField>
 *   </form>
 * </ImsValidationProvider>
 * ```
 */
export function ImsFormField({
  name,
  label,
  children,
  rules,
  messages,
  errorPlacement = 'after',
  showErrorOnTouched = true,
  className,
  required: requiredProp,
  helpText,
  hideError = false,
}: ImsFormFieldProps) {
  // Access validation context
  const {
    registerField,
    unregisterField,
    touchField,
    formState,
    errorList,
    errorMap,
    errorClass,
    validClass,
    setFieldRuleOverride,
    clearFieldRuleOverride,
    setFieldMessageOverride,
    clearFieldMessageOverride,
  } = useImsValidation();

  // Field element ref
  const elementRef = useRef<HTMLElement | null>(null);

  // Track whether we've registered with the provider
  const registeredRef = useRef(false);

  // Generate unique ID for the field
  const generatedId = useId();
  const fieldId = `ims-field-${name}-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const helpTextId = `${fieldId}-help`;

  // ------------------------------------------------------------------------
  // Register field overrides and with provider on mount
  // ------------------------------------------------------------------------

  useEffect(() => {
    // Register per-field rule/message overrides via context methods
    if (rules && Object.keys(rules).length > 0) {
      setFieldRuleOverride(name, rules);
    }
    if (messages && Object.keys(messages).length > 0) {
      setFieldMessageOverride(name, messages);
    }

    return () => {
      clearFieldRuleOverride(name);
      clearFieldMessageOverride(name);
    };
  }, [name, rules, messages, setFieldRuleOverride, clearFieldRuleOverride, setFieldMessageOverride, clearFieldMessageOverride]);

  useEffect(() => {
    registerField(name);
    registeredRef.current = true;

    return () => {
      unregisterField(name);
      registeredRef.current = false;
    };
  }, [name, registerField, unregisterField]);

  // ------------------------------------------------------------------------
  // Find the input element from children — use a stable ref callback
  // that doesn't get recreated on every render
  const childRef = useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      // Re-register with the element ref if available
      if (node && registeredRef.current) {
        registerField(name, node);
      }
    },
    [name, registerField],
  );

  // ------------------------------------------------------------------------
  // Validation state for this field
  // ------------------------------------------------------------------------

  const fieldState = formState.fieldStates[name];
  const fieldErrors = useMemo(
    () => errorList.filter((e) => e.fieldName === name),
    [errorList, name],
  );
  const isTouched = fieldState?.isTouched ?? false;
  const isDirty = fieldState?.isDirty ?? false;
  const isFieldValid = fieldState?.isValid ?? true;

  // Determine if we should show the error
  const shouldShowError =
    !hideError &&
    fieldErrors.length > 0 &&
    (showErrorOnTouched ? isTouched : true);

  const firstError = shouldShowError ? fieldErrors[0]?.message : undefined;

  // Determine if the field has a required rule
  // Check the explicit `required` prop and field-level rules
  const hasRequiredRule = useMemo(() => {
    if (requiredProp !== undefined) return requiredProp;
    if (rules?.required !== undefined) {
      return (
        rules.required === true ||
        (typeof rules.required === 'object' &&
          rules.required !== null &&
          !Array.isArray(rules.required))
      );
    }
    return false;
  }, [requiredProp, rules]);

  // Determine wrapper CSS classes based on validation state
  const wrapperClasses = useMemo(() => {
    const classes: string[] = ['space-y-1'];

    if (className) {
      classes.push(className);
    }

    // Apply error/valid classes only when the field has been touched or
    // the form has been submitted (to avoid showing states prematurely)
    if (isTouched) {
      if (!isFieldValid && fieldErrors.length > 0) {
        classes.push(errorClass);
        classes.push('border-red-400');
      } else if (isFieldValid && isDirty) {
        classes.push(validClass);
        classes.push('border-green-500');
      }
    }

    return classes.join(' ');
  }, [className, isFieldValid, isTouched, isDirty, fieldErrors, errorClass, validClass]);

  // ------------------------------------------------------------------------
  // Clone children to inject aria attributes and event handlers (ref handled via wrapper)
  // ------------------------------------------------------------------------

  const enhancedChildren = useMemo(() => {
    const childArray = React.Children.toArray(children);
    if (childArray.length === 0) return children;

    return childArray.map((child, index) => {
      if (!React.isValidElement(child)) return child;

      // Only attach handlers to the first child element
      if (index === 0) {
        const existingProps = (child.props ?? {}) as Record<string, unknown>;
        const existingClassName =
          typeof existingProps.className === 'string'
            ? existingProps.className
            : '';

        // Add error border class to the input when there's an error
        let inputClassName = existingClassName;
        if (shouldShowError) {
          inputClassName = `${inputClassName} border-red-400 focus:ring-red-400`.trim();
        } else if (isFieldValid && isDirty && isTouched) {
          inputClassName = `${inputClassName} border-green-500`.trim();
        }

        // Build aria-describedby
        const describedByParts: string[] = [];
        if (shouldShowError && firstError) {
          describedByParts.push(errorId);
        }
        if (helpText) {
          describedByParts.push(helpTextId);
        }
        const ariaDescribedby =
          describedByParts.length > 0
            ? describedByParts.join(' ')
            : (existingProps['aria-describedby'] as string | undefined);

        // Merge event handlers
        const existingOnBlur = existingProps.onBlur as
          | ((e: React.FocusEvent) => void)
          | undefined;
        const existingOnChange = existingProps.onChange as
          | ((e: React.ChangeEvent) => void)
          | undefined;

        const mergedProps: Record<string, unknown> = {
          id: (existingProps.id as string) || fieldId,
          'aria-invalid': shouldShowError ? true : undefined,
          'aria-describedby': ariaDescribedby || undefined,
          'aria-required': hasRequiredRule ? true : undefined,
          className: inputClassName || undefined,
          onBlur: (e: React.FocusEvent) => {
            touchField(name);
            existingOnBlur?.(e);
          },
          onChange: (e: React.ChangeEvent) => {
            existingOnChange?.(e);
          },
        };

        return React.cloneElement(
          child,
          mergedProps,
        );
      }

      return child;
    });
  }, [
    children,
    fieldId,
    shouldShowError,
    firstError,
    errorId,
    helpText,
    helpTextId,
    hasRequiredRule,
    isFieldValid,
    isDirty,
    isTouched,
    touchField,
    name,
  ]);

  // ------------------------------------------------------------------------
  // Error placement rendering
  // ------------------------------------------------------------------------

  const errorElement = shouldShowError && firstError ? (
    <ImsValidationError
      message={firstError}
      fieldName={name}
      id={errorId}
      animate={true}
    />
  ) : null;

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <div className={wrapperClasses} data-field-name={name} ref={childRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground flex items-center gap-0.5"
        >
          {label}
          {hasRequiredRule && <ImsRequiredIndicator />}
        </label>
      )}

      {/* Error before field (for 'before' placement) */}
      {errorPlacement === 'before' && errorElement}

      {/* Field children */}
      {enhancedChildren}

      {/* Error after field (default 'after' placement, or 'append') */}
      {(errorPlacement === 'after' || errorPlacement === 'append') && errorElement}

      {/* Help text */}
      {helpText && (
        <p id={helpTextId} className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}

      {/* Prepend error (after help text for 'prepend' placement) */}
      {errorPlacement === 'prepend' && errorElement}
    </div>
  );
}

// ============================================================================
// Aliased Exports
// ============================================================================

export {
  ImsRequiredIndicator as RequiredIndicator,
  ImsValidationError as ValidationError,
  ImsValidationSummary as ValidationSummary,
  ImsFormField as FormField,
};
