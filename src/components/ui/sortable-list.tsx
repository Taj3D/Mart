'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay as DndKitDragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
  type CollisionDetection,
  type DragOverlayProps,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSwappingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
  type SortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* ================================================================
   TYPES
   ================================================================ */

/** Strategy for sort direction/layout */
export type SortableStrategy = 'vertical' | 'horizontal' | 'rectSwapping'

/** Generic item with an id */
export interface SortableItemData {
  id: UniqueIdentifier
  [key: string]: unknown
}

/** Props for SortableList */
export interface SortableListProps<T extends SortableItemData> {
  /** Array of items to render in sortable order */
  items: T[]
  /** Callback fired when items are reordered */
  onReorder: (items: T[]) => void
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Sorting strategy */
  strategy?: SortableStrategy
  /** If true, items can only be dragged by their handle */
  dragHandle?: boolean
  /** Additional CSS class for the container */
  className?: string
  /** Collision detection algorithm */
  collisionDetection?: CollisionDetection
  /** Whether the list is disabled */
  disabled?: boolean
  /** Render function for the drag overlay content */
  renderOverlay?: (item: T) => React.ReactNode
}

/** Props for SortableItem */
export interface SortableItemProps {
  /** Unique identifier */
  id: UniqueIdentifier
  /** Child content */
  children: React.ReactNode
  /** Additional CSS class */
  className?: string
  /** If true, show drag handle and only allow drag from handle */
  dragHandle?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
}

/** Props for the custom DragOverlay */
export interface IMSDragOverlayProps extends Omit<DragOverlayProps, 'children'> {
  /** Content to render inside the overlay */
  children?: React.ReactNode
  /** Additional CSS class */
  className?: string
}

/** Props for SelectableList */
export interface SelectableListProps<T extends SortableItemData> {
  /** Array of items */
  items: T[]
  /** Currently selected item ids */
  selectedIds: UniqueIdentifier[]
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: UniqueIdentifier[]) => void
  /** Render function for each item */
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode
  /** Whether multi-select is allowed */
  multiple?: boolean
  /** Additional CSS class */
  className?: string
  /** Whether lasso selection is enabled (only in multiple mode) */
  lasso?: boolean
  /** Whether the list is disabled */
  disabled?: boolean
}

/** Position for DraggablePanel */
export interface DraggablePanelPosition {
  x: number
  y: number
}

/** Props for DraggablePanel */
export interface DraggablePanelProps {
  /** Panel content */
  children: React.ReactNode
  /** Default position */
  defaultPosition?: DraggablePanelPosition
  /** Callback when position changes */
  onPositionChange?: (position: DraggablePanelPosition) => void
  /** CSS selector or 'parent' to constrain within */
  bounds?: string | 'parent'
  /** Whether the panel is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Panel title - used as default drag handle */
  title?: string
  /** Custom handle element - when provided, only handle triggers drag */
  handle?: React.ReactNode
  /** Whether to show the panel header */
  showHeader?: boolean
  /** Panel width */
  width?: number | string
  /** Panel height */
  height?: number | string
  /** Initial z-index */
  zIndex?: number
}

/* ================================================================
   STRATEGY MAP
   ================================================================ */

const strategyMap: Record<SortableStrategy, SortingStrategy> = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  rectSwapping: rectSwappingStrategy,
}

/* ================================================================
   SORTABLE ITEM
   ================================================================ */

