"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function VerifyContent() {
  const sp = useSearchParams()
  const token = sp.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de verificación no encontrado.")
      return
    }
    api.verifyEmail(token)
      .then(() => {
        setStatus("success")
        setMessage("Tu email fue verificado correctamente.")
      })
      .catch((e: any) => {
        setStatus("error")
        setMessage(e?.detail?.message || e?.message || "El token es inválido o expiró.")
      })
  }, [token])

  return (
    <div className="mx-auto max-w-md py-20 px-4 text-center">
      <Card>
        <CardContent className="py-10 space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground">Verificando tu email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
              <h2 className="text-2xl font-bold">¡Email verificado!</h2>
              <p className="text-muted-foreground">{message}</p>
              <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Iniciar sesión
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-bold">Error de verificación</h2>
              <p className="text-muted-foreground">{message}</p>
              <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted">
                Volver al inicio
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyContent /></Suspense>
}
