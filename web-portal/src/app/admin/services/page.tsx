"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Service } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { ServiceDialog } from "@/components/service-dialog"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function ServicesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | undefined>(undefined)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-services", page, pageSize],
    queryFn: () => api.listServices({ limit: pageSize, offset: page * pageSize }),
  })

  function openNew() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(s: Service) { setEditing(s); setDialogOpen(true) }
  function onSaved() { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast.success(editing ? "Servicio actualizado" : "Servicio creado") }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Servicios</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} servicios</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
        </div>
      </div>
      <DataTable<Service>
        columns={[
          { key: "name", label: "Nombre", render: (s) => <span className="font-medium">{s.name}</span> },
          { key: "price", label: "Precio", render: (s) => <span>${(s.price ?? 0).toFixed(2)}</span> },
          { key: "active", label: "Estado", render: (s) => s.active ? <Badge variant="default">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge> },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(s) => openEdit(s)} emptyMessage="No hay servicios." newLabel="Nuevo servicio" pageSize={pageSize}
      />
      <ServiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} service={editing} onSaved={onSaved} />
    </div>
  )
}
