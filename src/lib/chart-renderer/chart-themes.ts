/**
 * IMS Chart Renderer - Theme System & Fint Theme
 * Replaces FusionCharts.register("theme", { name: "fint", theme: {...} })
 * Converts FusionCharts "fint" (flat/intelligent) theme to Recharts-compatible
 * TypeScript theme system with Deep Navy Blue color scheme
 *
 * Converted from: FusionCharts.register("theme", { name: "fint", theme: { base, geo, pie2d, ... } })
 * Original palette: #0075c2 (blue), #1aaf5d (green), #f2c500 (yellow), #f45b00 (orange), #8e0000 (red)
 * Converted palette: Deep Navy Blue (#1e3a5f, #2d5a8e, #3b7dd8, #5b9bd5, #18bc9c, #f39c12, #e74c3c)
 *
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

import { IMS_CHART_COLORS, IMS_CHART_COLORS_DARK } from '../chart-utils/types';
import type { IMSChartType } from '../chart-utils/types';

// ============================================================================
// Theme Type Definitions
// ============================================================================

/** Chart-level theme attributes (replaces FusionCharts chart: {} in theme) */
export interface IMSChartThemeAttributes {
  /** Palette colors for series */
  paletteColors?: string[];
  /** Label display mode */
  labelDisplay?: 'auto' | 'wrap' | 'stagger' | 'rotate' | 'none';
  /** Base font color */
  baseFontColor?: string;
  /** Base font family */
  baseFont?: string;
  /** Caption font size */
  captionFontSize?: number;
  /** Sub-caption font size */
  subcaptionFontSize?: number;
  /** Sub-caption bold */
  subcaptionFontBold?: boolean;
  /** Show border */
  showBorder?: boolean;
  /** Background color */
  bgColor?: string;
  /** Show shadow */
  showShadow?: boolean;
  /** Canvas background color */
  canvasBgColor?: string;
  /** Show canvas border */
  showCanvasBorder?: boolean;
  /** Use plot gradient color */
  usePlotGradientColor?: boolean;
  /** Use round edges (3D effect) */
  useRoundEdges?: boolean;
  /** Show plot border */
  showPlotBorder?: boolean;
  /** Show alternate horizontal grid color */
  showAlternateHGridColor?: boolean;
  /** Show alternate vertical grid color */
  showAlternateVGridColor?: boolean;
  /** Tooltip text color */
  toolTipColor?: string;
  /** Tooltip border thickness */
  toolTipBorderThickness?: number;
  /** Tooltip background color */
  toolTipBgColor?: string;
  /** Tooltip background alpha (0-100) */
  toolTipBgAlpha?: number;
  /** Tooltip border radius */
  toolTipBorderRadius?: number;
  /** Tooltip padding */
  toolTipPadding?: number;
  /** Legend background alpha */
  legendBgAlpha?: number;
  /** Legend border alpha */
  legendBorderAlpha?: number;
  /** Legend shadow */
  legendShadow?: boolean;
  /** Legend item font size */
  legendItemFontSize?: number;
  /** Legend item font color */
  legendItemFontColor?: string;
  /** Legend caption font size */
  legendCaptionFontSize?: number;
  /** Division line alpha (0-100) */
  divlineAlpha?: number;
  /** Division line color */
  divlineColor?: string;
  /** Division line thickness */
  divlineThickness?: number;
  /** Division line is dashed */
  divLineIsDashed?: boolean;
  /** Division line dash length */
  divLineDashLen?: number;
  /** Division line gap length */
  divLineGapLen?: number;
  /** Scroll height */
  scrollheight?: number;
  /** Flat scroll bars */
  flatScrollBars?: boolean;
  /** Scroll show buttons */
  scrollShowButtons?: boolean;
  /** Scroll color */
  scrollColor?: string;
  /** Show hover effect */
  showHoverEffect?: boolean;
  /** Value font size */
  valueFontSize?: number;
  /** Show X-axis line */
  showXAxisLine?: boolean;
  /** X-axis line thickness */
  xAxisLineThickness?: number;
  /** X-axis line color */
  xAxisLineColor?: string;
  /** Show Y-axis line */
  showYAxisLine?: boolean;
  /** Y-axis line thickness */
  yAxisLineThickness?: number;
  /** Y-axis line color */
  yAxisLineColor?: string;
  /** Place values inside plot */
  placeValuesInside?: boolean;
  /** Use 3D lighting */
  use3DLighting?: boolean;
  /** Value font color */
  valueFontColor?: string;
  /** Caption padding */
  captionPadding?: number;
  /** Line thickness (line/spline charts) */
  lineThickness?: number;
  /** Value background color */
  valueBgColor?: string;
  /** Value background alpha */
  valueBgAlpha?: number;
  /** Value border padding */
  valueBorderPadding?: number;
  /** Value border radius */
  valueBorderRadius?: number;
  /** Show values */
  showValues?: boolean;
  /** Rotate values */
  rotateValues?: boolean;
  /** Center label font size (doughnut) */
  centerLabelFontSize?: number;
  /** Center label bold (doughnut) */
  centerLabelBold?: boolean;
  /** Center label font color (doughnut) */
  centerLabelFontColor?: string;
  /** Plot fill hover color */
  plotFillHoverColor?: string;
  /** Plot fill hover alpha (0-100) */
  plotFillHoverAlpha?: number;
  /** Show plot border on hover */
  showplotborder?: boolean;
  /** Gauge fill mix */
  gaugeFillMix?: string;
  /** Show tick values */
  showTickValues?: boolean;
  /** Major tick mark height */
  majorTMHeight?: number;
  /** Major tick mark thickness */
  majorTMThickness?: number;
  /** Major tick mark color */
  majorTMColor?: string;
  /** Minor tick mark number */
  minorTMNumber?: number;
  /** Tick value distance */
  tickValueDistance?: number;
  /** Value font bold */
  valueFontBold?: boolean;
  /** Gauge inner radius */
  gaugeInnerRadius?: string;
  /** Pivot fill color */
  pivotFillColor?: string;
  /** Pivot radius */
  pivotRadius?: number;
  /** Pointer fill color */
  pointerFillColor?: string;
  /** Gauge fill color */
  gaugeFillColor?: string;
  /** Cylinder fill color */
  cylFillColor?: string;
  /** Spark line color */
  linecolor?: string;
  /** Spark plot fill color */
  plotFillColor?: string;
  /** Win color (spark win/loss) */
  winColor?: string;
  /** Loss color (spark win/loss) */
  lossColor?: string;
  /** Draw color (spark win/loss) */
  drawColor?: string;
  /** Score less color (spark win/loss) */
  scoreLessColor?: string;
  /** Target color (bullet) */
  targetColor?: string;
  /** Connector color (maps) */
  connectorColor?: string;
  /** Connector thickness (maps) */
  connectorThickness?: number;
  /** Marker fill hover alpha (maps) */
  markerFillHoverAlpha?: number;
  /** Vertical line dashed (scatter/bubble) */
  verticalLineDashed?: boolean;
  /** Vertical line dash length */
  verticalLineDashLen?: number;
  /** Vertical line dash gap */
  verticalLineDashGap?: number;
  /** Vertical line thickness */
  verticalLineThickness?: number;
  /** Vertical line color */
  verticalLineColor?: string;
  /** Fill color (maps) */
  fillColor?: string;
  /** Show labels (maps) */
  showLabels?: boolean;
  /** Border color */
  borderColor?: string;
  /** Border thickness */
  borderThickness?: number;
  /** Border alpha (0-100) */
  borderAlpha?: number;
  /** Entity fill hover color (maps) */
  entityFillhoverColor?: string;
  /** Entity fill hover alpha (maps) */
  entityFillhoverAlpha?: number;
}

