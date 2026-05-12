/**
 * IMS Chart Renderer - Interactive Features
 * Replaces FusionCharts interactive rendering: pie slicing/rotation,
 * doughnut center labels, 3D effects, hover cosmetics
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { IMSChartDataPoint } from '../chart-utils/types';
import { IMS_CHART_COLORS } from '../chart-utils/types';

// ============================================================================
// Pie Slicing State Management
// ============================================================================

export interface PieSliceState {
  /** Index of sliced data points */
  slicedIndices: Set<number>;
  /** Whether multi-slicing is enabled */
  enableMultiSlicing: boolean;
}

/**
 * Hook for managing pie chart slicing state.
 * Replaces FusionCharts _plotGraphicClick and sliceInOtherPies.
 */
export function usePieSlicing(initialMultiSlicing = false) {
  const [slicedIndices, setSlicedIndices] = useState<Set<number>>(new Set());
  const [enableMultiSlicing, setEnableMultiSlicing] = useState(initialMultiSlicing);

  const toggleSlice = useCallback((index: number) => {
    setSlicedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!enableMultiSlicing) {
          // Single-slicing mode: un-slice all others
          next.clear();
        }
        next.add(index);
      }
      return next;
    });
  }, [enableMultiSlicing]);

  const isSliced = useCallback((index: number): boolean => {
    return slicedIndices.has(index);
  }, [slicedIndices]);

  const sliceAll = useCallback((indices: number[]) => {
    setSlicedIndices(new Set(indices));
  }, []);

  const unSliceAll = useCallback(() => {
    setSlicedIndices(new Set());
  }, []);

  const setMultiSlicing = useCallback((enabled: boolean) => {
    setEnableMultiSlicing(enabled);
    if (!enabled && slicedIndices.size > 1) {
      // Keep only the last sliced
      const arr = Array.from(slicedIndices);
      setSlicedIndices(new Set([arr[arr.length - 1]]));
    }
  }, [slicedIndices]);

  return {
    slicedIndices,
    enableMultiSlicing,
    toggleSlice,
    isSliced,
    sliceAll,
    unSliceAll,
    setMultiSlicing,
  };
}

// ============================================================================
// Pie Rotation (Drag-to-Rotate)
// ============================================================================

export interface PieRotationState {
  /** Current rotation angle in degrees */
  startAngle: number;
  /** Whether rotation is in progress */
  isRotating: boolean;
  /** Drag start angle */
  dragStartAngle: number;
}

/**
 * Hook for pie chart drag-to-rotate.
 * Replaces FusionCharts _plotDragStart/Move/End.
 */
export function usePieRotation(initialAngle = 0, enabled = true) {
  const [startAngle, setStartAngle] = useState(initialAngle);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!enabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    setDragStartAngle(angle);
    setIsRotating(false);
  }, [enabled]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!enabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    if (Math.abs(angle - dragStartAngle) > 1) {
      setIsRotating(true);
    }

    const delta = angle - dragStartAngle;
    setStartAngle(prev => prev + delta);
    setDragStartAngle(angle);
  }, [enabled, dragStartAngle]);

  const handleDragEnd = useCallback(() => {
    setIsRotating(false);
  }, []);

  return {
    startAngle,
    isRotating,
    containerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setStartAngle,
  };
}

// ============================================================================
// Doughnut Center Label
// ============================================================================

export interface DoughnutCenterLabelConfig {
  /** Label text */
  label: string;
  /** Font family */
  font?: string;
  /** Font size in px */
  fontSize?: number;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Text color */
  color?: string;
  /** Text alpha (0-100) */
  alpha?: number;
  /** Background color */
  bgColor?: string;
  /** Background alpha (0-100) */
  bgAlpha?: number;
  /** Border color */
  borderColor?: string;
  /** Border alpha (0-100) */
  borderAlpha?: number;
  /** Border thickness */
  borderThickness?: number;
  /** Padding */
  padding?: number;
  /** Hover color */
  hoverColor?: string;
  /** Hover alpha */
  hoverAlpha?: number;
  /** Tool text */
  toolText?: string;
}

