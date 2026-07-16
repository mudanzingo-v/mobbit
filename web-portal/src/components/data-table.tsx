"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw, Plus } from "lucide-react"
import type { PaginatedMeta } from "@/lib/api"

interface Column<T> {
  key: string
  label: string
  render: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  meta?: PaginatedMeta
  loading?: boolean
  error?: string
  onRetry?: () => void
  onPageChange?: (offset: number) => void
  onPageSizeChange?: (size: number) => void
  onNew?: () => void
  onRowClick?: (item: T) => void
  emptyMessage?: string
  newLabel?: string
  pageSize?: number
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  meta,
  loading,
  error,
  onRetry,
  onPageChange,
  onNew,
  onRowClick,
  emptyMessage = "No hay datos",
  newLabel = "Nuevo",
  pageSize = 10,
}: DataTableProps<T>) {
  const currentPage = meta ? Math.floor(meta.offset / (meta.limit || pageSize)) : 0
  const totalPages = meta ? Math.ceil(meta.total / (meta.limit || pageSize)) : 0

  return (
    <div className="space-y-4">
      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <span>{error}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" /> Reintentar
            </Button>
          )}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          {onNew && (
            <Button onClick={onNew} size="sm">
              <Plus className="h-4 w-4 mr-1" /> {newLabel}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className={col.className}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>{col.render(item)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{meta.total} registros • Página {currentPage + 1} de {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => onPageChange?.((currentPage - 1) * (meta.limit || pageSize))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => onPageChange?.((currentPage + 1) * (meta.limit || pageSize))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
