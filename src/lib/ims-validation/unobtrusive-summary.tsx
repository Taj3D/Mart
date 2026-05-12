'use client';

/**
 * IMS Validation - Unobtrusive Validation Summary Component
 *
 * React components that replace the jQuery Unobtrusive Validation error
 * display system, styled with the Deep Navy Blue theme.
 *
 * Key mappings from the original library:
 *   - `[data-valmsg-summary=true]` → ImsUnobtrusiveSummary
 *   - `[data-valmsg-for='fieldName']` → ImsUnobtrusiveFieldMessage
 *   - `.field-validation-valid` / `.field-validation-error` → CSS class toggling
 *   - `.validation-summary-valid` / `.validation-summary-errors` → CSS class toggling
 *   - `onErrors(event, validator)` → Summary population
 *   - `onError(error, inputElement)` → Field error display
 *   - `onSuccess(error)` → Field error removal
 *   - `onReset(event)` → Summary/field error reset
 *
 * Deep Navy Blue Theme:
 *   - Error text: #f87171 (red-400) on dark backgrounds, text-red-600 on light
 *   - Error borders: red-400/30 with subtle background
 *   - Summary container: bg-[#0a1628] border border-red-400/20
 *   - Valid state: emerald/teal accent (#10b981)
 *
 * @module ims-validation/unobtrusive-summary
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { ErrorListEntry } from './types';

// ============================================================================
// Animation CSS (injected once)
// ============================================================================

/** Whether the animation styles have been injected */
let summaryStylesInjected = false;

/** Unique style element ID for unobtrusive summary */
const UNOBTRUSIVE_STYLE_ID = 'ims-unobtrusive-validation-styles';

/**
 * Inject CSS animation styles for unobtrusive validation components.
 */
