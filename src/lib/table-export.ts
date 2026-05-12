/**
 * IMS Table Export Utility Library
 *
 * Converted from tableExport.jquery.plugin v1.10.x
 * Original Copyright (c) 2015-2017 hhurz, https://github.com/hhurz
 * Original Work Copyright (c) 2014 Giri Raj
 * Licensed under the MIT License
 *
 * Provides comprehensive table data export to multiple formats:
 * CSV, TSV, TXT, SQL, JSON, XML, Excel (XMLSS/HTML), XLSX, PDF, PNG, DOC
 *
 * Features:
 * - Configurable number formatting (decimal mark, thousands separator)
 * - Custom cell data/html callbacks
 * - Ignore columns/rows
 * - Rowspan/colspan handling
 * - Multiple output modes (file, string, base64, window)
 * - PDF with jsPDF AutoTable (full configuration) or pdfmake
 * - PDF bestfit paper format selection
 * - PNG via html2canvas
 * - Excel styles transfer, mso-number-format
 * - BOM support for CSV
 * - JSON scope (head/data/all)
 * - SQL INSERT statements
 * - XML Spreadsheet 2003 format
 * - Word/Excel HTML format with Office namespaces
 */

/* ================================================================
   TYPE DEFINITIONS
   ================================================================ */

/** Supported export format types */
export type ExportFormat =
  | "csv"
  | "tsv"
  | "txt"
  | "sql"
  | "json"
  | "xml"
  | "excel"
  | "xlsx"
  | "pdf"
  | "png"
  | "doc"

/** Human-readable labels for each format */
export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV (Comma Separated)",
  tsv: "TSV (Tab Separated)",
  txt: "TXT (Plain Text)",
  sql: "SQL (Insert Statements)",
  json: "JSON",
  xml: "XML",
  excel: "MS-Excel (HTML)",
  xlsx: "MS-Excel (OpenXML)",
  pdf: "PDF",
  png: "PNG (Image)",
  doc: "MS-Word (HTML)",
}

/** File extensions for each format */
export const EXPORT_FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  tsv: "tsv",
  txt: "txt",
  sql: "sql",
  json: "json",
  xml: "xml",
  excel: "xls",
  xlsx: "xlsx",
  pdf: "pdf",
  png: "png",
  doc: "doc",
}

/** MIME types for each format */
export const EXPORT_MIME_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  tsv: "text/tab-separated-values;charset=utf-8",
  txt: "text/plain;charset=utf-8",
  sql: "application/sql;charset=utf-8",
  json: "application/json;charset=utf-8",
  xml: "application/xml;charset=utf-8",
  excel: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  pdf: "application/pdf",
  png: "image/png",
  doc: "application/msword",
}

/** Number formatting configuration */
export interface NumberFormatConfig {
  /** Decimal mark used in the source HTML data */
  decimalMark: string
  /** Thousands separator used in the source HTML data */
  thousandsSeparator: string
}

/** Number output formatting — set to false to disable number formatting in output */
export interface NumberOutputConfig {
  /** Decimal mark for the exported output */
  decimalMark: string
  /** Thousands separator for the exported output */
  thousandsSeparator: string
}

/** jsPDF AutoTable styles */
export interface AutoTableStyles {
  cellPadding?: number
  rowHeight?: number
  fontSize?: number
  fillColor?: number | number[] | "inherit"
  textColor?: number | number[] | "inherit"
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic" | "inherit"
  overflow?: "visible" | "hidden" | "ellipsize" | "linebreak"
  halign?: "left" | "center" | "right"
  valign?: "top" | "middle" | "bottom"
}

/** jsPDF AutoTable header styles */
export interface AutoTableHeaderStyles extends Omit<AutoTableStyles, "valign"> {
  fillColor?: number | number[]
  textColor?: number | number[]
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic"
  halign?: "left" | "center" | "right"
}

/** jsPDF AutoTable alternate row styles */
export interface AutoTableAlternateRowStyles {
  fillColor?: number | number[]
}

/** jsPDF configuration */
export interface JsPdfConfig {
  /** Page orientation: 'p' (portrait) or 'l' (landscape) */
  orientation: "p" | "l"
  /** Measurement unit */
  unit: "pt" | "mm" | "cm" | "in"
  /** Page format: 'a0'-'a4', 'letter', 'legal', or 'bestfit' for auto selection */
  format: string
  /** Page margins */
  margins: { left: number; right: number; top: number; bottom: number }
  /** Callback after doc is created */
  onDocCreated?: ((doc: unknown) => void) | null
  /** AutoTable configuration */
  autotable: {
    styles?: AutoTableStyles
    headerStyles?: AutoTableHeaderStyles
    alternateRowStyles?: AutoTableAlternateRowStyles
    tableExport?: {
      doc?: unknown
      onAfterAutotable?: ((doc: unknown, options: unknown) => void) | null
      onBeforeAutotable?: ((doc: unknown, columns: unknown[], rows: unknown[], options: unknown) => void) | null
      onAutotableText?: ((doc: unknown, cell: unknown, texttags: unknown) => void) | null
      onTable?: ((table: unknown, options: unknown) => boolean) | null
      outputImages?: boolean
    }
  }
  /** Whether to use autotable — false = use jsPDF core html support */
  autotableEnabled: boolean
}

/** pdfmake configuration */
export interface PdfMakeConfig {
  /** Enable pdfmake as PDF engine (experimental) */
  enabled: boolean
  docDefinition: {
    pageOrientation: "portrait" | "landscape"
    defaultStyle: {
      font: string
    }
  }
  fonts?: Record<string, unknown>
}

