"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { Suspense } from "react"

function Content() {
  const sp = useSearchParams()
  const sessionId = sp.get("session_id") || sp.get("order_id") || ""

  return (
    <div className="mx-auto max-w-md py-20 px-4 text-center">
      <Card>
        <CardHeader>
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-2" />
          <CardTitle className="text-2xl">¡Pago exitoso!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tu pago fue procesado correctamente. El transportista se pondrá en contacto para coordinar el servicio.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground font-mono">ID: {sessionId}</p>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PagoExitoPage() {
  return <Suspense><Content /></Suspense>
}
