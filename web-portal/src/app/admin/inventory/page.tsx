"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type InventoryCategory, type InventoryItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import { Plus, RefreshCw, Package } from "lucide-react"
import { toast } from "sonner"

export default function InventoryPage() {
  const qc = useQueryClient()
  const { t } = useT()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [catDialog, setCatDialog] = useState(false)
  const [itemDialog, setItemDialog] = useState(false)
  const [catName, setCatName] = useState("")
  const [itemForm, setItemForm] = useState({ name: "", length: "", width: "", height: "", weight: "" })

  const { data: cats } = useQuery({ queryKey: ["admin-inventory-cats"], queryFn: () => api.listInventoryCategories({ limit: 100, offset: 0 }) })
  const { data: items, refetch: refetchItems } = useQuery({
    queryKey: ["admin-inventory-items", selectedCat],
    queryFn: () => selectedCat ? api.listInventoryItems(selectedCat, { limit: 100, offset: 0 }) : Promise.resolve({ data: [], meta: { total: 0, limit: 100, offset: 0, hasNext: false } }),
    enabled: !!selectedCat,
  })

  const createCat = useMutation({
    mutationFn: (name: string) => api.createInventoryCategory({ name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-inventory-cats"] }); setCatDialog(false); setCatName(""); toast.success(t.common.create) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  const createItem = useMutation({
    mutationFn: (data: Parameters<typeof api.createInventoryItem>[1]) => { if (!selectedCat) throw new Error("No category"); return api.createInventoryItem(selectedCat, data) },
    onSuccess: () => { refetchItems(); setItemDialog(false); setItemForm({ name: "", length: "", width: "", height: "", weight: "" }); toast.success(t.common.create) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  const categories = cats?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t.nav.inventory}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { qc.invalidateQueries({ queryKey: ["admin-inventory-cats"] }); refetchItems() }}><RefreshCw className="h-4 w-4" /></Button>
          <Button size="sm" onClick={() => { setCatName(""); setCatDialog(true) }}><Plus className="h-4 w-4 mr-1" /> {t.nav.inventory}</Button>
          {selectedCat && <Button size="sm" variant="outline" onClick={() => { setItemForm({ name: "", length: "", width: "", height: "", weight: "" }); setItemDialog(true) }}><Plus className="h-4 w-4 mr-1" /> {t.common.create}</Button>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t.nav.inventory}</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {categories.length === 0 && <p className="text-sm text-muted-foreground">{t.common.noData}</p>}
            {categories.map((c) => (
              <button key={c.id} onClick={() => setSelectedCat(c.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedCat === c.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                {c.name} <span className="ml-2 text-xs text-muted-foreground">({c.active ? t.product.active.toLowerCase() : t.product.inactive.toLowerCase()})</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">{t.common.create}</CardTitle></CardHeader>
          <CardContent>
            {!selectedCat && <p className="text-sm text-muted-foreground">{t.common.search}</p>}
            {selectedCat && (!items?.data || items.data.length === 0) && (
              <div className="py-10 text-center"><Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">{t.common.noData}</p></div>
            )}
            {items?.data && items.data.length > 0 && (
              <div className="space-y-2">{items.data.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div><span className="font-medium">{item.name}</span><div className="text-xs text-muted-foreground mt-0.5">{item.length && `${item.length}cm`} {item.width && `× ${item.width}cm`} {item.height && `× ${item.height}cm`} {item.weight && `(${item.weight}kg)`}</div></div>
                  <Badge variant={item.active ? "default" : "secondary"} className="text-xs">{item.active ? t.product.active : t.product.inactive}</Badge>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={catDialog} onOpenChange={(v) => !v && setCatDialog(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.nav.inventory}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2"><Label>{t.product.name.replace(" *", "")}</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ej: Cajas, Muebles..." /></div>
          <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>{t.common.cancel}</Button><Button onClick={() => createCat.mutate(catName)} disabled={!catName || createCat.isPending}>{t.common.save}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialog} onOpenChange={(v) => !v && setItemDialog(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.common.create}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>{t.product.name.replace(" *", "")}</Label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-4 gap-2">
              <div><Label>{t.wizard.origin}</Label><Input value={itemForm.length} onChange={(e) => setItemForm({ ...itemForm, length: e.target.value })} placeholder="cm" /></div>
              <div><Label>{t.wizard.destination}</Label><Input value={itemForm.width} onChange={(e) => setItemForm({ ...itemForm, width: e.target.value })} placeholder="cm" /></div>
              <div><Label>{t.product.price}</Label><Input value={itemForm.height} onChange={(e) => setItemForm({ ...itemForm, height: e.target.value })} placeholder="cm" /></div>
              <div><Label>{t.kyc.upload}</Label><Input value={itemForm.weight} onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })} placeholder="kg" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setItemDialog(false)}>{t.common.cancel}</Button>
            <Button onClick={() => createItem.mutate({ name: itemForm.name, length: itemForm.length ? parseFloat(itemForm.length) : null, width: itemForm.width ? parseFloat(itemForm.width) : null, height: itemForm.height ? parseFloat(itemForm.height) : null, weight: itemForm.weight ? parseFloat(itemForm.weight) : null, active: true, url_image: null } as any)} disabled={!itemForm.name || createItem.isPending}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
