"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableDetailProps<TData> {
  /** Whether the detail row is expanded */
  isExpanded: boolean
  /** Toggle expansion state */
  onToggle: () => void
  /** The row data */
  row: TData
  /** The row index */
  rowIndex: number
  /** Custom formatter for the detail content */
  detailFormatter?: (row: TData, rowIndex: number) => React.ReactNode
  /** Custom expand icon */
  expandIcon?: React.ReactNode
  /** Custom collapse icon */
  collapseIcon?: React.ReactNode
  /** Number of columns to span */
  colSpan: number
}

/**
 * DataTableDetailRow - Renders the expandable detail row below a table row.
 * Used internally by DataTable when detailView is enabled.
 */
export function DataTableDetailRow<TData>({
  isExpanded,
  row,
  rowIndex,
  detailFormatter,
  colSpan,
}: DataTableDetailProps<TData>) {
  if (!isExpanded || !detailFormatter) return null

  return (
    <tr
      data-slot="table-detail-row"
      className="dt-detail-row"
      role="row"
    >
      <td
        colSpan={colSpan}
        className={cn(
          "px-4 py-3 bg-navy-50/50 dark:bg-navy-900/10",
          "border-b border-border/50",
          "text-sm text-foreground"
        )}
      >
        <div className="dt-detail-content animate-detail-expand">
          {detailFormatter(row, rowIndex)}
        </div>
      </td>
    </tr>
  )
}

/**
 * DataTableDetailToggle - The expand/collapse button rendered in the detail column cell.
 */
export function DataTableDetailToggle({
  isExpanded,
  onToggle,
  expandIcon,
  collapseIcon,
}: {
  isExpanded: boolean
  onToggle: () => void
  expandIcon?: React.ReactNode
  collapseIcon?: React.ReactNode
}) {
  const defaultExpandIcon = <ChevronRight className="h-4 w-4 text-navy-500 dark:text-navy-400 transition-transform duration-200" />
  const defaultCollapseIcon = <ChevronDown className="h-4 w-4 text-navy-600 dark:text-navy-300 transition-transform duration-200" />

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 hover:bg-navy-100 dark:hover:bg-navy-800/50"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      aria-label={isExpanded ? "Collapse row" : "Expand row"}
      aria-expanded={isExpanded}
    >
      {isExpanded
        ? (collapseIcon ?? defaultCollapseIcon)
        : (expandIcon ?? defaultExpandIcon)}
    </Button>
  )
}

/**
 * DataTableExpandAllToggle - A toolbar button to expand/collapse all detail rows.
 */
export function DataTableExpandAllToggle({
  isAllExpanded,
  onToggleAll,
}: {
  isAllExpanded: boolean
  onToggleAll: () => void
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-9 gap-1.5 text-xs",
        "border-navy-200 dark:border-navy-700",
        "text-navy-700 dark:text-navy-300",
        "hover:bg-navy-50 dark:hover:bg-navy-900/30"
      )}
      onClick={onToggleAll}
      aria-label={isAllExpanded ? "Collapse all rows" : "Expand all rows"}
    >
      <ChevronsUpDown className="h-3.5 w-3.5" />
      {isAllExpanded ? "Collapse All" : "Expand All"}
    </Button>
  )
}

/**
 * getDetailColumn - Creates a column definition for the detail view expand/collapse toggle.
 * Use this as the first column when detailView is enabled.
 */
export function getDetailColumn<TData>(options?: {
  expandIcon?: React.ReactNode
  collapseIcon?: React.ReactNode
}): import("@tanstack/react-table").ColumnDef<TData> {
  return {
    id: "detailToggle",
    header: ({ table }) => {
      const expandedCount = Object.keys(table.getState().expanded ?? {}).length
      const totalRows = table.getRowModel().rows.length
      const isAllExpanded = expandedCount === totalRows && totalRows > 0
      return (
        <DataTableExpandAllToggle
          isAllExpanded={isAllExpanded}
          onToggleAll={() => table.toggleAllRowsExpanded(!isAllExpanded)}
        />
      )
    },
    cell: ({ row }) => (
      <DataTableDetailToggle
        isExpanded={row.getIsExpanded()}
        onToggle={() => row.toggleExpanded()}
        expandIcon={options?.expandIcon}
        collapseIcon={options?.collapseIcon}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  }
}
