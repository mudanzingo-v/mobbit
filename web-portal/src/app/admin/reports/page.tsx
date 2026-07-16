"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api.getReports(),
  })

  const reports = data as any

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar reportes
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><div className="h-4 w-32 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent><div className="h-8 w-20 bg-muted animate-pulse rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : reports ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cotizaciones totales</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reports.quotations?.total ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Providers activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reports.providers?.active ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reports.providers?.kyc_approved ?? 0} KYC aprobados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${(reports.revenue?.total_mxn ?? 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aceptación providers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{reports.auctions?.provider_acceptance_rate_pct ?? 0}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Cotizaciones (últimos 30 días)</CardTitle></CardHeader>
              <CardContent>
                {reports.quotations?.by_state_last_30d &&
                Object.keys(reports.quotations.by_state_last_30d).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(reports.quotations.by_state_last_30d).map(([state, count]: any) => (
                      <div key={state} className="flex items-center justify-between text-sm">
                        <span>{state}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos en los últimos 30 días</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Ofertas por estado</CardTitle></CardHeader>
              <CardContent>
                {reports.auctions?.by_state &&
                Object.keys(reports.auctions.by_state).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(reports.auctions.by_state).map(([state, count]: any) => (
                      <div key={state} className="flex items-center justify-between text-sm">
                        <span>{state}</span>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin ofertas registradas</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Ingresos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">${(reports.revenue?.total_mxn ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Últimos 30 días</p>
                  <p className="text-2xl font-bold">${(reports.revenue?.last_30_days_mxn ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
