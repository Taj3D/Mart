'use client';

/**
 * IMS Validation - Remote Validator
 *
 * Modern async remote validation replacing the jQuery AJAX-based remote
 * validation from jQuery Validation Plugin 1.11.1. Uses the Fetch API
 * with AbortController for request cancellation instead of jQuery's
 * "ajax mode: abort" pattern.
 *
 * Key mappings from jQuery Validation 1.11.1:
 *   - `$.validator.methods.remote(value, element, param)` → `validateRemote()`
 *   - `$.validator.prototype.previousValue(element)` → cache via `RemoteValidatorCache`
 *   - `$.validator.pendingRequest` → `PendingRequestManager.pendingCount`
 *   - "ajax mode: abort" → `AbortController` + `PendingRequestManager`
 *   - `data[element.name] = value` → default request body structure
 *
 * Supports both React hook usage (`useRemoteValidator`) and standalone
 * non-React usage (`createRemoteValidator` / `validateRemote`).
 *
 * @module ims-validation/remote-validator
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  RemoteValidationOptions,
  FieldElement,
  RuleParameter,
} from './types';

import { PENDING, DEPENDENCY_MISMATCH } from './types';

// Re-export constants for convenience
export { PENDING, DEPENDENCY_MISMATCH };

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Result of a remote validation check.
 *
 * In jQuery Validation 1.11.1, the remote method returns different types:
 *   - `true` → valid
 *   - `"true"` (string) → valid
 *   - `false` → invalid, use default message
 *   - `"false"` (string) → invalid, use default message
 *   - `string` (other) → invalid, use this string as the custom error message
 *
 * This interface normalizes all those responses into a structured result.
 */
export interface RemoteValidationResult {
  /** Whether the field value passed remote validation */
  isValid: boolean;
  /** Custom error message from the server, if the response was a string */
  message?: string;
  /** The value that was validated */
  value: string;
}

/**
 * Cached result from a previous remote validation for a field.
 *
 * Maps `$.validator.prototype.previousValue(element)` which caches the
 * last validation result per element to avoid redundant server requests
 * when the value hasn't changed.
 *
 * In jQuery Validation 1.11.1:
 * ```js
 * previousValue: function(element) {
 *   return $.data(element, "previousValue") || $.data(element, "previousValue", {
 *     old: null,
 *     valid: true,
 *     message: "Please fix this field."
 *   });
 * }
 * ```
 */
export interface RemoteValidatorCache {
  /** The previously validated value (maps to `previousValue.old`) */
  old: string | null;
  /** Whether the previous validation was valid (maps to `previousValue.valid`) */
  valid: boolean;
  /** The error message from the previous validation (maps to `previousValue.message`) */
  message?: string;
}

// ============================================================================
// Input Types for validateRemote
// ============================================================================

/**
 * Input parameters for the `validateRemote()` function.
 *
 * This consolidates the three arguments from `$.validator.methods.remote(value, element, param)`
 * into a single options object, adding modern fetch-specific options.
 *
 * The `param` argument in jQuery Validation can be:
 *   - A string → treated as the URL: `{ url: param }`
 *   - An object → merged with defaults (url, type, data, etc.)
 *
 * This type represents the fully resolved options after that normalization.
 */
export interface ValidateRemoteInput {
  /** The field value to validate (maps to `value` arg in `remote(value, element, param)`) */
  value: string;
  /** The field name, used as the key when sending the value to the server */
  fieldName: string;
  /** The URL to send the validation request to */
  url: string;
  /** HTTP method (default: "GET"). Maps to `param.type` in jQuery Validation */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /**
   * Additional data to send with the request.
   * Maps to `param.data` in jQuery Validation.
   * Can be a plain object or a function that returns an object
   * (matching `data: function(value, element) { ... }` pattern).
   */
  data?: Record<string, unknown> | ((value: string, element?: FieldElement) => Record<string, unknown>);
  /**
   * Expected response data type.
   * Maps to `param.dataType` in jQuery Validation. Default: "json".
   */
  dataType?: 'json' | 'text' | 'html' | 'xml' | 'script';
  /** Custom HTTP headers for the request */
  headers?: Record<string, string>;
  /** Whether to include CORS credentials (maps to `xhrFields.withCredentials`) */
  withCredentials?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to bypass browser cache for GET requests (default: true for GET) */
  cache?: boolean;
  /**
   * Whether to send the field value keyed by fieldName in the request body.
   * Default: true. Maps to `data[element.name] = value` in jQuery Validation.
   * When false, the value is only included if explicitly added via `data`.
   */
  sendFieldName?: boolean;
  /** Optional field element reference, used when `data` is a function */
  element?: FieldElement;
  /** AbortController signal for cancelling the request */
  signal?: AbortSignal;
  /** Cache of previous validation results for this field */
  previousCache?: RemoteValidatorCache | null;
}

