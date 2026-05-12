/**
 * IMS jQuery UI Hooks
 * Replaces jQuery UI 1.12.1 interaction behaviors with React hooks
 *
 * Implements:
 * - useDraggable (draggable.js)
 * - useDroppable (droppable.js)
 * - useResizable (resizable.js)
 * - useSelectable (selectable.js)
 * - useSortable (sortable.js)
 * - usePosition (position.js)
 * - useDisableSelection (disable-selection.js)
 * - useFocusable (focusable.js)
 * - useTabbable (tabbable.js)
 * - useKeyCode (key-code.js)
 * - useLabels (labels.js)
 * - useScrollParent (scroll-parent.js)
 * - useUniqueId (unique-id.js)
 * - useFormReset (form-reset-mixin.js)
 */

"use client";

import * as React from "react";
import type {
  DraggableOptions,
  DragUIState,
  DroppableOptions,
  DropUIState,
  ResizableOptions,
  ResizeUIState,
  SelectableOptions,
  SelectableUIState,
  SortableOptions,
  SortUIState,
} from "./types";

// ============================================================================
// useDraggable - Replaces jQuery UI draggable.js
// ============================================================================

export type UseDraggableOptions = DraggableOptions

export interface UseDraggableReturn {
  /** Ref for the draggable element */
  ref: React.RefCallback<HTMLElement>;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Current position */
  position: { top: number; left: number };
  /** Manually set position */
  setPosition: (pos: { top: number; left: number }) => void;
  /** Disable/enable dragging */
  setDisabled: (disabled: boolean) => void;
  /** Drag handle props to spread on handle element */
  handleProps: {
    style: React.CSSProperties;
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

/**
 * Hook that provides drag behavior for elements.
 * Replaces jQuery UI's $(el).draggable({...})
 */
export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn {
  const {
    disabled = false,
    axis = false,
    containment,
    cursor = "move",
    grid,
    handle,
    revert = false,
    revertDuration = 500,
    distance = 0,
    delay = 0,
    onStart,
    onDrag,
    onStop,
  } = options;

  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isDisabled, setIsDisabled] = React.useState(disabled);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const dragStateRef = React.useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    originalPosition: { top: number; left: number };
    startTime: number;
    moved: boolean;
  } | null>(null);

