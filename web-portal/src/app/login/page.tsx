"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard"
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(pool: string) {
    if (!username.trim()) { setError("Ingresa un nombre de usuario"); return }
    setLoading(true); setError("")
    try {
      const result = await signIn("dev-credentials", { username: username.trim(), pool, redirect: false })
      if (result?.error) { setError("Error al iniciar sesión"); return }
          const defaultTarget = pool === "rccm" ? "/admin/dashboard" : "/provider/dashboard"
          // Only use callbackUrl if it matches the user's role prefix
          const target = callbackUrl && (
            (pool === "rccm" && callbackUrl.startsWith("/admin")) ||
            (pool === "providers" && callbackUrl.startsWith("/provider"))
          ) ? callbackUrl : defaultTarget
          router.push(target)
      router.refresh()
    } catch { setError("Error de conexión") }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Mobbit</CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" placeholder="Tu nombre de usuario" value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && username.trim()) handleLogin("rccm") }} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handleLogin("rccm")} disabled={loading}>
              {loading ? "Entrando..." : "Entrar como administrador"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleLogin("providers")} disabled={loading}>
              Entrar como transportista
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Modo desarrollo — cualquier usuario es válido</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