export const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(
  function SortableItem({ id, children, className, dragHandle = false, disabled = false }, ref) {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      disabled,
    })

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        style={style}
        className={cn(
          'relative',
          isDragging && 'ims-sortable-ghost',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          !disabled && !dragHandle && 'ims-sortable-handle',
          className
        )}
        {...(dragHandle || disabled ? {} : { ...attributes, ...listeners })}
      >
        {dragHandle && !disabled && (
          <button
            ref={setActivatorNodeRef}
            type="button"
            className={cn(
              'ims-sortable-handle inline-flex items-center justify-center',
              'p-1 rounded hover:bg-navy-50 dark:hover:bg-navy-900/30',
              'text-navy-400 hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-300',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-400',
              'cursor-grab active:cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
            aria-label="Drag handle"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    )
  }
)

/* ================================================================
   CUSTOM DRAG OVERLAY
   ================================================================ */

export function IMSDragOverlay({ children, className, ...props }: IMSDragOverlayProps) {
  return (
    <DndKitDragOverlay
      {...props}
      className={cn(
        'ims-drag-overlay',
        className
      )}
    >
      {children && (
        <motion.div
          initial={{ opacity: 0.6, scale: 1.02 }}
          animate={{ opacity: 0.9, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'rounded-lg bg-navy-600/90 dark:bg-navy-500/90',
            'text-white shadow-xl shadow-navy-900/25 dark:shadow-black/40',
            'border border-navy-400/50 dark:border-navy-400/30',
            'backdrop-blur-sm',
            'pointer-events-none'
          )}
        >
          {children}
        </motion.div>
      )}
    </DndKitDragOverlay>
  )
}

/* ================================================================
   SORTABLE LIST
   ================================================================ */

export function SortableList<T extends SortableItemData>({
  items,
  onReorder,
  renderItem,
  strategy = 'vertical',
  dragHandle = false,
  className,
  collisionDetection = closestCenter,
  disabled = false,
  renderOverlay,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeItem = React.useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [items, activeId]
  )

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragOver = React.useCallback(
    (_event: DragOverEvent) => {
      // Can be used for cross-container sorting in the future
    },
    []
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over || active.id === over.id) return

      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex)
        onReorder(reordered)
      }
    },
    [items, onReorder]
  )

  const handleDragCancel = React.useCallback(() => {
    setActiveId(null)
  }, [])

  const sortingStrategy = strategyMap[strategy] ?? verticalListSortingStrategy

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={sortingStrategy}
      >
        <div
          className={cn(
            'ims-sortable',
            strategy === 'horizontal'
              ? 'flex flex-row gap-2 flex-wrap'
              : 'flex flex-col gap-2',
            disabled && 'opacity-50 pointer-events-none',
            className
          )}
          style={{ touchAction: 'none' }}
        >
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              dragHandle={dragHandle}
              disabled={disabled}
            >
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <IMSDragOverlay dropAnimation={null}>
        {activeItem && renderOverlay
          ? renderOverlay(activeItem)
          : activeItem
            ? renderItem(activeItem, items.findIndex((i) => i.id === activeId))
            : null}
      </IMSDragOverlay>
    </DndContext>
  )
}

/* ================================================================
   SELECTABLE LIST
   ================================================================ */

