/**
 * IMS Chart Utils - Types and Configuration
 * Replaces FusionCharts jQuery Plugin v1.0.5 with Recharts-based implementation
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

import type { ReactNode } from 'react';

// ============================================================================
// Chart Type Definitions
// ============================================================================

/** Supported chart types mapping FusionCharts types to Recharts */
export type IMSChartType =
  // Single series
  | 'column2d' | 'column3d' | 'bar2d' | 'bar3d'
  | 'line' | 'area2d' | 'spline' | 'splinearea'
  | 'pie2d' | 'pie3d' | 'doughnut2d' | 'doughnut3d'
  | 'pareto2d' | 'pareto3d'
  // Multi series
  | 'mscolumn2d' | 'mscolumn3d' | 'msbar2d' | 'msbar3d'
  | 'msline' | 'msarea' | 'msspline' | 'mssplinearea'
  | 'stackedcolumn2d' | 'stackedcolumn3d' | 'stackedbar2d' | 'stackedbar3d'
  | 'stackedarea2d' | 'stackedsplinearea'
  | 'marimekko' | 'waterfall2d' | 'errorbar2d'
  // Combination
  | 'mscombi2d' | 'mscombi3d' | 'mscombidy2d' | 'msstackedcombi2d'
  | 'mscolumnline3d' | 'stackedcolumn2dlinedy'
  // XY Plot
  | 'scatter' | 'bubble' | 'zoomline' | 'zoomlinedy'
  // Gauge
  | 'angulargauge' | 'led' | 'thermometer' | 'cylinder' | 'bulb'
  // Funnel & Pyramid
  | 'funnel' | 'pyramid'
  // Radar & Polar
  | 'radar' | 'polar'
  // Treemap & Sunburst
  | 'treemap' | 'sunburst';

/** Recharts chart category */
export type IMSChartCategory =
  | 'area' | 'bar' | 'composed' | 'funnel' | 'line'
  | 'pie' | 'radar' | 'radialBar' | 'scatter' | 'treemap';

/** Map FusionCharts type to Recharts category */
export const CHART_TYPE_MAP: Record<string, IMSChartCategory> = {
  // Single series
  column2d: 'bar', column3d: 'bar', bar2d: 'bar', bar3d: 'bar',
  line: 'line', area2d: 'area', spline: 'line', splinearea: 'area',
  pie2d: 'pie', pie3d: 'pie', doughnut2d: 'pie', doughnut3d: 'pie',
  pareto2d: 'composed', pareto3d: 'composed',
  // Multi series
  mscolumn2d: 'bar', mscolumn3d: 'bar', msbar2d: 'bar', msbar3d: 'bar',
  msline: 'line', msarea: 'area', msspline: 'line', mssplinearea: 'area',
  stackedcolumn2d: 'bar', stackedcolumn3d: 'bar', stackedbar2d: 'bar', stackedbar3d: 'bar',
  stackedarea2d: 'area', stackedsplinearea: 'area',
  marimekko: 'bar', waterfall2d: 'bar', errorbar2d: 'composed',
  // Combination
  mscombi2d: 'composed', mscombi3d: 'composed', mscombidy2d: 'composed',
  msstackedcombi2d: 'composed', mscolumnline3d: 'composed',
  stackedcolumn2dlinedy: 'composed',
  // XY Plot
  scatter: 'scatter', bubble: 'scatter', zoomline: 'line', zoomlinedy: 'line',
  // Gauge
  angulargauge: 'radialBar', led: 'radialBar', thermometer: 'radialBar',
  cylinder: 'radialBar', bulb: 'radialBar',
  // Funnel & Pyramid
  funnel: 'funnel', pyramid: 'funnel',
  // Radar
  radar: 'radar', polar: 'radar',
  // Treemap
  treemap: 'treemap', sunburst: 'treemap',
};

// ============================================================================
// Deep Navy Blue Theme Colors
// ============================================================================

/** Primary chart color palette (Deep Navy Blue theme) */
export const IMS_CHART_COLORS = [
  '#1e3a5f', // Deep Navy Blue
  '#2d5a8e', // Navy Blue
  '#3b7dd8', // Medium Blue
  '#5b9bd5', // Light Blue
  '#18bc9c', // Emerald (success)
  '#f39c12', // Amber (warning)
  '#e74c3c', // Red (danger)
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#f1c40f', // Yellow
  '#e67e22', // Orange
  '#2ecc71', // Green
  '#3498db', // Sky Blue
  '#e91e63', // Pink
  '#00bcd4', // Cyan
  '#8bc34a', // Light Green
];

