/**
 * IMS Chart Renderer - Zoom/Scroll, Cross-line Tooltip, Toolbar
 * Replaces FusionCharts zoomline, scroll charts, toolbar, and cross-line system
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ============================================================================
// Zoom/Scroll Viewport State
// ============================================================================

export interface ViewPortConfig {
  /** Start data index */
  dsi: number;
  /** End data index */
  dei: number;
  /** Visible data length */
  vdl: number;
  /** Total category length */
  clen: number;
  /** Scale X factor */
  scaleX: number;
  /** Scroll position (0-1) */
  scrollPosition: number;
  /** Whether scroll is enabled */
  scrollEnabled: boolean;
  /** Pixels per point */
  ppp: number;
  /** Visible labels count */
  numVisibleLabels: number;
  /** Step between rendered points */
  step: number;
}

export interface ViewPortHistoryEntry {
  dsi: number;
  dei: number;
  vdl: number;
  scaleX: number;
  x?: number;
  y?: number;
  scaleY?: number;
}

/**
 * Hook for zoom/scroll chart viewport management.
 * Replaces FusionCharts zoomline viewport configuration.
 */
export function useChartViewport(
  totalCategories: number,
  canvasWidth: number,
  options?: {
    pixelsPerPoint?: number;
    numVisibleLabels?: number;
    scrollToEnd?: boolean;
    maxZoomLimit?: number;
  }
) {
  const {
    pixelsPerPoint = 15,
    numVisibleLabels = 0,
    scrollToEnd = false,
    maxZoomLimit = 1000,
  } = options || {};

  const [viewPortConfig, setViewPortConfig] = useState<ViewPortConfig>({
    dsi: 0,
    dei: Math.min(totalCategories - 1, Math.floor(canvasWidth / pixelsPerPoint)),
    vdl: Math.min(totalCategories, Math.floor(canvasWidth / pixelsPerPoint)),
    clen: totalCategories,
    scaleX: 1,
    scrollPosition: 0,
    scrollEnabled: false,
    ppp: pixelsPerPoint,
    step: 1,
  });

  const [viewPortHistory, setViewPortHistory] = useState<ViewPortHistoryEntry[]>([]);

  // Keep a ref for current viewPortConfig to avoid stale closures
  const viewPortConfigRef = useRef(viewPortConfig);
  useEffect(() => { viewPortConfigRef.current = viewPortConfig; }, [viewPortConfig]);

  /** Zoom to a specific data range */
  const zoomTo = useCallback(
    (startIdx: number, endIdx: number) => {
      if (startIdx < 0) startIdx = 0;
      if (startIdx >= totalCategories - 1) startIdx = totalCategories - 1;
      if (endIdx <= startIdx) endIdx = startIdx + 1;
      if (endIdx > totalCategories - 1) endIdx = totalCategories - 1;

      const vdl = endIdx - startIdx;
      const scaleX = Math.min(totalCategories / vdl, maxZoomLimit);
      const currentConfig = viewPortConfigRef.current;

      // Save current state to history
      setViewPortHistory(prev => [
        ...prev,
        {
          dsi: currentConfig.dsi,
          dei: currentConfig.dei,
          vdl: currentConfig.vdl,
          scaleX: currentConfig.scaleX,
        },
      ]);

      setViewPortConfig(prev => ({
        ...prev,
        dsi: startIdx,
        dei: endIdx,
        vdl,
        scaleX,
        scrollPosition: startIdx / (totalCategories - vdl - 1 || 1),
        scrollEnabled: vdl < totalCategories - 1,
        step: scaleX > 3 ? Math.ceil(scaleX / 3) : 1,
      }));

      return { startIndex: startIdx, endIndex: endIdx };
    },
    [totalCategories, maxZoomLimit]
  );

  // Keep ref for viewPortHistory
  const viewPortHistoryRef = useRef(viewPortHistory);
  useEffect(() => { viewPortHistoryRef.current = viewPortHistory; }, [viewPortHistory]);

  /** Zoom out one level */
  const zoomOut = useCallback(() => {
    const history = viewPortHistoryRef.current;
    if (history.length === 0) return false;

    const prev = history[history.length - 1];
    setViewPortHistory(h => h.slice(0, -1));
    setViewPortConfig(config => ({
      ...config,
      dsi: prev.dsi,
      dei: prev.dei,
      vdl: prev.vdl,
      scaleX: prev.scaleX,
      scrollPosition: prev.dsi / (totalCategories - prev.vdl - 1 || 1),
      scrollEnabled: prev.vdl < totalCategories - 1,
      step: prev.scaleX > 3 ? Math.ceil(prev.scaleX / 3) : 1,
    }));

    return true;
  }, [totalCategories]);

  /** Reset zoom to original view */
  const resetZoom = useCallback(() => {
    setViewPortHistory([]);
    setViewPortConfig(config => ({
      ...config,
      dsi: 0,
      dei: totalCategories - 1,
      vdl: totalCategories,
      scaleX: 1,
      scrollPosition: 0,
      scrollEnabled: false,
      step: 1,
    }));

    return true;
  }, [totalCategories]);

  /** Scroll to a position (0-1) */
  const scrollTo = useCallback(
    (position: number) => {
      setViewPortConfig(prev => {
        const dsi = Math.round(position * (totalCategories - prev.vdl - 1));
        return {
          ...prev,
          dsi,
          dei: dsi + prev.vdl,
          scrollPosition: position,
        };
      });
    },
    [totalCategories]
  );

  /** Zoom by pixel range (for drag-select zoom) */
  const zoomRangePixels = useCallback(
    (startPx: number, endPx: number) => {
      const startIdx = Math.floor(startPx / viewPortConfig.ppp) + viewPortConfig.dsi;
      const endIdx = Math.floor(endPx / viewPortConfig.ppp) + viewPortConfig.dsi;
      return zoomTo(startIdx, endIdx);
    },
    [viewPortConfig.ppp, viewPortConfig.dsi, zoomTo]
  );

  return {
    viewPortConfig,
    viewPortHistory,
    zoomTo,
    zoomOut,
    resetZoom,
    scrollTo,
    zoomRangePixels,
  };
}