// ============================================================================
// PendingRequestManager
// ============================================================================

/**
 * Manages in-flight remote validation requests with AbortController support.
 *
 * Replaces the "ajax mode: abort" pattern from jQuery Validation 1.11.1
 * where `$.ajax` calls with `mode: "abort"` would cancel previous requests
 * for the same port/field. In the original code:
 *
 * ```js
 * // From jQuery Validation 1.11.1 remote method:
 * if ( previous.old === value ) {
 *   return previous.valid;
 * }
 * previous.old = value;
 * validator.startRequest(element);
 * // ... AJAX call ...
 * // On success/error: validator.stopRequest(element, valid);
 * ```
 *
 * And from `$.validator.prototype.startRequest` / `stopRequest`:
 * ```js
 * startRequest: function(element) {
 *   if (!this.pending[element.name]) {
 *     this.pendingRequest++;
 *     this.pending[element.name] = true;
 *   }
 * },
 * stopRequest: function(element, valid) {
 *   this.pendingRequest--;
 *   delete this.pending[element.name];
 *   // ... form submission check ...
 * }
 * ```
 *
 * This class provides the same tracking but with modern cancellation support
 * via AbortController, allowing individual field requests or all requests
 * to be cancelled cleanly.
 */
export class PendingRequestManager {
  /** Map of field names to their active AbortControllers */
  private pending: Map<string, AbortController> = new Map();

  /** Total count of pending requests (maps to `$.validator.pendingRequest`) */
  private _pendingCount: number = 0;

  /**
   * Register a pending remote validation request for a field.
   *
   * If a request is already in-flight for the same field, it is aborted first
   * (matching the "ajax mode: abort" behavior where a new request cancels
   * the previous one for the same field).
   *
   * Maps `$.validator.prototype.startRequest(element)`:
   * ```js
   * startRequest: function(element) {
   *   if (!this.pending[element.name]) {
   *     this.pendingRequest++;
   *     this.pending[element.name] = true;
   *   }
   * }
   * ```
   *
   * @param fieldName - The field name being validated
   * @param abortController - The AbortController for this request
   */
  startRequest(fieldName: string, abortController: AbortController): void {
    // Abort any existing request for this field (ajax mode: abort pattern)
    if (this.pending.has(fieldName)) {
      this.abortRequest(fieldName);
    }

    this.pending.set(fieldName, abortController);
    this._pendingCount++;
  }

  /**
   * Remove a completed request for a field.
   *
   * Maps `$.validator.prototype.stopRequest(element, valid)`:
   * ```js
   * stopRequest: function(element, valid) {
   *   this.pendingRequest--;
   *   delete this.pending[element.name];
   * }
   * ```
   *
   * @param fieldName - The field name whose request has completed
   */
  stopRequest(fieldName: string): void {
    if (this.pending.has(fieldName)) {
      this.pending.delete(fieldName);
      this._pendingCount = Math.max(0, this._pendingCount - 1);
    }
  }

  /**
   * Abort a specific field's in-flight request.
   *
   * This replaces jQuery's `$.ajax.abort()` called when a new request
   * supersedes an old one for the same field.
   *
   * @param fieldName - The field name whose request should be aborted
   * @returns true if a request was found and aborted, false otherwise
   */
  abortRequest(fieldName: string): boolean {
    const controller = this.pending.get(fieldName);
    if (controller) {
      controller.abort();
      this.pending.delete(fieldName);
      this._pendingCount = Math.max(0, this._pendingCount - 1);
      return true;
    }
    return false;
  }

  /**
   * Abort all in-flight remote validation requests.
   *
   * This is useful for cleanup when unmounting a component or resetting
   * a form, ensuring no lingering network requests.
   */
  abortAll(): void {
    this.pending.forEach((controller) => controller.abort());
    this.pending.clear();
    this._pendingCount = 0;
  }

  /**
   * The number of currently pending (in-flight) remote validation requests.
   *
   * Maps `$.validator.pendingRequest` which tracks the count of outstanding
   * AJAX requests and defers form submission until it reaches zero.
   */
  get pendingCount(): number {
    return this._pendingCount;
  }

