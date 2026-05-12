'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  useInteractiveLegend,
  IMSInteractiveLegend,
  IMSPieLegend,
} from '@/lib/chart-renderer/interactive-legend';
import {
  FINT_THEME,
  getThemeConfig,
  getThemePalette,
  resolveThemeAttributes,
  applyDarkModeOverrides,
  registerTheme,
} from '@/lib/chart-renderer/chart-themes';
import { IMS_CHART_COLORS, IMS_CHART_COLORS_DARK } from '@/lib/chart-utils/types';
import type { IMSChartType } from '@/lib/chart-utils/types';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Palette,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';

// ============================================================================
// Register FINT theme on module load
// ============================================================================
registerTheme(FINT_THEME);

// ============================================================================
// Mock ERP Data
// ============================================================================

/** Monthly sales data (bar chart) */
const monthlySalesData = [
  { month: 'Jan', sales: 42500, target: 40000 },
  { month: 'Feb', sales: 38200, target: 42000 },
  { month: 'Mar', sales: 51800, target: 45000 },
  { month: 'Apr', sales: 47600, target: 46000 },
  { month: 'May', sales: 53900, target: 48000 },
  { month: 'Jun', sales: 61200, target: 50000 },
  { month: 'Jul', sales: 58400, target: 52000 },
  { month: 'Aug', sales: 55100, target: 54000 },
  { month: 'Sep', sales: 63800, target: 56000 },
  { month: 'Oct', sales: 59200, target: 58000 },
  { month: 'Nov', sales: 67500, target: 60000 },
  { month: 'Dec', sales: 72100, target: 62000 },
];

/** Revenue trends data (line chart) */
const revenueTrendsData = [
  { month: 'Jan', revenue: 125000, expenses: 98000, profit: 27000 },
  { month: 'Feb', revenue: 138000, expenses: 102000, profit: 36000 },
  { month: 'Mar', revenue: 152000, expenses: 108000, profit: 44000 },
  { month: 'Apr', revenue: 141000, expenses: 105000, profit: 36000 },
  { month: 'May', revenue: 165000, expenses: 112000, profit: 53000 },
  { month: 'Jun', revenue: 178000, expenses: 118000, profit: 60000 },
  { month: 'Jul', revenue: 172000, expenses: 115000, profit: 57000 },
  { month: 'Aug', revenue: 185000, expenses: 121000, profit: 64000 },
  { month: 'Sep', revenue: 195000, expenses: 126000, profit: 69000 },
  { month: 'Oct', revenue: 188000, expenses: 123000, profit: 65000 },
  { month: 'Nov', revenue: 210000, expenses: 132000, profit: 78000 },
  { month: 'Dec', revenue: 228000, expenses: 138000, profit: 90000 },
];

/** Product category distribution data (pie chart) */
const productCategoryData = [
  { name: 'Electronics', value: 35200, color: '#1e3a5f' },
  { name: 'Clothing', value: 24800, color: '#2d5a8e' },
  { name: 'Food & Beverage', value: 18600, color: '#18bc9c' },
  { name: 'Office Supplies', value: 14200, color: '#f39c12' },
  { name: 'Raw Materials', value: 11400, color: '#e74c3c' },
  { name: 'Packaging', value: 8900, color: '#9b59b6' },
  { name: 'Others', value: 6800, color: '#1abc9c' },
];

/** Inventory levels data (area chart) */
const inventoryLevelsData = [
  { week: 'W1', warehouse: 12500, storefront: 8200, inTransit: 3100 },
  { week: 'W2', warehouse: 13200, storefront: 7800, inTransit: 3400 },
  { week: 'W3', warehouse: 11800, storefront: 8500, inTransit: 2900 },
  { week: 'W4', warehouse: 14100, storefront: 9100, inTransit: 3600 },
  { week: 'W5', warehouse: 13600, storefront: 8800, inTransit: 3200 },
  { week: 'W6', warehouse: 15200, storefront: 9500, inTransit: 3800 },
  { week: 'W7', warehouse: 14800, storefront: 10200, inTransit: 4100 },
  { week: 'W8', warehouse: 15900, storefront: 9800, inTransit: 3700 },
  { week: 'W9', warehouse: 16400, storefront: 10500, inTransit: 4300 },
  { week: 'W10', warehouse: 15800, storefront: 11000, inTransit: 3900 },
  { week: 'W11', warehouse: 17100, storefront: 11200, inTransit: 4500 },
  { week: 'W12', warehouse: 18500, storefront: 11800, inTransit: 4800 },
];

