"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api, type Quotation, type Auction } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, XCircle, Send, Truck } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary", FILLED: "outline", BIDDING: "default", AWARDED: "default", CANCELLED: "destructive",
}

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: q, isLoading, error } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.getQuotation(id),
  })

  const publishMut = useMutation({
    mutationFn: () => api.publishQuotation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotation", id] }); toast.success("Cotización publicada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo publicar"),
  })

  const cancelMut = useMutation({
    mutationFn: () => api.cancelQuotation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotation", id] }); toast.success("Cotización cancelada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo cancelar"),
  })

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando...</div>
  if (error || !q) return <div className="p-6 text-destructive">Error al cargar la cotización</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/quotations")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{q.client_name || "Sin nombre"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={stateColors[q.state || ""] || "secondary"}>{q.state || "—"}</Badge>
            <span className="text-sm text-muted-foreground">ID: {q.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {q.state === "DRAFT" && (
            <Button size="sm" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>
              <Send className="h-4 w-4 mr-1" /> Publicar
            </Button>
          )}
          {q.state !== "CANCELLED" && (
            <Button variant="outline" size="sm" onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}>
              <XCircle className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/quotations`)}>
            <Truck className="h-4 w-4 mr-1" /> Asignar provider
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Nombre: </span>{q.client_name || "—"}</div>
            <div><span className="text-muted-foreground">Teléfono: </span>{q.client_phone || "—"}</div>
            <div><span className="text-muted-foreground">Email: </span>{q.client_email || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Servicio</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Nombre: </span>{q.service_name || "—"}</div>
            <div><span className="text-muted-foreground">Tipo: </span>{q.service_type || "—"}</div>
            <div><span className="text-muted-foreground">Zona: </span>{q.service_zone || "—"}</div>
            <div><span className="text-muted-foreground">Fecha: </span>{q.service_date || "—"}</div>
            <div><span className="text-muted-foreground">Canal venta: </span>{q.channel_sales || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Origen</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Dirección: </span>{q.origin_adress || "—"}</div>
            <div><span className="text-muted-foreground">C.P.: </span>{q.origin_postal_code || "—"}</div>
            <div><span className="text-muted-foreground">Tipo: </span>{q.origin_type || "—"}</div>
            <div><span className="text-muted-foreground">Piso: </span>{q.origin_floor || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Destino</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Dirección: </span>{q.destination_adress || "—"}</div>
            <div><span className="text-muted-foreground">C.P.: </span>{q.destination_postal_code || "—"}</div>
            <div><span className="text-muted-foreground">Tipo: </span>{q.destination_type || "—"}</div>
            <div><span className="text-muted-foreground">Piso: </span>{q.destination_floor || "—"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
