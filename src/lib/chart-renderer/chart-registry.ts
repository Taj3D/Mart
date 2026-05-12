/**
 * IMS Chart Renderer - Chart Type Registry & Configurations
 * Replaces FusionCharts modules.renderer.js-charts core rendering engine
 * Defines all 40+ chart types with their rendering configurations
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

// ============================================================================
// Chart Type Definitions
// ============================================================================

/** Base chart category */
export type IMSBaseCategory =
  | 'sscartesian'     // Single-series cartesian
  | 'sscartesian3d'   // Single-series 3D cartesian
  | 'ssbarcartesian'  // Single-series bar cartesian
  | 'ssbarcartesian3d'
  | 'mscartesian'     // Multi-series cartesian
  | 'mscartesian3d'
  | 'msbarcartesian'
  | 'msbarcartesian3d'
  | 'areabase'        // Area chart base
  | 'msdybasecartesian'   // Multi-series dual-y base
  | 'msdybasecartesian3d'
  | 'guageBase'       // Gauge base
  | 'scatterBase'     // Scatter base
  | 'scrollbase';     // Scroll base

/** Chart type configuration matching FusionCharts l() registrations */
export interface IMSChartTypeConfig {
  /** Friendly display name */
  friendlyName: string;
  /** Default dataset type */
  defaultDatasetType: string;
  /** Applicable dataset types */
  applicableDSList: Record<string, boolean>;
  /** Is single series */
  singleseries?: boolean;
  /** Is multi series */
  isMultiSeries?: boolean;
  /** Is 3D chart */
  is3D?: boolean;
  /** Is bar chart (horizontal) */
  isBar?: boolean;
  /** Is stacked */
  isStacked?: boolean;
  /** Is dual Y-axis */
  isDual?: boolean;
  /** Is percentage chart */
  isPercentage?: boolean;
  /** Is XY plot */
  isXY?: boolean;
  /** Has scroll */
  hasScroll?: boolean;
  /** Has legend */
  hasLegend?: boolean;
  /** Default plot shadow */
  defaultPlotShadow?: number;
  /** Standalone init */
  standaloneInit?: boolean;
  /** Credit label */
  creditLabel?: boolean;
  /** Fire group event */
  fireGroupEvent?: boolean;
  /** Base categories this chart extends */
  baseCategories: IMSBaseCategory[];
  /** Default attribute overrides */
  defaults?: Record<string, unknown>;
  /** Recharts chart type mapping */
  rechartsType: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'composed' | 'funnel' | 'treemap';
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Stack mode */
  stackMode?: 'none' | 'stacked' | 'percent';
  /** Dual Y-axis mode */
  dualAxis?: boolean;
  /** Supports zoom/scroll */
  supportsZoom?: boolean;
  /** Average scroll point width (for scroll charts) */
  avgScrollPointWidth?: number;
  /** Whether to use round edges (3D effect) */
  useRoundEdges?: boolean;
  /** Default zero plane highlighted */
  defaultZeroPlaneHighlighted?: boolean;
  /** Show values by default */
  showValues?: boolean;
  /** Whether to show plot border */
  showPlotBorder?: boolean;
}

// ============================================================================
// Chart Type Registry
// ============================================================================

const registry: Map<string, IMSChartTypeConfig> = new Map();

/** Register a chart type configuration */
export function registerChartType(type: string, config: IMSChartTypeConfig): void {
  registry.set(type, config);
}

/** Get chart type configuration */
export function getChartTypeConfig(type: string): IMSChartTypeConfig | undefined {
  return registry.get(type);
}

/** Get all registered chart types */
export function getAllChartTypes(): Map<string, IMSChartTypeConfig> {
  return new Map(registry);
}

/** Check if chart type is registered */
export function isChartTypeRegistered(type: string): boolean {
  return registry.has(type);
}

// ============================================================================
// Register All Chart Types (matching FusionCharts l() calls)
// ============================================================================

// --- Single Series Column/Bar ---

