'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/* ================================================================
   TYPES
   ================================================================ */

/** Resize handle direction — mirrors jQuery UI's .ui-resizable-{n,s,e,w,se,sw,nw,ne} */
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'se' | 'sw' | 'nw' | 'ne'

/** Current dimensions reported by the hook */
export interface ResizeDimensions {
  width: number
  height: number
}

/** Options for the useResizable hook */
export interface UseResizableOptions {
  /** Initial width in pixels */
  defaultWidth?: number
  /** Initial height in pixels */
  defaultHeight?: number
  /** Minimum width (default 100) */
  minWidth?: number
  /** Minimum height (default 100) */
  minHeight?: number
  /** Maximum width */
  maxWidth?: number
  /** Maximum height */
  maxHeight?: number
  /** Constrain resize within: 'parent' | 'window' | CSS selector */
  bounds?: 'parent' | 'window' | string
  /** Disable resizing */
  disabled?: boolean
  /** Callback fired continuously during resize */
  onResize?: (dimensions: ResizeDimensions) => void
  /** Callback fired when resize ends */
  onResizeEnd?: (dimensions: ResizeDimensions) => void
}

/** Return type of useResizable */
export interface UseResizableReturn {
  /** Current width */
  width: number
  /** Current height */
  height: number
  /** Whether a resize is actively in progress */
  isResizing: boolean
  /** The direction currently being resized */
  activeDirection: ResizeDirection | null
  /** Ref to attach to the resizable container */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Start resizing from a given direction. Attach to handle onPointerDown. */
  startResize: (direction: ResizeDirection, event: React.PointerEvent) => void
  /** Keyboard resize handler. Attach to handle onKeyDown. */
  handleKeyboardResize: (direction: ResizeDirection, event: React.KeyboardEvent) => void
  /** Whether the panel is hovered (for handle visibility) */
  isHovered: boolean
  /** Hover handlers to spread on the container */
  hoverHandlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
}

/** Props for ResizablePanel */
export interface ResizablePanelProps {
  /** Panel content */
  children: React.ReactNode
  /** Initial width in pixels */
  defaultWidth?: number
  /** Initial height in pixels */
  defaultHeight?: number
  /** Minimum width (default 100) */
  minWidth?: number
  /** Minimum height (default 100) */
  minHeight?: number
  /** Maximum width */
  maxWidth?: number
  /** Maximum height */
  maxHeight?: number
  /** Constrain resize within: 'parent' | 'window' | CSS selector */
  bounds?: 'parent' | 'window' | string
  /** Disable resizing */
  disabled?: boolean
  /** Always show handles (instead of hover-only) */
  showHandles?: boolean
  /** Additional CSS class */
  className?: string
  /** Callback fired continuously during resize */
  onResize?: (dimensions: ResizeDimensions) => void
  /** Callback fired when resize ends */
  onResizeEnd?: (dimensions: ResizeDimensions) => void
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const HANDLE_SIZE = 7
const CORNER_SIZE_SE = 12
const CORNER_SIZE = 9
const KEYBOARD_STEP = 10
const KEYBOARD_LARGE_STEP = 50

/* ================================================================
   HELPERS
   ================================================================ */

/** Clamp a value between min and max */
function clamp(value: number, min: number, max?: number): number {
  const clamped = Math.max(min, value)
  return max !== undefined ? Math.min(max, clamped) : clamped
}

/** Get the cursor CSS value for a given resize direction */
function getCursorForDirection(direction: ResizeDirection): string {
  const cursorMap: Record<ResizeDirection, string> = {
    n: 'n-resize',
    s: 's-resize',
    e: 'e-resize',
    w: 'w-resize',
    se: 'se-resize',
    sw: 'sw-resize',
    nw: 'nw-resize',
    ne: 'ne-resize',
  }
  return cursorMap[direction]
}

/** Which axis deltas apply for a given direction */
function getDirectionDeltas(direction: ResizeDirection): { dx: number; dy: number } {
  switch (direction) {
    case 'n':
      return { dx: 0, dy: -1 }
    case 's':
      return { dx: 0, dy: 1 }
    case 'e':
      return { dx: 1, dy: 0 }
    case 'w':
      return { dx: -1, dy: 0 }
    case 'se':
      return { dx: 1, dy: 1 }
    case 'sw':
      return { dx: -1, dy: 1 }
    case 'nw':
      return { dx: -1, dy: -1 }
    case 'ne':
      return { dx: 1, dy: -1 }
  }
}

/** Compute new dimensions from a pointer movement for a given direction */
function computeResize(
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  currentWidth: number,
  currentHeight: number,
  minWidth: number,
  minHeight: number,
  maxWidth?: number,
  maxHeight?: number
): ResizeDimensions {
  const { dx, dy } = getDirectionDeltas(direction)

  let newWidth = currentWidth + deltaX * dx
  let newHeight = currentHeight + deltaY * dy

  // Snap-back: if below minimum, snap to minimum
  newWidth = clamp(newWidth, minWidth, maxWidth)
  newHeight = clamp(newHeight, minHeight, maxHeight)

  return { width: newWidth, height: newHeight }
}

/** Compute boundary-constrained dimensions */
function constrainToBounds(
  container: HTMLDivElement,
  width: number,
  height: number,
  bounds: 'parent' | 'window' | string,
  minWidth: number,
  minHeight: number
): ResizeDimensions {
  const containerRect = container.getBoundingClientRect()

  let boundWidth: number
  let boundHeight: number

  if (bounds === 'window') {
    boundWidth = window.innerWidth - containerRect.left
    boundHeight = window.innerHeight - containerRect.top
  } else if (bounds === 'parent') {
    const parent = container.parentElement
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      boundWidth = parentRect.right - containerRect.left
      boundHeight = parentRect.bottom - containerRect.top
    } else {
      boundWidth = window.innerWidth - containerRect.left
      boundHeight = window.innerHeight - containerRect.top
    }
  } else {
    const boundEl = document.querySelector(bounds)
    if (boundEl) {
      const boundRect = boundEl.getBoundingClientRect()
      boundWidth = boundRect.right - containerRect.left
      boundHeight = boundRect.bottom - containerRect.top
    } else {
      boundWidth = window.innerWidth - containerRect.left
      boundHeight = window.innerHeight - containerRect.top
    }
  }

