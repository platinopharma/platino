import { defineConfig, devices } from "@playwright/test";

// Allow local dev/CI to point at a preinstalled Chromium (the Lovable sandbox
// ships one under /chromium-*/chrome-linux/chrome). Falls back to Playwright's
// bundled browser when the env var isn't set.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

// E2E config for the onboarding flow. Assumes the dev server is already running
// on http://localhost:8080 (Lovable sandbox default); starts one otherwise.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4001",
    viewport: { width: 1280, height: 1800 },
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});