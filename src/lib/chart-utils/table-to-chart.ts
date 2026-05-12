/**
 * IMS Chart Utils - HTML Table to Chart Data Converter
 * Replaces FusionCharts transcoder-htmltable module
 * Converts HTML table elements or data arrays to IMSChartData format
 */

import type {
  IMSTableConversionOptions,
  IMSTableExtractionResult,
  IMSTableChartResult,
  IMSChartData,
  IMSChartDataPoint,
  IMSChartCategory,
  IMSChartDataset,
  IMSMSDataPoint,
} from './types';

// ============================================================================
// Internal Constants
// ============================================================================

const BLANK_STRING = '__fcBLANK__';
let blankNo = 0;

// ============================================================================
// Node Sanitization
// ============================================================================

/** Remove text nodes from a node list, returning only element nodes */
function sanitizeNodesArray(nodes: NodeListOf<ChildNode> | ChildNode[]): Element[] {
  const result: Element[] = [];
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType !== 3) { // Not a text node
      result.push(nodes[i] as Element);
    }
  }
  return result;
}

/** Get text content from an element (cross-browser) */
function getTextFromNode(node: Element | HTMLElement): string {
  return (node as HTMLElement).innerText !== undefined
    ? (node as HTMLElement).innerText
    : node.textContent || '';
}

// ============================================================================
// Table Structure Helpers
// ============================================================================

/** Get the <tbody> element from a table, falling back to the table itself */
function getTbody(tbl: HTMLTableElement): HTMLTableSectionElement | HTMLTableElement {
  const children = sanitizeNodesArray(tbl.childNodes);
  if (children.length) {
    if (children[0].nodeName === 'TBODY') {
      return children[0] as HTMLTableSectionElement;
    } else if (children[0].nodeName === 'THEAD' && children[1] && children[1].nodeName === 'TBODY') {
      return children[1] as HTMLTableSectionElement;
    }
  }
  return tbl;
}

/** Get the <thead> element children from a table */
function getThead(tbl: HTMLTableElement): Element[] {
  const children = sanitizeNodesArray(tbl.childNodes);
  if (children.length) {
    if (children[0].nodeName === 'THEAD' && children[1] && children[1].nodeName === 'TBODY') {
      return sanitizeNodesArray(children[0].childNodes);
    }
  }
  return [];
}

/** Check if an item exists in an array */
function arrayContains(arr: (string | number)[], item: string | number | object): boolean {
  let i = arr.length;
  while (i) {
    i -= 1;
    if (arr[i] === item) return true;
  }
  return false;
}

/** Check if a row/column has numeric data */
function checkData(
  nodeArr: Element[],
  j: number,
  index: number
): boolean {
  const childArr = sanitizeNodesArray(nodeArr[j].childNodes);
  for (let i = 0; i < childArr.length; i++) {
    if (i !== index) {
      const text = getTextFromNode(childArr[i]);
      if (parseFloat(text) === Number(text) && text.trim() !== '') {
        return true;
      }
    }
  }
  return false;
}

// ============================================================================
// Column Array Builder (Transpose rows → columns)
// ============================================================================

interface ColumnNode {
  childNodes: Element[];
}

function getColumnArr(rowArr: Element[]): ColumnNode[] {
  const returnObj: ColumnNode[] = [];
  const rowSpan: Record<number, { rowNum: number; row: number; col: number }> = {};

  for (let i = 0; i < rowArr.length; i++) {
    const cellArr = sanitizeNodesArray(rowArr[i].childNodes);
    let colSpan = 1;
    let rowSpanInc = 0;

    for (let j = 0; j < cellArr.length; j++) {
      let columnArrIdx = j + colSpan + rowSpanInc - 1;

      if (rowSpan[columnArrIdx] && i - rowSpan[columnArrIdx].rowNum < rowSpan[columnArrIdx].row) {
        rowSpanInc += rowSpan[columnArrIdx].col;
        columnArrIdx += rowSpan[columnArrIdx].col;
      }

      const cellRowSpan = parseInt(cellArr[j].getAttribute('rowspan') || '1', 10);
      const cellColSpan = parseInt(cellArr[j].getAttribute('colspan') || '1', 10);

      if (cellRowSpan > 1) {
        if (!rowSpan[columnArrIdx]) {
          rowSpan[columnArrIdx] = { rowNum: 0, row: 0, col: 1 };
        }
        rowSpan[columnArrIdx].rowNum = i;
        rowSpan[columnArrIdx].row = cellRowSpan;
        rowSpan[columnArrIdx].col = cellColSpan > 1 ? cellColSpan : 1;
      }

      while (returnObj.length <= columnArrIdx) {
        returnObj.push({ childNodes: [] });
      }
      returnObj[columnArrIdx].childNodes.push(cellArr[j]);

      if (cellColSpan > 1) {
        colSpan += cellColSpan - 1;
      }
    }
  }

  return returnObj;
}

