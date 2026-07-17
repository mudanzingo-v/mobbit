"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api, type Quotation } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { QuotationDialog } from "@/components/quotation-dialog"
import { useT } from "@/lib/i18n"
import { Plus, RefreshCw, Search, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary", FILLED: "outline", BIDDING: "default", AWARDED: "default", CANCELLED: "destructive",
}

export default function QuotationsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { t } = useT()
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Quotation | undefined>(undefined)
  const pageSize = 10

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-quotations", filter, debouncedSearch, page, pageSize],
    queryFn: () => api.listQuotations({ state: filter || undefined, q: debouncedSearch || undefined, limit: pageSize, offset: page * pageSize }),
  })

  function openNew() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(q: Quotation) { setEditing(q); setDialogOpen(true) }
  function onSaved() { qc.invalidateQueries({ queryKey: ["admin-quotations"] }); toast.success(t.common.edit) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.quotations}</h1><p className="text-muted-foreground text-sm">{data?.meta?.total ?? 0} {t.nav.quotations.toLowerCase()}</p></div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> {t.common.create}</Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.common.search} className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0) }}>
          <option value="">{t.product.active}</option>
          <option value="DRAFT">DRAFT</option>
          <option value="FILLED">FILLED</option>
          <option value="BIDDING">BIDDING</option>
          <option value="AWARDED">AWARDED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <DataTable<Quotation>
        columns={[
          { key: "client_name", label: t.product.name.replace(" *", ""), render: (q) => <span className="font-medium">{q.client_name || "—"}</span> },
          { key: "service_name", label: t.service.title, render: (q) => q.service_name || <span className="text-muted-foreground">—</span> },
          { key: "state", label: t.product.active, render: (q) => <Badge variant={stateColors[q.state || ""] || "secondary"}>{q.state || "—"}</Badge> },
          { key: "created_at", label: t.wizard.estimatedDate, render: (q) => new Date(q.created_at).toLocaleDateString() },
          { key: "actions", label: "", render: (q) => (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/admin/quotations/${q.id}`) }}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          ), className: "w-10 text-right" },
        ]}
        data={data?.data ?? []} meta={data?.meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(q) => router.push(`/admin/quotations/${q.id}`)}
        emptyMessage={t.common.noData} newLabel={t.common.create} pageSize={pageSize}
      />

      <QuotationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} quotation={editing} onSaved={onSaved} />
    </div>
  )
}