/** Chart color palette for dark mode */
export const IMS_CHART_COLORS_DARK = [
  '#2d5a8e', // Navy Blue
  '#3b7dd8', // Medium Blue
  '#5b9bd5', // Light Blue
  '#7bb3e0', // Lighter Blue
  '#2ee6b6', // Emerald (success)
  '#f5b041', // Amber (warning)
  '#f1948a', // Red (danger)
  '#bb8fce', // Purple
  '#48c9b0', // Teal
  '#f7dc6f', // Yellow
  '#f0b27a', // Orange
  '#58d68d', // Green
  '#5dade2', // Sky Blue
  '#f48fb1', // Pink
  '#4dd0e1', // Cyan
  '#aed581', // Light Green
];

// ============================================================================
// Chart Data Types
// ============================================================================

/** Single data point for single-series charts */
export interface IMSChartDataPoint {
  label: string;
  value: number;
  color?: string;
  toolText?: string;
  link?: string;
  dashed?: boolean;
  showValue?: boolean;
}

/** Multi-series data point */
export interface IMSMSDataPoint {
  value: number;
  color?: string;
  toolText?: string;
}

/** Category for multi-series charts */
export interface IMSChartCategory {
  label: string;
  toolText?: string;
  showLabel?: boolean;
}

/** Dataset for multi-series charts */
export interface IMSChartDataset {
  seriesName: string;
  data: IMSMSDataPoint[];
  color?: string;
  type?: 'column' | 'line' | 'area' | 'spline';
  renderAs?: string;
  parentYAxis?: 'S' | 'S2';
  showValues?: boolean;
}

/** Chart data structure */
export interface IMSChartData {
  /** Single series data */
  data?: IMSChartDataPoint[];
  /** Multi series categories */
  categories?: IMSChartCategory[];
  /** Multi series datasets */
  dataset?: IMSChartDataset[];
  /** Chart type hint */
  chartType?: 'single' | 'multi';
}

// ============================================================================
// Chart Configuration
// ============================================================================

/** Chart attributes/configuration matching FusionCharts */
export interface IMSChartConfig {
  /** Chart caption (title) */
  caption?: string;
  /** Sub-caption */
  subCaption?: string;
  /** X-axis name */
  xAxisName?: string;
  /** Y-axis name */
  yAxisName?: string;
  /** Second Y-axis name (dual axis charts) */
  yAxis2Name?: string;
  /** Number prefix (e.g., "$") */
  numberPrefix?: string;
  /** Number suffix (e.g., "%") */
  numberSuffix?: string;
  /** Show labels */
  showLabels?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Show values */
  showValues?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Label rotation */
  labelRotation?: number;
  /** Label step (show every Nth label) */
  labelStep?: number;
  /** Slanted labels */
  slantLabels?: boolean;
  /** Canvas padding */
  canvasPadding?: number;
  /** Chart background color */
  bgColor?: string;
  /** Show border */
  showBorder?: boolean;
  /** Border color */
  borderColor?: string;
  /** Border thickness */
  borderThickness?: number;
  /** Palette colors */
  paletteColors?: string[];
  /** Animation enabled */
  animation?: boolean;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Theme name */
  theme?: string;
  /** Show tooltip */
  showToolTip?: boolean;
  /** Tooltip border radius */
  toolTipBorderRadius?: number;
  /** Show X-axis line */
  showXAxisLine?: boolean;
  /** Show Y-axis line */
  showYAxisLine?: boolean;
  /** X-axis line color */
  xAxisLineColor?: string;
  /** Y-axis line color */
  yAxisLineColor?: string;
  /** Show grid lines */
  showAlternateHGridColor?: boolean;
  /** Div line color */
  divLineColor?: string;
  /** Div line alpha */
  divLineAlpha?: number;
  /** Show plot border */
  showPlotBorder?: boolean;
  /** Plot border color */
  plotBorderColor?: string;
  /** Plot border thickness */
  plotBorderThickness?: number;
  /** Use round edges (3D effect) */
  useRoundEdges?: boolean;
  /** Use 3D rendering */
  use3DLighting?: boolean;
  /** Show shadow */
  showShadow?: boolean;
  /** Interactive legend */
  interactiveLegend?: boolean;
  /** Custom tooltext */
  toolText?: string;
  /** Export enabled */
  exportEnabled?: boolean;
  /** Export filename */
  exportFileName?: string;
  /** Export formats */
  exportFormats?: string;
  /** Export at client side */
  exportAtClient?: boolean;
  /** Export handler */
  exportHandler?: string;
  /** Export action */
  exportAction?: 'download' | 'save';
  /** Export target window */
  exportTargetWindow?: '_blank' | '_self';
  /** Render at element */
  renderAt?: string;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Debug mode */
  debugMode?: boolean;
  /** Data format */
  dataFormat?: 'json' | 'xml' | 'htmltable';
  /** Data source */
  dataSource?: IMSChartData | string | HTMLTableElement;
  /** Chart type */
  type?: IMSChartType;
  /** ID */
  id?: string;
  /** Container background color */
  containerBackgroundColor?: string;
  /** Container background alpha */
  containerBackgroundAlpha?: number;
  /** Series colors override */
  seriesColors?: string[];
  /** Convert blank cells to value */
  convertBlankTo?: string | number;
  /** Label source row/column index */
  labelSource?: number;
  /** Legend source row/column index */
  legendSource?: number;
  /** Ignore columns */
  ignoreCols?: number[];
  /** Ignore rows */
  ignoreRows?: number[];
  /** Major axis (row or column) */
  major?: 'row' | 'column';
  /** Hide source table */
  hideTable?: boolean;
}

