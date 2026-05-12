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
import { imsToast } from "@/components/toast/ims-toast"

/* ================================================================
   TYPES
   ================================================================ */

/** Supported export format types — matching the original jQuery plugin's TYPE_NAME map */
export type ExportFormat =
  | "json"
  | "csv"
  | "txt"
  | "sql"
  | "xml"
  | "excel"
  | "xlsx"
  | "pdf"
  | "doc"

/** Human-readable labels matching the original TYPE_NAME map */
const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  json: "JSON",
  xml: "XML",
  csv: "CSV",
  txt: "TXT",
  sql: "SQL",
  excel: "MS-Excel",
  xlsx: "MS-Excel (OpenXML)",
  pdf: "PDF",
  doc: "MS-Word",
}

/** Icon for each format */
const EXPORT_FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  json: FileJson,
  xml: FileCode,
  csv: FileSpreadsheet,
  txt: FileText,
  sql: Database,
  excel: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileDown,
  doc: File,
}

/** Which data to export — matching the original exportDataType option */
export type ExportDataType = "basic" | "all" | "selected"

export interface DataTableExportProps<TData> {
  /** The TanStack Table instance */
  table: Table<TData>
  /** Which formats to show in the dropdown — defaults to ['json', 'csv', 'txt', 'sql', 'excel', 'xlsx', 'pdf'] */
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

/** Extract row data as a plain object using the visible columns */
function extractRowData<TData>(row: TData, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of keys) {
    const value = (row as Record<string, unknown>)[key]
    // Handle React nodes — extract string value
    if (React.isValidElement(value)) {
      result[key] = "[Complex Value]"
    } else if (value === null || value === undefined) {
      result[key] = ""
    } else {
      result[key] = value
    }
  }
  return result
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

/** Trigger browser download */
function downloadFile(content: string | Blob, fileName: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/* ================================================================
   FORMAT EXPORTERS
   ================================================================ */

function exportAsJSON<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string
) {
  const rows = data.map((row) => extractRowData(row, keys))
  const json = JSON.stringify(rows, null, 2)
  downloadFile(json, `${fileName}.json`, "application/json")
}

function exportAsCSV<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string
) {
  const escapeCSV = (val: unknown): string => {
    const str = String(val ?? "")
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = labels.map(escapeCSV).join(",")
  const rows = data.map((row) => {
    const rowData = extractRowData(row, keys)
    return keys.map((key) => escapeCSV(rowData[key])).join(",")
  })

  const csv = [header, ...rows].join("\n")
  // Add BOM for Excel to recognize UTF-8
  const bom = "\uFEFF"
  downloadFile(bom + csv, `${fileName}.csv`, "text/csv;charset=utf-8")
}

function exportAsTXT<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string
) {
  // Tab-separated values
  const header = labels.join("\t")
  const rows = data.map((row) => {
    const rowData = extractRowData(row, keys)
    return keys.map((key) => String(rowData[key] ?? "")).join("\t")
  })

  const txt = [header, ...rows].join("\n")
  downloadFile(txt, `${fileName}.txt`, "text/plain;charset=utf-8")
}

function exportAsSQL<TData>(
  data: TData[],
  keys: string[],
  _labels: string[],
  fileName: string,
  tableName: string
) {
  const escapeSQL = (val: unknown): string => {
    const str = String(val ?? "")
    return `'${str.replace(/'/g, "''")}'`
  }

  const statements = data.map((row) => {
    const rowData = extractRowData(row, keys)
    const columns = keys.join(", ")
    const values = keys.map((key) => escapeSQL(rowData[key])).join(", ")
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
  })

  const sql = [
    `-- Export from IMS ERP System`,
    `-- Table: ${tableName}`,
    `-- Records: ${data.length}`,
    `-- Date: ${new Date().toISOString()}`,
    "",
    ...statements,
  ].join("\n")

  downloadFile(sql, `${fileName}.sql`, "application/sql;charset=utf-8")
}