// ============================================================================
// Label Extraction
// ============================================================================

interface LabelResult {
  labelObj: Record<string, string>;
  index: number;
}

function getLabels(
  nodeArr: Element[] | ColumnNode[],
  ignoreArr: number[],
  index?: number,
  opts?: IMSTableConversionOptions
): LabelResult {
  let spanTotal = 0;

  // Auto-detect label row/column
  if (typeof index === 'undefined') {
    const internalLabel: Record<string, string> = {};
    const childArr = 'childNodes' in nodeArr[0]
      ? (nodeArr[0] as ColumnNode).childNodes
      : sanitizeNodesArray((nodeArr[0] as Element).childNodes);

    for (let j = 0; j < childArr.length; j++) {
      const spanLen = j + spanTotal;
      internalLabel[spanLen] = BLANK_STRING + (spanLen + 1);

      const cell = childArr[j] as HTMLElement;
      const temp = parseInt(cell.colSpan || '1', 10);
      const span = temp > 1 ? temp : parseInt(cell.rowSpan || '1', 10);
      if (span > 1) {
        for (let l = 1; l < span; l++) {
          internalLabel[spanLen + l] = BLANK_STRING + (spanLen + l + 1);
        }
        spanTotal += span - 1;
      }
    }

    const totalLen = childArr.length + spanTotal;
    for (let i = 0; i < ignoreArr.length; i++) {
      if (ignoreArr[i] > 0) {
        delete internalLabel[ignoreArr[i] - 1];
      } else {
        delete internalLabel[totalLen + ignoreArr[i]];
      }
    }

    return { index: -1, labelObj: internalLabel };
  }

  // Auto-detect by analyzing rows
  if (index === 0) {
    let mostEmptyCellRow: number | null = null;
    const emptyCellCount: number[] = [];

    for (let i = 0; i < nodeArr.length; i++) {
      const childArr = 'childNodes' in nodeArr[i]
        ? (nodeArr[i] as ColumnNode).childNodes
        : sanitizeNodesArray((nodeArr[i] as Element).childNodes);

      emptyCellCount[i] = 0;
      let textCellCount = 0;

      if (opts?._extractByHeaderTag) {
        for (let j = 0; j < childArr.length; j++) {
          if ((childArr[j] as HTMLElement).nodeName.toLowerCase() === 'th') {
            const result = getLabels(nodeArr as Element[], ignoreArr, i + 1, opts);
            if (opts._rowLabelIndex !== undefined) {
              delete result.labelObj[opts._rowLabelIndex];
            }
            return result;
          }
        }
      } else {
        for (let j = 0; j < childArr.length; j++) {
          if (arrayContains(ignoreArr, j + 1) || arrayContains(ignoreArr, j - childArr.length)) {
            continue;
          }
          const temp = getTextFromNode(childArr[j]);
          if (temp.replace(/^\s*/, '').replace(/\s*$/, '') === '') {
            emptyCellCount[i] += 1;
            continue;
          }
          if (parseFloat(temp) !== Number(temp) || temp.trim() === '') {
            textCellCount += 1;
            if (textCellCount > 1) {
              return getLabels(nodeArr as Element[], ignoreArr, i + 1, opts);
            }
          }
        }
      }

      if (i > 0) {
        if (emptyCellCount[i - 1] > emptyCellCount[i]) {
          mostEmptyCellRow = i - 1;
        } else if (emptyCellCount[i - 1] < emptyCellCount[i]) {
          mostEmptyCellRow = i;
        }
      }
    }

    if (mostEmptyCellRow !== null) {
      return getLabels(nodeArr as Element[], ignoreArr, mostEmptyCellRow + 1, opts);
    }
    return getLabels(nodeArr as Element[], ignoreArr, undefined, opts);
  }

  // Extract labels from specific row/column
  let actualIndex = index;
  if (index < 0) {
    actualIndex = index + nodeArr.length;
  } else if (index > 0) {
    actualIndex = index - 1;
  }

  const childArr = 'childNodes' in nodeArr[actualIndex]
    ? (nodeArr[actualIndex] as ColumnNode).childNodes
    : sanitizeNodesArray((nodeArr[actualIndex] as Element).childNodes);

  const returnObj: Record<string, string> = {};
  let totalSpanLength = 0;

  const isRowLabel = !('childNodes' in nodeArr[0]) || Array.isArray((nodeArr[0] as ColumnNode).childNodes);

  for (let j = 0; j < childArr.length; j++) {
    let spanLength = 0;
    const cell = childArr[j] as HTMLElement;

    if (isRowLabel || true) {
      const cs = parseInt(cell.getAttribute('colspan') || '1', 10);
      if (cs > 1) spanLength = cs;
    }

    const temp = getTextFromNode(cell);
    if (temp.replace(/^\s*/, '').replace(/\s*$/, '') !== '') {
      returnObj[j + totalSpanLength] = temp;
    } else if (checkData(
      'childNodes' in nodeArr[0]
        ? (nodeArr as ColumnNode[]).map(n => ({ childNodes: n.childNodes } as unknown as Element))
        : (nodeArr as Element[]),
      j, actualIndex
    )) {
      returnObj[j + totalSpanLength] = BLANK_STRING + blankNo;
      blankNo += 1;
    }

    if (spanLength > 1) {
      const label = returnObj[j + totalSpanLength];
      for (let i = 1; i < spanLength; i++) {
        returnObj[j + totalSpanLength + i] = label + ' (' + i + ')';
      }
      totalSpanLength += spanLength - 1;
    }
  }

  const maxIdx = childArr.length + totalSpanLength;
  for (let i = 0; i < ignoreArr.length; i++) {
    if (ignoreArr[i] > 0) {
      delete returnObj[ignoreArr[i] - 1];
    } else {
      delete returnObj[maxIdx + ignoreArr[i]];
    }
  }

  return { labelObj: returnObj, index: actualIndex };
}

