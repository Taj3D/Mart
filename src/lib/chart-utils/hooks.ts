/**
 * IMS Chart Utils - React Hooks
 * Hooks for chart operations, real-time streaming, drill-down, and events
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  IMSChartType,
  IMSChartConfig,
  IMSChartData,
  IMSChartDataPoint,
  IMSDrillDownLevel,
  IMSDrillDownLink,
  IMSChartEvent,
  IMSChartEventHandler,
  IMSRealtimeState,
  IMSTableConversionOptions,
} from './types';
import { convertTableToChartData, convertArrayToChartData, convertFusionJSONToChartData } from './table-to-chart';

// ============================================================================
// useChart Hook - Main chart management hook
// ============================================================================

interface UseChartOptions {
  /** Initial chart type */
  type?: IMSChartType;
  /** Initial chart data */
  data?: IMSChartData;
  /** Chart configuration */
  config?: Partial<IMSChartConfig>;
  /** Auto-resize on window resize */
  autoResize?: boolean;
}

interface UseChartReturn {
  /** Current chart data */
  data: IMSChartData;
  /** Current chart type */
  type: IMSChartType;
  /** Current chart config */
  config: IMSChartConfig;
  /** Update chart data */
  setData: (data: IMSChartData) => void;
  /** Update chart type */
  setType: (type: IMSChartType) => void;
  /** Update chart config */
  setConfig: (config: Partial<IMSChartConfig>) => void;
  /** Add data points */
  addDataPoints: (points: IMSChartDataPoint | IMSChartDataPoint[]) => void;
  /** Remove data point by index */
  removeDataPoint: (index: number) => void;
  /** Clear all data */
  clearData: () => void;
  /** Update a specific data point */
  updateDataPoint: (index: number, point: Partial<IMSChartDataPoint>) => void;
  /** Set chart attribute (matching FusionCharts setChartAttribute) */
  setChartAttribute: (attr: string | Record<string, unknown>, value?: unknown) => void;
  /** Get chart attribute */
  getChartAttribute: (attr: string) => unknown;
  /** Clone current chart config with overrides */
  cloneConfig: (overrides?: Partial<IMSChartConfig>) => IMSChartConfig;
  /** Export chart as PNG */
  exportPNG: (chartId: string, fileName?: string) => void;
  /** Is data empty */
  isEmpty: boolean;
  /** Data point count */
  dataCount: number;
}

/**
 * Main chart management hook.
 * Replaces FusionCharts jQuery plugin methods: insertFusionCharts, updateFusionCharts, attrFusionCharts, etc.
 *
 * @example
 * const chart = useChart({
 *   type: 'column2d',
 *   data: { data: [{ label: 'Jan', value: 100 }], chartType: 'single' },
 * });
 *
 * chart.addDataPoints({ label: 'Feb', value: 200 });
 * chart.setType('line');
 */