const DEFAULT_CENTER_LABEL: DoughnutCenterLabelConfig = {
  label: '',
  font: 'Geist, sans-serif',
  fontSize: 14,
  bold: false,
  italic: false,
  color: '#1e3a5f',
  alpha: 100,
  bgColor: 'transparent',
  bgAlpha: 0,
  borderColor: 'transparent',
  borderAlpha: 0,
  borderThickness: 0,
  padding: 10,
  hoverColor: '#1e3a5f',
  hoverAlpha: 80,
};

/**
 * Hook for doughnut chart center label.
 * Replaces FusionCharts drawDoughnutCenterLabel and centerLabel methods.
 */
export function useDoughnutCenterLabel(initialConfig?: Partial<DoughnutCenterLabelConfig>) {
  const [config, setConfig] = useState<DoughnutCenterLabelConfig>({
    ...DEFAULT_CENTER_LABEL,
    ...initialConfig,
  });

  const [isHovered, setIsHovered] = useState(false);

  const setLabel = useCallback((label: string, overrides?: Partial<DoughnutCenterLabelConfig>) => {
    setConfig(prev => ({ ...prev, label, ...overrides }));
  }, []);

  const clearLabel = useCallback(() => {
    setConfig(prev => ({ ...prev, label: '' }));
  }, []);

  return {
    centerLabelConfig: config,
    isHovered,
    setIsHovered,
    setLabel,
    clearLabel,
  };
}

// ============================================================================
// 3D CSS Effect Generator
// ============================================================================

/** 3D effect CSS properties for chart elements */
export interface CSS3DEffect {
  /** CSS transform string */
  transform?: string;
  /** Box shadow for 3D depth */
  boxShadow?: string;
  /** Filter for 3D lighting */
  filter?: string;
  /** Perspective for 3D container */
  perspective?: string;
  /** Transform style */
  transformStyle?: string;
  /** Additional CSS properties */
  [key: string]: string | undefined;
}

/**
 * Generate 3D CSS effects for chart types.
 * Replaces FusionCharts 3D rendering with CSS-based 3D effects.
 */
export function generate3DEffect(
  type: 'column' | 'bar' | 'pie',
  depth: number = 10,
  options?: {
    lightingEnabled?: boolean;
    angle?: number;
    color?: string;
  }
): CSS3DEffect {
  const { lightingEnabled = true, angle = 45, color = '#1e3a5f' } = options || {};

  switch (type) {
    case 'column':
      return {
        transform: `perspective(800px) rotateX(${Math.min(depth * 0.3, 5)}deg)`,
        boxShadow: `${depth}px ${depth}px ${depth * 2}px rgba(0,0,0,0.2), inset 0 -${depth}px ${depth}px rgba(0,0,0,0.1)`,
        filter: lightingEnabled ? `brightness(1.05) saturate(1.1)` : undefined,
        perspective: '800px',
        transformStyle: 'preserve-3d',
      };

    case 'bar':
      return {
        transform: `perspective(800px) rotateY(${Math.min(depth * 0.3, 5)}deg)`,
        boxShadow: `${depth}px ${depth * 0.5}px ${depth * 1.5}px rgba(0,0,0,0.2), inset ${depth}px 0 ${depth}px rgba(0,0,0,0.1)`,
        filter: lightingEnabled ? `brightness(1.05) saturate(1.1)` : undefined,
        perspective: '800px',
        transformStyle: 'preserve-3d',
      };

    case 'pie':
      return {
        transform: `perspective(800px) rotateX(${Math.min(depth * 0.5, 8)}deg)`,
        boxShadow: `0 ${depth * 1.5}px ${depth * 3}px rgba(0,0,0,0.25)`,
        filter: lightingEnabled ? `brightness(1.02) saturate(1.05)` : undefined,
        perspective: '800px',
        transformStyle: 'preserve-3d',
      };

    default:
      return {};
  }
}

/**
 * Generate 3D gradient fill for pie slices.
 * Replaces FusionCharts _parseSliceColor 3D lighting system.
 */