/** Default chart configuration */
export const DEFAULT_CHART_CONFIG: IMSChartConfig = {
  showLabels: true,
  showLegend: true,
  showValues: false,
  legendPosition: 'bottom',
  animation: true,
  animationDuration: 1000,
  showBorder: false,
  showToolTip: true,
  toolTipBorderRadius: 4,
  showXAxisLine: true,
  showYAxisLine: true,
  divLineAlpha: 30,
  showPlotBorder: false,
  useRoundEdges: false,
  interactiveLegend: true,
  exportEnabled: true,
  exportAction: 'download',
  paletteColors: IMS_CHART_COLORS,
  numberPrefix: '',
  numberSuffix: '',
  labelRotation: 0,
  canvasPadding: 10,
  width: '100%',
  height: 400,
  dataFormat: 'json',
  major: 'row',
  convertBlankTo: '0',
  hideTable: false,
  bgColor: 'transparent',
};

// ============================================================================
// Real-time Data Streaming Types
// ============================================================================

/** Real-time command types matching FusionCharts */
export type IMSRealtimeCommand =
  | 'feed' | 'feedData'
  | 'set' | 'setData'
  | 'setForId' | 'setDataForId'
  | 'get' | 'getData'
  | 'getForId' | 'getDataForId'
  | 'clear' | 'clearChart'
  | 'stop' | 'stopUpdate'
  | 'start' | 'restartUpdate';

/** Real-time streaming options */
export interface IMSRealtimeOptions {
  /** Stream data string or object */
  stream?: string;
  /** Data index for multi-value charts */
  index?: number | string;
  /** Data value */
  value?: number | string;
  /** Data label */
  label?: string;
  /** Data ID */
  id?: string;
  /** Update interval in ms */
  interval?: number;
  /** Maximum data points to display */
  maxDataPoints?: number;
  /** Auto-scroll when data exceeds view */
  autoScroll?: boolean;
}

/** Real-time streaming state */
export interface IMSRealtimeState {
  isStreaming: boolean;
  lastUpdate: Date | null;
  dataPoints: number;
  error: string | null;
}

// ============================================================================
// Drill-Down / Linked Charts Types
// ============================================================================

/** Drill-down link configuration */
export interface IMSDrillDownLink {
  /** Target chart type */
  type?: IMSChartType;
  /** Target chart ID */
  id?: string;
  /** Target chart width */
  width?: string | number;
  /** Target chart height */
  height?: string | number;
  /** Target data source URL or data */
  dataSource?: IMSChartData | string | (() => Promise<IMSChartData>);
  /** Target render container */
  renderAt?: string;
  /** Link handler function */
  handler?: (data: IMSChartDataPoint, linkConfig: IMSDrillDownLink) => void;
  /** Overlay configuration */
  overlay?: boolean;
}

/** Drill-down level configuration */
export interface IMSDrillDownLevel {
  /** Level configuration for linked charts */
  type?: IMSChartType;
  width?: string | number;
  height?: string | number;
  dataSource?: IMSChartData | string | (() => Promise<IMSChartData>);
  renderAt?: string;
  handler?: (data: IMSChartDataPoint, linkConfig: IMSDrillDownLink) => void;
  overlay?: boolean;
  seriesColors?: string[];
}

// ============================================================================
// Chart Event Types
// ============================================================================

/** Chart event types matching FusionCharts event model */
export type IMSChartEventType =
  | 'rendered' | 'renderComplete' | 'dataLoaded' | 'dataLoadError'
  | 'dataUpdated' | 'dataUpdateCancelled' | 'dataLoadCancelled'
  | 'beforeRender' | 'beforeDispose' | 'disposed'
  | 'resize' | 'resized'
  | 'beforeDataUpdate' | 'chartClick' | 'chartMouseMove' | 'chartRollOver'
  | 'legendItemClicked' | 'legendItemRollover' | 'legendItemRollout'
  | 'linkClicked' | 'beforeLinkedItemOpen' | 'linkedItemOpened'
  | 'beforeLinkedItemClose' | 'linkedItemClosed'
  | 'sliceClicked' | 'sliceRolledout' | 'sliceRolledover'
  | 'connectorClicked' | 'markerClicked' | 'markerRollover'
  | 'entityRollover' | 'entityClick' | 'entityRollout'
  | 'labelRollOver' | 'labelRollOut' | 'labelClick';

