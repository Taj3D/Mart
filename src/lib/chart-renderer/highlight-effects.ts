/**
 * IMS Chart Renderer - Highlight Effects System
 * Replaces FusionCharts highlightEffect module (fadeout effect)
 * Implements chart-type-specific highlight behaviors for interactive legend rollover
 * Part of IMS ERP System - Deep Navy Blue Theme
 *
 * Converted from: FusionCharts.register("highlightEffect", {...})
 * Original: When hovering a legend item, non-related data dims (fadeout),
 *          hovered data remains at full opacity
 */

import { IMS_CHART_COLORS } from '../chart-utils/types';
import type { IMSChartType } from '../chart-utils/types';

// ============================================================================
// Highlight Effect Types
// ============================================================================

/** Supported highlight effect types */
export type IMSHighlightEffectType = 'fadeout' | 'highlight' | 'none';

/** Highlight effect configuration */
export interface IMSHighlightEffectConfig {
  /** Effect type */
  type: IMSHighlightEffectType;
  /** Fade opacity for non-highlighted items (0-1) */
  fadeOpacity: number;
  /** Highlight opacity for highlighted items (0-1) */
  highlightOpacity: number;
  /** Animation duration in ms */
  animationDuration: number;
  /** Animation easing */
  animationEasing: 'ease-out' | 'ease-in' | 'ease-in-out' | 'linear';
  /** Whether to highlight on legend hover */
  highlightOnLegendHover: boolean;
  /** Whether to toggle series on legend click */
  toggleOnLegendClick: boolean;
}

/** Default highlight effect configuration */
export const DEFAULT_HIGHLIGHT_CONFIG: IMSHighlightEffectConfig = {
  type: 'fadeout',
  fadeOpacity: 0.25,
  highlightOpacity: 1,
  animationDuration: 200,
  animationEasing: 'ease-out',
  highlightOnLegendHover: true,
  toggleOnLegendClick: true,
};

/** Per-series highlight state */
export interface IMSSeriesHighlightState {
  /** Series index */
  seriesIndex: number;
  /** Whether series is visible */
  visible: boolean;
  /** Whether series is highlighted (hovered) */
  highlighted: boolean;
  /** Current opacity (0-1) */
  opacity: number;
  /** Original color */
  originalColor: string;
  /** Current fill color (may include opacity) */
  currentFill: string;
}

/** Chart-type-specific highlight handler */
export interface IMSChartTypeHighlightHandler {
  /** Apply highlight effect to specific chart type */
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[];
  /** Get the visual style for a data point in this chart type */
  getPointStyle(
    state: IMSSeriesHighlightState,
    pointIndex: number
  ): React.CSSProperties;
  /** Get the visual style for the series line/area */
  getSeriesStyle(
    state: IMSSeriesHighlightState
  ): React.CSSProperties;
}

// ============================================================================
// Fadeout Effect Implementation (Primary Highlight Effect)
// ============================================================================

/**
 * Apply fadeout effect across all series.
 * When a series is hovered (highlighted), all other series fade to fadeOpacity.
 * When no series is hovered, all series return to full opacity.
 *
 * Replaces FusionCharts: e.applyEffect(d, c, true/false)
 * Where: d = dataset index, c = config, true = apply, false = remove
 */
export function applyFadeoutEffect(
  seriesStates: IMSSeriesHighlightState[],
  highlightIndex: number | null,
  isHighlighting: boolean,
  config: Partial<IMSHighlightEffectConfig> = {}
): IMSSeriesHighlightState[] {
  const fullConfig = { ...DEFAULT_HIGHLIGHT_CONFIG, ...config };

  if (!isHighlighting || highlightIndex === null) {
    // Remove effect: restore all to full opacity
    return seriesStates.map(state => ({
      ...state,
      highlighted: false,
      opacity: fullConfig.highlightOpacity,
      currentFill: state.originalColor,
    }));
  }

  // Apply effect: highlight selected, fade others
  return seriesStates.map((state, idx) => {
    if (idx === highlightIndex) {
      return {
        ...state,
        highlighted: true,
        opacity: fullConfig.highlightOpacity,
        currentFill: state.originalColor,
      };
    }
    return {
      ...state,
      highlighted: false,
      opacity: fullConfig.fadeOpacity,
      currentFill: applyOpacityToColor(state.originalColor, fullConfig.fadeOpacity),
    };
  });
}

// ============================================================================
// Chart-Type-Specific Highlight Handlers
// ============================================================================

/**
 * Area chart highlight handler.
 * Replaces FusionCharts area highlight effect.
 * Area fills dim, stroke remains visible but faded.
 */
class AreaHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Line/Spline chart highlight handler.
 * Replaces FusionCharts line/spline highlight effect.
 * Lines dim by reducing opacity and stroke width.
 */
class LineHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      transform: state.highlighted ? 'scale(1.3)' : 'scale(1)',
      transformOrigin: 'center',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      strokeWidth: state.highlighted ? 3 : 2,
      transition: `all ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Bubble chart highlight handler.
 * Replaces FusionCharts bubble highlight effect.
 * Non-highlighted bubbles fade and shrink slightly.
 */
class BubbleHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transform: state.highlighted ? 'scale(1.15)' : 'scale(1)',
      transition: `all ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      transformOrigin: 'center',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Pie/Doughnut chart highlight handler.
 * Replaces FusionCharts pie2d/pie3d/doughnut2d/doughnut3d highlight effect.
 * Non-highlighted slices fade out significantly.
 */
class PieHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    // For pie charts, each "series" is actually a slice
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting, {
      fadeOpacity: 0.3, // Pie fades more aggressively
    });
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transform: state.highlighted ? 'scale(1.05)' : 'scale(1)',
      transition: `all ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      transformOrigin: 'center',
      filter: state.highlighted ? 'brightness(1.1)' : 'none',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Scatter chart highlight handler.
 * Replaces FusionCharts scatter highlight effect.
 * Non-highlighted points fade out.
 */
class ScatterHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transform: state.highlighted ? 'scale(1.4)' : 'scale(1)',
      transition: `all ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      transformOrigin: 'center',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Funnel/Pyramid chart highlight handler.
 * Replaces FusionCharts funnel/pyramid highlight effect.
 * Non-highlighted sections fade out.
 */
class FunnelPyramidHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting, {
      fadeOpacity: 0.2,
    });
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transform: state.highlighted ? 'scale(1.03)' : 'scale(1)',
      transition: `all ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      transformOrigin: 'center',
      filter: state.highlighted ? 'brightness(1.1) saturate(1.2)' : 'none',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Heatmap chart highlight handler.
 * Replaces FusionCharts heatmap highlight effect.
 * Non-highlighted cells fade out with more aggressive opacity reduction.
 */
class HeatmapHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting, {
      fadeOpacity: 0.15, // Heatmap fades even more
    });
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      filter: state.highlighted ? 'brightness(1.15) saturate(1.3)' : 'none',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Box-and-Whisker chart highlight handler.
 * Replaces FusionCharts boxandwhisker2d highlight effect.
 */
class BoxWhiskerHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      filter: state.highlighted ? 'brightness(1.1)' : 'none',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Radar chart highlight handler.
 * Replaces FusionCharts radar/multiaxisline highlight effect.
 * Non-highlighted radar areas fade.
 */
class RadarHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

/**
 * Multi-axis line chart highlight handler.
 * Replaces FusionCharts multiaxisline highlight effect.
 * Similar to line but with dual-axis considerations.
 */
class MultiAxisLineHighlightHandler extends LineHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    // For multi-axis, we might want to highlight the entire axis group
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }
}

/**
 * Column/Bar chart highlight handler.
 * Non-highlighted bars fade out.
 */
class ColumnBarHighlightHandler implements IMSChartTypeHighlightHandler {
  applyEffect(
    seriesStates: IMSSeriesHighlightState[],
    highlightIndex: number | null,
    isHighlighting: boolean
  ): IMSSeriesHighlightState[] {
    return applyFadeoutEffect(seriesStates, highlightIndex, isHighlighting);
  }

  getPointStyle(state: IMSSeriesHighlightState, _pointIndex: number): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      filter: state.highlighted ? 'brightness(1.1)' : 'none',
    };
  }

  getSeriesStyle(state: IMSSeriesHighlightState): React.CSSProperties {
    return {
      opacity: state.opacity,
      transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
    };
  }
}

// ============================================================================
// Highlight Handler Registry
// ============================================================================

const handlerRegistry: Map<string, IMSChartTypeHighlightHandler> = new Map();

/** Register a highlight handler for a chart type */
export function registerHighlightHandler(
  chartType: string,
  handler: IMSChartTypeHighlightHandler
): void {
  handlerRegistry.set(chartType, handler);
}

/** Get highlight handler for a chart type */
export function getHighlightHandler(chartType: string): IMSChartTypeHighlightHandler | undefined {
  return handlerRegistry.get(chartType);
}

/** Get highlight handler with fallback to default */
export function getHighlightHandlerOrDefault(
  chartType: string
): IMSChartTypeHighlightHandler {
  return handlerRegistry.get(chartType) || defaultHandler;
}

// Default handler (simple opacity fade)
const defaultHandler = new ColumnBarHighlightHandler();

// ============================================================================
// Register Built-in Handlers (matching FusionCharts register calls)
// ============================================================================

// Area charts
registerHighlightHandler('area2d', new AreaHighlightHandler());
registerHighlightHandler('msarea', new AreaHighlightHandler());
registerHighlightHandler('stackedarea2d', new AreaHighlightHandler());
registerHighlightHandler('stackedsplinearea', new AreaHighlightHandler());
registerHighlightHandler('splinearea', new AreaHighlightHandler());
registerHighlightHandler('mssplinearea', new AreaHighlightHandler());

// Line charts
registerHighlightHandler('line', new LineHighlightHandler());
registerHighlightHandler('msline', new LineHighlightHandler());
registerHighlightHandler('spline', new LineHighlightHandler());
registerHighlightHandler('msspline', new LineHighlightHandler());
registerHighlightHandler('zoomline', new LineHighlightHandler());
registerHighlightHandler('zoomlinedy', new MultiAxisLineHighlightHandler());

// Column/Bar charts
registerHighlightHandler('column2d', new ColumnBarHighlightHandler());
registerHighlightHandler('column3d', new ColumnBarHighlightHandler());
registerHighlightHandler('bar2d', new ColumnBarHighlightHandler());
registerHighlightHandler('bar3d', new ColumnBarHighlightHandler());
registerHighlightHandler('mscolumn2d', new ColumnBarHighlightHandler());
registerHighlightHandler('mscolumn3d', new ColumnBarHighlightHandler());
registerHighlightHandler('msbar2d', new ColumnBarHighlightHandler());
registerHighlightHandler('msbar3d', new ColumnBarHighlightHandler());
registerHighlightHandler('stackedcolumn2d', new ColumnBarHighlightHandler());
registerHighlightHandler('stackedcolumn3d', new ColumnBarHighlightHandler());
registerHighlightHandler('stackedbar2d', new ColumnBarHighlightHandler());
registerHighlightHandler('stackedbar3d', new ColumnBarHighlightHandler());

// Pie/Doughnut charts
registerHighlightHandler('pie2d', new PieHighlightHandler());
registerHighlightHandler('pie3d', new PieHighlightHandler());
registerHighlightHandler('doughnut2d', new PieHighlightHandler());
registerHighlightHandler('doughnut3d', new PieHighlightHandler());

// Scatter/Bubble
registerHighlightHandler('scatter', new ScatterHighlightHandler());
registerHighlightHandler('bubble', new BubbleHighlightHandler());

// Funnel/Pyramid
registerHighlightHandler('funnel', new FunnelPyramidHighlightHandler());
registerHighlightHandler('pyramid', new FunnelPyramidHighlightHandler());

// Radar
registerHighlightHandler('radar', new RadarHighlightHandler());
registerHighlightHandler('polar', new RadarHighlightHandler());

// Heatmap
registerHighlightHandler('heatmap', new HeatmapHighlightHandler());

// Box-and-Whisker
registerHighlightHandler('boxandwhisker2d', new BoxWhiskerHighlightHandler());

// Combination charts (use default column behavior)
registerHighlightHandler('mscombi2d', new ColumnBarHighlightHandler());
registerHighlightHandler('mscombi3d', new ColumnBarHighlightHandler());
registerHighlightHandler('mscombidy2d', new ColumnBarHighlightHandler());

// Treemap
registerHighlightHandler('treemap', new HeatmapHighlightHandler());

// ============================================================================
// Series State Management
// ============================================================================

/**
 * Create initial series highlight states from chart data.
 * Each series/slice gets a state tracking visibility and highlight.
 */
export function createInitialSeriesStates(
  seriesNames: string[],
  colors?: string[]
): IMSSeriesHighlightState[] {
  const palette = colors || IMS_CHART_COLORS;
  return seriesNames.map((name, idx) => ({
    seriesIndex: idx,
    visible: true,
    highlighted: false,
    opacity: 1,
    originalColor: palette[idx % palette.length],
    currentFill: palette[idx % palette.length],
  }));
}

/**
 * Toggle series visibility (legend click).
 * Replaces FusionCharts legenditemclicked → dataset visibility toggle.
 */
export function toggleSeriesVisibility(
  states: IMSSeriesHighlightState[],
  seriesIndex: number
): IMSSeriesHighlightState[] {
  return states.map((state, idx) => {
    if (idx === seriesIndex) {
      return {
        ...state,
        visible: !state.visible,
        opacity: state.visible ? 0 : 1,
      };
    }
    return state;
  });
}

/**
 * Highlight a series on legend hover.
 * Replaces FusionCharts legenditemrollover → applyEffect.
 */
export function highlightSeries(
  states: IMSSeriesHighlightState[],
  seriesIndex: number,
  chartType: IMSChartType,
  config?: Partial<IMSHighlightEffectConfig>
): IMSSeriesHighlightState[] {
  const handler = getHighlightHandlerOrDefault(chartType);
  return handler.applyEffect(states, seriesIndex, true);
}

/**
 * Remove highlight on legend rollout.
 * Replaces FusionCharts legenditemrollout → removeEffect.
 */
export function removeHighlight(
  states: IMSSeriesHighlightState[],
  chartType: IMSChartType,
  config?: Partial<IMSHighlightEffectConfig>
): IMSSeriesHighlightState[] {
  const handler = getHighlightHandlerOrDefault(chartType);
  return handler.applyEffect(states, null, false);
}

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Apply opacity to a color string.
 * Handles hex colors (#RGB, #RRGGBB) and named colors.
 */
export function applyOpacityToColor(color: string, opacity: number): string {
  if (opacity >= 1) return color;

  // Already has alpha in hex
  if (color.startsWith('#') && color.length === 9) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Standard hex
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Short hex
  if (color.startsWith('#') && color.length === 4) {
    const r = parseInt(color[1] + color[1], 16);
    const g = parseInt(color[2] + color[2], 16);
    const b = parseInt(color[3] + color[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
  }

  // rgba() format - modify existing alpha
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }

  // Fallback: return with opacity prefix (CSS custom property style)
  return color;
}

/**
 * Get Recharts-compatible fill color with opacity for highlight state.
 */
export function getHighlightFill(
  originalColor: string,
  state: IMSSeriesHighlightState
): string {
  if (state.opacity >= 1) return originalColor;
  return applyOpacityToColor(originalColor, state.opacity);
}

/**
 * Get Recharts-compatible stroke color with opacity for highlight state.
 */
export function getHighlightStroke(
  originalColor: string,
  state: IMSSeriesHighlightState,
  strokeWidth?: number
): string {
  if (state.highlighted) {
    return originalColor; // Full color for highlighted
  }
  return applyOpacityToColor(originalColor, state.opacity);
}

// ============================================================================
// React Hook for Highlight Effects
// ============================================================================

/**
 * Hook for managing chart highlight effects.
 * Replaces FusionCharts interactive legend + highlightEffect combination.
 *
 * Usage:
 *   const { seriesStates, handleLegendHover, handleLegendClick, getStyle } = useHighlightEffects(seriesNames, chartType);
 */
export function createHighlightEffectManager(
  seriesNames: string[],
  chartType: IMSChartType,
  colors?: string[],
  config?: Partial<IMSHighlightEffectConfig>
) {
  let states = createInitialSeriesStates(seriesNames, colors);
  const fullConfig = { ...DEFAULT_HIGHLIGHT_CONFIG, ...config };

  return {
    /** Get current series states */
    getStates: () => states,

    /** Handle legend item hover (rollover) */
    onLegendRollover: (seriesIndex: number) => {
      if (fullConfig.highlightOnLegendHover) {
        states = highlightSeries(states, seriesIndex, chartType, fullConfig);
      }
    },

    /** Handle legend item unhover (rollout) */
    onLegendRollout: () => {
      if (fullConfig.highlightOnLegendHover) {
        states = removeHighlight(states, chartType, fullConfig);
      }
    },

    /** Handle legend item click */
    onLegendClick: (seriesIndex: number) => {
      if (fullConfig.toggleOnLegendClick) {
        states = toggleSeriesVisibility(states, seriesIndex);
      }
    },

    /** Get style for a series */
    getSeriesStyle: (seriesIndex: number): React.CSSProperties => {
      const handler = getHighlightHandlerOrDefault(chartType);
      const state = states[seriesIndex];
      if (!state) return {};
      return handler.getSeriesStyle(state);
    },

    /** Get style for a data point */
    getPointStyle: (seriesIndex: number, pointIndex: number): React.CSSProperties => {
      const handler = getHighlightHandlerOrDefault(chartType);
      const state = states[seriesIndex];
      if (!state) return {};
      return handler.getPointStyle(state, pointIndex);
    },

    /** Get fill color for a series */
    getFill: (seriesIndex: number): string => {
      const state = states[seriesIndex];
      if (!state) return IMS_CHART_COLORS[0];
      return getHighlightFill(state.originalColor, state);
    },

    /** Get stroke color for a series */
    getStroke: (seriesIndex: number): string => {
      const state = states[seriesIndex];
      if (!state) return IMS_CHART_COLORS[0];
      return getHighlightStroke(state.originalColor, state);
    },

    /** Check if a series is visible */
    isVisible: (seriesIndex: number): boolean => {
      return states[seriesIndex]?.visible ?? true;
    },

    /** Check if a series is highlighted */
    isHighlighted: (seriesIndex: number): boolean => {
      return states[seriesIndex]?.highlighted ?? false;
    },

    /** Reset all states */
    reset: () => {
      states = createInitialSeriesStates(seriesNames, colors);
    },

    /** Update series names (e.g., after data change) */
    updateSeries: (newNames: string[], newColors?: string[]) => {
      states = createInitialSeriesStates(newNames, newColors || colors);
    },
  };
}