  const getContainmentRect = React.useCallback(() => {
    if (!containment || !elementRef.current) return null;
    if (containment === "parent") {
      const parent = elementRef.current.parentElement;
      if (parent) return parent.getBoundingClientRect();
    }
    if (containment === "window") {
      return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight };
    }
    if (containment === "document") {
      return { left: 0, top: 0, right: document.documentElement.scrollWidth, bottom: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight };
    }
    if (typeof containment === "string") {
      const el = document.querySelector(containment);
      if (el) return el.getBoundingClientRect();
    }
    if (containment instanceof HTMLElement) {
      return containment.getBoundingClientRect();
    }
    return null;
  }, [containment]);

  const snapToGrid = React.useCallback((x: number, y: number): [number, number] => {
    if (!grid) return [x, y];
    return [Math.round(x / grid[0]) * grid[0], Math.round(y / grid[1]) * grid[1]];
  }, [grid]);

  const constrainPosition = React.useCallback((newLeft: number, newTop: number) => {
    const rect = getContainmentRect();
    if (!rect || !elementRef.current) return { left: newLeft, top: newTop };

    const elRect = elementRef.current.getBoundingClientRect();
    const constrainedLeft = Math.max(rect.left, Math.min(newLeft, rect.right - elRect.width));
    const constrainedTop = Math.max(rect.top, Math.min(newTop, rect.bottom - elRect.height));

    return { left: constrainedLeft, top: constrainedTop };
  }, [getContainmentRect]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isDisabled) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const target = e.target as HTMLElement;

    // If handle is specified, check if mousedown is on handle
    if (handle && elementRef.current) {
      const handleEl = elementRef.current.querySelector(handle);
      if (handleEl && !handleEl.contains(target) && handleEl !== target) return;
    }

    e.preventDefault();

    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      offsetX: clientX,
      offsetY: clientY,
      originalPosition: { ...position },
      startTime: Date.now(),
      moved: false,
    };

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragStateRef.current || !elementRef.current) return;

      const moveClientX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = moveClientX - dragStateRef.current.startX;
      const deltaY = moveClientY - dragStateRef.current.startY;

      // Check distance threshold
      if (!dragStateRef.current.moved) {
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (dist < distance) return;
        dragStateRef.current.moved = true;
      }

      // Check delay threshold
      if (delay > 0 && Date.now() - dragStateRef.current.startTime < delay) return;

      let newLeft = dragStateRef.current.originalPosition.left + deltaX;
      let newTop = dragStateRef.current.originalPosition.top + deltaY;

      // Axis constraint
      if (axis === "x") newTop = dragStateRef.current.originalPosition.top;
      if (axis === "y") newLeft = dragStateRef.current.originalPosition.left;

      // Snap to grid
      [newLeft, newTop] = snapToGrid(newLeft, newTop);

      // Containment
      const constrained = constrainPosition(newLeft, newTop);

      dragStateRef.current.offsetX = moveClientX;
      dragStateRef.current.offsetY = moveClientY;

      const uiState: DragUIState = {
        position: constrained,
        offset: { top: moveClientY, left: moveClientX },
        originalPosition: dragStateRef.current.originalPosition,
        originalOffset: { top: dragStateRef.current.startY, left: dragStateRef.current.startX },
        helper: elementRef.current,
      };

      if (onDrag) {
        const result = onDrag(moveEvent as unknown as DragEvent, uiState);
        if (result === false) return;
      }

      setPosition(constrained);
    };

    const handleMouseUp = (upEvent: MouseEvent | TouchEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);

      if (!dragStateRef.current?.moved) {
        dragStateRef.current = null;
        return;
      }

      setIsDragging(false);

      if (revert && elementRef.current) {
        // Revert animation
        setTimeout(() => {
          setPosition(dragStateRef.current?.originalPosition ?? { top: 0, left: 0 });
        }, 0);
      }

      if (onStop && elementRef.current) {
        const upClientX = "changedTouches" in upEvent ? upEvent.changedTouches[0].clientX : upEvent.clientX;
        const upClientY = "changedTouches" in upEvent ? upEvent.changedTouches[0].clientY : upEvent.clientY;

        const uiState: DragUIState = {
          position,
          offset: { top: upClientY, left: upClientX },
          originalPosition: dragStateRef.current.originalPosition,
          originalOffset: { top: dragStateRef.current.startY, left: dragStateRef.current.startX },
          helper: elementRef.current,
        };
        onStop(upEvent as unknown as DragEvent, uiState);
      }

      dragStateRef.current = null;
    };

    setIsDragging(true);

    if (onStart && elementRef.current) {
      const uiState: DragUIState = {
        position,
        offset: { top: clientY, left: clientX },
        originalPosition: { ...position },
        originalOffset: { top: clientY, left: clientX },
        helper: elementRef.current,
      };
      onStart(e as unknown as DragEvent, uiState);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
  }, [isDisabled, handle, position, distance, delay, axis, snapToGrid, constrainPosition, revert, onStart, onDrag, onStop]);

  const ref = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return {
    ref,
    isDragging,
    position,
    setPosition,
    setDisabled: setIsDisabled,
    handleProps: {
      style: { cursor: isDisabled ? "default" : cursor },
      onMouseDown: handleMouseDown,
      onTouchStart: handleMouseDown,
    },
  };
}

// ============================================================================
// useDroppable - Replaces jQuery UI droppable.js
// ============================================================================

export type UseDroppableOptions = DroppableOptions

export interface UseDroppableReturn {
  /** Ref for the droppable element */
  ref: React.RefCallback<HTMLElement>;
  /** Whether a draggable is over this droppable */
  isOver: boolean;
  /** Whether the droppable is active (has matching draggable) */
  isActive: boolean;
  /** Droppable props to spread */
  droppableProps: {
    "data-droppable": true;
    "data-droppable-active": boolean;
    "data-droppable-over": boolean;
    className?: string;
  };
}

/**
 * Hook that provides drop target behavior.
 * Replaces jQuery UI's $(el).droppable({...})
 */
