/**
 * IMS jQuery Compatibility Module - Deferred / Promise Implementation
 * 
 * Converts jQuery.Deferred and jQuery.Callbacks to TypeScript using native Promises.
 * Provides a familiar Deferred API while leveraging modern async/await patterns.
 */

import type { ImsDeferred, ImsDeferredState, ImsCallbacks, ImsCallbacksOptions } from './types';

// ============================================================================
// Callbacks Implementation (jQuery.Callbacks replacement)
// ============================================================================

/**
 * Create a callback list with configurable behavior.
 * Replaces: jQuery.Callbacks(options)
 * 
 * Options:
 * - once: Callback list can only be fired once
 * - memory: Keep track of previous values and call newly added callbacks with latest values
 * - unique: A callback can only be added once
 * - stopOnFalse: Interrupt calling when a callback returns false
 */
export function createCallbacks(options: ImsCallbacksOptions | string = {}): ImsCallbacks {
  const opts: ImsCallbacksOptions = typeof options === 'string'
    ? parseCallbacksOptions(options)
    : { ...options };

  let list: ((...args: unknown[]) => unknown)[] | undefined = [];
  let memory: unknown[] | undefined;
  let fired = false;
  let firing = false;
  let firingStart = 0;
  let firingLength = 0;
  let firingIndex = 0;
  const stack: unknown[][] = !opts.once && [];

  function fire(data: unknown[]): void {
    memory = opts.memory && data;
    fired = true;
    firingIndex = firingStart || 0;
    firingStart = 0;
    firingLength = list ? list.length : 0;
    firing = true;

    for (; list && firingIndex < firingLength; firingIndex++) {
      if (list[firingIndex].apply(data[0], data[1]) === false && opts.stopOnFalse) {
        memory = undefined;
        break;
      }
    }

    firing = false;

    if (list) {
      if (stack && stack.length) {
        fire(stack.shift()!);
      } else if (memory) {
        list = [];
      } else {
        self.disable();
      }
    }
  }

  const self: ImsCallbacks = {
    add(...fns: ((...args: unknown[]) => unknown)[]): ImsCallbacks {
      if (list) {
        const start = list.length;

        fns.forEach((fn) => {
          if (typeof fn === 'function') {
            if (!opts.unique || !self.has(fn)) {
              list!.push(fn);
            }
          }
        });

        if (firing) {
          firingLength = list.length;
        } else if (memory) {
          firingStart = start;
          fire(memory);
        }
      }
      return self;
    },

    remove(...fns: ((...args: unknown[]) => unknown)[]): ImsCallbacks {
      if (list) {
        fns.forEach((fn) => {
          let index: number;
          while ((index = list!.indexOf(fn)) > -1) {
            list!.splice(index, 1);
            if (firing) {
              if (index <= firingLength) firingLength--;
              if (index <= firingIndex) firingIndex--;
            }
          }
        });
      }
      return self;
    },

    has(fn?: ((...args: unknown[]) => unknown)): boolean {
      return fn ? (list ? list.indexOf(fn) > -1 : false) : !!(list && list.length);
    },

    empty(): ImsCallbacks {
      list = [];
      firingLength = 0;
      return self;
    },

    disable(): ImsCallbacks {
      list = undefined;
      memory = undefined;
      return self;
    },

    disabled(): boolean {
      return !list;
    },

    lock(): ImsCallbacks {
      if (!memory) {
        self.disable();
      }
      return self;
    },

    locked(): boolean {
      return !list;
    },

    fireWith(context: unknown, args: unknown[] = []): ImsCallbacks {
      if (list && (!fired || stack)) {
        const data = [context, args.slice ? args.slice() : args];
        if (firing) {
          stack.push(data);
        } else {
          fire(data);
        }
      }
      return self;
    },

    fire(...args: unknown[]): ImsCallbacks {
      self.fireWith(this, args);
      return self;
    },

    fired(): boolean {
      return !!fired;
    },
  };

  return self;
}

/**
 * Parse space-separated options string into options object.
 */
function parseCallbacksOptions(optionsStr: string): ImsCallbacksOptions {
  const opts: ImsCallbacksOptions = {};
  const parts = optionsStr.split(/\s+/);
  parts.forEach((part) => {
    if (part === 'once') opts.once = true;
    else if (part === 'memory') opts.memory = true;
    else if (part === 'unique') opts.unique = true;
    else if (part === 'stopOnFalse') opts.stopOnFalse = true;
  });
  return opts;
}

// ============================================================================
// Deferred Implementation (jQuery.Deferred replacement)
// ============================================================================

