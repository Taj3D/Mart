/**
 * IMS Chart Renderer - Event Handling & Module Registration System
 * Replaces FusionCharts core event system and module registration
 * Implements: register(), attachEventHandlers(), global event bus, module dependencies
 * Part of IMS ERP System - Deep Navy Blue Theme
 *
 * Converted from: FusionCharts.register("module", {...})
 *                 FusionCharts.attachEventHandlers(eventType, handler)
 *                 FusionCharts core event dispatching
 */

import type { IMSChartType, IMSChartEventType, IMSChartEvent, IMSChartEventHandler } from '../chart-utils/types';

// ============================================================================
// Module Registration System
// ============================================================================

/** Module type identifiers matching FusionCharts module categories */
export type IMSModuleType =
  | 'highlightEffect'   // Visual highlight effects (fadeout, etc.)
  | 'renderer'          // Chart renderers (column, line, pie, etc.)
  | 'interaction'       // Interaction behaviors (zoom, scroll, legend)
  | 'theme'             // Theme definitions
  | 'plugin'            // External plugins
  | 'dataHandler'       // Data format handlers (json, xml, htmltable)
  | 'apiExtension';     // API extensions

/** Module definition */
export interface IMSModuleDefinition {
  /** Module unique ID */
  id: string;
  /** Module type */
  type: IMSModuleType;
  /** Module name */
  name: string;
  /** Module version */
  version: string;
  /** Description */
  description?: string;
  /** Required dependencies (module IDs) */
  dependencies?: string[];
  /** Module initialization function */
  init?: (api: IMSModuleAPI) => void;
  /** Module dispose function */
  dispose?: () => void;
  /** Whether module is initialized */
  initialized?: boolean;
  /** Extra data */
  data?: unknown;
}

/** API surface available to modules */
export interface IMSModuleAPI {
  /** Get registered module */
  getModule: (id: string) => IMSModuleDefinition | undefined;
  /** Register event handler */
  on: (eventType: string, handler: IMSChartEventHandler) => void;
  /** Unregister event handler */
  off: (eventType: string, handler: IMSChartEventHandler) => void;
  /** Dispatch event */
  dispatch: (event: IMSChartEvent) => void;
  /** Get chart type configuration */
  getChartConfig: (type: string) => unknown;
  /** Register highlight effect */
  registerHighlightEffect: (name: string, handler: unknown) => void;
  /** Get all registered chart types */
  getRegisteredChartTypes: () => string[];
}

// Module registry
const moduleRegistry: Map<string, IMSModuleDefinition> = new Map();

/**
 * Register a module with the chart system.
 * Replaces FusionCharts.register("module", definition).
 */
export function registerModule(definition: IMSModuleDefinition): boolean {
  if (moduleRegistry.has(definition.id)) {
    console.warn(`[IMS Chart] Module "${definition.id}" is already registered. Skipping.`);
    return false;
  }

  // Check dependencies
  if (definition.dependencies?.length) {
    const missing = definition.dependencies.filter(depId => !moduleRegistry.has(depId));
    if (missing.length > 0) {
      console.warn(
        `[IMS Chart] Module "${definition.id}" has missing dependencies: ${missing.join(', ')}. Module not registered.`
      );
      return false;
    }
  }

  moduleRegistry.set(definition.id, {
    ...definition,
    initialized: false,
  });

  return true;
}

/**
 * Initialize all registered modules.
 * Replaces FusionCharts core module initialization loop.
 */
