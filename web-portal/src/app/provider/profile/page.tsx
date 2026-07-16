"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProviderProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["provider-profile"],
    queryFn: () => api.getMyProfile(),
  })

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>
  if (!profile) return <p className="text-destructive">Error al cargar perfil</p>

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-3xl font-bold">Mi perfil</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos del transportista</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{profile.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p>{profile.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p>{profile.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">RFC</p>
              <p>{profile.rfc || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge variant={profile.active ? "default" : "secondary"}>{profile.active ? "Activo" : "Inactivo"}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p>{profile.address || "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