  /**
   * Check whether a specific field has a pending request.
   *
   * Maps checking `$.validator.pending[element.name]` in jQuery Validation.
   *
   * @param fieldName - The field name to check
   * @returns true if the field has an in-flight request
   */
  isPending(fieldName: string): boolean {
    return this.pending.has(fieldName);
  }

  /**
   * Get the AbortController for a specific field's pending request.
   *
   * Useful for externally aborting a specific field's request or
   * chaining additional abort logic.
   *
   * @param fieldName - The field name
   * @returns The AbortController if a request is pending, undefined otherwise
   */
  getController(fieldName: string): AbortController | undefined {
    return this.pending.get(fieldName);
  }

  /**
   * Get all field names that currently have pending requests.
   *
   * @returns Array of field names with in-flight requests
   */
  getPendingFieldNames(): string[] {
    return Array.from(this.pending.keys());
  }
}

// ============================================================================
// Server Response Parsing
// ============================================================================

/**
 * Parse the server response from a remote validation request.
 *
 * In jQuery Validation 1.11.1, the server response is interpreted as follows:
 *   - `true` or `"true"` → valid
 *   - `false` or `"false"` → invalid, use default message
 *   - Any other string → invalid, use this string as the custom error message
 *
 * From the original source:
 * ```js
 * var response = validator.previousValue(element);
 * if (response.valid !== undefined && response.valid) {
 *   // valid
 * } else {
 *   var errors = {};
 *   var message = response.message || validator.defaultMessage(element, "remote");
 *   errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
 *   validator.showErrors(errors);
 * }
 * ```
 *
 * @param response - The raw response from the server
 * @returns Normalized RemoteValidationResult
 */
function parseRemoteResponse(response: unknown): RemoteValidationResult {
  // Handle boolean responses
  if (typeof response === 'boolean') {
    return {
      isValid: response,
      value: '',
    };
  }

  // Handle string responses
  if (typeof response === 'string') {
    const trimmed = response.trim();
    if (trimmed === 'true') {
      return { isValid: true, value: '' };
    }
    if (trimmed === 'false') {
      return { isValid: false, value: '' };
    }
    // Any other string is a custom error message
    return { isValid: false, message: trimmed, value: '' };
  }

  // Handle numeric responses (treat 0/1 as false/true for API compatibility)
  if (typeof response === 'number') {
    return { isValid: response !== 0, value: '' };
  }

  // Handle object responses with valid/isValid property
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    if (typeof obj.valid === 'boolean') {
      return {
        isValid: obj.valid,
        message: typeof obj.message === 'string' ? obj.message : undefined,
        value: '',
      };
    }
    if (typeof obj.isValid === 'boolean') {
      return {
        isValid: obj.isValid,
        message: typeof obj.message === 'string' ? obj.message : undefined,
        value: '',
      };
    }
  }

  // Default: treat any other response as valid (fail-open for safety)
  return { isValid: true, value: '' };
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Check if a cached result can be used for the current value.
 *
 * Maps the `previousValue()` cache check from jQuery Validation 1.11.1:
 * ```js
 * var previous = this.previousValue(element);
 * if (previous.old === value) {
 *   return previous.valid;
 * }
 * ```
 *
 * @param cache - The cached validation result
 * @param value - The current field value
 * @returns The cached result if value matches, null otherwise
 */
function checkCache(
  cache: RemoteValidatorCache | null | undefined,
  value: string,
): RemoteValidationResult | null {
  if (!cache || cache.old === null) {
    return null;
  }

  if (cache.old === value) {
    return {
      isValid: cache.valid,
      message: cache.message,
      value,
    };
  }

  return null;
}

/**
 * Update the cache with a new validation result.
 *
 * Maps `$.validator.prototype.previousValue()` update:
 * ```js
 * previous.old = value;
 * previous.valid = valid;
 * previous.message = message;
 * ```
 *
 * @param cache - The existing cache (or null)
 * @param result - The validation result to cache
 * @returns Updated cache object
 */
function updateCache(
  cache: RemoteValidatorCache | null | undefined,
  result: RemoteValidationResult,
): RemoteValidatorCache {
  if (cache) {
    cache.old = result.value;
    cache.valid = result.isValid;
    cache.message = result.message;
    return cache;
  }
  return {
    old: result.value,
    valid: result.isValid,
    message: result.message,
  };
}

// ============================================================================
// normalizeParam
// ============================================================================