  return {
    width: clamp(width, minWidth, boundWidth),
    height: clamp(height, minHeight, boundHeight),
  }
}

/* ================================================================
   useResizable HOOK
   ================================================================ */

export function useResizable(options: UseResizableOptions = {}): UseResizableReturn {
  const {
    defaultWidth = 300,
    defaultHeight = 200,
    minWidth = 100,
    minHeight = 100,
    maxWidth,
    maxHeight,
    bounds,
    disabled = false,
    onResize,
    onResizeEnd,
  } = options

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = React.useState<ResizeDimensions>({
    width: defaultWidth,
    height: defaultHeight,
  })
  const [isResizing, setIsResizing] = React.useState(false)
  const [activeDirection, setActiveDirection] = React.useState<ResizeDirection | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  // Refs for pointer tracking during drag
  const startPointerRef = React.useRef({ x: 0, y: 0 })
  const startDimensionsRef = React.useRef<ResizeDimensions>({ width: defaultWidth, height: defaultHeight })
  const activeDirectionRef = React.useRef<ResizeDirection | null>(null)

  const startResize = React.useCallback(
    (direction: ResizeDirection, event: React.PointerEvent) => {
      if (disabled) return

      event.preventDefault()
      event.stopPropagation()

      // Capture pointer to receive events even outside the element
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

      startPointerRef.current = { x: event.clientX, y: event.clientY }
      startDimensionsRef.current = { width: dimensions.width, height: dimensions.height }
      activeDirectionRef.current = direction

      setIsResizing(true)
      setActiveDirection(direction)
    },
    [disabled, dimensions]
  )

  // Pointer move and up handlers — attached to document during resize
  React.useEffect(() => {
    if (!isResizing || !activeDirectionRef.current) return

    const direction = activeDirectionRef.current

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startPointerRef.current.x
      const deltaY = e.clientY - startPointerRef.current.y

      const newDims = computeResize(
        direction,
        deltaX,
        deltaY,
        startDimensionsRef.current.width,
        startDimensionsRef.current.height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      )

      // Apply bounds constraints
      let finalDims = newDims
      if (bounds && containerRef.current) {
        finalDims = constrainToBounds(
          containerRef.current,
          newDims.width,
          newDims.height,
          bounds,
          minWidth,
          minHeight
        )
      }

      setDimensions(finalDims)
      onResize?.(finalDims)
    }

    const handlePointerUp = () => {
      setIsResizing(false)
      setActiveDirection(null)
      activeDirectionRef.current = null

      // Report final dimensions
      setDimensions((prev) => {
        onResizeEnd?.(prev)
        return prev
      })
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizing, bounds, minWidth, minHeight, maxWidth, maxHeight, onResize, onResizeEnd])

  const handleKeyboardResize = React.useCallback(
    (direction: ResizeDirection, event: React.KeyboardEvent) => {
      if (disabled) return

      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      if (!isArrowKey) return

      event.preventDefault()

      const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP

      let deltaX = 0
      let deltaY = 0

      if (event.key === 'ArrowUp') deltaY = -step
      if (event.key === 'ArrowDown') deltaY = step
      if (event.key === 'ArrowLeft') deltaX = -step
      if (event.key === 'ArrowRight') deltaX = step

      const newDims = computeResize(
        direction,
        deltaX,
        deltaY,
        dimensions.width,
        dimensions.height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      )

      // Apply bounds constraints for keyboard too
      let finalDims = newDims
      if (bounds && containerRef.current) {
        finalDims = constrainToBounds(
          containerRef.current,
          newDims.width,
          newDims.height,
          bounds,
          minWidth,
          minHeight
        )
      }

      setDimensions(finalDims)
      onResize?.(finalDims)
      onResizeEnd?.(finalDims)
    },
    [disabled, dimensions, minWidth, minHeight, maxWidth, maxHeight, bounds, onResize, onResizeEnd]
  )

  const hoverHandlers = React.useMemo(
    () => ({
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    }),
    []
  )

  return {
    width: dimensions.width,
    height: dimensions.height,
    isResizing,
    activeDirection,
    containerRef,
    startResize,
    handleKeyboardResize,
    isHovered,
    hoverHandlers,
  }
}