/**
 * Create a Deferred object using native Promises.
 * Replaces: jQuery.Deferred([func])
 * 
 * Provides jQuery-like .done()/.fail()/.progress()/.always() API
 * built on top of native Promise for better async/await compatibility.
 */
export function createDeferred<T = unknown>(func?: (deferred: ImsDeferred<T>) => void): ImsDeferred<T> {
  let state: ImsDeferredState = 'pending';
  let resolveValue: T | undefined;
  let rejectReason: unknown;

  const doneCallbacks = createCallbacks({ once: true, memory: true });
  const failCallbacks = createCallbacks({ once: true, memory: true });
  const progressCallbacks = createCallbacks({ memory: true });

  // Native promise for async/await compatibility
  let _resolve!: (value: T | PromiseLike<T>) => void;
  let _reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  const deferred: ImsDeferred<T> = {
    promise(): ReturnType<ImsDeferred<T>['promise']> {
      return enhancedPromise as ReturnType<ImsDeferred<T>['promise']>;
    },

    resolve(value?: T): ImsDeferred<T> {
      if (state !== 'pending') return deferred;
      state = 'resolved';
      resolveValue = value;
      doneCallbacks.fireWith(promise, [value]);
      _resolve(value as T | PromiseLike<T>);
      return deferred;
    },

    reject(reason?: unknown): ImsDeferred<T> {
      if (state !== 'pending') return deferred;
      state = 'rejected';
      rejectReason = reason;
      failCallbacks.fireWith(promise, [reason]);
      _reject(reason);
      return deferred;
    },

    notify(value?: unknown): ImsDeferred<T> {
      if (state !== 'pending') return deferred;
      progressCallbacks.fireWith(promise, [value]);
      return deferred;
    },

    done(callback: (value: T) => void): ImsDeferred<T> {
      doneCallbacks.add(callback as (...args: unknown[]) => unknown);
      return deferred;
    },

    fail(callback: (reason: unknown) => void): ImsDeferred<T> {
      failCallbacks.add(callback as (...args: unknown[]) => unknown);
      return deferred;
    },

    progress(callback: (value: unknown) => void): ImsDeferred<T> {
      progressCallbacks.add(callback);
      return deferred;
    },

    always(callback: (...args: unknown[]) => void): ImsDeferred<T> {
      doneCallbacks.add(callback);
      failCallbacks.add(callback);
      return deferred;
    },

    state(): ImsDeferredState {
      return state;
    },
  };

  // Enhanced promise with jQuery-like methods
  const enhancedPromise = Object.assign(promise, {
    done(callback: (value: T) => void) {
      doneCallbacks.add(callback as (...args: unknown[]) => unknown);
      return enhancedPromise;
    },
    fail(callback: (reason: unknown) => void) {
      failCallbacks.add(callback as (...args: unknown[]) => unknown);
      return enhancedPromise;
    },
    progress(callback: (value: unknown) => void) {
      progressCallbacks.add(callback);
      return enhancedPromise;
    },
    always(callback: (...args: unknown[]) => void) {
      doneCallbacks.add(callback);
      failCallbacks.add(callback);
      return enhancedPromise;
    },
    state(): ImsDeferredState {
      return state;
    },
    // Pipe/then compatibility
    pipe: promise.then.bind(promise),
    then: promise.then.bind(promise),
  });

  // Call initializer if provided
  if (func) {
    func(deferred);
  }

  return deferred;
}

// ============================================================================
// When Utility (jQuery.when replacement)
// ============================================================================

/**
 * Provides a way to execute callback functions based on one or more Deferred/Promise objects.
 * Replaces: jQuery.when(deferreds)
 * 
 * Accepts native Promises, ImsDeferred objects, or plain values.
 */
export function when<T extends unknown[]>(
  ...subordinates: T
): Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]}> {
  if (subordinates.length === 0) {
    return Promise.resolve([] as unknown as Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]}>);
  }

  if (subordinates.length === 1) {
    const sub = subordinates[0];
    if (sub && typeof sub === 'object' && 'promise' in sub && typeof (sub as { promise: unknown }).promise === 'function') {
      return (sub as { promise(): Promise<unknown> }).promise() as unknown as Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]}>;
    }
    return Promise.resolve(subordinates) as unknown as Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]}>;
  }

  // Multiple subordinates - use Promise.all
  const promises = subordinates.map((sub) => {
    if (sub && typeof sub === 'object' && 'promise' in sub && typeof (sub as { promise: unknown }).promise === 'function') {
      return (sub as { promise(): Promise<unknown> }).promise();
    }
    if (sub instanceof Promise) {
      return sub;
    }
    return Promise.resolve(sub);
  });

  return Promise.all(promises) as unknown as Promise<{ [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]}>;
}