/** Complete export options — matching the original jQuery plugin defaults */
export interface TableExportOptions {
  /** Log export data to console */
  consoleLog: boolean
  /** CSV field enclosure character */
  csvEnclosure: string
  /** CSV field separator character */
  csvSeparator: string
  /** Add BOM to CSV for Excel UTF-8 recognition */
  csvUseBOM: boolean
  /** Display table name in export */
  displayTableName: boolean
  /** Escape special characters in output */
  escape: boolean
  /** Excel file format: 'xlshtml' for Excel 2000 HTML, 'xmlss' for XML Spreadsheet 2003 */
  excelFileFormat: "xlshtml" | "xmlss"
  /** CSS styles to include in Excel export (e.g. ['border-bottom', 'font-weight']) */
  excelstyles: string[]
  /** Default file name (without extension) */
  fileName: string
  /** Export HTML content instead of text */
  htmlContent: boolean
  /** Column indices or field names to exclude from export */
  ignoreColumn: (string | number)[]
  /** Row indices to exclude from export */
  ignoreRow: number[]
  /** JSON export scope: 'head' = header only, 'data' = rows only, 'all' = both */
  jsonScope: "head" | "data" | "all"
  /** jsPDF configuration */
  jspdf: JsPdfConfig
  /** Number formatting configuration */
  numbers: {
    html: NumberFormatConfig
    output: NumberOutputConfig | false
  }
  /** Custom cell data callback */
  onCellData?: ((value: unknown, rowIndex: number, colIndex: number, result: string) => string) | null
  /** Custom cell HTML data callback */
  onCellHtmlData?: ((cell: unknown, rowIndex: number, colIndex: number, htmlData: string) => string) | null
  /** mso-number-format for Excel HTML cells */
  onMsoNumberFormat?: ((cell: unknown, rowIndex: number, colIndex: number) => string | undefined) | null
  /** Output mode: 'file' = download, 'string' = return string, 'base64' = return base64, 'window' = open in new window */
  outputMode: "file" | "string" | "base64" | "window"
  /** pdfmake configuration (alternative PDF engine) */
  pdfmake: PdfMakeConfig
  /** SQL table name for INSERT statements */
  tableName: string
  /** Export format type */
  type: ExportFormat
  /** Worksheet name for Excel export */
  worksheetName: string
}

/** Default export options — matching the original jQuery plugin defaults */
export const DEFAULT_EXPORT_OPTIONS: TableExportOptions = {
  consoleLog: false,
  csvEnclosure: '"',
  csvSeparator: ",",
  csvUseBOM: true,
  displayTableName: false,
  escape: false,
  excelFileFormat: "xlshtml",
  excelstyles: [],
  fileName: "tableExport",
  htmlContent: false,
  ignoreColumn: [],
  ignoreRow: [],
  jsonScope: "all",
  jspdf: {
    orientation: "p",
    unit: "pt",
    format: "a4",
    margins: { left: 20, right: 10, top: 10, bottom: 10 },
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
        fillColor: [30, 58, 95], // Deep Navy Blue (was [52, 73, 94])
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
  },
  numbers: {
    html: {
      decimalMark: ".",
      thousandsSeparator: ",",
    },
    output: {
      decimalMark: ".",
      thousandsSeparator: ",",
    },
  },
  onCellData: null,
  onCellHtmlData: null,
  onMsoNumberFormat: null,
  outputMode: "file",
  pdfmake: {
    enabled: false,
    docDefinition: {
      pageOrientation: "portrait",
      defaultStyle: {
        font: "Roboto",
      },
    },
    fonts: {},
  },
  tableName: "myTableName",
  type: "csv",
  worksheetName: "Worksheet",
}

/** Data structure for export — replaces DOM table traversal */
export interface ExportDataSet {
  /** Column header labels */
  headers: string[]
  /** Column keys (field names) */
  columnKeys: string[]
  /** Row data as arrays of cell values */
  rows: (string | number | boolean | null | undefined)[][]
  /** Cell spans (optional, for rowspan/colspan) */
  cellSpans?: { row: number; col: number; rowspan: number; colspan: number }[]
}

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */

/** Escape a string for use in RegExp */
function escapeRegExp(string: string): string {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}

/** Replace all occurrences of a substring */
function replaceAll(string: string, find: string, replace: string): string {
  return string.replace(new RegExp(escapeRegExp(find), "g"), replace)
}

/** Parse a number from a string using source HTML formatting */
function parseNumber(
  value: string,
  numbers: { html: NumberFormatConfig }
): number | false {
  if (!value) return false
  let v = replaceAll(value, numbers.html.thousandsSeparator, "")
  v = replaceAll(v, numbers.html.decimalMark, ".")
  const num = Number(v)
  return isNaN(num) ? false : num
}

/** Parse a percentage value */
function parsePercent(
  value: string,
  numbers: { html: NumberFormatConfig }
): number | false {
  if (value.indexOf("%") > -1) {
    const num = parseNumber(value.replace(/%/g, ""), numbers)
    if (num !== false) return num / 100
  }
  return false
}