function injectUnobtrusiveStyles(): void {
  if (summaryStylesInjected) return;
  if (typeof document === 'undefined') return;

  if (document.getElementById(UNOBTRUSIVE_STYLE_ID)) {
    summaryStylesInjected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = UNOBTRUSIVE_STYLE_ID;
  style.textContent = `
    @keyframes ims-unobtrusive-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ims-unobtrusive-slide-in {
      from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
      to { opacity: 1; max-height: 400px; }
    }
    @keyframes ims-unobtrusive-error-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .ims-unobtrusive-error-enter {
      animation: ims-unobtrusive-fade-in 0.2s ease-out forwards;
    }
    .ims-unobtrusive-summary-enter {
      animation: ims-unobtrusive-slide-in 0.3s ease-out forwards;
    }
    .ims-unobtrusive-field-error {
      animation: ims-unobtrusive-fade-in 0.15s ease-out forwards;
    }
    .ims-unobtrusive-field-valid {
      transition: opacity 0.15s ease-out;
    }
  `;
  document.head.appendChild(style);
  summaryStylesInjected = true;
}

// ============================================================================
// ImsUnobtrusiveSummary Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveSummary component.
 *
 * Replaces the `[data-valmsg-summary=true]` container from the original
 * unobtrusive validation library. In the original source, this container
 * holds a `<ul>` that lists all current validation errors.
 */
export interface ImsUnobtrusiveSummaryProps {
  /** Additional CSS class */
  className?: string;
  /** Title text (default: "Please fix the following errors:") */
  title?: string;
  /** Error list to display */
  errors: ErrorListEntry[];
  /** Whether the form has been submitted (controls visibility) */
  submitted?: boolean;
  /** Whether to animate the summary (default: true) */
  animate?: boolean;
  /** Custom render function for each error */
  renderItem?: (error: ErrorListEntry, index: number) => React.ReactNode;
  /** Called when an error item is clicked (for focusing the field) */
  onErrorClick?: (fieldName: string) => void;
}

/**
 * Validation summary component with Deep Navy Blue theme.
 *
 * Replaces the `[data-valmsg-summary=true]` container from the original
 * unobtrusive validation library. Displays a consolidated list of all
 * form errors.
 *
 * In the original source, the `onErrors` callback populates the summary:
 * ```js
 * function onErrors(event, validator) {
 *     var container = $(this).find("[data-valmsg-summary=true]"),
 *         list = container.find("ul");
 *     if (list && list.length && validator.errorList.length) {
 *         list.empty();
 *         container.addClass("validation-summary-errors")
 *                  .removeClass("validation-summary-valid");
 *         $.each(validator.errorList, function() {
 *             $("<li />").html(this.message).appendTo(list);
 *         });
 *     }
 * }
 * ```
 *
 * And `onReset` clears it:
 * ```js
 * $form.find(".validation-summary-errors")
 *     .addClass("validation-summary-valid")
 *     .removeClass("validation-summary-errors");
 * ```
 *
 * @example
 * ```tsx
 * <ImsUnobtrusiveSummary
 *   errors={errorList}
 *   submitted={formState.submitCount > 0}
 *   onErrorClick={(fieldName) => document.querySelector(`[name="${fieldName}"]`)?.focus()}
 * />
 * ```
 */
export function ImsUnobtrusiveSummary({
  className,
  title = 'Please fix the following errors:',
  errors,
  submitted = false,
  animate = true,
  renderItem,
  onErrorClick,
}: ImsUnobtrusiveSummaryProps) {
  // Inject animation styles
  useEffect(() => {
    if (animate) {
      injectUnobtrusiveStyles();
    }
  }, [animate]);

  // Don't show if no errors or if form hasn't been submitted
  if (errors.length === 0 || !submitted) {
    return null;
  }

  const animationClass = animate ? 'ims-unobtrusive-summary-enter' : '';

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-lg p-4 mb-4 border border-red-400/20 bg-[#0a1628]/80 backdrop-blur-sm${
        className ? ` ${className}` : ''
      } ${animationClass}`}
      data-valmsg-summary="true"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-red-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-sm font-semibold text-red-400">{title}</p>
      </div>

      {/* Error list */}
      <ul className="space-y-1.5">
        {errors.map((error, index) =>
          renderItem ? (
            renderItem(error, index)
          ) : (
            <li
              key={`${error.fieldName}-${error.method}-${index}`}
              className="text-sm flex items-start gap-2 group"
            >
              <span className="text-red-400/60 mt-0.5 shrink-0">•</span>
              <button
                type="button"
                onClick={() => onErrorClick?.(error.fieldName)}
                className="text-left hover:text-red-300 transition-colors text-red-400/90"
                tabIndex={onErrorClick ? 0 : -1}
              >
                <span className="font-medium text-red-300">{error.fieldName}</span>
                {': '}
                {error.message}
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

// ============================================================================
// ImsUnobtrusiveFieldMessage Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveFieldMessage component.
 *
 * Replaces the `[data-valmsg-for='fieldName']` container from the original
 * unobtrusive validation library.
 */
export interface ImsUnobtrusiveFieldMessageProps {
  /** The field name this message targets (from `data-valmsg-for`) */
  fieldName: string;
  /** The error message to display, or undefined if valid */
  message?: string;
  /** Whether to replace container content (from `data-valmsg-replace`). Default: true */
  replace?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Whether to animate the error display (default: true) */
  animate?: boolean;
}

/**
 * Per-field validation message component with Deep Navy Blue theme.
 *
 * Replaces the `[data-valmsg-for='fieldName']` container from the original
 * unobtrusive validation library. Shows/hides error messages for individual
 * fields by toggling CSS classes.
 *
 * In the original source:
 * ```js
 * function onError(error, inputElement) {
 *     var container = $(this).find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']"),
 *         replaceAttrValue = container.attr("data-valmsg-replace"),
 *         replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) !== false : null;
 *     container.removeClass("field-validation-valid").addClass("field-validation-error");
 *     error.data("unobtrusiveContainer", container);
 *     if (replace) { container.empty(); error.removeClass("input-validation-error").appendTo(container); }
 *     else { error.hide(); }
 * }
 *
 * function onSuccess(error) {
 *     var container = error.data("unobtrusiveContainer");
 *     container.addClass("field-validation-valid").removeClass("field-validation-error");
 *     if (replace) { container.empty(); }
 * }
 * ```
 *
 * @example
 * ```tsx
 * <ImsUnobtrusiveFieldMessage
 *   fieldName="email"
 *   message={errors.email}
 *   replace={true}
 * />
 * ```
 */
export function ImsUnobtrusiveFieldMessage({
  fieldName,
  message,
  replace = true,
  className,
  animate = true,
}: ImsUnobtrusiveFieldMessageProps) {
  // Inject animation styles
  useEffect(() => {
    if (animate) {
      injectUnobtrusiveStyles();
    }
  }, [animate]);

  // Valid state — show empty container with valid class
  if (!message) {
    return (
      <span
        data-valmsg-for={fieldName}
        data-valmsg-replace={replace ? 'true' : 'false'}
        className={`text-sm ims-unobtrusive-field-valid field-validation-valid${
          className ? ` ${className}` : ''
        }`}
        aria-hidden="true"
      />
    );
  }

  // Error state with replace mode
  if (replace) {
    const animClass = animate ? 'ims-unobtrusive-field-error' : '';
    return (
      <span
        data-valmsg-for={fieldName}
        data-valmsg-replace="true"
        role="alert"
        aria-live="polite"
        className={`text-red-400 text-sm mt-1 block field-validation-error bg-[#0a1628]/40 px-2 py-1 rounded border border-red-400/10 ${
          className ? ` ${className}` : ''
        } ${animClass}`}
      >
        {message}
      </span>
    );
  }

  // Error state without replace (toggle visibility)
  return (
    <span
      data-valmsg-for={fieldName}
      data-valmsg-replace="false"
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
// ImsUnobtrusiveFieldGroup Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveFieldGroup component.
 *
 * Combines a form field with its label, error message, and required indicator
 * into a single cohesive component, mirroring the ASP.NET MVC HTML helper
 * output pattern.
 */
export interface ImsUnobtrusiveFieldGroupProps {
  /** Field name */
  name: string;
  /** Label text */
  label?: string;
  /** Input element(s) */
  children: React.ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Current error message (from validation) */
  error?: string;
  /** Whether to use replace mode for error display (default: true) */
  replaceError?: boolean;
  /** Help text */
  helpText?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Additional CSS class for the input wrapper */
  inputClassName?: string;
}

/**
 * Form field group component with unobtrusive validation styling.
 *
 * Combines label, input, error message, and help text into a single
 * cohesive group, styled with the Deep Navy Blue theme.
 *
 * Mirrors the HTML output pattern from ASP.NET MVC's HTML helpers:
 * ```html
 * <div class="form-group">
 *     <label for="Email">Email</label>
 *     <input data-val="true" data-val-email="..." data-val-required="..." />
 *     <span data-valmsg-for="Email" data-valmsg-replace="true"></span>
 * </div>
 * ```
 *
 * @example
 * ```tsx
 * <ImsUnobtrusiveFieldGroup
 *   name="email"
 *   label="Email Address"
 *   required
 *   error={errors.email}
 * >
 *   <input name="email" type="email" />
 * </ImsUnobtrusiveFieldGroup>
 * ```
 */
export function ImsUnobtrusiveFieldGroup({
  name,
  label,
  children,
  required = false,
  error,
  replaceError = true,
  helpText,
  className,
  inputClassName,
}: ImsUnobtrusiveFieldGroupProps) {
  const hasError = !!error;

  return (
    <div
      className={`space-y-1.5${className ? ` ${className}` : ''}`}
      data-field-group={name}
    >
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-foreground flex items-center gap-0.5"
        >
          {label}
          {required && (
            <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className={inputClassName}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          // Inject error styling and aria attributes into the input
          const existingProps = (child.props ?? {}) as Record<string, unknown>;
          const existingClassName =
            typeof existingProps.className === 'string'
              ? existingProps.className
              : '';

          let inputClassName = existingClassName;
          if (hasError) {
            inputClassName = `${inputClassName} border-red-400 focus:ring-red-400/50 focus:border-red-400`.trim();
          }

          return React.cloneElement(child, {
            id: (existingProps.id as string) || name,
            name,
            className: inputClassName || undefined,
            'aria-invalid': hasError || undefined,
            'aria-required': required || undefined,
          } as Record<string, unknown>);
        })}
      </div>

      {/* Error message */}
      <ImsUnobtrusiveFieldMessage
        fieldName={name}
        message={error}
        replace={replaceError}
      />

      {/* Help text */}
      {helpText && !hasError && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}

// ============================================================================
// Reset Button Component
// ============================================================================

/**
 * Props for the ImsUnobtrusiveResetButton component.
 */
export interface ImsUnobtrusiveResetButtonProps {
  /** Button text (default: "Reset") */
  children?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Click handler (in addition to form reset) */
  onClick?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Form reset button that clears validation state.
 *
 * Maps the `onReset` handler from the original unobtrusive validation
 * library, which resets all validation state when the form is reset:
 * ```js
 * function onReset(event) {
 *     var $form = $(this);
 *     $form.data("validator").resetForm();
 *     $form.find(".validation-summary-errors")
 *         .addClass("validation-summary-valid")
 *         .removeClass("validation-summary-errors");
 *     $form.find(".field-validation-error")
 *         .addClass("field-validation-valid")
 *         .removeClass("field-validation-error");
 * }
 * ```
 *
 * @example
 * ```tsx
 * <ImsUnobtrusiveResetButton />
 * ```
 */
export function ImsUnobtrusiveResetButton({
  children = 'Reset',
  className,
  onClick,
  disabled = false,
}: ImsUnobtrusiveResetButtonProps) {
  return (
    <button
      type="reset"
      className={`px-4 py-2 text-sm font-medium rounded-md border border-[#243b5c] text-[#94a3b8] hover:bg-[#1a2744] hover:text-white transition-colors${
        className ? ` ${className}` : ''
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
