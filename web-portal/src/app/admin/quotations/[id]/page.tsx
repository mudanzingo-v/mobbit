"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api, type Quotation, type Auction } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/lib/i18n"
import { ArrowLeft, CheckCircle, XCircle, Send, Truck } from "lucide-react"
import { toast } from "sonner"

const stateColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary", FILLED: "outline", BIDDING: "default", AWARDED: "default", CANCELLED: "destructive",
}

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const { t } = useT()

  const { data: q, isLoading, error } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.getQuotation(id),
  })

  const publishMut = useMutation({
    mutationFn: () => api.publishQuotation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotation", id] }); toast.success(t.common.edit) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  const cancelMut = useMutation({
    mutationFn: () => api.cancelQuotation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotation", id] }); toast.success(t.common.delete) },
    onError: (e: any) => toast.error(t.common.error, e?.message),
  })

  if (isLoading) return <div className="p-6 text-muted-foreground">{t.common.loading}</div>
  if (error || !q) return <div className="p-6 text-destructive">{t.common.error}</div>

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/quotations")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> {t.common.back}
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{q.client_name || "—"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={stateColors[q.state || ""] || "secondary"}>{q.state || "—"}</Badge>
            <span className="text-sm text-muted-foreground">ID: {q.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {q.state === "DRAFT" && <Button size="sm" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}><Send className="h-4 w-4 mr-1" /> {t.common.submit}</Button>}
          {q.state !== "CANCELLED" && <Button variant="outline" size="sm" onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}><XCircle className="h-4 w-4 mr-1" /> {t.common.delete}</Button>}
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/quotations`)}><Truck className="h-4 w-4 mr-1" /> {t.nav.providers}</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t.wizard.step1}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t.product.name.replace(" *", "")}: </span>{q.client_name || "—"}</div>
            <div><span className="text-muted-foreground">{t.saler.phone}: </span>{q.client_phone || "—"}</div>
            <div><span className="text-muted-foreground">{t.saler.email}: </span>{q.client_email || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t.service.title}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t.product.name.replace(" *", "")}: </span>{q.service_name || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.type}: </span>{q.service_type || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.zone}: </span>{q.service_zone || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.estimatedDate}: </span>{q.service_date || "—"}</div>
            <div><span className="text-muted-foreground">{t.common.search}: </span>{q.channel_sales || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t.wizard.origin}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t.wizard.address}: </span>{q.origin_adress || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.postalCode}: </span>{q.origin_postal_code || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.type}: </span>{q.origin_type || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.floor}: </span>{q.origin_floor || "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t.wizard.destination}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t.wizard.address}: </span>{q.destination_adress || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.postalCode}: </span>{q.destination_postal_code || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.type}: </span>{q.destination_type || "—"}</div>
            <div><span className="text-muted-foreground">{t.wizard.floor}: </span>{q.destination_floor || "—"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
