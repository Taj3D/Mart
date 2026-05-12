/**
 * IMS AJAX Form and Link Components
 * React equivalents for Microsoft jQuery Unobtrusive Ajax data attributes
 *
 * Components:
 * - ImsAjaxForm: Replaces <form data-ajax="true">
 * - ImsAjaxLink: Replaces <a data-ajax="true">
 * - ImsAjaxLoading: Loading indicator component
 * - ImsAjaxConfirmDialog: Confirmation dialog component (shadcn AlertDialog based)
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  useUnobtrusiveAjax,
  useAjaxForm,
  type ImsAjaxFormProps,
  type ImsAjaxLinkProps,
  type ImsAjaxInsertMode,
  type ImsAjaxContext,
  type ImsAjaxState,
  insertContent,
  resolveUpdateTarget,
  defaultConfirmHandler,
  serializeFormData,
} from "@/lib/ims-jquery/ims-unobtrusive-ajax";
import { Loader2 } from "lucide-react";

// ============================================================================
// ImsAjaxForm Component
// ============================================================================

/**
 * AJAX Form component - replaces <form data-ajax="true">
 *
 * Converts the Microsoft jQuery Unobtrusive Ajax form behavior to a React component.
 * Supports all data-ajax-* attributes as props.
 *
 * Features:
 * - AJAX form submission instead of full page reload
 * - Confirmation dialog before submission
 * - Loading indicator during request
 * - Content insertion into target elements
 * - Full callback lifecycle
 * - Form validation before submission
 * - Submit button value capture
 * - Image input coordinate handling
 * - X-HTTP-Method-Override for RESTful methods
 * - X-Requested-With header for server-side detection
 *
 * Original HTML:
 * ```html
 * <form data-ajax="true"
 *       data-ajax-url="/api/save"
 *       data-ajax-method="POST"
 *       data-ajax-confirm="Are you sure?"
 *       data-ajax-mode="replace"
 *       data-ajax-update="#result"
 *       data-ajax-loading="#loading"
 *       data-ajax-begin="onBegin"
 *       data-ajax-success="onSuccess"
 *       data-ajax-failure="onFailure"
 *       data-ajax-complete="onComplete">
 * ```
 *
 * React equivalent:
 * ```tsx
 * <ImsAjaxForm
 *   action="/api/save"
 *   method="POST"
 *   confirm="Are you sure?"
 *   insertMode="replace"
 *   updateTarget={resultRef}
 *   onBegin={(xhr) => console.log('starting')}
 *   onSuccess={(data) => console.log(data)}
 *   onFailure={(xhr, status, error) => console.error(error)}
 *   onComplete={(xhr, status) => console.log('done')}
 * >
 *   ...form fields...
 * </ImsAjaxForm>
 * ```
 */
export function ImsAjaxForm({
  action,
  method = "POST",
  confirm,
  confirmHandler,
  insertMode = "replace",
  updateTarget,
  onUpdate,
  loadingDuration,
  onBegin,
  onComplete,
  onSuccess,
  onFailure,
  cache,
  data: extraData,
  loadingComponent,
  validate,
  onSubmit,
  children,
  className,
  ...formProps
}: ImsAjaxFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const submitButtonRef = React.useRef<HTMLButtonElement | HTMLInputElement | null>(null);

  const {
    state,
    loading,
    send: submitForm,
    setSubmitButton,
  } = useAjaxForm({
    url: action,
    method,
    confirm,
    confirmHandler,
    insertMode,
    updateTarget,
    onUpdate,
    loadingDuration,
    onBegin,
    onComplete,
    onSuccess,
    onFailure,
    cache,
    validate,
  });

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Allow parent to intercept
      if (onSubmit) {
        const result = onSubmit(e);
        if (result === false) return;
      }

      const form = e.currentTarget;

      // Capture submit button
      setSubmitButton(submitButtonRef.current);

      // Serialize form and send
      const formData = serializeFormData(form, submitButtonRef.current);

      const requestData: Record<string, unknown> = {};
      for (const entry of formData) {
        requestData[entry.name] = entry.value;
      }

      // Merge extra data
      if (extraData) {
        Object.assign(requestData, extraData);
      }

      await submitForm(form, {
        url: action || form.action,
        method: method || (form.method as "GET" | "POST") || "POST",
        data: requestData,
      });

      // Clear submit button ref
      submitButtonRef.current = null;
    },
    [action, method, extraData, onSubmit, submitForm, setSubmitButton]
  );

  // Track which button was clicked for form submission
  const handleClickCapture = React.useCallback(
    (e: React.MouseEvent<HTMLFormElement>) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLButtonElement ||
        (target instanceof HTMLInputElement && target.type === "submit")
      ) {
        submitButtonRef.current = target;
      }
    },
    []
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onClickCapture={handleClickCapture}
      className={cn(
        "ims-ajax-form",
        loading && "ims-ajax-form--loading",
        className
      )}
      data-ajax="true"
      data-ajax-url={action}
      data-ajax-method={method}
      {...formProps}
    >
      {children}

      {/* Loading overlay */}
      {loading && loadingComponent && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-navy-950/50">
          {loadingComponent}
        </div>
      )}
    </form>
  );
}

