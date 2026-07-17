"use client"

import Link from "next/link"
import { useT } from "@/lib/i18n"

export default function StubPage() {
  const { t } = useT()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 text-3xl font-bold">{t.common.comingSoon}</h1>
      <p className="mb-8 text-muted-foreground">{t.common.noData}</p>
      <Link href="/" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80">
        {t.common.back}
      </Link>
    </div>
  )
}
