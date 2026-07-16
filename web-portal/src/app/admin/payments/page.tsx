"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, type Payment } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { RefreshCw } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default", PENDING: "secondary", REFUNDED: "outline", FAILED: "destructive", EXPIRED: "secondary",
}

export default function PaymentsPage() {
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-payments", page, pageSize],
    queryFn: () => api.listPayments({ limit: pageSize, offset: page * pageSize }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} pagos</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable<Payment>
        columns={[
          { key: "id", label: "ID", render: (p) => <code className="text-xs">{p.id.slice(0, 8)}…</code> },
          { key: "type", label: "Tipo", render: (p) => p.type },
          { key: "amount", label: "Monto", render: (p) => <span>${(p.amount ?? 0).toFixed(2)}</span> },
          { key: "state", label: "Estado", render: (p) => <Badge variant={stateColors[p.state] || "secondary"}>{p.state}</Badge> },
          { key: "created_at", label: "Fecha", render: (p) => new Date(p.created_at).toLocaleDateString() },
        ]}
        data={data?.data ?? []}
        meta={data?.meta}
        loading={isLoading}
        error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()}
        onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        emptyMessage="No hay pagos registrados."
        pageSize={pageSize}
      />
    </div>
  )
}