// ============================================================================
// ImsAjaxLink Component
// ============================================================================

/**
 * AJAX Link component - replaces <a data-ajax="true">
 *
 * Converts the Microsoft jQuery Unobtrusive Ajax link behavior to a React component.
 * When clicked, performs an AJAX request instead of navigating to the URL.
 *
 * Original HTML:
 * ```html
 * <a href="/api/delete/1"
 *    data-ajax="true"
 *    data-ajax-method="POST"
 *    data-ajax-confirm="Delete this item?">
 *   Delete
 * </a>
 * ```
 *
 * React equivalent:
 * ```tsx
 * <ImsAjaxLink
 *   href="/api/delete/1"
 *   method="POST"
 *   confirm="Delete this item?"
 *   onSuccess={() => router.refresh()}
 * >
 *   Delete
 * </ImsAjaxLink>
 * ```
 */
export function ImsAjaxLink({
  href,
  method = "GET",
  confirm,
  confirmHandler,
  insertMode,
  updateTarget,
  onUpdate,
  loadingDuration,
  onBegin,
  onComplete,
  onSuccess,
  onFailure,
  cache,
  data,
  loadingComponent,
  children,
  className,
  ...linkProps
}: ImsAjaxLinkProps) {
  const { send, loading } = useUnobtrusiveAjax({
    url: href,
    method,
    confirm,
    confirmHandler,
    insertMode,
    updateTarget,
    onUpdate,
    loadingDuration,
    onBegin,
    onComplete,
    onSuccess,
    onFailure,
    cache,
  });

  const handleClick = React.useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      await send({ data });
    },
    [send, data]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "ims-ajax-link",
        loading && "ims-ajax-link--loading pointer-events-none opacity-70",
        className
      )}
      data-ajax="true"
      data-ajax-url={href}
      data-ajax-method={method}
      {...linkProps}
    >
      {loading && loadingComponent ? (
        <span className="inline-flex items-center gap-1.5">
          {loadingComponent}
          {children}
        </span>
      ) : loading ? (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="size-4 animate-spin text-navy-500" />
          {children}
        </span>
      ) : (
        children
      )}
    </a>
  );
}

// ============================================================================
// ImsAjaxLoading Component
// ============================================================================

export interface ImsAjaxLoadingProps extends React.ComponentProps<"div"> {
  /** Whether the loading indicator is visible */
  visible: boolean;
  /** Animation duration in ms (replaces data-ajax-loading-duration) */
  duration?: number;
  /** Loading text */
  text?: string;
  /** Size of the spinner */
  size?: "sm" | "default" | "lg";
}

/**
 * Loading indicator component for AJAX requests.
 * Replaces the data-ajax-loading element that was shown/hidden during requests.
 *
 * Original: $(data-ajax-loading).show(duration) / .hide(duration)
 *
 * Usage:
 * ```tsx
 * const [loading, setLoading] = useState(false);
 * <ImsAjaxLoading visible={loading} text="Saving..." />
 * ```
 */
export function ImsAjaxLoading({
  visible,
  duration = 0,
  text,
  size = "default",
  className,
  ...props
}: ImsAjaxLoadingProps) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
  };

  const textSizes = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "ims-ajax-loading",
        "inline-flex items-center gap-2",
        "text-navy-600 dark:text-navy-400",
        className
      )}
      style={{
        transitionDuration: duration > 0 ? `${duration}ms` : undefined,
        animationDuration: duration > 0 ? `${duration}ms` : undefined,
      }}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className={textSizes[size]}>{text}</span>}
    </div>
  );
}

// ============================================================================
// ImsAjaxContent Component (for data-ajax-update targets)
// ============================================================================

export interface ImsAjaxContentProps extends React.ComponentProps<"div"> {
  /** The AJAX state to render content from */
  state?: ImsAjaxState;
  /** Content insertion mode */
  mode?: ImsAjaxInsertMode;
  /** Whether to render raw HTML (true) or React children (false) */
  rawHtml?: boolean;
  /** Loading component to show during requests */
  loadingComponent?: React.ReactNode;
  /** Error component factory */
  errorComponent?: (error: Error) => React.ReactNode;
  /** Default content when no response data */
  children?: React.ReactNode;
}

/**
 * Content container that receives AJAX response data.
 * Replaces the data-ajax-update target element.
 *
 * This component manages content insertion modes (before, after, replace-with, replace)
 * and can render either raw HTML or React children.
 *
 * Usage:
 * ```tsx
 * const { state } = useUnobtrusiveAjax({ ... });
 * <ImsAjaxContent state={state} mode="replace" rawHtml>
 *   Default content here
 * </ImsAjaxContent>
 * ```
 */
