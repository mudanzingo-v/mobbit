"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Saler } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { SalerDialog } from "@/components/saler-dialog"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function SalersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Saler | undefined>(undefined)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-salers", page, pageSize],
    queryFn: () => api.listSalers({ limit: pageSize, offset: page * pageSize }),
  })

  function openNew() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(s: Saler) { setEditing(s); setDialogOpen(true) }
  function onSaved() { qc.invalidateQueries({ queryKey: ["admin-salers"] }); toast.success(editing ? "Vendedor actualizado" : "Vendedor creado") }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Vendedores</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} vendedores</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
        </div>
      </div>
      <DataTable<Saler>
        columns={[
          { key: "name", label: "Nombre", render: (s) => <span className="font-medium">{s.name}</span> },
          { key: "email", label: "Email", render: (s) => s.email || <span className="text-muted-foreground">—</span> },
          { key: "commission", label: "Comisión", render: (s) => s.commission_pct ? <span>{s.commission_pct}%</span> : <span className="text-muted-foreground">—</span> },
          { key: "active", label: "Estado", render: (s) => s.active ? <Badge variant="default">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge> },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(s) => openEdit(s)} emptyMessage="No hay vendedores." newLabel="Nuevo vendedor" pageSize={pageSize}
      />
      <SalerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} saler={editing} onSaved={onSaved} />
    </div>
  )
}
