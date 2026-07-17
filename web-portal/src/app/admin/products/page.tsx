"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { ProductDialog } from "@/components/product-dialog"
import { useT } from "@/lib/i18n"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function ProductsPage() {
  const qc = useQueryClient()
  const { t } = useT()
  const [page, setPage] = useState(0)
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | undefined>(undefined)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-products", page, pageSize],
    queryFn: () => api.listProducts({ limit: pageSize, offset: page * pageSize }),
  })

  const products = (data?.data ?? []).filter((p) => showInactive || p.active)
  const meta = data?.meta

  function openNew() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(p: Product) { setEditing(p); setDialogOpen(true) }
  function onSaved() { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success(editing ? t.common.edit : t.common.create) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.product.title}</h1>
          <p className="text-muted-foreground text-sm">{meta?.total ?? 0} {t.product.title.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="h-3.5 w-3.5" />
            {t.product.inactive}
          </label>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> {t.common.create}</Button>
        </div>
      </div>

      <DataTable<Product>
        columns={[
          { key: "name", label: t.product.name.replace(" *", ""), render: (p) => <span className="font-medium">{p.name}</span> },
          { key: "sku", label: t.product.sku, render: (p) => p.sku ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.sku}</code> : <span className="text-muted-foreground">—</span> },
          { key: "price", label: t.product.price, render: (p) => <span>${(p.price ?? 0).toFixed(2)}</span> },
          { key: "active", label: t.product.active, render: (p) => p.active ? <Badge variant="default">{t.product.active}</Badge> : <Badge variant="secondary">{t.product.inactive}</Badge> },
        ]}
        data={products} meta={meta}
        loading={isLoading} error={error instanceof Error ? error.message : ""}
        onRetry={() => refetch()} onPageChange={(offset) => setPage(Math.floor(offset / pageSize))}
        onRowClick={(p) => openEdit(p)}
        emptyMessage={t.product.noProducts} newLabel={t.product.create} pageSize={pageSize}
      />

      <ProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} product={editing} onSaved={onSaved} />
    </div>
  )
}
