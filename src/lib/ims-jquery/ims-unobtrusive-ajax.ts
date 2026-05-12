/**
 * IMS jQuery Unobtrusive Ajax Module
 * Replaces: Microsoft jQuery Unobtrusive Ajax support library
 * Source: jquery.unobtrusive-ajax.min.js (Microsoft)
 *
 * Original jQuery library features:
 * - data-ajax="true" on forms/links → AJAX submission
 * - data-ajax-url → target URL
 * - data-ajax-method → HTTP method (GET/POST + X-HTTP-Method-Override for PUT/DELETE)
 * - data-ajax-confirm → confirmation dialog before request
 * - data-ajax-loading → loading element selector
 * - data-ajax-loading-duration → loading animation duration
 * - data-ajax-mode → content insertion mode (BEFORE/AFTER/REPLACE-WITH/default=REPLACE)
 * - data-ajax-update → target element selector for response content
 * - data-ajax-begin → callback before request
 * - data-ajax-complete → callback after request
 * - data-ajax-success → callback on success
 * - data-ajax-failure → callback on error
 * - data-ajax-cache → enable/disable caching
 * - Form serialization with submit button values
 * - Image input coordinate handling (name.x, name.y)
 * - Unobtrusive validation integration
 * - X-Requested-With header for server-side AJAX detection
 *
 * React Conversion:
 * - useUnobtrusiveAjax hook → core AJAX logic with callbacks
 * - ImsAjaxForm component → AJAX form with data-ajax-* props
 * - ImsAjaxLink component → AJAX link with data-ajax-* props
 * - Content insertion modes → React state/DOM operations
 * - Confirmation dialogs → async confirm function (shadcn AlertDialog compatible)
 * - Loading indicators → React state with show/hide callbacks
 * - Validation → form validation integration
 * - X-HTTP-Method-Override → header for RESTful methods over POST
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ajax } from "./ajax";
import type { ImsAjaxSettings, ImsAjaxResponse } from "./types";
import { param, serializeArray } from "./utils";

// ============================================================================
// Types
// ============================================================================

/** Content insertion mode - replaces data-ajax-mode attribute */
export type ImsAjaxInsertMode = "before" | "after" | "replace-with" | "replace";

/** HTTP method type */
export type ImsAjaxHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** AJAX request state */
export interface ImsAjaxState {
  /** Whether a request is currently in progress */
  loading: boolean;
  /** The response data from the last successful request */
  data: unknown;
  /** Error from the last failed request */
  error: Error | null;
  /** HTTP status code from the last response */
  status: number | null;
  /** Status text from the last response */
  statusText: string | null;
}

/** Callback context for AJAX operations - equivalent to 'this' in jQuery callbacks */
export interface ImsAjaxContext {
  /** The element that triggered the AJAX request */
  element: HTMLElement | null;
  /** The form element (if triggered from a form) */
  form: HTMLFormElement | null;
}

/** Options for useUnobtrusiveAjax hook - maps all data-ajax-* attributes */
export interface UseUnobtrusiveAjaxOptions {
  // ---- URL & Method (data-ajax-url, data-ajax-method) ----
  /** Target URL for the AJAX request (replaces data-ajax-url / form action) */
  url?: string;
  /** HTTP method (replaces data-ajax-method). Non-GET/POST uses X-HTTP-Method-Override */
  method?: ImsAjaxHttpMethod;

  // ---- Confirmation (data-ajax-confirm) ----
  /** Confirmation message shown before sending request. If provided, request is cancelled if user declines */
  confirm?: string;
  /** Custom confirmation function (replaces window.confirm). Return true to proceed */
  confirmHandler?: (message: string) => boolean | Promise<boolean>;

  // ---- Loading indicator (data-ajax-loading, data-ajax-loading-duration) ----
  /** Whether the loading state is active (replaces data-ajax-loading show/hide) */
  loadingDuration?: number;

  // ---- Content insertion (data-ajax-mode, data-ajax-update) ----
  /** How to insert response content into the target element */
  insertMode?: ImsAjaxInsertMode;
  /** Target element or ref for content insertion (replaces data-ajax-update selector) */
  updateTarget?: HTMLElement | React.RefObject<HTMLElement | null> | null;
  /** Callback for handling response content insertion manually */
  onUpdate?: (content: string, mode: ImsAjaxInsertMode, target: HTMLElement | null) => void;

