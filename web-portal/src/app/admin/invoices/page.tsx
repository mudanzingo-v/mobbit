"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { useT } from "@/lib/i18n"
import { RefreshCw, Download } from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  STAMPED: "default", PENDING: "secondary", CANCELLED: "destructive", FAILED: "destructive",
}

export default function InvoicesPage() {
  const { t } = useT()
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-invoices", page, pageSize],
    queryFn: () => api.listInvoices({ limit: pageSize, offset: page * pageSize }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.invoices}</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0}</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <DataTable<any>
        columns={[
          { key: "id", label: "ID", render: (inv) => <code className="text-xs">{inv.id.slice(0, 8)}…</code> },
          { key: "rfc", label: "RFC", render: (inv) => <code className="text-xs">{inv.rfc_receptor}</code> },
          { key: "total", label: t.product.price, render: (inv) => <span>${(inv.total ?? 0).toFixed(2)}</span> },
          { key: "status", label: t.product.active, render: (inv) => <Badge variant={statusColors[inv.status] || "secondary"}>{inv.status}</Badge> },
          { key: "files", label: "Files", render: (inv) => (
            <div className="flex gap-1">
              {inv.xml_url && <a href={inv.xml_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}><Download className="h-3 w-3 inline" /> XML</a>}
              {inv.pdf_url && <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}><Download className="h-3 w-3 inline" /> PDF</a>}
              {!inv.xml_url && !inv.pdf_url && <span className="text-muted-foreground text-xs">—</span>}
            </div>
          )},
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        emptyMessage={t.common.noData} pageSize={pageSize}
      />
    </div>
  )
}