/**
 * Normalize the `param` argument from `$.validator.methods.remote(value, element, param)`
 * into a fully resolved `RemoteValidationOptions` object.
 *
 * In jQuery Validation 1.11.1, the `param` can be:
 *   - A string → treated as the URL: `{ url: param }`
 *   - An object → merged with defaults (url, type, data, etc.)
 *
 * From the original source:
 * ```js
 * remote: function(value, element, param) {
 *   if (this.optional(element)) {
 *     return "dependency-mismatch";
 *   }
 *   var previous = this.previousValue(element);
 *   // ...
 *   param = typeof param === "string" && {url: param} || param;
 *   // ...
 * }
 * ```
 *
 * @param param - The raw param value (string, object, or RemoteValidationOptions)
 * @returns Normalized RemoteValidationOptions
 */
function normalizeParam(
  param: string | RemoteValidationOptions | RuleParameter,
): RemoteValidationOptions {
  if (typeof param === 'string') {
    return { url: param };
  }

  if (typeof param === 'object' && param !== null && 'url' in param) {
    return param as RemoteValidationOptions;
  }

  // Fallback: treat as empty options (will cause an error later if no url)
  return {} as Partial<RemoteValidationOptions> as RemoteValidationOptions;
}

// ============================================================================
// validateRemote
// ============================================================================

/**
 * Core async remote validation function.
 *
 * Replaces `$.validator.methods.remote(value, element, param)` from jQuery
 * Validation 1.11.1 with a modern fetch-based implementation using
 * AbortController for request cancellation.
 *
 * **Behavior mapping from jQuery Validation 1.11.1:**
 *
 * 1. **Optional field check**: If the value is empty and the field is optional,
 *    returns `DEPENDENCY_MISMATCH` (same as `this.optional(element)` returning
 *    `"dependency-mismatch"`).
 *
 * 2. **Cache check**: If the value hasn't changed since the last validation,
 *    returns the cached result (same as `previous.old === value` check).
 *
 * 3. **Request construction**: Sends the field value as `{ [fieldName]: value }`
 *    in the request body (matching `data[element.name] = value` from the original).
 *
 * 4. **Response handling**: Parses the server response following jQuery Validation
 *    conventions: `true`/`"true"` = valid, `false`/`"false"` = invalid (default
 *    message), other string = invalid (custom message).
 *
 * 5. **AbortController**: Each request can be cancelled via the provided signal,
 *    replacing jQuery's `$.ajax.abort()` pattern.
 *
 * @example
 * ```ts
 * // Basic usage (param as URL string)
 * const result = await validateRemote({
 *   value: 'john@example.com',
 *   fieldName: 'email',
 *   url: '/api/validate-email',
 * });
 *
 * // Advanced usage with all options
 * const result = await validateRemote({
 *   value: 'username123',
 *   fieldName: 'username',
 *   url: '/api/check-username',
 *   method: 'POST',
 *   data: { context: 'registration' },
 *   headers: { 'X-CSRF-Token': 'abc123' },
 *   timeout: 5000,
 *   signal: abortController.signal,
 *   previousCache: cachedResult,
 * });
 * ```
 *
 * @param options - Validation input options
 * @returns Promise resolving to RemoteValidationResult, or DEPENDENCY_MISMATCH if optional
 */
