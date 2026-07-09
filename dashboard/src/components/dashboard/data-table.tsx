"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

interface Column<T> {
  key: string
  header: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  sortField?: string
  sortDesc?: boolean
  onSort?: (field: string) => void
  pagination?: { page: number; pageSize: number; totalItems: number; totalPages: number }
  onPageChange?: (page: number) => void
}

function SkeletonRows({ columns }: { columns: Column<any>[] }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-zinc-800">
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  sortField,
  sortDesc,
  onSort,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400",
                  col.sortable && "cursor-pointer select-none hover:text-zinc-200",
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortField === col.key && (
                    sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {loading ? (
            <SkeletonRows columns={columns} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-zinc-500">
                No data
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={(row as any).id ?? i} className="transition-colors hover:bg-zinc-800/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-zinc-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
          <span className="text-xs text-zinc-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} items)
          </span>
          <div className="flex gap-1">
            <button
              className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const start = Math.max(1, pagination.page - 2)
              const page = start + i
              if (page > pagination.totalPages) return null
              return (
                <button
                  key={page}
                  className={cn(
                    "rounded px-2 py-1 text-xs transition-colors",
                    page === pagination.page
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
                  )}
                  onClick={() => onPageChange?.(page)}
                >
                  {page}
                </button>
              )
            })}
            <button
              className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-40"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}