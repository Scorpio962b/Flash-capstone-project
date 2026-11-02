import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/dashboardPage';
// Custom World class for sharing test objects within a Cucumber scenario.
export class UserWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;

  constructor(options: IWorldOptions) {
    super(options); // Calls the parent World constructor provided by Cucumber.
  }
  // Returns the names of all keys currently stored in sessionStorage.
sessionKeys() {
  return this.page.evaluate(() => Object.keys(localStorage));
}
}
// Registers UserWorld so Cucumber uses it for each scenario.
setWorldConstructor(UserWorld);