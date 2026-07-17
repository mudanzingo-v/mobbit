"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Auction } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive", CANCELLED: "destructive",
}

export default function AuctionsPage() {
  const qc = useQueryClient()
  const { t } = useT()
  const [page, setPage] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Auction | null>(null)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-auctions", page, pageSize],
    queryFn: () => api.listAuctions({ limit: pageSize, offset: page * pageSize }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteAuction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-auctions"] }); toast.success(t.common.delete); setDetailOpen(false) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  function openDetail(a: Auction) { setSelected(a); setDetailOpen(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.auctions}</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} {t.nav.auctions.toLowerCase()}</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <DataTable<Auction>
        columns={[
          { key: "id", label: "ID", render: (a) => <code className="text-xs">{a.id.slice(0, 8)}…</code> },
          { key: "provider_id", label: t.nav.providers, render: (a) => <span className="font-medium">{a.provider_id.slice(0, 12)}…</span> },
          { key: "total", label: t.product.price, render: (a) => <span>${(Number(a.total) || 0).toFixed(2)}</span> },
          { key: "state", label: t.product.active, render: (a) => <Badge variant={stateColors[a.state] || "secondary"}>{a.state}</Badge> },
          { key: "created_at", label: t.wizard.estimatedDate, render: (a) => new Date(a.created_at).toLocaleDateString() },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(a) => openDetail(a)} emptyMessage={t.common.noData} pageSize={pageSize}
      />

      <Dialog open={detailOpen} onOpenChange={(v) => !v && setDetailOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.nav.auctions}</DialogTitle><DialogDescription>ID: {selected?.id}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">{t.nav.quotations}:</span> <code>{selected.quotation_id.slice(0, 12)}…</code></div>
                <div><span className="text-muted-foreground">{t.nav.providers}:</span> <code>{selected.provider_id.slice(0, 12)}…</code></div>
                <div><span className="text-muted-foreground">{t.product.active}:</span> <Badge variant={stateColors[selected.state] || "secondary"}>{selected.state}</Badge></div>
                <div><span className="text-muted-foreground">{t.product.price}:</span> ${(Number(selected.total) || 0).toFixed(2)}</div>
              </div>
              <div className="border-t pt-2 grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground">{t.product.name}:</span> ${(Number(selected.subtotal) || 0).toFixed(2)}</div>
                <div><span className="text-muted-foreground">{t.service.title}:</span> ${(Number(selected.mobbit_fee) || 0).toFixed(2)}</div>
                <div><span className="text-muted-foreground">IVA:</span> ${(Number(selected.iva) || 0).toFixed(2)}</div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(selected.id)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? t.common.loading : t.common.delete}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