/** Format a number for output using configured separators */
function formatNumber(
  value: number,
  output: NumberOutputConfig
): string {
  const isNegative = value < 0
  const abs = Math.abs(value)
  const parts = abs.toString().split(".")
  const intPart = parts[0]
  const decPart = parts[1] || ""

  // Add thousands separator
  const mod = intPart.length > 3 ? intPart.length % 3 : 0
  let formatted = ""
  if (output.thousandsSeparator) {
    formatted =
      (mod ? intPart.substring(0, mod) + output.thousandsSeparator : "") +
      intPart.substring(mod).replace(/(\d{3})(?=\d)/g, "$1" + output.thousandsSeparator)
  } else {
    formatted = intPart
  }

  if (decPart) {
    formatted += output.decimalMark + decPart
  }

  return isNegative ? "-" + formatted : formatted
}

/** Encode a string to UTF-8 */
function utf8Encode(string: string): string {
  string = string.replace(/\r\n/g, "\n")
  let utftext = ""
  for (let n = 0; n < string.length; n++) {
    const c = string.charCodeAt(n)
    if (c < 128) {
      utftext += String.fromCharCode(c)
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192)
      utftext += String.fromCharCode((c & 63) | 128)
    } else {
      utftext += String.fromCharCode((c >> 12) | 224)
      utftext += String.fromCharCode(((c >> 6) & 63) | 128)
      utftext += String.fromCharCode((c & 63) | 128)
    }
  }
  return utftext
}

/** Base64 encode a string */
function base64encode(input: string): string {
  const keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  let output = ""
  let i = 0
  const encoded = utf8Encode(input)
  while (i < encoded.length) {
    const chr1 = encoded.charCodeAt(i++)
    const chr2 = encoded.charCodeAt(i++)
    const chr3 = encoded.charCodeAt(i++)
    const enc1 = chr1 >> 2
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    let enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = 64
      enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output +=
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4)
  }
  return output
}

/** Check if a column should be ignored */
function isColumnIgnored(
  colIndex: number,
  columnKeys: string[],
  ignoreColumn: (string | number)[]
): boolean {
  if (ignoreColumn.length === 0) return false
  return (
    ignoreColumn.includes(colIndex) ||
    (columnKeys[colIndex] !== undefined && ignoreColumn.includes(columnKeys[colIndex]))
  )
}

/** Check if a row should be ignored */
function isRowIgnored(
  rowIndex: number,
  ignoreRow: number[]
): boolean {
  return ignoreRow.includes(rowIndex)
}

/** Convert a cell value to a string for export */
function cellToString(
  value: unknown,
  rowIndex: number,
  colIndex: number,
  options: TableExportOptions
): string {
  if (value === null || value === undefined) return ""

  let result = ""

  if (typeof value === "string") {
    result = value
  } else if (value instanceof Date) {
    result = value.toLocaleString()
  } else if (typeof value === "number" || typeof value === "boolean") {
    result = String(value)
  } else {
    result = String(value)
  }

  // Apply onCellData callback
  if (options.onCellData) {
    result = options.onCellData(value, rowIndex, colIndex, result)
  }

  // Handle number formatting for output
  if (options.numbers.output !== false && result !== "") {
    const num = parseNumber(result, options.numbers)
    if (num !== false) {
      const outputConfig = options.numbers.output as NumberOutputConfig
      // Only format if the separators differ
      if (
        options.numbers.html.decimalMark !== outputConfig.decimalMark ||
        options.numbers.html.thousandsSeparator !== outputConfig.thousandsSeparator
      ) {
        result = formatNumber(num, outputConfig)
      } else {
        result = String(num)
      }
    }
  }

  // Escape special characters
  if (options.escape) {
    result = result
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }

  return result
}

/** Trigger browser file download */
export function downloadFile(
  content: string | Blob,
  fileName: string,
  mimeType: string
): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.style.display = "none"
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

