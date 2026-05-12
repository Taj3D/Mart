/**
 * IMS Chart Utils - Main Chart Component
 * Replaces FusionCharts jQuery Plugin with Recharts-based React components
 * Supports: insert, update, clone, dispose, convert, drill-down, real-time streaming
 * Deep Navy Blue Theme applied
 */

'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import type {
  IMSChartType,
  IMSChartConfig,
  IMSChartData,
  IMSChartDataPoint,
  IMSChartCategory,
  IMSChartDataset,
  IMSRechartsDataPoint,
  IMSRechartsSeries,
  IMSDrillDownLink,
  IMSDrillDownLevel,
  IMSChartEventType,
  IMSChartEvent,
  IMSChartEventHandler,
  IMSRealtimeState,
} from './types';
import {
  CHART_TYPE_MAP,
  IMS_CHART_COLORS,
  IMS_CHART_COLORS_DARK,
  DEFAULT_CHART_CONFIG,
} from './types';
import { convertTableToChartData, convertArrayToChartData, convertFusionJSONToChartData } from './table-to-chart';

// ============================================================================
// Data Transformer
// ============================================================================

/** Transform IMSChartData to Recharts-compatible format */
function transformChartData(
  data: IMSChartData,
  chartType: IMSChartType
): { data: IMSRechartsDataPoint[]; series: IMSRechartsSeries[] } {
  if (data.chartType === 'single' && data.data) {
    // Single series → simple name/value pairs
    const rechartsData: IMSRechartsDataPoint[] = data.data.map(point => ({
      name: point.label,
      value: point.value,
      ...(point.toolText ? { toolText: point.toolText } : {}),
    }));

    return {
      data: rechartsData,
      series: [{
        dataKey: 'value',
        name: 'Value',
        color: IMS_CHART_COLORS[0],
        type: 'monotone',
      }],
    };
  }

  // Multi series
  const categories = data.categories || [];
  const datasets = data.dataset || [];

  if (!categories.length || !datasets.length) {
    return { data: [], series: [] };
  }

  // Build Recharts data points with all series values per category
  const rechartsData: IMSRechartsDataPoint[] = categories.map((cat, idx) => {
    const point: IMSRechartsDataPoint = { name: cat.label };
    datasets.forEach((ds, dsIdx) => {
      const key = `series_${dsIdx}`;
      point[key] = ds.data[idx]?.value ?? 0;
    });
    return point;
  });

  // Build series configuration
  const series: IMSRechartsSeries[] = datasets.map((ds, idx) => ({
    dataKey: `series_${idx}`,
    name: ds.seriesName,
    color: ds.color || IMS_CHART_COLORS[idx % IMS_CHART_COLORS.length],
    type: ds.type === 'spline' ? 'monotone' : ds.type === 'area' ? 'monotone' : 'monotone',
    stackId: (chartType.includes('stacked') || chartType.includes('stackedcolumn') || chartType.includes('stackedbar') || chartType.includes('stackedarea')) ? 'stack' : undefined,
    yAxisId: ds.parentYAxis === 'S2' ? 'right' : 'left',
  }));

  return { data: rechartsData, series };
}

// ============================================================================
// Custom Tooltip Component
// ============================================================================

function IMSCustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ims-chart-tooltip rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-navy-800 dark:text-navy-200 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-navy-700 dark:text-navy-300">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Chart Export Utility
// ============================================================================

