"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { RefreshCw, Download } from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  STAMPED: "default", PENDING: "secondary", CANCELLED: "destructive", FAILED: "destructive",
}

export default function InvoicesPage() {
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-invoices", page, pageSize],
    queryFn: () => api.listInvoices({ limit: pageSize, offset: page * pageSize }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturas CFDI</h1>
          <p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} facturas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable<any>
        columns={[
          { key: "id", label: "ID", render: (inv) => <code className="text-xs">{inv.id.slice(0, 8)}…</code> },
          { key: "rfc_receptor", label: "RFC", render: (inv) => <code className="text-xs">{inv.rfc_receptor}</code> },
          { key: "total", label: "Total", render: (inv) => <span>${(inv.total ?? 0).toFixed(2)}</span> },
          { key: "status", label: "Estado", render: (inv) => <Badge variant={statusColors[inv.status] || "secondary"}>{inv.status}</Badge> },
          { key: "cfdi_uuid", label: "UUID", render: (inv) => inv.cfdi_uuid ? <code className="text-xs">{inv.cfdi_uuid.slice(0, 12)}…</code> : <span className="text-muted-foreground">—</span> },
          { key: "files", label: "Archivos", render: (inv) => (
            <div className="flex gap-1">
              {inv.xml_url && (
                <a href={inv.xml_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}>
                  <Download className="h-3 w-3" /> XML
                </a>
              )}
              {inv.pdf_url && (
                <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}>
                  <Download className="h-3 w-3" /> PDF
                </a>
              )}
              {!inv.xml_url && !inv.pdf_url && <span className="text-muted-foreground text-xs">—</span>}
            </div>
          )},
        ]}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()}
        onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        emptyMessage="No hay facturas CFDI registradas."
        pageSize={pageSize}
      />
    </div>
  )
}
