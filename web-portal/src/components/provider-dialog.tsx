"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { api, type Provider, type Truck } from "@/lib/api"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Props { open: boolean; onClose: () => void; provider: Provider; onSaved: () => void }

export function ProviderDialog({ open, onClose, provider, onSaved }: Props) {
  const [name, setName] = useState(provider.name || "")
  const [email, setEmail] = useState(provider.email || "")
  const [phone, setPhone] = useState(provider.phone || "")
  const [rfc, setRfc] = useState(provider.rfc || "")
  const [address, setAddress] = useState(provider.address || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [trucksLoading, setTrucksLoading] = useState(false)
  const [newTruck, setNewTruck] = useState({ brand: "", model: "", year: "", plates: "", capacity_kg: "", capacity_m3: "" })
  const [addingTruck, setAddingTruck] = useState(false)

  useEffect(() => {
    setName(provider.name || ""); setEmail(provider.email || ""); setPhone(provider.phone || "")
    setRfc(provider.rfc || ""); setAddress(provider.address || ""); setError("")
    if (open && provider.id) {
      setTrucksLoading(true)
      api.listTrucks(provider.id).then(setTrucks).catch(() => {}).finally(() => setTrucksLoading(false))
    }
  }, [provider, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    try {
      await api.updateProvider(provider.id, { name, email: email || null, phone: phone || null, rfc: rfc || null, address: address || null })
      onSaved(); onClose()
    } catch (e: any) { setError(e?.message || "Error") }
    finally { setLoading(false) }
  }

  async function handleAddTruck() {
    if (!newTruck.brand) return; setAddingTruck(true)
    try {
      await api.createTruck(provider.id, {
        brand: newTruck.brand, model: newTruck.model || null, year: newTruck.year ? parseInt(newTruck.year) : null,
        plates: newTruck.plates || null, capacity_kg: newTruck.capacity_kg ? parseInt(newTruck.capacity_kg) : null,
        capacity_m3: newTruck.capacity_m3 ? parseInt(newTruck.capacity_m3) : null, active: true,
      } as any)
      setNewTruck({ brand: "", model: "", year: "", plates: "", capacity_kg: "", capacity_m3: "" })
      setTrucks(await api.listTrucks(provider.id))
      toast.success("Unidad agregada")
    } catch (e: any) { toast.error("Error", e?.message) }
    finally { setAddingTruck(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{provider.name || "Transportista"}</DialogTitle>
          <DialogDescription>ID: {provider.id}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Nombre</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Email</Label>
              <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Teléfono</Label>
              <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-rfc">RFC</Label>
              <Input id="p-rfc" value={rfc} onChange={(e) => setRfc(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-address">Dirección</Label>
            <Input id="p-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
              </DialogFooter>
            </form>

            {/* KYC section */}
            {provider.kyc_status === "SUBMITTED" && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">Verificación KYC</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    El transportista ha subido sus documentos. Revisá y aprobá o rechazá.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        try {
                          await api.approveKyc(provider.id)
                          toast.success("KYC aprobado")
                          onSaved()
                        } catch (e: any) {
                          toast.error("Error", e?.message)
                        }
                      }}
                    >
                      Aprobar KYC
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await api.rejectKyc(provider.id)
                          toast.success("KYC rechazado")
                          onSaved()
                        } catch (e: any) {
                          toast.error("Error", e?.message)
                        }
                      }}
                    >
                      Rechazar KYC
                    </Button>
                  </div>
                </div>
              </>
            )}
            {provider.kyc_status && provider.kyc_status !== "SUBMITTED" && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">KYC:</span>
                  <Badge variant={
                    provider.kyc_status === "APPROVED" ? "default" :
                    provider.kyc_status === "REJECTED" ? "destructive" : "secondary"
                  }>
                    {provider.kyc_status}
                  </Badge>
                </div>
              </>
            )}

            <Separator className="my-2" />

            <div>
              <h3 className="text-sm font-medium mb-2">Unidades ({trucks.length})</h3>
          {trucksLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <div className="space-y-2">
              {trucks.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{t.brand} {t.model} ({t.year || "—"})</span>
                  <Badge variant={t.active ? "default" : "secondary"} className="text-xs">{t.active ? "Activo" : "Inactivo"}</Badge>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Marca" value={newTruck.brand} onChange={(e) => setNewTruck({ ...newTruck, brand: e.target.value })} className="text-xs h-8" />
                <Input placeholder="Modelo" value={newTruck.model} onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })} className="text-xs h-8" />
                <Input placeholder="Año" value={newTruck.year} onChange={(e) => setNewTruck({ ...newTruck, year: e.target.value })} className="text-xs h-8 w-20" />
                <Button size="sm" variant="outline" onClick={handleAddTruck} disabled={addingTruck || !newTruck.brand}><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
