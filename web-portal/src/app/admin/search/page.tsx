"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api, type Quotation } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/lib/i18n"
import { Search, ExternalLink } from "lucide-react"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary", FILLED: "outline", BIDDING: "default", AWARDED: "default", CANCELLED: "destructive",
}

export default function AdminSearchPage() {
  const router = useRouter()
  const { t } = useT()
  const [query, setQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-search", query],
    queryFn: () => api.listQuotations({ q: query, limit: 50, offset: 0 }),
    enabled: query.length > 0,
  })

  const results = data?.data ?? []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{t.nav.search}</h1>
        <p className="text-muted-foreground text-sm">{t.common.search}</p>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>
      {!query && <p className="text-sm text-muted-foreground py-8 text-center">{t.common.search}</p>}
      {query && isLoading && <p className="text-sm text-muted-foreground">{t.common.loading}</p>}
      {query && !isLoading && results.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">{t.common.noData}</p>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{results.length} resultado(s)</p>
          {results.map((q: Quotation) => (
            <div key={q.id} onClick={() => router.push(`/admin/quotations/${q.id}`)}
              className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="space-y-1">
                <p className="font-medium">{q.client_name || "—"}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{q.client_email || "—"}</span>
                  <span>{q.client_phone || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={stateColors[q.state || ""] || "secondary"}>{q.state || "—"}</Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