// ============================================================================
// Cross-line Tooltip
// ============================================================================

export interface CrossLineConfig {
  /** Whether cross-line is enabled */
  enabled: boolean;
  /** Line color */
  lineColor: string;
  /** Line width */
  lineWidth: number;
  /** Line alpha (0-100) */
  lineAlpha: number;
  /** Show label */
  showLabel: boolean;
  /** Show values */
  showValues: boolean;
  /** Label font size */
  labelFontSize: number;
  /** Value font size */
  valueFontSize: number;
  /** Separator character */
  tooltipSepChar: string;
}

const DEFAULT_CROSSLINE_CONFIG: CrossLineConfig = {
  enabled: true,
  lineColor: '#1a2332',
  lineWidth: 1,
  lineAlpha: 20,
  showLabel: true,
  showValues: true,
  labelFontSize: 12,
  valueFontSize: 11,
  tooltipSepChar: ', ',
};

/**
 * Hook for cross-line tooltip on zoom/scroll charts.
 * Replaces FusionCharts ua (crossline) prototype methods.
 */
export function useCrossLineTooltip(
  config?: Partial<CrossLineConfig>
) {
  const mergedConfig = { ...DEFAULT_CROSSLINE_CONFIG, ...config };
  const [position, setPosition] = useState<number | null>(null);
  const [isHidden, setIsHidden] = useState(true);

  const handleMouseMove = useCallback(
    (clientX: number, containerRect: DOMRect, canvasLeft: number, canvasWidth: number) => {
      if (!mergedConfig.enabled) return;

      const relativeX = clientX - containerRect.left - canvasLeft;
      if (relativeX < 0 || relativeX > canvasWidth) {
        setIsHidden(true);
        setPosition(null);
        return;
      }

      setPosition(relativeX);
      setIsHidden(false);
    },
    [mergedConfig.enabled]
  );

  const handleMouseOut = useCallback(() => {
    setIsHidden(true);
    setPosition(null);
  }, []);

  return {
    crossLineConfig: mergedConfig,
    crossLinePosition: position,
    isCrossLineHidden: isHidden,
    handleMouseMove,
    handleMouseOut,
  };
}

// ============================================================================
// Scroll Bar Component
// ============================================================================

