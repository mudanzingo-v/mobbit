"use client"

import Link from "next/link"
import { useT } from "@/lib/i18n"

export default function NotFound() {
  const { t } = useT()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">{t.common.comingSoon}</p>
      <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
        {t.common.back}
      </Link>
    </div>
  )
}
