import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import { TranslationProvider } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mobbit — Mudanzas y fletes en México",
  description:
    "Sistema de cotización y adjudicación de mudanzas y fletes. Conectamos clientes con transportistas verificados.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TranslationProvider>
            <Providers>
              {children}
            </Providers>
          </TranslationProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
