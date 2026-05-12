# Task: ResizablePanel Component

## Summary
Created `/home/z/my-project/src/components/ui/resizable-panel.tsx` — a comprehensive ResizablePanel component that replaces jQuery UI's `.ui-resizable` functionality.

## What was built

### `useResizable` Hook
- Core resize logic extracted as a composable hook
- Returns width/height state, isResizing flag, activeDirection, containerRef, startResize, handleKeyboardResize, isHovered, hoverHandlers
- Pointer event-based drag tracking with pointer capture
- Bounds constraint support ('parent' | 'window' | CSS selector)
- Min/max dimension enforcement with smooth snap-back
- Keyboard support: arrow keys for 10px steps, Shift+arrow for 50px steps

### `ResizablePanel` Component
- Wraps content in a shadcn/ui Card with resize handles
- 8 resize handles matching jQuery UI's .ui-resizable-{n,s,e,w,se,sw,nw,ne}
- Edge handles: 7px invisible strips with 2px navy-400 indicator line on hover
- SE corner: 12x12px with diagonal lines (≡ rotated 45°), always slightly visible
- Other corners: 9x9px with navy-400 dot indicators, visible on panel hover
- Ghost outline during resize: dashed navy-500 border with shadow
- Dimension tooltip (WxH) shown during active resize
- Framer Motion animations for ghost outline and dimension tooltip
- All handles have tabindex for keyboard accessibility
- CSS classes prefixed with `ims-`: ims-resizable, ims-resizable-handle, ims-resizable-n/s/e/w, ims-resizable-se/sw/nw/ne, ims-resizable-disabled, ims-resizable-ghost

### Props
- defaultWidth/defaultHeight (initial dimensions)
- minWidth/minHeight (default 100px)
- maxWidth/maxHeight
- onResize/onResizeEnd callbacks
- disabled, showHandles, className, bounds

## Lint Result
✅ No errors — only pre-existing warning about TanStack Table in data-table.tsx