/** Dynamic data attribute generator function (for pie/doughnut alpha calculation) */
export type IMSDataAttributeFn = (
  /** Data point index */
  dataIndex: number,
  /** Unused placeholder (original FusionCharts passed axis length) */
  _axisLength?: number,
  /** Total number of data points */
  totalPoints?: number
) => Record<string, unknown>;

/** Dataset-level theme attributes */
export interface IMSDatasetThemeAttributes {
  /** Dataset overrides (empty = inherit from chart) */
  [key: string]: unknown;
}

/** Trendline theme attributes */
export interface IMSTrendlineThemeAttributes {
  /** Trendline overrides (empty = inherit) */
  [key: string]: unknown;
}

/** Category theme attributes (scatter/bubble) */
export interface IMSCategoryThemeAttributes {
  /** Vertical line dashed */
  verticalLineDashed?: boolean;
  verticalLineDashLen?: number;
  verticalLineDashGap?: number;
  verticalLineThickness?: number;
  verticalLineColor?: string;
  /** Category placeholder */
  category?: Array<Record<string, unknown>>;
}

/** VTrendline theme attributes */
export interface IMSVTrendlineThemeAttributes {
  /** Line attributes */
  line?: Array<{ alpha?: string }>;
}

/** Dial theme attributes (angular gauge) */
export interface IMSDialThemeAttributes {
  /** Dial base width */
  baseWidth?: number;
  /** Dial rear extension */
  rearExtension?: number;
  /** Dial background color */
  bgColor?: string;
  /** Dial background alpha */
  bgAlpha?: number;
  /** Dial border color */
  borderColor?: string;
  /** Dial hover alpha */
  bgHoverAlpha?: number;
}

/** Pointer theme attributes (horizontal linear gauge) */
export interface IMSPointerThemeAttributes {
  /** Pointer overrides */
  [key: string]: unknown;
}

/** Complete theme for a specific chart type */
export interface IMSChartTypeTheme {
  /** Chart-level attributes */
  chart: IMSChartThemeAttributes;
  /** Data attribute generator function (for dynamic alpha, etc.) */
  data?: IMSDataAttributeFn;
  /** Dataset attributes */
  dataset?: IMSDatasetThemeAttributes[];
  /** Trendline attributes */
  trendlines?: IMSTrendlineThemeAttributes[];
  /** Category attributes (scatter/bubble) */
  categories?: IMSCategoryThemeAttributes[];
  /** Vertical trendlines */
  vtrendlines?: IMSVTrendlineThemeAttributes[];
  /** Dial attributes (angular gauge) */
  dials?: { dial: IMSDialThemeAttributes[] };
  /** Pointer attributes (hlinear gauge) */
  pointers?: { pointer: IMSPointerThemeAttributes[] };
}

/** Geo-specific theme attributes (for map charts) */
export interface IMSGeoTheme {
  chart: IMSChartThemeAttributes;
}

/** Complete theme definition (replaces FusionCharts.register("theme", {...})) */
export interface IMSChartTheme {
  /** Theme name */
  name: string;
  /** Theme version */
  version?: string;
  /** Base attributes applied to ALL chart types */
  base: IMSChartTypeTheme;
  /** Geo/map-specific overrides */
  geo?: IMSGeoTheme;
  /** Per-chart-type overrides */
  [chartType: string]: IMSChartTypeTheme | IMSGeoTheme | string | undefined;
}

// ============================================================================
// Theme Registry
// ============================================================================

const themeRegistry: Map<string, IMSChartTheme> = new Map();

/**
 * Register a chart theme.
 * Replaces FusionCharts.register("theme", { name: "fint", theme: {...} })
 */
export function registerTheme(theme: IMSChartTheme): void {
  if (themeRegistry.has(theme.name)) {
    console.warn(`[IMS Chart Theme] Theme "${theme.name}" already registered. Overwriting.`);
  }
  themeRegistry.set(theme.name, theme);
}

/**
 * Get a registered theme by name.
 */
export function getTheme(name: string): IMSChartTheme | undefined {
  return themeRegistry.get(name);
}

/**
 * Get all registered theme names.
 */
export function getThemeNames(): string[] {
  return Array.from(themeRegistry.keys());
}

/**
 * Check if a theme is registered.
 */
export function isThemeRegistered(name: string): boolean {
  return themeRegistry.has(name);
}

/**
 * Remove a registered theme.
 */
export function unregisterTheme(name: string): boolean {
  return themeRegistry.delete(name);
}

// ============================================================================
// Theme Resolution (Merging theme attrs with chart config)
// ============================================================================

/**
 * Resolve effective chart attributes by merging base theme with chart-type-specific overrides.
 * Replaces FusionCharts internal theme resolution (base → chartType → user config).
 *
 * Resolution order (later overrides earlier):
 * 1. base.chart (theme base)
 * 2. base.dataset (theme base dataset defaults)
 * 3. chartType.chart (theme chart-type overrides)
 * 4. chartType.data (dynamic data attribute function)
 * 5. User-provided config (highest priority)
 */
export function resolveThemeAttributes(
  themeName: string,
  chartType: IMSChartType | string,
  userConfig?: Partial<IMSThemeChartConfig>
): IMSThemeChartConfig {
  const theme = themeRegistry.get(themeName);
  if (!theme) {
    // No theme found, return defaults merged with user config
    return { ...DEFAULT_THEME_CHART_CONFIG, ...userConfig };
  }

  // Start with base chart attributes
  const baseAttrs = theme.base?.chart || {};
  const chartTypeTheme = theme[chartType] as IMSChartTypeTheme | undefined;
  const typeAttrs = chartTypeTheme?.chart || {};

  // Merge: base → chartType → user config
  const merged = {
    ...DEFAULT_THEME_CHART_CONFIG,
    ...convertThemeAttrsToConfig(baseAttrs),
    ...convertThemeAttrsToConfig(typeAttrs),
    ...userConfig,
  };

  return merged;
}

