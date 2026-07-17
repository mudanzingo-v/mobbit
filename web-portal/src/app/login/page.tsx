"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard"
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useT()

  async function handleLogin(pool: string) {
    if (!username.trim()) { setError(t.common.error); return }
    setLoading(true); setError("")
    try {
      const result = await signIn("dev-credentials", { username: username.trim(), pool, redirect: false })
      if (result?.error) { setError(t.auth.loginError); return }
      const defaultTarget = pool === "rccm" ? "/admin/dashboard" : "/provider/dashboard"
      const target = callbackUrl && (
        (pool === "rccm" && callbackUrl.startsWith("/admin")) ||
        (pool === "providers" && callbackUrl.startsWith("/provider"))
      ) ? callbackUrl : defaultTarget
      router.push(target)
      router.refresh()
    } catch { setError(t.auth.connectionError) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.login.title}</CardTitle>
          <CardDescription>{t.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t.login.username}</Label>
            <Input id="username" placeholder={t.login.usernamePlaceholder} value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && username.trim()) handleLogin("rccm") }} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handleLogin("rccm")} disabled={loading}>
              {loading ? t.common.loading : t.login.adminLogin}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleLogin("providers")} disabled={loading}>
              {t.login.providerLogin}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">{t.login.devMode}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