/** Handle output based on outputMode */
function handleOutput(
  data: string,
  fileName: string,
  mimeType: string,
  outputMode: "file" | "string" | "base64" | "window",
  consoleLog: boolean
): string | void {
  if (consoleLog) {
    console.log(data)
  }

  switch (outputMode) {
    case "string":
      return data
    case "base64":
      return base64encode(data)
    case "window":
      window.open(URL.createObjectURL(new Blob([data], { type: mimeType })))
      return
    case "file":
    default:
      try {
        downloadFile(data, fileName, mimeType)
      } catch {
        // Fallback: use data URI
        const link = document.createElement("a")
        link.href = `data:${mimeType};base64,${base64encode(data)}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      return
  }
}

/** Handle binary output (Blob) based on outputMode */
function handleBlobOutput(
  blob: Blob,
  fileName: string,
  outputMode: "file" | "string" | "base64" | "window",
  consoleLog: boolean
): void {
  if (consoleLog) {
    console.log(`Exported ${fileName} (${blob.size} bytes)`)
  }

  switch (outputMode) {
    case "window":
      window.open(URL.createObjectURL(blob))
      break
    case "file":
    default:
      downloadFile(blob, fileName, "")
      break
  }
}

/* ================================================================
   FORMAT EXPORTERS
   ================================================================ */

/**
 * Export data as CSV/TSV/TXT
 */
function exportAsDelimited(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const isTSV = options.type === "tsv"
  const isTXT = options.type === "txt"
  const separator = isTSV ? "\t" : isTXT ? "\t" : options.csvSeparator
  const enclosure = isTSV ? "" : options.csvEnclosure

  let csvData = ""
  let rowIndex = 0

  function csvString(cell: unknown, row: number, col: number): string {
    if (cell === null || cell === undefined) return ""

    const dataString = cellToString(cell, row, col, options)
    if (dataString === "") return ""

    const csvValue = dataString.toString()

    if (isTSV) {
      // Per IANA TSV spec, tabs not allowed in TSV fields
      return replaceAll(csvValue, "\t", " ")
    }

    if (cell instanceof Date) {
      return enclosure + (dataString as string) + enclosure
    }

    // Enclose if contains separator, spaces, or linebreaks
    let result = replaceAll(csvValue, enclosure, enclosure + enclosure)
    if (
      result.indexOf(options.csvSeparator) >= 0 ||
      /[\r\n ]/g.test(result)
    ) {
      result = enclosure + result + enclosure
    }

    return result
  }

  // Header row
  if (!isRowIgnored(rowIndex, options.ignoreRow)) {
    let trData = ""
    dataSet.headers.forEach((header, colIndex) => {
      if (!isColumnIgnored(colIndex, dataSet.columnKeys, options.ignoreColumn)) {
        trData += csvString(header, rowIndex, colIndex) + separator
      }
    })
    trData = trData.substring(0, trData.length - 1) // Remove trailing separator
    if (trData.length > 0) {
      csvData += trData + "\n"
    }
  }
  rowIndex++

  // Data rows
  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      let trData = ""
      row.forEach((cell, colIndex) => {
        if (!isColumnIgnored(colIndex, dataSet.columnKeys, options.ignoreColumn)) {
          trData += csvString(cell, rowIndex, colIndex) + separator
        }
      })
      trData = trData.substring(0, trData.length - 1)
      if (trData.length > 0) {
        csvData += trData + "\n"
      }
    }
    rowIndex++
  }

  const ext = EXPORT_FORMAT_EXTENSIONS[options.type as "csv" | "tsv" | "txt"]
  const mime = isTSV
    ? "text/tab-separated-values;charset=utf-8"
    : options.type === "csv"
      ? "text/csv;charset=utf-8"
      : "text/plain;charset=utf-8"

  // Add BOM for CSV if configured
  const outputData = options.type === "csv" && options.csvUseBOM ? "\uFEFF" + csvData : csvData

  return handleOutput(
    outputData,
    `${options.fileName}.${ext}`,
    mime,
    options.outputMode,
    options.consoleLog
  )
}

/**
 * Export data as SQL INSERT statements
 */
function exportAsSQL(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const escapeSQL = (val: unknown): string => {
    const str = String(val ?? "")
    return `'${str.replace(/'/g, "''")}'`
  }

  // Build column names from headers (filtered)
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || `col_${idx}`,
        label: header,
        index: idx,
      })
    }
  })

  const columnNames = filteredColumns.map((c) => `\`${c.key}\``).join(", ")
  let tdData = `INSERT INTO \`${options.tableName}\` (${columnNames}) VALUES `

  let rowIndex = 0
  // Skip header row
  rowIndex++

  const valueGroups: string[] = []
  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      const values = filteredColumns.map((col) => escapeSQL(row[col.index]))
      if (values.length > 0) {
        valueGroups.push(`(${values.join(", ")})`)
      }
    }
    rowIndex++
  }

  tdData += valueGroups.join(",\n") + ";"

  // Add header comment
  const output = [
    `-- Export from IMS ERP System`,
    `-- Table: ${options.tableName}`,
    `-- Records: ${valueGroups.length}`,
    `-- Date: ${new Date().toISOString()}`,
    "",
    tdData,
  ].join("\n")

  return handleOutput(
    output,
    `${options.fileName}.sql`,
    EXPORT_MIME_TYPES.sql,
    options.outputMode,
    options.consoleLog
  )
}

/**
 * Export data as JSON
 * Supports jsonScope: 'head' (header only), 'data' (rows only), 'all' (both)
 */
function exportAsJSON(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  // Header array
  const jsonHeaderArray: string[][] = []
  jsonHeaderArray.push(filteredColumns.map((c) => c.label))

  // Data array
  const jsonArray: Record<string, unknown>[] = []
  let rowIndex = 0
  // Skip header row
  rowIndex++

  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      const obj: Record<string, unknown> = {}
      filteredColumns.forEach((col, colIdx) => {
        const value = row[col.index]
        obj[col.key] = cellToString(value, rowIndex, col.index, options)
      })
      if (Object.keys(obj).length > 0) {
        jsonArray.push(obj)
      }
    }
    rowIndex++
  }

  let sdata = ""
  switch (options.jsonScope) {
    case "head":
      sdata = JSON.stringify(jsonHeaderArray, null, 2)
      break
    case "data":
      sdata = JSON.stringify(jsonArray, null, 2)
      break
    case "all":
    default:
      sdata = JSON.stringify({ header: jsonHeaderArray, data: jsonArray }, null, 2)
      break
  }

  return handleOutput(
    sdata,
    `${options.fileName}.json`,
    EXPORT_MIME_TYPES.json,
    options.outputMode,
    options.consoleLog
  )
}

/**
 * Export data as XML
 */
function exportAsXML(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  const escapeXML = (val: unknown): string => {
    const str = String(val ?? "")
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  let xml = '<?xml version="1.0" encoding="utf-8"?>'
  xml += "<tabledata><fields>"

  // Header fields
  filteredColumns.forEach((col) => {
    xml += `<field>${escapeXML(col.label)}</field>`
  })
  xml += "</fields><data>"

  // Data rows
  let rowCount = 1
  let rowIndex = 0
  rowIndex++ // Skip header

  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      let trData = ""
      let colCount = 1
      filteredColumns.forEach((col) => {
        const cellValue = cellToString(row[col.index], rowIndex, col.index, options)
        trData += `<column-${colCount}>${escapeXML(cellValue)}</column-${colCount}>`
        colCount++
      })
      if (trData.length > 0 && trData !== "<column-1></column-1>") {
        xml += `<row id="${rowCount}">${trData}</row>`
        rowCount++
      }
    }
    rowIndex++
  }
  xml += "</data></tabledata>"

  return handleOutput(
    xml,
    `${options.fileName}.xml`,
    EXPORT_MIME_TYPES.xml,
    options.outputMode,
    options.consoleLog
  )
}