  // ---- Callbacks (data-ajax-begin, data-ajax-complete, data-ajax-success, data-ajax-failure) ----
  /** Called before the request is sent. Return false to cancel the request */
  onBegin?: (xhr: XMLHttpRequest, context: ImsAjaxContext) => boolean | void;
  /** Called when the request completes (success or error) */
  onComplete?: (xhr: XMLHttpRequest, status: string, context: ImsAjaxContext) => void;
  /** Called when the request succeeds */
  onSuccess?: (data: unknown, status: string, xhr: XMLHttpRequest, context: ImsAjaxContext) => void;
  /** Called when the request fails */
  onFailure?: (xhr: XMLHttpRequest, status: string, error: string, context: ImsAjaxContext) => void;

  // ---- Caching (data-ajax-cache) ----
  /** Whether to enable caching (default: false for AJAX requests) */
  cache?: boolean;

  // ---- Extra data ----
  /** Additional data to send with the request */
  data?: Record<string, unknown> | FormData;
}

/** Return type for useUnobtrusiveAjax hook */
export interface UseUnobtrusiveAjaxReturn {
  /** Current AJAX state */
  state: ImsAjaxState;
  /** Whether a request is in progress */
  loading: boolean;
  /** Send an AJAX request with the configured options */
  send: (options?: Partial<UseUnobtrusiveAjaxOptions>) => Promise<ImsAjaxResponse | null>;
  /** Reset the state to initial values */
  reset: () => void;
  /** Manually set loading state */
  setLoading: (loading: boolean) => void;
}

/** Props for ImsAjaxForm component - maps data-ajax-* attributes to React props */
export interface ImsAjaxFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "method" | "action"> {
  /** Target URL (replaces data-ajax-url / form action) */
  action?: string;
  /** HTTP method (replaces data-ajax-method). Non-GET/POST uses X-HTTP-Method-Override */
  method?: ImsAjaxHttpMethod;
  /** Confirmation message before submit (replaces data-ajax-confirm) */
  confirm?: string;
  /** Custom confirmation handler */
  confirmHandler?: (message: string) => boolean | Promise<boolean>;
  /** Content insertion mode (replaces data-ajax-mode) */
  insertMode?: ImsAjaxInsertMode;
  /** Target element/ref for content insertion (replaces data-ajax-update) */
  updateTarget?: HTMLElement | React.RefObject<HTMLElement | null> | null;
  /** Custom content update handler */
  onUpdate?: (content: string, mode: ImsAjaxInsertMode, target: HTMLElement | null) => void;
  /** Loading animation duration in ms (replaces data-ajax-loading-duration) */
  loadingDuration?: number;
  /** Callback before request (replaces data-ajax-begin) */
  onBegin?: (xhr: XMLHttpRequest, context: ImsAjaxContext) => boolean | void;
  /** Callback on complete (replaces data-ajax-complete) */
  onComplete?: (xhr: XMLHttpRequest, status: string, context: ImsAjaxContext) => void;
  /** Callback on success (replaces data-ajax-success) */
  onSuccess?: (data: unknown, status: string, xhr: XMLHttpRequest, context: ImsAjaxContext) => void;
  /** Callback on failure (replaces data-ajax-failure) */
  onFailure?: (xhr: XMLHttpRequest, status: string, error: string, context: ImsAjaxContext) => void;
  /** Enable caching (replaces data-ajax-cache) */
  cache?: boolean;
  /** Additional data to send with the request */
  data?: Record<string, unknown>;
  /** Loading indicator component to show during request */
  loadingComponent?: React.ReactNode;
  /** Whether to validate the form before submission (replaces unobtrusive validation check) */
  validate?: boolean | (() => boolean);
  /** Called when the form is submitted (allows preventing default) */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => boolean | void;
  /** Children */
  children?: React.ReactNode;
}

/** Props for ImsAjaxLink component - maps data-ajax=true on <a> elements */
export interface ImsAjaxLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "href"> {
  /** Target URL (replaces href + data-ajax-url) */
  href?: string;
  /** HTTP method (default: GET for links) */
  method?: ImsAjaxHttpMethod;
  /** Confirmation message before request (replaces data-ajax-confirm) */
  confirm?: string;
  /** Custom confirmation handler */
  confirmHandler?: (message: string) => boolean | Promise<boolean>;
  /** Content insertion mode (replaces data-ajax-mode) */
  insertMode?: ImsAjaxInsertMode;
  /** Target element/ref for content insertion (replaces data-ajax-update) */
  updateTarget?: HTMLElement | React.RefObject<HTMLElement | null> | null;
  /** Custom content update handler */
  onUpdate?: (content: string, mode: ImsAjaxInsertMode, target: HTMLElement | null) => void;
  /** Loading animation duration in ms */
  loadingDuration?: number;
  /** Callback before request (replaces data-ajax-begin) */
  onBegin?: (xhr: XMLHttpRequest, context: ImsAjaxContext) => boolean | void;
  /** Callback on complete (replaces data-ajax-complete) */
  onComplete?: (xhr: XMLHttpRequest, status: string, context: ImsAjaxContext) => void;
  /** Callback on success (replaces data-ajax-success) */
  onSuccess?: (data: unknown, status: string, xhr: XMLHttpRequest, context: ImsAjaxContext) => void;
  /** Callback on failure (replaces data-ajax-failure) */
  onFailure?: (xhr: XMLHttpRequest, status: string, error: string, context: ImsAjaxContext) => void;
  /** Enable caching (replaces data-ajax-cache) */
  cache?: boolean;
  /** Additional data to send with the request */
  data?: Record<string, unknown>;
  /** Loading indicator component */
  loadingComponent?: React.ReactNode;
  /** Children */
  children?: React.ReactNode;
}