export function useDroppable(options: UseDroppableOptions = {}): UseDroppableReturn {
  const {
    disabled = false,
    accept,
    tolerance = "intersect",
    activeClass,
    hoverClass,
    greedy = false,
    onActivate,
    onDeactivate,
    onOver,
    onOut,
    onDrop,
  } = options;

  const [isOver, setIsOver] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const elementRef = React.useRef<HTMLElement | null>(null);

  const ref = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  // Listen for custom drag events from useDraggable
  React.useEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const handleDragEnter = (e: CustomEvent) => {
      const draggable = e.detail?.helper as HTMLElement;
      if (!draggable) return;

      // Check accept
      if (accept && typeof accept === "string" && !draggable.matches(accept)) return;
      if (accept && typeof accept === "function" && !accept(draggable)) return;

      setIsOver(true);
      onOver?.(e as unknown as DragEvent, {
        draggable,
        helper: draggable,
        position: e.detail?.position ?? { top: 0, left: 0 },
        offset: e.detail?.offset ?? { top: 0, left: 0 },
      });
    };

    const handleDragLeave = (e: CustomEvent) => {
      setIsOver(false);
      const draggable = e.detail?.helper as HTMLElement;
      if (draggable) {
        onOut?.(e as unknown as DragEvent, {
          draggable,
          helper: draggable,
          position: e.detail?.position ?? { top: 0, left: 0 },
          offset: e.detail?.offset ?? { top: 0, left: 0 },
        });
      }
    };

    const handleDrop = (e: CustomEvent) => {
      const draggable = e.detail?.helper as HTMLElement;
      if (!draggable) return;

      if (accept && typeof accept === "string" && !draggable.matches(accept)) return;
      if (accept && typeof accept === "function" && !accept(draggable)) return;

      setIsOver(false);
      onDrop?.(e as unknown as DragEvent, {
        draggable,
        helper: draggable,
        position: e.detail?.position ?? { top: 0, left: 0 },
        offset: e.detail?.offset ?? { top: 0, left: 0 },
      });
    };

    el.addEventListener("jui-dragenter" as string, handleDragEnter as EventListener);
    el.addEventListener("jui-dragleave" as string, handleDragLeave as EventListener);
    el.addEventListener("jui-drop" as string, handleDrop as EventListener);

    return () => {
      el.removeEventListener("jui-dragenter" as string, handleDragEnter as EventListener);
      el.removeEventListener("jui-dragleave" as string, handleDragLeave as EventListener);
      el.removeEventListener("jui-drop" as string, handleDrop as EventListener);
    };
  }, [disabled, accept, onOver, onOut, onDrop]);

  const className = [
    activeClass && isActive ? activeClass : "",
    hoverClass && isOver ? hoverClass : "",
  ].filter(Boolean).join(" ");

  return {
    ref,
    isOver,
    isActive,
    droppableProps: {
      "data-droppable": true as const,
      "data-droppable-active": isActive,
      "data-droppable-over": isOver,
      className: className || undefined,
    },
  };
}

// ============================================================================
// useResizable - Replaces jQuery UI resizable.js
// ============================================================================

export type UseResizableOptions = ResizableOptions

export interface UseResizableReturn {
  /** Ref for the resizable element */
  ref: React.RefCallback<HTMLElement>;
  /** Current size */
  size: { width: number; height: number };
  /** Whether currently resizing */
  isResizing: boolean;
  /** Set size manually */
  setSize: (size: { width: number; height: number }) => void;
  /** Resize handle directions being used */
  activeHandle: string | null;
}

/**
 * Hook that provides resize behavior for elements.
 * Replaces jQuery UI's $(el).resizable({...})
 */
