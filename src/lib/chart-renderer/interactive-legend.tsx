/**
 * IMS Chart Renderer - Interactive Legend Component
 * Replaces FusionCharts interactive legend with legenditemrollover/rollout/clicked
 * Implements highlight-on-hover, toggle-on-click, and scroll for many items
 * Part of IMS ERP System - Deep Navy Blue Theme
 *
 * Converted from: FusionCharts.attachEventHandlers("legenditemrollover", ...)
 *                 FusionCharts.attachEventHandlers("legenditemrollout", ...)
 *                 FusionCharts.attachEventHandlers("legenditemclicked", ...)
 */

'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  IMS_CHART_COLORS,
} from '../chart-utils/types';
import type { IMSChartType, IMSChartEventType } from '../chart-utils/types';
import {
  createHighlightEffectManager,
  applyFadeoutEffect,
  createInitialSeriesStates,
  toggleSeriesVisibility,
  highlightSeries,
  removeHighlight,
  getHighlightFill,
  getHighlightStroke,
  DEFAULT_HIGHLIGHT_CONFIG,
} from './highlight-effects';
import type {
  IMSHighlightEffectConfig,
  IMSSeriesHighlightState,
} from './highlight-effects';

// ============================================================================
// Interactive Legend Types
// ============================================================================

/** Legend item data */
export interface IMSLegendItem {
  /** Series/slice name */
  name: string;
  /** Color */
  color: string;
  /** Series index */
  seriesIndex: number;
  /** Whether visible */
  visible: boolean;
  /** Whether currently highlighted */
  highlighted: boolean;
  /** Data value (optional, for display) */
  value?: number;
  /** Percentage (optional, for pie/doughnut) */
  percent?: number;
}

/** Interactive legend configuration */
export interface IMSInteractiveLegendConfig {
  /** Legend position */
  position: 'top' | 'bottom' | 'left' | 'right';
  /** Show legend */
  show: boolean;
  /** Interactive mode (hover highlight + click toggle) */
  interactive: boolean;
  /** Highlight effect config */
  highlightConfig: Partial<IMSHighlightEffectConfig>;
  /** Number of items before scrolling */
  maxItemsBeforeScroll: number;
  /** Scroll area height */
  scrollAreaHeight: number;
  /** Icon shape */
  iconShape: 'square' | 'circle' | 'line' | 'diamond';
  /** Icon size */
  iconSize: number;
  /** Font size */
  fontSize: number;
  /** Show values in legend */
  showValues: boolean;
  /** Show percentages in legend */
  showPercent: boolean;
  /** Allow single item mode (at least one always visible) */
  allowSingleItem: boolean;
  /** Number format function */
  numberFormatter?: (value: number) => string;
}

/** Default interactive legend config */
export const DEFAULT_INTERACTIVE_LEGEND_CONFIG: IMSInteractiveLegendConfig = {
  position: 'bottom',
  show: true,
  interactive: true,
  highlightConfig: DEFAULT_HIGHLIGHT_CONFIG,
  maxItemsBeforeScroll: 10,
  scrollAreaHeight: 160,
  iconShape: 'square',
  iconSize: 12,
  fontSize: 12,
  showValues: false,
  showPercent: false,
  allowSingleItem: false,
};

/** Interactive legend event callback types */
export interface IMSInteractiveLegendCallbacks {
  /** Fired when legend item is hovered (legenditemrollover) */
  onRollover?: (item: IMSLegendItem, index: number) => void;
  /** Fired when legend item is unhovered (legenditemrollout) */
  onRollout?: (item: IMSLegendItem, index: number) => void;
  /** Fired when legend item is clicked (legenditemclicked) */
  onClicked?: (item: IMSLegendItem, index: number) => void;
}

// ============================================================================
// Hook: useInteractiveLegend
// ============================================================================

export interface UseInteractiveLegendResult {
  /** Current legend items */
  legendItems: IMSLegendItem[];
  /** Current series highlight states */
  seriesStates: IMSSeriesHighlightState[];
  /** Handle legend item mouse enter */
  handleMouseEnter: (index: number) => void;
  /** Handle legend item mouse leave */
  handleMouseLeave: () => void;
  /** Handle legend item click */
  handleClick: (index: number) => void;
  /** Get fill color for series */
  getSeriesFill: (index: number) => string;
  /** Get stroke color for series */
  getSeriesStroke: (index: number) => string;
  /** Get CSS style for series (opacity, transition) */
  getSeriesStyle: (index: number) => React.CSSProperties;
  /** Whether a series is visible */
  isSeriesVisible: (index: number) => boolean;
  /** Reset all states */
  reset: () => void;
}