// ============================================================================
// Utility Functions
// ============================================================================

/** Valid simple HTTP methods that don't need X-HTTP-Method-Override */
const SIMPLE_METHODS = new Set(["GET", "POST"]);

/**
 * Check if an HTTP method is a simple method (GET or POST).
 * In the original library, non-GET/POST methods use POST + X-HTTP-Method-Override.
 */
export function isSimpleMethod(method: string): boolean {
  return SIMPLE_METHODS.has(method.toUpperCase());
}

/**
 * Serialize a form element into an array of name/value pairs.
 * Equivalent to jQuery's $(form).serializeArray() with submit button data.
 *
 * In the original library:
 * - Submit button values are captured via data() and appended to serialized data
 * - Image inputs add name.x and name.y coordinates
 */
export function serializeFormData(
  form: HTMLFormElement,
  submitButton?: HTMLButtonElement | HTMLInputElement | null,
  imageData?: Array<{ name: string; value: string }>
): Array<{ name: string; value: string }> {
  const formData = new FormData(form);
  const result: Array<{ name: string; value: string }> = [];

  // Add form fields
  formData.forEach((value, name) => {
    result.push({ name, value: value as string });
  });

  // Add submit button value (if it has a name)
  if (submitButton && submitButton.name) {
    result.push({
      name: submitButton.name,
      value: submitButton.value,
    });
  }

  // Add image input coordinates (name.x, name.y)
  if (imageData) {
    for (const entry of imageData) {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Insert content into a target element based on the insertion mode.
 * Equivalent to the `i()` function in the original library that handles
 * data-ajax-mode (BEFORE, AFTER, REPLACE-WITH, default).
 */
export function insertContent(
  target: HTMLElement,
  content: string,
  mode: ImsAjaxInsertMode = "replace"
): void {
  switch (mode) {
    case "before": {
      // Equivalent to: case "BEFORE": insertBefore firstChild
      const wrapper = document.createElement("div");
      wrapper.innerHTML = content;
      while (wrapper.firstChild) {
        target.insertBefore(wrapper.firstChild, target.firstChild);
      }
      break;
    }
    case "after": {
      // Equivalent to: case "AFTER": appendChild
      const wrapper = document.createElement("div");
      wrapper.innerHTML = content;
      while (wrapper.firstChild) {
        target.appendChild(wrapper.firstChild);
      }
      break;
    }
    case "replace-with": {
      // Equivalent to: case "REPLACE-WITH": replaceWith
      const wrapper = document.createElement("div");
      wrapper.innerHTML = content;
      const parent = target.parentNode;
      if (parent) {
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, target.nextSibling);
        }
        parent.removeChild(target);
      }
      break;
    }
    case "replace":
    default: {
      // Equivalent to: default: html(b)
      target.innerHTML = content;
      break;
    }
  }
}

/**
 * Resolve a target from various input types.
 * Handles HTMLElement, React ref, or null.
 */
export function resolveUpdateTarget(
  target: HTMLElement | React.RefObject<HTMLElement | null> | null | undefined
): HTMLElement | null {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if ("current" in target) return target.current;
  return null;
}

/**
 * Default confirmation handler using window.confirm.
 * Can be replaced with shadcn AlertDialog for a better UX.
 */
export function defaultConfirmHandler(message: string): boolean {
  return window.confirm(message);
}

/**
 * Resolve a callback function from a string name (for backward compatibility).
 * Equivalent to the `c()` function in the original library that resolves
 * dot-notation function names like "MyApp.handleSuccess".
 *
 * @param name - Dot-notation function name (e.g., "MyApp.handleSuccess")
 * @param args - Argument names for Function constructor fallback
 * @returns The resolved function, or a no-op if not found
 */
export function resolveCallback(
  name: string | undefined,
  args: string[] = []
): (...params: unknown[]) => unknown {
  if (!name) return () => undefined;

  // Try to resolve from window scope
  let context: Record<string, unknown> = window as unknown as Record<string, unknown>;
  const parts = name.split(".");

  for (const part of parts) {
    if (context && typeof context === "object" && part in context) {
      context = context[part] as Record<string, unknown>;
    } else {
      // Function not found - return no-op
      return () => undefined;
    }
  }

  if (typeof context === "function") {
    return context as (...params: unknown[]) => unknown;
  }

  // Fallback: use Function constructor (matches original library behavior)
  // WARNING: This is a security risk - only use with trusted strings
  try {
    const Fn = Function;
    return new Fn(...args, name) as (...params: unknown[]) => unknown;
  } catch {
    return () => undefined;
  }
}

/**
 * Check if content type is JavaScript.
 * Equivalent to the check in `i()`: e.indexOf("application/x-javascript") !== -1
 */
export function isJavaScriptContentType(contentType: string): boolean {
  return contentType.includes("application/x-javascript");
}

// ============================================================================
// useUnobtrusiveAjax Hook
// ============================================================================

const INITIAL_STATE: ImsAjaxState = {
  loading: false,
  data: null,
  error: null,
  status: null,
  statusText: null,
};

/**
 * Hook that provides unobtrusive AJAX functionality.
 *
 * This is the React equivalent of the Microsoft jQuery Unobtrusive Ajax library.
 * It replicates all the data-ajax-* attribute behavior as a composable hook.
 *
 * Features:
 * - HTTP method override (PUT/DELETE/PATCH sent as POST with X-HTTP-Method-Override header)
 * - Confirmation dialog before sending
 * - Loading state management
 * - Content insertion modes (before, after, replace-with, replace)
 * - Full callback lifecycle (onBegin, onSuccess, onFailure, onComplete)
 * - X-Requested-With header for server-side AJAX detection
 * - Caching control
 *
 * Usage:
 * ```tsx
 * const { send, loading, state } = useUnobtrusiveAjax({
 *   url: '/api/data',
 *   method: 'POST',
 *   confirm: 'Are you sure?',
 *   insertMode: 'replace',
 *   onSuccess: (data) => console.log(data),
 * });
 *
 * <button onClick={() => send()} disabled={loading}>
 *   {loading ? 'Loading...' : 'Submit'}
 * </button>
 * ```
 */
export function useUnobtrusiveAjax(options: UseUnobtrusiveAjaxOptions = {}): UseUnobtrusiveAjaxReturn {
  const [state, setState] = useState<ImsAjaxState>({ ...INITIAL_STATE });
  const optionsRef = useRef(options);
  const abortRef = useRef<AbortController | null>(null);

  // Keep options ref current (must use useEffect to avoid accessing ref during render)
  useEffect(() => {
    optionsRef.current = options;
  });

  const send = useCallback(
    async (overrideOptions?: Partial<UseUnobtrusiveAjaxOptions>): Promise<ImsAjaxResponse | null> => {
      const opts = { ...optionsRef.current, ...overrideOptions };

      const url = opts.url || "";
      const method = (opts.method || "GET").toUpperCase() as ImsAjaxHttpMethod;

      // ---- Confirmation check (data-ajax-confirm) ----
      if (opts.confirm) {
        const confirmFn = opts.confirmHandler || defaultConfirmHandler;
        const confirmed = await confirmFn(opts.confirm);
        if (!confirmed) return null;
      }

      // ---- Build AJAX settings ----
      const isSimple = isSimpleMethod(method);
      const actualMethod = isSimple ? method : "POST";

      // Serialize data
      let requestData: string | FormData | undefined;
      if (opts.data) {
        if (opts.data instanceof FormData) {
          requestData = opts.data;
        } else {
          requestData = param(opts.data as Record<string, unknown>);
        }
      }

      const context: ImsAjaxContext = {
        element: null,
        form: null,
      };

      // Create XHR mock for callbacks
      let xhrMock = new XMLHttpRequest();

      const ajaxSettings: ImsAjaxSettings = {
        url,
        method: actualMethod,
        data: requestData,
        cache: opts.cache,
        dataType: "html",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          ...(isSimple ? {} : { "X-HTTP-Method-Override": method }),
        },
        beforeSend: (xhr: XMLHttpRequest) => {
          xhrMock = xhr;

          // Set X-HTTP-Method-Override for non-simple methods
          if (!isSimple) {
            xhr.setRequestHeader("X-HTTP-Method-Override", method);
          }

          // Call onBegin callback (data-ajax-begin)
          if (opts.onBegin) {
            const result = opts.onBegin(xhr, context);
            if (result === false) return false;
          }

          // Show loading state
          setState((prev) => ({ ...prev, loading: true, error: null }));

          return true;
        },
        success: (data: unknown, status: string, xhr: XMLHttpRequest) => {
          // Get content type for JavaScript check
          const contentType = xhr.getResponseHeader?.("Content-Type") || "text/html";

          // Handle content insertion (data-ajax-update + data-ajax-mode)
          if (!isJavaScriptContentType(contentType)) {
            const targetElement = resolveUpdateTarget(opts.updateTarget);
            const mode = opts.insertMode || "replace";

            if (targetElement && typeof data === "string") {
              if (opts.onUpdate) {
                opts.onUpdate(data, mode, targetElement);
              } else {
                insertContent(targetElement, data, mode);
              }
            }
          }

          // Call onSuccess callback (data-ajax-success)
          opts.onSuccess?.(data, status, xhr, context);

          setState((prev) => ({
            ...prev,
            data,
            status: xhr.status,
            statusText: xhr.statusText,
          }));
        },
        error: (xhr: XMLHttpRequest, status: string, error: string) => {
          // Call onFailure callback (data-ajax-failure)
          opts.onFailure?.(xhr, status, error, context);

          setState((prev) => ({
            ...prev,
            error: new Error(error),
            status: xhr.status,
            statusText: status,
          }));
        },
        complete: (xhr: XMLHttpRequest, status: string) => {
          // Call onComplete callback (data-ajax-complete)
          opts.onComplete?.(xhr, status, context);

          setState((prev) => ({ ...prev, loading: false }));
        },
      };

      try {
        const response = await ajax(ajaxSettings);
        return response;
      } catch (err) {
        // Error already handled in callbacks above
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  return {
    state,
    loading: state.loading,
    send,
    reset,
    setLoading,
  };
}

// ============================================================================
// useAjaxForm Hook (for form-specific AJAX logic)
// ============================================================================

export interface UseAjaxFormOptions extends Omit<UseUnobtrusiveAjaxOptions, "url" | "method"> {
  /** Form ref */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /** Whether to validate before submission (replaces unobtrusive validation check) */
  validate?: boolean | (() => boolean);
}

/**
 * Hook specifically for AJAX form submission.
 * Handles form serialization, submit button capture, and image input coordinates.
 */
export function useAjaxForm(options: UseAjaxFormOptions = {}) {
  const { send, state, loading, reset, setLoading } = useUnobtrusiveAjax(options);
  const submitButtonRef = useRef<HTMLButtonElement | HTMLInputElement | null>(null);
  const imageDataRef = useRef<Array<{ name: string; value: string }>>([]);

  const setSubmitButton = useCallback((button: HTMLButtonElement | HTMLInputElement | null) => {
    submitButtonRef.current = button;
  }, []);

  const setImageData = useCallback((data: Array<{ name: string; value: string }>) => {
    imageDataRef.current = data;
  }, []);

  const submitForm = useCallback(
    async (form: HTMLFormElement, overrideOptions?: Partial<UseUnobtrusiveAjaxOptions>) => {
      // Validation check (replaces unobtrusive validation: !j(this))
      if (options.validate) {
        const isValid = typeof options.validate === "function" ? options.validate() : options.validate;
        if (!isValid) return null;
      }

      // Serialize form data (replaces: e.concat(a(this).serializeArray()))
      const formData = serializeFormData(form, submitButtonRef.current, imageDataRef.current);

      // Build request data from serialized form
      const requestData: Record<string, unknown> = {};
      for (const entry of formData) {
        requestData[entry.name] = entry.value;
      }

      // Add X-Requested-With header
      const url = overrideOptions?.url || options.url || form.action;
      const method = (overrideOptions?.method || options.method || form.method || "GET").toUpperCase() as ImsAjaxHttpMethod;

      // Clear submit button and image data after use
      // (matches: setTimeout(function() { f.removeData(b); f.removeData(d) }, 0))
      setTimeout(() => {
        submitButtonRef.current = null;
        imageDataRef.current = [];
      }, 0);

      return send({
        url,
        method,
        data: requestData,
        ...overrideOptions,
      });
    },
    [options, send]
  );

  return {
    state,
    loading,
    send: submitForm,
    reset,
    setLoading,
    setSubmitButton,
    setImageData,
  };
}
