"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileDown,
  Database,
  FileCode,
  File,
  Image,
  FileType,
  Table2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ExportFormat as LibExportFormat,
  ExportDataSet,
  TableExportOptions,
  tableExport,
  createExportDataSet,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMAT_EXTENSIONS,
} from "@/lib/table-export"
import { imsToast } from "@/components/toast/ims-toast"

/* ================================================================
   TYPES
   ================================================================ */

/** Supported export format types — extended from the library */
export type ExportFormat = LibExportFormat

/** Human-readable labels (re-exported from library) */
const FORMAT_LABELS: Record<ExportFormat, string> = {
  ...EXPORT_FORMAT_LABELS,
  // Shorter labels for the dropdown
  csv: "CSV",
  tsv: "TSV",
  txt: "TXT",
  sql: "SQL",
  json: "JSON",
  xml: "XML",
  excel: "MS-Excel",
  xlsx: "MS-Excel (XLSX)",
  pdf: "PDF",
  png: "PNG Image",
  doc: "MS-Word",
}

/** Icon for each format */
const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  json: FileJson,
  xml: FileCode,
  csv: FileSpreadsheet,
  tsv: Table2,
  txt: FileText,
  sql: Database,
  excel: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileDown,
  png: Image,
  doc: FileType,
}

/** Which data to export — matching the original exportDataType option */
export type ExportDataType = "basic" | "all" | "selected"

/** Number formatting for export */
export interface ExportNumberFormat {
  /** Decimal mark used in source data */
  decimalMark?: string
  /** Thousands separator used in source data */
  thousandsSeparator?: string
  /** Output number formatting — false to disable */
  output?: {
    decimalMark?: string
    thousandsSeparator?: string
  } | false
}

/** Advanced export configuration options */
export interface AdvancedExportOptions {
  /** CSV field enclosure character */
  csvEnclosure?: string
  /** CSV field separator character */
  csvSeparator?: string
  /** Add BOM to CSV for Excel UTF-8 recognition */
  csvUseBOM?: boolean
  /** Excel file format: 'xlshtml' for Excel 2000 HTML, 'xmlss' for XML Spreadsheet 2003 */
  excelFileFormat?: "xlshtml" | "xmlss"
  /** Display table name in Excel/Word export */
  displayTableName?: boolean
  /** Export HTML content instead of text */
  htmlContent?: boolean
  /** Escape special characters in output */
  escape?: boolean
  /** Column indices or field names to exclude from export */
  ignoreColumn?: (string | number)[]
  /** Row indices to exclude from export */
  ignoreRow?: number[]
  /** JSON export scope: 'head' = header only, 'data' = rows only, 'all' = both */
  jsonScope?: "head" | "data" | "all"
  /** Number formatting configuration */
  numbers?: ExportNumberFormat
  /** PDF orientation */
  pdfOrientation?: "p" | "l"
  /** PDF page format */
  pdfFormat?: string
  /** PDF margins */
  pdfMargins?: { left: number; right: number; top: number; bottom: number }
  /** SQL table name */
  tableName?: string
  /** Worksheet name for Excel */
  worksheetName?: string
  /** Output mode */
  outputMode?: "file" | "string" | "base64" | "window"
  /** Custom cell data callback */
  onCellData?: (value: unknown, rowIndex: number, colIndex: number, result: string) => string
  /** Log to console */
  consoleLog?: boolean
}

export interface DataTableExportProps<TData> {
  /** The TanStack Table instance */
  table: Table<TData>
  /** Which formats to show in the dropdown — defaults to all */
  exportTypes?: ExportFormat[]
  /** Which data to export: 'basic' = current page, 'all' = all rows, 'selected' = selected rows only */
  exportDataType?: ExportDataType
  /** The full dataset (needed when exportDataType='all' and pagination is active) */
  allData?: TData[]
  /** Column header labels for export. If not provided, uses column.id */
  columnLabels?: Record<string, string>
  /** File name prefix (without extension) — defaults to "export" */
  fileName?: string
  /** SQL table name for SQL export — defaults to "data_table" */
  tableName?: string
  /** Whether to show the export button — defaults to true */
  showExport?: boolean
  /** Custom class name for the trigger button */
  className?: string
  /** Advanced export options from the tableExport library */
  advancedOptions?: AdvancedExportOptions
  /** Optional table element reference for PNG capture */
  tableRef?: React.RefObject<HTMLElement | null>
}

/* ================================================================
   EXPORT HELPERS
   ================================================================ */

