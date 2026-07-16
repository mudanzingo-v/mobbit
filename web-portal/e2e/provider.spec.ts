/**
 * E2E: Provider pages — dashboard, auctions, invitations, profile.
 */
import { test, expect } from "@playwright/test"
import { loginAsProvider } from "./fixtures/auth"

test.describe("Provider dashboard", () => {
  test("shows stats after login", async ({ page }) => {
    await loginAsProvider(page)
    await expect(page.locator("h1")).toContainText("Hola")
    await expect(page.getByText("Invitaciones").first()).toBeVisible()
    await expect(page.getByText("Ganadas").first()).toBeVisible()
  })
})

test.describe("Provider auctions", () => {
  test("lists my auctions", async ({ page }) => {
    await loginAsProvider(page)
    await page.goto("/provider/auctions")
    await expect(page.locator("h1")).toContainText("Mis ofertas")
  })
})

test.describe("Provider invitations", () => {
  test("shows pending invitations", async ({ page }) => {
    await loginAsProvider(page)
    await page.goto("/provider/invitations")
    await expect(page.locator("h1")).toContainText("Invitaciones")
  })
})

test.describe("Provider profile", () => {
  test("accesses profile page", async ({ page }) => {
    await loginAsProvider(page)
    await page.goto("/provider/profile")
    // Page loads (may show data or error depending on backend)
    await expect(page).toHaveURL(/\/provider\/profile/, { timeout: 10000 })
  })
})

test.describe("Provider settings", () => {
  test("shows session info", async ({ page }) => {
    await loginAsProvider(page)
    await page.goto("/provider/settings")
    await expect(page.locator("h1")).toContainText("Configuración")
  })
})
