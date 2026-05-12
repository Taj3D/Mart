"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  Row,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as TableFooterElement,
} from "@/components/ui/table"
import { DataTablePagination, DataTablePaginationWrapper } from "./data-table-pagination"
import type { DataTablePaginationLocale } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableToolbarLocale } from "./data-table-toolbar"
import { type ExportFormat, type ExportDataType } from "./data-table-export"
import { DataTableDetailRow } from "./data-table-detail"
import { DataTableCardView } from "./data-table-card-view"
import { DataTableFooter, type FooterFormatter } from "./data-table-footer"

import { cn } from "@/lib/utils"

/* ================================================================
   LOCALE INTERFACE
   ================================================================ */

export interface DataTableLocale {
  formatLoadingMessage?: () => string
  formatShowingRows?: (from: number, to: number, total: number) => string
  formatRecordsPerPage?: (pageSize: number) => string
  formatNoMatches?: () => string
  formatDetailPagination?: (count: number) => string
  formatSearch?: () => string
  formatRefresh?: () => string
  formatToggle?: () => string
  formatColumns?: () => string
  formatPaginationSwitch?: () => string
  formatAllRows?: () => string
  rowsPerPageLabel?: string
  pageLabel?: (current: number, total: number) => string
  selectedLabel?: (count: number) => string
  resetFiltersLabel?: string
}

/** Default English locale */
const defaultLocale: Required<DataTableLocale> = {
  formatLoadingMessage: () => "Loading data...",
  formatShowingRows: (from, to, total) =>
    `Showing ${from} to ${to} of ${total} records`,
  formatRecordsPerPage: (pageSize) => `${pageSize} records/page`,
  formatNoMatches: () => "No matching records found",
  formatDetailPagination: (count) => `Showing ${count} rows`,
  formatSearch: () => "Search...",
  formatRefresh: () => "Refresh",
  formatToggle: () => "Toggle View",
  formatColumns: () => "Columns",
  formatPaginationSwitch: () => "Pagination",
  formatAllRows: () => "All",
  rowsPerPageLabel: "Rows per page",
  pageLabel: (current, total) => `Page ${current} of ${total}`,
  selectedLabel: (count) => `${count} selected`,
  resetFiltersLabel: "Reset",
}

/* ================================================================
   PROPS INTERFACE
   ================================================================ */

interface DataTableProps<TData, TValue> {
  // ---- Existing props (keep all) ----
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
  isLoading?: boolean
  title?: string
  description?: string
  className?: string
  enableRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void
  pageSize?: number
  pageSizeOptions?: number[]
  /** Export configuration — pass to enable the Export dropdown button in the toolbar */
  exportConfig?: {
    exportTypes?: ExportFormat[]
    exportDataType?: ExportDataType
    allData?: TData[]
    columnLabels?: Record<string, string>
    fileName?: string
    tableName?: string
  }

  // ---- NEW: Detail View ----
  detailView?: boolean
  detailFormatter?: (row: TData, rowIndex: number) => React.ReactNode
  detailExpandIcon?: React.ReactNode
  detailCollapseIcon?: React.ReactNode

  // ---- NEW: Card View ----
  cardView?: boolean
  onCardViewChange?: (isCardView: boolean) => void
  showToggle?: boolean

  // ---- NEW: Row Styling ----
  rowStyle?: (row: TData, rowIndex: number) => { className?: string; style?: React.CSSProperties }

  // ---- NEW: Footer ----
  showFooter?: boolean
  footerFormatters?: Record<string, FooterFormatter<TData>>

  // ---- NEW: Striped ----
  striped?: boolean

  // ---- NEW: Fixed Header ----
  fixedHeader?: boolean
  maxHeight?: number | string

  // ---- NEW: Click to Select ----
  clickToSelect?: boolean

  // ---- NEW: Single Select (radio) ----
  singleSelect?: boolean

  // ---- NEW: Unique ID field ----
  uniqueId?: string

  // ---- NEW: Maintain Selected across pages ----
  maintainSelected?: boolean

  // ---- NEW: Show Refresh button ----
  showRefresh?: boolean
  onRefresh?: () => void

  // ---- NEW: Pagination toggle ----
  showPaginationSwitch?: boolean

  // ---- NEW: Pagination position ----
  paginationVAlign?: "bottom" | "top" | "both"

  // ---- NEW: Smart Display (hide pagination when 1 page) ----
  smartDisplay?: boolean

  // ---- NEW: Search options ----
  strictSearch?: boolean
  searchOnEnterKey?: boolean

