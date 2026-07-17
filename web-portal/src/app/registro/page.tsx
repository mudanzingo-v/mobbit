"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { Truck, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RegistroPage() {
  const router = useRouter()
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", company_name: "", rfc: "", postal_code: "", password: "" })

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    try { await api.registerProvider(form); setSuccess(true) }
    catch (e: any) { setError(e?.detail?.detail || e?.message || t.common.error) }
    finally { setLoading(false) }
  }

  if (success) {
    return (<div className="mx-auto max-w-md py-20 px-4 text-center"><Card><CardContent className="py-10 space-y-4"><CheckCircle className="mx-auto h-16 w-16 text-green-600" /><h2 className="text-2xl font-bold">{t.auth.registerSuccess}</h2><p className="text-muted-foreground">{t.auth.registerSuccessDesc}</p><Button onClick={() => router.push("/login")}>{t.login.adminLogin}</Button></CardContent></Card></div>)
  }

  return (
    <div className="mx-auto max-w-lg py-10 px-4">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4 mr-1" /> {t.common.back}</Link>
      <Card>
        <CardHeader className="text-center"><Truck className="mx-auto h-10 w-10 text-primary mb-2" /><CardTitle className="text-2xl">{t.auth.register}</CardTitle><CardDescription>{t.auth.registerDesc}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>{t.product.name.replace(" *", "")}</Label><Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Juan Pérez" /></div>
              <div className="col-span-2"><Label>{t.auth.companyName}</Label><Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Mudanzas Pérez" /></div>
              <div><Label>{t.saler.email}</Label><Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" /></div>
              <div><Label>{t.saler.phone}</Label><Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="5512345678" /></div>
              <div><Label>RFC</Label><Input required value={form.rfc} onChange={(e) => set("rfc", e.target.value)} placeholder="XAXX010101000" /></div>
              <div><Label>{t.wizard.postalCode}</Label><Input required value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} placeholder="01000" maxLength={5} /></div>
              <div className="col-span-2"><Label>{t.auth.password}</Label><Input required type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••••" minLength={10} /></div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>{loading ? t.common.loading : t.auth.createAccount}</Button>
            <p className="text-center text-xs text-muted-foreground">{t.auth.alreadyAccount} <Link href="/login" className="text-primary hover:underline">{t.auth.signIn}</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
