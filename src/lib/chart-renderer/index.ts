/**
 * IMS Chart Renderer - Main Entry Point
 * Complete FusionCharts rendering engine replacement built on Recharts
 * Provides chart type registry, interactive features, zoom/scroll, toolbar
 *
 * Usage:
 *   import { getChartTypeConfig, usePieSlicing, ChartToolbar } from '@/lib/chart-renderer';
 *
 *   // Get chart configuration
 *   const config = getChartTypeConfig('mscombidy2d');
 *
 *   // Interactive pie
 *   const { toggleSlice, isSliced } = usePieSlicing();
 *
 *   // Zoom chart
 *   const { zoomTo, zoomOut, resetZoom } = useChartViewport(totalCategories, canvasWidth);
 */

// ============================================================================
// Chart Type Registry
// ============================================================================

export {
  registerChartType,
  getChartTypeConfig,
  getAllChartTypes,
  isChartTypeRegistered,
  getRechartsType,
  isSingleSeries,
  isMultiSeries,
  is3DChart,
  isBarChart,
  isStackedChart,
  isDualAxisChart,
  supportsZoom,
  getStackMode,
  getChartTypeNames,
  getChartTypesByCategory,
  resolveDatasetRenderAs,
} from './chart-registry';

export type {
  IMSBaseCategory,
  IMSChartTypeConfig,
} from './chart-registry';

// ============================================================================
// Interactive Features
// ============================================================================

export {
  usePieSlicing,
  usePieRotation,
  useDoughnutCenterLabel,
  useHoverCosmetics,
  calculateSliceTranslation,
  getSliceTransform,
  generate3DEffect,
  generate3DSliceGradient,
  DoughnutCenterLabel,
  InteractivePie,
} from './interactive-features';

export type {
  PieSliceState,
  PieRotationState,
  DoughnutCenterLabelConfig,
  CSS3DEffect,
  HoverCosmetics,
  SliceAnimationConfig,
  DoughnutCenterLabelProps,
  InteractivePieProps,
} from './interactive-features';

// ============================================================================
// Zoom/Scroll & Toolbar
// ============================================================================

export {
  useChartViewport,
  useCrossLineTooltip,
  ChartScrollBar,
  ChartToolbar,
  ZoomSelectionOverlay,
} from './zoom-scroll';

export type {
  ViewPortConfig,
  ViewPortHistoryEntry,
  CrossLineConfig,
  ChartScrollBarProps,
  ToolbarButtonState,
  ChartToolbarProps,
  ZoomSelectionProps,
} from './zoom-scroll';