export function useResizable(options: UseResizableOptions = {}): UseResizableReturn {
  const {
    disabled = false,
    handles = "e,s,se",
    minWidth = 20,
    minHeight = 20,
    maxWidth = Infinity,
    maxHeight = Infinity,
    aspectRatio = false,
    grid,
    animate = false,
    animateDuration = "slow",
    onStart,
    onResize,
    onStop,
  } = options;

  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = React.useState(false);
  const [activeHandle, setActiveHandle] = React.useState<string | null>(null);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const resizeStateRef = React.useRef<{
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
    handle: string;
  } | null>(null);

  // Initialize size from element
  React.useEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleResizeStart = React.useCallback((direction: string) => (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    resizeStateRef.current = {
      startWidth: size.width,
      startHeight: size.height,
      startX: clientX,
      startY: clientY,
      handle: direction,
    };

    setIsResizing(true);
    setActiveHandle(direction);

    if (onStart && elementRef.current) {
      onStart(e as unknown as MouseEvent, {
        element: elementRef.current,
        size: { ...size },
        position: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
        originalSize: { ...size },
        originalPosition: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
      });
    }

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!resizeStateRef.current || !elementRef.current) return;

      const moveClientX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      let newWidth = resizeStateRef.current.startWidth;
      let newHeight = resizeStateRef.current.startHeight;
      const handle = resizeStateRef.current.handle;

      if (handle.includes("e")) newWidth = resizeStateRef.current.startWidth + (moveClientX - resizeStateRef.current.startX);
      if (handle.includes("s")) newHeight = resizeStateRef.current.startHeight + (moveClientY - resizeStateRef.current.startY);
      if (handle.includes("w")) newWidth = resizeStateRef.current.startWidth - (moveClientX - resizeStateRef.current.startX);
      if (handle.includes("n")) newHeight = resizeStateRef.current.startHeight - (moveClientY - resizeStateRef.current.startY);

      // Constrain
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      // Aspect ratio
      if (aspectRatio) {
        const ratio = typeof aspectRatio === "number" ? aspectRatio : newWidth / newHeight;
        if (handle.includes("e") || handle.includes("w")) {
          newHeight = newWidth / ratio;
        } else {
          newWidth = newHeight * ratio;
        }
      }

      // Grid snap
      if (grid) {
        newWidth = Math.round(newWidth / grid[0]) * grid[0];
        newHeight = Math.round(newHeight / grid[1]) * grid[1];
      }

      const newSize = { width: newWidth, height: newHeight };

      if (onResize && elementRef.current) {
        onResize(moveEvent as unknown as MouseEvent, {
          element: elementRef.current,
          size: newSize,
          position: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
          originalSize: { width: resizeStateRef.current.startWidth, height: resizeStateRef.current.startHeight },
          originalPosition: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
        });
      }

      setSize(newSize);
    };

    const handleMouseUp = (upEvent: MouseEvent | TouchEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);

      setIsResizing(false);
      setActiveHandle(null);

      if (onStop && elementRef.current) {
        onStop(upEvent as unknown as MouseEvent, {
          element: elementRef.current,
          size: { ...size },
          position: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
          originalSize: { width: resizeStateRef.current?.startWidth ?? size.width, height: resizeStateRef.current?.startHeight ?? size.height },
          originalPosition: { top: elementRef.current.offsetTop, left: elementRef.current.offsetLeft },
        });
      }

      resizeStateRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
  }, [disabled, size, minWidth, minHeight, maxWidth, maxHeight, aspectRatio, grid, onStart, onResize, onStop]);

  const ref = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
    if (node) {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  return {
    ref,
    size,
    isResizing,
    setSize,
    activeHandle,
  };
}

// ============================================================================
// useSelectable - Replaces jQuery UI selectable.js
// ============================================================================

export type UseSelectableOptions = SelectableOptions

export interface UseSelectableReturn<T = HTMLElement> {
  /** Ref for the selectable container */
  ref: React.RefCallback<HTMLElement>;
  /** Currently selected items */
  selected: T[];
  /** Whether currently selecting */
  isSelecting: boolean;
  /** Select an item */
  select: (item: T) => void;
  /** Unselect an item */
  unselect: (item: T) => void;
  /** Toggle selection */
  toggle: (item: T) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Select all */
  selectAll: () => void;
  /** Selectable container props */
  selectableProps: {
    "data-selectable": true;
    style: React.CSSProperties;
  };
}

/**
 * Hook that provides lasso/range selection behavior.
 * Replaces jQuery UI's $(el).selectable({...})
 */
