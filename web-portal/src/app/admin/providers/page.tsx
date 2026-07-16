"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api, type Provider } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { ProviderDialog } from "@/components/provider-dialog"
import { RefreshCw } from "lucide-react"

export default function ProvidersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Provider | null>(null)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-providers", page, pageSize],
    queryFn: () => api.listProviders({ limit: pageSize, offset: page * pageSize }),
  })

  function openEdit(p: Provider) { setSelected(p); setDialogOpen(true) }
  function onSaved() { qc.invalidateQueries({ queryKey: ["admin-providers"] }); setDialogOpen(false) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Transportistas</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} transportistas</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <DataTable<Provider>
        columns={[
          { key: "name", label: "Nombre", render: (p) => <span className="font-medium">{p.name || "—"}</span> },
          { key: "email", label: "Email", render: (p) => p.email || <span className="text-muted-foreground">—</span> },
          { key: "phone", label: "Teléfono", render: (p) => p.phone || <span className="text-muted-foreground">—</span> },
          { key: "active", label: "Estado", render: (p) => p.active ? <Badge variant="default">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge> },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(p) => openEdit(p)} emptyMessage="No hay transportistas." pageSize={pageSize}
      />
      {selected && <ProviderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} provider={selected} onSaved={onSaved} />}
    </div>
  )
}