// ============================================================================
// Main Table Data Extraction
// ============================================================================

function extractDataFromTable(
  tbl: HTMLTableElement | string,
  opts: IMSTableConversionOptions
): IMSTableExtractionResult {
  // Resolve table element
  let tableEl: HTMLTableElement | null = null;
  if (typeof tbl === 'string') {
    tableEl = document.getElementById(tbl) as HTMLTableElement | null;
  } else {
    tableEl = tbl;
  }

  if (!tableEl) {
    return { data: null, chartType: 'single', labelMap: { labelObj: {}, index: -1 }, legendMap: { labelObj: {}, index: -1 } };
  }

  if (opts.hideTable) {
    tableEl.style.display = 'none';
  }

  const theadRows = getThead(tableEl);
  const tbody = getTbody(tableEl);
  const tableRows = [...theadRows, ...sanitizeNodesArray(tbody.childNodes)];
  const l = tableRows.length;

  let dataRows = 0;
  let dataColumns = 0;

  const singleSeriesCharts = ['column2d', 'column3d', 'pie3d', 'pie2d', 'line', 'bar2d', 'area2d', 'doughnut2d', 'doughnut3d', 'pareto2d', 'pareto3d'];
  const isSingleSeries = opts.chartType ? singleSeriesCharts.indexOf(opts.chartType) !== -1 : false;

  const rowLabelSource = parseInt(String(opts.labelSource), 10);
  const colLabelSource = parseInt(String(opts.legendSource), 10);

  let rowLabelMap: LabelResult;
  let columnLabelMap: LabelResult;

  if ((opts.major || 'row') === 'column') {
    rowLabelMap = opts.useLabels !== false
      ? getLabels(tableRows, opts.ignoreCols || [], rowLabelSource || undefined)
      : getLabels(tableRows, opts.ignoreCols || []);
    columnLabelMap = opts.useLegend !== false
      ? getLabels(getColumnArr(tableRows), opts.ignoreRows || [], colLabelSource || undefined)
      : getLabels(getColumnArr(tableRows), opts.ignoreRows || []);
  } else {
    let tempMap = getLabels(getColumnArr(tableRows), opts.ignoreRows || [], rowLabelSource || undefined);
    rowLabelMap = opts.useLabels !== false ? tempMap : getLabels(getColumnArr(tableRows), opts.ignoreRows || []);
    columnLabelMap = opts.useLegend !== false
      ? getLabels(tableRows, opts.ignoreCols || [], colLabelSource || undefined, opts)
      : getLabels(tableRows, opts.ignoreCols || [], undefined, opts);
    const swap = rowLabelMap;
    rowLabelMap = columnLabelMap;
    columnLabelMap = swap;
  }

  delete rowLabelMap.labelObj[columnLabelMap.index];
  delete columnLabelMap.labelObj[rowLabelMap.index];

  // Build data map
  const dataMap: Record<string, Record<string, number>> = {};
  const major = opts.major || 'row';

  if (major === 'row') {
    for (const item in columnLabelMap.labelObj) {
      dataMap[item] = {};
    }
  } else {
    for (const item in rowLabelMap.labelObj) {
      dataMap[item] = {};
    }
  }

  // Populate data map
  let tempColumn = 0;
  const columnSpanObj: Record<number, number> = {};
  const rowSpanObj: Record<number, Record<number, { row: number; col: number }>> = {};

  for (let i = 0; i < l; i++) {
    if (rowLabelMap.index === i || columnLabelMap.labelObj[i] === undefined) {
      continue;
    }

    dataRows += 1;
    const rowCells = sanitizeNodesArray(tableRows[i].childNodes);
    columnSpanObj[i] = 0;
    rowSpanObj[i] = {};

    for (let j = 0; j < rowCells.length; j++) {
      const cellEle = rowCells[j];
      const columnSpan = parseInt(cellEle.getAttribute('colspan') || '1', 10);
      const rowSpan = parseInt(cellEle.getAttribute('rowspan') || '1', 10);
      let mapColumnIdx = j + columnSpanObj[i];

      // Handle row spans from previous rows
      for (let k = 0; k < i; k++) {
        if (rowSpanObj[k]) {
          for (const m in rowSpanObj[k]) {
            if (Number(m) > mapColumnIdx) break;
            if (i - k <= rowSpanObj[k][m].row) {
              mapColumnIdx += rowSpanObj[k][m].col;
            }
          }
        }
      }

      if (columnSpan > 1) columnSpanObj[i] += columnSpan - 1;
      if (rowSpan > 1) {
        rowSpanObj[i][mapColumnIdx] = {
          row: rowSpan - 1,
          col: columnSpan > 1 ? columnSpan : 1,
        };
      }

      if (columnLabelMap.index === mapColumnIdx || rowLabelMap.labelObj[mapColumnIdx] === undefined) {
        continue;
      }

      tempColumn += 1;
      let cellText = getTextFromNode(cellEle);

      if (cellText.replace(/^\s*/, '').replace(/\s*$/, '') === '') {
        cellText = String(opts.convertBlankTo || '0');
        if (!opts.convertBlankTo) continue;
      }

      const cs = columnSpan > 1 ? columnSpan : 1;
      const rs = rowSpan > 1 ? rowSpan : 1;

      if (major === 'row') {
        for (let k = 0; k < cs; k++) {
          for (let m = 0; m < rs; m++) {
            if (!dataMap[i + m]) dataMap[i + m] = {};
            dataMap[i + m][mapColumnIdx + k] = parseFloat(cellText);
          }
        }
      } else {
        for (let k = 0; k < cs; k++) {
          for (let m = 0; m < rs; m++) {
            if (!dataMap[mapColumnIdx + k]) dataMap[mapColumnIdx + k] = {};
            dataMap[mapColumnIdx + k][i + m] = parseFloat(cellText);
          }
        }
      }
    }

    if (tempColumn > dataColumns) dataColumns = tempColumn;
  }

  return {
    data: dataMap,
    chartType: opts.chartType
      ? !isSingleSeries ? 'multi' : 'single'
      : dataRows > 1 && dataColumns > 1 ? 'multi' : 'single',
    labelMap: columnLabelMap,
    legendMap: rowLabelMap,
  };
}