/**
 * Get dynamic data attributes for a chart type from theme.
 * Replaces FusionCharts fint pie2d/doughnut2d data function:
 *   data: function(c, a, b) { ... } → alpha: 100 - (50 < b ? ...) * Math.floor(c / 10)
 */
export function getThemeDataAttributes(
  themeName: string,
  chartType: IMSChartType | string,
  dataIndex: number,
  totalPoints: number
): Record<string, unknown> {
  const theme = themeRegistry.get(themeName);
  if (!theme) return {};

  const chartTypeTheme = theme[chartType] as IMSChartTypeTheme | undefined;
  if (chartTypeTheme?.data && typeof chartTypeTheme.data === 'function') {
    return chartTypeTheme.data(dataIndex, 0, totalPoints);
  }

  return {};
}

// ============================================================================
// Theme Chart Config (Recharts-compatible output)
// ============================================================================

/** Resolved theme configuration for Recharts rendering */
export interface IMSThemeChartConfig {
  /** Palette colors */
  paletteColors: string[];
  /** Base font color */
  baseFontColor: string;
  /** Base font family */
  baseFont: string;
  /** Caption font size */
  captionFontSize: number;
  /** Sub-caption font size */
  subcaptionFontSize: number;
  /** Sub-caption bold */
  subcaptionFontBold: boolean;
  /** Show border */
  showBorder: boolean;
  /** Background color */
  bgColor: string;
  /** Show shadow */
  showShadow: boolean;
  /** Canvas background color */
  canvasBgColor: string;
  /** Show canvas border */
  showCanvasBorder: boolean;
  /** Use plot gradient */
  usePlotGradientColor: boolean;
  /** Use round edges */
  useRoundEdges: boolean;
  /** Show plot border */
  showPlotBorder: boolean;
  /** Show alternate H grid */
  showAlternateHGridColor: boolean;
  /** Show alternate V grid */
  showAlternateVGridColor: boolean;
  /** Tooltip text color */
  toolTipColor: string;
  /** Tooltip border thickness */
  toolTipBorderThickness: number;
  /** Tooltip background color */
  toolTipBgColor: string;
  /** Tooltip background alpha */
  toolTipBgAlpha: number;
  /** Tooltip border radius */
  toolTipBorderRadius: number;
  /** Tooltip padding */
  toolTipPadding: number;
  /** Legend background alpha */
  legendBgAlpha: number;
  /** Legend border alpha */
  legendBorderAlpha: number;
  /** Legend shadow */
  legendShadow: boolean;
  /** Legend item font size */
  legendItemFontSize: number;
  /** Legend item font color */
  legendItemFontColor: string;
  /** Legend caption font size */
  legendCaptionFontSize: number;
  /** Division line alpha */
  divlineAlpha: number;
  /** Division line color */
  divlineColor: string;
  /** Division line thickness */
  divlineThickness: number;
  /** Division line dashed */
  divLineIsDashed: boolean;
  /** Division line dash length */
  divLineDashLen: number;
  /** Division line gap length */
  divLineGapLen: number;
  /** Show hover effect */
  showHoverEffect: boolean;
  /** Value font size */
  valueFontSize: number;
  /** Show X-axis line */
  showXAxisLine: boolean;
  /** X-axis line thickness */
  xAxisLineThickness: number;
  /** X-axis line color */
  xAxisLineColor: string;
  /** Show values */
  showValues: boolean;
  /** Place values inside */
  placeValuesInside: boolean;
  /** Value font color */
  valueFontColor: string;
  /** Rotate values */
  rotateValues: boolean;
  /** Label display mode */
  labelDisplay: 'auto' | 'wrap' | 'stagger' | 'rotate' | 'none';
  /** Line thickness */
  lineThickness: number;
  /** Use 3D lighting */
  use3DLighting: boolean;
  /** Value background color */
  valueBgColor: string;
  /** Value background alpha */
  valueBgAlpha: number;
  /** Value border padding */
  valueBorderPadding: number;
  /** Value border radius */
  valueBorderRadius: number;
  /** Caption padding */
  captionPadding: number;
  /** Interactive legend enabled */
  interactiveLegend: boolean;
  /** Animation enabled */
  animation: boolean;
  /** Animation duration (ms) */
  animationDuration: number;
  /** Scroll height */
  scrollheight: number;
  /** Flat scroll bars */
  flatScrollBars: boolean;
  /** Scroll show buttons */
  scrollShowButtons: boolean;
  /** Scroll color */
  scrollColor: string;
}

/** Default theme chart configuration (base values) */
export const DEFAULT_THEME_CHART_CONFIG: IMSThemeChartConfig = {
  paletteColors: IMS_CHART_COLORS,
  baseFontColor: '#333333',
  baseFont: 'Source Sans Pro, Arial, sans-serif',
  captionFontSize: 14,
  subcaptionFontSize: 14,
  subcaptionFontBold: false,
  showBorder: false,
  bgColor: '#ffffff',
  showShadow: false,
  canvasBgColor: '#ffffff',
  showCanvasBorder: false,
  usePlotGradientColor: false,
  useRoundEdges: false,
  showPlotBorder: false,
  showAlternateHGridColor: false,
  showAlternateVGridColor: false,
  toolTipColor: '#ffffff',
  toolTipBorderThickness: 0,
  toolTipBgColor: '#000000',
  toolTipBgAlpha: 80,
  toolTipBorderRadius: 2,
  toolTipPadding: 5,
  legendBgAlpha: 0,
  legendBorderAlpha: 0,
  legendShadow: false,
  legendItemFontSize: 10,
  legendItemFontColor: '#666666',
  legendCaptionFontSize: 9,
  divlineAlpha: 100,
  divlineColor: '#999999',
  divlineThickness: 1,
  divLineIsDashed: true,
  divLineDashLen: 1,
  divLineGapLen: 1,
  showHoverEffect: true,
  valueFontSize: 10,
  showXAxisLine: true,
  xAxisLineThickness: 1,
  xAxisLineColor: '#999999',
  showValues: false,
  placeValuesInside: false,
  valueFontColor: '#333333',
  rotateValues: false,
  labelDisplay: 'auto',
  lineThickness: 2,
  use3DLighting: false,
  valueBgColor: '#ffffff',
  valueBgAlpha: 90,
  valueBorderPadding: -2,
  valueBorderRadius: 2,
  captionPadding: 15,
  interactiveLegend: true,
  animation: true,
  animationDuration: 1000,
  scrollheight: 10,
  flatScrollBars: true,
  scrollShowButtons: false,
  scrollColor: '#cccccc',
};