function exportChartAsPNG(containerId: string, fileName?: string) {
  const container = document.querySelector(`[data-chart-id="${containerId}"] .recharts-wrapper`);
  if (!container) return;

  // Use the SVG within the container
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
    a.download = fileName || `chart-${containerId}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// ============================================================================
// IMSChart Component
// ============================================================================

export interface IMSChartProps extends IMSChartConfig {
  /** Chart data */
  data?: IMSChartData;
  /** Chart type */
  type?: IMSChartType;
  /** Chart ID */
  id?: string;
  /** Class name */
  className?: string;
  /** Event handlers */
  onChartClick?: IMSChartEventHandler;
  onRenderComplete?: IMSChartEventHandler;
  onLegendClick?: IMSChartEventHandler;
  /** Drill-down configuration */
  drillDownLevels?: IMSDrillDownLevel[];
  /** Real-time streaming enabled */
  realtimeEnabled?: boolean;
  /** Real-time update interval (ms) */
  realtimeInterval?: number;
  /** Real-time data feed callback */
  onRealtimeFeed?: () => IMSChartDataPoint | IMSChartDataPoint[] | null;
  /** Maximum data points for real-time */
  maxDataPoints?: number;
  /** Dark mode flag */
  darkMode?: boolean;
  /** Children (for composed charts) */
  children?: React.ReactNode;
}

export interface IMSChartHandle {
  /** Get chart reference */
  getChartRef: () => IMSChartRef;
  /** Update chart data */
  updateData: (data: IMSChartData) => void;
  /** Update chart type */
  updateType: (type: IMSChartType) => void;
  /** Update chart config */
  updateConfig: (config: Partial<IMSChartConfig>) => void;
  /** Export chart as PNG */
  exportPNG: (fileName?: string) => void;
  /** Feed real-time data */
  feedData: (data: IMSChartDataPoint | IMSChartDataPoint[]) => void;
  /** Clear chart data */
  clearData: () => void;
  /** Start streaming */
  startStreaming: () => void;
  /** Stop streaming */
  stopStreaming: () => void;
  /** Dispose chart */
  dispose: () => void;
}

export const IMSChart = forwardRef<IMSChartHandle, IMSChartProps>(function IMSChart(
  props,
  ref
) {
  const {
    data: initialData,
    type: chartType = 'column2d',
    id: chartId,
    className,
    caption,
    subCaption,
    xAxisName,
    yAxisName,
    yAxis2Name,
    numberPrefix = '',
    numberSuffix = '',
    showLabels = true,
    showLegend = true,
    showValues = false,
    legendPosition = 'bottom',
    labelRotation = 0,
    animation = true,
    animationDuration = 1000,
    paletteColors,
    width = '100%',
    height = 400,
    exportEnabled = true,
    drillDownLevels,
    realtimeEnabled = false,
    realtimeInterval = 3000,
    onRealtimeFeed,
    maxDataPoints = 50,
    darkMode = false,
    onChartClick,
    onRenderComplete,
    onLegendClick,
    children,
    ...restConfig
  } = props;

  // State
  const [chartData, setChartData] = useState<IMSChartData>(initialData || { data: [], chartType: 'single' });
  const [currentType, setCurrentType] = useState<IMSChartType>(chartType);
  const [isDisposed, setIsDisposed] = useState(false);
  const [realtimeState, setRealtimeState] = useState<IMSRealtimeState>({
    isStreaming: false,
    lastUpdate: null,
    dataPoints: 0,
    error: null,
  });
  const [drillDownLevel, setDrillDownLevel] = useState(0);
  const [drillDownHistory, setDrillDownHistory] = useState<Array<{ data: IMSChartData; type: IMSChartType }>>([]);

  const streamingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colors = paletteColors || (darkMode ? IMS_CHART_COLORS_DARK : IMS_CHART_COLORS);

  // Transform data for Recharts
  const { data: rechartsData, series } = useMemo(
    () => transformChartData(chartData, currentType),
    [chartData, currentType]
  );

  const chartCategory = CHART_TYPE_MAP[currentType] || 'bar';

  // Internal feed data function (declared before useEffect that uses it)
  const feedDataInternal = useCallback((newData: IMSChartDataPoint | IMSChartDataPoint[]) => {
    setChartData(prev => {
      const points = Array.isArray(newData) ? newData : [newData];
      const existingData = prev.data || [];

      const updatedData = [...existingData, ...points];
      // Trim to maxDataPoints
      if (updatedData.length > maxDataPoints) {
        return { ...prev, data: updatedData.slice(-maxDataPoints) };
      }
      return { ...prev, data: updatedData };
    });

    setRealtimeState(prev => ({
      ...prev,
      lastUpdate: new Date(),
      dataPoints: prev.dataPoints + (Array.isArray(newData) ? newData.length : 1),
    }));
  }, [maxDataPoints]);

  // Real-time streaming
  useEffect(() => {
    if (realtimeEnabled && realtimeState.isStreaming && onRealtimeFeed) {
      streamingRef.current = setInterval(() => {
        const newData = onRealtimeFeed();
        if (newData) {
          feedDataInternal(newData);
        }
      }, realtimeInterval);
    }

    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current);
        streamingRef.current = null;
      }
    };
  }, [realtimeEnabled, realtimeState.isStreaming, onRealtimeFeed, realtimeInterval, feedDataInternal]);

  // Fire render complete event
  useEffect(() => {
    if (onRenderComplete && rechartsData.length > 0) {
      onRenderComplete({
        eventType: 'renderComplete',
        chartId: chartId || 'ims-chart',
        timestamp: new Date(),
      });
    }
  }, [rechartsData]);

  // Chart click handler with drill-down support
  const handleChartClick = useCallback((data: unknown) => {
    if (onChartClick) {
      onChartClick({
        eventType: 'chartClick',
        chartId: chartId || 'ims-chart',
        data,
        timestamp: new Date(),
      });
    }

    // Handle drill-down
    if (drillDownLevels && drillDownLevel < drillDownLevels.length) {
      const level = drillDownLevels[drillDownLevel];
      if (level.handler) {
        level.handler(data as IMSChartDataPoint, {
          type: level.type,
          dataSource: level.dataSource,
          renderAt: level.renderAt,
        });
      } else if (level.dataSource) {
        // Navigate to drill-down level
        setDrillDownHistory(prev => [...prev, { data: chartData, type: currentType }]);
        const ds = typeof level.dataSource === 'function'
          ? undefined // async data source would need await
          : level.dataSource;
        if (ds && typeof ds !== 'function') {
          setChartData(ds);
        }
        if (level.type) setCurrentType(level.type);
        setDrillDownLevel(prev => prev + 1);
      }
    }
  }, [onChartClick, drillDownLevels, drillDownLevel, chartData, currentType, chartId]);

  // Drill up (go back one level)
  const handleDrillUp = useCallback(() => {
    if (drillDownHistory.length > 0) {
      const prev = drillDownHistory[drillDownHistory.length - 1];
      setChartData(prev.data);
      setCurrentType(prev.type);
      setDrillDownHistory(h => h.slice(0, -1));
      setDrillDownLevel(l => Math.max(0, l - 1));
    }
  }, [drillDownHistory]);

  // Expose handle methods
  useImperativeHandle(ref, () => ({
    getChartRef: () => ({
      id: chartId || 'ims-chart',
      type: currentType,
      data: chartData,
      config: restConfig as IMSChartConfig,
      setChartAttribute: () => {},
      getChartAttribute: (attr: string) => (restConfig as Record<string, unknown>)[attr],
      setChartData: (data: IMSChartData) => setChartData(data),
      getChartData: () => chartData,
      clone: (options?: Partial<IMSChartConfig>) => ({ ...({} as IMSChartRef), ...options }),
      dispose: () => setIsDisposed(true),
      resizeTo: () => {},
      exportChart: (options) => exportChartAsPNG(chartId || 'ims-chart', options?.exportFileName),
      chartType: () => currentType,
      feedData: (stream: string) => { feedDataInternal({ label: '', value: parseFloat(stream) || 0 }); },
      setData: () => {},
      setDataForId: () => {},
      getData: () => null,
      getDataForId: () => null,
      clearChart: () => setChartData({ data: [], chartType: 'single' }),
      stopUpdate: () => setRealtimeState(p => ({ ...p, isStreaming: false })),
      restartUpdate: () => setRealtimeState(p => ({ ...p, isStreaming: true })),
      configureLink: () => {},
    }),
    updateData: (data: IMSChartData) => setChartData(data),
    updateType: (type: IMSChartType) => setCurrentType(type),
    updateConfig: () => {},
    exportPNG: (fileName?: string) => exportChartAsPNG(chartId || 'ims-chart', fileName),
    feedData: feedDataInternal,
    clearData: () => setChartData({ data: [], chartType: 'single' }),
    startStreaming: () => setRealtimeState(p => ({ ...p, isStreaming: true })),
    stopStreaming: () => setRealtimeState(p => ({ ...p, isStreaming: false })),
    dispose: () => setIsDisposed(true),
  }));

  if (isDisposed) return null;

  // ============================================================================
  // Chart Renderers
  // ============================================================================

  const commonAxisProps = {
    tick: { fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 },
    axisLine: { stroke: darkMode ? '#334155' : '#e2e8f0' },
    tickLine: { stroke: darkMode ? '#334155' : '#e2e8f0' },
  };

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: darkMode ? '#1e3a5f' : '#e2e8f0',
    opacity: 0.5,
  };

  const animationProps = animation ? { animationDuration, animationEasing: 'ease-out' as const } : { isAnimationActive: false };

  const renderBarChart = () => {
    const isHorizontal = currentType.includes('bar2d') || currentType.includes('bar3d');
    const isStacked = currentType.includes('stacked');

    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart
          data={rechartsData}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: caption ? 40 : 10, right: 30, left: 20, bottom: 5 }}
          onClick={handleChartClick}
        >
          {caption && (
            <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
              {caption}
            </text>
          )}
          <CartesianGrid {...gridProps} />
          {isHorizontal ? (
            <>
              <XAxis type="number" {...commonAxisProps} />
              <YAxis dataKey="name" type="category" {...commonAxisProps} width={80} />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                {...commonAxisProps}
                angle={labelRotation}
                textAnchor={labelRotation ? 'end' : 'middle'}
                interval={0}
                height={labelRotation ? 80 : undefined}
              />
              <YAxis {...commonAxisProps} />
            </>
          )}
          <Tooltip content={<IMSCustomTooltip />} />
          {showLegend && <Legend />}
          {series.map((s, idx) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color || colors[idx % colors.length]}
              stackId={isStacked ? 'stack' : undefined}
              radius={currentType.includes('3d') || currentType.includes('round') ? [4, 4, 0, 0] : undefined}
              {...animationProps}
            >
              {chartData.chartType === 'single' && rechartsData.map((_, cellIdx) => (
                <Cell key={cellIdx} fill={colors[cellIdx % colors.length]} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => {
    const isArea = chartCategory === 'area';
    const ChartComponent = isArea ? AreaChart : LineChart;

    return (
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent
          data={rechartsData}
          margin={{ top: caption ? 40 : 10, right: 30, left: 20, bottom: 5 }}
          onClick={handleChartClick}
        >
          {caption && (
            <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
              {caption}
            </text>
          )}
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="name"
            {...commonAxisProps}
            angle={labelRotation}
            textAnchor={labelRotation ? 'end' : 'middle'}
          />
          <YAxis {...commonAxisProps} />
          <Tooltip content={<IMSCustomTooltip />} />
          {showLegend && <Legend />}
          {isArea
            ? series.map((s, idx) => (
                <Area
                  key={s.dataKey}
                  type={s.type || 'monotone'}
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color || colors[idx % colors.length]}
                  fill={s.color || colors[idx % colors.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  {...animationProps}
                />
              ))
            : series.map((s, idx) => (
                <Line
                  key={s.dataKey}
                  type={s.type || 'monotone'}
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color || colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color || colors[idx % colors.length] }}
                  activeDot={{ r: 6 }}
                  {...animationProps}
                />
              ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const isDoughnut = currentType.includes('doughnut');

    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart onClick={handleChartClick}>
          {caption && (
            <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
              {caption}
            </text>
          )}
          <Pie
            data={rechartsData}
            cx="50%"
            cy="50%"
            innerRadius={isDoughnut ? 60 : 0}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={showLabels ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)` : false}
            {...animationProps}
          >
            {rechartsData.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<IMSCustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <ScatterChart margin={{ top: caption ? 40 : 10, right: 30, bottom: 5, left: 20 }}>
        {caption && (
          <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
            {caption}
          </text>
        )}
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="name" name={xAxisName || 'X'} {...commonAxisProps} />
        <YAxis dataKey="value" name={yAxisName || 'Y'} {...commonAxisProps} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {showLegend && <Legend />}
        <Scatter name="Data" data={rechartsData} fill={colors[0]} {...animationProps} />
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={rechartsData}>
        {caption && (
          <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
            {caption}
          </text>
        )}
        <PolarGrid stroke={darkMode ? '#1e3a5f' : '#e2e8f0'} />
        <PolarAngleAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
        <PolarRadiusAxis />
        {series.map((s, idx) => (
          <Radar
            key={s.dataKey}
            name={s.name}
            dataKey={s.dataKey}
            stroke={s.color || colors[idx % colors.length]}
            fill={s.color || colors[idx % colors.length]}
            fillOpacity={0.3}
            {...animationProps}
          />
        ))}
        <Tooltip />
        {showLegend && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderComposedChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <ComposedChart
        data={rechartsData}
        margin={{ top: caption ? 40 : 10, right: 30, left: 20, bottom: 5 }}
        onClick={handleChartClick}
      >
        {caption && (
          <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
            {caption}
          </text>
        )}
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="name" {...commonAxisProps} />
        <YAxis yAxisId="left" {...commonAxisProps} />
        {series.some(s => s.yAxisId === 'right') && (
          <YAxis yAxisId="right" orientation="right" {...commonAxisProps} />
        )}
        <Tooltip content={<IMSCustomTooltip />} />
        {showLegend && <Legend />}
        {series.map((s, idx) => {
          const color = s.color || colors[idx % colors.length];
          if (s.type === 'area') {
            return <Area key={s.dataKey} yAxisId={s.yAxisId || 'left'} type="monotone" dataKey={s.dataKey} name={s.name} fill={color} stroke={color} fillOpacity={0.2} {...animationProps} />;
          }
          if (s.type === 'line') {
            return <Line key={s.dataKey} yAxisId={s.yAxisId || 'left'} type="monotone" dataKey={s.dataKey} name={s.name} stroke={color} strokeWidth={2} dot={{ r: 4 }} {...animationProps} />;
          }
          return <Bar key={s.dataKey} yAxisId={s.yAxisId || 'left'} dataKey={s.dataKey} name={s.name} fill={color} {...animationProps} />;
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderTreemapChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <Treemap
        data={rechartsData.map((d, idx) => ({
          name: d.name,
          size: Number(d.value) || 0,
          fill: colors[idx % colors.length],
        }))}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={({ x, y, width, height, name, fill }: { x: number; y: number; width: number; height: number; name?: string; fill?: string }) => (
          <g>
            <rect x={x} y={y} width={width} height={height} fill={fill || colors[0]} stroke="#fff" strokeWidth={2} rx={4} />
            {width > 50 && height > 30 && (
              <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12}>
                {name}
              </text>
            )}
          </g>
        )}
      />
    </ResponsiveContainer>
  );

  const renderFunnelChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <FunnelChart>
        {caption && (
          <text x="50%" y={20} textAnchor="middle" className="fill-navy-800 dark:fill-navy-200 text-base font-semibold">
            {caption}
          </text>
        )}
        <Funnel
          dataKey="value"
          nameKey="name"
          data={rechartsData}
          isAnimationActive={animation}
        >
          <LabelList position="right" fill={darkMode ? '#94a3b8' : '#64748b'} stroke="none" />
          {rechartsData.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} />
          ))}
        </Funnel>
        <Tooltip />
      </FunnelChart>
    </ResponsiveContainer>
  );

  // Select chart renderer based on category
  const renderChart = () => {
    switch (chartCategory) {
      case 'bar': return renderBarChart();
      case 'line': return renderLineChart();
      case 'area': return renderLineChart();
      case 'pie': return renderPieChart();
      case 'scatter': return renderScatterChart();
      case 'radar': return renderRadarChart();
      case 'composed': return renderComposedChart();
      case 'funnel': return renderFunnelChart();
      case 'treemap': return renderTreemapChart();
      default: return renderBarChart();
    }
  };

  return (
    <div
      data-chart-id={chartId || 'ims-chart'}
      className={`ims-chart relative ${className || ''}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
    >
      {/* Drill-up button */}
      {drillDownHistory.length > 0 && (
        <button
          onClick={handleDrillUp}
          className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-navy-600 px-2 py-1 text-xs text-white hover:bg-navy-700 transition-colors"
        >
          ← Back
        </button>
      )}

      {/* Export button */}
      {exportEnabled && (
        <button
          onClick={() => exportChartAsPNG(chartId || 'ims-chart')}
          className="absolute top-2 right-2 z-10 rounded-md bg-white/80 dark:bg-navy-800/80 px-2 py-1 text-xs text-navy-600 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-700 transition-colors border border-navy-200 dark:border-navy-600"
        >
          📥 Export
        </button>
      )}

      {/* Real-time indicator */}
      {realtimeEnabled && realtimeState.isStreaming && (
        <div className="absolute top-2 right-20 z-10 flex items-center gap-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </div>
      )}

      {/* Chart */}
      {renderChart()}

      {/* Sub caption */}
      {subCaption && (
        <p className="text-center text-xs text-muted-foreground mt-1">{subCaption}</p>
      )}
    </div>
  );
});

IMSChart.displayName = 'IMSChart';

// ============================================================================
// Convenience Chart Components
// ============================================================================

/** Column chart (2D) */
export const IMSColumnChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="column2d" {...props} />
);
IMSColumnChart.displayName = 'IMSColumnChart';

/** Bar chart (2D horizontal) */
export const IMSBarChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="bar2d" {...props} />
);
IMSBarChart.displayName = 'IMSBarChart';

/** Line chart */
export const IMSLineChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="line" {...props} />
);
IMSLineChart.displayName = 'IMSLineChart';

/** Area chart */
export const IMSAreaChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="area2d" {...props} />
);
IMSAreaChart.displayName = 'IMSAreaChart';

/** Pie chart */
export const IMSPieChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="pie2d" {...props} />
);
IMSPieChart.displayName = 'IMSPieChart';

/** Doughnut chart */
export const IMSDoughnutChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="doughnut2d" {...props} />
);
IMSDoughnutChart.displayName = 'IMSDoughnutChart';

/** Multi-series column chart */
export const IMSMSColumnChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="mscolumn2d" {...props} />
);
IMSMSColumnChart.displayName = 'IMSMSColumnChart';

/** Stacked column chart */
export const IMSStackedColumnChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="stackedcolumn2d" {...props} />
);
IMSStackedColumnChart.displayName = 'IMSStackedColumnChart';

/** Composed (combination) chart */
export const IMSCombiChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="mscombi2d" {...props} />
);
IMSCombiChart.displayName = 'IMSCombiChart';

/** Scatter chart */
export const IMSScatterChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="scatter" {...props} />
);
IMSScatterChart.displayName = 'IMSScatterChart';

/** Radar chart */
export const IMSRadarChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="radar" {...props} />
);
IMSRadarChart.displayName = 'IMSRadarChart';

/** Funnel chart */
export const IMSFunnelChartComp = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="funnel" {...props} />
);
IMSFunnelChartComp.displayName = 'IMSFunnelChartComp';

/** Treemap chart */
export const IMSTreemapChart = forwardRef<IMSChartHandle, Omit<IMSChartProps, 'type'>>(
  (props, ref) => <IMSChart ref={ref} type="treemap" {...props} />
);
IMSTreemapChart.displayName = 'IMSTreemapChart';