/**
 * Hook for managing interactive legend state and highlight effects.
 * Replaces FusionCharts interactive legend + highlightEffect module.
 *
 * Usage:
 *   const legend = useInteractiveLegend({ seriesNames, chartType, colors });
 *   // Pass legend.handleMouseEnter/Leave/Click to legend component
 *   // Use legend.getSeriesFill/Stroke/Style for chart rendering
 */
export function useInteractiveLegend(options: {
  /** Series names */
  seriesNames: string[];
  /** Chart type */
  chartType: IMSChartType;
  /** Series colors */
  colors?: string[];
  /** Legend config */
  config?: Partial<IMSInteractiveLegendConfig>;
  /** Event callbacks */
  callbacks?: IMSInteractiveLegendCallbacks;
  /** Series values (for legend display) */
  values?: number[];
}): UseInteractiveLegendResult {
  const {
    seriesNames,
    chartType,
    colors,
    config: configOverride,
    callbacks,
    values,
  } = options;

  const config = useMemo(
    () => ({ ...DEFAULT_INTERACTIVE_LEGEND_CONFIG, ...configOverride }),
    [configOverride]
  );

  const [seriesStates, setSeriesStates] = useState<IMSSeriesHighlightState[]>(
    () => createInitialSeriesStates(seriesNames, colors)
  );

  // Update states when series names change
  useEffect(() => {
    setSeriesStates(createInitialSeriesStates(seriesNames, colors));
  }, [seriesNames, colors]);

  const legendItems: IMSLegendItem[] = useMemo(
    () =>
      seriesStates.map((state, idx) => ({
        name: seriesNames[idx] || `Series ${idx + 1}`,
        color: state.originalColor,
        seriesIndex: idx,
        visible: state.visible,
        highlighted: state.highlighted,
        value: values?.[idx],
        percent: values ? undefined : undefined,
      })),
    [seriesStates, seriesNames, values]
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (!config.interactive) return;

      setSeriesStates(prev => {
        const newStates = highlightSeries(prev, index, chartType, config.highlightConfig);
        return newStates;
      });

      callbacks?.onRollover?.(legendItems[index], index);
    },
    [config.interactive, config.highlightConfig, chartType, callbacks, legendItems]
  );

  const handleMouseLeave = useCallback(() => {
    if (!config.interactive) return;

    setSeriesStates(prev => {
      const newStates = removeHighlight(prev, chartType, config.highlightConfig);
      return newStates;
    });

    callbacks?.onRollout?.(
      { name: '', color: '', seriesIndex: -1, visible: true, highlighted: false },
      -1
    );
  }, [config.interactive, config.highlightConfig, chartType, callbacks]);

  const handleClick = useCallback(
    (index: number) => {
      if (!config.interactive) return;

      // Don't allow hiding if it's the last visible item
      if (!config.allowSingleItem) {
        const visibleCount = seriesStates.filter(s => s.visible).length;
        if (visibleCount <= 1 && seriesStates[index]?.visible) return;
      }

      setSeriesStates(prev => {
        const newStates = toggleSeriesVisibility(prev, index);
        return newStates;
      });

      callbacks?.onClicked?.(legendItems[index], index);
    },
    [config.interactive, config.allowSingleItem, seriesStates, callbacks, legendItems]
  );

  const getSeriesFill = useCallback(
    (index: number): string => {
      const state = seriesStates[index];
      if (!state) return IMS_CHART_COLORS[0];
      return getHighlightFill(state.originalColor, state);
    },
    [seriesStates]
  );

  const getSeriesStroke = useCallback(
    (index: number): string => {
      const state = seriesStates[index];
      if (!state) return IMS_CHART_COLORS[0];
      return getHighlightStroke(state.originalColor, state);
    },
    [seriesStates]
  );

  const getSeriesStyle = useCallback(
    (index: number): React.CSSProperties => {
      const state = seriesStates[index];
      if (!state) return {};
      return {
        opacity: state.opacity,
        transition: `opacity ${DEFAULT_HIGHLIGHT_CONFIG.animationDuration}ms ${DEFAULT_HIGHLIGHT_CONFIG.animationEasing}`,
      };
    },
    [seriesStates]
  );

  const isSeriesVisible = useCallback(
    (index: number): boolean => {
      return seriesStates[index]?.visible ?? true;
    },
    [seriesStates]
  );

  const reset = useCallback(() => {
    setSeriesStates(createInitialSeriesStates(seriesNames, colors));
  }, [seriesNames, colors]);

  return {
    legendItems,
    seriesStates,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    getSeriesFill,
    getSeriesStroke,
    getSeriesStyle,
    isSeriesVisible,
    reset,
  };
}

