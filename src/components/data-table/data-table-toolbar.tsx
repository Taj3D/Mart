"use client"

import { Table } from "@tanstack/react-table"
import {
  Search,
  SlidersHorizontal,
  Columns3,
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

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  actions?: React.ReactNode
  /** Export configuration — pass object to enable export, or omit/undefined to hide */
  exportConfig?: {
    /** Which formats to show — defaults to ['json', 'csv', 'txt', 'sql', 'excel', 'xlsx', 'pdf'] */
    exportTypes?: ExportFormat[]
    /** Which data to export: 'basic' | 'all' | 'selected' */
    exportDataType?: ExportDataType
    /** Full dataset (for 'all' export when paginated) */
    allData?: TData[]
    /** Column header labels for export files */
    columnLabels?: Record<string, string>
    /** File name prefix — defaults to "export" */
    fileName?: string
    /** SQL table name for SQL export — defaults to "data_table" */
    tableName?: string
  }
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  actions,
  exportConfig,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
      {/* Left side: Search */}
      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        {searchKey && (
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
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
            Reset
            <SlidersHorizontal className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Right side: Export, Actions & Column Visibility */}
      <div className="flex items-center gap-2">
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
              Columns
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
