"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { api, type Saler } from "@/lib/api"

interface FormData { name: string; email: string; phone: string; commission_pct: number | null; active: boolean }
const toForm = (s?: Saler): FormData => ({ name: s?.name || "", email: s?.email || "", phone: s?.phone || "", commission_pct: s?.commission_pct ?? null, active: s?.active ?? true })
const toApi = (f: FormData) => ({ name: f.name, email: f.email || null, phone: f.phone || null, commission_pct: f.commission_pct, active: f.active })

interface Props { open: boolean; onClose: () => void; saler?: Saler; onSaved: () => void }

export function SalerDialog({ open, onClose, saler, onSaved }: Props) {
  const [form, setForm] = useState<FormData>(toForm(saler))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!saler

  useEffect(() => { setForm(toForm(saler)); setError("") }, [saler, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    try {
      if (isEditing) await api.updateSaler(saler!.id, toApi(form))
      else await api.createSaler(toApi(form) as any)
      onSaved(); onClose()
    } catch (e: any) { setError(e?.message || "Error") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar vendedor" : "Nuevo vendedor"}</DialogTitle>
          <DialogDescription>Completá los datos del vendedor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Comisión (%)</Label>
            <Input id="commission" type="number" step="0.01" value={form.commission_pct ?? ""} onChange={(e) => setForm({ ...form, commission_pct: e.target.value ? parseFloat(e.target.value) : null })} />
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
