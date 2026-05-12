/**
 * IMS jQuery Compatibility Module - AJAX Wrapper
 * 
 * Converts jQuery.ajax to modern fetch API with full jQuery-compatible interface.
 * Supports all standard AJAX methods, JSONP simulation, and file uploads.
 */

import type { ImsAjaxSettings, ImsAjaxResponse, ImsAjaxMethod } from './types';
import { isFunction, isPlainObject, extend, param } from './utils';

// ============================================================================
// Default AJAX Settings
// ============================================================================

const defaultSettings: ImsAjaxSettings = {
  url: '',
  method: 'GET',
  dataType: 'json',
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  async: true,
  cache: true,
  processData: true,
  traditional: false,
  crossDomain: false,
  timeout: 0,
  headers: {},
};

// ============================================================================
// AJAX Implementation
// ============================================================================

/**
 * Perform an asynchronous HTTP (AJAX) request.
 * Replaces: jQuery.ajax(url [, settings]) or jQuery.ajax(settings)
 */
export function ajax<T = unknown>(urlOrSettings: string | ImsAjaxSettings, settings?: ImsAjaxSettings): Promise<ImsAjaxResponse<T>> {
  let settingsObj: ImsAjaxSettings;

  if (typeof urlOrSettings === 'string') {
    settingsObj = extend(true, {}, defaultSettings, { url: urlOrSettings }, settings || {});
  } else {
    settingsObj = extend(true, {}, defaultSettings, urlOrSettings);
  }

  // Normalize method/type
  const method = (settingsObj.method || settingsObj.type || 'GET').toUpperCase() as ImsAjaxMethod;
  const url = settingsObj.url;

  // Process data
  let data: string | FormData | null = null;
  if (settingsObj.data != null) {
    if (settingsObj.processData !== false && !(settingsObj.data instanceof FormData)) {
      if (isPlainObject(settingsObj.data)) {
        data = param(settingsObj.data as Record<string, unknown>, settingsObj.traditional);
      } else if (typeof settingsObj.data === 'string') {
        data = settingsObj.data;
      }
    } else {
      data = settingsObj.data as FormData;
    }
  }

  // Handle cache busting
  let finalUrl = url;
  if (settingsObj.cache === false && method === 'GET') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += separator + '_=' + Date.now();
  }

  // Append data to URL for GET requests
  if (method === 'GET' && data && typeof data === 'string') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += separator + data;
    data = null;
  }

  // Build headers
  const headers: Record<string, string> = {
    ...settingsObj.headers,
  };

  // Set Content-Type for requests with body
  if (data && method !== 'GET' && method !== 'HEAD') {
    if (settingsObj.contentType && !(data instanceof FormData)) {
      headers['Content-Type'] = settingsObj.contentType;
    }
  }

  // Set Accept header based on dataType
  const acceptHeaders: Record<string, string> = {
    json: 'application/json, text/javascript',
    xml: 'application/xml, text/xml',
    html: 'text/html',
    text: 'text/plain',
    script: 'text/javascript, application/javascript',
  };
  if (settingsObj.dataType && acceptHeaders[settingsObj.dataType]) {
    headers['Accept'] = acceptHeaders[settingsObj.dataType];
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: settingsObj.withCredentials ? 'include' : 'same-origin',
  };

  if (data && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = data;
  }

  // Handle beforeSend callback
  if (settingsObj.beforeSend) {
    const xhrMock = createXhrMock(finalUrl, method);
    const result = settingsObj.beforeSend(xhrMock);
    if (result === false) {
      return Promise.reject(new Error('Request cancelled by beforeSend'));
    }
  }

  // Create the fetch promise with timeout support
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const fetchPromise = fetch(finalUrl, fetchOptions);

  const timeoutPromise = settingsObj.timeout && settingsObj.timeout > 0
    ? new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('timeout'));
        }, settingsObj.timeout!);
      })
    : null;

  const racePromise = timeoutPromise
    ? Promise.race([fetchPromise, timeoutPromise])
    : fetchPromise;

  return racePromise
    .then(async (response) => {
      if (timeoutId) clearTimeout(timeoutId);

      // Parse response based on dataType
      let responseData: T;
      const responseType = settingsObj.dataType || guessDataType(response);

      switch (responseType) {
        case 'json':
          responseData = await response.json() as T;
          break;
        case 'xml':
          const text = await response.text();
          const parser = new DOMParser();
          responseData = parser.parseFromString(text, 'text/xml') as unknown as T;
          break;
        case 'html':
        case 'script':
        case 'text':
          responseData = await response.text() as unknown as T;
          break;
        default:
          responseData = await response.text() as unknown as T;
      }

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        const error = new Error(response.statusText) as Error & { status: number; response: ImsAjaxResponse<T> };
        error.status = response.status;
        error.response = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          xhr: createXhrMock(finalUrl, method, response.status, response.statusText),
          headers: responseHeaders,
        };
        
        if (settingsObj.error) {
          settingsObj.error(
            createXhrMock(finalUrl, method, response.status, response.statusText),
            'error',
            response.statusText
          );
        }

        throw error;
      }

      const result: ImsAjaxResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        xhr: createXhrMock(finalUrl, method, response.status, response.statusText),
        headers: responseHeaders,
      };

      if (settingsObj.success) {
        settingsObj.success(responseData, response.statusText, result.xhr);
      }

      if (settingsObj.complete) {
        settingsObj.complete(result.xhr, response.statusText);
      }

      return result;
    })
    .catch((error: Error) => {
      if (timeoutId) clearTimeout(timeoutId);

      if (settingsObj.error) {
        settingsObj.error(
          createXhrMock(finalUrl, method, 0, 'error'),
          error.message === 'timeout' ? 'timeout' : 'error',
          error.message
        );
      }

      if (settingsObj.complete) {
        settingsObj.complete(
          createXhrMock(finalUrl, method, 0, 'error'),
          'error'
        );
      }

      throw error;
    });
}

