
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

setDefaultTimeout(60 * 1000);

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: false,
    channel: "chrome"
  });
});

Before(async function (this: UserWorld, { pickle }) {
  this.browser = browser;

  this.context = await browser.newContext({
    baseURL: "http://localhost:3000"
  });

  this.page = await this.context.newPage();

  // Fake clock for timeout tests
  if (pickle.tags.some((t) => t.name === "@clock")) {
    await this.page.clock.install();
  }

  // Initialize Page Objects
  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
});

After(async function (this: UserWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    this.attach(await this.page.screenshot(), "image/png");
  }

  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});
