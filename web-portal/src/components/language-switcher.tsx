"use client"

import { useT } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, setLocale } = useT()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className="gap-1 text-xs"
      title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Globe className="h-3.5 w-3.5" />
      {locale === "es" ? "EN" : "ES"}
    </Button>
  )
}
