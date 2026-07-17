/**
 * i18n — Translation provider, hook, and utilities.
 *
 * Uses a React context with localStorage-persisted language preference.
 * No URL restructuring needed — keeps current routes intact.
 */
"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import es from "./es"
import en from "./en"
import type { Dictionary } from "./es"

export type Locale = "es" | "en"

const dictionaries: Record<Locale, Dictionary> = { es, en }

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nContextType>({
  locale: "es",
  setLocale: () => {},
  t: es,
})

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es")

  useEffect(() => {
    const stored = localStorage.getItem("mobbit-locale") as Locale | null
    if (stored === "en" || stored === "es") setLocaleState(stored)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("mobbit-locale", newLocale)
  }, [])

  const t = dictionaries[locale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
