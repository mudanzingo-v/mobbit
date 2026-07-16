"use client"

import { use, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function RateServicePage({ params }: { params: Promise<{ auctionId: string }> }) {
  const { auctionId } = use(params)
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [comment, setComment] = useState("")

  const rateMut = useMutation({
    mutationFn: () => api.rateAuction(auctionId, score, comment || undefined),
    onSuccess: () => {
      toast.success("¡Gracias por tu calificación!")
      router.push("/")
    },
    onError: (e: any) => toast.error("Error", e?.message || "No se pudo calificar"),
  })

  return (
    <div className="mx-auto max-w-lg py-16 px-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Calificá tu servicio</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            ¿Cómo fue tu experiencia con el transportista?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star rating */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoverScore || score)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          {score > 0 && (
            <p className="text-center text-sm font-medium">
              {score === 1 && "Muy malo"}
              {score === 2 && "Malo"}
              {score === 3 && "Regular"}
              {score === 4 && "Bueno"}
              {score === 5 && "¡Excelente!"}
            </p>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comentario (opcional)</label>
            <Textarea
              placeholder="Contanos cómo fue tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => rateMut.mutate()}
            disabled={score === 0 || rateMut.isPending}
          >
            {rateMut.isPending ? "Enviando..." : "Enviar calificación"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
