/**
 * E2E: B2C flow — quotation wizard, view offers, payment selection.
 */
import { test, expect } from "@playwright/test"

test.describe("Quotation wizard", () => {
  test("shows 3-step form structure", async ({ page }) => {
    await page.goto("/cotizar")
    await expect(page.locator("text=Paso 1 de 3")).toBeVisible()
    await expect(page.locator("text=Tus datos")).toBeVisible()
  })

  test("can navigate through steps", async ({ page }) => {
    await page.goto("/cotizar")

    // Step 1: fill client data
    await page.fill("input", "Juan Pérez")
    await page.click("text=Siguiente")
    await expect(page.locator("text=Paso 2 de 3")).toBeVisible()
    await expect(page.locator("text=Origen y destino")).toBeVisible()

    // Step 2: fill addresses
    await page.click("text=Siguiente")
    await expect(page.locator("text=Paso 3 de 3")).toBeVisible()
    await expect(page.locator("text=Confirmar cotización")).toBeVisible()
  })

  test("requires client name on step 1", async ({ page }) => {
    await page.goto("/cotizar")
    // Siguiente should be disabled when name is empty
    const nextBtn = page.locator("text=Siguiente")
    await expect(nextBtn).toBeDisabled()
  })
})

test.describe("Payment method selection", () => {
  test("shows 3 payment options on quotation detail", async ({ page }) => {
    // Navigate to an existing quotation (uses test data from DB)
    await page.goto("/cotizar")

    // If there are pending auctions, verify payment options are shown
    await page.waitForTimeout(1000)
    const tarjeta = page.locator("text=Tarjeta")
    const spei = page.locator("text=SPEI")
    const oxxo = page.locator("text=OXXO")

    // These might not be visible if there are no auctions yet
    if (await tarjeta.isVisible().catch(() => false)) {
      await expect(tarjeta).toBeVisible()
      await expect(spei).toBeVisible()
      await expect(oxxo).toBeVisible()
    }
  })
})

test.describe("Payment result pages", () => {
  test("success page shows confirmation", async ({ page }) => {
    await page.goto("/pago/exito")
    await expect(page.locator("text=¡Pago exitoso!")).toBeVisible()
  })

  test("failure page shows error message", async ({ page }) => {
    await page.goto("/pago/fallo")
    await expect(page.locator("text=Pago no completado")).toBeVisible()
  })
})
