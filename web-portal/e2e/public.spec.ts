/**
 * E2E: Public pages — landing, login, 404.
 */
import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("loads and shows title", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("Mudanzas y fletes")
  })

  test("has Cotizar ahora button linking to /cotizar", async ({ page }) => {
    await page.goto("/")
    await page.click("text=Cotizar ahora")
    await expect(page).toHaveURL(/\/cotizar/)
  })

  test("has login button", async ({ page }) => {
    await page.goto("/")
    await page.click("text=Iniciar sesión")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Login page", () => {
  test("loads and shows both login options", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("text=administrador")).toBeVisible()
    await expect(page.locator("text=transportista")).toBeVisible()
  })

  test("admin login redirects to dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.fill("input", "admin-e2e")
    await page.click("text=Entrar como administrador")
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 })
  })

  test("provider login redirects to dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.fill("input", "provider-e2e")
    await page.click("text=Entrar como transportista")
    await expect(page).toHaveURL(/\/provider\/dashboard/, { timeout: 15000 })
  })
})

test.describe("404 page", () => {
  test("shows 404 for unknown routes", async ({ page }) => {
    const resp = await page.goto("/this-does-not-exist")
    expect(resp?.status()).toBe(404)
    await expect(page.locator("text=404")).toBeVisible()
  })
})
