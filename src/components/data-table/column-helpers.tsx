"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * Creates a column definition for row selection checkboxes.
 * Use this as the first column in your table when enableRowSelection is true.
 */
export function getCheckboxColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:border-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-navy-300 dark:border-navy-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }
}

/**
 * Creates a column definition for sequential row numbers.
 */
export function getRowNumberColumn<TData>(pageIndex: number = 0, pageSize: number = 10): ColumnDef<TData> {
  return {
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs font-mono">
        {pageIndex * pageSize + row.index + 1}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  }
}

/**
 * Creates an action column with customizable buttons.
 */
export function getActionColumn<TData>(
  actions: (row: TData) => React.ReactNode
): ColumnDef<TData> {
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => actions(row.original),
    enableSorting: false,
    enableHiding: false,
    size: 120,
  }
}

export { DataTable } from "./data-table"
export type { ColumnDef }
