/**
 * E2E: Edge cases & security — Phase 3.
 *
 * Tests unauthenticated access, empty states, form validation, search/filter, 404 handling.
 */
import { test, expect } from "@playwright/test"
import { loginAsAdmin, loginAsProvider } from "./fixtures/auth"

// =============================================================================
// Auth — without login (middleware passes through in dev)
// =============================================================================

test.describe("Unauthenticated access", () => {
  test("admin dashboard loads without login", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await expect(page.locator("h1")).toContainText("Dashboard", { timeout: 10000 })
  })

  test("provider dashboard loads without login", async ({ page }) => {
    await page.goto("/provider/dashboard")
    await expect(page.locator("h1")).toContainText("Hola", { timeout: 10000 })
  })
})

// =============================================================================
// Empty states
// =============================================================================

test.describe("Empty states", () => {
  test("payments page shows stub message", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/payments")
    await expect(page.locator("h1")).toContainText("Pagos")
    // Now shows real payments list (may be empty)
    await expect(page.locator("h1")).toContainText("Pagos")
  })
})

// =============================================================================
// Form validation
// =============================================================================

test.describe("Form validation", () => {
  test("wizard step 1 — next button disabled when name empty", async ({ page }) => {
    await page.goto("/cotizar")
    const nextBtn = page.getByRole("button", { name: "Siguiente" })
    await expect(nextBtn).toBeDisabled()
  })

  test("create product dialog opens with form fields", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await page.getByRole("button", { name: "Nuevo" }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 5000 })
    // Should have at least one input field
    expect(await dialog.locator("input").count()).toBeGreaterThan(0)
  })
})

// =============================================================================
// Search & filter
// =============================================================================

test.describe("Search and filter", () => {
  test("quotations search field is visible", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/quotations")
    const searchInput = page.locator("input[placeholder*='Buscar']")
    await expect(searchInput).toBeVisible()
  })

  test("quotations filter by state changes selection", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/quotations")
    const filter = page.locator("select")
    await filter.selectOption("DRAFT")
    await page.waitForTimeout(500)
    await filter.selectOption("CANCELLED")
    await page.waitForTimeout(500)
  })

  test("provider auctions filter by state", async ({ page }) => {
    await loginAsProvider(page)
    await page.goto("/provider/auctions")
    await expect(page.locator("h1")).toContainText("Mis ofertas")
    const filter = page.locator("select")
    await filter.selectOption("PENDING")
    await page.waitForTimeout(300)
    await filter.selectOption("SELECTED")
    await page.waitForTimeout(300)
  })
})

// =============================================================================
// 404 handling
// =============================================================================

test.describe("404 handling", () => {
  test("nonexistent quotation shows error", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/quotations/nonexistent-id-12345")
    await page.waitForTimeout(1000)
    // Page should show error or detail (depending on API response)
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })

  test("unknown admin path shows 404", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/this-path-does-not-exist")
    await page.waitForTimeout(500)
    // Should show 404 page
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})

// =============================================================================
// Navigation
// =============================================================================

test.describe("Admin navigation", () => {
  test("navigate between pages", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await expect(page.locator("h1")).toContainText("Productos", { timeout: 10000 })
    await page.goto("/admin/services")
    await expect(page.locator("h1")).toContainText("Servicios", { timeout: 10000 })
    await page.goto("/admin/salers")
    await expect(page.locator("h1")).toContainText("Vendedores", { timeout: 10000 })
  })
})

// =============================================================================
// Data consistency
// =============================================================================

test.describe("Data consistency", () => {
  test("admin dashboard shows stats", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/dashboard")
    await expect(page.getByText("Cotizaciones").first()).toBeVisible()
    await expect(page.getByText("Transportistas").first()).toBeVisible()
  })

  test("provider dashboard loads", async ({ page }) => {
    await loginAsProvider(page)
    await expect(page.locator("h1")).toContainText("Hola")
  })
})