// ============================================================================
// Create Chart Data from Extraction
// ============================================================================

function createChartFromTableData(
  data: IMSTableExtractionResult,
  opts: IMSTableConversionOptions
): IMSChartData {
  const dataMap = data.data;
  if (!dataMap) return { data: [], chartType: 'single' };

  let labelMap: LabelResult;
  let legendMap: LabelResult;

  if ((opts.major || 'row') !== 'row') {
    labelMap = data.legendMap;
    legendMap = data.labelMap;
  } else {
    labelMap = data.labelMap;
    legendMap = data.legendMap;
  }

  if (data.chartType === 'multi') {
    // Multi-series chart
    const categories: IMSChartCategory[] = [];
    const datasetsMap: Record<string, IMSMSDataPoint[]> = {};
    const seriesColors = opts.seriesColors || [];

    let i = 0;
    for (const item1 in dataMap) {
      const labelText = labelMap.labelObj[item1];
      categories.push({
        label: labelText && labelText.indexOf(BLANK_STRING) !== -1 ? '' : labelText || '',
        showLabel: opts.showLabels !== false,
      });

      for (const item2 in dataMap[item1]) {
        if (!datasetsMap[item2]) datasetsMap[item2] = [];
        datasetsMap[item2].push({ value: dataMap[item1][item2] });
      }
      i += 1;
    }

    const dataset: IMSChartDataset[] = [];
    i = 0;
    for (const item1 in datasetsMap) {
      const legendText = legendMap.labelObj[item1];
      dataset.push({
        seriesName: legendText && legendText.indexOf(BLANK_STRING) !== -1 ? '' : legendText || '',
        data: datasetsMap[item1],
        color: seriesColors[i] || undefined,
      });
      i += 1;
    }

    return {
      categories,
      dataset,
      chartType: 'multi',
    };
  } else {
    // Single-series chart
    const chartData: IMSChartDataPoint[] = [];
    let i = 0;

    for (const item1 in dataMap) {
      for (const item2 in dataMap[item1]) {
        const labelText = labelMap.labelObj[item1];
        chartData.push({
          label: labelText && labelText.indexOf(BLANK_STRING) !== -1 ? '' : labelText || '',
          value: dataMap[item1][item2],
        });
        i += 1;
      }
    }

    return {
      data: chartData,
      chartType: 'single',
    };
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Convert an HTML table to IMSChartData format.
 * Replaces FusionCharts HTMLTable data handler.
 *
 * @example
 * const chartData = convertTableToChartData('myTable', {
 *   chartType: 'column2d',
 *   major: 'row',
 *   showLabels: true,
 *   showLegend: true,
 * });
 */
export function convertTableToChartData(
  table: HTMLTableElement | string,
  options: IMSTableConversionOptions = {}
): IMSTableChartResult {
  // Reset blank counter
  blankNo = 0;

  try {
    const defaultOpts: IMSTableConversionOptions = {
      major: 'row',
      useLabels: true,
      useLegend: true,
      labelSource: 0,
      legendSource: 0,
      ignoreCols: [],
      ignoreRows: [],
      showLabels: true,
      showLegend: true,
      seriesColors: [],
      convertBlankTo: '0',
      hideTable: false,
    };

    const mergedOpts = { ...defaultOpts, ...options };
    const extraction = extractDataFromTable(table, mergedOpts);
    const chartData = createChartFromTableData(extraction, mergedOpts);

    return { data: chartData };
  } catch (error) {
    return {
      data: { data: [], chartType: 'single' },
      error: error instanceof Error ? error.message : 'Unknown error converting table',
    };
  }
}

/**
 * Convert a 2D array of data to IMSChartData format.
 * Helper for programmatic data conversion.
 *
 * @example
 * const chartData = convertArrayToChartData(
 *   [['', 'Q1', 'Q2'], ['Sales', 100, 200], ['Profit', 50, 80]],
 *   { chartType: 'mscolumn2d' }
 * );
 */
export function convertArrayToChartData(
  dataArray: (string | number)[][],
  options: IMSTableConversionOptions = {}
): IMSChartData {
  const chartType = options.chartType || 'column2d';
  const singleSeriesTypes = ['column2d', 'column3d', 'pie3d', 'pie2d', 'line', 'bar2d', 'area2d', 'doughnut2d', 'doughnut3d'];
  const isSingleSeries = singleSeriesTypes.indexOf(chartType) !== -1;

  if (isSingleSeries || dataArray.length <= 2) {
    // Single series: first column = labels, second column = values
    const data: IMSChartDataPoint[] = [];
    for (let i = 1; i < dataArray.length; i++) {
      if (dataArray[i].length >= 2) {
        data.push({
          label: String(dataArray[i][0]),
          value: Number(dataArray[i][1]) || 0,
        });
      }
    }
    return { data, chartType: 'single' };
  } else {
    // Multi series: first row = column headers, first column = row headers
    const categories: IMSChartCategory[] = [];
    const datasetMap: Record<string, IMSMSDataPoint[]> = {};

    // Extract categories from header row
    for (let j = 1; j < dataArray[0].length; j++) {
      categories.push({ label: String(dataArray[0][j]) });
      datasetMap[j] = [];
    }

    // Extract datasets
    const datasetNames: string[] = [];
    for (let i = 1; i < dataArray.length; i++) {
      datasetNames.push(String(dataArray[i][0]));
      for (let j = 1; j < dataArray[i].length; j++) {
        if (datasetMap[j]) {
          datasetMap[j].push({ value: Number(dataArray[i][j]) || 0 });
        }
      }
    }

    const dataset: IMSChartDataset[] = [];
    const seriesColors = options.seriesColors || [];
    for (let j = 1; j < dataArray[0].length; j++) {
      dataset.push({
        seriesName: datasetNames[j - 1] || `Series ${j}`,
        data: datasetMap[j] || [],
        color: seriesColors[j - 1] || undefined,
      });
    }

    return { categories, dataset, chartType: 'multi' };
  }
}

/**
 * Convert JSON data (FusionCharts format) to IMSChartData format.
 */
export function convertFusionJSONToChartData(json: {
  chart?: Record<string, unknown>;
  data?: Array<{ label?: string; value?: number | string; [k: string]: unknown }>;
  categories?: Array<{ category: Array<{ label?: string; [k: string]: unknown }> }>;
  dataset?: Array<{ seriesname?: string; data: Array<{ value?: number | string; [k: string]: unknown }>; [k: string]: unknown }>;
}): IMSChartData {
  if (json.data) {
    // Single series
    return {
      data: json.data.map(d => ({
        label: String(d.label || ''),
        value: Number(d.value) || 0,
      })),
      chartType: 'single',
    };
  }

  if (json.categories && json.dataset) {
    // Multi series
    const categories: IMSChartCategory[] = (json.categories[0]?.category || []).map(c => ({
      label: String(c.label || ''),
    }));

    const dataset: IMSChartDataset[] = json.dataset.map(ds => ({
      seriesName: String(ds.seriesname || ''),
      data: (ds.data || []).map(d => ({
        value: Number(d.value) || 0,
      })),
    }));

    return { categories, dataset, chartType: 'multi' };
  }

  return { data: [], chartType: 'single' };
}
