"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import { RefreshCw, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function ProviderQuotationsPage() {
  const router = useRouter()
  const { t } = useT()
  const qc = useQueryClient()
  const [bidDialog, setBidDialog] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [bidPrice, setBidPrice] = useState("")
  const [bidNote, setBidNote] = useState("")

  const { data: quotations, isLoading, refetch } = useQuery({
    queryKey: ["provider-quotations"],
    queryFn: () => api.listQuotationsForBidding(),
  })

  const items = quotations ?? []

  const bidMut = useMutation({
    mutationFn: () => {
      if (!selectedId || !bidPrice) throw new Error("Select quotation and enter price")
      return api.submitBid(selectedId, { price_load: parseFloat(bidPrice), provider_note: bidNote || undefined })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-quotations"] }); setBidDialog(false); setBidPrice(""); setBidNote(""); toast.success(t.common.save) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  function openBid(id: string) { setSelectedId(id); setBidDialog(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">{t.nav.quotations}</h1><p className="text-muted-foreground text-sm">{items.length} disponibles</p></div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">{t.common.loading}</p>
        : items.length === 0 ? <p className="text-muted-foreground py-8 text-center">{t.common.noData}</p>
        : <div className="grid gap-3 md:grid-cols-2">{items.map((q: any) => (
            <Card key={q.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openBid(q.id)}>
              <CardHeader><CardTitle className="text-base">{q.client_name}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="text-muted-foreground">{t.wizard.service}:</span> {q.service_name || "—"}</p>
                <p><span className="text-muted-foreground">{t.wizard.zone}:</span> {q.service_zone || "—"}</p>
                <p><span className="text-muted-foreground">{t.wizard.origin}:</span> {q.origin_type || "—"} CP {q.origin_postal_code || "—"}</p>
                <p><span className="text-muted-foreground">{t.wizard.destination}:</span> {q.destination_type || "—"} CP {q.destination_postal_code || "—"}</p>
                <div className="pt-2"><Button size="sm"><DollarSign className="h-4 w-4 mr-1" /> {t.common.create}</Button></div>
              </CardContent>
            </Card>
          ))}</div>
      }

      <Dialog open={bidDialog} onOpenChange={(v) => !v && setBidDialog(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.common.create}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>{t.product.price}</Label><Input type="number" step="0.01" placeholder="0.00" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} /></div>
            <div><Label>{t.product.description}</Label><Input placeholder={t.product.description} value={bidNote} onChange={(e) => setBidNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialog(false)}>{t.common.cancel}</Button>
            <Button onClick={() => bidMut.mutate()} disabled={!bidPrice || bidMut.isPending}>{bidMut.isPending ? t.common.loading : t.common.submit}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
