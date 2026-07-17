"use client"

import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { ArrowLeft, ArrowRight, Send, Truck } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  client_name: string; client_phone: string; client_email: string
  service_id: string; service_name: string; service_zone: string; service_date: string
  origin_adress: string; origin_postal_code: string; origin_type: string; origin_floor: string
  destination_adress: string; destination_postal_code: string; destination_type: string; destination_floor: string
  selected_products: string[]
}

const emptyForm = (): FormData => ({
  client_name: "", client_phone: "", client_email: "",
  service_id: "", service_name: "", service_zone: "Local", service_date: "",
  origin_adress: "", origin_postal_code: "", origin_type: "Casa", origin_floor: "",
  destination_adress: "", destination_postal_code: "", destination_type: "Casa", destination_floor: "",
  selected_products: [],
})

export default function CotizarPage() {
  const router = useRouter()
  const { t } = useT()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [quotationId, setQuotationId] = useState<string | null>(null)

  const { data: services } = useQuery({ queryKey: ["b2c-services"], queryFn: () => api.listB2cServices() })
  const { data: products } = useQuery({ queryKey: ["b2c-products"], queryFn: () => api.listB2cProducts() })

  function setField<K extends keyof FormData>(k: K, v: any) { setForm((f) => ({ ...f, [k]: v })) }

  const selectedService = (services ?? []).find((s: any) => s.id === form.service_id)

  function toggleProduct(productId: string) {
    setForm((f) => ({ ...f, selected_products: f.selected_products.includes(productId) ? f.selected_products.filter((id) => id !== productId) : [...f.selected_products, productId] }))
  }

  // Save current step to backend
  const saveStep = useCallback(async (targetStep: number) => {
    if (!quotationId) return

    const partial: any = { wizard_step: targetStep }
    if (targetStep >= 1) {
      partial.client_name = form.client_name
      partial.client_phone = form.client_phone
      partial.client_email = form.client_email
      partial.service_zone = form.service_zone
      partial.service_date = form.service_date || null
    }
    if (targetStep >= 2) {
      partial.service_name = selectedService?.name || form.service_name
      partial.service_type = selectedService?.name || ""
    }
    if (targetStep >= 3) {
      partial.origin_adress = form.origin_adress
      partial.origin_postal_code = form.origin_postal_code
      partial.origin_type = form.origin_type
      partial.origin_floor = form.origin_floor || null
      partial.destination_adress = form.destination_adress
      partial.destination_postal_code = form.destination_postal_code
      partial.destination_type = form.destination_type
      partial.destination_floor = form.destination_floor || null
    }

    await api.updateQuotationB2c(quotationId, partial)
  }, [quotationId, form, selectedService])

  async function handleNext() {
    setLoading(true)
    try {
      if (step === 1) {
        // Create quotation with step 1 data
        const q = await api.createQuotationB2c({
          client_name: form.client_name,
          client_phone: form.client_phone,
          client_email: form.client_email,
          service_zone: form.service_zone,
          service_date: form.service_date || null,
          wizard_step: 1,
        } as any)
        setQuotationId(q.id)
      } else {
        // Save partial progress
        await saveStep(step + 1)
      }
      setStep(step + 1)
    } catch (e: any) {
      toast.error(t.common.error, e?.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      // Final save — set state to BIDDING so providers can see it
      await api.updateQuotationB2c(quotationId!, {
        service_name: selectedService?.name || form.service_name,
        service_type: selectedService?.name || "",
        service_zone: form.service_zone,
        service_date: form.service_date || null,
        origin_adress: form.origin_adress,
        origin_postal_code: form.origin_postal_code,
        origin_type: form.origin_type,
        origin_floor: form.origin_floor || null,
        destination_adress: form.destination_adress,
        destination_postal_code: form.destination_postal_code,
        destination_type: form.destination_type,
        destination_floor: form.destination_floor || null,
        wizard_step: 7,
        wizard_complete: true,
        state: "BIDDING",
      } as any)

      toast.success(t.common.save)
      router.push(`/cotizar/${quotationId}`)
    } catch (e: any) {
      toast.error(t.common.error, e?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <Truck className="mx-auto h-10 w-10 text-primary mb-2" />
        <h1 className="text-3xl font-bold">{t.landing.cta}</h1>
        <p className="text-muted-foreground mt-1">{t.landing.title} {step} / 4</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">
          {step === 1 && t.wizard.step1}{step === 2 && t.wizard.step2}{step === 3 && t.wizard.step3}{step === 4 && t.wizard.step4}
        </CardTitle></CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>{t.wizard.clientName}</Label><Input required value={form.client_name} onChange={(e) => setField("client_name", e.target.value)} placeholder="Juan Pérez" /></div>
                <div><Label>{t.wizard.phone}</Label><Input type="tel" value={form.client_phone} onChange={(e) => setField("client_phone", e.target.value)} placeholder="5512345678" /></div>
                <div><Label>{t.wizard.email}</Label><Input type="email" value={form.client_email} onChange={(e) => setField("client_email", e.target.value)} placeholder="juan@email.com" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t.wizard.zone}</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.service_zone} onChange={(e) => setField("service_zone", e.target.value)}>
                    <option value="Local">{t.wizard.local}</option><option value="Foráneo">{t.wizard.longDistance}</option>
                  </select>
                </div>
                <div><Label>{t.wizard.estimatedDate}</Label><Input type="date" value={form.service_date} onChange={(e) => setField("service_date", e.target.value)} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div><h3 className="text-sm font-medium mb-3">{t.wizard.service}</h3>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.service_id} onChange={(e) => { const svc = (services ?? []).find((s: any) => s.id === e.target.value); setField("service_id", e.target.value); if (svc) setField("service_name", svc.name) }}>
                  <option value="">{t.wizard.selectService}</option>
                  {(services ?? []).map((s: any) => (<option key={s.id} value={s.id}>{s.name}{s.price ? ` ($${s.price})` : ""}</option>))}
                </select>
              </div>
              <div><h3 className="text-sm font-medium mb-3">{t.wizard.additionalProducts}</h3>
                {(!products || (products as any[]).length === 0) ? <p className="text-sm text-muted-foreground">{t.common.loading}</p> : (
                  <div className="grid grid-cols-2 gap-2">{(products as any[]).map((p: any) => (
                    <label key={p.id} className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer text-sm transition-colors ${form.selected_products.includes(p.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <input type="checkbox" checked={form.selected_products.includes(p.id)} onChange={() => toggleProduct(p.id)} className="h-4 w-4" />
                      <span>{p.name}{p.price ? ` ($${p.price})` : ""}</span>
                    </label>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div><h3 className="text-sm font-medium mb-3">{t.wizard.origin}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>{t.wizard.address}</Label><Input value={form.origin_adress} onChange={(e) => setField("origin_adress", e.target.value)} placeholder="Calle y número" /></div>
                  <div><Label>{t.wizard.postalCode}</Label><Input value={form.origin_postal_code} onChange={(e) => setField("origin_postal_code", e.target.value)} placeholder="01000" /></div>
                  <div><Label>{t.wizard.type}</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.origin_type} onChange={(e) => setField("origin_type", e.target.value)}>
                      <option value={t.wizard.house}>{t.wizard.house}</option><option value={t.wizard.apartment}>{t.wizard.apartment}</option>
                      <option value={t.wizard.office}>{t.wizard.office}</option><option value={t.wizard.warehouse}>{t.wizard.warehouse}</option>
                    </select>
                  </div>
                  <div><Label>{t.wizard.floor}</Label><Input value={form.origin_floor} onChange={(e) => setField("origin_floor", e.target.value)} /></div>
                </div>
              </div>
              <Separator />
              <div><h3 className="text-sm font-medium mb-3">{t.wizard.destination}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>{t.wizard.address}</Label><Input value={form.destination_adress} onChange={(e) => setField("destination_adress", e.target.value)} placeholder="Calle y número" /></div>
                  <div><Label>{t.wizard.postalCode}</Label><Input value={form.destination_postal_code} onChange={(e) => setField("destination_postal_code", e.target.value)} placeholder="01000" /></div>
                  <div><Label>{t.wizard.type}</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.destination_type} onChange={(e) => setField("destination_type", e.target.value)}>
                      <option value={t.wizard.house}>{t.wizard.house}</option><option value={t.wizard.apartment}>{t.wizard.apartment}</option>
                      <option value={t.wizard.office}>{t.wizard.office}</option><option value={t.wizard.warehouse}>{t.wizard.warehouse}</option>
                    </select>
                  </div>
                  <div><Label>{t.wizard.floor}</Label><Input value={form.destination_floor} onChange={(e) => setField("destination_floor", e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">{t.wizard.step1}</h3>
                <p>{form.client_name} {form.client_phone && `• ${form.client_phone}`}</p>
                <p className="text-muted-foreground">{form.client_email}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">{t.wizard.service}</h3>
                <p>{selectedService?.name || form.service_name} — {form.service_zone}</p>
                <p className="text-muted-foreground">{form.service_date || t.wizard.estimatedDate}</p>
                {form.selected_products.length > 0 && <><p className="text-xs text-muted-foreground mt-2">{t.wizard.additionalProducts}:</p><ul className="list-disc pl-4 text-xs text-muted-foreground">{form.selected_products.map((id) => { const p = (products ?? []).find((x: any) => x.id === id); return <li key={id}>{p?.name || id}</li> })}</ul></>}
              </div>
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <h3 className="font-medium">{t.wizard.origin} → {t.wizard.destination}</h3>
                <p>{form.origin_adress || "—"} {form.origin_floor && `(${t.wizard.floor} ${form.origin_floor})`}</p>
                <p className="text-muted-foreground">→</p>
                <p>{form.destination_adress || "—"} {form.destination_floor && `(${t.wizard.floor} ${form.destination_floor})`}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}><ArrowLeft className="h-4 w-4 mr-1" /> {t.common.back}</Button> : <div />}
            {step < 4 ? (
              <Button onClick={handleNext} disabled={(step === 1 && !form.client_name) || loading}>
                {loading ? t.common.loading : t.common.next} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? t.common.loading : t.wizard.publishQuotation} <Send className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
