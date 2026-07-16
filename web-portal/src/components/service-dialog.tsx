"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { api, type Service } from "@/lib/api"

interface FormData { name: string; description: string; price: number | null; active: boolean }
const toForm = (s?: Service): FormData => ({ name: s?.name || "", description: s?.description || "", price: s?.price ?? null, active: s?.active ?? true })
const toApi = (f: FormData) => ({ name: f.name, description: f.description || null, price: f.price, active: f.active })

interface Props { open: boolean; onClose: () => void; service?: Service; onSaved: () => void }

export function ServiceDialog({ open, onClose, service, onSaved }: Props) {
  const [form, setForm] = useState<FormData>(toForm(service))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!service

  useEffect(() => { setForm(toForm(service)); setError("") }, [service, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    try {
      if (isEditing) await api.updateService(service!.id, toApi(form))
      else await api.createService(toApi(form) as any)
      onSaved(); onClose()
    } catch (e: any) { setError(e?.message || "Error") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          <DialogDescription>Completá los datos del servicio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio ($)</Label>
            <Input id="price" type="number" step="0.01" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : null })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descripción</Label>
            <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