/**
 * Export data as Excel XMLSS (XML Spreadsheet 2003)
 */
function exportAsExcelXMLSS(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  let docData = "<Table>"

  // Header row
  let trData = ""
  filteredColumns.forEach((col) => {
    const cellValue = cellToString(col.label, 0, col.index, options)
    trData += `<Cell><Data ss:Type="String">${escapeXMLContent(cellValue)}</Data></Cell>`
  })
  if (trData.length > 0) {
    docData += `<Row>${trData}</Row>`
  }

  // Data rows
  let rowIndex = 1
  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      trData = ""
      filteredColumns.forEach((col) => {
        const rawValue = row[col.index]
        const cellValue = cellToString(rawValue, rowIndex, col.index, options)

        let type = "String"
        let style = ""

        if (rawValue !== null && rawValue !== undefined && !isNaN(Number(rawValue))) {
          type = "Number"
        } else {
          const pct = parsePercent(cellValue, options.numbers)
          if (pct !== false) {
            type = "Number"
            style = ' ss:StyleID="pct1"'
          }
        }

        const data = type !== "Number" ? escapeXMLContent(cellValue).replace(/\n/g, "<br>") : cellValue
        trData += `<Cell${style}><Data ss:Type="${type}">${data}</Data></Cell>`
      })
      if (trData.length > 0) {
        docData += `<Row>${trData}</Row>`
      }
    }
    rowIndex++
  }

  docData += "</Table>"

  // Build complete XMLSS document
  const CreationDate = new Date().toISOString()
  const ssName = options.worksheetName || "Worksheet"

  const xmlssDocFile =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<?mso-application progid="Excel.Sheet"?> ' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:html="http://www.w3.org/TR/REC-html40"> ' +
    '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"> ' +
    `<Created>${CreationDate}</Created> ` +
    "</DocumentProperties> " +
    '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office"> ' +
    "<AllowPNG/> " +
    "</OfficeDocumentSettings> " +
    '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"> ' +
    "<WindowHeight>9000</WindowHeight> " +
    "<WindowWidth>13860</WindowWidth> " +
    "<WindowTopX>0</WindowTopX> " +
    "<WindowTopY>0</WindowTopY> " +
    "<ProtectStructure>False</ProtectStructure> " +
    "<ProtectWindows>False</ProtectWindows> " +
    "</ExcelWorkbook> " +
    "<Styles> " +
    '<Style ss:ID="Default" ss:Name="Default"> ' +
    '<Alignment ss:Vertical="Center"/> ' +
    "<Borders/> " +
    "<Font/> " +
    "<Interior/> " +
    "<NumberFormat/> " +
    "<Protection/> " +
    "</Style> " +
    '<Style ss:ID="Normal" ss:Name="Normal"/> ' +
    '<Style ss:ID="pct1"> ' +
    '<NumberFormat ss:Format="Percent"/> ' +
    "</Style> " +
    "</Styles>" +
    `<Worksheet ss:Name="${ssName}">` +
    docData +
    "<WorksheetOptions/> " +
    "</Worksheet>" +
    "</Workbook>"

  if (options.consoleLog) {
    console.log(xmlssDocFile)
  }

  return handleOutput(
    xmlssDocFile,
    `${options.fileName}.xml`,
    "application/xml;charset=utf-8",
    options.outputMode,
    false
  )
}

/**
 * Export data as Excel HTML (Excel 2000 HTML format) or Word HTML (DOC)
 */