export function initializeModules(): void {
  const api: IMSModuleAPI = {
    getModule: (id: string) => moduleRegistry.get(id),
    on: (eventType: string, handler: IMSChartEventHandler) => {
      addGlobalEventHandler(eventType, handler);
    },
    off: (eventType: string, handler: IMSChartEventHandler) => {
      removeGlobalEventHandler(eventType, handler);
    },
    dispatch: (event: IMSChartEvent) => {
      dispatchGlobalEvent(event);
    },
    getChartConfig: (_type: string) => undefined,
    registerHighlightEffect: (_name: string, _handler: unknown) => {
      // Delegated to highlight-effects.ts
    },
    getRegisteredChartTypes: () => [],
  };

  moduleRegistry.forEach((mod) => {
    if (!mod.initialized && mod.init) {
      // Check dependencies are initialized
      const depsReady = mod.dependencies?.every(depId => moduleRegistry.get(depId)?.initialized) ?? true;
      if (depsReady) {
        mod.init(api);
        mod.initialized = true;
      }
    }
  });
}

/**
 * Get a registered module.
 */
export function getModule(id: string): IMSModuleDefinition | undefined {
  return moduleRegistry.get(id);
}

/**
 * Get all registered modules of a specific type.
 */
export function getModulesByType(type: IMSModuleType): IMSModuleDefinition[] {
  return Array.from(moduleRegistry.values()).filter(mod => mod.type === type);
}

/**
 * Dispose all modules.
 */
export function disposeAllModules(): void {
  moduleRegistry.forEach((mod) => {
    if (mod.initialized && mod.dispose) {
      mod.dispose();
      mod.initialized = false;
    }
  });
  moduleRegistry.clear();
}

// ============================================================================
// Global Event Bus
// ============================================================================

type EventHandler = (event: IMSChartEvent) => void;

const globalEventHandlers: Map<string, Set<EventHandler>> = new Map();

/**
 * Add a global event handler.
 * Replaces FusionCharts.addEventListener(eventType, handler).
 */
export function addGlobalEventHandler(
  eventType: string,
  handler: EventHandler
): void {
  if (!globalEventHandlers.has(eventType)) {
    globalEventHandlers.set(eventType, new Set());
  }
  globalEventHandlers.get(eventType)!.add(handler);
}

/**
 * Remove a global event handler.
 * Replaces FusionCharts.removeEventListener(eventType, handler).
 */
export function removeGlobalEventHandler(
  eventType: string,
  handler: EventHandler
): void {
  globalEventHandlers.get(eventType)?.delete(handler);
}

/**
 * Dispatch a global event to all registered handlers.
 * Replaces FusionCharts core event dispatching.
 */
export function dispatchGlobalEvent(event: IMSChartEvent): void {
  const handlers = globalEventHandlers.get(event.eventType);
  if (handlers) {
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (err) {
        console.error(`[IMS Chart] Error in event handler for "${event.eventType}":`, err);
      }
    });
  }
}

/**
 * Remove all event handlers for a specific event type.
 */
export function clearEventHandlers(eventType?: string): void {
  if (eventType) {
    globalEventHandlers.delete(eventType);
  } else {
    globalEventHandlers.clear();
  }
}

// ============================================================================
// Chart Instance Event System
// ============================================================================