export function generate3DSliceGradient(
  baseColor: string,
  alpha: number = 100,
  isDoughnut: boolean = false
): { top: string; side: string; bottom: string } {
  // Simple gradient generation for 3D effect
  return {
    top: baseColor,
    side: `${baseColor}dd`,  // Slightly darker
    bottom: `${baseColor}aa`, // Darker still
  };
}

// ============================================================================
// Hover Cosmetics
// ============================================================================

export interface HoverCosmetics {
  /** Hover fill color */
  hoverColor?: string;
  /** Hover border color */
  hoverBorderColor?: string;
  /** Hover border width */
  hoverBorderWidth?: number;
  /** Hover alpha */
  hoverAlpha?: number;
  /** Hover radius change (for pie/anchor) */
  hoverRadiusDelta?: number;
  /** Hover cursor */
  hoverCursor?: string;
}

const DEFAULT_HOVER_COSMETICS: HoverCosmetics = {
  hoverColor: '#2d5a8e',
  hoverBorderColor: '#1a2332',
  hoverBorderWidth: 2,
  hoverAlpha: 90,
  hoverRadiusDelta: 5,
  hoverCursor: 'pointer',
};

/**
 * Hook for chart hover cosmetics.
 * Replaces FusionCharts hoverEffects configuration.
 */
export function useHoverCosmetics(initial?: Partial<HoverCosmetics>) {
  const [cosmetics] = useState<HoverCosmetics>({
    ...DEFAULT_HOVER_COSMETICS,
    ...initial,
  });

  return cosmetics;
}

// ============================================================================
// Pie Slice Animation
// ============================================================================

export interface SliceAnimationConfig {
  /** Animation duration in ms */
  duration: number;
  /** Easing function */
  easing: 'ease-out' | 'ease-in' | 'ease-in-out' | 'linear';
  /** Slice distance (in px) when sliced out */
  sliceDistance: number;
}

const DEFAULT_SLICE_ANIMATION: SliceAnimationConfig = {
  duration: 200,
  easing: 'ease-out',
  sliceDistance: 20,
};

/**
 * Calculate the translation offset for a sliced pie slice.
 * Replaces FusionCharts slicedTranslation calculation.
 */
export function calculateSliceTranslation(
  sliceAngle: number, // in radians
  distance: number,
  isSliced: boolean
): { x: number; y: number } {
  if (!isSliced) return { x: 0, y: 0 };

  return {
    x: Math.cos(sliceAngle) * distance,
    y: Math.sin(sliceAngle) * distance,
  };
}

/**
 * Get CSS transform for a sliced pie element.
 */
export function getSliceTransform(
  sliceAngle: number,
  distance: number,
  isSliced: boolean,
  animationConfig?: Partial<SliceAnimationConfig>
): React.CSSProperties {
  const config = { ...DEFAULT_SLICE_ANIMATION, ...animationConfig };
  const { x, y } = calculateSliceTranslation(sliceAngle, distance, isSliced);

  return {
    transform: `translate(${x}px, ${y}px)`,
    transition: `transform ${config.duration}ms ${config.easing}`,
    cursor: 'pointer',
  };
}

// ============================================================================
// Doughnut Center Label Component
// ============================================================================

