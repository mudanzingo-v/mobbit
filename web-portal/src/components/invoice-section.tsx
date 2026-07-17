"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props { quotationId: string }

export function InvoiceSection({ quotationId }: Props) {
  const [rfc, setRfc] = useState("")
  const [invoice, setInvoice] = useState<any>(null)

  const captureMut = useMutation({
    mutationFn: () => api.captureInvoice(quotationId, rfc),
    onSuccess: (data: any) => { setInvoice(data); toast.success("Factura creada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo crear la factura"),
  })

  const stampMut = useMutation({
    mutationFn: () => api.stampInvoice(invoice?.id),
    onSuccess: (data: any) => { setInvoice((prev: any) => ({ ...prev, ...data })); toast.success("Factura timbrada") },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo timbrar"),
  })

  const cancelMut = useMutation({
    mutationFn: () => api.cancelInvoice(invoice?.id),
    onSuccess: () => { toast.success("Factura cancelada"); setInvoice(null) },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo cancelar"),
  })

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Factura CFDI</h2>

      {!invoice && (
        <Card>
          <CardContent className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Generá tu factura electrónica. Necesitás tu RFC.
            </p>
            <div className="space-y-2">
              <Label>RFC</Label>
              <Input
                placeholder="XAXX010101000"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                maxLength={13}
              />
            </div>
            <Button
              onClick={() => captureMut.mutate()}
              disabled={rfc.length < 12 || captureMut.isPending}
            >
              {captureMut.isPending ? "Creando..." : "Crear factura"}
            </Button>
          </CardContent>
        </Card>
      )}

      {invoice && (
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Factura {invoice.id.slice(0, 8)}…</p>
                <Badge variant={invoice.status === "STAMPED" ? "default" : "secondary"}>
                  {invoice.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                {invoice.xml_url && (
                  <a href={invoice.xml_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Download className="h-4 w-4" /> XML
                  </a>
                )}
                {invoice.pdf_url && (
                  <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Download className="h-4 w-4" /> PDF
                  </a>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              {invoice.status === "PENDING" && (
                <Button size="sm" onClick={() => stampMut.mutate()} disabled={stampMut.isPending}>
                  {stampMut.isPending ? "Timbrando..." : "Timbrar factura"}
                </Button>
              )}
              {(invoice.status === "PENDING" || invoice.status === "STAMPED") && (
                <Button size="sm" variant="destructive" onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}>
                  {cancelMut.isPending ? "Cancelando..." : "Cancelar factura"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