/** Chart instance event manager */
export class IMSChartEventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private chartId: string;

  constructor(chartId: string) {
    this.chartId = chartId;
  }

  /**
   * Attach event handlers to chart instance.
   * Replaces FusionCharts.attachEventHandlers(eventType, handler).
   */
  attachEventHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Attach multiple event handlers at once.
   * Replaces FusionCharts.attachEventHandlers({...}).
   */
  attachEventHandlers(handlers: Record<string, EventHandler>): void {
    Object.entries(handlers).forEach(([eventType, handler]) => {
      this.attachEventHandler(eventType, handler);
    });
  }

  /**
   * Remove event handler.
   */
  detachEventHandler(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  /**
   * Dispatch event to instance handlers and global handlers.
   * Replaces FusionCharts raiseEvent mechanism.
   */
  dispatchEvent(eventType: IMSChartEventType, data?: unknown): void {
    const event: IMSChartEvent = {
      eventType,
      chartId: this.chartId,
      data,
      timestamp: new Date(),
    };

    // Instance handlers
    const instanceHandlers = this.handlers.get(eventType);
    if (instanceHandlers) {
      instanceHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[IMS Chart] Instance event handler error for "${eventType}":`, err);
        }
      });
    }

    // Also dispatch to global handlers
    dispatchGlobalEvent(event);
  }

  /**
   * Dispose all handlers.
   */
  dispose(): void {
    this.handlers.clear();
  }
}

// ============================================================================
// Ready State Management
// ============================================================================

export type IMSReadyState = 'loading' | 'ready' | 'error';

/** Global chart system ready state */
let systemReadyState: IMSReadyState = 'loading';
const readyCallbacks: Array<() => void> = [];

/**
 * Check if chart system is ready.
 * Replaces FusionCharts.readyState check.
 */
export function getReadyState(): IMSReadyState {
  return systemReadyState;
}

/**
 * Mark chart system as ready and execute pending callbacks.
 * Replaces FusionCharts ready() internal resolution.
 */
export function setSystemReady(): void {
  systemReadyState = 'ready';
  readyCallbacks.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('[IMS Chart] Ready callback error:', err);
    }
  });
  readyCallbacks.length = 0;
}

/**
 * Register a callback to execute when chart system is ready.
 * Replaces FusionCharts.ready(callback).
 */
export function onSystemReady(callback: () => void): void {
  if (systemReadyState === 'ready') {
    callback();
  } else {
    readyCallbacks.push(callback);
  }
}

/**
 * Mark system as errored.
 */
export function setSystemError(): void {
  systemReadyState = 'error';
}

// ============================================================================
// Built-in Module Registrations
// ============================================================================

/** Register the core highlight effects module */
export function registerCoreHighlightModule(): void {
  registerModule({
    id: 'ims-highlight-effects',
    type: 'highlightEffect',
    name: 'IMS Highlight Effects',
    version: '1.0.0',
    description: 'Fadeout and highlight effects for interactive legend rollover/click',
    init: (api) => {
      // Highlight effects are already registered in highlight-effects.ts
      // This module just declares the dependency for other modules
    },
  });
}

/** Register the core renderer module */
export function registerCoreRendererModule(): void {
  registerModule({
    id: 'ims-renderer-core',
    type: 'renderer',
    name: 'IMS Chart Renderer Core',
    version: '1.0.0',
    description: 'Core chart rendering engine based on Recharts',
    dependencies: ['ims-highlight-effects'],
    init: (api) => {
      // Chart type registrations are already in chart-registry.ts
    },
  });
}

/** Register the core interaction module */
export function registerCoreInteractionModule(): void {
  registerModule({
    id: 'ims-interaction-core',
    type: 'interaction',
    name: 'IMS Chart Interaction Core',
    version: '1.0.0',
    description: 'Interactive legend, zoom/scroll, and pie slicing',
    dependencies: ['ims-highlight-effects', 'ims-renderer-core'],
    init: (api) => {
      // Interaction features are already registered
    },
  });
}

/** Register the core theme module */
export function registerCoreThemeModule(): void {
  registerModule({
    id: 'ims-theme-core',
    type: 'theme',
    name: 'IMS Chart Theme Core',
    version: '1.0.0',
    description: 'Fint theme and theme registry for chart styling (Deep Navy Blue)',
    dependencies: ['ims-renderer-core'],
    init: (_api) => {
      // Theme registration is handled in chart-themes.ts
    },
  });
}

/** Register all core modules and initialize */
export function initializeCoreModules(): void {
  registerCoreHighlightModule();
  registerCoreRendererModule();
  registerCoreInteractionModule();
  registerCoreThemeModule();
  initializeModules();
  setSystemReady();
}

// ============================================================================
// Event Type Helpers
// ============================================================================

/** Standard chart event types with typed data */
export interface IMSChartEventDataMap {
  rendered: { chartId: string };
  renderComplete: { chartId: string; dataLength: number };
  dataLoaded: { chartId: string; dataLength: number };
  dataLoadError: { chartId: string; error: string };
  dataUpdated: { chartId: string; updateType: string };
  chartClick: { chartId: string; dataIndex: number; dataPoint: unknown };
  chartMouseMove: { chartId: string; x: number; y: number };
  chartRollOver: { chartId: string; dataIndex: number };
  legendItemClicked: { chartId: string; seriesIndex: number; seriesName: string };
  legendItemRollover: { chartId: string; seriesIndex: number; seriesName: string };
  legendItemRollout: { chartId: string; seriesIndex: number };
  sliceClicked: { chartId: string; sliceIndex: number; sliceName: string };
  sliceRolledover: { chartId: string; sliceIndex: number; sliceName: string };
  sliceRolledout: { chartId: string; sliceIndex: number };
  linkClicked: { chartId: string; linkUrl: string; dataPoint: unknown };
  beforeRender: { chartId: string };
  beforeDispose: { chartId: string };
  disposed: { chartId: string };
  resize: { chartId: string; width: number; height: number };
  resized: { chartId: string; width: number; height: number };
  beforeDataUpdate: { chartId: string; updateType: string };
}

/**
 * Create a typed chart event.
 */
export function createChartEvent<K extends keyof IMSChartEventDataMap>(
  eventType: K,
  chartId: string,
  data: IMSChartEventDataMap[K]
): IMSChartEvent {
  return {
    eventType: eventType as IMSChartEventType,
    chartId,
    data,
    timestamp: new Date(),
  };
}

/**
 * Shorthand to attach legend event handlers.
 * Replaces FusionCharts attachEventHandlers for legend events.
 */
export function attachLegendEventHandlers(
  emitter: IMSChartEventEmitter,
  handlers: {
    onRollover?: (seriesIndex: number, seriesName: string) => void;
    onRollout?: (seriesIndex: number) => void;
    onClicked?: (seriesIndex: number, seriesName: string) => void;
  }
): void {
  if (handlers.onRollover) {
    emitter.attachEventHandler('legendItemRollover', (event) => {
      const data = event.data as { seriesIndex: number; seriesName: string };
      handlers.onRollover?.(data.seriesIndex, data.seriesName);
    });
  }

  if (handlers.onRollout) {
    emitter.attachEventHandler('legendItemRollout', (event) => {
      const data = event.data as { seriesIndex: number };
      handlers.onRollout?.(data.seriesIndex);
    });
  }

  if (handlers.onClicked) {
    emitter.attachEventHandler('legendItemClicked', (event) => {
      const data = event.data as { seriesIndex: number; seriesName: string };
      handlers.onClicked?.(data.seriesIndex, data.seriesName);
    });
  }
}

/**
 * Shorthand to attach slice event handlers for pie/doughnut charts.
 */
export function attachSliceEventHandlers(
  emitter: IMSChartEventEmitter,
  handlers: {
    onClicked?: (sliceIndex: number, sliceName: string) => void;
    onRolledover?: (sliceIndex: number, sliceName: string) => void;
    onRolledout?: (sliceIndex: number) => void;
  }
): void {
  if (handlers.onClicked) {
    emitter.attachEventHandler('sliceClicked', (event) => {
      const data = event.data as { sliceIndex: number; sliceName: string };
      handlers.onClicked?.(data.sliceIndex, data.sliceName);
    });
  }

  if (handlers.onRolledover) {
    emitter.attachEventHandler('sliceRolledover', (event) => {
      const data = event.data as { sliceIndex: number; sliceName: string };
      handlers.onRolledover?.(data.sliceIndex, data.sliceName);
    });
  }

  if (handlers.onRolledout) {
    emitter.attachEventHandler('sliceRolledout', (event) => {
      const data = event.data as { sliceIndex: number };
      handlers.onRolledout?.(data.sliceIndex);
    });
  }
}