// ============================================================================
// Custom Tooltip Component (Deep Navy Blue themed)
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  prefix?: string;
}

function IMSCustomTooltip({ active, payload, label, prefix = '' }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-lg border border-navy-200 dark:border-navy-700 shadow-lg p-3"
      style={{
        backgroundColor: '#0a1628',
        color: '#ffffff',
        fontSize: 12,
      }}
    >
      <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          <span className="font-medium">{entry.name}:</span>{' '}
          {prefix}{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// Main Charts Showcase Component
// ============================================================================

export default function ChartsShowcase() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get FINT theme config for current mode
  const themeConfig = useMemo(() => {
    const base = resolveThemeAttributes('fint', 'column2d');
    return isDarkMode ? applyDarkModeOverrides(base) : base;
  }, [isDarkMode]);

  const palette = isDarkMode ? IMS_CHART_COLORS_DARK : IMS_CHART_COLORS;

  // Toggle dark mode handler
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <div className="space-y-8">
      {/* ================================================================== */}
      {/* Section: Header & Theme Toggle                                      */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <BarChart3 className="size-5" />
            IMS Chart Renderer Showcase
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts jQuery Plugin v1.0.5 — Interactive charts using Recharts with Deep Navy Blue FINT theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="gap-2"
            >
              {isDarkMode ? (
                <>
                  <Sun className="size-4" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="size-4" /> Dark Mode
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              FINT Theme v{FINT_THEME.version} — Palette: {palette.slice(0, 5).map((c, i) => (
                <span
                  key={i}
                  className="inline-block size-3 rounded-sm mx-0.5 align-middle"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 1: Bar Chart — Monthly Sales                                */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <BarChart3 className="size-5" />
            Bar Chart — Monthly Sales
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts column2d / mscolumn2d — Monthly sales vs target with interactive legend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartWithLegend isDarkMode={isDarkMode} palette={palette} />
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 2: Line Chart — Revenue Trends                              */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <LineChartIcon className="size-5" />
            Line Chart — Revenue Trends
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts msline — Revenue, expenses, and profit trends with interactive legend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineChartWithLegend isDarkMode={isDarkMode} palette={palette} />
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 3: Pie Chart — Product Category Distribution                */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <PieChartIcon className="size-5" />
            Pie Chart — Product Category Distribution
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts pie2d — Product category distribution with interactive legend and fadeout highlight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PieChartWithLegend isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 4: Area Chart — Inventory Levels                            */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <AreaChartIcon className="size-5" />
            Area Chart — Inventory Levels
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts msarea / mssplinearea — Inventory tracking across warehouse, storefront, and in-transit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChartWithLegend isDarkMode={isDarkMode} palette={palette} />
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 5: Theme Configuration Demo                                 */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <Palette className="size-5" />
            FINT Theme Configuration
          </CardTitle>
          <CardDescription>
            Replaces: FusionCharts.register(&quot;theme&quot;, &#123; name: &quot;fint&quot; &#125;) — Theme attributes resolved from the FINT theme registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeConfigDemo isDarkMode={isDarkMode} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Bar Chart with Interactive Legend
// ============================================================================

function BarChartWithLegend({ isDarkMode, palette }: { isDarkMode: boolean; palette: string[] }) {
  const seriesNames = ['Sales', 'Target'];
  const colors = [palette[0], palette[4]];

  const {
    legendItems,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    getSeriesFill,
    getSeriesStyle,
    isSeriesVisible,
    reset,
  } = useInteractiveLegend({
    seriesNames,
    chartType: 'mscolumn2d' as IMSChartType,
    colors,
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={monthlySalesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#334155' : '#e2e8f0'}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
          />
          <YAxis
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<IMSCustomTooltip prefix="$" />} />
          <Bar
            dataKey="sales"
            name="Sales"
            fill={getSeriesFill(0)}
            style={getSeriesStyle(0)}
            radius={[4, 4, 0, 0]}
            hide={!isSeriesVisible(0)}
          />
          <Bar
            dataKey="target"
            name="Target"
            fill={getSeriesFill(1)}
            style={getSeriesStyle(1)}
            radius={[4, 4, 0, 0]}
            hide={!isSeriesVisible(1)}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Interactive Legend */}
      <div className="mt-2 flex items-center justify-between">
        <IMSInteractiveLegend
          items={legendItems}
          config={{ position: 'bottom', iconShape: 'square', showValues: true }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          darkMode={isDarkMode}
        />
        <Button variant="ghost" size="xs" onClick={reset} className="gap-1">
          <RotateCcw className="size-3" /> Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Line Chart with Interactive Legend
// ============================================================================

function LineChartWithLegend({ isDarkMode, palette }: { isDarkMode: boolean; palette: string[] }) {
  const seriesNames = ['Revenue', 'Expenses', 'Profit'];
  const colors = [palette[0], palette[5], palette[4]];

  const {
    legendItems,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    getSeriesFill,
    getSeriesStyle,
    isSeriesVisible,
    reset,
  } = useInteractiveLegend({
    seriesNames,
    chartType: 'msline' as IMSChartType,
    colors,
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={revenueTrendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#334155' : '#e2e8f0'}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
          />
          <YAxis
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<IMSCustomTooltip prefix="$" />} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={getSeriesFill(0)}
            strokeWidth={isSeriesVisible(0) ? 2.5 : 0}
            style={getSeriesStyle(0)}
            dot={{ r: 4, fill: getSeriesFill(0) }}
            activeDot={{ r: 6 }}
            hide={!isSeriesVisible(0)}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={getSeriesFill(1)}
            strokeWidth={isSeriesVisible(1) ? 2.5 : 0}
            style={getSeriesStyle(1)}
            dot={{ r: 4, fill: getSeriesFill(1) }}
            activeDot={{ r: 6 }}
            hide={!isSeriesVisible(1)}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke={getSeriesFill(2)}
            strokeWidth={isSeriesVisible(2) ? 2.5 : 0}
            style={getSeriesStyle(2)}
            dot={{ r: 4, fill: getSeriesFill(2) }}
            activeDot={{ r: 6 }}
            hide={!isSeriesVisible(2)}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Interactive Legend */}
      <div className="mt-2 flex items-center justify-between">
        <IMSInteractiveLegend
          items={legendItems.map((item, idx) => ({
            ...item,
            value: [revenueTrendsData[revenueTrendsData.length - 1].revenue, revenueTrendsData[revenueTrendsData.length - 1].expenses, revenueTrendsData[revenueTrendsData.length - 1].profit][idx],
          }))}
          config={{ position: 'bottom', iconShape: 'line', showValues: true }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          darkMode={isDarkMode}
        />
        <Button variant="ghost" size="xs" onClick={reset} className="gap-1">
          <RotateCcw className="size-3" /> Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Pie Chart with Interactive Legend
// ============================================================================

function PieChartWithLegend({ isDarkMode }: { isDarkMode: boolean }) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());

  const total = productCategoryData.reduce((sum, d) => sum + d.value, 0);

  const handleSliceHover = useCallback((index: number | null) => {
    setHighlightedIndex(index);
  }, []);

  const handleSliceClick = useCallback((index: number) => {
    setHiddenIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Build pie slices with percentages, excluding hidden
  const visibleData = productCategoryData.filter((_, i) => !hiddenIndices.has(i));

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={visibleData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={0}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
            stroke={isDarkMode ? '#1e293b' : '#ffffff'}
            strokeWidth={2}
          >
            {visibleData.map((entry, index) => {
              const isHighlighted = highlightedIndex === index;
              const isFaded = highlightedIndex !== null && !isHighlighted;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={isFaded ? 0.3 : 1}
                  style={{
                    transition: 'opacity 200ms ease-out',
                    transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip content={<IMSCustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Pie-specific legend with fadeout highlight */}
      <IMSPieLegend
        slices={productCategoryData.map((d) => ({
          name: d.name,
          value: d.value,
          color: d.color,
          percent: (d.value / total) * 100,
        }))}
        config={{ position: 'bottom', iconShape: 'square', showPercent: true }}
        highlightedIndex={highlightedIndex}
        onSliceHover={handleSliceHover}
        onSliceClick={handleSliceClick}
        darkMode={isDarkMode}
      />
    </div>
  );
}

// ============================================================================
// Area Chart with Interactive Legend
// ============================================================================

function AreaChartWithLegend({ isDarkMode, palette }: { isDarkMode: boolean; palette: string[] }) {
  const seriesNames = ['Warehouse', 'Storefront', 'In Transit'];
  const colors = [palette[0], palette[4], palette[5]];

  const {
    legendItems,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    getSeriesFill,
    getSeriesStyle,
    isSeriesVisible,
    reset,
  } = useInteractiveLegend({
    seriesNames,
    chartType: 'msarea' as IMSChartType,
    colors,
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={inventoryLevelsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#334155' : '#e2e8f0'}
          />
          <XAxis
            dataKey="week"
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
          />
          <YAxis
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            axisLine={{ stroke: isDarkMode ? '#475569' : '#94a3b8' }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<IMSCustomTooltip />} />
          <Area
            type="monotone"
            dataKey="warehouse"
            name="Warehouse"
            fill={getSeriesFill(0)}
            stroke={getSeriesFill(0)}
            fillOpacity={0.4}
            style={getSeriesStyle(0)}
            hide={!isSeriesVisible(0)}
          />
          <Area
            type="monotone"
            dataKey="storefront"
            name="Storefront"
            fill={getSeriesFill(1)}
            stroke={getSeriesFill(1)}
            fillOpacity={0.4}
            style={getSeriesStyle(1)}
            hide={!isSeriesVisible(1)}
          />
          <Area
            type="monotone"
            dataKey="inTransit"
            name="In Transit"
            fill={getSeriesFill(2)}
            stroke={getSeriesFill(2)}
            fillOpacity={0.4}
            style={getSeriesStyle(2)}
            hide={!isSeriesVisible(2)}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Interactive Legend */}
      <div className="mt-2 flex items-center justify-between">
        <IMSInteractiveLegend
          items={legendItems}
          config={{ position: 'bottom', iconShape: 'square' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          darkMode={isDarkMode}
        />
        <Button variant="ghost" size="xs" onClick={reset} className="gap-1">
          <RotateCcw className="size-3" /> Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Theme Configuration Demo
// ============================================================================

function ThemeConfigDemo({ isDarkMode }: { isDarkMode: boolean }) {
  const chartTypes: IMSChartType[] = [
    'column2d', 'mscolumn2d', 'line', 'msline',
    'area2d', 'msarea', 'pie2d', 'doughnut2d',
    'bar2d', 'stackedcolumn2d',
  ];

  const [selectedType, setSelectedType] = useState<IMSChartType>('column2d');

  const config = useMemo(() => {
    const base = resolveThemeAttributes('fint', selectedType);
    return isDarkMode ? applyDarkModeOverrides(base) : base;
  }, [selectedType, isDarkMode]);

  const pal = config.paletteColors;

  return (
    <div className="space-y-4">
      {/* Chart type selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="xs"
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Resolved palette */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">
          Resolved Palette for &quot;{selectedType}&quot;
        </h4>
        <div className="flex gap-2 items-center">
          {pal.map((color, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className="size-10 rounded-md border border-navy-200 dark:border-navy-700 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key theme attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
        <ThemeAttr label="Background" value={config.bgColor} color={config.bgColor} />
        <ThemeAttr label="Canvas BG" value={config.canvasBgColor} color={config.canvasBgColor} />
        <ThemeAttr label="Font Color" value={config.baseFontColor} color={config.baseFontColor} />
        <ThemeAttr label="Tooltip BG" value={config.toolTipBgColor} color={config.toolTipBgColor} />
        <ThemeAttr label="Div Line" value={config.divlineColor} color={config.divlineColor} />
        <ThemeAttr label="X-Axis Line" value={config.xAxisLineColor} color={config.xAxisLineColor} />
        <ThemeAttr label="Scroll Color" value={config.scrollColor} color={config.scrollColor} />
        <ThemeAttr label="Legend Font" value={config.legendItemFontColor} color={config.legendItemFontColor} />
      </div>

      {/* Key boolean flags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <FlagChip label="Hover Effect" value={config.showHoverEffect} />
        <FlagChip label="Interactive Legend" value={config.interactiveLegend} />
        <FlagChip label="Show Values" value={config.showValues} />
        <FlagChip label="Round Edges" value={config.useRoundEdges} />
        <FlagChip label="3D Lighting" value={config.use3DLighting} />
        <FlagChip label="Plot Gradient" value={config.usePlotGradientColor} />
        <FlagChip label="Animation" value={config.animation} />
        <FlagChip label="Dashed Lines" value={config.divLineIsDashed} />
      </div>
    </div>
  );
}

function ThemeAttr({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-navy-50/50 dark:bg-navy-900/30">
      <div
        className="size-4 rounded-sm border border-navy-200 dark:border-navy-700 shrink-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="font-medium text-navy-700 dark:text-navy-200">{label}</div>
        <div className="font-mono text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}

function FlagChip({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`px-2 py-1 rounded text-center font-medium ${
      value
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
    }`}>
      {label}: {value ? 'ON' : 'OFF'}
    </div>
  );
}
