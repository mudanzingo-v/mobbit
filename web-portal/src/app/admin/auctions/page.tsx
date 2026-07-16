"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Auction } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive", CANCELLED: "destructive",
}

export default function AuctionsPage() {
  const qc = useQueryClient()
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-auctions"] }); toast.success("Oferta eliminada"); setDetailOpen(false) },
    onError: (e: any) => toast.error("Error", e?.message),
  })

  function openDetail(a: Auction) { setSelected(a); setDetailOpen(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Ofertas</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} ofertas</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <DataTable<Auction>
        columns={[
          { key: "id", label: "ID", render: (a) => <code className="text-xs">{a.id.slice(0, 8)}…</code> },
          { key: "provider_id", label: "Provider", render: (a) => <span className="font-medium">{a.provider_id.slice(0, 12)}…</span> },
          { key: "total", label: "Total", render: (a) => <span>${(Number(a.total) || 0).toFixed(2)}</span> },
          { key: "state", label: "Estado", render: (a) => <Badge variant={stateColors[a.state] || "secondary"}>{a.state}</Badge> },
          { key: "created_at", label: "Creada", render: (a) => new Date(a.created_at).toLocaleDateString() },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(a) => openDetail(a)} emptyMessage="No hay ofertas." pageSize={pageSize}
      />

      <Dialog open={detailOpen} onOpenChange={(v) => !v && setDetailOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de oferta</DialogTitle>
            <DialogDescription>ID: {selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Cotización:</span> <code>{selected.quotation_id.slice(0, 12)}…</code></div>
                <div><span className="text-muted-foreground">Provider:</span> <code>{selected.provider_id.slice(0, 12)}…</code></div>
                <div><span className="text-muted-foreground">Estado:</span> <Badge variant={stateColors[selected.state] || "secondary"}>{selected.state}</Badge></div>
                <div><span className="text-muted-foreground">Total:</span> ${(Number(selected.total) || 0).toFixed(2)}</div>
              </div>
              <div className="border-t pt-2 grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground">Subtotal:</span> ${(Number(selected.subtotal) || 0).toFixed(2)}</div>
                <div><span className="text-muted-foreground">Comisión:</span> ${(Number(selected.mobbit_fee) || 0).toFixed(2)}</div>
                <div><span className="text-muted-foreground">IVA:</span> ${(Number(selected.iva) || 0).toFixed(2)}</div>
              </div>
              {selected.admin_budget && <div className="text-xs"><span className="text-muted-foreground">Presupuesto admin:</span> ${(Number(selected.admin_budget) || 0).toFixed(2)}</div>}
              <div className="flex gap-2 pt-2">
                <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(selected.id)} disabled={deleteMut.isPending}>
                  {deleteMut.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
