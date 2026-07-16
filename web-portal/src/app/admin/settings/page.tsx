"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Sesión</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Usuario: </span>{session?.user?.name || "—"}</div>
          <div><span className="text-muted-foreground">Pool: </span>{session?.pool || "—"}</div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4 mr-1" /> Cerrar sesión
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">API</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">URL: </span>{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765"}</div>
          <div><span className="text-muted-foreground">Auth: </span>Dev mode</div>
        </CardContent>
      </Card>
    </div>
  )
}
