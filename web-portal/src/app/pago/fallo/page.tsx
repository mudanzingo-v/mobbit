"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { Suspense } from "react"
import { useT } from "@/lib/i18n"

function Content() {
  const sp = useSearchParams()
  const sessionId = sp.get("session_id") || sp.get("order_id") || ""
  const { t } = useT()

  return (
    <div className="mx-auto max-w-md py-20 px-4 text-center">
      <Card>
        <CardHeader>
          <XCircle className="mx-auto h-16 w-16 text-destructive mb-2" />
          <CardTitle className="text-2xl">{t.payment.failure}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t.payment.failureDesc}</p>
          {sessionId && <p className="text-xs text-muted-foreground font-mono">ID: {sessionId}</p>}
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              {t.common.back}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PagoFalloPage() {
  return <Suspense><Content /></Suspense>
}