// ============================================================================
// Dark Mode Theme Configuration
// ============================================================================

/** Dark mode overrides for theme chart config */
export const DARK_THEME_OVERRIDES: Partial<IMSThemeChartConfig> = {
  paletteColors: IMS_CHART_COLORS_DARK,
  baseFontColor: '#cbd5e1',
  bgColor: '#0f172a',
  canvasBgColor: '#1e293b',
  toolTipBgColor: '#1e293b',
  toolTipBgAlpha: 90,
  toolTipColor: '#e2e8f0',
  legendItemFontColor: '#94a3b8',
  divlineColor: '#475569',
  xAxisLineColor: '#475569',
  valueFontColor: '#cbd5e1',
  valueBgColor: '#1e293b',
  scrollColor: '#475569',
};

/**
 * Apply dark mode overrides to a resolved theme config.
 */
export function applyDarkModeOverrides(config: IMSThemeChartConfig): IMSThemeChartConfig {
  return { ...config, ...DARK_THEME_OVERRIDES };
}

// ============================================================================
// Theme Attribute Conversion Helper
// ============================================================================

/**
 * Convert IMSChartThemeAttributes (FusionCharts-style) to IMSThemeChartConfig (Recharts-style).
 * Handles type conversions (string numbers → actual numbers, "0"/"1" → boolean).
 */
