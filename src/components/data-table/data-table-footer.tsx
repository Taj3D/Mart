"use client"

import * as React from "react"
import { Table, flexRender, ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

export type FooterFormatter<TData> = (rows: TData[], columnId: string) => React.ReactNode

interface DataTableFooterProps<TData> {
  /** The TanStack Table instance */
  table: Table<TData>
  /** Footer formatters per column ID */
  footerFormatters?: Record<string, FooterFormatter<TData>>
  /** Whether the footer is visible */
  showFooter?: boolean
  /** Custom class name */
  className?: string
}

/**
 * DataTableFooter - Renders a tfoot section with aggregated data.
 * Supports footerFormatter per column for custom aggregation logic.
 *
 * Built-in formatters:
 * - "sum" — Sum of numeric values
 * - "count" — Count of non-null values
 * - "avg" — Average of numeric values
 * - "min" — Minimum value
 * - "max" — Maximum value
 */
export function DataTableFooter<TData>({
  table,
  footerFormatters,
  showFooter = true,
  className,
}: DataTableFooterProps<TData>) {
  if (!showFooter) return null

  const rows = table.getFilteredRowModel().rows.map((row) => row.original)

  // Built-in aggregation functions
  const aggregateFns: Record<string, (values: unknown[]) => React.ReactNode> = {
    sum: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      const sum = nums.reduce((a, b) => a + b, 0)
      return formatNumber(sum)
    },
    count: (values) => {
      const count = values.filter((v) => v !== null && v !== undefined && v !== "").length
      return count.toString()
    },
    avg: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length
      return formatNumber(avg)
    },
    min: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return formatNumber(Math.min(...nums))
    },
    max: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return formatNumber(Math.max(...nums))
    },
  }

  function formatNumber(value: number): string {
    if (Number.isInteger(value)) return value.toLocaleString()
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function getCellValue(row: TData, columnId: string): unknown {
    // Use the column accessor to get the raw value
    const column = table.getColumn(columnId)
    if (!column?.accessorFn) return (row as Record<string, unknown>)[columnId]
    try {
      return column.accessorFn(row, 0)
    } catch {
      return (row as Record<string, unknown>)[columnId]
    }
  }

  return (
    <tfoot
      data-slot="table-footer"
      className={cn("ims-table-footer", className)}
    >
      {table.getHeaderGroups().map((headerGroup) => {
        // Match footer cells to header group structure
        return (
          <tr key={`footer-${headerGroup.id}`} className="border-t-2 border-navy-200 dark:border-navy-700">
            {headerGroup.headers.map((header) => {
              const columnId = header.column.id

              // Check for custom footerFormatter
              let footerContent: React.ReactNode = null

              if (footerFormatters && footerFormatters[columnId]) {
                footerContent = footerFormatters[columnId](rows, columnId)
              } else if (header.column.columnDef.footer) {
                // Use TanStack's built-in footer
                footerContent = flexRender(header.column.columnDef.footer, header.getContext())
              } else {
                // No footer for this column - skip non-data columns
                if (
                  columnId === "select" ||
                  columnId === "detailToggle" ||
                  columnId === "rowNumber" ||
                  columnId === "actions" ||
                  columnId === "radio"
                ) {
                  // Skip utility columns but still render the cell
                  return (
                    <th
                      key={`footer-${header.id}`}
                      className={cn(
                        "px-3 py-2 text-xs font-semibold text-navy-700 dark:text-navy-300",
                        "bg-navy-50 dark:bg-navy-900/20",
                        "whitespace-nowrap"
                      )}
                    >
                      &nbsp;
                    </th>
                  )
                }
              }

              return (
                <th
                  key={`footer-${header.id}`}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold text-navy-700 dark:text-navy-300",
                    "bg-navy-50 dark:bg-navy-900/20",
                    "whitespace-nowrap text-left"
                  )}
                >
                  {footerContent}
                </th>
              )
            })}
          </tr>
        )
      })}
    </tfoot>
  )
}

/**
 * Helper to create a built-in aggregation footer formatter.
 * Usage: footerFormatters={{ amount: createFooterAggregator("sum") }}
 */
export function createFooterAggregator(
  type: "sum" | "count" | "avg" | "min" | "max",
  prefix?: string,
  suffix?: string
): FooterFormatter<Record<string, unknown>> {
  const aggregateFn: Record<string, (values: unknown[]) => React.ReactNode> = {
    sum: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return nums.reduce((a, b) => a + b, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    count: (values) => values.filter((v) => v !== null && v !== undefined && v !== "").length.toString(),
    avg: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return (nums.reduce((a, b) => a + b, 0) / nums.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    min: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return Math.min(...nums).toLocaleString()
    },
    max: (values) => {
      const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number)
      if (nums.length === 0) return "—"
      return Math.max(...nums).toLocaleString()
    },
  }

  return (rows: Record<string, unknown>[], columnId: string) => {
    const values = rows.map((row) => row[columnId])
    const result = aggregateFn[type](values)
    return (
      <span>
        {prefix && <span className="text-navy-400 dark:text-navy-500 mr-1">{prefix}</span>}
        {result}
        {suffix && <span className="text-navy-400 dark:text-navy-500 ml-1">{suffix}</span>}
      </span>
    )
  }
}
