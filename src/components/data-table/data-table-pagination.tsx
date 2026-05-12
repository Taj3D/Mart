"use client"

import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Locale interface for pagination text */
export interface DataTablePaginationLocale {
  formatShowingRows?: (from: number, to: number, total: number) => string
  formatRecordsPerPage?: (pageSize: number) => string
  formatAllRows?: () => string
  rowsPerPageLabel?: string
  pageLabel?: (current: number, total: number) => string
  selectedLabel?: (count: number) => string
}

/** Default English locale */
const defaultLocale: Required<DataTablePaginationLocale> = {
  formatShowingRows: (from, to, total) =>
    `Showing ${from} to ${to} of ${total} records`,
  formatRecordsPerPage: (pageSize) => `${pageSize} records/page`,
  formatAllRows: () => "All",
  rowsPerPageLabel: "Rows per page",
  pageLabel: (current, total) => `Page ${current} of ${total}`,
  selectedLabel: (count) => `${count} selected`,
}

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  /** Smart display: hide pagination controls when only 1 page */
  smartDisplay?: boolean
  /** Pagination position */
  paginationVAlign?: "bottom" | "top" | "both"
  /** Whether pagination is currently visible (controlled by showPaginationSwitch) */
  paginationVisible?: boolean
  /** Locale overrides */
  locale?: DataTablePaginationLocale
  /** Total rows for server-side pagination */
  totalRows?: number
  /** Whether using server-side pagination */
  serverSide?: boolean
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50, 100],
  smartDisplay = false,
  paginationVAlign = "bottom",
  paginationVisible = true,
  locale,
  totalRows,
  serverSide = false,
}: DataTablePaginationProps<TData>) {
  const mergedLocale = { ...defaultLocale, ...locale }
  const selectedRowCount = Object.keys(table.getState().rowSelection).length

  // Calculate row range
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize

  let filteredRowCount: number
  let pageCount: number

  if (serverSide && totalRows !== undefined) {
    filteredRowCount = totalRows
    pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  } else {
    filteredRowCount = table.getFilteredRowModel().rows.length
    pageCount = table.getPageCount()
  }

  const fromRow = filteredRowCount === 0 ? 0 : pageIndex * pageSize + 1
  const toRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount)

  // Smart display: hide pagination when only 1 page and no selection
  if (smartDisplay && pageCount <= 1 && selectedRowCount === 0) {
    return null
  }

  // If pagination is hidden by toggle
  if (!paginationVisible) {
    // Still show selection count even when pagination is hidden
    if (selectedRowCount > 0) {
      return (
        <div className="flex items-center px-1 py-1">
          <span className="text-xs bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 px-2 py-0.5 rounded-full font-medium">
            {mergedLocale.selectedLabel(selectedRowCount)}
          </span>
        </div>
      )
    }
    return null
  }

  const paginationContent = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-1">
      {/* Left: Row info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {selectedRowCount > 0 && (
          <span className="text-xs bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 px-2 py-0.5 rounded-full font-medium">
            {mergedLocale.selectedLabel(selectedRowCount)}
          </span>
        )}
        <span className="text-xs">
          {mergedLocale.formatShowingRows(fromRow, toRow, filteredRowCount)}
        </span>
      </div>

      {/* Right: Pagination controls */}
      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {mergedLocale.rowsPerPageLabel}
          </span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[65px] text-xs">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2 whitespace-nowrap">
            {mergedLocale.pageLabel(pageIndex + 1, pageCount)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )

  // For "both" position, render pagination at both top and bottom
  // The actual positioning is handled by the parent DataTable component
  return paginationContent
}

/**
 * Helper component that renders pagination at top and/or bottom position.
 */
export function DataTablePaginationWrapper<TData>({
  table,
  pageSizeOptions,
  smartDisplay,
  paginationVAlign = "bottom",
  paginationVisible,
  locale,
  totalRows,
  serverSide,
}: DataTablePaginationProps<TData>) {
  const topPagination = paginationVAlign === "top" || paginationVAlign === "both"
  const bottomPagination = paginationVAlign === "bottom" || paginationVAlign === "both"

  return (
    <>
      {topPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          smartDisplay={smartDisplay}
          paginationVAlign={paginationVAlign}
          paginationVisible={paginationVisible}
          locale={locale}
          totalRows={totalRows}
          serverSide={serverSide}
        />
      )}
      {bottomPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          smartDisplay={smartDisplay}
          paginationVAlign={paginationVAlign}
          paginationVisible={paginationVisible}
          locale={locale}
          totalRows={totalRows}
          serverSide={serverSide}
        />
      )}
    </>
  )
}
