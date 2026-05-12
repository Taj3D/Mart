"use client"

import { Table } from "@tanstack/react-table"
import {
  Search,
  SlidersHorizontal,
  Columns3,
  RefreshCw,
  LayoutGrid,
  Table2,
  PanelTopClose,
  PanelTopOpen,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTableExport,
  type ExportFormat,
  type ExportDataType,
} from "./data-table-export"
import { cn } from "@/lib/utils"

/** Locale interface for toolbar text */
export interface DataTableToolbarLocale {
  formatSearch?: () => string
  formatRefresh?: () => string
  formatToggle?: () => string
  formatColumns?: () => string
  formatPaginationSwitch?: () => string
  resetFiltersLabel?: string
}

const defaultToolbarLocale: Required<DataTableToolbarLocale> = {
  formatSearch: () => "Search...",
  formatRefresh: () => "Refresh",
  formatToggle: () => "Toggle View",
  formatColumns: () => "Columns",
  formatPaginationSwitch: () => "Pagination",
  resetFiltersLabel: "Reset",
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  actions?: React.ReactNode
  /** Export configuration — pass object to enable export, or omit/undefined to hide */
  exportConfig?: {
    exportTypes?: ExportFormat[]
    exportDataType?: ExportDataType
    allData?: TData[]
    columnLabels?: Record<string, string>
    fileName?: string
    tableName?: string
  }
  /** Show refresh button */
  showRefresh?: boolean
  /** Refresh callback */
  onRefresh?: () => void
  /** Show toggle view button (card/table) */
  showToggle?: boolean
  /** Current card view state */
  isCardView?: boolean
  /** Toggle view callback */
  onToggleView?: (isCardView: boolean) => void
  /** Show pagination switch button */
  showPaginationSwitch?: boolean
  /** Current pagination visibility state */
  paginationVisible?: boolean
  /** Pagination visibility toggle callback */
  onPaginationSwitch?: (visible: boolean) => void
  /** Whether refresh is in progress */
  isRefreshing?: boolean
  /** Search on Enter key only */
  searchOnEnterKey?: boolean
  /** Strict search mode */
  strictSearch?: boolean
  /** Search callback */
  onSearch?: (searchText: string) => void
  /** Locale overrides */
  locale?: DataTableToolbarLocale
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  actions,
  exportConfig,
  showRefresh = false,
  onRefresh,
  showToggle = false,
  isCardView = false,
  onToggleView,
  showPaginationSwitch = false,
  paginationVisible = true,
  onPaginationSwitch,
  isRefreshing = false,
  searchOnEnterKey = false,
  strictSearch = false,
  onSearch,
  locale,
}: DataTableToolbarProps<TData>) {
  const mergedLocale = { ...defaultToolbarLocale, ...locale }
  const isFiltered = table.getState().columnFilters.length > 0

  const searchPlaceholderText = searchPlaceholder ?? mergedLocale.formatSearch()

  const handleSearchChange = (value: string) => {
    if (searchKey) {
      if (strictSearch) {
        // In strict mode, exact match filtering
        table.getColumn(searchKey)?.setFilterValue(value.length > 0 ? value : undefined)
      } else {
        table.getColumn(searchKey)?.setFilterValue(value)
      }
    }
    onSearch?.(value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchOnEnterKey && e.key === "Enter") {
      const value = (e.target as HTMLInputElement).value
      handleSearchChange(value)
    }
  }

  const getSearchValue = () => {
    if (!searchKey) return ""
    return (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
  }

  return (
    <div className="ims-table-toolbar flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
      {/* Left side: Search */}
      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        {searchKey && (
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholderText}
              value={getSearchValue()}
              onChange={
                searchOnEnterKey
                  ? undefined
                  : (event) => handleSearchChange(event.target.value)
              }
              onKeyDown={searchOnEnterKey ? handleSearchKeyDown : undefined}
              onBlur={
                searchOnEnterKey
                  ? (e) => handleSearchChange(e.target.value)
                  : undefined
              }
              className="pl-9 h-9 text-sm"
            />
          </div>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3 text-xs"
          >
            {mergedLocale.resetFiltersLabel}
            <SlidersHorizontal className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Right side: Toolbar buttons, Export, Actions & Column Visibility */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Refresh button */}
        {showRefresh && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-1.5 text-xs",
              "border-navy-200 dark:border-navy-700",
              "text-navy-700 dark:text-navy-300",
              "hover:bg-navy-50 dark:hover:bg-navy-900/30"
            )}
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={mergedLocale.formatRefresh()}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{mergedLocale.formatRefresh()}</span>
          </Button>
        )}

        {/* Toggle view button (card/table) */}
        {showToggle && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-1.5 text-xs",
              "border-navy-200 dark:border-navy-700",
              "text-navy-700 dark:text-navy-300",
              "hover:bg-navy-50 dark:hover:bg-navy-900/30"
            )}
            onClick={() => onToggleView?.(!isCardView)}
            aria-label={mergedLocale.formatToggle()}
          >
            {isCardView ? (
              <Table2 className="h-3.5 w-3.5" />
            ) : (
              <LayoutGrid className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{mergedLocale.formatToggle()}</span>
          </Button>
        )}

        {/* Pagination switch button */}
        {showPaginationSwitch && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-1.5 text-xs",
              paginationVisible
                ? "border-navy-300 dark:border-navy-600 bg-navy-50 dark:bg-navy-900/30 text-navy-700 dark:text-navy-300"
                : "border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300",
              "hover:bg-navy-50 dark:hover:bg-navy-900/30"
            )}
            onClick={() => onPaginationSwitch?.(!paginationVisible)}
            aria-label={mergedLocale.formatPaginationSwitch()}
          >
            {paginationVisible ? (
              <PanelTopClose className="h-3.5 w-3.5" />
            ) : (
              <PanelTopOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{mergedLocale.formatPaginationSwitch()}</span>
          </Button>
        )}

        {actions}
        {exportConfig && (
          <DataTableExport
            table={table}
            exportTypes={exportConfig.exportTypes}
            exportDataType={exportConfig.exportDataType}
            allData={exportConfig.allData}
            columnLabels={exportConfig.columnLabels}
            fileName={exportConfig.fileName}
            tableName={exportConfig.tableName}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs"
            >
              <Columns3 className="h-3.5 w-3.5" />
              {mergedLocale.formatColumns()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/([A-Z])/g, " $1").trim()}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
