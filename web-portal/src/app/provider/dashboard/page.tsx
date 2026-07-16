"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox, Gavel, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive",
}

export default function ProviderDashboard() {
  const profile = useQuery({ queryKey: ["provider-profile"], queryFn: () => api.getMyProfile() })
  const auctions = useQuery({ queryKey: ["provider-auctions"], queryFn: () => api.listMyAuctions({ limit: 500 }) })

  const items = auctions.data ?? []
  const stats = {
    invitations: items.filter((a) => a.state === "PENDING").length,
    won: items.filter((a) => a.state === "SELECTED" || a.state === "ACCEPTED" || a.state === "PAID").length,
    totalRevenue: items.filter((a) => a.state === "SELECTED" || a.state === "ACCEPTED" || a.state === "PAID").reduce((s, a) => s + (Number(a.total) || 0), 0),
  }
  const pendingItems = items.filter((a) => a.state === "PENDING")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hola, {profile.data?.name ?? "Transportista"}</h1>
        <p className="text-muted-foreground">{profile.data?.email ?? "Cargando..."}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invitaciones</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.invitations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.won}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invitaciones pendientes</CardTitle>
          <Link href="/provider/invitations" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {auctions.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : pendingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenés invitaciones pendientes.</p>
          ) : (
            <div className="space-y-2">
              {pendingItems.slice(0, 5).map((a) => (
                <Link key={a.id} href={`/provider/auctions/${a.id}`}
                  className="block rounded-md border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Cotización</p>
                      <p className="font-mono text-sm">{a.quotation_id.slice(0, 8)}…</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Presupuesto</p>
                      <p className="text-lg font-bold">${(Number(a.admin_budget) || Number(a.total) || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
