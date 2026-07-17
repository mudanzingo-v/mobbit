"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Stats } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { t } = useT()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reports, setReports] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          api.getStats(),
          api.getReports().catch(() => null),
        ])
        setStats(s)
        setReports(r)
      } catch (e: any) {
        setError(e?.message || t.common.error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t.common.error])

  const chartData = stats ? [
    { name: t.dashboard.quotations, value: stats.quotations },
    { name: t.dashboard.activeAuctions, value: stats.auctions },
    { name: t.dashboard.providers, value: stats.providers },
    { name: t.nav.products, value: stats.products },
    { name: t.nav.services, value: stats.services },
    { name: t.nav.salers, value: stats.salers },
  ] : []

  const auctionStateData = reports?.auctions?.by_state
    ? Object.entries(reports.auctions.by_state).map(([name, value]: any) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.nav.dashboard}</h1>
          <p className="text-muted-foreground mt-1">
            {t.dashboard.welcome}, {session?.user?.name || "admin"}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent><div className="h-8 w-16 bg-muted animate-pulse rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t.dashboard.quotations} value={stats?.quotations ?? "—"} />
            <StatCard label={t.dashboard.activeAuctions} value={stats?.auctions ?? "—"} />
            <StatCard label={t.dashboard.providers} value={stats?.providers ?? "—"} />
            <StatCard label={t.nav.products} value={stats?.products ?? "—"} />
            <StatCard label={t.nav.services} value={stats?.services ?? "—"} />
            <StatCard label={t.nav.inventory} value={stats?.inventory_items ?? "—"} />
            <StatCard label={t.nav.salers} value={stats?.salers ?? "—"} />
            <StatCard label={t.nav.payments} value={stats?.payments ?? "—"} />
          </div>

          {chartData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">{t.reports.title}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {auctionStateData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">{t.reports.auctionsByState}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={auctionStateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {auctionStateData.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
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
