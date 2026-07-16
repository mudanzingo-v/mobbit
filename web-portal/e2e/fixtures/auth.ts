/**
 * Auth helpers for e2e tests.
 *
 * Mobbit uses NextAuth v5 with a dev-credentials provider.
 * Tests log in by filling the username field and clicking the role button.
 */

import type { Page } from "@playwright/test"

export async function loginAsAdmin(page: Page, username = "admin-test") {
  await page.goto("/login")
  await page.fill("input", username)
  await page.click("text=Entrar como administrador")
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 })
}

export async function loginAsProvider(page: Page, username = "dev-provider") {
  await page.goto("/login")
  await page.fill("input", username)
  await page.click("text=Entrar como transportista")
  await page.waitForURL(/\/provider\/dashboard/, { timeout: 15000 })
}

export async function login(page: Page, role: "admin" | "provider", username?: string) {
  if (role === "admin") return loginAsAdmin(page, username)
  return loginAsProvider(page, username)
}
