"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

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
 * Creates a column definition for radio button single-row selection.
 * Use this when singleSelect mode is enabled.
 * Only one row can be selected at a time.
 */
export function getRadioColumn<TData>(): ColumnDef<TData> {
  return {
    id: "radio",
    header: () => <span className="sr-only">Select row</span>,
    cell: ({ row, table }) => {
      const isSelected = row.getIsSelected()

      return (
        <div className="flex items-center justify-center">
          <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select row ${row.index + 1}`}
            className={cn(
              "aspect-square size-4 shrink-0 rounded-full border shadow-xs",
              "transition-[color,box-shadow] outline-none",
              "border-navy-300 dark:border-navy-600",
              "hover:border-navy-400 dark:hover:border-navy-500",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              isSelected && "border-navy-600 dark:border-navy-400"
            )}
            onClick={(e) => {
              e.stopPropagation()
              // Deselect all other rows first, then select this one
              table.toggleAllRowsSelected(false)
              row.toggleSelected(true)
            }}
          >
            {isSelected && (
              <span className="flex items-center justify-center">
                <span className="block size-2 rounded-full bg-navy-600 dark:bg-navy-400" />
              </span>
            )}
          </button>
        </div>
      )
    },
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