export interface DoughnutCenterLabelProps {
  /** Center X position (relative to container) */
  centerX: number;
  /** Center Y position (relative to container) */
  centerY: number;
  /** Inner radius of the doughnut */
  innerRadius: number;
  /** Label configuration */
  config: DoughnutCenterLabelConfig;
  /** Whether hovered */
  isHovered?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Doughnut center label component.
 * Replaces FusionCharts drawDoughnutCenterLabel.
 */
export function DoughnutCenterLabel({
  centerX,
  centerY,
  innerRadius,
  config,
  isHovered = false,
  onClick,
}: DoughnutCenterLabelProps) {
  if (!config.label) return null;

  const diameter = innerRadius * 2;
  const padding = config.padding || 10;
  const currentColor = isHovered
    ? (config.hoverColor || config.color || '#1e3a5f')
    : (config.color || '#1e3a5f');

  return (
    <div
      className="absolute flex items-center justify-center text-center pointer-events-auto"
      style={{
        left: centerX - innerRadius,
        top: centerY - innerRadius,
        width: diameter,
        height: diameter,
        padding: `${padding}px`,
        borderRadius: '50%',
        backgroundColor: config.bgAlpha ? config.bgColor : 'transparent',
        opacity: (isHovered ? (config.hoverAlpha || 80) : (config.alpha || 100)) / 100,
        border: config.borderThickness ? `${config.borderThickness}px solid ${config.borderColor}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 200ms ease-out',
      }}
      onClick={onClick}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <span
        style={{
          fontFamily: config.font || 'Geist, sans-serif',
          fontSize: `${config.fontSize || 14}px`,
          fontWeight: config.bold ? 'bold' : 'normal',
          fontStyle: config.italic ? 'italic' : 'normal',
          color: currentColor,
          lineHeight: 1.2,
          maxWidth: diameter - padding * 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: Math.floor((diameter - padding * 2) / ((config.fontSize || 14) * 1.2)),
          WebkitBoxOrient: 'vertical',
        }}
        title={config.toolText || config.label}
      >
        {config.label}
      </span>
    </div>
  );
}

// ============================================================================
// Pie Chart Interactive Wrapper
// ============================================================================

export interface InteractivePieProps {
  /** Chart data points */
  data: IMSChartDataPoint[];
  /** Total value for percentage calculation */
  total: number;
  /** Whether slicing is enabled */
  slicingEnabled?: boolean;
  /** Whether rotation is enabled */
  rotationEnabled?: boolean;
  /** Multi-slicing enabled */
  multiSlicing?: boolean;
  /** Slice distance in px */
  sliceDistance?: number;
  /** Children render function */
  children: (props: {
    data: IMSChartDataPoint[];
    slicedIndices: Set<number>;
    startAngle: number;
    getSliceStyle: (index: number, angle: number) => React.CSSProperties;
  }) => React.ReactNode;
}

/**
 * Interactive pie chart wrapper providing slicing and rotation.
 * Replaces FusionCharts pie2d/pie3d interactive behaviors.
 */
export function InteractivePie({
  data,
  total,
  slicingEnabled = true,
  rotationEnabled = true,
  multiSlicing = false,
  sliceDistance = 20,
  children,
}: InteractivePieProps) {
  const { slicedIndices, toggleSlice, isSliced } = usePieSlicing(multiSlicing);
  const { startAngle, containerRef, handleDragStart, handleDragMove, handleDragEnd, isRotating } =
    usePieRotation(0, rotationEnabled);

  const getSliceStyle = useCallback(
    (index: number, angle: number): React.CSSProperties => {
      const sliced = isSliced(index);
      return getSliceTransform(angle, sliceDistance, sliced);
    },
    [isSliced, sliceDistance]
  );

  // Mouse/touch event handlers for rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !rotationEnabled) return;

    const onMouseDown = (e: MouseEvent) => {
      handleDragStart(e.clientX, e.clientY);
      const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
      const onMouseUp = () => {
        handleDragEnd();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
      const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
      };
      const onTouchEnd = () => {
        handleDragEnd();
        document.removeEventListener('touchmove', onTouchMove as EventListener);
        document.removeEventListener('touchend', onTouchEnd);
      };
      document.addEventListener('touchmove', onTouchMove as EventListener);
      document.addEventListener('touchend', onTouchEnd);
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);
    };
  }, [rotationEnabled, containerRef, handleDragStart, handleDragMove, handleDragEnd]);

  const handleSliceClick = useCallback(
    (index: number) => {
      if (!slicingEnabled || isRotating) return;
      toggleSlice(index);
    },
    [slicingEnabled, isRotating, toggleSlice]
  );

  return (
    <div ref={containerRef} className="relative">
      {children({
        data,
        slicedIndices,
        startAngle,
        getSliceStyle,
      })}
    </div>
  );
}
