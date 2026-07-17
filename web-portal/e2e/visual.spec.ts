/**
 * E2E: Visual regression tests — Phase 4.
 *
 * Takes screenshots of key pages for visual comparison.
 */
import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./fixtures/auth"

test.describe("Visual — Landing page", () => {
  test("full page desktop screenshot", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-desktop.png", { fullPage: true })
  })

  test("mobile viewport screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await expect(page.locator("h1")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-mobile.png", { fullPage: true })
  })
})

test.describe("Visual — Admin", () => {
  test("dashboard page screenshot", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/dashboard")
    await expect(page.locator("h1")).toBeVisible()
    await page.waitForTimeout(1000) // wait for stats to load
    await expect(page).toHaveScreenshot("admin-dashboard.png", { fullPage: true })
  })

  test("products list screenshot", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await expect(page.locator("h1")).toBeVisible()
    await expect(page).toHaveScreenshot("admin-products.png", { fullPage: true })
  })
})

test.describe("Visual — B2C", () => {
  test("wizard step 1 screenshot", async ({ page }) => {
    await page.goto("/cotizar")
    await expect(page.locator("text=Paso 1 de 4")).toBeVisible()
    await expect(page).toHaveScreenshot("wizard-step1.png", { fullPage: true })
  })
})