function exportAsMSOfficeHTML(
  dataSet: ExportDataSet,
  options: TableExportOptions,
  docType: "excel" | "word"
): string | void {
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  const MSDocType = docType
  const MSDocExt = docType === "excel" ? "xls" : "doc"
  const MSDocSchema = `xmlns:x="urn:schemas-microsoft-com:office:${MSDocType}"`

  let docData = ""

  // Header
  docData += "<table><thead>"
  let trData = ""
  filteredColumns.forEach((col) => {
    const cellValue = cellToString(col.label, 0, col.index, options)
    trData += `<th>${escapeXMLContent(cellValue)}</th>`
  })
  if (trData.length > 0) {
    docData += `<tr>${trData}</tr>`
  }
  docData += "</thead><tbody>"

  // Data rows
  let rowIndex = 1
  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      trData = ""
      filteredColumns.forEach((col) => {
        const cellValue = cellToString(row[col.index], rowIndex, col.index, options)
        trData += `<td>${escapeXMLContent(cellValue).replace(/\n/g, "<br>")}</td>`
      })
      if (trData.length > 0) {
        docData += `<tr>${trData}</tr>`
      }
    }
    rowIndex++
  }

  // Display table name if configured
  if (options.displayTableName) {
    docData += `<tr><td></td></tr><tr><td></td></tr><tr><td>${escapeXMLContent(options.tableName)}</td></tr>`
  }

  docData += "</tbody></table>"

  // Build complete MS-Office HTML document
  let docFile =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ${MSDocSchema} xmlns="http://www.w3.org/TR/REC-html40">` +
    `<meta http-equiv="content-type" content="application/vnd.ms-${MSDocType}; charset=UTF-8">` +
    "<head>"
  if (MSDocType === "excel") {
    docFile +=
      "<!--[if gte mso 9]>" +
      "<xml>" +
      "<x:ExcelWorkbook>" +
      "<x:ExcelWorksheets>" +
      "<x:ExcelWorksheet>" +
      `<x:Name>${options.worksheetName || "Worksheet"}</x:Name>` +
      "<x:WorksheetOptions>" +
      "<x:DisplayGridlines/>" +
      "</x:WorksheetOptions>" +
      "</x:ExcelWorksheet>" +
      "</x:ExcelWorksheets>" +
      "</x:ExcelWorkbook>" +
      "</xml>" +
      "<![endif]-->"
  }
  docFile +=
    "<style>br {mso-data-placement:same-cell;}</style>" +
    "</head>" +
    "<body>" +
    docData +
    "</body>" +
    "</html>"

  if (options.consoleLog) {
    console.log(docFile)
  }

  const mimeType = `application/vnd.ms-${MSDocType}`
  return handleOutput(
    docFile,
    `${options.fileName}.${MSDocExt}`,
    mimeType,
    options.outputMode,
    false
  )
}

/**
 * Export data as XLSX (using SheetJS/xlsx library)
 * Dynamic import for code-splitting
 */
async function exportAsXLSX(
  dataSet: ExportDataSet,
  options: TableExportOptions
): Promise<string | void> {
  const XLSX = await import("xlsx")

  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  // Build data array with headers
  const data: (string | number | boolean | null)[][] = []

  // Header row
  data.push(filteredColumns.map((c) => c.label))

  // Data rows
  let rowIndex = 1
  for (const row of dataSet.rows) {
    if (!isRowIgnored(rowIndex, options.ignoreRow)) {
      const cols: (string | number | boolean | null)[] = []
      filteredColumns.forEach((col) => {
        const cellValue = row[col.index]
        if (cellValue !== null && cellValue !== undefined && cellValue !== "") {
          // Try to convert to number
          const num = Number(cellValue)
          cols.push(!isNaN(num) && cellValue !== "" ? num : cellValue as string)
        } else {
          cols.push(null as unknown as string)
        }
      })
      data.push(cols)
    }
    rowIndex++
  }

  // Handle merges (rowspan/colspan)
  const ranges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = []
  if (dataSet.cellSpans) {
    for (const span of dataSet.cellSpans) {
      const rowspan = span.rowspan || 1
      const colspan = span.colspan || 1
      if (rowspan > 1 || colspan > 1) {
        ranges.push({
          s: { r: span.row, c: span.col },
          e: { r: span.row + rowspan - 1, c: span.col + colspan - 1 },
        })
      }
    }
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Add merges
  if (ranges.length > 0) {
    ws["!merges"] = ranges as unknown[]
  }

  // Auto-size columns
  const colWidths = filteredColumns.map((col, idx) => {
    const maxLen = Math.max(
      col.label.length,
      ...dataSet.rows.map((row) => String(row[col.index] ?? "").length)
    )
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) }
  })
  ws["!cols"] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, options.worksheetName || "Worksheet")

  if (options.outputMode === "string") {
    return XLSX.write(wb, { bookType: "xlsx", bookSST: false, type: "string" })
  }

  if (options.outputMode === "base64") {
    const wbout = XLSX.write(wb, { bookType: "xlsx", bookSST: false, type: "base64" })
    return wbout
  }

  // Default: write to file
  XLSX.writeFile(wb, `${options.fileName}.xlsx`, { bookType: "xlsx", bookSST: false })
}

/**
 * Export data as PDF using jsPDF + AutoTable
 * Full configuration matching the original plugin
 */
async function exportAsPDF(
  dataSet: ExportDataSet,
  options: TableExportOptions
): Promise<string | void> {
  const { default: jsPDF } = await import("jspdf")
  const autoTableModule = await import("jspdf-autotable")
  const autoTable = autoTableModule.default

  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  // Handle 'bestfit' paper format
  let format = options.jspdf.format
  let orientation = options.jspdf.orientation

  if (typeof format === "string" && format.toLowerCase() === "bestfit") {
    const pageFormats: Record<string, [number, number]> = {
      a0: [2383.94, 3370.39],
      a1: [1683.78, 2383.94],
      a2: [1190.55, 1683.78],
      a3: [841.89, 1190.55],
      a4: [595.28, 841.89],
    }

    // Estimate table width
    const estimatedWidth = filteredColumns.length * 80 // rough estimate
    let bestFormat = "a4"
    let bestOrientation: "p" | "l" = "p"

    for (const [key, dims] of Object.entries(pageFormats)) {
      if (dims[1] > estimatedWidth) {
        bestFormat = key
        bestOrientation = "l"
        if (dims[0] > estimatedWidth) {
          bestOrientation = "p"
        }
        break
      }
    }

    format = bestFormat
    orientation = bestOrientation
  }

  // Create doc
  const doc = new jsPDF(orientation, options.jspdf.unit, format)

  if (options.jspdf.onDocCreated) {
    options.jspdf.onDocCreated(doc)
  }

  // Title
  doc.setFontSize(14)
  doc.setTextColor(30, 58, 95) // Deep Navy Blue
  doc.text(options.tableName || "Data Export", options.jspdf.margins.left, options.jspdf.margins.top + 14)

  // Subtitle
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Exported: ${new Date().toLocaleString()} | Records: ${dataSet.rows.length}`,
    options.jspdf.margins.left,
    options.jspdf.margins.top + 22
  )

  // Table data
  const head = [filteredColumns.map((c) => c.label)]
  const body = dataSet.rows
    .filter((_, idx) => !isRowIgnored(idx + 1, options.ignoreRow))
    .map((row) =>
      filteredColumns.map((col) =>
        cellToString(row[col.index], 0, col.index, options)
      )
    )

  // AutoTable configuration
  const headerStyles = options.jspdf.autotable.headerStyles || {}
  const styles = options.jspdf.autotable.styles || {}
  const alternateRowStyles = options.jspdf.autotable.alternateRowStyles || {}

  autoTable(doc, {
    head,
    body,
    startY: options.jspdf.margins.top + 28,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      ...styles,
    },
    headStyles: {
      fillColor: [30, 58, 95], // Deep Navy Blue (was [52, 73, 94])
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
      ...headerStyles,
    },
    alternateRowStyles: {
      fillColor: [238, 242, 247], // Navy-50
      ...alternateRowStyles,
    },
    margin: options.jspdf.margins,
  })

  // Footer on each page
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

  // Output
  if (options.outputMode === "string") {
    return doc.output()
  }
  if (options.outputMode === "base64") {
    return doc.output("datauristring").split(",")[1]
  }
  if (options.outputMode === "window") {
    window.open(URL.createObjectURL(doc.output("blob")))
    return
  }

  doc.save(`${options.fileName}.pdf`)
}

