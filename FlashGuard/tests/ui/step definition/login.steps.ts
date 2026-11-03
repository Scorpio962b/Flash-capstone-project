import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { UserWorld } from '../../support/World';


// ---------- Given ----------
Given('I am on the login page', async function (this: UserWorld) {
  await this.loginPage.open();
});

Given('I am logged in with email {string} and password {string}', async function (this: UserWorld, email: string, password: string) {
  await this.loginPage.login(email, password);
  await this.dashboardPage.expectLoaded();
});

Given('the test is running in Google Chrome', async function () {
  expect(this.browser.browserType().name()).toBe('chromium');
});

// ---------- When ----------
When('I sign in with email {string} and password {string}', async function (this: UserWorld, email: string, password: string) {
  await this.loginPage.login(email, password);
});

When('I fail to log in with email {string} and password {string} {int} times', async function (this: UserWorld, email: string, password: string, attempts: number) {
  for (let i = 0; i < attempts; i++) {
    await this.loginPage.login(email, password);
  }
});

When('I sign out and sign back in with email {string} and password {string}', async function (this: UserWorld, email: string, password: string) {
  await this.page.getByRole('link', { name: 'logout Sign Out' }).click();
  await this.page.goto('http://localhost:3000/login');
  await this.page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
  await this.page.getByRole('button', { name: 'Sign In' }).click();
});

// ---------- Then ----------
Then('I should see the dashboard', async function (this: UserWorld) {
  await this.dashboardPage.expectLoaded();
  expect((await this.sessionKeys()).length).toBeGreaterThan(0);
});

Then('I should remain on the login page', async function (this: UserWorld) {
  await expect(this.page.getByRole('status')).toContainText('Invalid credentials');
});
//does not lock it should pass but is failing so - defect
Then('I should see the account locked message', async function (this: UserWorld) {
  await expect(this.loginPage.locked).toBeVisible();
});

Then('I should see the session expired message', async function (this: UserWorld) {
  await expect(this.loginPage.expired).toBeVisible();
  expect(await this.sessionKeys()).toHaveLength(0);
});

When('I am inactive for {int} minutes', async function (this: UserWorld, minutes: number) {
  await this.page.clock.fastForward(minutes * 60 * 1000 + 1000);
  await this.dashboardPage.interact();
});