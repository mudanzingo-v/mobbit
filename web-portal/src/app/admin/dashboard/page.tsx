"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Stats } from "@/lib/api"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getStats()
        setStats(data)
      } catch (e: any) {
        setError(e?.message || "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido, {session?.user?.name || "admin"}
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard label="Cotizaciones" value={stats?.quotations ?? "—"} />
            <StatCard label="Ofertas" value={stats?.auctions ?? "—"} />
            <StatCard label="Transportistas" value={stats?.providers ?? "—"} />
            <StatCard label="Productos" value={stats?.products ?? "—"} />
            <StatCard label="Servicios" value={stats?.services ?? "—"} />
            <StatCard label="Inventario" value={stats?.inventory_items ?? "—"} />
            <StatCard label="Vendedores" value={stats?.salers ?? "—"} />
            <StatCard label="Pagos" value={stats?.payments ?? "—"} />
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
