"use client"

import { use, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useT } from "@/lib/i18n"
import { Star, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function RateServicePage({ params }: { params: Promise<{ auctionId: string }> }) {
  const { auctionId } = use(params)
  const router = useRouter()
  const { t } = useT()
  const [score, setScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [comment, setComment] = useState("")

  const rateMut = useMutation({
    mutationFn: () => api.rateAuction(auctionId, score, comment || undefined),
    onSuccess: () => { toast.success(t.common.save); router.push("/") },
    onError: (e: any) => toast.error(t.common.error, e?.message || "Error"),
  })

  const labels = ["", t.common.error, t.product.inactive, t.common.noData, t.product.active, t.auth.emailVerified]

  return (
    <div className="mx-auto max-w-lg py-16 px-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-6"><ArrowLeft className="h-4 w-4 mr-1" /> {t.common.back}</Button>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.payment.success}</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">{t.payment.successDesc}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onMouseEnter={() => setHoverScore(star)} onMouseLeave={() => setHoverScore(0)} onClick={() => setScore(star)} className="p-1 transition-transform hover:scale-110">
                <Star className={`h-10 w-10 ${star <= (hoverScore || score) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          {score > 0 && <p className="text-center text-sm font-medium">{labels[score] || ""}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.product.description}</label>
            <Textarea placeholder={t.product.description} value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </div>
          <Button className="w-full" size="lg" onClick={() => rateMut.mutate()} disabled={score === 0 || rateMut.isPending}>
            {rateMut.isPending ? t.common.loading : t.common.submit}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