export function useChart(options: UseChartOptions = {}): UseChartReturn {
  const { type: initialType = 'column2d', data: initialData, config: initialConfig } = options;

  const [data, setDataState] = useState<IMSChartData>(initialData || { data: [], chartType: 'single' });
  const [type, setTypeState] = useState<IMSChartType>(initialType);
  const [config, setConfigState] = useState<IMSChartConfig>({
    showLabels: true,
    showLegend: true,
    animation: true,
    paletteColors: undefined,
    ...initialConfig,
  } as IMSChartConfig);

  const setData = useCallback((newData: IMSChartData) => {
    setDataState(newData);
  }, []);

  const setType = useCallback((newType: IMSChartType) => {
    setTypeState(newType);
  }, []);

  const setConfig = useCallback((partial: Partial<IMSChartConfig>) => {
    setConfigState(prev => ({ ...prev, ...partial }));
  }, []);

  const addDataPoints = useCallback((points: IMSChartDataPoint | IMSChartDataPoint[]) => {
    setDataState(prev => {
      const arr = Array.isArray(points) ? points : [points];
      const existing = prev.data || [];
      return { ...prev, data: [...existing, ...arr] };
    });
  }, []);

  const removeDataPoint = useCallback((index: number) => {
    setDataState(prev => {
      const existing = prev.data || [];
      return { ...prev, data: existing.filter((_, i) => i !== index) };
    });
  }, []);

  const clearData = useCallback(() => {
    setDataState({ data: [], chartType: 'single' });
  }, []);

  const updateDataPoint = useCallback((index: number, point: Partial<IMSChartDataPoint>) => {
    setDataState(prev => {
      const existing = prev.data || [];
      const updated = existing.map((p, i) => i === index ? { ...p, ...point } : p);
      return { ...prev, data: updated };
    });
  }, []);

  const setChartAttribute = useCallback((attr: string | Record<string, unknown>, value?: unknown) => {
    if (typeof attr === 'string') {
      setConfigState(prev => ({ ...prev, [attr]: value }));
    } else {
      setConfigState(prev => ({ ...prev, ...attr }));
    }
  }, []);

  const getChartAttribute = useCallback((attr: string): unknown => {
    return (config as Record<string, unknown>)[attr];
  }, [config]);

  const cloneConfig = useCallback((overrides?: Partial<IMSChartConfig>): IMSChartConfig => {
    return { ...config, ...overrides };
  }, [config]);

  const exportPNG = useCallback((chartId: string, fileName?: string) => {
    const container = document.querySelector(`[data-chart-id="${chartId}"] .recharts-wrapper`);
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = fileName || `chart-${chartId}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  const isEmpty = useMemo(() => {
    const points = data.data || [];
    return points.length === 0;
  }, [data]);

  const dataCount = useMemo(() => {
    return (data.data || []).length;
  }, [data]);

  return {
    data, type, config,
    setData, setType, setConfig,
    addDataPoints, removeDataPoint, clearData, updateDataPoint,
    setChartAttribute, getChartAttribute,
    cloneConfig, exportPNG,
    isEmpty, dataCount,
  };
}

// ============================================================================
// useChartStream Hook - Real-time data streaming
// ============================================================================

interface UseChartStreamOptions {
  /** Update interval in ms */
  interval?: number;
  /** Maximum data points */
  maxDataPoints?: number;
  /** Auto-start streaming */
  autoStart?: boolean;
  /** Data feed function */
  feedFn: () => IMSChartDataPoint | IMSChartDataPoint[] | null;
}

interface UseChartStreamReturn {
  /** Streamed data points */
  data: IMSChartDataPoint[];
  /** Real-time state */
  state: IMSRealtimeState;
  /** Start streaming */
  start: () => void;
  /** Stop streaming */
  stop: () => void;
  /** Toggle streaming */
  toggle: () => void;
  /** Manual feed data */
  feed: (points: IMSChartDataPoint | IMSChartDataPoint[]) => void;
  /** Clear all data */
  clear: () => void;
  /** Is currently streaming */
  isStreaming: boolean;
}

/**
 * Real-time chart data streaming hook.
 * Replaces FusionCharts streamFusionChartsData and realtime commands.
 *
 * @example
 * const stream = useChartStream({
 *   interval: 2000,
 *   feedFn: () => ({ label: new Date().toLocaleTimeString(), value: Math.random() * 100 }),
 * });
 *
 * stream.start();
 * // Data updates every 2 seconds
 */
export function useChartStream(options: UseChartStreamOptions): UseChartStreamReturn {
  const { interval = 3000, maxDataPoints = 50, autoStart = false, feedFn } = options;

  const [data, setData] = useState<IMSChartDataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(autoStart);
  const [state, setState] = useState<IMSRealtimeState>({
    isStreaming: autoStart,
    lastUpdate: null,
    dataPoints: 0,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const feed = useCallback((points: IMSChartDataPoint | IMSChartDataPoint[]) => {
    const arr = Array.isArray(points) ? points : [points];
    setData(prev => {
      const updated = [...prev, ...arr];
      return updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated;
    });
    setState(prev => ({
      ...prev,
      lastUpdate: new Date(),
      dataPoints: prev.dataPoints + arr.length,
    }));
  }, [maxDataPoints]);

  const start = useCallback(() => {
    setIsStreaming(true);
    setState(prev => ({ ...prev, isStreaming: true }));
  }, []);

  const stop = useCallback(() => {
    setIsStreaming(false);
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  const toggle = useCallback(() => {
    setIsStreaming(prev => !prev);
    setState(prev => ({ ...prev, isStreaming: !prev.isStreaming }));
  }, []);

  const clear = useCallback(() => {
    setData([]);
    setState(prev => ({ ...prev, dataPoints: 0, lastUpdate: null }));
  }, []);

  useEffect(() => {
    if (isStreaming && feedFn) {
      intervalRef.current = setInterval(() => {
        try {
          const newData = feedFn();
          if (newData) {
            feed(newData);
          }
        } catch (err) {
          setState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Stream error',
          }));
        }
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming, feedFn, interval, feed]);

  return { data, state, start, stop, toggle, feed, clear, isStreaming };
}

// ============================================================================
// useChartDrillDown Hook - Drill-down / Linked charts
// ============================================================================

interface UseChartDrillDownOptions {
  /** Drill-down level configurations */
  levels: IMSDrillDownLevel[];
  /** Callback when drill-down occurs */
  onDrillDown?: (level: number, data: IMSChartDataPoint, link: IMSDrillDownLink) => void;
  /** Callback when drilling back up */
  onDrillUp?: (level: number) => void;
}

interface UseChartDrillDownReturn {
  /** Current drill-down level (0 = root) */
  currentLevel: number;
  /** Drill-down history for back navigation */
  history: Array<{ data: IMSChartData; type: IMSChartType; level: number }>;
  /** Is at root level */
  isAtRoot: boolean;
  /** Maximum drill level reached */
  maxLevelReached: number;
  /** Drill down to next level */
  drillDown: (data: IMSChartDataPoint) => void;
  /** Drill back up one level */
  drillUp: () => void;
  /** Reset to root level */
  reset: () => void;
  /** Current level config */
  currentLevelConfig: IMSDrillDownLevel | null;
}

/**
 * Drill-down chart navigation hook.
 * Replaces FusionCharts drillDownFusionChartsTo and configureLink.
 *
 * @example
 * const drillDown = useChartDrillDown({
 *   levels: [
 *     { type: 'mscolumn2d', dataSource: { ... } },
 *     { type: 'line', dataSource: { ... } },
 *   ],
 *   onDrillDown: (level, data) => console.log(`Drilled to level ${level}`, data),
 * });
 */
export function useChartDrillDown(options: UseChartDrillDownOptions): UseChartDrillDownReturn {
  const { levels, onDrillDown, onDrillUp } = options;

  const [currentLevel, setCurrentLevel] = useState(0);
  const [maxLevelReached, setMaxLevelReached] = useState(0);
  const [history, setHistory] = useState<Array<{ data: IMSChartData; type: IMSChartType; level: number }>>([]);

  const drillDown = useCallback((data: IMSChartDataPoint) => {
    if (currentLevel >= levels.length) return;

    const levelConfig = levels[currentLevel];
    onDrillDown?.(currentLevel + 1, data, {
      type: levelConfig.type,
      dataSource: levelConfig.dataSource,
      renderAt: levelConfig.renderAt,
      handler: levelConfig.handler,
    });

    setCurrentLevel(prev => prev + 1);
    setMaxLevelReached(prev => Math.max(prev, currentLevel + 1));
  }, [currentLevel, levels, onDrillDown]);

  const drillUp = useCallback(() => {
    if (currentLevel <= 0) return;
    setCurrentLevel(prev => prev - 1);
    setHistory(prev => prev.slice(0, -1));
    onDrillUp?.(currentLevel - 1);
  }, [currentLevel, onDrillUp]);

  const reset = useCallback(() => {
    setCurrentLevel(0);
    setHistory([]);
  }, []);

  const isAtRoot = currentLevel === 0;
  const currentLevelConfig = currentLevel < levels.length ? levels[currentLevel] : null;

  return {
    currentLevel, history, isAtRoot, maxLevelReached,
    drillDown, drillUp, reset, currentLevelConfig,
  };
}

// ============================================================================
// useTableToChart Hook - Convert HTML table to chart data
// ============================================================================

interface UseTableToChartOptions extends IMSTableConversionOptions {
  /** Auto-convert on mount */
  autoConvert?: boolean;
}

interface UseTableToChartReturn {
  /** Converted chart data */
  chartData: IMSChartData | null;
  /** Conversion error */
  error: string | null;
  /** Convert from table element */
  convertFromTable: (table: HTMLTableElement | string) => void;
  /** Convert from 2D array */
  convertFromArray: (data: (string | number)[][]) => void;
  /** Convert from FusionCharts JSON */
  convertFromJSON: (json: Record<string, unknown>) => void;
  /** Clear converted data */
  clear: () => void;
}

/**
 * HTML table to chart data conversion hook.
 * Replaces FusionCharts convertToFusionCharts.
 *
 * @example
 * const converter = useTableToChart({ chartType: 'column2d', major: 'row' });
 * converter.convertFromTable('myTable');
 * // chartData is now ready for IMSChart component
 */
export function useTableToChart(options: UseTableToChartOptions = {}): UseTableToChartReturn {
  const [chartData, setChartData] = useState<IMSChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertFromTable = useCallback((table: HTMLTableElement | string) => {
    const result = convertTableToChartData(table, options);
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setChartData(result.data);
    }
  }, [options]);

  const convertFromArray = useCallback((data: (string | number)[][]) => {
    try {
      setError(null);
      setChartData(convertArrayToChartData(data, options));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
    }
  }, [options]);

  const convertFromJSON = useCallback((json: Record<string, unknown>) => {
    try {
      setError(null);
      setChartData(convertFusionJSONToChartData(json as Parameters<typeof convertFusionJSONToChartData>[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON conversion error');
    }
  }, []);

  const clear = useCallback(() => {
    setChartData(null);
    setError(null);
  }, []);

  return { chartData, error, convertFromTable, convertFromArray, convertFromJSON, clear };
}

// ============================================================================
// useChartEvents Hook - Chart event management
// ============================================================================

interface UseChartEventsReturn {
  /** Subscribe to chart events */
  addEventListener: (eventType: string, handler: IMSChartEventHandler) => void;
  /** Unsubscribe from chart events */
  removeEventListener: (eventType: string, handler: IMSChartEventHandler) => void;
  /** Dispatch a chart event */
  dispatchEvent: (event: IMSChartEvent) => void;
  /** Remove all event listeners */
  removeAllListeners: () => void;
}

/**
 * Chart event management hook.
 * Replaces FusionCharts jQuery event bridging.
 *
 * @example
 * const events = useChartEvents();
 * events.addEventListener('chartClick', (e) => console.log('Clicked!', e));
 * events.dispatchEvent({ eventType: 'chartClick', chartId: 'chart1', timestamp: new Date() });
 */
export function useChartEvents(): UseChartEventsReturn {
  const listenersRef = useRef<Map<string, Set<IMSChartEventHandler>>>(new Map());

  const addEventListener = useCallback((eventType: string, handler: IMSChartEventHandler) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(handler);
  }, []);

  const removeEventListener = useCallback((eventType: string, handler: IMSChartEventHandler) => {
    listenersRef.current.get(eventType)?.delete(handler);
  }, []);

  const dispatchEvent = useCallback((event: IMSChartEvent) => {
    // Fire specific event listeners
    listenersRef.current.get(event.eventType)?.forEach(handler => handler(event));
    // Fire wildcard listeners
    listenersRef.current.get('*')?.forEach(handler => handler(event));
  }, []);

  const removeAllListeners = useCallback(() => {
    listenersRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.clear();
    };
  }, []);

  return { addEventListener, removeEventListener, dispatchEvent, removeAllListeners };
}
