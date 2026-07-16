"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive",
}

export default function ProviderAuctions() {
  const router = useRouter()
  const [filter, setFilter] = useState("")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["provider-auctions", filter],
    queryFn: () => api.listMyAuctions({ state: filter || undefined, limit: 200 }),
  })

  const auctions = data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis ofertas</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-2">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todas</option>
          <option value="PENDING">Pendientes</option>
          <option value="SELECTED">Seleccionadas</option>
          <option value="ACCEPTED">Aceptadas</option>
          <option value="PAID">Pagadas</option>
          <option value="REJECTED">Rechazadas</option>
          <option value="DECLINED">Declinadas</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : auctions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No hay ofertas.</p>
      ) : (
        <div className="space-y-2">
          {auctions.map((a) => (
            <div key={a.id} onClick={() => router.push(`/provider/auctions/${a.id}`)}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{a.quotation_id.slice(0, 12)}…</p>
                <p className="font-medium mt-0.5">${(Number(a.total) || 0).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <Badge variant={stateColors[a.state] || "secondary"}>{a.state}</Badge>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