export const ImsAjaxContent = React.forwardRef<HTMLDivElement, ImsAjaxContentProps>(
  function ImsAjaxContent(
    {
      state,
      mode = "replace",
      rawHtml = true,
      loadingComponent,
      errorComponent,
      children,
      className,
      ...props
    },
    ref
  ) {
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Handle content insertion when response data changes
    React.useEffect(() => {
      if (!state?.data || !rawHtml || !contentRef.current) return;

      const content = typeof state.data === "string" ? state.data : String(state.data);
      const target = contentRef.current;

      // Use the insertContent utility for raw HTML insertion
      if (mode === "replace") {
        target.innerHTML = content;
      } else {
        insertContent(target, content, mode);
      }
    }, [state?.data, mode, rawHtml]);

    return (
      <div
        ref={(node) => {
          // Handle both refs
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("ims-ajax-content", className)}
        {...props}
      >
        {/* Loading state */}
        {state?.loading && loadingComponent}

        {/* Error state */}
        {state?.error && errorComponent && errorComponent(state.error)}

        {/* Raw HTML mode - content is injected via useEffect */}
        {rawHtml ? (
          // If we have response data, the effect will handle insertion
          // Show children as default content only when no response data
          !state?.data && children
        ) : (
          /* React children mode - render data as children or fallback */
          (state?.data !== null && state?.data !== undefined ? (
            <>{String(state.data)}</>
          ) : (
            children
          ))
        )}
      </div>
    );
  }
);

// ============================================================================
// ImsAjaxConfirmDialog (shadcn AlertDialog based)
// ============================================================================

export interface ImsAjaxConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Title text */
  title?: string;
  /** Message text (replaces data-ajax-confirm value) */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Variant for confirm button */
  variant?: "default" | "destructive" | "navy";
}

/**
 * Confirmation dialog component for AJAX requests.
 * Replaces window.confirm() for data-ajax-confirm attribute.
 * Uses a modal-style overlay with Deep Navy Blue theme.
 *
 * Usage with useUnobtrusiveAjax:
 * ```tsx
 * const [confirmState, setConfirmState] = useState({ open: false, message: '' });
 *
 * const { send } = useUnobtrusiveAjax({
 *   confirmHandler: (message) => {
 *     return new Promise((resolve) => {
 *       setConfirmState({ open: true, message, resolve });
 *     });
 *   },
 * });
 * ```
 */
export function ImsAjaxConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "navy",
}: ImsAjaxConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg border p-6 shadow-xl",
          "bg-white dark:bg-navy-900",
          "border-navy-200 dark:border-navy-700",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ims-ajax-confirm-title"
        aria-describedby="ims-ajax-confirm-message"
      >
        {/* Title */}
        <h3
          id="ims-ajax-confirm-title"
          className="text-lg font-semibold text-navy-800 dark:text-navy-100"
        >
          {title}
        </h3>

        {/* Message */}
        <p
          id="ims-ajax-confirm-message"
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
              "border border-input bg-background shadow-xs",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors"
            )}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-white shadow-xs",
              "transition-colors",
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-navy-600 hover:bg-navy-700 dark:bg-navy-700 dark:hover:bg-navy-600"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// useConfirmDialog Hook (async confirm for useUnobtrusiveAjax)
// ============================================================================

/**
 * Hook that provides an async confirmation handler for useUnobtrusiveAjax.
 * Returns a confirmHandler function and dialog state/props.
 *
 * Usage:
 * ```tsx
 * const { confirmHandler, dialogProps } = useConfirmDialog();
 *
 * const { send } = useUnobtrusiveAjax({
 *   confirm: "Are you sure?",
 *   confirmHandler,
 * });
 *
 * return (
 *   <>
 *     <button onClick={() => send()}>Delete</button>
 *     <ImsAjaxConfirmDialog {...dialogProps} />
 *   </>
 * );
 * ```
 */
export function useConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirmHandler = React.useCallback((msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setMessage(msg);
      setOpen(true);
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    setOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = React.useCallback(() => {
    setOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const dialogProps: React.ComponentProps<typeof ImsAjaxConfirmDialog> = {
    open,
    message,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return {
    confirmHandler,
    dialogProps,
    open,
    message,
  };
}

// ============================================================================
// Exports
// ============================================================================

export {
  useUnobtrusiveAjax,
  useAjaxForm,
} from "@/lib/ims-jquery/ims-unobtrusive-ajax";

export type {
  ImsAjaxInsertMode,
  ImsAjaxHttpMethod,
  ImsAjaxState,
  ImsAjaxContext,
  UseUnobtrusiveAjaxOptions,
  UseUnobtrusiveAjaxReturn,
  UseAjaxFormOptions,
} from "@/lib/ims-jquery/ims-unobtrusive-ajax";
