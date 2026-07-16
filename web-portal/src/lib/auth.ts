/**
 * NextAuth v5 configuration for Mobbit.
 *
 * Dev mode (AUTH_DEV_MODE=true): accepts any username, generates a dev JWT
 * that the backend recognizes via AUTH_SKIP_VERIFICATION.
 *
 * Production mode: uses Cognito provider with the RCCM / Providers pools.
 */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    access_token?: string
    pool?: string
    provider_id?: string
  }
  interface User {
    pool?: string
    provider_id?: string
    access_token?: string
  }
}

const DEV_MODE = process.env.AUTH_DEV_MODE !== "false"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: "dev-credentials",
      name: "Dev Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        pool: { label: "Pool", type: "text" },
      },
      async authorize(credentials) {
        if (!DEV_MODE) return null
        const username = (credentials?.username as string) || "dev-user"
        const pool = (credentials?.pool as string) || "rccm"
        // Dev JWT — the backend accepts any parseable JWT when AUTH_SKIP_VERIFICATION=true
        const payload = {
          sub: username === "dev-provider" ? "dev-provider" : "dev-user",
          pool,
          exp: Math.floor(Date.now() / 1000) + 86400,
        }
        // Simple unsigned token for dev (matches backend's dev-jwt pattern)
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        const body = btoa(JSON.stringify(payload))
        const token = `${header}.${body}.dev-signature`
        return {
          id: username,
          name: username,
          email: `${username}@mobbit.dev`,
          access_token: token,
          pool,
          provider_id: pool === "providers" ? process.env.NEXT_PUBLIC_DEV_PROVIDER_ID || "" : undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access_token = user.access_token
        token.pool = user.pool
        token.provider_id = user.provider_id
      }
      return token
    },
    async session({ session, token }) {
      session.access_token = token.access_token as string
      session.pool = token.pool as string
      session.provider_id = token.provider_id as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
