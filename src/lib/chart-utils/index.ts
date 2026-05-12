/**
 * IMS Chart Utils - Main Entry Point
 * Complete FusionCharts jQuery Plugin replacement built on Recharts
 *
 * Usage:
 *   import { IMSChart, useChart, useChartStream } from '@/lib/chart-utils';
 *
 *   // Component usage
 *   <IMSChart
 *     type="column2d"
 *     data={{ data: [{ label: 'Jan', value: 100 }], chartType: 'single' }}
 *     caption="Sales Report"
 *   />
 *
 *   // Hook usage
 *   const chart = useChart({ type: 'line' });
 *   chart.addDataPoints({ label: 'Jan', value: 100 });
 *
 *   // Real-time streaming
 *   const stream = useChartStream({
 *     interval: 2000,
 *     feedFn: () => ({ label: new Date().toLocaleTimeString(), value: Math.random() * 100 }),
 *   });
 *
 *   // Table conversion
 *   const converter = useTableToChart({ chartType: 'column2d' });
 *   converter.convertFromTable('myTable');
 */

// ============================================================================
// Main Component
// ============================================================================

export { IMSChart } from './ims-chart';
export type { IMSChartProps, IMSChartHandle } from './ims-chart';

// ============================================================================
// Convenience Chart Components
// ============================================================================

export {
  IMSColumnChart,
  IMSBarChart,
  IMSLineChart,
  IMSAreaChart,
  IMSPieChart,
  IMSDoughnutChart,
  IMSMSColumnChart,
  IMSStackedColumnChart,
  IMSCombiChart,
  IMSScatterChart,
  IMSRadarChart,
  IMSFunnelChartComp,
  IMSTreemapChart,
} from './ims-chart';

// ============================================================================
// Types
// ============================================================================

export type {
  IMSChartType,
  IMSChartCategory,
  IMSChartConfig,
  IMSChartData,
  IMSChartDataPoint,
  IMSChartCategory as IMSChartCategoryType,
  IMSChartDataset,
  IMSMSDataPoint,
  IMSRechartsDataPoint,
  IMSRechartsSeries,
  IMSRealtimeCommand,
  IMSRealtimeOptions,
  IMSRealtimeState,
  IMSDrillDownLink,
  IMSDrillDownLevel,
  IMSChartEventType,
  IMSChartEvent,
  IMSChartEventHandler,
  IMSChartRef,
  IMSTableConversionOptions,
  IMSTableExtractionResult,
  IMSTableChartResult,
} from './types';

export {
  CHART_TYPE_MAP,
  IMS_CHART_COLORS,
  IMS_CHART_COLORS_DARK,
  DEFAULT_CHART_CONFIG,
} from './types';

// ============================================================================
// React Hooks
// ============================================================================

export {
  useChart,
  useChartStream,
  useChartDrillDown,
  useTableToChart,
  useChartEvents,
} from './hooks';

// ============================================================================
// Table Conversion Utilities
// ============================================================================

export {
  convertTableToChartData,
  convertArrayToChartData,
  convertFusionJSONToChartData,
} from './table-to-chart';