/** Get visible column IDs and their labels */
function getColumnMeta<TData>(
  table: Table<TData>,
  columnLabels?: Record<string, string>
): { keys: string[]; labels: string[] } {
  const visibleCols = table
    .getAllColumns()
    .filter((col) => col.getIsVisible() && col.accessorFn)
    .map((col) => col.id)

  const keys = visibleCols
  const labels = visibleCols.map(
    (key) =>
      columnLabels?.[key] ||
      key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  )

  return { keys, labels }
}

/** Get the data rows to export based on exportDataType */
function getExportData<TData>(
  table: Table<TData>,
  exportDataType: ExportDataType,
  allData?: TData[]
): TData[] {
  switch (exportDataType) {
    case "selected": {
      const selectedRows = table.getFilteredSelectedRowModel().rows
      if (selectedRows.length > 0) {
        return selectedRows.map((row) => row.original)
      }
      // Fallback to current page if nothing selected
      return table.getRowModel().rows.map((row) => row.original)
    }
    case "all":
      return allData ?? table.getFilteredRowModel().rows.map((row) => row.original)
    case "basic":
    default:
      return table.getRowModel().rows.map((row) => row.original)
  }
}

/* ================================================================
   COMPONENT
   ================================================================ */

export function DataTableExport<TData>({
  table,
  exportTypes = ["csv", "tsv", "txt", "sql", "json", "xml", "excel", "xlsx", "pdf", "doc"],
  exportDataType = "basic",
  allData,
  columnLabels,
  fileName = "export",
  tableName = "data_table",
  showExport = true,
  className,
  advancedOptions,
  tableRef,
}: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = React.useState(false)

  if (!showExport) return null

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = allData?.length ?? table.getFilteredRowModel().rows.length

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    try {
      const data = getExportData(table, exportDataType, allData)
      const { keys, labels } = getColumnMeta(table, columnLabels)

      if (data.length === 0) {
        imsToast.warning("No data to export", {
          description: "There are no records to export in the current selection.",
        })
        return
      }

      // Create the export data set
      const dataSet = createExportDataSet(labels, keys, data)

      // Build export options
      const exportOptions: Partial<TableExportOptions> = {
        type: format,
        fileName,
        tableName: advancedOptions?.tableName || tableName,
        consoleLog: advancedOptions?.consoleLog ?? false,
        outputMode: advancedOptions?.outputMode ?? "file",
        csvEnclosure: advancedOptions?.csvEnclosure ?? '"',
        csvSeparator: advancedOptions?.csvSeparator ?? ",",
        csvUseBOM: advancedOptions?.csvUseBOM ?? true,
        excelFileFormat: advancedOptions?.excelFileFormat ?? "xlshtml",
        displayTableName: advancedOptions?.displayTableName ?? false,
        htmlContent: advancedOptions?.htmlContent ?? false,
        escape: advancedOptions?.escape ?? false,
        ignoreColumn: advancedOptions?.ignoreColumn ?? [],
        ignoreRow: advancedOptions?.ignoreRow ?? [],
        jsonScope: advancedOptions?.jsonScope ?? "all",
        worksheetName: advancedOptions?.worksheetName ?? "Worksheet",
        onCellData: advancedOptions?.onCellData ?? null,
      }

      // Number formatting
      if (advancedOptions?.numbers) {
        exportOptions.numbers = {
          html: {
            decimalMark: advancedOptions.numbers.decimalMark ?? ".",
            thousandsSeparator: advancedOptions.numbers.thousandsSeparator ?? ",",
          },
          output:
            advancedOptions.numbers.output === false
              ? false
              : {
                  decimalMark: advancedOptions.numbers.output?.decimalMark ?? ".",
                  thousandsSeparator: advancedOptions.numbers.output?.thousandsSeparator ?? ",",
                },
        }
      }

      // PDF configuration
      if (advancedOptions?.pdfOrientation || advancedOptions?.pdfFormat || advancedOptions?.pdfMargins) {
        exportOptions.jspdf = {
          orientation: advancedOptions.pdfOrientation ?? "p",
          unit: "pt",
          format: advancedOptions.pdfFormat ?? "a4",
          margins: advancedOptions.pdfMargins ?? { left: 20, right: 10, top: 10, bottom: 10 },
          onDocCreated: null,
          autotable: {
            styles: {
              cellPadding: 2,
              rowHeight: 12,
              fontSize: 8,
              fillColor: 255,
              textColor: 50,
              fontStyle: "normal",
              overflow: "ellipsize",
              halign: "left",
              valign: "middle",
            },
            headerStyles: {
              fillColor: [30, 58, 95], // Deep Navy Blue
              textColor: 255,
              fontStyle: "bold",
              halign: "center",
            },
            alternateRowStyles: {
              fillColor: 245,
            },
            tableExport: {
              doc: null,
              onAfterAutotable: null,
              onBeforeAutotable: null,
              onAutotableText: null,
              onTable: null,
              outputImages: true,
            },
          },
          autotableEnabled: true,
        }
      }

      // Perform the export
      const result = await tableExport(dataSet, exportOptions, tableRef?.current)

      // Show success toast
      const ext = EXPORT_FORMAT_EXTENSIONS[format]
      const label = FORMAT_LABELS[format]
      imsToast.success(`Exported as ${label}`, {
        description: `${data.length} record${data.length !== 1 ? "s" : ""} exported to ${fileName}.${ext}`,
      })

      // Return result if outputMode is string/base64
      return result
    } catch (error) {
      console.error("Export error:", error)
      imsToast.error("Export failed", {
        description: `Failed to export data as ${FORMAT_LABELS[format]}. Please try again.`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Determine label for export data type
  const getDataTypeLabel = () => {
    switch (exportDataType) {
      case "all":
        return `All ${totalCount} records`
      case "selected":
        return selectedCount > 0 ? `${selectedCount} selected` : `Current page`
      case "basic":
      default:
        return "Current page"
    }
  }

  // Group formats into categories for the dropdown
  const spreadsheetFormats: ExportFormat[] = ["csv", "tsv", "txt", "xlsx", "excel"]
  const documentFormats: ExportFormat[] = ["pdf", "doc", "png"]
  const dataFormats: ExportFormat[] = ["json", "xml", "sql"]

  const filteredExportTypes = exportTypes.filter((f) => FORMAT_LABELS[f])
  const hasSpreadsheet = filteredExportTypes.some((f) => spreadsheetFormats.includes(f))
  const hasDocument = filteredExportTypes.some((f) => documentFormats.includes(f))
  const hasData = filteredExportTypes.some((f) => dataFormats.includes(f))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={
            className ??
            "h-9 gap-1.5 text-xs border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30"
          }
          disabled={isExporting}
        >
          <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-pulse" : ""}`} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs flex items-center justify-between">
          <span>Export Data</span>
          <span className="text-muted-foreground font-normal text-[10px]">
            {getDataTypeLabel()}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Spreadsheet Formats */}
        {hasSpreadsheet && (
          <>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider py-1.5">
              Spreadsheet
            </DropdownMenuLabel>
            {filteredExportTypes
              .filter((f) => spreadsheetFormats.includes(f))
              .map((format) => {
                const Icon = FORMAT_ICONS[format]
                const label = FORMAT_LABELS[format]
                return (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => handleExport(format)}
                    className="cursor-pointer text-xs gap-2.5 py-2 focus:bg-navy-50 dark:focus:bg-navy-900/30 focus:text-navy-700 dark:focus:text-navy-300"
                    disabled={isExporting}
                  >
                    <Icon className="h-4 w-4 text-navy-500 dark:text-navy-400 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {EXPORT_FORMAT_EXTENSIONS[format]}
                    </span>
                  </DropdownMenuItem>
                )
              })}
          </>
        )}

        {/* Document Formats */}
        {hasDocument && (
          <>
            {hasSpreadsheet && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider py-1.5">
              Document
            </DropdownMenuLabel>
            {filteredExportTypes
              .filter((f) => documentFormats.includes(f))
              .map((format) => {
                const Icon = FORMAT_ICONS[format]
                const label = FORMAT_LABELS[format]
                return (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => handleExport(format)}
                    className="cursor-pointer text-xs gap-2.5 py-2 focus:bg-navy-50 dark:focus:bg-navy-900/30 focus:text-navy-700 dark:focus:text-navy-300"
                    disabled={isExporting}
                  >
                    <Icon className="h-4 w-4 text-navy-500 dark:text-navy-400 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {EXPORT_FORMAT_EXTENSIONS[format]}
                    </span>
                  </DropdownMenuItem>
                )
              })}
          </>
        )}

        {/* Data Formats */}
        {hasData && (
          <>
            {(hasSpreadsheet || hasDocument) && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider py-1.5">
              Data Exchange
            </DropdownMenuLabel>
            {filteredExportTypes
              .filter((f) => dataFormats.includes(f))
              .map((format) => {
                const Icon = FORMAT_ICONS[format]
                const label = FORMAT_LABELS[format]
                return (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => handleExport(format)}
                    className="cursor-pointer text-xs gap-2.5 py-2 focus:bg-navy-50 dark:focus:bg-navy-900/30 focus:text-navy-700 dark:focus:text-navy-300"
                    disabled={isExporting}
                  >
                    <Icon className="h-4 w-4 text-navy-500 dark:text-navy-400 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {EXPORT_FORMAT_EXTENSIONS[format]}
                    </span>
                  </DropdownMenuItem>
                )
              })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
