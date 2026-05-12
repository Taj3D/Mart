"use client"

import * as React from "react"

export interface ServerPaginationParams {
  /** Current page number (1-indexed) */
  page: number
  /** Number of rows per page */
  pageSize: number
  /** Sort field name */
  sortName?: string
  /** Sort direction */
  sortOrder?: "asc" | "desc"
  /** Search text */
  searchText?: string
  /** Additional filters */
  filters?: Record<string, string>
}

export interface ServerPaginationState<TData> {
  /** The data rows for the current page */
  data: TData[]
  /** Total number of rows (server-side) */
  totalRows: number
  /** Whether data is currently being fetched */
  isLoading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Current pagination params */
  params: ServerPaginationParams
  /** Refetch data with current params */
  refetch: () => void
  /** Go to a specific page */
  setPage: (page: number) => void
  /** Set page size */
  setPageSize: (pageSize: number) => void
  /** Set sort */
  setSort: (sortName: string, sortOrder: "asc" | "desc") => void
  /** Set search text */
  setSearchText: (text: string) => void
  /** Set filters */
  setFilters: (filters: Record<string, string>) => void
  /** Reset to initial state */
  reset: () => void
  /** Total number of pages */
  totalPages: number
}

export interface UseServerPaginationOptions<TData> {
  /** Function that fetches data from the server */
  fetchData: (params: ServerPaginationParams) => Promise<{ data: TData[]; total: number }>
  /** Initial page size */
  initialPageSize?: number
  /** Initial sort */
  initialSort?: { sortName: string; sortOrder: "asc" | "desc" }
  /** Auto-fetch on mount and param change */
  autoFetch?: boolean
  /** Debounce delay for search (ms) */
  searchDebounce?: number
}

/**
 * useServerPagination - Hook for managing server-side pagination state.
 *
 * Handles page, pageSize, sort, search, and filter state, and provides
 * a refetch function to trigger data loading.
 *
 * Usage:
 * ```tsx
 * const serverPagination = useServerPagination({
 *   fetchData: async (params) => {
 *     const res = await fetch(`/api/data?page=${params.page}&pageSize=${params.pageSize}`)
 *     const json = await res.json()
 *     return { data: json.rows, total: json.total }
 *   },
 * })
 *
 * <DataTable
 *   columns={columns}
 *   data={serverPagination.data}
 *   sidePagination="server"
 *   totalRows={serverPagination.totalRows}
 *   isLoading={serverPagination.isLoading}
 *   onFetchData={(params) => {
 *     serverPagination.setPage(params.page)
 *     serverPagination.setPageSize(params.pageSize)
 *   }}
 * />
 * ```
 */
export function useServerPagination<TData>(
  options: UseServerPaginationOptions<TData>
): ServerPaginationState<TData> {
  const {
    fetchData,
    initialPageSize = 10,
    initialSort,
    autoFetch = true,
    searchDebounce = 300,
  } = options

  const [data, setData] = React.useState<TData[]>([])
  const [totalRows, setTotalRows] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [params, setParams] = React.useState<ServerPaginationParams>({
    page: 1,
    pageSize: initialPageSize,
    sortName: initialSort?.sortName,
    sortOrder: initialSort?.sortOrder,
    searchText: "",
    filters: {},
  })

  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchDataInternal = React.useCallback(
    async (fetchParams: ServerPaginationParams) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchData(fetchParams)
        setData(result.data)
        setTotalRows(result.total)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch data"
        setError(message)
        setData([])
        setTotalRows(0)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchData]
  )

  // Auto-fetch when params change
  React.useEffect(() => {
    if (!autoFetch) return

    // Debounce search changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    const delay = params.searchText !== undefined ? searchDebounce : 0
    searchTimeoutRef.current = setTimeout(() => {
      fetchDataInternal(params)
    }, delay)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [params, autoFetch, fetchDataInternal, searchDebounce])

  const totalPages = Math.max(1, Math.ceil(totalRows / params.pageSize))

  const refetch = React.useCallback(() => {
    fetchDataInternal(params)
  }, [fetchDataInternal, params])

  const setPage = React.useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page: Math.max(1, page) }))
  }, [])

  const setPageSize = React.useCallback((newPageSize: number) => {
    setParams((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
  }, [])

  const setSort = React.useCallback((sortName: string, sortOrder: "asc" | "desc") => {
    setParams((prev) => ({ ...prev, sortName, sortOrder, page: 1 }))
  }, [])

  const setSearchText = React.useCallback((searchText: string) => {
    setParams((prev) => ({ ...prev, searchText, page: 1 }))
  }, [])

  const setFilters = React.useCallback((filters: Record<string, string>) => {
    setParams((prev) => ({ ...prev, filters, page: 1 }))
  }, [])

  const reset = React.useCallback(() => {
    setParams({
      page: 1,
      pageSize: initialPageSize,
      sortName: initialSort?.sortName,
      sortOrder: initialSort?.sortOrder,
      searchText: "",
      filters: {},
    })
  }, [initialPageSize, initialSort])

  return {
    data,
    totalRows,
    isLoading,
    error,
    params,
    refetch,
    setPage,
    setPageSize,
    setSort,
    setSearchText,
    setFilters,
    reset,
    totalPages,
  }
}
