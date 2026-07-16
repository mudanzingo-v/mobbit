import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Mobbit
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/cotizar" className="text-sm text-muted-foreground hover:text-foreground">
              Cotizar
            </Link>
            <Link href="/login">
              <Button variant="default" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Mudanzas y fletes{' '}
            <span className="text-primary">simples y seguros</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Cotiza tu mudanza en minutos, recibe ofertas de transportistas verificados
            y paga de forma segura. SPEI, OXXO o tarjeta.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/cotizar">
              <Button size="lg" className="text-base">
                Cotizar ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base">
                Soy transportista
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Mobbit. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