function convertThemeAttrsToConfig(
  attrs: Partial<IMSThemeChartAttributes>
): Partial<IMSThemeChartConfig> {
  const result: Partial<IMSThemeChartConfig> = {};

  // Direct string mappings
  if (attrs.baseFontColor) result.baseFontColor = attrs.baseFontColor;
  if (attrs.baseFont) result.baseFont = attrs.baseFont;
  if (attrs.bgColor) result.bgColor = attrs.bgColor;
  if (attrs.canvasBgColor) result.canvasBgColor = attrs.canvasBgColor;
  if (attrs.toolTipColor) result.toolTipColor = attrs.toolTipColor;
  if (attrs.toolTipBgColor) result.toolTipBgColor = attrs.toolTipBgColor;
  if (attrs.legendItemFontColor) result.legendItemFontColor = attrs.legendItemFontColor;
  if (attrs.divlineColor) result.divlineColor = attrs.divlineColor;
  if (attrs.xAxisLineColor) result.xAxisLineColor = attrs.xAxisLineColor;
  if (attrs.yAxisLineColor) result.xAxisLineColor = attrs.yAxisLineColor;
  if (attrs.valueFontColor) result.valueFontColor = attrs.valueFontColor;
  if (attrs.valueBgColor) result.valueBgColor = attrs.valueBgColor;
  if (attrs.scrollColor) result.scrollColor = attrs.scrollColor;

  // Number conversions (from string "14" → number 14)
  if (attrs.captionFontSize !== undefined) {
    result.captionFontSize = typeof attrs.captionFontSize === 'string'
      ? parseInt(attrs.captionFontSize, 10) : attrs.captionFontSize;
  }
  if (attrs.subcaptionFontSize !== undefined) {
    result.subcaptionFontSize = typeof attrs.subcaptionFontSize === 'string'
      ? parseInt(attrs.subcaptionFontSize, 10) : attrs.subcaptionFontSize;
  }
  if (attrs.toolTipBorderThickness !== undefined) {
    result.toolTipBorderThickness = typeof attrs.toolTipBorderThickness === 'string'
      ? parseInt(attrs.toolTipBorderThickness, 10) : attrs.toolTipBorderThickness;
  }
  if (attrs.toolTipBorderRadius !== undefined) {
    result.toolTipBorderRadius = typeof attrs.toolTipBorderRadius === 'string'
      ? parseInt(attrs.toolTipBorderRadius, 10) : attrs.toolTipBorderRadius;
  }
  if (attrs.toolTipPadding !== undefined) {
    result.toolTipPadding = typeof attrs.toolTipPadding === 'string'
      ? parseInt(attrs.toolTipPadding, 10) : attrs.toolTipPadding;
  }
  if (attrs.toolTipBgAlpha !== undefined) {
    result.toolTipBgAlpha = typeof attrs.toolTipBgAlpha === 'string'
      ? parseInt(attrs.toolTipBgAlpha, 10) : attrs.toolTipBgAlpha;
  }
  if (attrs.legendBgAlpha !== undefined) {
    result.legendBgAlpha = typeof attrs.legendBgAlpha === 'string'
      ? parseInt(attrs.legendBgAlpha, 10) : attrs.legendBgAlpha;
  }
  if (attrs.legendBorderAlpha !== undefined) {
    result.legendBorderAlpha = typeof attrs.legendBorderAlpha === 'string'
      ? parseInt(attrs.legendBorderAlpha, 10) : attrs.legendBorderAlpha;
  }
  if (attrs.legendItemFontSize !== undefined) {
    result.legendItemFontSize = typeof attrs.legendItemFontSize === 'string'
      ? parseInt(attrs.legendItemFontSize, 10) : attrs.legendItemFontSize;
  }
  if (attrs.legendCaptionFontSize !== undefined) {
    result.legendCaptionFontSize = typeof attrs.legendCaptionFontSize === 'string'
      ? parseInt(attrs.legendCaptionFontSize, 10) : attrs.legendCaptionFontSize;
  }
  if (attrs.divlineAlpha !== undefined) {
    result.divlineAlpha = typeof attrs.divlineAlpha === 'string'
      ? parseInt(attrs.divlineAlpha, 10) : attrs.divlineAlpha;
  }
  if (attrs.divlineThickness !== undefined) {
    result.divlineThickness = typeof attrs.divlineThickness === 'string'
      ? parseInt(attrs.divlineThickness, 10) : attrs.divlineThickness;
  }
  if (attrs.divLineDashLen !== undefined) {
    result.divLineDashLen = typeof attrs.divLineDashLen === 'string'
      ? parseInt(attrs.divLineDashLen, 10) : attrs.divLineDashLen;
  }
  if (attrs.divLineGapLen !== undefined) {
    result.divLineGapLen = typeof attrs.divLineGapLen === 'string'
      ? parseInt(attrs.divLineGapLen, 10) : attrs.divLineGapLen;
  }
  if (attrs.valueFontSize !== undefined) {
    result.valueFontSize = typeof attrs.valueFontSize === 'string'
      ? parseInt(attrs.valueFontSize, 10) : attrs.valueFontSize;
  }
  if (attrs.xAxisLineThickness !== undefined) {
    result.xAxisLineThickness = typeof attrs.xAxisLineThickness === 'string'
      ? parseInt(attrs.xAxisLineThickness, 10) : attrs.xAxisLineThickness;
  }
  if (attrs.lineThickness !== undefined) {
    result.lineThickness = typeof attrs.lineThickness === 'string'
      ? parseInt(attrs.lineThickness, 10) : attrs.lineThickness;
  }
  if (attrs.valueBgAlpha !== undefined) {
    result.valueBgAlpha = typeof attrs.valueBgAlpha === 'string'
      ? parseInt(attrs.valueBgAlpha, 10) : attrs.valueBgAlpha;
  }
  if (attrs.valueBorderPadding !== undefined) {
    result.valueBorderPadding = typeof attrs.valueBorderPadding === 'string'
      ? parseInt(attrs.valueBorderPadding, 10) : attrs.valueBorderPadding;
  }
  if (attrs.valueBorderRadius !== undefined) {
    result.valueBorderRadius = typeof attrs.valueBorderRadius === 'string'
      ? parseInt(attrs.valueBorderRadius, 10) : attrs.valueBorderRadius;
  }
  if (attrs.captionPadding !== undefined) {
    result.captionPadding = typeof attrs.captionPadding === 'string'
      ? parseInt(attrs.captionPadding, 10) : attrs.captionPadding;
  }
  if (attrs.scrollheight !== undefined) {
    result.scrollheight = typeof attrs.scrollheight === 'string'
      ? parseInt(attrs.scrollheight, 10) : attrs.scrollheight;
  }

  // Boolean conversions (from "0"/"1" or boolean)
  if (attrs.subcaptionFontBold !== undefined) {
    result.subcaptionFontBold = attrs.subcaptionFontBold === '0'
      ? false : attrs.subcaptionFontBold === '1'
        ? true : !!attrs.subcaptionFontBold;
  }
  if (attrs.showBorder !== undefined) {
    result.showBorder = attrs.showBorder === '0'
      ? false : attrs.showBorder === '1'
        ? true : !!attrs.showBorder;
  }
  if (attrs.showShadow !== undefined) {
    result.showShadow = attrs.showShadow === '0'
      ? false : attrs.showShadow === '1'
        ? true : !!attrs.showShadow;
  }
  if (attrs.showCanvasBorder !== undefined) {
    result.showCanvasBorder = attrs.showCanvasBorder === '0'
      ? false : attrs.showCanvasBorder === '1'
        ? true : !!attrs.showCanvasBorder;
  }
  if (attrs.usePlotGradientColor !== undefined) {
    result.usePlotGradientColor = attrs.usePlotGradientColor === '0'
      ? false : attrs.usePlotGradientColor === '1'
        ? true : !!attrs.usePlotGradientColor;
  }
  if (attrs.useRoundEdges !== undefined) {
    result.useRoundEdges = attrs.useRoundEdges === '0'
      ? false : attrs.useRoundEdges === '1'
        ? true : !!attrs.useRoundEdges;
  }
  if (attrs.showPlotBorder !== undefined) {
    result.showPlotBorder = attrs.showPlotBorder === '0'
      ? false : attrs.showPlotBorder === '1'
        ? true : !!attrs.showPlotBorder;
  }
  if (attrs.showAlternateHGridColor !== undefined) {
    result.showAlternateHGridColor = attrs.showAlternateHGridColor === '0'
      ? false : attrs.showAlternateHGridColor === '1'
        ? true : !!attrs.showAlternateHGridColor;
  }
  if (attrs.showAlternateVGridColor !== undefined) {
    result.showAlternateVGridColor = attrs.showAlternateVGridColor === '0'
      ? false : attrs.showAlternateVGridColor === '1'
        ? true : !!attrs.showAlternateVGridColor;
  }
  if (attrs.legendShadow !== undefined) {
    result.legendShadow = attrs.legendShadow === '0'
      ? false : attrs.legendShadow === '1'
        ? true : !!attrs.legendShadow;
  }
  if (attrs.divLineIsDashed !== undefined) {
    result.divLineIsDashed = attrs.divLineIsDashed === '0'
      ? false : attrs.divLineIsDashed === '1'
        ? true : !!attrs.divLineIsDashed;
  }
  if (attrs.showHoverEffect !== undefined) {
    result.showHoverEffect = attrs.showHoverEffect === '0'
      ? false : attrs.showHoverEffect === '1'
        ? true : !!attrs.showHoverEffect;
  }
  if (attrs.showXAxisLine !== undefined) {
    result.showXAxisLine = attrs.showXAxisLine === '0'
      ? false : attrs.showXAxisLine === '1'
        ? true : !!attrs.showXAxisLine;
  }
  if (attrs.showYAxisLine !== undefined) {
    result.showXAxisLine = attrs.showYAxisLine === '0'
      ? false : attrs.showYAxisLine === '1'
        ? true : !!attrs.showYAxisLine;
  }
  if (attrs.showValues !== undefined) {
    result.showValues = attrs.showValues === '0'
      ? false : attrs.showValues === '1'
        ? true : !!attrs.showValues;
  }
  if (attrs.placeValuesInside !== undefined) {
    result.placeValuesInside = attrs.placeValuesInside === '0'
      ? false : attrs.placeValuesInside === '1'
        ? true : !!attrs.placeValuesInside;
  }
  if (attrs.use3DLighting !== undefined) {
    result.use3DLighting = attrs.use3DLighting === '0'
      ? false : attrs.use3DLighting === '1'
        ? true : !!attrs.use3DLighting;
  }
  if (attrs.rotateValues !== undefined) {
    result.rotateValues = attrs.rotateValues === '0'
      ? false : attrs.rotateValues === '1'
        ? true : !!attrs.rotateValues;
  }
  if (attrs.flatScrollBars !== undefined) {
    result.flatScrollBars = attrs.flatScrollBars === '0'
      ? false : attrs.flatScrollBars === '1'
        ? true : !!attrs.flatScrollBars;
  }
  if (attrs.scrollShowButtons !== undefined) {
    result.scrollShowButtons = attrs.scrollShowButtons === '0'
      ? false : attrs.scrollShowButtons === '1'
        ? true : !!attrs.scrollShowButtons;
  }

  // Palette colors
  if (attrs.paletteColors) {
    result.paletteColors = typeof attrs.paletteColors === 'string'
      ? attrs.paletteColors.split(',')
      : attrs.paletteColors;
  }

  // Label display
  if (attrs.labelDisplay) {
    result.labelDisplay = attrs.labelDisplay as IMSThemeChartConfig['labelDisplay'];
  }

  return result;
}

