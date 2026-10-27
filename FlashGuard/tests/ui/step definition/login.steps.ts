import { Given, When, Then } from '@cucumber/cucumber';
import type { Page, expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

Given('I am on the landing page', async ({ loginPage }) => {
  await loginPage.gotoLandingPage();
});

When('I click Get Started', async ({ loginPage }) => {
  await loginPage.goToLoginFromGetStarted();
});