/* ================================================================
   RESIZE HANDLE COMPONENT
   ================================================================ */

interface ResizeHandleProps {
  direction: ResizeDirection
  onStartResize: (direction: ResizeDirection, event: React.PointerEvent) => void
  onKeyboardResize: (direction: ResizeDirection, event: React.KeyboardEvent) => void
  visible: boolean
  showHandles: boolean
  disabled: boolean
}

const EDGE_HANDLES: ResizeDirection[] = ['n', 's', 'e', 'w']
const CORNER_HANDLES: ResizeDirection[] = ['se', 'sw', 'nw', 'ne']

/** Get inline styles for each handle position */
function getHandleStyle(direction: ResizeDirection): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    touchAction: 'none',
    zIndex: 10,
  }

  switch (direction) {
    case 'n':
      return { ...base, top: 0, left: HANDLE_SIZE, right: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'n-resize' }
    case 's':
      return { ...base, bottom: 0, left: HANDLE_SIZE, right: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 's-resize' }
    case 'e':
      return { ...base, top: HANDLE_SIZE, right: 0, bottom: HANDLE_SIZE, width: HANDLE_SIZE, cursor: 'e-resize' }
    case 'w':
      return { ...base, top: HANDLE_SIZE, left: 0, bottom: HANDLE_SIZE, width: HANDLE_SIZE, cursor: 'w-resize' }
    case 'se':
      return { ...base, bottom: 0, right: 0, width: CORNER_SIZE_SE, height: CORNER_SIZE_SE, cursor: 'se-resize' }
    case 'sw':
      return { ...base, bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'sw-resize' }
    case 'nw':
      return { ...base, top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'nw-resize' }
    case 'ne':
      return { ...base, top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'ne-resize' }
  }
}

/** The visual indicator inside an edge handle — a 2px line that appears on hover */
function EdgeIndicator({ direction, visible }: { direction: ResizeDirection; visible: boolean }) {
  const isHorizontal = direction === 'n' || direction === 's'
  const position = direction === 'n' ? 'bottom' : direction === 's' ? 'top' : direction === 'w' ? 'right' : 'left'

  const style: React.CSSProperties = isHorizontal
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        [position]: 0,
        backgroundColor: 'var(--navy-400)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }
    : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        [position]: 0,
        backgroundColor: 'var(--navy-400)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }

  return <div style={style} />
}

/** The visual indicator for the SE corner handle — diagonal lines like ≡ rotated 45° */
function SECornerIndicator({ visible, alwaysVisible }: { visible: boolean; alwaysVisible: boolean }) {
  // Show a subtle indicator always, brighter on hover
  const baseOpacity = alwaysVisible ? 0.5 : 0
  const hoverOpacity = 0.8

  return (
    <svg
      width={CORNER_SIZE_SE}
      height={CORNER_SIZE_SE}
      viewBox={`0 0 ${CORNER_SIZE_SE} ${CORNER_SIZE_SE}`}
      style={{
        position: 'absolute',
        bottom: 1,
        right: 1,
        opacity: visible ? hoverOpacity : baseOpacity,
        transition: 'opacity 0.15s ease',
        pointerEvents: 'none',
      }}
    >
      {/* Three diagonal lines from top-left to bottom-right */}
      <line x1="8" y1="2" x2="10" y2="0" stroke="var(--navy-400)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="5" x2="10" y2="0" stroke="var(--navy-400)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="8" x2="10" y2="0" stroke="var(--navy-400)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="10" x2="10" y2="0" stroke="var(--navy-400)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** The visual indicator for non-SE corner handles — small Navy dots */
function CornerIndicator({ direction, visible }: { direction: ResizeDirection; visible: boolean }) {
  // Position the dots near the corner
  const size = 4
  const offset = 2

  const positionStyle: React.CSSProperties = (() => {
    switch (direction) {
      case 'sw':
        return { bottom: offset, left: offset }
      case 'nw':
        return { top: offset, left: offset }
      case 'ne':
        return { top: offset, right: offset }
      default:
        return {}
    }
  })()

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: 1,
        backgroundColor: 'var(--navy-400)',
        opacity: visible ? 0.7 : 0,
        transition: 'opacity 0.15s ease',
        pointerEvents: 'none',
        ...positionStyle,
      }}
    />
  )
}

