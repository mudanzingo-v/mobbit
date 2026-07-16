import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright configuration for Mobbit e2e tests.
 *
 * - Runs against the local dev server (web-portal :3003 + backend :8765)
 * - Uses Chromium in headed/headless mode
 * - Auth is handled via NextAuth dev-credentials provider
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "e2e-report" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3003",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    // Backend API (assumes already running via docker)
    // Frontend dev server (starts automatically for e2e)
  ],
})
