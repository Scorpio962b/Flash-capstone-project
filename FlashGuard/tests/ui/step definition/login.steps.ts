import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { UserWorld } from '../../support/World';

// ---------- Given ----------
Given('the user is on the login page', async function (this: UserWorld) {
  await this.loginPage.open();
});

Given('the user is logged in as {string} with password {string}',
  async function (this: UserWorld, email: string, password: string) {
    await this.loginPage.login(email, password);
    await this.dashboardPage.expectLoaded();
  });

Given('the test is running in Google Chrome', async function () {
  expect(process.env.BROWSER, 'Run with: npm run test:chrome').toBe('chrome');
});

// ---------- When ----------
const enterDetails = async function (this: UserWorld, email: string, password: string) {
  await this.loginPage.login(email, password);
};
When('the user enters a valid username {string} and password {string}', enterDetails);
When('the user enters username {string} and password {string}', enterDetails);

When('the user enters a wrong password {int} times for {string}',
  async function (this: UserWorld, times: number, email: string) {
    for (let i = 0; i < times; i++) {
      await this.loginPage.login(email, 'wrong-password');
      await this.page.waitForLoadState('networkidle');
    }
  });

When('the user logs out', async function (this: UserWorld) {
  await this.dashboardPage.logout();
});

When('the user is inactive for {int} minutes', async function (this: UserWorld, minutes: number) {
  await this.page.clock.fastForward(`${minutes}:01`); // 30 min + 1 sec
});

When('the user interacts with the application', async function (this: UserWorld) {
  await this.dashboardPage.interact();
});

// ---------- Then ----------
Then('the user is taken to the dashboard', async function (this: UserWorld) {
  await this.dashboardPage.expectLoaded();
});

Then('an invalid credentials error is displayed', async function (this: UserWorld) {
  await expect(this.loginPage.error).toBeVisible();
});

Then('the account locked message is displayed', async function (this: UserWorld) {
  await expect(this.loginPage.locked).toBeVisible();
});

Then('the login page is displayed', async function (this: UserWorld) {
  await this.loginPage.expectVisible();
});

Then('a session expired message is displayed', async function (this: UserWorld) {
  await expect(this.loginPage.expired).toBeVisible();
});

Then('the session is saved in session storage', async function (this: UserWorld) {
  expect((await this.sessionKeys()).length).toBeGreaterThan(0);
});

Then('session storage is empty', async function (this: UserWorld) {
  expect(await this.sessionKeys()).toHaveLength(0);
});