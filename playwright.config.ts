import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export const DATA_DIR = ".data-test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Use a pre-installed Chromium when provided (e.g. CI images); otherwise Playwright's own download.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ADMIN_PASSWORD: "e2e-password-123",
      // Local production build: allow the file lead store + email outbox and a warning-only settings check
      ALLOW_TEST_FALLBACKS: "1",
      LOCAL_DATA_DIR: DATA_DIR,
      DISABLE_RATE_LIMIT: "1",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      // Tracking: a fake GTM container so the banner and loader can be tested; Google hosts are blocked in tests
      NEXT_PUBLIC_GTM_ID: "GTM-E2ETEST",
      TRACKING_LOAD_OUTSIDE_PRODUCTION: "1",
      LEAD_NOTIFY_EMAIL: "owner@example.com",
    },
  },
});