export async function validateRemote(
  options: ValidateRemoteInput,
): Promise<RemoteValidationResult | typeof DEPENDENCY_MISMATCH> {
  const {
    value,
    fieldName,
    url,
    method = 'GET',
    data,
    dataType = 'json',
    headers = {},
    withCredentials = false,
    timeout,
    cache,
    sendFieldName = true,
    element,
    signal,
    previousCache,
  } = options;

  // 1. Optional field check — maps to `this.optional(element)` in jQuery Validation
  //    Empty values on optional fields should skip remote validation
  if (value == null || String(value).trim().length === 0) {
    return DEPENDENCY_MISMATCH;
  }

  // 2. Cache check — maps to `previous.old === value` check in jQuery Validation
  //    If the value hasn't changed, return the cached result
  const cachedResult = checkCache(previousCache, value);
  if (cachedResult !== null) {
    return cachedResult;
  }

  // 3. Build request data — maps to `data[element.name] = value` in jQuery Validation
  let requestData: Record<string, unknown> = {};

  // Send field value keyed by fieldName (matching jQuery's data[element.name] = value)
  if (sendFieldName) {
    requestData[fieldName] = value;
  }

  // Merge additional data from param.data
  if (data) {
    let additionalData: Record<string, unknown>;
    if (typeof data === 'function') {
      additionalData = data(value, element);
    } else {
      additionalData = data;
    }
    requestData = { ...requestData, ...additionalData };
  }

  // 4. Build fetch options
  const fetchHeaders: Record<string, string> = {
    ...headers,
  };

  // Set appropriate Content-Type for POST requests with body
  const httpMethod = method.toUpperCase();
  const hasBody = httpMethod !== 'GET' && httpMethod !== 'HEAD';

  if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
    fetchHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  // Set Accept header based on dataType
  if (!headers['Accept'] && !headers['accept']) {
    const acceptMap: Record<string, string> = {
      json: 'application/json, text/javascript, */*; q=0.01',
      text: 'text/plain, */*; q=0.01',
      html: 'text/html, */*; q=0.01',
      xml: 'application/xml, text/xml, */*; q=0.01',
      script: 'text/javascript, application/javascript, */*; q=0.01',
    };
    fetchHeaders['Accept'] = acceptMap[dataType] || '*/*';
  }

  // Handle X-Requested-With header (jQuery sends this for AJAX requests)
  if (!headers['X-Requested-With'] && !headers['x-requested-with']) {
    fetchHeaders['X-Requested-With'] = 'XMLHttpRequest';
  }

  // Build URL with query params for GET requests
  let requestUrl = url;

  // Cache busting for GET requests (jQuery Validation appends _=timestamp)
  if (httpMethod === 'GET' && cache === false) {
    const separator = requestUrl.includes('?') ? '&' : '?';
    requestUrl = `${requestUrl}${separator}_=${Date.now()}`;
  }

  const fetchOptions: RequestInit = {
    method: httpMethod,
    headers: fetchHeaders,
    credentials: withCredentials ? 'include' : 'same-origin',
    signal,
  };

  // Add body for non-GET requests
  if (hasBody && Object.keys(requestData).length > 0) {
    fetchOptions.body = urlencode(requestData);
  } else if (httpMethod === 'GET' && Object.keys(requestData).length > 0) {
    // For GET requests, append data as query parameters
    const queryString = urlencode(requestData);
    const separator = requestUrl.includes('?') ? '&' : '?';
    requestUrl = `${requestUrl}${separator}${queryString}`;
  }

  // 5. Execute the fetch request with optional timeout
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timeoutAbortController: AbortController | undefined;

  if (timeout && timeout > 0) {
    timeoutAbortController = new AbortController();
    timeoutId = setTimeout(() => timeoutAbortController!.abort(), timeout);

    // If there's already a signal, we need to combine them
    if (signal) {
      // If the provided signal is already aborted, abort immediately
      if (signal.aborted) {
        clearTimeout(timeoutId);
        throw new DOMException('The operation was aborted.', 'AbortError');
      }
      // Forward abort from the provided signal
      signal.addEventListener('abort', () => timeoutAbortController!.abort(), {
        once: true,
      });
    }
    fetchOptions.signal = timeoutAbortController.signal;
  }

  try {
    const response = await fetch(requestUrl, fetchOptions);

    // Clear timeout since request completed
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Handle non-OK HTTP responses
    if (!response.ok) {
      // Treat server errors as validation failures
      // jQuery Validation treats network/HTTP errors as invalid
      return {
        isValid: false,
        message: undefined,
        value,
      };
    }

    // 6. Parse the response body
    let responseBody: unknown;

    const contentType = response.headers.get('content-type') || '';

    if (dataType === 'json' || contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch {
        // If JSON parsing fails, try reading as text
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    // 7. Interpret the response using jQuery Validation conventions
    const result = parseRemoteResponse(responseBody);
    result.value = value;

    return result;
  } catch (error: unknown) {
    // Clear timeout on error
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Handle AbortError — request was cancelled
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    // Handle TypeError — network errors, etc.
    // In jQuery Validation, network errors are treated as invalid
    return {
      isValid: false,
      message: undefined,
      value,
    };
  }
}

// ============================================================================
// URL Encoding Helper
// ============================================================================

/**
 * URL-encode an object into a query string.
 * Matches jQuery's `$.param()` behavior for simple flat objects.
 *
 * @param data - The data object to encode
 * @returns URL-encoded string
 */
function urlencode(data: Record<string, unknown>): string {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      pairs.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return pairs.join('&');
}

// ============================================================================
// useRemoteValidator Hook
// ============================================================================

/**
 * React hook for managing remote validation state with AbortController support.
 *
 * Provides a declarative API for React components to perform remote validation
 * with automatic cleanup of in-flight requests on unmount.
 *
 * **Maps to jQuery Validation patterns:**
 * - `$.validator.pendingRequest` → `isPending` state
 * - `$.validator.prototype.previousValue()` → internal cache ref
 * - "ajax mode: abort" → AbortController per field
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { validateRemote, isPending, abort, getCachedResult } = useRemoteValidator();
 *
 *   const handleBlur = async () => {
 *     const result = await validateRemote({
 *       value: email,
 *       fieldName: 'email',
 *       url: '/api/validate-email',
 *     });
 *     if (result !== DEPENDENCY_MISMATCH) {
 *       setEmailError(result.isValid ? undefined : result.message);
 *     }
 *   };
 *
 *   // Cleanup on unmount is automatic
 *   return <input onBlur={handleBlur} />;
 * }
 * ```
 *
 * @returns Object with validation functions and state
 */
export function useRemoteValidator() {
  /** Map of field names to their cached validation results */
  const cacheRef = useRef<Map<string, RemoteValidatorCache>>(new Map());

  /** Manager for pending requests (tracks in-flight requests per field) */
  const pendingManagerRef = useRef<PendingRequestManager>(new PendingRequestManager());

  /** Map of field names to their active AbortControllers */
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  /** React state to trigger re-renders when pending status changes */
  const [isPending, setIsPending] = useState(false);

  /**
   * Get the cached validation result for a field.
   *
   * Maps `$.validator.prototype.previousValue(element)`:
   * ```js
   * previousValue: function(element) {
   *   return $.data(element, "previousValue") || ...;
   * }
   * ```
   *
   * @param fieldName - The field name
   * @returns The cached result, or null if no cached result exists
   */
  const getCachedResult = useCallback(
    (fieldName: string): RemoteValidatorCache | null => {
      return cacheRef.current.get(fieldName) ?? null;
    },
    [],
  );

  /**
   * Abort all in-flight requests and reset pending state.
   * Useful for form reset or cleanup scenarios.
   */
  const abort = useCallback(() => {
    pendingManagerRef.current.abortAll();
    abortControllersRef.current.clear();
    setIsPending(false);
  }, []);

  /**
   * Abort a specific field's in-flight request.
   *
   * @param fieldName - The field name whose request should be cancelled
   */
  const abortField = useCallback((fieldName: string) => {
    pendingManagerRef.current.abortRequest(fieldName);
    abortControllersRef.current.delete(fieldName);
    setIsPending(pendingManagerRef.current.pendingCount > 0);
  }, []);

  /**
   * Perform remote validation for a field.
   *
   * This is the hook-based interface that manages AbortControllers and caching
   * automatically. It handles:
   * 1. Aborting any previous request for the same field
   * 2. Creating a new AbortController for the request
   * 3. Updating the cache with the result
   * 4. Managing pending state for React re-renders
   *
   * @param options - Remote validation options (without signal and previousCache,
   *                  which are managed automatically by the hook)
   * @returns Promise resolving to RemoteValidationResult or DEPENDENCY_MISMATCH
   */
  const validateRemoteWithHook = useCallback(
    async (
      options: Omit<ValidateRemoteInput, 'signal' | 'previousCache'>,
    ): Promise<RemoteValidationResult | typeof DEPENDENCY_MISMATCH> => {
      const { fieldName } = options;

      // Abort any existing request for this field (ajax mode: abort pattern)
      const existingController = abortControllersRef.current.get(fieldName);
      if (existingController) {
        existingController.abort();
        pendingManagerRef.current.stopRequest(fieldName);
      }

      // Create a new AbortController for this request
      const abortController = new AbortController();
      abortControllersRef.current.set(fieldName, abortController);

      // Register as pending
      pendingManagerRef.current.startRequest(fieldName, abortController);
      setIsPending(true);

      try {
        const result = await validateRemote({
          ...options,
          signal: abortController.signal,
          previousCache: cacheRef.current.get(fieldName) ?? null,
        });

        // Update cache with the result (if not aborted)
        if (!abortController.signal.aborted) {
          if (result !== DEPENDENCY_MISMATCH) {
            cacheRef.current.set(
              fieldName,
              updateCache(cacheRef.current.get(fieldName) ?? null, result),
            );
          }
        }

        return result;
      } catch (error: unknown) {
        // If the request was aborted, return a neutral result
        if (error instanceof DOMException && error.name === 'AbortError') {
          return DEPENDENCY_MISMATCH;
        }
        throw error;
      } finally {
        // Always clean up the pending state
        if (abortControllersRef.current.get(fieldName) === abortController) {
          abortControllersRef.current.delete(fieldName);
        }
        pendingManagerRef.current.stopRequest(fieldName);
        setIsPending(pendingManagerRef.current.pendingCount > 0);
      }
    },
    [],
  );

  // Cleanup: abort all requests on unmount
  useEffect(() => {
    return () => {
      pendingManagerRef.current.abortAll();
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    /** Validate a field remotely with automatic caching and abort management */
    validateRemote: validateRemoteWithHook,
    /** Whether any remote validation request is currently in-flight */
    isPending,
    /** Abort all in-flight requests */
    abort,
    /** Abort a specific field's in-flight request */
    abortField,
    /** Get the cached validation result for a field */
    getCachedResult,
    /** The underlying PendingRequestManager for advanced usage */
    pendingManager: pendingManagerRef,
  };
}

// ============================================================================
// createRemoteValidator
// ============================================================================

/**
 * Options for creating a standalone remote validator instance.
 */
export interface RemoteValidatorOptions {
  /** Default URL for validation requests */
  url?: string;
  /** Default HTTP method (default: "GET") */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Default additional data to send with each request */
  data?: Record<string, unknown> | ((value: string, element?: FieldElement) => Record<string, unknown>);
  /** Default headers for requests */
  headers?: Record<string, string>;
  /** Whether to include CORS credentials by default */
  withCredentials?: boolean;
  /** Default request timeout in milliseconds */
  timeout?: number;
  /** Default cache behavior */
  cache?: boolean;
  /** Whether to send field name in request body by default (default: true) */
  sendFieldName?: boolean;
  /** Default expected response data type (default: "json") */
  dataType?: 'json' | 'text' | 'html' | 'xml' | 'script';
}

/**
 * A configured remote validator instance for standalone (non-React) usage.
 *
 * Provides built-in cache and pending request management without requiring
 * React hooks. Useful in server-side validation, Node.js scripts, or
 * non-React frameworks.
 */
export interface RemoteValidatorInstance {
  /**
   * Validate a field value remotely.
   *
   * Maps `$.validator.methods.remote(value, element, param)` behavior:
   * - If `param` is a string, it's treated as the URL
   * - If `param` is an object, it's merged with the instance defaults
   *
   * @param value - The field value to validate
   * @param fieldName - The field name (used as the data key)
   * @param param - URL string or full options object
   * @returns Promise resolving to RemoteValidationResult or DEPENDENCY_MISMATCH
   */
  validate(
    value: string,
    fieldName: string,
    param?: string | RemoteValidationOptions | RuleParameter,
  ): Promise<RemoteValidationResult | typeof DEPENDENCY_MISMATCH>;

  /** Abort all in-flight requests */
  abortAll(): void;

  /** Abort a specific field's in-flight request */
  abortField(fieldName: string): boolean;

  /** Get the cached result for a field */
  getCachedResult(fieldName: string): RemoteValidatorCache | null;

  /** Clear all cached results */
  clearCache(): void;

  /** Number of currently pending requests */
  readonly pendingCount: number;

  /** Check if a specific field has a pending request */
  isFieldPending(fieldName: string): boolean;

  /** The underlying PendingRequestManager */
  readonly pendingManager: PendingRequestManager;
}

/**
 * Factory function to create a configured remote validator instance.
 *
 * Creates a standalone validator with built-in cache and pending request
 * management. Can be used outside of React (e.g., in Node.js, service
 * workers, or non-React frameworks).
 *
 * @example
 * ```ts
 * // Create a validator with default configuration
 * const validator = createRemoteValidator({
 *   url: '/api/validate',
 *   method: 'POST',
 *   headers: { 'Authorization': 'Bearer token' },
 *   timeout: 5000,
 * });
 *
 * // Use with a string param (URL override)
 * const result = await validator.validate('john@example.com', 'email', '/api/check-email');
 *
 * // Use with an object param
 * const result = await validator.validate('username', 'username', {
 *   url: '/api/check-username',
 *   data: { context: 'signup' },
 * });
 *
 * // Use with default URL from createRemoteValidator options
 * const result = await validator.validate('some-value', 'fieldName');
 *
 * // Cleanup
 * validator.abortAll();
 * ```
 *
 * @param options - Default configuration options for the validator
 * @returns A configured RemoteValidatorInstance
 */
export function createRemoteValidator(
  options: RemoteValidatorOptions = {},
): RemoteValidatorInstance {
  const cacheMap = new Map<string, RemoteValidatorCache>();
  const pendingManager = new PendingRequestManager();
  const abortControllers = new Map<string, AbortController>();

  const defaultUrl = options.url ?? '';
  const defaultMethod = options.method ?? 'GET';
  const defaultData = options.data;
  const defaultHeaders = options.headers ?? {};
  const defaultWithCredentials = options.withCredentials ?? false;
  const defaultTimeout = options.timeout;
  const defaultCache = options.cache;
  const defaultSendFieldName = options.sendFieldName ?? true;
  const defaultDataType = options.dataType ?? 'json';

  const instance: RemoteValidatorInstance = {
    async validate(
      value: string,
      fieldName: string,
      param?: string | RemoteValidationOptions | RuleParameter,
    ): Promise<RemoteValidationResult | typeof DEPENDENCY_MISMATCH> {
      // Normalize param — maps jQuery's `typeof param === "string" && {url: param} || param`
      const resolvedOptions: Partial<RemoteValidationOptions> = param ? normalizeParam(param) : {};

      // Merge with instance defaults
      const url = resolvedOptions.url || defaultUrl;
      if (!url) {
        throw new Error(
          'Remote validation requires a URL. Provide it via param or createRemoteValidator({ url }).',
        );
      }

      // Resolve data: merge default data with per-call data
      let mergedData: Record<string, unknown> | ((value: string, element?: FieldElement) => Record<string, unknown>) | undefined;
      const resolvedData = resolvedOptions.data;
      if (resolvedData && defaultData) {
        // Both exist; if either is a function, use a wrapper function
        if (typeof resolvedData === 'function' || typeof defaultData === 'function') {
          mergedData = (val: string, el?: FieldElement) => {
            const base = typeof defaultData === 'function' ? defaultData(val, el) : defaultData;
            const extra = typeof resolvedData === 'function' ? resolvedData(val, el) : resolvedData;
            return { ...base, ...extra };
          };
        } else {
          mergedData = { ...defaultData, ...resolvedData };
        }
      } else {
        mergedData = resolvedData ?? defaultData;
      }

      // Merge headers
      const mergedHeaders = { ...defaultHeaders, ...(resolvedOptions.headers ?? {}) };

      // Abort any existing request for this field
      const existingController = abortControllers.get(fieldName);
      if (existingController) {
        existingController.abort();
        pendingManager.stopRequest(fieldName);
      }

      // Create new AbortController
      const abortController = new AbortController();
      abortControllers.set(fieldName, abortController);
      pendingManager.startRequest(fieldName, abortController);

      try {
        const result = await validateRemote({
          value,
          fieldName,
          url,
          method: resolvedOptions.method ?? defaultMethod,
          data: mergedData,
          dataType: resolvedOptions.dataType ?? defaultDataType,
          headers: mergedHeaders,
          withCredentials: resolvedOptions.withCredentials ?? defaultWithCredentials,
          timeout: resolvedOptions.timeout ?? defaultTimeout,
          cache: resolvedOptions.cache ?? defaultCache,
          sendFieldName: resolvedOptions.sendFieldName ?? defaultSendFieldName,
          signal: abortController.signal,
          previousCache: cacheMap.get(fieldName) ?? null,
        });

        // Update cache if not aborted
        if (!abortController.signal.aborted && result !== DEPENDENCY_MISMATCH) {
          cacheMap.set(
            fieldName,
            updateCache(cacheMap.get(fieldName) ?? null, result),
          );
        }

        return result;
      } catch (error: unknown) {
        // If the request was aborted, return DEPENDENCY_MISMATCH
        if (error instanceof DOMException && error.name === 'AbortError') {
          return DEPENDENCY_MISMATCH;
        }
        throw error;
      } finally {
        // Clean up
        if (abortControllers.get(fieldName) === abortController) {
          abortControllers.delete(fieldName);
        }
        pendingManager.stopRequest(fieldName);
      }
    },

    abortAll(): void {
      abortControllers.forEach((controller) => controller.abort());
      abortControllers.clear();
      pendingManager.abortAll();
    },

    abortField(fieldName: string): boolean {
      const controller = abortControllers.get(fieldName);
      if (controller) {
        controller.abort();
        abortControllers.delete(fieldName);
        return pendingManager.abortRequest(fieldName);
      }
      return pendingManager.abortRequest(fieldName);
    },

    getCachedResult(fieldName: string): RemoteValidatorCache | null {
      return cacheMap.get(fieldName) ?? null;
    },

    clearCache(): void {
      cacheMap.clear();
    },

    get pendingCount(): number {
      return pendingManager.pendingCount;
    },

    isFieldPending(fieldName: string): boolean {
      return pendingManager.isPending(fieldName);
    },

    get pendingManager(): PendingRequestManager {
      return pendingManager;
    },
  };

  return instance;
}