/** Chart event payload */
export interface IMSChartEvent {
  eventType: IMSChartEventType;
  chartId: string;
  data?: unknown;
  sender?: IMSChartRef;
  timestamp: Date;
}

/** Chart event handler */
export type IMSChartEventHandler = (event: IMSChartEvent) => void;

// ============================================================================
// Chart Reference Types
// ============================================================================

/** Chart instance reference (replaces FusionCharts object) */
export interface IMSChartRef {
  /** Chart ID */
  id: string;
  /** Chart type */
  type: IMSChartType;
  /** Current data */
  data: IMSChartData;
  /** Current config */
  config: IMSChartConfig;
  /** Set chart attribute */
  setChartAttribute: (attr: string | Record<string, unknown>, value?: unknown) => void;
  /** Get chart attribute */
  getChartAttribute: (attr: string) => unknown;
  /** Set chart data */
  setChartData: (data: IMSChartData | string, format?: string) => void;
  /** Get chart data */
  getChartData: (format?: string) => IMSChartData;
  /** Clone chart */
  clone: (options?: Partial<IMSChartConfig>) => IMSChartRef;
  /** Dispose chart */
  dispose: () => void;
  /** Resize chart */
  resizeTo: (width: string | number, height: string | number) => void;
  /** Export chart */
  exportChart: (options?: { exportFormat?: string; exportFileName?: string }) => void;
  /** Get chart type */
  chartType: () => IMSChartType;
  /** Feed real-time data */
  feedData: (stream: string) => void;
  /** Set data for index */
  setData: (value: number | string, label?: string) => void;
  /** Set data for ID */
  setDataForId: (id: string, value: number | string, label?: string) => void;
  /** Get data for index */
  getData: (index: number) => unknown;
  /** Get data for ID */
  getDataForId: (id: string) => unknown;
  /** Clear chart data */
  clearChart: () => void;
  /** Stop real-time updates */
  stopUpdate: () => void;
  /** Restart real-time updates */
  restartUpdate: () => void;
  /** Configure linked chart */
  configureLink: (config: Partial<IMSDrillDownLevel>, level?: number) => void;
}

// ============================================================================
// HTML Table Conversion Types
// ============================================================================

/** HTML Table conversion options */
export interface IMSTableConversionOptions {
  /** Major axis for data extraction */
  major?: 'row' | 'column';
  /** Use labels from table */
  useLabels?: boolean;
  /** Use legend from table */
  useLegend?: boolean;
  /** Label source row/column index (0=auto) */
  labelSource?: number;
  /** Legend source row/column index (0=auto) */
  legendSource?: number;
  /** Column indexes to ignore (1-based or negative from end) */
  ignoreCols?: number[];
  /** Row indexes to ignore (1-based or negative from end) */
  ignoreRows?: number[];
  /** Show labels on chart */
  showLabels?: boolean;
  /** Show legend on chart */
  showLegend?: boolean;
  /** Series color override */
  seriesColors?: string[];
  /** Convert blank cells to value */
  convertBlankTo?: string | number;
  /** Hide source table */
  hideTable?: boolean;
  /** Chart type hint */
  chartType?: IMSChartType;
  /** Chart attributes */
  chartAttributes?: Record<string, unknown>;
  /** Custom labels */
  labels?: Array<Record<string, unknown>>;
  /** Custom legend items */
  legend?: Array<Record<string, unknown>>;
  /** Extract by <th> header tag */
  _extractByHeaderTag?: boolean;
  /** Row label index (internal) */
  _rowLabelIndex?: number;
}

/** Table extraction result */
export interface IMSTableExtractionResult {
  data: Record<string, Record<string, number>> | null;
  chartType: 'single' | 'multi';
  labelMap: { labelObj: Record<string, string>; index: number };
  legendMap: { labelObj: Record<string, string>; index: number };
}

/** Converted chart data from table */
export interface IMSTableChartResult {
  data: IMSChartData;
  error?: string;
}

// ============================================================================
// Recharts Data Format
// ============================================================================

/** Recharts-compatible data point */
export interface IMSRechartsDataPoint {
  [key: string]: string | number | undefined;
  name?: string;
}

/** Recharts series config */
export interface IMSRechartsSeries {
  dataKey: string;
  name: string;
  color?: string;
  type?: 'monotone' | 'linear' | 'step' | 'basis';
  stackId?: string;
  yAxisId?: string;
}

/** Recharts transformed data */
export interface IMSRechartsData {
  data: IMSRechartsDataPoint[];
  series: IMSRechartsSeries[];
  chartCategory: IMSChartCategory;
}