export function useSelectable<T = HTMLElement>(options: UseSelectableOptions = {}): UseSelectableReturn<T> {
  const {
    disabled = false,
    filter = "li",
    tolerance = "touch",
    distance = 0,
    onStart,
    onSelecting,
    onSelected,
    onUnselected,
    onStop,
  } = options;

  const [selected, setSelected] = React.useState<T[]>([]);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const lassoRef = React.useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

  const select = React.useCallback((item: T) => {
    setSelected((prev) => prev.includes(item) ? prev : [...prev, item]);
  }, []);

  const unselect = React.useCallback((item: T) => {
    setSelected((prev) => prev.filter((s) => s !== item));
  }, []);

  const toggle = React.useCallback((item: T) => {
    setSelected((prev) => prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]);
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelected([]);
  }, []);

  const selectAll = React.useCallback(() => {
    if (!elementRef.current) return;
    const items = elementRef.current.querySelectorAll(filter);
    setSelected(Array.from(items) as unknown as T[]);
  }, [filter]);

  // Lasso selection via mouse drag
  React.useEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only
      lassoRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!lassoRef.current) return;
      const dx = e.clientX - lassoRef.current.startX;
      const dy = e.clientY - lassoRef.current.startY;
      if (!lassoRef.current.moved && Math.sqrt(dx * dx + dy * dy) < distance) return;
      lassoRef.current.moved = true;
      setIsSelecting(true);
    };

    const handleMouseUp = () => {
      if (lassoRef.current?.moved) {
        setIsSelecting(false);
        onStop?.({} as MouseEvent, {
          selecting: [],
          selected: selected as unknown as HTMLElement[],
          unselecting: [],
          unselected: [],
        });
      }
      lassoRef.current = null;
    };

    el.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [disabled, distance, selected, onStop]);

  const ref = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return {
    ref,
    selected,
    isSelecting,
    select,
    unselect,
    toggle,
    clearSelection,
    selectAll,
    selectableProps: {
      "data-selectable": true as const,
      style: { userSelect: "none" },
    },
  };
}

// ============================================================================
// useSortable - Replaces jQuery UI sortable.js
// ============================================================================

export type UseSortableOptions<T> = SortableOptions<T>

export interface UseSortableReturn<T> {
  /** Ref for the sortable container */
  ref: React.RefCallback<HTMLElement>;
  /** Current items order */
  items: T[];
  /** Set items */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** Whether currently sorting */
  isSorting: boolean;
  /** Active item index */
  activeIndex: number | null;
  /** Move item from one index to another */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** Remove item at index */
  removeItem: (index: number) => void;
  /** Insert item at index */
  insertItem: (index: number, item: T) => void;
  /** Cancel current sort */
  cancel: () => void;
  /** Refresh positions */
  refresh: () => void;
  /** Serialize item order */
  serialize: () => Array<{ id: string | number; position: number }>;
  /** Sortable container props */
  sortableProps: {
    "data-sortable": true;
    role: "listbox";
  };
}

/**
 * Hook that provides sortable list behavior.
 * Replaces jQuery UI's $(el).sortable({...})
 */
export function useSortable<T extends { id?: string | number }>(options: UseSortableOptions<T> = {}): UseSortableReturn<T> {
  const {
    disabled = false,
    delay = 0,
    distance = 0,
    axis = false,
    tolerance = "intersect",
    onStart,
    onSort,
    onStop,
    onUpdate,
  } = options;

  const [items, setItems] = React.useState<T[]>([]);
  const [isSorting, setIsSorting] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const elementRef = React.useRef<HTMLElement | null>(null);

  const moveItem = React.useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  const removeItem = React.useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const insertItem = React.useCallback((index: number, item: T) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 0, item);
      return newItems;
    });
  }, []);

  const cancel = React.useCallback(() => {
    setIsSorting(false);
    setActiveIndex(null);
  }, []);

  const refresh = React.useCallback(() => {
    // Trigger a re-render to recalculate positions
    setItems((prev) => [...prev]);
  }, []);

  const serialize = React.useCallback(() => {
    return items.map((item, index) => ({
      id: item.id ?? index,
      position: index,
    }));
  }, [items]);

  const ref = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return {
    ref,
    items,
    setItems,
    isSorting,
    activeIndex,
    moveItem,
    removeItem,
    insertItem,
    cancel,
    refresh,
    serialize,
    sortableProps: {
      "data-sortable": true as const,
      role: "listbox" as const,
    },
  };
}

// ============================================================================
// usePosition - Replaces jQuery UI position.js
// ============================================================================

export interface UsePositionOptions {
  /** Element to position (trigger) */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Content element to position */
  contentRef: React.RefObject<HTMLElement | null>;
  /** Alignment config */
  alignment?: {
    at?: string;
    my?: string;
    collision?: "flip" | "fit" | "flipfit" | "none";
    offset?: string;
    within?: HTMLElement | Window;
  };
  /** Whether positioning is active */
  enabled?: boolean;
  /** Called when position is calculated */
  onPositioned?: (position: { top: number; left: number }) => void;
}

export interface UsePositionReturn {
  /** Calculated position */
  position: { top: number; left: number };
  /** Recalculate position */
  recalculate: () => void;
  /** Whether position has been calculated */
  isPositioned: boolean;
}