// ============================================================================
// FINT THEME (Deep Navy Blue Conversion)
// ============================================================================

/**
 * "fint" theme converted from FusionCharts to Recharts/IMS format.
 *
 * Original FusionCharts fint palette:
 *   #0075c2 (blue), #1aaf5d (green), #f2c500 (yellow), #f45b00 (orange), #8e0000 (dark red)
 *   #0e948c (teal), #8cbb2c (lime), #f3de00 (bright yellow), #c02d00 (red-orange), #5b0101 (dark maroon)
 *
 * Converted Deep Navy Blue palette:
 *   #1e3a5f (deep navy), #2d5a8e (navy), #18bc9c (emerald), #f39c12 (amber), #e74c3c (red)
 *   #0e948c (teal), #8cbb2c (lime), #f2c500 (yellow), #c02d00 (red-orange), #5b0101 (dark maroon)
 *
 * Key color replacements from original fint:
 *   #0075c2 (primary blue) → #1e3a5f (Deep Navy Blue)
 *   #ffffff backgrounds → preserved (with dark mode variants)
 *   #333333 text → #1e293b (darker for better readability)
 *   #000000 tooltip → #0a1628 (Deep Navy tooltip)
 *   #999999 divlines → #94a3b8 (softer gray)
 *   #cccccc scroll → #94a3b8 (Navy-tinted gray)
 */
