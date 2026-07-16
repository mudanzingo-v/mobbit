"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { ArrowLeft, ArrowRight, Send, Truck } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  client_name: string; client_phone: string; client_email: string
  service_name: string; service_type: string; service_zone: string; service_date: string
  origin_adress: string; origin_postal_code: string; origin_type: string; origin_floor: string
  destination_adress: string; destination_postal_code: string; destination_type: string; destination_floor: string
}

const emptyForm = (): FormData => ({
  client_name: "", client_phone: "", client_email: "",
  service_name: "Mudanza", service_type: "Residencial", service_zone: "Local", service_date: "",
  origin_adress: "", origin_postal_code: "", origin_type: "Casa", origin_floor: "",
  destination_adress: "", destination_postal_code: "", destination_type: "Casa", destination_floor: "",
})

export default function CotizarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [loading, setLoading] = useState(false)

  function set<K extends keyof FormData>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setLoading(true)
    try {
      const q = await api.createQuotationB2c({
        ...form, wizard_step: 7, wizard_complete: true, state: "FILLED",
      } as any)
      toast.success("Cotización creada")
      router.push(`/cotizar/${q.id}`)
    } catch (e: any) {
      toast.error("Error", e?.message || "No se pudo crear la cotización")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <Truck className="mx-auto h-10 w-10 text-primary mb-2" />
        <h1 className="text-3xl font-bold">Cotizá tu mudanza</h1>
        <p className="text-muted-foreground mt-1">Paso {step} de 3</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 && "Tus datos"}
            {step === 2 && "Origen y destino"}
            {step === 3 && "Confirmar cotización"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Nombre completo *</Label><Input required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Juan Pérez" /></div>
                <div><Label>Teléfono</Label><Input type="tel" value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} placeholder="5512345678" /></div>
                <div><Label>Email</Label><Input type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} placeholder="juan@email.com" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tipo de servicio</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.service_type} onChange={(e) => set("service_type", e.target.value)}>
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Oficina">Oficina</option>
                  </select>
                </div>
                <div><Label>Zona</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.service_zone} onChange={(e) => set("service_zone", e.target.value)}>
                    <option value="Local">Local</option>
                    <option value="Foráneo">Foráneo</option>
                  </select>
                </div>
                <div><Label>Fecha estimada</Label><Input type="date" value={form.service_date} onChange={(e) => set("service_date", e.target.value)} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Origen</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Dirección</Label><Input value={form.origin_adress} onChange={(e) => set("origin_adress", e.target.value)} placeholder="Calle y número" /></div>
                  <div><Label>C.P.</Label><Input value={form.origin_postal_code} onChange={(e) => set("origin_postal_code", e.target.value)} placeholder="01000" /></div>
                  <div><Label>Tipo</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.origin_type} onChange={(e) => set("origin_type", e.target.value)}>
                      <option value="Casa">Casa</option><option value="Departamento">Departamento</option>
                      <option value="Oficina">Oficina</option><option value="Bodega">Bodega</option>
                    </select>
                  </div>
                  <div><Label>Piso</Label><Input value={form.origin_floor} onChange={(e) => set("origin_floor", e.target.value)} /></div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-3">Destino</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Dirección</Label><Input value={form.destination_adress} onChange={(e) => set("destination_adress", e.target.value)} placeholder="Calle y número" /></div>
                  <div><Label>C.P.</Label><Input value={form.destination_postal_code} onChange={(e) => set("destination_postal_code", e.target.value)} placeholder="01000" /></div>
                  <div><Label>Tipo</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.destination_type} onChange={(e) => set("destination_type", e.target.value)}>
                      <option value="Casa">Casa</option><option value="Departamento">Departamento</option>
                      <option value="Oficina">Oficina</option><option value="Bodega">Bodega</option>
                    </select>
                  </div>
                  <div><Label>Piso</Label><Input value={form.destination_floor} onChange={(e) => set("destination_floor", e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">Datos del cliente</h3>
                <p>{form.client_name} {form.client_phone && `• ${form.client_phone}`}</p>
                <p className="text-muted-foreground">{form.client_email}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">Servicio</h3>
                <p>{form.service_type} — {form.service_zone}</p>
                <p className="text-muted-foreground">{form.service_date || "Fecha flexible"}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">Origen → Destino</h3>
                <p>{form.origin_adress || "—"} {form.origin_floor && `(Piso ${form.origin_floor})`}</p>
                <p className="text-muted-foreground">→</p>
                <p>{form.destination_adress || "—"} {form.destination_floor && `(Piso ${form.destination_floor})`}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.client_name}>
                Siguiente <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Enviando..." : "Publicar cotización"} <Send className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
