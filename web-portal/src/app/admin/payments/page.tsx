"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { useT } from "@/lib/i18n"
import { RefreshCw } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default", PENDING: "secondary", REFUNDED: "outline", FAILED: "destructive", EXPIRED: "secondary",
}

export default function PaymentsPage() {
  const { t } = useT()
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-payments", page, pageSize],
    queryFn: () => api.listPayments({ limit: pageSize, offset: page * pageSize }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.payments}</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} {t.nav.payments.toLowerCase()}</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <DataTable<any>
        columns={[
          { key: "id", label: "ID", render: (p) => <code className="text-xs">{p.id.slice(0, 8)}…</code> },
          { key: "type", label: "type", render: (p) => p.type },
          { key: "amount", label: t.product.price, render: (p) => <span>${(p.amount ?? 0).toFixed(2)}</span> },
          { key: "state", label: t.product.active, render: (p) => <span>{p.state}</span> },
          { key: "created_at", label: t.wizard.estimatedDate, render: (p) => new Date(p.created_at).toLocaleDateString() },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        emptyMessage={t.common.noData} pageSize={pageSize}
      />
    </div>
  )
}
