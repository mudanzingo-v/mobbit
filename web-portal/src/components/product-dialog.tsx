"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { api, type Product } from "@/lib/api"

interface ProductFormData {
  name: string
  description: string
  sku: string
  price: number | null
  active: boolean
}

function toForm(p?: Product): ProductFormData {
  return {
    name: p?.name || "",
    description: p?.description || "",
    sku: p?.sku || "",
    price: p?.price ?? null,
    active: p?.active ?? true,
  }
}

function toApi(f: ProductFormData) {
  return {
    name: f.name,
    description: f.description || null,
    sku: f.sku || null,
    price: f.price,
    active: f.active,
  }
}

interface Props {
  open: boolean
  onClose: () => void
  product?: Product
  onSaved: () => void
}

export function ProductDialog({ open, onClose, product, onSaved }: Props) {
  const [form, setForm] = useState<ProductFormData>(toForm(product))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!product

  useEffect(() => {
    setForm(toForm(product))
    setError("")
  }, [product, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = toApi(form)
      if (isEditing) {
        await api.updateProduct(product!.id, data)
      } else {
        await api.createProduct(data as any)
      }
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e?.message || "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modificá los datos del producto." : "Agregá un nuevo producto al catálogo."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
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
