import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export class FlashWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  startingBalance = '';

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(FlashWorld);
