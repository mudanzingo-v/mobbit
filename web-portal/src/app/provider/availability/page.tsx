"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function ProviderAvailabilityPage() {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState("")
  const [available, setAvailable] = useState(true)

  const { data: availability, isLoading, refetch } = useQuery({
    queryKey: ["provider-availability"],
    queryFn: () => api.getMyAvailability(),
  })

  const setMut = useMutation({
    mutationFn: () => {
      if (!selectedDate) throw new Error("Seleccioná una fecha")
      const slotsList = slots.split(",").map((s) => s.trim()).filter(Boolean)
      return api.setMyAvailability({ target_date: selectedDate, available, slots: slotsList.length > 0 ? slotsList : undefined })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-availability"] })
      toast.success("Disponibilidad guardada")
      setSelectedDate("")
      setSlots("")
    },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo guardar"),
  })

  const items = availability ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi disponibilidad</h1>
          <p className="text-muted-foreground text-sm">Marcá los días y horarios en que podés trabajar.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Agregar disponibilidad</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Horarios (opcional)</Label>
              <Input
                placeholder="09:00, 10:00, 11:00..."
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separados por coma. Si no se especifica, se toma el día completo.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="available" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="available">Disponible</Label>
            </div>
            <Button
              className="w-full"
              onClick={() => setMut.mutate()}
              disabled={!selectedDate || setMut.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {setMut.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Disponibilidad registrada</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : items.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No registraste disponibilidad todavía.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {items.map((item: any) => (
                  <div key={item.id || item.date} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{item.date}</p>
                      {item.slots && item.slots.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.slots.join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
