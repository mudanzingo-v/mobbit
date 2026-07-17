/**
 * Minimal middleware — only public route pass-through.
 * Auth is handled client-side via NextAuth's SessionProvider.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
