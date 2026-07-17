"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { RefreshCw } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive",
}

export default function ProviderAuctions() {
  const router = useRouter()
  const { t } = useT()
  const [filter, setFilter] = useState("")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["provider-auctions", filter],
    queryFn: () => api.listMyAuctions({ state: filter || undefined, limit: 200 }),
  })

  const auctions = data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.nav.auctions}</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <div className="flex items-center gap-2">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">{t.product.active}</option>
          <option value="PENDING">PENDING</option>
          <option value="SELECTED">SELECTED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="PAID">PAID</option>
          <option value="REJECTED">REJECTED</option>
          <option value="DECLINED">DECLINED</option>
        </select>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        : auctions.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">{t.common.noData}</p>
        : <div className="space-y-2">{auctions.map((a) => (
            <div key={a.id} onClick={() => router.push(`/provider/auctions/${a.id}`)}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div><p className="font-mono text-xs text-muted-foreground">{a.quotation_id.slice(0, 12)}…</p><p className="font-medium mt-0.5">${(Number(a.total) || 0).toFixed(2)}</p></div>
              <div className="text-right"><Badge variant={stateColors[a.state] || "secondary"}>{a.state}</Badge><p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p></div>
            </div>
          ))}</div>
      }
    </div>
  )
}