registerChartType('column2d', {
  friendlyName: 'Column Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  singleseries: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['sscartesian'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'none',
  defaultPlotShadow: 0,
  defaultZeroPlaneHighlighted: true,
  showValues: false,
  showPlotBorder: false,
});

registerChartType('column3d', {
  friendlyName: '3D Column Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true },
  singleseries: true,
  is3D: true,
  standaloneInit: true,
  creditLabel: false,
  hasLegend: false,
  fireGroupEvent: true,
  defaultPlotShadow: 1,
  defaultZeroPlaneHighlighted: false,
  baseCategories: ['sscartesian3d'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
});

registerChartType('bar2d', {
  friendlyName: 'Bar Chart',
  defaultDatasetType: 'bar2d',
  applicableDSList: { bar2d: true },
  singleseries: true,
  isBar: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['ssbarcartesian'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'none',
  showPlotBorder: false,
});

registerChartType('bar3d', {
  friendlyName: '3D Bar Chart',
  defaultDatasetType: 'bar3d',
  applicableDSList: { bar3d: true },
  singleseries: true,
  is3D: true,
  isBar: true,
  standaloneInit: true,
  creditLabel: false,
  fireGroupEvent: true,
  defaultPlotShadow: 1,
  defaultZeroPlaneHighlighted: false,
  baseCategories: ['ssbarcartesian3d'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
});

// --- Single Series Area/Line ---

registerChartType('area2d', {
  friendlyName: 'Area Chart',
  defaultDatasetType: 'area',
  singleseries: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 0,
  baseCategories: ['sscartesian', 'areabase'],
  rechartsType: 'area',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('line', {
  friendlyName: 'Line Chart',
  defaultDatasetType: 'line',
  singleseries: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['sscartesian', 'areabase'],
  rechartsType: 'line',
  layout: 'vertical',
  stackMode: 'none',
  defaults: { zeroplanethickness: 1, zeroplanealpha: 40 },
});

// --- Pareto ---

registerChartType('pareto2d', {
  friendlyName: 'Pareto Chart',
  defaultDatasetType: 'column2d',
  singleseries: true,
  isPercentage: true,
  standaloneInit: true,
  hasLegend: false,
  creditLabel: false,
  baseCategories: ['msdybasecartesian'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  defaults: { plotfillalpha: '90' },
});

registerChartType('pareto3d', {
  friendlyName: '3D Pareto Chart',
  defaultDatasetType: 'column3d',
  singleseries: true,
  is3D: true,
  isPercentage: true,
  standaloneInit: true,
  hasLegend: false,
  creditLabel: false,
  fireGroupEvent: true,
  defaultPlotShadow: 1,
  baseCategories: ['msdybasecartesian3d'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  useRoundEdges: true,
  defaults: { plotfillalpha: '90' },
});

// --- Pie/Doughnut ---

registerChartType('pie2d', {
  friendlyName: 'Pie Chart',
  defaultDatasetType: 'Pie2D',
  applicableDSList: { Pie2D: true },
  singleseries: true,
  standaloneInit: true,
  defaultPlotShadow: 1,
  hasLegend: true,
  creditLabel: false,
  baseCategories: ['guageBase'],
  rechartsType: 'pie',
  layout: 'vertical',
  stackMode: 'none',
  defaults: { plotborderthickness: 1, enableslicing: '1' },
});

registerChartType('pie3d', {
  friendlyName: '3D Pie Chart',
  defaultDatasetType: 'Pie3D',
  applicableDSList: { Pie3D: true },
  singleseries: true,
  is3D: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  fireGroupEvent: true,
  defaultPlotShadow: 0,
  baseCategories: ['guageBase'],
  rechartsType: 'pie',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
  defaults: { plotborderthickness: 0.1, alphaanimation: 1 },
});

registerChartType('doughnut2d', {
  friendlyName: 'Doughnut Chart',
  defaultDatasetType: 'Doughnut2D',
  applicableDSList: { Doughnut2D: true },
  singleseries: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  baseCategories: ['guageBase'],
  rechartsType: 'pie',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('doughnut3d', {
  friendlyName: '3D Doughnut Chart',
  defaultDatasetType: 'Doughnut3D',
  applicableDSList: { Doughnut3D: true },
  singleseries: true,
  is3D: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  baseCategories: ['guageBase'],
  rechartsType: 'pie',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
});

// --- Multi Series Column/Bar ---

registerChartType('mscolumn2d', {
  friendlyName: 'Multi-series Column Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  isMultiSeries: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['mscartesian'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('mscolumn3d', {
  friendlyName: 'Multi-series 3D Column Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true },
  isMultiSeries: true,
  is3D: true,
  standaloneInit: true,
  creditLabel: false,
  fireGroupEvent: true,
  defaultPlotShadow: 1,
  defaultZeroPlaneHighlighted: false,
  baseCategories: ['mscartesian3d'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
});

registerChartType('msbar2d', {
  friendlyName: 'Multi-series Bar Chart',
  defaultDatasetType: 'bar2d',
  applicableDSList: { bar2d: true },
  isMultiSeries: true,
  isBar: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  baseCategories: ['msbarcartesian'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'none',
});

registerChartType('msbar3d', {
  friendlyName: 'Multi-series 3D Bar Chart',
  defaultDatasetType: 'bar3d',
  applicableDSList: { bar3d: true },
  isMultiSeries: true,
  is3D: true,
  isBar: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  fireGroupEvent: true,
  defaultPlotShadow: 1,
  defaultZeroPlaneHighlighted: false,
  baseCategories: ['msbarcartesian3d'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
});

// --- Multi Series Area/Line ---

registerChartType('msarea', {
  friendlyName: 'Multi-series Area Chart',
  defaultDatasetType: 'area',
  applicableDSList: { area: true },
  isMultiSeries: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 0,
  baseCategories: ['areabase'],
  rechartsType: 'area',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('msline', {
  friendlyName: 'Multi-series Line Chart',
  defaultDatasetType: 'line',
  applicableDSList: { line: true },
  isMultiSeries: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['areabase'],
  rechartsType: 'line',
  layout: 'vertical',
  stackMode: 'none',
  defaults: { zeroplanethickness: 1, zeroplanealpha: 40 },
});

// --- Stacked Charts ---

registerChartType('stackedarea2d', {
  friendlyName: 'Stacked Area Chart',
  defaultDatasetType: 'area',
  applicableDSList: { area: true },
  isMultiSeries: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['msarea'],
  rechartsType: 'area',
  layout: 'vertical',
  stackMode: 'stacked',
  defaults: { plotfillalpha: '100', isstacked: 1 },
});

registerChartType('stackedcolumn2d', {
  friendlyName: 'Stacked Column Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  isMultiSeries: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['mscolumn2d'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'stacked',
  defaults: { isstacked: true },
});

registerChartType('stackedcolumn3d', {
  friendlyName: '3D Stacked Column Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true },
  isMultiSeries: true,
  is3D: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['mscolumn3d'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'stacked',
  useRoundEdges: true,
  showPlotBorder: false,
});

registerChartType('stackedbar2d', {
  friendlyName: 'Stacked Bar Chart',
  defaultDatasetType: 'bar2d',
  applicableDSList: { bar2d: true },
  isMultiSeries: true,
  isBar: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['msbar2d'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'stacked',
  defaults: { maxbarheight: 50 },
});

registerChartType('stackedbar3d', {
  friendlyName: '3D Stacked Bar Chart',
  defaultDatasetType: 'bar3d',
  applicableDSList: { bar3d: true },
  isMultiSeries: true,
  is3D: true,
  isBar: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['msbar3d'],
  rechartsType: 'bar',
  layout: 'horizontal',
  stackMode: 'stacked',
  useRoundEdges: true,
  showPlotBorder: false,
});

// --- Marimekko ---

registerChartType('marimekko', {
  friendlyName: 'Marimekko Chart',
  defaultDatasetType: 'marimekko',
  applicableDSList: { marimekko: true },
  isMultiSeries: true,
  isStacked: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['mscartesian'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'percent',
  defaults: { isstacked: true, showpercentvalues: 0, usepercentdistribution: 1, showsum: 1 },
});

// --- Multi-series Stacked Column ---

registerChartType('msstackedcolumn2d', {
  friendlyName: 'Multi-series Stacked Column Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  isMultiSeries: true,
  isStacked: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['mscartesian'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'stacked',
  defaults: { isstacked: true },
});

// --- Combination Charts ---

registerChartType('mscombi2d', {
  friendlyName: 'Multi-series Combination Chart',
  defaultDatasetType: 'column',
  applicableDSList: { line: true, area: true, column: true },
  isMultiSeries: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['areabase'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('mscombi3d', {
  friendlyName: 'Multi-series 3D Combination Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true, line: true, area: true },
  isMultiSeries: true,
  is3D: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['mscartesian3d', 'areabase'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
});

registerChartType('mscolumnline3d', {
  friendlyName: 'Multi-series Column and Line Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true, line: true },
  isMultiSeries: true,
  is3D: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['mscombi3d', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  useRoundEdges: true,
  showPlotBorder: false,
  defaults: { use3dlineshift: 1 },
});

registerChartType('stackedcolumn2dline', {
  friendlyName: 'Stacked Column and Line Chart',
  defaultDatasetType: 'column',
  applicableDSList: { line: true, column: true },
  isMultiSeries: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['mscombi2d', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'stacked',
  defaults: { isstacked: true, stack100percent: 0 },
});

registerChartType('stackedcolumn3dline', {
  friendlyName: 'Stacked 3D Column and Line Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true, line: true },
  isMultiSeries: true,
  is3D: true,
  isStacked: true,
  creditLabel: false,
  baseCategories: ['mscombi3d', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'stacked',
  useRoundEdges: true,
  showPlotBorder: false,
  defaults: { use3dlineshift: 1, isstacked: true, stack100percent: 0 },
});

// --- Dual Y-Axis Combination Charts ---

registerChartType('mscombidy2d', {
  friendlyName: 'Multi-series Dual Y-Axis Combination Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true, line: true, area: true },
  isMultiSeries: true,
  isDual: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['msdybasecartesian', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  defaults: { isdual: 1 },
});

registerChartType('mscolumn3dlinedy', {
  friendlyName: 'Multi-series 3D Column and Line Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true, line: true },
  isMultiSeries: true,
  is3D: true,
  isDual: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['msdybasecartesian3d', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  useRoundEdges: true,
  showPlotBorder: false,
  defaults: { use3dlineshift: 1, isdual: true },
});

registerChartType('stackedcolumn3dlinedy', {
  friendlyName: 'Stacked 3D Column and Line Chart',
  defaultDatasetType: 'column3d',
  applicableDSList: { column3d: true, line: true },
  isMultiSeries: true,
  is3D: true,
  isDual: true,
  isStacked: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  baseCategories: ['msdybasecartesian3d', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'stacked',
  dualAxis: true,
  useRoundEdges: true,
  showPlotBorder: false,
  defaults: { use3dlineshift: 1, isdual: true, isstacked: true },
});

registerChartType('msstackedcolumn2dlinedy', {
  friendlyName: 'Multi-series Dual Y-Axis Stacked Column and Line Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  isMultiSeries: true,
  isDual: true,
  isStacked: true,
  standaloneInit: true,
  creditLabel: false,
  baseCategories: ['msdybasecartesian', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'stacked',
  dualAxis: true,
  defaults: { isdual: true, haslineset: true, isstacked: true },
});

// --- Scroll Charts ---

registerChartType('scrollcolumn2d', {
  friendlyName: 'Scrollable Multi-series Column Chart',
  defaultDatasetType: 'scrollcolumn2d',
  applicableDSList: { scrollcolumn2d: true },
  isMultiSeries: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  avgScrollPointWidth: 40,
  baseCategories: ['scrollbase'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'none',
  supportsZoom: true,
  defaults: { canvasborderthickness: 1 },
});

registerChartType('scrollarea2d', {
  friendlyName: 'Scrollable Multi-series Area Chart',
  defaultDatasetType: 'scrollarea2d',
  applicableDSList: { scrollarea2d: true },
  isMultiSeries: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 0,
  avgScrollPointWidth: 75,
  baseCategories: ['scrollbase', 'areabase'],
  rechartsType: 'area',
  layout: 'vertical',
  stackMode: 'none',
  supportsZoom: true,
  defaults: { canvasborderthickness: 1 },
});

registerChartType('scrollline2d', {
  friendlyName: 'Scrollable Multi-series Line Chart',
  defaultDatasetType: 'line',
  applicableDSList: { line: true },
  isMultiSeries: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  defaultPlotShadow: 1,
  avgScrollPointWidth: 75,
  baseCategories: ['scrollbase', 'areabase'],
  rechartsType: 'line',
  layout: 'vertical',
  stackMode: 'none',
  supportsZoom: true,
  defaults: { canvasborderthickness: 1, zeroplanethickness: 1, zeroplanealpha: 40 },
});

registerChartType('scrollstackedcolumn2d', {
  friendlyName: 'Scrollable Stacked Column Chart',
  defaultDatasetType: 'column',
  applicableDSList: { column: true },
  isMultiSeries: true,
  isStacked: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  avgScrollPointWidth: 75,
  baseCategories: ['scrollbase', 'stackedcolumn2d'],
  rechartsType: 'bar',
  layout: 'vertical',
  stackMode: 'stacked',
  supportsZoom: true,
  defaults: { canvasborderthickness: 1 },
});

registerChartType('scrollcombi2d', {
  friendlyName: 'Scrollable Combination Chart',
  defaultDatasetType: 'column',
  applicableDSList: { area: true, line: true, column: true },
  isMultiSeries: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  avgScrollPointWidth: 40,
  baseCategories: ['scrollbase', 'msarea'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  supportsZoom: true,
  defaults: { canvasborderthickness: 1 },
});

registerChartType('scrollcombidy2d', {
  friendlyName: 'Scrollable Dual Y-Axis Combination Chart',
  defaultDatasetType: 'column',
  applicableDSList: { area: true, line: true, column: true },
  isMultiSeries: true,
  isDual: true,
  hasScroll: true,
  standaloneInit: true,
  creditLabel: false,
  avgScrollPointWidth: 40,
  baseCategories: ['mscombidy2d', 'areabase'],
  rechartsType: 'composed',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  supportsZoom: true,
  defaults: { canvasborderthickness: 1, isdual: true },
});

// --- Scatter/Bubble ---

registerChartType('scatter', {
  friendlyName: 'Scatter Chart',
  defaultDatasetType: 'Scatter',
  applicableDSList: { Scatter: true },
  isMultiSeries: true,
  isXY: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  defaultZeroPlaneHighlighted: false,
  baseCategories: ['scatterBase'],
  rechartsType: 'scatter',
  layout: 'vertical',
  stackMode: 'none',
});

registerChartType('bubble', {
  friendlyName: 'Bubble Chart',
  defaultDatasetType: 'bubble',
  applicableDSList: { bubble: true },
  isMultiSeries: true,
  isXY: true,
  standaloneInit: true,
  hasLegend: true,
  creditLabel: false,
  baseCategories: ['scatterBase'],
  rechartsType: 'scatter',
  layout: 'vertical',
  stackMode: 'none',
});

// --- Zoom Line ---

registerChartType('zoomline', {
  friendlyName: 'Zoomable and Panable Multi-series Line Chart',
  defaultDatasetType: 'zoomline',
  applicableDSList: { zoomline: true },
  isMultiSeries: true,
  standaloneInit: true,
  creditLabel: false,
  hasScroll: true,
  baseCategories: ['msline'],
  rechartsType: 'line',
  layout: 'vertical',
  stackMode: 'none',
  supportsZoom: true,
  defaults: {
    showValues: 0,
    zeroplanethickness: 1,
    zeroplanealpha: 40,
    canvasborderthickness: 1,
  },
});

registerChartType('zoomlinedy', {
  friendlyName: 'Zoomable and Panable Multi-series Dual-axis Line Chart',
  defaultDatasetType: 'zoomline',
  applicableDSList: { zoomline: true },
  isMultiSeries: true,
  isDual: true,
  standaloneInit: true,
  creditLabel: false,
  hasScroll: true,
  baseCategories: ['zoomline'],
  rechartsType: 'line',
  layout: 'vertical',
  stackMode: 'none',
  dualAxis: true,
  supportsZoom: true,
  defaults: { isdual: true },
});

// ============================================================================
// Helper Functions
// ============================================================================

/** Get the Recharts chart type for a FusionCharts type */
export function getRechartsType(fusionChartType: string): string {
  const config = registry.get(fusionChartType);
  return config?.rechartsType || 'bar';
}

/** Check if chart type is single series */
export function isSingleSeries(type: string): boolean {
  return registry.get(type)?.singleseries ?? false;
}

/** Check if chart type is multi series */
export function isMultiSeries(type: string): boolean {
  return registry.get(type)?.isMultiSeries ?? false;
}

/** Check if chart type is 3D */
export function is3DChart(type: string): boolean {
  return registry.get(type)?.is3D ?? false;
}

/** Check if chart type is bar (horizontal) */
export function isBarChart(type: string): boolean {
  return registry.get(type)?.isBar ?? false;
}

/** Check if chart type is stacked */
export function isStackedChart(type: string): boolean {
  return registry.get(type)?.isStacked ?? false;
}

/** Check if chart type is dual Y-axis */
export function isDualAxisChart(type: string): boolean {
  return registry.get(type)?.isDual ?? false;
}

/** Check if chart type supports zoom */
export function supportsZoom(type: string): boolean {
  return registry.get(type)?.supportsZoom ?? false;
}

/** Get the stack mode for a chart type */
export function getStackMode(type: string): 'none' | 'stacked' | 'percent' {
  return registry.get(type)?.stackMode ?? 'none';
}

/** Get all chart type names as an array */
export function getChartTypeNames(): string[] {
  return Array.from(registry.keys());
}

/** Get chart type names grouped by category */
export function getChartTypesByCategory(): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    'Single Series': [],
    'Pie & Doughnut': [],
    'Multi Series': [],
    'Stacked': [],
    'Combination': [],
    'Dual Y-Axis': [],
    'Scroll & Zoom': [],
    'Scatter & Bubble': [],
  };

  registry.forEach((config, type) => {
    if (type.startsWith('pie') || type.startsWith('doughnut')) {
      groups['Pie & Doughnut'].push(type);
    } else if (type.startsWith('scroll') || type.startsWith('zoom')) {
      groups['Scroll & Zoom'].push(type);
    } else if (type.startsWith('scatter') || type.startsWith('bubble')) {
      groups['Scatter & Bubble'].push(type);
    } else if (config.isDual) {
      groups['Dual Y-Axis'].push(type);
    } else if (config.isStacked) {
      groups['Stacked'].push(type);
    } else if (type.startsWith('mscombi') || type.startsWith('mscolumnline') || type.startsWith('stackedcolumn') && type.includes('line')) {
      groups['Combination'].push(type);
    } else if (config.singleseries) {
      groups['Single Series'].push(type);
    } else if (config.isMultiSeries) {
      groups['Multi Series'].push(type);
    }
  });

  return groups;
}

/** Composed chart dataset type resolution */
export function resolveDatasetRenderAs(
  renderAs: string | undefined,
  defaultType: string,
  applicableDSList: Record<string, boolean>,
  isDual?: boolean,
  parentYAxis?: string
): 'column' | 'line' | 'area' {
  const type = (renderAs || defaultType).toLowerCase();

  if (applicableDSList[type]) {
    if (type.includes('area')) return 'area';
    if (type.includes('line')) return 'line';
    if (type.includes('column') || type.includes('bar')) return 'column';
  }

  // Dual Y-axis: secondary axis defaults to line
  if (isDual && parentYAxis?.toLowerCase() === 's') {
    return 'line';
  }

  return 'column';
}
