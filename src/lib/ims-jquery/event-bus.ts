/**
 * IMS jQuery Compatibility Module - Event Bus System
 * 
 * Converts jQuery event system to a modern pub/sub event bus.
 * Provides centralized event management for decoupled communication
 * between React components and legacy jQuery-style patterns.
 */

import type { ImsEventHandler, ImsEvent, ImsEventBinding, ImsEventNamespace } from './types';
import { isFunction, trim, guid } from './utils';

// ============================================================================
// Event Bus Implementation
// ============================================================================

/** Event listener entry */
interface EventListenerEntry {
  handler: ImsEventHandler;
  selector?: string;
  namespace: string;
  guid: number;
  once: boolean;
}

/** Event storage */
const eventStore = new Map<string, EventListenerEntry[]>();

/** Global event bus instance */
class ImsEventBus {
  private listeners = new Map<string, EventListenerEntry[]>();
  private onceHandlers = new Set<number>();

  /**
   * Subscribe to an event.
   * Replaces: $(document).on(event, handler)
   * 
   * @param event - Event name, optionally with namespace (e.g., "click.myPlugin")
   * @param handler - Event handler function
   * @param options - Optional configuration
   */
  on(
    event: string,
    handler: ImsEventHandler,
    options?: { selector?: string; once?: boolean; data?: unknown }
  ): this {
    const parsed = parseEventName(event);
    const entry: EventListenerEntry = {
      handler,
      selector: options?.selector,
      namespace: parsed.namespace,
      guid: guid(handler),
      once: options?.once || false,
    };

    const key = parsed.type;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(entry);

    if (entry.once) {
      this.onceHandlers.add(entry.guid);
    }

    return this;
  }

  /**
   * Subscribe to an event that will only fire once.
   * Replaces: $(document).one(event, handler)
   */
  one(event: string, handler: ImsEventHandler, selector?: string): this {
    return this.on(event, handler, { selector, once: true });
  }

  /**
   * Unsubscribe from an event.
   * Replaces: $(document).off(event [, handler])
   */
  off(event?: string, handler?: ImsEventHandler): this {
    if (!event) {
      // Remove all listeners
      this.listeners.clear();
      this.onceHandlers.clear();
      return this;
    }

    const parsed = parseEventName(event);

    if (parsed.namespace) {
      // Remove all handlers for this namespace+type
      this.listeners.forEach((entries, key) => {
        if (parsed.type && key !== parsed.type) return;
        const filtered = entries.filter((entry) => entry.namespace !== parsed.namespace);
        if (filtered.length === 0) {
          this.listeners.delete(key);
        } else {
          this.listeners.set(key, filtered);
        }
      });
    } else if (handler) {
      // Remove specific handler
      const entries = this.listeners.get(parsed.type);
      if (entries) {
        const handlerGuid = (handler as { guid?: number }).guid || guid(handler);
        const filtered = entries.filter((entry) => entry.guid !== handlerGuid);
        if (filtered.length === 0) {
          this.listeners.delete(parsed.type);
        } else {
          this.listeners.set(parsed.type, filtered);
        }
      }
    } else {
      // Remove all handlers for this event type
      this.listeners.delete(parsed.type);
    }

    return this;
  }

  /**
   * Trigger an event, notifying all subscribers.
   * Replaces: $(document).trigger(event [, data])
   */
  trigger(event: string | ImsEvent, data?: unknown[]): this {
    const eventName = typeof event === 'string' ? event : event.type;
    const parsed = parseEventName(eventName);
    const entries = this.listeners.get(parsed.type);

    if (!entries || entries.length === 0) return this;

    // Create ImsEvent object
    const imsEvent: ImsEvent = typeof event === 'string'
      ? createImsEvent(parsed.type, data)
      : event;

    // Call handlers in order
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Filter by namespace if specified
      if (parsed.namespace && entry.namespace !== parsed.namespace) continue;

      const result = entry.handler(imsEvent, ...(data || []));

      // If handler returns false, stop propagation
      if (result === false) {
        imsEvent.stopPropagation();
        break;
      }

      // Remove one-time handlers
      if (entry.once || this.onceHandlers.has(entry.guid)) {
        entries.splice(i, 1);
        i--;
        this.onceHandlers.delete(entry.guid);
      }

      if (imsEvent.isImmediatePropagationStopped()) break;
    }