/**
 * Export data as PNG image
 * Captures the HTML table as an image using html2canvas
 */
async function exportAsPNG(
  tableElement: HTMLElement | null,
  dataSet: ExportDataSet,
  options: TableExportOptions
): Promise<string | void> {
  if (!tableElement) {
    // Fallback: create a temporary table element for capture
    const tempDiv = document.createElement("div")
    tempDiv.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;background:white;padding:16px;font-family:Arial,sans-serif;"

    let tableHtml = '<table style="border-collapse:collapse;width:100%;">'

    // Header
    tableHtml += "<thead><tr>"
    dataSet.headers.forEach((header, idx) => {
      if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
        tableHtml += `<th style="background:#1e3a5f;color:#fff;padding:8px 12px;font-weight:600;text-align:left;font-size:12px;border:1px solid #a9bbd3;">${escapeXMLContent(header)}</th>`
      }
    })
    tableHtml += "</tr></thead>"

    // Data rows
    tableHtml += "<tbody>"
    let rowIndex = 1
    for (const row of dataSet.rows) {
      if (!isRowIgnored(rowIndex, options.ignoreRow)) {
        const isEven = rowIndex % 2 === 0
        tableHtml += `<tr style="background:${isEven ? "#eef2f7" : "#fff"};">`
        row.forEach((cell, colIdx) => {
          if (!isColumnIgnored(colIdx, dataSet.columnKeys, options.ignoreColumn)) {
            tableHtml += `<td style="padding:6px 12px;border:1px solid #d4dde9;font-size:11px;">${escapeXMLContent(cellToString(cell, rowIndex, colIdx, options))}</td>`
          }
        })
        tableHtml += "</tr>"
      }
      rowIndex++
    }
    tableHtml += "</tbody></table>"

    tempDiv.innerHTML = tableHtml
    document.body.appendChild(tempDiv)
    tableElement = tempDiv
  }

  try {
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(tableElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    })

    const image = canvas.toDataURL("image/png")

    if (options.outputMode === "string") {
      return image
    }
    if (options.outputMode === "base64") {
      return base64encode(image)
    }
    if (options.outputMode === "window") {
      window.open(image)
      return
    }

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        handleBlobOutput(blob, `${options.fileName}.png`, options.outputMode, options.consoleLog)
      }
    }, "image/png")
  } finally {
    // Clean up temporary element if we created one
    if (tableElement.parentElement === document.body && tableElement.style.position === "absolute") {
      document.body.removeChild(tableElement)
    }
  }
}

/**
 * Export data as DOC (Word HTML format)
 */
