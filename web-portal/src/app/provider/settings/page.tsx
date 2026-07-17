"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useT } from "@/lib/i18n"
import { LogOut } from "lucide-react"

export default function ProviderSettings() {
  const { data: session } = useSession()
  const { t } = useT()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t.nav.settings}</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">{t.nav.settings}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">{t.login.username}: </span>{session?.user?.name || "—"}</div>
          <div><span className="text-muted-foreground">{t.nav.provider}: </span>{session?.pool || "—"}</div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4 mr-1" /> {t.common.logout}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
