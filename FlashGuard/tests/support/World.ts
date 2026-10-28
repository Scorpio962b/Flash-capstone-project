import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/dashboardPage';

export class UserWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;

  constructor(options: IWorldOptions) {
    super(options);
  }
  // Names of everything currently in the browser's session storage
  sessionKeys() {
    return this.page.evaluate(() => Object.keys(sessionStorage));
  }
}
setWorldConstructor(UserWorld);