function exportAsDoc(
  dataSet: ExportDataSet,
  options: TableExportOptions
): string | void {
  const filteredColumns: { key: string; label: string; index: number }[] = []
  dataSet.headers.forEach((header, idx) => {
    if (!isColumnIgnored(idx, dataSet.columnKeys, options.ignoreColumn)) {
      filteredColumns.push({
        key: dataSet.columnKeys[idx] || String(idx),
        label: header,
        index: idx,
      })
    }
  })

  const headerCells = filteredColumns
    .map((col) =>
      `<th style="background:#1e3a5f;color:#fff;padding:8px 12px;font-weight:600;text-align:left;font-size:12px;border:1px solid #a9bbd3;">${escapeXMLContent(col.label)}</th>`
    )
    .join("")

  let rowIndex = 1
  const dataRows = dataSet.rows
    .filter((_, idx) => {
      const shouldInclude = !isRowIgnored(idx + 1, options.ignoreRow)
      return shouldInclude
    })
    .map((row, idx) => {
      const isEven = idx % 2 === 1
      const cells = filteredColumns
        .map((col) => {
          const cellValue = cellToString(row[col.index], idx + 1, col.index, options)
          return `<td style="padding:6px 12px;border:1px solid #d4dde9;font-size:11px;${isEven ? "background-color:#eef2f7;" : ""}">${escapeXMLContent(cellValue)}</td>`
        })
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; }
        h2 { color: #1e3a5f; margin-bottom: 4px; }
        p { color: #666; font-size: 11px; margin-top: 0; }
        table { border-collapse: collapse; width: 100%; }
      </style>
    </head>
    <body>
      <h2>${escapeXMLContent(options.tableName || "IMS ERP - Data Export")}</h2>
      <p>Exported: ${new Date().toLocaleString()} | Records: ${dataSet.rows.length}</p>
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${dataRows}</tbody>
      </table>
    </body>
    </html>
  `

  return handleOutput(
    html,
    `${options.fileName}.doc`,
    EXPORT_MIME_TYPES.doc,
    options.outputMode,
    options.consoleLog
  )
}

/** Escape XML content helper */
function escapeXMLContent(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/* ================================================================
   MAIN EXPORT FUNCTION
   ================================================================ */

/**
 * Export table data to various formats.
 *
 * This is the primary export function that replaces the jQuery tableExport plugin.
 * It accepts an ExportDataSet (headers + rows) and comprehensive options,
 * then delegates to the appropriate format-specific exporter.
 *
 * @param dataSet - The data to export (headers, columnKeys, rows)
 * @param options - Export options (merged with defaults)
 * @param tableElement - Optional HTML table element for PNG capture
 * @returns String for outputMode 'string'/'base64', void for 'file'/'window'
 */
export async function tableExport(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>,
  tableElement?: HTMLElement | null
): Promise<string | void> {
  // Merge with defaults
  const opts: TableExportOptions = {
    ...DEFAULT_EXPORT_OPTIONS,
    ...options,
    jspdf: {
      ...DEFAULT_EXPORT_OPTIONS.jspdf,
      ...options?.jspdf,
      autotable: {
        ...DEFAULT_EXPORT_OPTIONS.jspdf.autotable,
        ...options?.jspdf?.autotable,
        tableExport: {
          ...DEFAULT_EXPORT_OPTIONS.jspdf.autotable.tableExport,
          ...options?.jspdf?.autotable?.tableExport,
        },
      },
    },
    numbers: {
      html: {
        ...DEFAULT_EXPORT_OPTIONS.numbers.html,
        ...options?.numbers?.html,
      },
      output:
        options?.numbers?.output === false
          ? false
          : {
              ...DEFAULT_EXPORT_OPTIONS.numbers.output,
              ...(typeof options?.numbers?.output === "object" ? options.numbers.output : {}),
            },
    },
  }

  // Validate data
  if (!dataSet.headers || dataSet.headers.length === 0) {
    console.warn("tableExport: No headers provided")
    return
  }

  if (!dataSet.rows || dataSet.rows.length === 0) {
    console.warn("tableExport: No data rows to export")
    return
  }

  // Delegate to format-specific exporter
  switch (opts.type) {
    case "csv":
    case "tsv":
    case "txt":
      return exportAsDelimited(dataSet, opts)

    case "sql":
      return exportAsSQL(dataSet, opts)

    case "json":
      return exportAsJSON(dataSet, opts)

    case "xml":
      return exportAsXML(dataSet, opts)

    case "excel":
      if (opts.excelFileFormat === "xmlss") {
        return exportAsExcelXMLSS(dataSet, opts)
      }
      return exportAsMSOfficeHTML(dataSet, opts, "excel")

    case "xlsx":
      return await exportAsXLSX(dataSet, opts)

    case "pdf":
      return await exportAsPDF(dataSet, opts)

    case "png":
      return await exportAsPNG(tableElement || null, dataSet, opts)

    case "doc":
      return exportAsDoc(dataSet, opts)

    default:
      console.error(`tableExport: Unknown export type '${opts.type}'`)
      return
  }
}

/**
 * Create an ExportDataSet from TanStack React Table
 * Convenience function for use with DataTable component
 */
export function createExportDataSet<TData>(
  headers: string[],
  columnKeys: string[],
  rows: TData[],
  options?: {
    extractValue?: (row: TData, key: string) => unknown
  }
): ExportDataSet {
  const extractValue =
    options?.extractValue ||
    ((row: TData, key: string) => {
      const value = (row as Record<string, unknown>)[key]
      if (value === null || value === undefined) return ""
      // Handle React elements
      if (typeof value === "object" && value !== null && "$$typeof" in value) {
        return "[Complex]"
      }
      return value
    })

  return {
    headers,
    columnKeys,
    rows: rows.map((row) =>
      columnKeys.map((key) => extractValue(row, key) as string | number | boolean | null)
    ),
  }
}

/**
 * Convenience function: Export to CSV
 */
export async function exportToCSV(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>
): Promise<string | void> {
  return tableExport(dataSet, { ...options, type: "csv" })
}

/**
 * Convenience function: Export to XLSX
 */
export async function exportToXLSX(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>
): Promise<string | void> {
  return tableExport(dataSet, { ...options, type: "xlsx" })
}

/**
 * Convenience function: Export to PDF
 */
export async function exportToPDF(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>
): Promise<string | void> {
  return tableExport(dataSet, { ...options, type: "pdf" })
}

/**
 * Convenience function: Export to JSON
 */
export async function exportToJSON(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>
): Promise<string | void> {
  return tableExport(dataSet, { ...options, type: "json" })
}

/**
 * Convenience function: Export to SQL
 */
export async function exportToSQL(
  dataSet: ExportDataSet,
  options?: Partial<TableExportOptions>
): Promise<string | void> {
  return tableExport(dataSet, { ...options, type: "sql" })
}