export function SelectableList<T extends SortableItemData>({
  items,
  selectedIds,
  onSelectionChange,
  renderItem,
  multiple = false,
  className,
  lasso = false,
  disabled = false,
}: SelectableListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [lassoRect, setLassoRect] = React.useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)
  const [isLassoing, setIsLassoing] = React.useState(false)
  const lastClickedIndexRef = React.useRef<number>(-1)

  const handleItemClick = React.useCallback(
    (item: T, index: number, event: React.MouseEvent) => {
      if (disabled) return

      const itemId = item.id

      if (!multiple) {
        // Single select mode
        onSelectionChange([itemId])
        lastClickedIndexRef.current = index
        return
      }

      // Multi-select mode
      if (event.shiftKey && lastClickedIndexRef.current >= 0) {
        // Range select
        const start = Math.min(lastClickedIndexRef.current, index)
        const end = Math.max(lastClickedIndexRef.current, index)
        const rangeIds = items.slice(start, end + 1).map((i) => i.id)
        onSelectionChange(rangeIds)
      } else if (event.ctrlKey || event.metaKey) {
        // Toggle selection
        if (selectedIds.includes(itemId)) {
          onSelectionChange(selectedIds.filter((id) => id !== itemId))
        } else {
          onSelectionChange([...selectedIds, itemId])
        }
        lastClickedIndexRef.current = index
      } else {
        // Normal click - select only this item
        onSelectionChange([itemId])
        lastClickedIndexRef.current = index
      }
    },
    [disabled, multiple, selectedIds, onSelectionChange, items]
  )

  // Lasso selection
  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      if (!lasso || !multiple || disabled) return
      // Only start lasso on empty space
      if ((event.target as HTMLElement).closest('[data-selectable-item]')) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      setIsLassoing(true)
      setLassoRect({
        startX: event.clientX - rect.left,
        startY: event.clientY - rect.top,
        endX: event.clientX - rect.left,
        endY: event.clientY - rect.top,
      })
    },
    [lasso, multiple, disabled]
  )

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      if (!isLassoing || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      setLassoRect((prev) => ({
        ...prev!,
        endX: event.clientX - rect.left,
        endY: event.clientY - rect.top,
      }))

      // Calculate which items are in the lasso
      const lassoLeft = Math.min(lassoRect!.startX, event.clientX - rect.left)
      const lassoRight = Math.max(lassoRect!.startX, event.clientX - rect.left)
      const lassoTop = Math.min(lassoRect!.startY, event.clientY - rect.top)
      const lassoBottom = Math.max(lassoRect!.startY, event.clientY - rect.top)

      const itemElements = containerRef.current.querySelectorAll('[data-selectable-item]')
      const newSelectedIds: UniqueIdentifier[] = []

      itemElements.forEach((el) => {
        const itemRect = el.getBoundingClientRect()
        const itemLeft = itemRect.left - rect.left
        const itemTop = itemRect.top - rect.top
        const itemRight = itemLeft + itemRect.width
        const itemBottom = itemTop + itemRect.height

        if (
          itemRight >= lassoLeft &&
          itemLeft <= lassoRight &&
          itemBottom >= lassoTop &&
          itemTop <= lassoBottom
        ) {
          const itemId = el.getAttribute('data-selectable-item')
          if (itemId) newSelectedIds.push(itemId)
        }
      })

      if (newSelectedIds.length > 0) {
        onSelectionChange(newSelectedIds)
      }
    },
    [isLassoing, lassoRect, onSelectionChange]
  )

  const handleMouseUp = React.useCallback(() => {
    setIsLassoing(false)
    setLassoRect(null)
  }, [])

  // Lasso rect rendering
  const lassoStyle: React.CSSProperties = lassoRect
    ? {
        position: 'absolute',
        left: Math.min(lassoRect.startX, lassoRect.endX),
        top: Math.min(lassoRect.startY, lassoRect.endY),
        width: Math.abs(lassoRect.endX - lassoRect.startX),
        height: Math.abs(lassoRect.endY - lassoRect.startY),
        border: '2px dashed var(--navy-500)',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        pointerEvents: 'none',
        zIndex: 50,
      }
    : {}

  return (
    <div
      ref={containerRef}
      className={cn(
        'ims-selectable relative',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      style={{ touchAction: 'none', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="listbox"
      aria-multiselectable={multiple}
    >
      {items.map((item, index) => {
        const isSelected = selectedIds.includes(item.id)
        return (
          <div
            key={item.id}
            data-selectable-item={String(item.id)}
            role="option"
            aria-selected={isSelected}
            className={cn(
              'cursor-pointer transition-colors duration-150',
              isSelected && 'ims-selected',
              !isSelected && 'hover:bg-navy-50 dark:hover:bg-navy-900/20'
            )}
            onClick={(e) => handleItemClick(item, index, e)}
          >
            {renderItem(item, index, isSelected)}
          </div>
        )
      })}

      {/* Lasso rectangle */}
      <AnimatePresence>
        {isLassoing && lassoRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={lassoStyle}
            className="ims-lasso"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   DRAGGABLE PANEL
   ================================================================ */

export function DraggablePanel({
  children,
  defaultPosition = { x: 0, y: 0 },
  onPositionChange,
  bounds,
  disabled = false,
  className,
  title,
  handle,
  showHeader = true,
  width = 320,
  height,
  zIndex = 50,
}: DraggablePanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<DraggablePanelPosition>(defaultPosition)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragOffsetRef = React.useRef({ x: 0, y: 0 })
  const isControlled = onPositionChange !== undefined

  const currentPosition = isControlled ? defaultPosition : position

  const constrainPosition = React.useCallback(
    (pos: DraggablePanelPosition): DraggablePanelPosition => {
      if (!bounds || !panelRef.current) return pos

      const panelRect = panelRef.current.getBoundingClientRect()
      let boundaryRect: DOMRect

      if (bounds === 'parent') {
        const parent = panelRef.current.parentElement
        if (!parent) return pos
        boundaryRect = parent.getBoundingClientRect()
      } else {
        const boundaryEl = document.querySelector(bounds)
        if (!boundaryEl) return pos
        boundaryRect = boundaryEl.getBoundingClientRect()
      }

      const maxX = boundaryRect.width - panelRect.width
      const maxY = boundaryRect.height - panelRect.height

      return {
        x: Math.max(0, Math.min(pos.x, maxX)),
        y: Math.max(0, Math.min(pos.y, maxY)),
      }
    },
    [bounds]
  )

  const updatePosition = React.useCallback(
    (newPos: DraggablePanelPosition) => {
      const constrained = constrainPosition(newPos)
      if (isControlled) {
        onPositionChange(constrained)
      } else {
        setPosition(constrained)
      }
    },
    [constrainPosition, isControlled, onPositionChange]
  )

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return

      event.preventDefault()
      setIsDragging(true)
      dragOffsetRef.current = {
        x: event.clientX - currentPosition.x,
        y: event.clientY - currentPosition.y,
      }
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
    },
    [disabled, currentPosition]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging) return

      const newX = event.clientX - dragOffsetRef.current.x
      const newY = event.clientY - dragOffsetRef.current.y
      updatePosition({ x: newX, y: newY })
    },
    [isDragging, updatePosition]
  )

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <Card
      ref={panelRef}
      className={cn(
        'ims-draggable absolute',
        isDragging
          ? 'shadow-2xl shadow-navy-900/30 dark:shadow-black/50 ring-2 ring-navy-400/50'
          : 'shadow-lg',
        disabled && 'cursor-not-allowed opacity-70',
        className
      )}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        width,
        height,
        zIndex: isDragging ? zIndex + 1 : zIndex,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
      }}
    >
      {showHeader && (
        <CardHeader
          className={cn(
            'p-3 select-none',
            !handle && !disabled && 'cursor-grab active:cursor-grabbing',
            'bg-gradient-to-r from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800',
            'text-white rounded-t-xl',
            disabled && 'cursor-not-allowed',
            isDragging && 'cursor-grabbing'
          )}
          onPointerDown={handle ? undefined : handlePointerDown}
          onPointerMove={handle ? undefined : handlePointerMove}
          onPointerUp={handle ? undefined : handlePointerUp}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-navy-200" />
            {title && (
              <CardTitle className="text-sm font-semibold text-white">
                {title}
              </CardTitle>
            )}
            {handle && (
              <div
                className="cursor-grab active:cursor-grabbing inline-flex items-center"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {handle}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4 overflow-auto" style={{ maxHeight: height ? `calc(${height} - 60px)` : undefined }}>
        {children}
      </CardContent>
    </Card>
  )
}

/* ================================================================
   RE-EXPORT DND-KIT UTILITIES
   ================================================================ */

export {
  arrayMove,
  arraySwap,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

export {
  DndContext,
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
} from '@dnd-kit/core'

export type {
  UniqueIdentifier,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'

export type {
  SortingStrategy,
  SortableData,
} from '@dnd-kit/sortable'