    return this;
  }

  /**
   * Check if there are any listeners for a given event.
   */
  hasListeners(event: string): boolean {
    const parsed = parseEventName(event);
    const entries = this.listeners.get(parsed.type);
    if (!entries) return false;
    if (!parsed.namespace) return entries.length > 0;
    return entries.some((entry) => entry.namespace === parsed.namespace);
  }

  /**
   * Get listener count for an event.
   */
  listenerCount(event: string): number {
    const parsed = parseEventName(event);
    const entries = this.listeners.get(parsed.type);
    if (!entries) return 0;
    if (!parsed.namespace) return entries.length;
    return entries.filter((entry) => entry.namespace === parsed.namespace).length;
  }

  /**
   * Remove all listeners.
   */
  clear(): this {
    this.listeners.clear();
    this.onceHandlers.clear();
    return this;
  }
}

// ============================================================================
// Event Name Parsing
// ============================================================================

/**
 * Parse event name into type and namespace.
 * e.g., "click.myPlugin" → { type: "click", namespace: "myPlugin", origType: "click.myPlugin" }
 */
function parseEventName(event: string): ImsEventNamespace {
  const parts = event.split('.');
  return {
    type: parts[0],
    namespace: parts.slice(1).join('.'),
    origType: event,
  };
}

// ============================================================================
// ImsEvent Creation
// ============================================================================

/**
 * Create an ImsEvent object from a native event or event name.
 */
function createImsEvent(type: string, data?: unknown[]): ImsEvent {
  let defaultPrevented = false;
  let propagationStopped = false;
  let immediatePropagationStopped = false;

  return {
    originalEvent: null,
    type,
    target: null,
    currentTarget: null,
    relatedTarget: null,
    timeStamp: Date.now(),
    data: data?.[0],
    result: undefined,
    namespace: '',
    isDefaultPrevented: () => defaultPrevented,
    isPropagationStopped: () => propagationStopped,
    isImmediatePropagationStopped: () => immediatePropagationStopped,
    preventDefault() {
      defaultPrevented = true;
    },
    stopPropagation() {
      propagationStopped = true;
    },
    stopImmediatePropagation() {
      immediatePropagationStopped = true;
      propagationStopped = true;
    },
  };
}

/**
 * Create an ImsEvent from a native DOM Event.
 */
export function createFromNativeEvent(nativeEvent: Event, extraData?: unknown): ImsEvent {
  const imsEvent = createImsEvent(nativeEvent.type, extraData ? [extraData] : undefined);
  imsEvent.originalEvent = nativeEvent;
  imsEvent.target = nativeEvent.target;
  imsEvent.currentTarget = nativeEvent.currentTarget;
  imsEvent.relatedTarget = nativeEvent.relatedTarget as EventTarget;
  imsEvent.timeStamp = nativeEvent.timeStamp;

  return imsEvent;
}

// ============================================================================
// Global Event Bus Singleton
// ============================================================================

/** Global event bus instance for application-wide events */
export const globalEventBus = new ImsEventBus();

/** Create a new scoped event bus */
export function createEventBus(): ImsEventBus {
  return new ImsEventBus();
}

// ============================================================================
// Special Event Handling (mouseenter/mouseleave simulation)
// ============================================================================

/**
 * Map of special event types that need custom handling.
 * Replaces: jQuery.event.special
 */
export const specialEvents: Record<string, {
  bindType?: string;
  delegateType?: string;
  trigger?: (event: ImsEvent) => void | false;
  handle?: (event: ImsEvent) => unknown;
}> = {
  mouseenter: {
    delegateType: 'mouseover',
    bindType: 'mouseover',
  },
  mouseleave: {
    delegateType: 'mouseout',
    bindType: 'mouseout',
  },
  focus: {
    delegateType: 'focusin',
    bindType: 'focusin',
  },
  blur: {
    delegateType: 'focusout',
    bindType: 'focusout',
  },
};

/**
 * Simulate an event on an element.
 * Replaces: jQuery.event.simulate(type, elem, event, bubble)
 */
export function simulateEvent(type: string, element: Element, nativeEvent?: Event, bubble = true): void {
  const imsEvent = nativeEvent 
    ? createFromNativeEvent(nativeEvent)
    : createImsEvent(type);

  imsEvent.type = type;
  imsEvent.isSimulated = true;

  // Fire via event bus
  globalEventBus.trigger(imsEvent);

  // Also dispatch native event if bubbling
  if (bubble && element) {
    const customEvent = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail: imsEvent,
    });
    element.dispatchEvent(customEvent);
  }
}

// Add isSimulated property to ImsEvent
declare module './types' {
  interface ImsEvent<T = Event> {
    isSimulated?: boolean;
  }
}

export { ImsEventBus };