export const FINT_THEME: IMSChartTheme = {
  name: 'fint',
  version: '0.0.3',

  // ============================================================================
  // BASE - Applied to ALL chart types
  // ============================================================================
  base: {
    chart: {
      // Deep Navy Blue palette (replacing #0075c2,#1aaf5d,#f2c500,#f45b00,#8e0000,...)
      paletteColors: [
        '#1e3a5f', // Deep Navy Blue (was #0075c2 blue)
        '#2d5a8e', // Navy Blue (was #1aaf5d green → moved to series 2)
        '#18bc9c', // Emerald (Bootswatch success green)
        '#f39c12', // Amber (was #f2c500 yellow)
        '#e74c3c', // Red (was #f45b00 orange-red)
        '#0e948c', // Teal (preserved)
        '#8cbb2c', // Lime (preserved)
        '#f2c500', // Yellow (preserved)
        '#c02d00', // Red-orange (preserved)
        '#5b0101', // Dark maroon (preserved)
      ],
      labelDisplay: 'auto',
      baseFontColor: '#1e293b',           // Darker than original #333333 for better contrast
      baseFont: 'Source Sans Pro, Arial, sans-serif',
      captionFontSize: 14,
      subcaptionFontSize: 14,
      subcaptionFontBold: false,
      showBorder: false,
      bgColor: '#ffffff',
      showShadow: false,
      canvasBgColor: '#ffffff',
      showCanvasBorder: false,
      usePlotGradientColor: false,
      useRoundEdges: false,
      showPlotBorder: false,
      showAlternateHGridColor: false,
      showAlternateVGridColor: false,
      // Tooltip: Deep Navy Blue themed (replacing #000000 bg)
      toolTipColor: '#ffffff',
      toolTipBorderThickness: 0,
      toolTipBgColor: '#0a1628',           // Deep Navy Blue tooltip bg (was #000000)
      toolTipBgAlpha: 80,
      toolTipBorderRadius: 2,
      toolTipPadding: 5,
      // Legend: transparent background
      legendBgAlpha: 0,
      legendBorderAlpha: 0,
      legendShadow: false,
      legendItemFontSize: 10,
      legendItemFontColor: '#64748b',      // Navy-tinted gray (was #666666)
      legendCaptionFontSize: 9,
      // Division lines: dashed
      divlineAlpha: 100,
      divlineColor: '#94a3b8',             // Softer gray (was #999999)
      divlineThickness: 1,
      divLineIsDashed: true,
      divLineDashLen: 1,
      divLineGapLen: 1,
      // Scrollbar
      scrollheight: 10,
      flatScrollBars: true,
      scrollShowButtons: false,
      scrollColor: '#94a3b8',              // Navy-tinted gray (was #cccccc)
      // Hover
      showHoverEffect: true,
      // Values
      valueFontSize: 10,
      // X-axis
      showXAxisLine: true,
      xAxisLineThickness: 1,
      xAxisLineColor: '#94a3b8',           // Softer gray (was #999999)
    },
    dataset: [{}],
    trendlines: [{}],
  },

  // ============================================================================
  // GEO - Map/geo chart overrides
  // ============================================================================
  geo: {
    chart: {
      showLabels: false,
      fillColor: '#1e3a5f',               // Deep Navy Blue (was #0075c2)
      showBorder: true,
      borderColor: '#e2e8f0',             // Light gray (was #eeeeee)
      borderThickness: 1,
      borderAlpha: 50,
      entityFillhoverColor: '#1e3a5f',    // Deep Navy Blue (was #0075c2)
      entityFillhoverAlpha: 80,
      connectorColor: '#94a3b8',          // Navy-tinted gray (was #cccccc)
      connectorThickness: 1.5,
      markerFillHoverAlpha: 90,
    },
  },

  // ============================================================================
  // PIE 2D
  // ============================================================================
  pie2d: {
    chart: {
      placeValuesInside: false,
      use3DLighting: false,
      valueFontColor: '#1e293b',           // Dark text (was #333333)
      captionPadding: 15,
    },
    /**
     * Dynamic alpha calculation for pie slices.
     * Replaces: function(c, a, b) { a = Math; return { alpha: 100 - (50 < b ? a.round(100 / a.ceil(b / 10)) : 20) * a.floor(c / 10) } }
     *
     * Original logic:
     * - If total points > 50: alpha = 100 - round(100 / ceil(points/10)) * floor(index/10)
     * - If total points ≤ 50: alpha = 100 - 20 * floor(index/10)
     * This creates a graduated alpha effect across data points.
     */
    data: (dataIndex, _axisLength, totalPoints) => {
      const total = totalPoints || 1;
      const alphaStep = total > 50
        ? Math.round(100 / Math.ceil(total / 10))
        : 20;
      const alpha = 100 - alphaStep * Math.floor(dataIndex / 10);
      return { alpha: Math.max(alpha, 10) }; // Minimum 10% alpha
    },
  },

  // ============================================================================
  // DOUGHNUT 2D
  // ============================================================================
  doughnut2d: {
    chart: {
      placeValuesInside: false,
      use3DLighting: false,
      valueFontColor: '#1e293b',           // Dark text (was #333333)
      centerLabelFontSize: 12,
      centerLabelBold: true,
      centerLabelFontColor: '#1e293b',     // Dark text (was #333333)
      captionPadding: 15,
    },
    /** Same dynamic alpha as pie2d */
    data: (dataIndex, _axisLength, totalPoints) => {
      const total = totalPoints || 1;
      const alphaStep = total > 50
        ? Math.round(100 / Math.ceil(total / 10))
        : 20;
      const alpha = 100 - alphaStep * Math.floor(dataIndex / 10);
      return { alpha: Math.max(alpha, 10) };
    },
  },

  // ============================================================================
  // LINE / SPLINE
  // ============================================================================
  line: {
    chart: {
      lineThickness: 2,
    },
  },

  spline: {
    chart: {
      lineThickness: 2,
    },
  },

  // ============================================================================
  // COLUMN 2D
  // ============================================================================
  column2d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue only (was #0075c2)
      valueFontColor: '#ffffff',            // White values inside bars
      placeValuesInside: true,
      rotateValues: true,
    },
  },

  // ============================================================================
  // BAR 2D
  // ============================================================================
  bar2d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue only (was #0075c2)
      valueFontColor: '#ffffff',
      placeValuesInside: true,
    },
  },

  // ============================================================================
  // COLUMN 3D
  // ============================================================================
  column3d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue only (was #0075c2)
      valueFontColor: '#ffffff',
      placeValuesInside: true,
      rotateValues: true,
    },
  },

  // ============================================================================
  // BAR 3D
  // ============================================================================
  bar3d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue only (was #0075c2)
      valueFontColor: '#ffffff',
      placeValuesInside: true,
    },
  },

  // ============================================================================
  // AREA 2D
  // ============================================================================
  area2d: {
    chart: {
      valueBgColor: '#ffffff',
      valueBgAlpha: 90,
      valueBorderPadding: -2,
      valueBorderRadius: 2,
    },
  },

  // ============================================================================
  // SPLINE AREA
  // ============================================================================
  splinearea: {
    chart: {
      valueBgColor: '#ffffff',
      valueBgAlpha: 90,
      valueBorderPadding: -2,
      valueBorderRadius: 2,
    },
  },

  // ============================================================================
  // MULTI-SERIES COLUMN 2D
  // ============================================================================
  mscolumn2d: {
    chart: {
      valueFontColor: '#ffffff',
      placeValuesInside: true,
      rotateValues: true,
    },
  },

  // ============================================================================
  // MULTI-SERIES COLUMN 3D
  // ============================================================================
  mscolumn3d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS STACKED COLUMN 2D LINE DY
  // ============================================================================
  msstackedcolumn2dlinedy: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // STACKED COLUMN 2D
  // ============================================================================
  stackedcolumn2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // STACKED AREA 2D
  // ============================================================================
  stackedarea2d: {
    chart: {
      valueBgColor: '#ffffff',
      valueBgAlpha: 90,
      valueBorderPadding: -2,
      valueBorderRadius: 2,
    },
  },

  // ============================================================================
  // STACKED BAR 2D
  // ============================================================================
  stackedbar2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS STACKED COLUMN 2D
  // ============================================================================
  msstackedcolumn2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS COMBINATION 3D
  // ============================================================================
  mscombi3d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS COMBINATION 2D
  // ============================================================================
  mscombi2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS COLUMN 3D LINE DY
  // ============================================================================
  mscolumn3dlinedy: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // STACKED COLUMN 3D LINE
  // ============================================================================
  stackedcolumn3dline: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // STACKED COLUMN 2D LINE
  // ============================================================================
  stackedcolumn2dline: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // SCROLL STACKED COLUMN 2D
  // ============================================================================
  scrollstackedcolumn2d: {
    chart: {
      valueFontColor: '#ffffff',
    },
  },

  // ============================================================================
  // SCROLL COMBINATION 2D
  // ============================================================================
  scrollcombi2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // SCROLL COMBINATION DY 2D
  // ============================================================================
  scrollcombidy2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // LOG STACKED COLUMN 2D
  // ============================================================================
  logstackedcolumn2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // LOG MS LINE
  // ============================================================================
  logmsline: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // LOG MS COLUMN 2D
  // ============================================================================
  logmscolumn2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // MS STACKED COMBI DY 2D
  // ============================================================================
  msstackedcombidy2d: {
    chart: {
      showValues: false,
    },
  },

  // ============================================================================
  // SCROLL COLUMN 2D
  // ============================================================================
  scrollcolumn2d: {
    chart: {
      valueFontColor: '#ffffff',
      placeValuesInside: true,
      rotateValues: true,
    },
  },

  // ============================================================================
  // PARETO 2D
  // ============================================================================
  pareto2d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue (was #0075c2)
      showValues: false,
    },
  },

  // ============================================================================
  // PARETO 3D
  // ============================================================================
  pareto3d: {
    chart: {
      paletteColors: ['#1e3a5f'],          // Deep Navy Blue (was #0075c2)
      showValues: false,
    },
  },

  // ============================================================================
  // ANGULAR GAUGE
  // ============================================================================
  angulargauge: {
    chart: {
      pivotFillColor: '#ffffff',
      pivotRadius: 4,
      gaugeFillMix: '{light+0}',
      showTickValues: true,
      majorTMHeight: 12,
      majorTMThickness: 2,
      majorTMColor: '#000000',
      minorTMNumber: 0,
      tickValueDistance: 10,
      valueFontSize: 24,
      valueFontBold: true,
      gaugeInnerRadius: '50%',
      showHoverEffect: false,
    },
    dials: {
      dial: [{
        baseWidth: 10,
        rearExtension: 7,
        bgColor: '#1e293b',                // Dark navy (was #000000)
        bgAlpha: 100,
        borderColor: '#475569',             // Navy gray (was #666666)
        bgHoverAlpha: 20,
      }],
    },
  },

  // ============================================================================
  // HORIZONTAL LINEAR GAUGE
  // ============================================================================
  hlineargauge: {
    chart: {
      pointerFillColor: '#ffffff',
      gaugeFillMix: '{light+0}',
      showTickValues: true,
      majorTMHeight: 3,
      majorTMColor: '#000000',
      minorTMNumber: 0,
      valueFontSize: 18,
      valueFontBold: true,
    },
    pointers: {
      pointer: [{}],
    },
  },

  // ============================================================================
  // BUBBLE
  // ============================================================================
  bubble: {
    chart: {
      use3DLighting: false,
      showplotborder: false,
      showYAxisLine: true,
      yAxisLineThickness: 1,
      yAxisLineColor: '#94a3b8',           // Navy-tinted gray (was #999999)
      showAlternateHGridColor: false,
      showAlternateVGridColor: false,
      plotFillHoverColor: '#2d5a8e',       // Navy Blue hover (was #2b8ecf)
    },
    categories: [{
      verticalLineDashed: true,
      verticalLineDashLen: 1,
      verticalLineDashGap: 1,
      verticalLineThickness: 1,
      verticalLineColor: '#1e293b',         // Dark navy (was #000000)
      category: [{}],
    }],
    vtrendlines: [{
      line: [{ alpha: '0' }],
    }],
  },

  // ============================================================================
  // SCATTER
  // ============================================================================
  scatter: {
    chart: {
      use3DLighting: false,
      showYAxisLine: true,
      yAxisLineThickness: 1,
      yAxisLineColor: '#94a3b8',           // Navy-tinted gray (was #999999)
      showAlternateHGridColor: false,
      showAlternateVGridColor: false,
    },
    categories: [{
      verticalLineDashed: true,
      verticalLineDashLen: 1,
      verticalLineDashGap: 1,
      verticalLineThickness: 1,
      verticalLineColor: '#1e293b',         // Dark navy (was #000000)
      category: [{}],
    }],
    vtrendlines: [{
      line: [{ alpha: '0' }],
    }],
  },

  // ============================================================================
  // BOX AND WHISKER 2D
  // ============================================================================
  boxandwhisker2d: {
    chart: {
      valueBgColor: '#ffffff',
      valueBgAlpha: 90,
      valueBorderPadding: -2,
      valueBorderRadius: 2,
    },
  },

  // ============================================================================
  // THERMOMETER
  // ============================================================================
  thermometer: {
    chart: {
      gaugeFillColor: '#1e3a5f',           // Deep Navy Blue (was #0075c2)
    },
  },

  // ============================================================================
  // CYLINDER
  // ============================================================================
  cylinder: {
    chart: {
      cylFillColor: '#1e3a5f',             // Deep Navy Blue (was #0075c2)
    },
  },

  // ============================================================================
  // SPARK LINE
  // ============================================================================
  sparkline: {
    chart: {
      linecolor: '#1e3a5f',                // Deep Navy Blue (was #0075c2)
    },
  },

  // ============================================================================
  // SPARK COLUMN
  // ============================================================================
  sparkcolumn: {
    chart: {
      plotFillColor: '#1e3a5f',            // Deep Navy Blue (was #0075c2)
    },
  },

  // ============================================================================
  // SPARK WIN/LOSS
  // ============================================================================
  sparkwinloss: {
    chart: {
      winColor: '#1e3a5f',                 // Deep Navy Blue (was #0075c2)
      lossColor: '#18bc9c',                // Emerald (was #1aaf5d)
      drawColor: '#f39c12',                // Amber (was #f2c500)
      scoreLessColor: '#e74c3c',           // Red (was #f45b00)
    },
  },

  // ============================================================================
  // HORIZONTAL BULLET
  // ============================================================================
  hbullet: {
    chart: {
      plotFillColor: '#1e3a5f',            // Deep Navy Blue (was #0075c2)
      targetColor: '#18bc9c',              // Emerald (was #1aaf5d)
    },
  },

  // ============================================================================
  // VERTICAL BULLET
  // ============================================================================
  vbullet: {
    chart: {
      plotFillColor: '#1e3a5f',            // Deep Navy Blue (was #0075c2)
      targetColor: '#18bc9c',              // Emerald (was #1aaf5d)
    },
  },
};

