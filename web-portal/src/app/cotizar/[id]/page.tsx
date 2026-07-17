"use client"

import { use, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/lib/i18n"
import { ArrowLeft, CreditCard, Building2, DollarSign, CheckCircle } from "lucide-react"
import { InvoiceSection } from "@/components/invoice-section"
import { toast } from "sonner"

export default function CotizarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useT()
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "cash">("card")

  const { data: q, isLoading: qLoading } = useQuery({ queryKey: ["b2c-quotation", id], queryFn: () => api.getQuotationB2c(id) })
  const { data: auctions, isLoading: aLoading } = useQuery({ queryKey: ["b2c-auctions", id], queryFn: () => api.listB2cAuctions(id), enabled: !!q })

  const selectMut = useMutation({
    mutationFn: () => { if (!selectedAuction) throw new Error("No auction"); return api.selectB2cAuction(id, selectedAuction, false, paymentMethod) },
    onSuccess: (data: any) => {
      const url = data?.url
      if (url) window.location.href = url
      else { toast.success(t.common.save); router.push(`/pago/exito?quotation=${id}`) }
    },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  const isLoading = qLoading || aLoading
  const allBids = (auctions ?? []).filter((a: any) => a.state !== "REJECTED")
  const pendingBids = allBids.filter((a: any) => a.state === "PENDING")
  const selected = (auctions ?? []).find((a: any) => a.id === selectedAuction)

  if (isLoading) return <div className="mx-auto max-w-2xl py-10 px-4 text-muted-foreground">{t.common.loading}</div>
  if (!q) return <div className="mx-auto max-w-2xl py-10 px-4 text-destructive">{t.common.error}</div>

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")}><ArrowLeft className="h-4 w-4 mr-1" /> {t.common.back}</Button>
      <div>
        <h1 className="text-3xl font-bold">{t.quotation.title}</h1>
        <p className="text-muted-foreground">{q.client_name} • {q.origin_adress || "—"} → {q.destination_adress || "—"}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{t.quotation.details}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">{t.wizard.type}: </span>{q.service_type || "—"}</div>
          <div><span className="text-muted-foreground">{t.wizard.zone}: </span>{q.service_zone || "—"}</div>
          <div><span className="text-muted-foreground">{t.wizard.origin}: </span>{q.origin_adress || "—"}</div>
          <div><span className="text-muted-foreground">{t.wizard.destination}: </span>{q.destination_adress || "—"}</div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">{t.quotation.offers} <Badge variant="default" className="ml-2">{pendingBids.length}</Badge></h2>

        {allBids.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">{t.quotation.noOffers}</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {allBids.map((a: any) => (
              <div key={a.id} onClick={() => a.state === "PENDING" && setSelectedAuction(a.id)}
                className={`rounded-lg border p-4 transition-colors ${a.state === "PENDING" ? "cursor-pointer" : "opacity-70"} ${selectedAuction === a.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.nav.providers}</p>
                    <p className="font-mono text-sm">{a.provider_id.slice(0, 12)}…</p>
                    {a.provider_note && <p className="text-xs text-muted-foreground mt-1 italic">"{a.provider_note}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t.product.price}</p>
                    <p className="text-2xl font-bold text-primary">${(Number(a.total) || 0).toFixed(2)}</p>
                    {selectedAuction === a.id && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        {t.common.save}: ${((Number(a.total) || 0) * 0.05).toFixed(2)} (5%)
                      </p>
                    )}
                  </div>
                </div>
                {a.state !== "PENDING" && <Badge variant={a.state === "SELECTED" ? "default" : "secondary"} className="mt-2">{a.state}</Badge>}
                {selectedAuction === a.id && <CheckCircle className="h-5 w-5 text-primary ml-auto mt-1" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-3">{t.payment.card}</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <CreditCard className="h-6 w-6" /><span className="text-xs font-medium">{t.payment.card}</span>
              </button>
              <button onClick={() => setPaymentMethod("bank_transfer")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <Building2 className="h-6 w-6" /><span className="text-xs font-medium">{t.payment.spei}</span>
              </button>
              <button onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "cash" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <DollarSign className="h-6 w-6" /><span className="text-xs font-medium">{t.payment.oxxo}</span>
              </button>
            </div>

            <Card className="bg-muted/30 mb-4">
              <CardContent className="py-3 text-sm space-y-1">
                <div className="flex justify-between"><span>{t.product.price} del transportista:</span><span>${(Number(selected.total) || 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-medium text-primary"><span>{t.common.save} (5%):</span><span>${((Number(selected.total) || 0) * 0.05).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Restante a pagar al transportista:</span><span>${((Number(selected.total) || 0) * 0.95).toFixed(2)}</span></div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => selectMut.mutate()} disabled={selectMut.isPending}>
              {selectMut.isPending ? t.common.loading : `${t.payment.pay} $${((Number(selected.total) || 0) * 0.05).toFixed(2)} (5%)`}
            </Button>
          </div>

          <Separator />
          <InvoiceSection quotationId={id} />
        </>
      )}
    </div>
  )
}