function exportAsXML<TData>(
  data: TData[],
  keys: string[],
  _labels: string[],
  fileName: string,
  tableName: string
) {
  const escapeXML = (val: unknown): string => {
    const str = String(val ?? "")
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  const items = data.map((row) => {
    const rowData = extractRowData(row, keys)
    const fields = keys.map((key) => `    <${key}>${escapeXML(rowData[key])}</${key}>`).join("\n")
    return `  <row>\n${fields}\n  </row>`
  })

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<${tableName}>`,
    ...items,
    `</${tableName}>`,
  ].join("\n")

  downloadFile(xml, `${fileName}.xml`, "application/xml;charset=utf-8")
}

async function exportAsExcel<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string,
  openXml: boolean = false
) {
  // Dynamic import for xlsx library (large library — code-split)
  const XLSX = await import("xlsx")

  const rows = data.map((row) => {
    const rowData = extractRowData(row, keys)
    const obj: Record<string, unknown> = {}
    labels.forEach((label, i) => {
      obj[label] = rowData[keys[i]]
    })
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths based on content
  const colWidths = keys.map((key, idx) => {
    const maxLen = Math.max(
      labels[idx].length,
      ...data.map((row) => {
        const val = (row as Record<string, unknown>)[key]
        return String(val ?? "").length
      })
    )
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) }
  })
  ws["!cols"] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")

  const ext = openXml ? "xlsx" : "xls"
  const bookType = openXml ? "xlsx" : "biff8"
  XLSX.writeFile(wb, `${fileName}.${ext}`, { bookType })
}

async function exportAsPDF<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string
) {
  // Dynamic import for jsPDF (large library — code-split)
  const { default: jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default

  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.setTextColor(30, 58, 95) // Navy Blue
  doc.text("IMS ERP - Data Export", 14, 20)

  // Subtitle with date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Exported: ${new Date().toLocaleString()} | Records: ${data.length}`, 14, 28)

  // Table data
  const rows = data.map((row) => {
    const rowData = extractRowData(row, keys)
    return keys.map((key) => String(rowData[key] ?? ""))
  })

  autoTable(doc, {
    head: [labels],
    body: rows,
    startY: 34,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 58, 95], // Deep Navy Blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [238, 242, 247], // Navy-50
    },
    margin: { top: 34 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount} | Developed by NextGen Digital Studio`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  doc.save(`${fileName}.pdf`)
}

async function exportAsDoc<TData>(
  data: TData[],
  keys: string[],
  labels: string[],
  fileName: string
) {
  // Generate an HTML table and save as .doc (Word opens HTML files)
  const headerCells = labels.map((l) => `<th style="background:#1e3a5f;color:#fff;padding:8px 12px;font-weight:600;text-align:left;font-size:12px;border:1px solid #a9bbd3">${l}</th>`).join("")
  const dataRows = data.map((row) => {
    const rowData = extractRowData(row, keys)
    const cells = keys.map((key) => `<td style="padding:6px 12px;border:1px solid #d4dde9;font-size:11px">${String(rowData[key] ?? "")}</td>`).join("")
    return `<tr>${cells}</tr>`
  }).join("")

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; }
        h2 { color: #1e3a5f; margin-bottom: 4px; }
        p { color: #666; font-size: 11px; margin-top: 0; }
        table { border-collapse: collapse; width: 100%; }
        tr:nth-child(even) td { background-color: #eef2f7; }
      </style>
    </head>
    <body>
      <h2>IMS ERP - Data Export</h2>
      <p>Exported: ${new Date().toLocaleString()} | Records: ${data.length}</p>
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${dataRows}</tbody>
      </table>
    </body>
    </html>
  `

  downloadFile(html, `${fileName}.doc`, "application/msword")
}

/* ================================================================
   MAIN EXPORT FUNCTION
   ================================================================ */

async function performExport<TData>(
  format: ExportFormat,
  table: Table<TData>,
  exportDataType: ExportDataType,
  allData: TData[] | undefined,
  columnLabels: Record<string, string> | undefined,
  fileName: string,
  tableName: string
) {
  const data = getExportData(table, exportDataType, allData)
  const { keys, labels } = getColumnMeta(table, columnLabels)

  if (data.length === 0) {
    imsToast.warning("No data to export", {
      description: "There are no records to export in the current selection.",
    })
    return
  }

  try {
    switch (format) {
      case "json":
        exportAsJSON(data, keys, labels, fileName)
        break
      case "csv":
        exportAsCSV(data, keys, labels, fileName)
        break
      case "txt":
        exportAsTXT(data, keys, labels, fileName)
        break
      case "sql":
        exportAsSQL(data, keys, labels, fileName, tableName)
        break
      case "xml":
        exportAsXML(data, keys, labels, fileName, tableName)
        break
      case "excel":
        await exportAsExcel(data, keys, labels, fileName, false)
        break
      case "xlsx":
        await exportAsExcel(data, keys, labels, fileName, true)
        break
      case "pdf":
        await exportAsPDF(data, keys, labels, fileName)
        break
      case "doc":
        await exportAsDoc(data, keys, labels, fileName)
        break
    }

    imsToast.success(`Exported as ${EXPORT_FORMAT_LABELS[format]}`, {
      description: `${data.length} record${data.length !== 1 ? "s" : ""} exported to ${fileName}.${format === "excel" ? "xls" : format === "xlsx" ? "xlsx" : format}`,
    })
  } catch (error) {
    console.error("Export error:", error)
    imsToast.error("Export failed", {
      description: `Failed to export data as ${EXPORT_FORMAT_LABELS[format]}. Please try again.`,
    })
  }
}

/* ================================================================
   COMPONENT
   ================================================================ */

export function DataTableExport<TData>({
  table,
  exportTypes = ["json", "csv", "txt", "sql", "excel", "xlsx", "pdf"],
  exportDataType = "basic",
  allData,
  columnLabels,
  fileName = "export",
  tableName = "data_table",
  showExport = true,
  className,
}: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = React.useState(false)

  if (!showExport) return null

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = allData?.length ?? table.getFilteredRowModel().rows.length

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    try {
      await performExport(
        format,
        table,
        exportDataType,
        allData,
        columnLabels,
        fileName,
        tableName
      )
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className ?? "h-9 gap-1.5 text-xs border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30"}
          disabled={isExporting}
        >
          <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-pulse" : ""}`} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs flex items-center justify-between">
          <span>Export Data</span>
          <span className="text-muted-foreground font-normal text-[10px]">
            {getDataTypeLabel()}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {exportTypes.map((format) => {
          const Icon = EXPORT_FORMAT_ICONS[format]
          const label = EXPORT_FORMAT_LABELS[format]
          if (!label) return null

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
                {format === "excel" ? "xls" : format}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
