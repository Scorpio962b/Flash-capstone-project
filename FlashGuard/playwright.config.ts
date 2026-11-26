import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests/e2e',
  // Scenario 3 is a Cucumber/WDIO suite (own Wdio.conf.ts), not a Playwright test
  testIgnore: ['**/Concurrent  Transfers E2E 3/**'],
  fullyParallel: false,
  forbidOnly: Boolean(
    (globalThis as { process?: { env?: { CI?: string } } }).process?.env?.CI
  ),
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome']
  },

  timeout: 30000,
  expect: {
    timeout: 10000
  }
});