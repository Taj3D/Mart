"use client"

import * as React from "react"
import { ColumnDef, flexRender, Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DataTableCardViewProps<TData> {
  /** The TanStack Table instance */
  table: Table<TData>
  /** Whether the data is loading */
  isLoading?: boolean
  /** Locale text for no matches */
  noMatchesText?: string
  /** Loading text */
  loadingText?: string
  /** Custom card class name */
  className?: string
  /** Whether rows are selectable (clickable) */
  clickToSelect?: boolean
  /** Selected row IDs */
  selectedRowIds?: Record<string, boolean>
  /** Callback when a card is clicked */
  onRowClick?: (row: TData, rowIndex: number, event: React.MouseEvent) => void
  /** Callback when a card is double-clicked */
  onRowDblClick?: (row: TData, rowIndex: number, event: React.MouseEvent) => void
  /** Row style callback */
  rowStyle?: (row: TData, rowIndex: number) => { className?: string; style?: React.CSSProperties }
}

/**
 * DataTableCardView - Renders table data in a card layout instead of table rows.
 * Used for mobile/responsive view or when cardView prop is true.
 *
 * Each row is displayed as a card with field label + value pairs.
 */
export function DataTableCardView<TData>({
  table,
  isLoading = false,
  noMatchesText = "No matching records found",
  loadingText = "Loading data...",
  className,
  clickToSelect = false,
  selectedRowIds = {},
  onRowClick,
  onRowDblClick,
  rowStyle,
}: DataTableCardViewProps<TData>) {
  const rows = table.getRowModel().rows
  const visibleColumns = table.getVisibleLeafColumns()

  // Get column header labels
  const getColumnLabel = (columnId: string): string => {
    const column = table.getColumn(columnId)
    if (!column) return columnId
    // Try to get the header text
    const header = column.columnDef.header
    if (typeof header === "string") return header
    // Fallback to formatted column ID
    return columnId.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse border-navy-100 dark:border-navy-800">
            <CardContent className="p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3 w-20 bg-navy-100 dark:bg-navy-800 rounded" />
                  <div className="h-3 w-24 bg-navy-100 dark:bg-navy-200/30 dark:bg-navy-800 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <p className="text-sm text-muted-foreground">{noMatchesText}</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4", className)}>
      {rows.map((row, rowIndex) => {
        const isSelected = selectedRowIds[row.id] ?? false
        const rowStyleResult = rowStyle ? rowStyle(row.original, rowIndex) : undefined

        return (
          <Card
            key={row.id}
            className={cn(
              "border transition-all duration-150",
              "hover:border-navy-300 dark:hover:border-navy-600",
              "hover:shadow-md",
              isSelected && "border-navy-400 dark:border-navy-500 bg-navy-50/50 dark:bg-navy-900/20",
              clickToSelect && "cursor-pointer",
              rowStyleResult?.className
            )}
            style={rowStyleResult?.style}
            onClick={(e) => {
              if (clickToSelect) {
                row.toggleSelected(!isSelected)
              }
              onRowClick?.(row.original, rowIndex, e)
            }}
            onDoubleClick={(e) => onRowDblClick?.(row.original, rowIndex, e)}
            data-state={isSelected ? "selected" : undefined}
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-navy-700 dark:text-navy-300">
                  Row {rowIndex + 1}
                </CardTitle>
                {isSelected && (
                  <Badge className="bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300 border-0 text-[10px] px-1.5 py-0">
                    Selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="ims-card-view space-y-1.5">
                {row.getVisibleCells().map((cell) => {
                  // Skip non-data columns (select, detail, rowNumber, actions)
                  const columnId = cell.column.id
                  if (
                    columnId === "select" ||
                    columnId === "detailToggle" ||
                    columnId === "rowNumber" ||
                    columnId === "actions" ||
                    columnId === "radio"
                  ) {
                    return null
                  }

                  const label = getColumnLabel(columnId)
                  const cellValue = flexRender(cell.column.columnDef.cell, cell.getContext())

                  return (
                    <div key={cell.id} className="ims-card-view-item flex items-start gap-2">
                      <span className="ims-card-view-title text-navy-500 dark:text-navy-400 text-xs whitespace-nowrap min-w-[30%]">
                        {label}:
                      </span>
                      <span className="text-xs text-foreground flex-1 break-words">
                        {cellValue}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
