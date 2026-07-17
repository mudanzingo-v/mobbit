"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/lib/i18n"

export default function ProviderProfile() {
  const { t } = useT()
  const { data: profile, isLoading } = useQuery({
    queryKey: ["provider-profile"],
    queryFn: () => api.getMyProfile(),
  })

  if (isLoading) return <p className="text-muted-foreground">{t.common.loading}</p>
  if (!profile) return <p className="text-destructive">{t.common.error}</p>

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-3xl font-bold">{t.nav.profile}</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">{t.nav.profile}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">{t.product.name.replace(" *", "")}</p><p className="font-medium">{profile.name || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.saler.email}</p><p>{profile.email || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.saler.phone}</p><p>{profile.phone || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">RFC</p><p>{profile.rfc || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">{t.product.active}</p><Badge variant={profile.active ? "default" : "secondary"}>{profile.active ? t.product.active : t.product.inactive}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