// ============================================================================
// Register Fint Theme
// ============================================================================

registerTheme(FINT_THEME);

// ============================================================================
// Convenience Theme Hook
// ============================================================================

/**
 * Get resolved theme config for a chart type, with optional dark mode.
 * This is the primary API for consuming theme configuration in chart components.
 *
 * Usage:
 *   const config = getThemeConfig('column2d', 'fint', true);
 *   // Returns fully merged config: base → column2d overrides → dark mode overrides
 */
export function getThemeConfig(
  chartType: IMSChartType | string,
  themeName: string = 'fint',
  darkMode: boolean = false
): IMSThemeChartConfig {
  const config = resolveThemeAttributes(themeName, chartType);
  return darkMode ? applyDarkModeOverrides(config) : config;
}

/**
 * Get chart-type-specific data attributes from theme.
 * Used for dynamic alpha calculations in pie/doughnut charts.
 *
 * Usage:
 *   const attrs = getThemeDataAttrs('pie2d', 'fint', 2, 25);
 *   // Returns: { alpha: 80 } (from fint's dynamic data function)
 */
export function getThemeDataAttrs(
  chartType: IMSChartType | string,
  themeName: string = 'fint',
  dataIndex: number,
  totalPoints: number
): Record<string, unknown> {
  return getThemeDataAttributes(themeName, chartType, dataIndex, totalPoints);
}

/**
 * Get the effective palette colors for a chart type from theme.
 * Falls back to IMS_CHART_COLORS if no theme or palette found.
 */
export function getThemePalette(
  chartType: IMSChartType | string,
  themeName: string = 'fint',
  darkMode: boolean = false
): string[] {
  const config = getThemeConfig(chartType, themeName, darkMode);
  return config.paletteColors;
}

/**
 * Get the tooltip style configuration from theme.
 */
export function getThemeTooltipStyle(
  themeName: string = 'fint',
  darkMode: boolean = false
): {
  color: string;
  backgroundColor: string;
  backgroundAlpha: number;
  borderRadius: number;
  padding: number;
  borderThickness: number;
} {
  const config = getThemeConfig('base', themeName, darkMode);
  return {
    color: config.toolTipColor,
    backgroundColor: config.toolTipBgColor,
    backgroundAlpha: config.toolTipBgAlpha / 100,
    borderRadius: config.toolTipBorderRadius,
    padding: config.toolTipPadding,
    borderThickness: config.toolTipBorderThickness,
  };
}

/**
 * Get legend style configuration from theme.
 */
export function getThemeLegendStyle(
  themeName: string = 'fint',
  darkMode: boolean = false
): {
  bgAlpha: number;
  borderAlpha: number;
  shadow: boolean;
  itemFontSize: number;
  itemFontColor: string;
  captionFontSize: number;
} {
  const config = getThemeConfig('base', themeName, darkMode);
  return {
    bgAlpha: config.legendBgAlpha,
    borderAlpha: config.legendBorderAlpha,
    shadow: config.legendShadow,
    itemFontSize: config.legendItemFontSize,
    itemFontColor: config.legendItemFontColor,
    captionFontSize: config.legendCaptionFontSize,
  };
}