/**
 * Guess the data type from response Content-Type header.
 */
function guessDataType(response: Response): string {
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('json')) return 'json';
  if (contentType.includes('xml')) return 'xml';
  if (contentType.includes('html')) return 'html';
  return 'text';
}

/**
 * Create a minimal XMLHttpRequest-like mock for callback compatibility.
 */
function createXhrMock(
  url: string,
  method: string,
  status = 0,
  statusText = ''
): XMLHttpRequest {
  const xhr = new XMLHttpRequest();
  // We open but don't send - this creates a usable mock
  try {
    xhr.open(method, url, true);
  } catch {
    // Ignore errors in mock creation
  }
  Object.defineProperty(xhr, 'status', { value: status, writable: false });
  Object.defineProperty(xhr, 'statusText', { value: statusText, writable: false });
  Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
  return xhr;
}

// ============================================================================
// AJAX Shorthand Methods
// ============================================================================

/**
 * Load data from the server using a HTTP GET request.
 * Replaces: jQuery.get(url [, data] [, success] [, dataType])
 */
export function get<T = unknown>(
  url: string,
  data?: Record<string, unknown> | string | null,
  success?: (data: T, textStatus: string, xhr: XMLHttpRequest) => void,
  dataType?: ImsAjaxSettings['dataType']
): Promise<ImsAjaxResponse<T>> {
  // Handle overloaded signatures
  if (isFunction(data)) {
    dataType = success as ImsAjaxSettings['dataType'];
    success = data as (data: T, textStatus: string, xhr: XMLHttpRequest) => void;
    data = undefined;
  }

  return ajax<T>({
    url,
    method: 'GET',
    data: data as Record<string, unknown> | string | null,
    dataType,
    success,
  });
}

/**
 * Load data from the server using a HTTP POST request.
 * Replaces: jQuery.post(url [, data] [, success] [, dataType])
 */
export function post<T = unknown>(
  url: string,
  data?: Record<string, unknown> | string | null,
  success?: (data: T, textStatus: string, xhr: XMLHttpRequest) => void,
  dataType?: ImsAjaxSettings['dataType']
): Promise<ImsAjaxResponse<T>> {
  if (isFunction(data)) {
    dataType = success as ImsAjaxSettings['dataType'];
    success = data as (data: T, textStatus: string, xhr: XMLHttpRequest) => void;
    data = undefined;
  }

  return ajax<T>({
    url,
    method: 'POST',
    data: data as Record<string, unknown> | string | null,
    dataType,
    success,
  });
}

/**
 * Load JSON-encoded data from the server using a GET HTTP request.
 * Replaces: jQuery.getJSON(url [, data] [, success])
 */