  // ---- NEW: Event Callbacks ----
  onClickRow?: (row: TData, rowIndex: number, event: React.MouseEvent) => void
  onDblClickRow?: (row: TData, rowIndex: number, event: React.MouseEvent) => void
  onSort?: (sortName: string, sortOrder: "asc" | "desc") => void
  onSearch?: (searchText: string) => void
  onPageChange?: (pageNumber: number, pageSize: number) => void

  // ---- NEW: Server-side ----
  sidePagination?: "client" | "server"
  totalRows?: number
  onFetchData?: (params: {
    page: number
    pageSize: number
    sortName?: string
    sortOrder?: string
    searchText?: string
  }) => void

  // ---- NEW: Locale ----
  locale?: DataTableLocale
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  toolbarActions,
  isLoading = false,
  title,
  description,
  className,
  enableRowSelection = false,
  onRowSelectionChange,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  exportConfig,

  // New props with defaults
  detailView = false,
  detailFormatter,
  detailExpandIcon,
  detailCollapseIcon,
  cardView: controlledCardView,
  onCardViewChange,
  showToggle = false,
  rowStyle,
  showFooter = false,
  footerFormatters,
  striped = false,
  fixedHeader = false,
  maxHeight,
  clickToSelect = false,
  singleSelect = false,
  uniqueId,
  maintainSelected = true,
  showRefresh = false,
  onRefresh,
  showPaginationSwitch = false,
  paginationVAlign = "bottom",
  smartDisplay = false,
  strictSearch = false,
  searchOnEnterKey = false,
  onClickRow,
  onDblClickRow,
  onSort,
  onSearch,
  onPageChange,
  sidePagination = "client",
  totalRows: totalRowsProp,
  onFetchData,
  locale: localeProp,
}: DataTableProps<TData, TValue>) {
  // Merge locale
  const mergedLocale = React.useMemo(
    () => ({ ...defaultLocale, ...localeProp }),
    [localeProp]
  )

  // Derive pagination locale
  const paginationLocale: DataTablePaginationLocale = React.useMemo(
    () => ({
      formatShowingRows: mergedLocale.formatShowingRows,
      formatRecordsPerPage: mergedLocale.formatRecordsPerPage,
      formatAllRows: mergedLocale.formatAllRows,
      rowsPerPageLabel: mergedLocale.rowsPerPageLabel,
      pageLabel: mergedLocale.pageLabel,
      selectedLabel: mergedLocale.selectedLabel,
    }),
    [mergedLocale]
  )

  // Derive toolbar locale
  const toolbarLocale: DataTableToolbarLocale = React.useMemo(
    () => ({
      formatSearch: mergedLocale.formatSearch,
      formatRefresh: mergedLocale.formatRefresh,
      formatToggle: mergedLocale.formatToggle,
      formatColumns: mergedLocale.formatColumns,
      formatPaginationSwitch: mergedLocale.formatPaginationSwitch,
      resetFiltersLabel: mergedLocale.resetFiltersLabel,
    }),
    [mergedLocale]
  )

  // State
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [internalCardView, setInternalCardView] = React.useState(false)
  const [paginationVisible, setPaginationVisible] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Determine card view state (controlled vs uncontrolled)
  const isCardView = controlledCardView !== undefined ? controlledCardView : internalCardView

  const handleToggleView = React.useCallback(
    (newCardView: boolean) => {
      if (controlledCardView === undefined) {
        setInternalCardView(newCardView)
      }
      onCardViewChange?.(newCardView)
    },
    [controlledCardView, onCardViewChange]
  )

  // Determine server-side vs client-side pagination
  const isServerSide = sidePagination === "server"

  // Calculate pageCount for server-side
  const serverPageCount = React.useMemo(() => {
    if (!isServerSide || totalRowsProp === undefined) return undefined
    return Math.max(1, Math.ceil(totalRowsProp / pageSize))
  }, [isServerSide, totalRowsProp, pageSize])

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getExpandedRowModel: detailView ? getExpandedRowModel() : undefined,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater
      setSorting(newSorting)
      // Fire onSort callback
      if (onSort && newSorting.length > 0) {
        const sort = newSorting[0]
        onSort(sort.id, sort.desc ? "desc" : "asc")
      }
      // Fire onFetchData for server-side
      if (isServerSide && onFetchData) {
        const sort = newSorting.length > 0 ? newSorting[0] : undefined
        onFetchData({
          page: table.getState().pagination.pageIndex + 1,
          pageSize: table.getState().pagination.pageSize,
          sortName: sort?.id,
          sortOrder: sort?.desc ? "desc" : "asc",
          searchText: (table.getColumn(searchKey ?? "")?.getFilterValue() as string) ?? "",
        })
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onRowSelectionChange: (updater) => {
      let newSelection: RowSelectionState

      if (singleSelect) {
        // For single select, only allow one row selected at a time
        const resolvedValue = typeof updater === "function" ? updater(rowSelection) : updater
        const selectedKeys = Object.keys(resolvedValue).filter((key) => resolvedValue[key])
        if (selectedKeys.length > 1) {
          // Keep only the last selected
          const lastKey = selectedKeys[selectedKeys.length - 1]
          newSelection = { [lastKey]: true }
        } else {
          newSelection = resolvedValue
        }
      } else {
        newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      }

      setRowSelection(newSelection)

      if (onRowSelectionChange) {
        const selectedRowIds = Object.keys(newSelection).filter((key) => newSelection[key])
        const selectedRows = selectedRowIds
          .map((id) => {
            const row = table.getRowModel().rows.find((r) => r.id === id)
            return row?.original
          })
          .filter(Boolean) as TData[]
        onRowSelectionChange(selectedRows)
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    // Server-side pagination configuration
    manualPagination: isServerSide,
    pageCount: serverPageCount,
    // For server-side, also use manual sorting and filtering
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    enableRowSelection: enableRowSelection || singleSelect || clickToSelect,
    enableMultiRowSelection: !singleSelect,
    // Get row ID using uniqueId if provided
    getRowId: uniqueId
      ? (row) => String((row as Record<string, unknown>)[uniqueId])
      : undefined,
  })

  // Handle page change events
  React.useEffect(() => {
    if (onPageChange) {
      const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
      onPageChange(pageIndex + 1, currentPageSize)
    }
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize])

  // Handle server-side fetch when pagination changes
  React.useEffect(() => {
    if (isServerSide && onFetchData) {
      const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
      const sort = sorting.length > 0 ? sorting[0] : undefined
      onFetchData({
        page: pageIndex + 1,
        pageSize: currentPageSize,
        sortName: sort?.id,
        sortOrder: sort?.desc ? "desc" : "asc",
        searchText: (table.getColumn(searchKey ?? "")?.getFilterValue() as string) ?? "",
      })
    }
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, sorting])

  // Handle refresh
  const handleRefresh = React.useCallback(() => {
    setIsRefreshing(true)
    if (onRefresh) {
      onRefresh()
    }
    if (isServerSide && onFetchData) {
      const { pageIndex, pageSize: currentPageSize } = table.getState().pagination
      const sort = sorting.length > 0 ? sorting[0] : undefined
      onFetchData({
        page: pageIndex + 1,
        pageSize: currentPageSize,
        sortName: sort?.id,
        sortOrder: sort?.desc ? "desc" : "asc",
        searchText: (table.getColumn(searchKey ?? "")?.getFilterValue() as string) ?? "",
      })
    }
    // Reset refreshing after a short delay (if no external loading control)
    setTimeout(() => setIsRefreshing(false), 500)
  }, [onRefresh, isServerSide, onFetchData, table, sorting, searchKey])

  // Handle row click
  const handleRowClick = React.useCallback(
    (row: Row<TData>, event: React.MouseEvent) => {
      if (clickToSelect) {
        if (singleSelect) {
          // Deselect all, then select this row
          table.toggleAllRowsSelected(false)
          row.toggleSelected(true)
        } else {
          row.toggleSelected(!row.getIsSelected())
        }
      }
      onClickRow?.(row.original, row.index, event)
    },
    [clickToSelect, singleSelect, table, onClickRow]
  )

  // Handle row double click
  const handleRowDblClick = React.useCallback(
    (row: Row<TData>, event: React.MouseEvent) => {
      onDblClickRow?.(row.original, row.index, event)
    },
    [onDblClickRow]
  )

  // Determine visible column count for detail row colSpan
  const visibleColumnCount = table.getVisibleLeafColumns().length

  // Determine the current sort column for sort class highlighting
  const currentSortColumnId = sorting.length > 0 ? sorting[0].id : null

  // Total rows for display
  const displayTotalRows = isServerSide ? (totalRowsProp ?? 0) : table.getFilteredRowModel().rows.length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Title */}
      {(title || description) && (
        <div className="px-1">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      {/* Top Pagination (if position is 'top' or 'both') */}
      {(paginationVAlign === "top" || paginationVAlign === "both") && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          smartDisplay={smartDisplay}
          paginationVAlign={paginationVAlign}
          paginationVisible={paginationVisible}
          locale={paginationLocale}
          totalRows={isServerSide ? totalRowsProp : undefined}
          serverSide={isServerSide}
        />
      )}

      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        actions={toolbarActions}
        exportConfig={exportConfig ? {
          ...exportConfig,
          allData: exportConfig.allData ?? data,
        } : undefined}
        showRefresh={showRefresh}
        onRefresh={handleRefresh}
        showToggle={showToggle}
        isCardView={isCardView}
        onToggleView={handleToggleView}
        showPaginationSwitch={showPaginationSwitch}
        paginationVisible={paginationVisible}
        onPaginationSwitch={setPaginationVisible}
        isRefreshing={isRefreshing || isLoading}
        searchOnEnterKey={searchOnEnterKey}
        strictSearch={strictSearch}
        onSearch={onSearch}
        locale={toolbarLocale}
      />

      {/* Table Container */}
      <div
        className={cn(
          "rounded-lg border border-border overflow-hidden bg-card",
          fixedHeader && "dt-fixed-header-container"
        )}
        style={fixedHeader && maxHeight ? { maxHeight } : undefined}
      >
        {isCardView ? (
          /* Card View */
          <DataTableCardView
            table={table}
            isLoading={isLoading}
            noMatchesText={mergedLocale.formatNoMatches()}
            loadingText={mergedLocale.formatLoadingMessage()}
            clickToSelect={clickToSelect}
            selectedRowIds={rowSelection}
            onRowClick={onClickRow}
            onRowDblClick={onDblClickRow}
            rowStyle={rowStyle}
          />
        ) : (
          /* Table View */
          <div className={cn("overflow-x-auto", fixedHeader && "overflow-y-auto")} style={fixedHeader && maxHeight ? { maxHeight } : undefined}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn(
                      "bg-gradient-to-r from-navy-700 to-navy-600 hover:from-navy-700 hover:to-navy-600 border-none",
                      fixedHeader && "sticky top-0 z-10"
                    )}
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "text-white font-semibold text-xs uppercase tracking-wider h-9 px-3",
                          currentSortColumnId === header.column.id && "dt-sorted-column-header"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount} className="h-40 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-500 border-t-transparent" />
                        <span>{mergedLocale.formatLoadingMessage()}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const rowStyleResult = rowStyle ? rowStyle(row.original, row.index) : undefined
                    const isRowExpanded = row.getIsExpanded()

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "hover:bg-navy-50 dark:hover:bg-navy-900/20",
                            "data-[state=selected]:bg-navy-50 dark:data-[state=selected]:bg-navy-900/30",
                            "transition-colors",
                            striped && row.index % 2 === 1 && "bg-navy-50/30 dark:bg-navy-900/10",
                            clickToSelect && "cursor-pointer",
                            rowStyleResult?.className
                          )}
                          style={rowStyleResult?.style}
                          onClick={(e) => handleRowClick(row, e)}
                          onDoubleClick={(e) => handleRowDblClick(row, e)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "text-sm px-3 py-2",
                                currentSortColumnId === cell.column.id && "dt-sorted-column-cell"
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Detail View Row */}
                        {detailView && detailFormatter && isRowExpanded && (
                          <DataTableDetailRow
                            isExpanded={isRowExpanded}
                            onToggle={() => row.toggleExpanded()}
                            row={row.original}
                            rowIndex={row.index}
                            detailFormatter={detailFormatter}
                            expandIcon={detailExpandIcon}
                            collapseIcon={detailCollapseIcon}
                            colSpan={visibleColumnCount}
                          />
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumnCount} className="h-32 text-center">
                      <div className="text-muted-foreground">
                        <p className="text-sm">{mergedLocale.formatNoMatches()}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {/* Footer Row */}
              {showFooter && (
                <DataTableFooter
                  table={table}
                  footerFormatters={footerFormatters}
                  showFooter={showFooter}
                />
              )}
            </Table>
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      {(paginationVAlign === "bottom" || paginationVAlign === "both") && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          smartDisplay={smartDisplay}
          paginationVAlign={paginationVAlign}
          paginationVisible={paginationVisible}
          locale={paginationLocale}
          totalRows={isServerSide ? totalRowsProp : undefined}
          serverSide={isServerSide}
        />
      )}
    </div>
  )
}
