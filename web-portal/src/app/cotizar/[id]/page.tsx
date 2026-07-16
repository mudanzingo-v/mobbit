"use client"

import { use, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Building2, DollarSign, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function CotizarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "cash">("card")

  const { data: q, isLoading: qLoading } = useQuery({
    queryKey: ["b2c-quotation", id],
    queryFn: () => api.getQuotationB2c(id),
  })

  const { data: auctions, isLoading: aLoading } = useQuery({
    queryKey: ["b2c-auctions", id],
    queryFn: () => api.listB2cAuctions(id),
    enabled: !!q,
  })

  const selectMut = useMutation({
    mutationFn: () => {
      if (!selectedAuction) throw new Error("No auction selected")
      return api.selectB2cAuction(id, selectedAuction, false, paymentMethod)
    },
    onSuccess: (data: any) => {
      const url = data?.url
      if (url) {
        window.location.href = url
      } else {
        toast.success("Oferta seleccionada")
        router.push(`/pago/exito?quotation=${id}`)
      }
    },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo seleccionar"),
  })

  const isLoading = qLoading || aLoading
  const pendingAuctions = (auctions ?? []).filter((a: any) => a.state === "PENDING")

  if (isLoading) return <div className="mx-auto max-w-2xl py-10 px-4 text-muted-foreground">Cargando...</div>
  if (!q) return <div className="mx-auto max-w-2xl py-10 px-4 text-destructive">Cotización no encontrada</div>

  return (
    <div className="mx-auto max-w-2xl py-10 px-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Tu cotización</h1>
        <p className="text-muted-foreground">{q.client_name} • {q.origin_adress || "—"} → {q.destination_adress || "—"}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalles del servicio</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Tipo: </span>{q.service_type || "—"}</div>
          <div><span className="text-muted-foreground">Zona: </span>{q.service_zone || "—"}</div>
          <div><span className="text-muted-foreground">Origen: </span>{q.origin_adress || "—"}</div>
          <div><span className="text-muted-foreground">Destino: </span>{q.destination_adress || "—"}</div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Ofertas de transportistas
          {pendingAuctions.length > 0 && <Badge variant="default" className="ml-2">{pendingAuctions.length}</Badge>}
        </h2>

        {pendingAuctions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Aún no hay ofertas para esta cotización. Volvé más tarde.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingAuctions.map((a: any) => (
              <div
                key={a.id}
                onClick={() => setSelectedAuction(a.id)}
                className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedAuction === a.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Transportista</p>
                    <p className="font-mono text-sm">{a.provider_id.slice(0, 12)}…</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">${(Number(a.total) || 0).toFixed(2)}</p>
                  </div>
                </div>
                {selectedAuction === a.id && <CheckCircle className="h-5 w-5 text-primary ml-auto mt-1" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingAuctions.length > 0 && selectedAuction && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-3">Método de pago</h3>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-medium">Tarjeta</span>
              </button>
              <button onClick={() => setPaymentMethod("bank_transfer")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <Building2 className="h-6 w-6" />
                <span className="text-xs font-medium">SPEI</span>
              </button>
              <button onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${paymentMethod === "cash" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <DollarSign className="h-6 w-6" />
                <span className="text-xs font-medium">OXXO</span>
              </button>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={() => selectMut.mutate()} disabled={selectMut.isPending}>
            {selectMut.isPending ? "Procesando..." : `Pagar $${(Number((auctions ?? []).find((a: any) => a.id === selectedAuction)?.total) || 0).toFixed(2)}`}
          </Button>
        </>
      )}
    </div>
  )
}
