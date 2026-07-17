"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { RefreshCw } from "lucide-react"

export default function ProviderInvitations() {
  const router = useRouter()
  const { t } = useT()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["provider-invitations"],
    queryFn: () => api.listMyAuctions({ state: "PENDING", limit: 200 }),
  })

  const invitations = data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.invitations}</h1><p className="text-muted-foreground text-sm">{invitations.length} {t.nav.invitations.toLowerCase()}</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        : invitations.length === 0 ? <div className="py-16 text-center"><p className="text-muted-foreground">{t.common.noData}</p></div>
        : <div className="space-y-2">{invitations.map((a) => (
            <div key={a.id} onClick={() => router.push(`/provider/auctions/${a.id}`)}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div><p className="font-mono text-xs text-muted-foreground">{t.nav.quotations} {a.quotation_id.slice(0, 10)}…</p><p className="font-medium mt-0.5">{t.product.price}: ${(Number(a.admin_budget) || Number(a.total) || 0).toFixed(2)}</p></div>
              <div className="text-right"><Badge variant="secondary">PENDING</Badge><p className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleDateString()}</p></div>
            </div>
          ))}</div>
      }
    </div>
  )
}
