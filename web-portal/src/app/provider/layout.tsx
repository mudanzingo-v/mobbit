"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Gavel,
  Mail,
  User,
  Settings,
  LogOut,
  Menu,
  FileText,
  Calendar,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/invitations", label: "Invitaciones", icon: Mail },
  { href: "/provider/auctions", label: "Mis ofertas", icon: Gavel },
  { href: "/provider/kyc", label: "Verificación KYC", icon: FileText },
  { href: "/provider/availability", label: "Disponibilidad", icon: Calendar },
  { href: "/provider/profile", label: "Perfil", icon: User },
  { href: "/provider/settings", label: "Configuración", icon: Settings },
]

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "flex flex-col border-r bg-muted/30 transition-all duration-200",
          sidebarOpen ? "w-60" : "w-0 -ml-60"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/provider/dashboard" className="text-lg font-bold text-primary">
            Mobbit Proveedor
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-2">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {session?.user?.name || "Transportista"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {session?.user?.name || "Transportista"}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