/**
 * Hook that positions an element relative to another.
 * Replaces jQuery UI's $(el).position({...}) utility
 */
export function usePosition(options: UsePositionOptions): UsePositionReturn {
  const {
    triggerRef,
    contentRef,
    alignment = {},
    enabled = true,
    onPositioned,
  } = options;

  const { at = "bottom left", my = "top left", collision = "flip", offset } = alignment;

  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = React.useState(false);

  const recalculate = React.useCallback(() => {
    if (!enabled || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Parse "at" position (relative to trigger)
    const [atV, atH] = at.split(" ");
    // Parse "my" position (relative to content)
    const [myV, myH] = my.split(" ");

    let top = triggerRect.top;
    let left = triggerRect.left;

    // Calculate "at" point on trigger
    if (atV === "center") top += triggerRect.height / 2;
    else if (atV === "bottom") top += triggerRect.height;

    if (atH === "center") left += triggerRect.width / 2;
    else if (atH === "right") left += triggerRect.width;

    // Subtract "my" point on content
    if (myV === "center") top -= contentRect.height / 2;
    else if (myV === "bottom") top -= contentRect.height;

    if (myH === "center") left -= contentRect.width / 2;
    else if (myH === "right") left -= contentRect.width;

    // Apply offset
    if (offset) {
      const parts = offset.split(" ");
      const offsetY = parseInt(parts[0], 10) || 0;
      const offsetX = parts.length > 1 ? parseInt(parts[1], 10) : 0;
      top += offsetY;
      left += offsetX;
    }

    // Add scroll offset
    top += window.scrollY;
    left += window.scrollX;

    // Collision detection
    if (collision !== "none") {
      const contentBottom = top + contentRect.height - window.scrollY;
      const contentRight = left + contentRect.width - window.scrollX;

      // Flip vertical
      if (collision === "flip" || collision === "flipfit") {
        if (contentBottom > viewportHeight && triggerRect.top > contentRect.height) {
          top = triggerRect.top - contentRect.height + window.scrollY;
          if (atV === "bottom") top += triggerRect.height;
        }
      }

      // Flip horizontal
      if (collision === "flip" || collision === "flipfit") {
        if (contentRight > viewportWidth && triggerRect.left > contentRect.width) {
          left = triggerRect.left - contentRect.width + window.scrollX;
          if (atH === "right") left += triggerRect.width;
        }
      }

      // Fit: clamp to viewport
      if (collision === "fit" || collision === "flipfit") {
        top = Math.max(window.scrollY, Math.min(top, window.scrollY + viewportHeight - contentRect.height));
        left = Math.max(window.scrollX, Math.min(left, window.scrollX + viewportWidth - contentRect.width));
      }
    }

    const newPos = { top, left };
    setPosition(newPos);
    setIsPositioned(true);
    onPositioned?.(newPos);
  }, [enabled, triggerRef, contentRef, at, my, collision, offset, onPositioned]);

  // Recalculate on scroll and resize
  React.useEffect(() => {
    if (!enabled) return;

    recalculate();

    const handleResize = () => recalculate();
    const handleScroll = () => recalculate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [enabled, recalculate]);

  return { position, recalculate, isPositioned };
}

// ============================================================================
// useDisableSelection - Replaces jQuery UI disable-selection.js
// ============================================================================

/**
 * Hook that disables text selection on an element.
 * Replaces jQuery UI's disableSelection() utility
 */
export function useDisableSelection(enabled: boolean = true) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener("selectstart", handleSelectStart);
    el.style.userSelect = "none";
    el.style.webkitUserSelect = "none";

    return () => {
      el.removeEventListener("selectstart", handleSelectStart);
      el.style.userSelect = "";
      el.style.webkitUserSelect = "";
    };
  }, [enabled]);

  return ref;
}

// ============================================================================
// useFocusable - Replaces jQuery UI focusable.js
// ============================================================================

const FOCUSABLE_SELECTOR = [
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[href]",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
  "details > summary:first-child",
].join(", ");

/**
 * Hook that finds focusable children within an element.
 * Replaces jQuery UI's $(":focusable") utility
 */
export function useFocusable(containerRef: React.RefObject<HTMLElement | null>) {
  const [focusableElements, setFocusableElements] = React.useState<HTMLElement[]>([]);

  const refresh = React.useCallback(() => {
    if (!containerRef.current) return;
    const elements = Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];
    setFocusableElements(elements);
  }, [containerRef]);

  React.useEffect(() => {
    refresh();

    const observer = new MutationObserver(refresh);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "tabindex", "hidden"],
      });
    }

    return () => observer.disconnect();
  }, [containerRef, refresh]);

  return { focusableElements, refresh };
}