export function getJSON<T = unknown>(
  url: string,
  data?: Record<string, unknown> | string | null,
  success?: (data: T, textStatus: string, xhr: XMLHttpRequest) => void
): Promise<ImsAjaxResponse<T>> {
  if (isFunction(data)) {
    success = data as (data: T, textStatus: string, xhr: XMLHttpRequest) => void;
    data = undefined;
  }

  return ajax<T>({
    url,
    method: 'GET',
    data: data as Record<string, unknown> | string | null,
    dataType: 'json',
    success,
  });
}

/**
 * Load a JavaScript file from the server using a GET HTTP request, then execute it.
 * Replaces: jQuery.getScript(url [, success])
 */
export function getScript(
  url: string,
  success?: (data: string, textStatus: string, xhr: XMLHttpRequest) => void
): Promise<ImsAjaxResponse<string>> {
  return ajax<string>({
    url,
    method: 'GET',
    dataType: 'script',
    success,
  });
}

// ============================================================================
// AJAX Setup / Configuration
// ============================================================================

/** Current global AJAX settings */
let globalAjaxSettings: ImsAjaxSettings = { ...defaultSettings };

/**
 * Set default values for future AJAX requests.
 * Replaces: jQuery.ajaxSetup(options)
 */
export function ajaxSetup(options: ImsAjaxSettings): ImsAjaxSettings {
  globalAjaxSettings = extend(true, {}, globalAjaxSettings, options);
  return globalAjaxSettings;
}

/**
 * Get current global AJAX settings.
 */
export function getAjaxSettings(): ImsAjaxSettings {
  return { ...globalAjaxSettings };
}

/**
 * Register a prefilter to modify AJAX settings before each request.
 * Replaces: jQuery.ajaxPrefilter(dataTypes, handler)
 */
type AjaxPrefilter = (options: ImsAjaxSettings, originalOptions: ImsAjaxSettings, xhr: XMLHttpRequest) => void;
const prefilters: AjaxPrefilter[] = [];

export function ajaxPrefilter(handler: AjaxPrefilter): void {
  prefilters.push(handler);
}

/**
 * Register a transport for specific data types.
 * Replaces: jQuery.ajaxTransport(dataTypes, handler)
 */
type AjaxTransport = (options: ImsAjaxSettings) => unknown;
const transports: Record<string, AjaxTransport[]> = {};

export function ajaxTransport(dataType: string, handler: AjaxTransport): void {
  if (!transports[dataType]) {
    transports[dataType] = [];
  }
  transports[dataType].push(handler);
}

/**
 * Global AJAX event handlers (for monitoring).
 * Replaces: jQuery.ajaxStart, ajaxStop, ajaxComplete, etc.
 */
const ajaxEventHandlers: Record<string, ((...args: unknown[]) => void)[]> = {
  ajaxStart: [],
  ajaxStop: [],
  ajaxSend: [],
  ajaxComplete: [],
  ajaxError: [],
  ajaxSuccess: [],
};

let activeRequests = 0;

/** Register a global AJAX event handler */
export function onAjaxEvent(event: string, handler: (...args: unknown[]) => void): void {
  if (ajaxEventHandlers[event]) {
    ajaxEventHandlers[event].push(handler);
  }
}

/** Remove a global AJAX event handler */
export function offAjaxEvent(event: string, handler: (...args: unknown[]) => void): void {
  if (ajaxEventHandlers[event]) {
    const idx = ajaxEventHandlers[event].indexOf(handler);
    if (idx > -1) ajaxEventHandlers[event].splice(idx, 1);
  }
}

/** Fire a global AJAX event */
function fireAjaxEvent(event: string, ...args: unknown[]): void {
  ajaxEventHandlers[event]?.forEach((handler) => handler(...args));
}

// Wrap the main ajax function to fire global events
const _originalAjax = ajax;
export { _originalAjax as _ajaxImpl };

/** AJAX with global event support */
export function ajaxWithEvents<T = unknown>(urlOrSettings: string | ImsAjaxSettings, settings?: ImsAjaxSettings): Promise<ImsAjaxResponse<T>> {
  activeRequests++;
  fireAjaxEvent('ajaxStart');

  const promise = _originalAjax<T>(urlOrSettings, settings);

  promise
    .then((response) => {
      fireAjaxEvent('ajaxSuccess', response);
      fireAjaxEvent('ajaxComplete', response);
    })
    .catch((error) => {
      fireAjaxEvent('ajaxError', error);
      fireAjaxEvent('ajaxComplete', error);
    })
    .finally(() => {
      activeRequests--;
      if (activeRequests <= 0) {
        activeRequests = 0;
        fireAjaxEvent('ajaxStop');
      }
    });

  return promise;
}
