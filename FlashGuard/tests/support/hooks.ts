
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";

import { chromium, Browser } from "@playwright/test";
import { UserWorld } from "./World";
import { LoginPage } from "../../src/pages/LoginPage";
import { DashboardPage } from "../../src/pages/dashboardPage";

setDefaultTimeout(30 * 1000);

let browser: Browser | undefined;

// Launch Playwright Chromium
BeforeAll(async function () {
  browser = await chromium.launch({
    headless: false
  });
});

// Create a new browser context for each scenario
Before(async function (this: UserWorld, { pickle }) {
  if (!browser) {
    throw new Error("Browser was not launched successfully.");
  }

  this.browser = browser;

  this.context = await browser.newContext({
    baseURL: "http://localhost:3000"
  });

  this.page = await this.context.newPage();

  // Fake clock for the 30-minute timeout test
  if (pickle.tags.some((t) => t.name === "@clock")) {
    await this.page.clock.install();
  }

  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
});

// Take a screenshot if a scenario fails
After(async function (this: UserWorld, scenario) {
  if (
    scenario.result?.status === Status.FAILED &&
    this.page
  ) {
    await this.attach(
      await this.page.screenshot(),
      "image/png"
    );
  }

  if (this.context) {
    await this.context.close();
  }
});

// Close the browser
AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});