// ============================================================================
// Interactive Legend Component
// ============================================================================

export interface IMSInteractiveLegendProps {
  /** Legend items */
  items: IMSLegendItem[];
  /** Legend configuration */
  config?: Partial<IMSInteractiveLegendConfig>;
  /** Mouse enter handler */
  onMouseEnter?: (index: number) => void;
  /** Mouse leave handler */
  onMouseLeave?: () => void;
  /** Click handler */
  onClick?: (index: number) => void;
  /** Dark mode */
  darkMode?: boolean;
  /** Class name */
  className?: string;
}

/**
 * Interactive Legend Component.
 * Replaces FusionCharts built-in interactive legend.
 * Features: hover highlight, click toggle, scroll for many items.
 */
export function IMSInteractiveLegend({
  items,
  config: configOverride,
  onMouseEnter,
  onMouseLeave,
  onClick,
  darkMode = false,
  className,
}: IMSInteractiveLegendProps) {
  const config = { ...DEFAULT_INTERACTIVE_LEGEND_CONFIG, ...configOverride };
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!config.show || items.length === 0) return null;

  const needsScroll = items.length > config.maxItemsBeforeScroll;

  // Determine layout based on position
  const isVertical = config.position === 'left' || config.position === 'right';
  const isTopOrBottom = config.position === 'top' || config.position === 'bottom';

  const containerClass = isVertical
    ? 'flex flex-col gap-2'
    : 'flex flex-wrap gap-x-4 gap-y-1.5 justify-center';

  // Icon renderer
  const renderIcon = (color: string, visible: boolean, highlighted: boolean) => {
    const opacityStyle = !visible ? { opacity: 0.35 } : highlighted ? { opacity: 1 } : { opacity: 0.85 };
    const size = config.iconSize;
    const shapeClass = config.iconShape === 'circle'
      ? 'rounded-full'
      : config.iconShape === 'diamond'
        ? 'rotate-45'
        : config.iconShape === 'line'
          ? 'rounded-sm h-[3px]'
          : 'rounded-sm';

    if (config.iconShape === 'line') {
      return (
        <span
          className={`inline-block shrink-0 ${shapeClass}`}
          style={{
            width: size * 1.5,
            height: 3,
            backgroundColor: color,
            ...opacityStyle,
            transition: 'opacity 200ms ease-out',
          }}
        />
      );
    }

    return (
      <span
        className={`inline-block shrink-0 ${shapeClass}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          ...opacityStyle,
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
          transform: highlighted ? 'scale(1.15)' : 'scale(1)',
        }}
      />
    );
  };

  return (
    <div
      className={`ims-interactive-legend ${className || ''}`}
      style={{
        padding: '8px 12px',
        ...(isTopOrBottom ? { width: '100%' } : {}),
      }}
      role="list"
      aria-label="Chart legend"
    >
      <div
        ref={scrollRef}
        className={containerClass}
        style={{
          maxHeight: needsScroll ? config.scrollAreaHeight : undefined,
          overflowY: needsScroll ? 'auto' : undefined,
          scrollbarWidth: 'thin',
        }}
      >
        {items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="flex items-center gap-2 cursor-pointer select-none group"
            style={{
              padding: '3px 6px',
              borderRadius: '4px',
              transition: 'background-color 150ms ease-out',
            }}
            role="listitem"
            tabIndex={0}
            aria-label={`${item.name}${!item.visible ? ' (hidden)' : ''}`}
            onMouseEnter={() => onMouseEnter?.(idx)}
            onMouseLeave={() => onMouseLeave?.()}
            onClick={() => onClick?.(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(idx);
              }
            }}
          >
            {renderIcon(item.color, item.visible, item.highlighted)}
            <span
              className="whitespace-nowrap"
              style={{
                fontSize: config.fontSize,
                color: darkMode
                  ? (item.visible ? '#cbd5e1' : '#475569')
                  : (item.visible ? '#1e293b' : '#94a3b8'),
                textDecoration: item.visible ? 'none' : 'line-through',
                transition: 'color 200ms ease-out',
                lineHeight: 1.4,
              }}
            >
              {item.name}
            </span>
            {config.showValues && item.value !== undefined && (
              <span
                style={{
                  fontSize: config.fontSize - 1,
                  color: darkMode ? '#64748b' : '#94a3b8',
                  marginLeft: 2,
                }}
              >
                ({item.value.toLocaleString()})
              </span>
            )}
            {config.showPercent && item.percent !== undefined && (
              <span
                style={{
                  fontSize: config.fontSize - 1,
                  color: darkMode ? '#64748b' : '#94a3b8',
                  marginLeft: 2,
                }}
              >
                ({item.percent.toFixed(1)}%)
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      {needsScroll && (
        <div
          className="text-center mt-1"
          style={{ fontSize: 10, color: darkMode ? '#475569' : '#94a3b8' }}
        >
          ↕ Scroll for more
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Pie/Doughnut Legend (Single Series with Slice Colors)
// ============================================================================

export interface IMSPieLegendProps {
  /** Slice data: name, value, color */
  slices: Array<{ name: string; value: number; color: string; percent?: number }>;
  /** Legend configuration */
  config?: Partial<IMSInteractiveLegendConfig>;
  /** Highlighted slice index */
  highlightedIndex: number | null;
  /** On hover handler */
  onSliceHover?: (index: number | null) => void;
  /** On click handler */
  onSliceClick?: (index: number) => void;
  /** Dark mode */
  darkMode?: boolean;
  /** Class name */
  className?: string;
}

/**
 * Pie/Doughnut-specific legend with highlight effects.
 * Replaces FusionCharts pie/doughnut legend with interactive rollover.
 */
export function IMSPieLegend({
  slices,
  config: configOverride,
  highlightedIndex,
  onSliceHover,
  onSliceClick,
  darkMode = false,
  className,
}: IMSPieLegendProps) {
  const config = { ...DEFAULT_INTERACTIVE_LEGEND_CONFIG, ...configOverride };
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!config.show || slices.length === 0) return null;

  const needsScroll = slices.length > config.maxItemsBeforeScroll;

  return (
    <div
      className={`ims-pie-legend ${className || ''}`}
      style={{ padding: '8px 12px', width: '100%' }}
      role="list"
      aria-label="Chart legend"
    >
      <div
        ref={scrollRef}
        className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center"
        style={{
          maxHeight: needsScroll ? config.scrollAreaHeight : undefined,
          overflowY: needsScroll ? 'auto' : undefined,
          scrollbarWidth: 'thin',
        }}
      >
        {slices.map((slice, idx) => {
          const isHighlighted = highlightedIndex === idx;
          const iconOpacity = highlightedIndex !== null && !isHighlighted ? 0.3 : 1;
          const textOpacity = highlightedIndex !== null && !isHighlighted ? 0.5 : 1;

          return (
            <div
              key={`${slice.name}-${idx}`}
              className="flex items-center gap-2 cursor-pointer select-none"
              style={{
                padding: '3px 6px',
                borderRadius: '4px',
                transition: 'background-color 150ms ease-out',
              }}
              role="listitem"
              tabIndex={0}
              aria-label={slice.name}
              onMouseEnter={() => onSliceHover?.(idx)}
              onMouseLeave={() => onSliceHover?.(null)}
              onClick={() => onSliceClick?.(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSliceClick?.(idx);
                }
              }}
            >
              <span
                className="inline-block shrink-0 rounded-sm"
                style={{
                  width: config.iconSize,
                  height: config.iconSize,
                  backgroundColor: slice.color,
                  opacity: iconOpacity,
                  transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
                  transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                }}
              />
              <span
                className="whitespace-nowrap"
                style={{
                  fontSize: config.fontSize,
                  color: darkMode ? '#cbd5e1' : '#1e293b',
                  opacity: textOpacity,
                  transition: 'opacity 200ms ease-out',
                  lineHeight: 1.4,
                }}
              >
                {slice.name}
                {slice.percent !== undefined && (
                  <span style={{ color: darkMode ? '#64748b' : '#94a3b8', marginLeft: 4 }}>
                    ({slice.percent.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {needsScroll && (
        <div
          className="text-center mt-1"
          style={{ fontSize: 10, color: darkMode ? '#475569' : '#94a3b8' }}
        >
          ↕ Scroll for more
        </div>
      )}
    </div>
  );
}
