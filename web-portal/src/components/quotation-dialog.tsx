"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { api, type Quotation } from "@/lib/api"

interface FormData {
  client_name: string; client_phone: string; client_email: string
  service_name: string; service_type: string; service_zone: string; service_hour: string; service_date: string
  channel_sales: string; id_saler: string
  origin_postal_code: string; origin_adress: string; origin_type: string; origin_floor: string
  destination_postal_code: string; destination_adress: string; destination_type: string; destination_floor: string
}

const emptyForm = (): FormData => ({
  client_name: "", client_phone: "", client_email: "",
  service_name: "", service_type: "", service_zone: "", service_hour: "", service_date: "",
  channel_sales: "", id_saler: "",
  origin_postal_code: "", origin_adress: "", origin_type: "", origin_floor: "",
  destination_postal_code: "", destination_adress: "", destination_type: "", destination_floor: "",
})

const toForm = (q?: Quotation): FormData => q ? {
  client_name: q.client_name || "", client_phone: q.client_phone || "", client_email: q.client_email || "",
  service_name: q.service_name || "", service_type: q.service_type || "", service_zone: q.service_zone || "",
  service_hour: q.service_hour || "", service_date: q.service_date || "",
  channel_sales: q.channel_sales || "", id_saler: q.id_saler || "",
  origin_postal_code: q.origin_postal_code || "", origin_adress: q.origin_adress || "",
  origin_type: q.origin_type || "", origin_floor: q.origin_floor || "",
  destination_postal_code: q.destination_postal_code || "", destination_adress: q.destination_adress || "",
  destination_type: q.destination_type || "", destination_floor: q.destination_floor || "",
} : emptyForm()

interface Props { open: boolean; onClose: () => void; quotation?: Quotation; onSaved: () => void }

export function QuotationDialog({ open, onClose, quotation, onSaved }: Props) {
  const [form, setForm] = useState<FormData>(toForm(quotation))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!quotation

  useEffect(() => { setForm(toForm(quotation)); setError("") }, [quotation, open])

  function set<K extends keyof FormData>(k: K, v: string) { setForm({ ...form, [k]: v }) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    try {
      const body = { ...form, id_saler: form.id_saler || null, wizard_complete: false }
      if (isEditing) await api.updateQuotation(quotation!.id, body)
      else await api.createQuotation(body as any)
      onSaved(); onClose()
    } catch (e: any) { setError(e?.message || "Error") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cotización" : "Nueva cotización"}</DialogTitle>
          <DialogDescription>Completá los datos de la cotización.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nombre *</Label><Input required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} /></div>
              <div><Label>Teléfono</Label><Input value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} /></div>
              <div className="col-span-2"><Label>Email</Label><Input type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} /></div>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Servicio</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nombre</Label><Input value={form.service_name} onChange={(e) => set("service_name", e.target.value)} /></div>
              <div><Label>Tipo</Label><Input value={form.service_type} onChange={(e) => set("service_type", e.target.value)} /></div>
              <div><Label>Zona</Label><Input value={form.service_zone} onChange={(e) => set("service_zone", e.target.value)} /></div>
              <div><Label>Fecha</Label><Input type="date" value={form.service_date} onChange={(e) => set("service_date", e.target.value)} /></div>
              <div><Label>Hora</Label><Input type="time" value={form.service_hour} onChange={(e) => set("service_hour", e.target.value)} /></div>
              <div><Label>Canal venta</Label><Input value={form.channel_sales} onChange={(e) => set("channel_sales", e.target.value)} /></div>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Origen</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Dirección</Label><Input value={form.origin_adress} onChange={(e) => set("origin_adress", e.target.value)} /></div>
              <div><Label>C.P.</Label><Input value={form.origin_postal_code} onChange={(e) => set("origin_postal_code", e.target.value)} /></div>
              <div><Label>Tipo</Label><Input value={form.origin_type} onChange={(e) => set("origin_type", e.target.value)} /></div>
              <div><Label>Piso</Label><Input value={form.origin_floor} onChange={(e) => set("origin_floor", e.target.value)} /></div>
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Destino</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Dirección</Label><Input value={form.destination_adress} onChange={(e) => set("destination_adress", e.target.value)} /></div>
              <div><Label>C.P.</Label><Input value={form.destination_postal_code} onChange={(e) => set("destination_postal_code", e.target.value)} /></div>
              <div><Label>Tipo</Label><Input value={form.destination_type} onChange={(e) => set("destination_type", e.target.value)} /></div>
              <div><Label>Piso</Label><Input value={form.destination_floor} onChange={(e) => set("destination_floor", e.target.value)} /></div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
