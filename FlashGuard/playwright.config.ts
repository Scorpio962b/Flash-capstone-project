import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

// CHANGED: one place to read env vars (same globalThis pattern as before, no @types/node needed)
const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};
const isCI = Boolean(env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  // Scenario 3 is a Cucumber/WDIO suite (own Wdio.conf.ts), not a Playwright test
  testIgnore: ["**/Concurrent  Transfers E2E 3/**"],
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    // CHANGED: CI web container is on 3000; override locally with $env:BASE_URL="http://localhost:4173"
    baseURL: env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },

  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