export interface ChartScrollBarProps {
  /** Scroll position (0-1) */
  scrollPosition: number;
  /** Scroll ratio (visible/total) */
  scrollRatio: number;
  /** Bar width */
  width: number;
  /** Bar height */
  height?: number;
  /** Background color */
  bgColor?: string;
  /** Thumb color */
  thumbColor?: string;
  /** Border radius */
  borderRadius?: number;
  /** Show scroll buttons */
  showButtons?: boolean;
  /** On scroll callback */
  onScroll?: (position: number) => void;
}

/**
 * Chart scroll bar component.
 * Replaces FusionCharts scrollBar rendering.
 */
export function ChartScrollBar({
  scrollPosition,
  scrollRatio,
  width,
  height = 16,
  bgColor = '#e2e8f0',
  thumbColor = '#1e3a5f',
  borderRadius = 3,
  showButtons = true,
  onScroll,
}: ChartScrollBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const thumbWidth = Math.max(scrollRatio * width, 30);
  const thumbPosition = scrollPosition * (width - thumbWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;

      const bar = barRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const x = e.clientX - rect.left - thumbWidth / 2;
        const maxPos = width - thumbWidth;
        const pos = Math.max(0, Math.min(x, maxPos));
        onScroll?.(pos / maxPos);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, thumbWidth, onScroll]
  );

  return (
    <div
      ref={barRef}
      className="relative"
      style={{
        width,
        height,
        backgroundColor: bgColor,
        borderRadius,
        cursor: 'pointer',
      }}
    >
      {/* Track */}
      <div
        className="absolute inset-0 rounded"
        style={{ backgroundColor: bgColor }}
      />

      {/* Scroll thumb */}
      <div
        className="absolute top-0 h-full cursor-grab active:cursor-grabbing"
        style={{
          left: thumbPosition,
          width: thumbWidth,
          backgroundColor: thumbColor,
          borderRadius,
          opacity: 0.7,
          transition: 'left 100ms ease-out',
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Scroll buttons */}
      {showButtons && (
        <>
          <button
            className="absolute left-0 top-0 h-full w-6 flex items-center justify-center text-white hover:bg-navy-700 transition-colors rounded-l"
            style={{ backgroundColor: thumbColor, opacity: 0.9 }}
            onClick={() => onScroll?.(Math.max(0, scrollPosition - 0.1))}
          >
            ◀
          </button>
          <button
            className="absolute right-0 top-0 h-full w-6 flex items-center justify-center text-white hover:bg-navy-700 transition-colors rounded-r"
            style={{ backgroundColor: thumbColor, opacity: 0.9 }}
            onClick={() => onScroll?.(Math.min(1, scrollPosition + 0.1))}
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Chart Toolbar Component
// ============================================================================

export type ToolbarButtonState = 'enable' | 'disable' | 'pressed';

export interface ChartToolbarProps {
  /** Zoom out button state */
  zoomOutState?: ToolbarButtonState;
  /** Reset button state */
  resetState?: ToolbarButtonState;
  /** Pin mode button state */
  pinModeState?: ToolbarButtonState;
  /** Show button tooltext */
  showToolText?: boolean;
  /** Zoom out tooltip */
  zoomOutToolText?: string;
  /** Reset tooltip */
  resetToolText?: string;
  /** Pin mode tooltip */
  pinModeToolText?: string;
  /** Zoom mode tooltip */
  zoomModeToolText?: string;
  /** On zoom out */
  onZoomOut?: () => void;
  /** On reset */
  onReset?: () => void;
  /** On toggle pin mode */
  onTogglePinMode?: () => void;
  /** Whether pin mode is available */
  allowPinMode?: boolean;
  /** Toolbar position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Class name */
  className?: string;
}

const BUTTON_STYLES: Record<ToolbarButtonState, React.CSSProperties> = {
  enable: {
    backgroundColor: '#ffffff',
    border: '1px solid #c2c2c2',
    color: '#333',
    cursor: 'pointer',
  },
  disable: {
    backgroundColor: '#ffffff',
    border: '1px solid #e3e3e3',
    color: '#999',
    cursor: 'default',
    opacity: 0.6,
  },
  pressed: {
    backgroundColor: '#efefef',
    border: '1px solid #c2c2c2',
    color: '#333',
    cursor: 'pointer',
  },
};

/**
 * Chart toolbar component with zoom/reset/pin buttons.
 * Replaces FusionCharts _createToolBox and toolbar rendering.
 */
export function ChartToolbar({
  zoomOutState = 'disable',
  resetState = 'disable',
  pinModeState = 'enable',
  showToolText = true,
  zoomOutToolText = 'Zoom out one level',
  resetToolText = 'Reset Chart',
  pinModeToolText = 'Switch to Pin Mode',
  zoomModeToolText = 'Switch to Zoom Mode',
  onZoomOut,
  onReset,
  onTogglePinMode,
  allowPinMode = true,
  position = 'top-right',
  className,
}: ChartToolbarProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 8, left: 8 },
    'top-right': { top: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
  };

  return (
    <div
      className={`absolute z-20 flex items-center gap-1 ${className || ''}`}
      style={positionStyles[position]}
    >
      {/* Pin Mode Button */}
      {allowPinMode && (
        <button
          title={showToolText ? (pinModeState === 'pressed' ? zoomModeToolText : pinModeToolText) : undefined}
          style={{
            ...BUTTON_STYLES[pinModeState],
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          onClick={onTogglePinMode}
          disabled={pinModeState === 'disable'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L8 10h8L12 2zM12 10v12M8 16h8" />
          </svg>
          {showToolText && <span className="hidden sm:inline">{pinModeState === 'pressed' ? 'Zoom' : 'Pin'}</span>}
        </button>
      )}

      {/* Zoom Out Button */}
      <button
        title={showToolText ? zoomOutToolText : undefined}
        style={{
          ...BUTTON_STYLES[zoomOutState],
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        onClick={onZoomOut}
        disabled={zoomOutState === 'disable'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        {showToolText && <span className="hidden sm:inline">Zoom Out</span>}
      </button>

      {/* Reset Button */}
      <button
        title={showToolText ? resetToolText : undefined}
        style={{
          ...BUTTON_STYLES[resetState],
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        onClick={onReset}
        disabled={resetState === 'disable'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 1 3.3-6.9" />
          <polyline points="3 2 3 7 8 7" />
        </svg>
        {showToolText && <span className="hidden sm:inline">Reset</span>}
      </button>
    </div>
  );
}

// ============================================================================
// Zoom Selection Overlay
// ============================================================================

export interface ZoomSelectionProps {
  /** Canvas left offset */
  canvasLeft: number;
  /** Canvas top offset */
  canvasTop: number;
  /** Canvas width */
  canvasWidth: number;
  /** Canvas height */
  canvasHeight: number;
  /** Zoom pane fill color */
  zoomPaneFill?: string;
  /** Zoom pane stroke color */
  zoomPaneStroke?: string;
  /** Pin pane fill color */
  pinPaneFill?: string;
  /** On zoom/pin selection complete */
  onSelectionEnd?: (startX: number, endX: number) => void;
  /** Pin mode active */
  pinModeActive?: boolean;
}

/**
 * Zoom/Pin selection overlay for drag-to-zoom.
 * Replaces FusionCharts ga (bindSelectionEvent) selection handling.
 */
export function ZoomSelectionOverlay({
  canvasLeft,
  canvasTop,
  canvasWidth,
  canvasHeight,
  zoomPaneFill = 'rgba(185, 213, 241, 0.3)',
  zoomPaneStroke = 'rgba(51, 153, 255, 0.8)',
  pinPaneFill = 'rgba(26, 35, 50, 0.15)',
  onSelectionEnd,
  pinModeActive = false,
}: ZoomSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setIsSelecting(true);
      setSelectionStart(x);
      setSelectionEnd(x);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, canvasWidth));
      setSelectionEnd(x);
    },
    [isSelecting, canvasWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    if (Math.abs(end - start) > 10) {
      onSelectionEnd?.(start, end);
    }
  }, [isSelecting, selectionStart, selectionEnd, onSelectionEnd]);

  const left = Math.min(selectionStart, selectionEnd);
  const width = Math.abs(selectionEnd - selectionStart);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ cursor: pinModeActive ? 'crosshair' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsSelecting(false)}
    >
      {isSelecting && width > 2 && (
        <div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            left,
            width,
            backgroundColor: pinModeActive ? pinPaneFill : zoomPaneFill,
            border: pinModeActive ? 'none' : `1px solid ${zoomPaneStroke}`,
            transition: 'none',
          }}
        />
      )}
    </div>
  );
}
