"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", SELECTED: "default", ACCEPTED: "default", PAID: "default",
  REJECTED: "outline", DECLINED: "destructive",
}

export default function ProviderAuctionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: auction, isLoading } = useQuery({
    queryKey: ["provider-auction", id],
    queryFn: () => api.getMyAuction(id),
  })

  const [counterPrice, setCounterPrice] = useState("")
  const [counterNote, setCounterNote] = useState("")

  const acceptMut = useMutation({
    mutationFn: () => api.updateMyAuction(id, { accept_admin_price: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-auction", id] }); toast.success("¡Oferta aceptada!") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo aceptar"),
  })

  const counterMut = useMutation({
    mutationFn: () => api.updateMyAuction(id, { price_load: counterPrice, provider_note: counterNote || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-auction", id] }); toast.success("Contraoferta enviada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo contraofertar"),
  })

  const declineMut = useMutation({
    mutationFn: () => api.declineMyAuction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-auction", id] }); toast.success("Oferta declinada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo declinar"),
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">Cargando...</p>
  if (!auction) return <p className="p-6 text-destructive">Oferta no encontrada</p>

  const canAct = auction.state === "PENDING"

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => router.push("/provider/auctions")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalle de oferta</h1>
          <p className="text-sm text-muted-foreground font-mono">{auction.quotation_id.slice(0, 12)}…</p>
        </div>
        <Badge variant={stateColors[auction.state] || "secondary"} className="text-sm px-3 py-1">{auction.state}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Resumen financiero</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Precio carga</p>
              <p className="text-lg font-bold">${(Number(auction.price_load) || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">${(Number(auction.total) || 0).toFixed(2)}</p>
            </div>
            {auction.admin_budget && (
              <div>
                <p className="text-xs text-muted-foreground">Presupuesto admin</p>
                <p className="text-lg font-bold text-primary">${(Number(auction.admin_budget) || 0).toFixed(2)}</p>
              </div>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><span className="text-muted-foreground">Subtotal: </span>${(Number(auction.subtotal) || 0).toFixed(2)}</div>
            <div><span className="text-muted-foreground">Comisión: </span>${(Number(auction.mobbit_fee) || 0).toFixed(2)}</div>
            <div><span className="text-muted-foreground">IVA: </span>${(Number(auction.iva) || 0).toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {canAct && (
        <Card>
          <CardHeader><CardTitle className="text-base">Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => acceptMut.mutate()} disabled={acceptMut.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {acceptMut.isPending ? "Aceptando..." : "Aceptar precio del admin"}
            </Button>

            <Separator />

            <div className="space-y-3">
              <Label>Tu contraoferta</Label>
              <Input type="number" step="0.01" placeholder="Tu precio" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} />
              <Input placeholder="Nota para el admin (opcional)" value={counterNote} onChange={(e) => setCounterNote(e.target.value)} />
              <Button variant="secondary" className="w-full" onClick={() => counterMut.mutate()} disabled={!counterPrice || counterMut.isPending}>
                {counterMut.isPending ? "Enviando..." : "Enviar contraoferta"}
              </Button>
            </div>

            <Separator />

            <Button variant="destructive" className="w-full" onClick={() => declineMut.mutate()} disabled={declineMut.isPending}>
              <XCircle className="h-4 w-4 mr-2" />
              {declineMut.isPending ? "Declinando..." : "Declinar oferta"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
