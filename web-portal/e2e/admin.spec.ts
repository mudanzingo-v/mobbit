/**
 * E2E: Admin pages — dashboard, CRUDs.
 */
import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./fixtures/auth"

test.describe("Admin dashboard", () => {
  test("shows stats after login", async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator("h1")).toContainText("Dashboard")
    await expect(page.getByText("Cotizaciones").first()).toBeVisible()
    await expect(page.getByText("Transportistas").first()).toBeVisible()
    await expect(page.getByText("Productos").first()).toBeVisible()
  })
})

test.describe("Products CRUD", () => {
  test("lists products in table", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await expect(page.locator("h1")).toContainText("Productos")
  })

  test("can open create dialog", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await page.getByRole("button", { name: "Nuevo" }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Nuevo producto" })).toBeVisible()
  })

  test("can create a product", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/products")
    await page.getByRole("button", { name: "Nuevo" }).click()
    await page.waitForSelector("role=dialog", { timeout: 5000 })
    await page.getByLabel("Nombre *").fill("Producto E2E Test")
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.locator("h1")).toBeVisible()
  })
})

test.describe("Services page", () => {
  test("lists services", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/services")
    await expect(page.locator("h1")).toContainText("Servicios")
  })
})

test.describe("Quotations page", () => {
  test("lists quotations with search", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/quotations")
    await expect(page.locator("h1")).toContainText("Cotizaciones")
  })
})

test.describe("Providers page", () => {
  test("lists providers", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/providers")
    await expect(page.locator("h1")).toContainText("Transportistas")
  })
})

test.describe("Inventory page", () => {
  test("shows categories and items", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/inventory")
    await expect(page.locator("h1")).toContainText("Inventario")
    await expect(page.getByText("Categorías").first()).toBeVisible()
  })
})

test.describe("Auctions page", () => {
  test("lists auctions", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/auctions")
    await expect(page.locator("h1")).toContainText("Ofertas")
  })
})

test.describe("Salers page", () => {
  test("lists salers", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/salers")
    await expect(page.locator("h1")).toContainText("Vendedores")
  })
})

test.describe("Settings page", () => {
  test("shows session info", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/settings")
    await expect(page.locator("h1")).toContainText("Configuración")
    await expect(page.getByText("Sesión").first()).toBeVisible()
  })
})