/** A single resize handle */
function ResizeHandle({ direction, onStartResize, onKeyboardResize, visible, showHandles, disabled }: ResizeHandleProps) {
  const isCorner = CORNER_HANDLES.includes(direction)
  const isSE = direction === 'se'
  const handleStyle = getHandleStyle(direction)

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      onStartResize(direction, e)
    },
    [direction, disabled, onStartResize]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      onKeyboardResize(direction, e)
    },
    [direction, onKeyboardResize]
  )

  // Visibility logic:
  // - SE corner: always slightly visible, brighter on hover
  // - Other corners: visible on panel hover
  // - Edge handles: visible on panel hover
  const shouldShowIndicator = visible || showHandles

  return (
    <div
      className={cn(
        'ims-resizable-handle',
        `ims-resizable-${direction}`,
        disabled && 'ims-resizable-disabled'
      )}
      style={{
        ...handleStyle,
        ...(disabled ? { display: 'none' } : {}),
      }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="separator"
      aria-orientation={
        direction === 'n' || direction === 's'
          ? 'horizontal'
          : direction === 'e' || direction === 'w'
            ? 'vertical'
            : undefined
      }
      aria-label={`Resize handle: ${direction}`}
      aria-disabled={disabled}
    >
      {/* Visual indicator */}
      {isCorner ? (
        isSE ? (
          <SECornerIndicator visible={shouldShowIndicator} alwaysVisible />
        ) : (
          <CornerIndicator direction={direction} visible={shouldShowIndicator} />
        )
      ) : (
        <EdgeIndicator direction={direction} visible={shouldShowIndicator} />
      )}
    </div>
  )
}

/* ================================================================
   RESIZABLE PANEL COMPONENT
   ================================================================ */

export function ResizablePanel({
  children,
  defaultWidth = 300,
  defaultHeight = 200,
  minWidth = 100,
  minHeight = 100,
  maxWidth,
  maxHeight,
  bounds,
  disabled = false,
  showHandles = false,
  className,
  onResize,
  onResizeEnd,
}: ResizablePanelProps) {
  const {
    width,
    height,
    isResizing,
    activeDirection,
    containerRef,
    startResize,
    handleKeyboardResize,
    isHovered,
    hoverHandlers,
  } = useResizable({
    defaultWidth,
    defaultHeight,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    bounds,
    disabled,
    onResize,
    onResizeEnd,
  })

  const allDirections: ResizeDirection[] = [...EDGE_HANDLES, ...CORNER_HANDLES]

  return (
    <Card
      ref={containerRef}
      className={cn(
        'ims-resizable relative overflow-hidden',
        isResizing && 'ims-resizable-ghost',
        disabled && 'ims-resizable-disabled',
        className
      )}
      style={{
        width,
        height,
        touchAction: 'none',
        userSelect: isResizing ? 'none' : 'auto',
        outline: isResizing ? '2px dashed var(--navy-500)' : 'none',
        outlineOffset: '-2px',
        transition: isResizing ? 'none' : 'outline 0.15s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={hoverHandlers.onMouseEnter}
      onMouseLeave={hoverHandlers.onMouseLeave}
    >
      {/* Ghost outline overlay during active resize */}
      <AnimatePresence>
        {isResizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              border: '2px dashed var(--navy-500)',
              borderRadius: 'inherit',
              boxShadow: '0 0 0 1px rgba(30, 58, 95, 0.1), 0 4px 16px rgba(10, 22, 40, 0.12)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="h-full w-full overflow-auto p-4">{children}</div>

      {/* Resize handles */}
      {!disabled &&
        allDirections.map((direction) => (
          <ResizeHandle
            key={direction}
            direction={direction}
            onStartResize={startResize}
            onKeyboardResize={handleKeyboardResize}
            visible={isHovered || isResizing}
            showHandles={showHandles}
            disabled={disabled}
          />
        ))}

      {/* Active direction indicator — shows which handle is being dragged */}
      <AnimatePresence>
        {isResizing && activeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium shadow-lg',
                'bg-navy-600 dark:bg-navy-500 text-white'
              )}
            >
              {Math.round(width)} × {Math.round(height)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

/* ================================================================
   DEFAULT EXPORT
   ================================================================ */

export default ResizablePanel