// ============================================================================
// useTabbable - Replaces jQuery UI tabbable.js
// ============================================================================

const TABBABLE_SELECTOR = [
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[href]",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
  "details > summary:first-child",
].join(", ");

/**
 * Hook that finds tabbable children within an element.
 * Replaces jQuery UI's $(":tabbable") utility
 */
export function useTabbable(containerRef: React.RefObject<HTMLElement | null>) {
  const [tabbableElements, setTabbableElements] = React.useState<HTMLElement[]>([]);

  const refresh = React.useCallback(() => {
    if (!containerRef.current) return;
    const elements = Array.from(
      containerRef.current.querySelectorAll(TABBABLE_SELECTOR)
    ) as HTMLElement[];
    // Filter to only visible elements with positive tabindex
    const tabbable = elements.filter(
      (el) => el.offsetParent !== null && !el.hasAttribute("disabled")
    );
    setTabbableElements(tabbable);
  }, [containerRef]);

  React.useEffect(() => {
    refresh();

    const observer = new MutationObserver(refresh);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "tabindex", "hidden", "style"],
      });
    }

    return () => observer.disconnect();
  }, [containerRef, refresh]);

  return { tabbableElements, refresh };
}

// ============================================================================
// useLabels - Replaces jQuery UI labels.js
// ============================================================================

/**
 * Hook that finds labels associated with an element.
 * Replaces jQuery UI's labels() utility
 */
export function useLabels(elementRef: React.RefObject<HTMLElement | null>) {
  const [labels, setLabels] = React.useState<HTMLLabelElement[]>([]);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const foundLabels: HTMLLabelElement[] = [];

    // Find labels by "for" attribute
    if (el.id) {
      const forLabels = document.querySelectorAll(`label[for="${el.id}"]`);
      foundLabels.push(...Array.from(forLabels) as HTMLLabelElement[]);
    }

    // Find ancestor labels
    const ancestorLabel = el.closest("label");
    if (ancestorLabel) {
      foundLabels.push(ancestorLabel as HTMLLabelElement);
    }

    setLabels(foundLabels);
  }, [elementRef]);

  return { labels };
}

// ============================================================================
// useScrollParent - Replaces jQuery UI scroll-parent.js
// ============================================================================

/**
 * Hook that finds the scrollable parent of an element.
 * Replaces jQuery UI's scrollParent() utility
 */
export function useScrollParent(elementRef: React.RefObject<HTMLElement | null>) {
  const [scrollParent, setScrollParent] = React.useState<HTMLElement | Window | null>(null);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const getScrollParent = (element: HTMLElement): HTMLElement | Window => {
      const style = getComputedStyle(element);
      const overflowRegex = /(auto|scroll)/;

      if (style.position === "fixed") return window;

      let parent = element.parentElement;
      while (parent) {
        const parentStyle = getComputedStyle(parent);
        if (overflowRegex.test(parentStyle.overflow + parentStyle.overflowY + parentStyle.overflowX)) {
          return parent;
        }
        parent = parent.parentElement;
      }

      return window;
    };

    setScrollParent(getScrollParent(el));
  }, [elementRef]);

  return { scrollParent };
}

// ============================================================================
// useUniqueId - Replaces jQuery UI unique-id.js
// ============================================================================

let idCounter = 0;

/**
 * Hook that generates a unique ID for an element.
 * Replaces jQuery UI's uniqueId() / removeUniqueId() utilities
 */
export function useUniqueId(prefix: string = "jui"): string {
  const [id] = React.useState(() => `${prefix}-${++idCounter}`);
  return id;
}

// ============================================================================
// useFormReset - Replaces jQuery UI form-reset-mixin.js
// ============================================================================

/**
 * Hook that handles form reset events, restoring default values.
 * Replaces jQuery UI's formResetMixin
 */
export function useFormReset(
  elementRef: React.RefObject<HTMLElement | null>,
  onReset: () => void
) {
  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const form = el.closest("form");
    if (!form) return;

    const handleReset = () => {
      // Delay to let the form reset happen first
      setTimeout(onReset, 1);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [elementRef, onReset]);
}
