import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { UserWorld } from '../../support/World';

const users: Record<string, { email: string; password: string }> = {
  alice:   { email: 'alice@flashguard.local',   password: 'offline-demo' },
  bob:     { email: 'bob@flashguard.local',     password: 'offline-demo' },
  charlie: { email: 'charlie@flashguard.local', password: 'offline-demo' },
};

function who(name: string) {
  const user = users[name];
  if (!user) throw new Error(`Unknown user: ${name}`);
  return user;
}

const logIn = (w: UserWorld, name: string, password = who(name).password) =>
  w.loginPage.login(who(name).email, password);

// ---------- Given ----------
Given('the user is on the login page', async function (this: UserWorld) {
  await this.loginPage.open();
});

Given('{word} is logged in', async function (this: UserWorld, name: string) {
  await logIn(this, name);
  await this.dashboardPage.expectLoaded();
});

Given('the test is running in Google Chrome', async function () {
  expect(process.env.BROWSER, 'Run with: npm run test:chrome').toBe('chrome');
});

// ---------- When ----------
When('{word} logs in', async function (this: UserWorld, name: string) {
  await logIn(this, name);
});

When('{word} logs in with a wrong password', async function (this: UserWorld, name: string) {
  await logIn(this, name, 'onnline-demo');
});

When('{word} fails to log in {int} times', async function (this: UserWorld, name: string, times: number) {
  for (let i = 0; i < times; i++) {
    await logIn(this, name, 'wrong-password');
    await this.page.waitForLoadState('networkidle');
  }
});

When('the user logs out', async function (this: UserWorld) {
  await this.dashboardPage.logout();
});

When('the user is inactive for {int} minutes', async function (this: UserWorld, minutes: number) {
  await this.page.clock.fastForward(`${minutes}:01`); // 30 min + 1 sec
  await this.dashboardPage.interact();                // any click makes the app check the session
});

// ---------- Then ----------
Then('the dashboard is shown and the session is saved', async function (this: UserWorld) {
  await this.dashboardPage.expectLoaded();
  expect((await this.sessionKeys()).length).toBeGreaterThan(0);
});

Then('an invalid credentials error is shown', async function (this: UserWorld) {
  await expect(this.loginPage.error).toBeVisible();
});

Then('the account locked message is shown', async function (this: UserWorld) {
  await expect(this.loginPage.locked).toBeVisible();
});

Then('the login page is shown and the session is cleared', async function (this: UserWorld) {
  await this.loginPage.expectVisible();
  expect(await this.sessionKeys()).toHaveLength(0);
});

Then('the session expired message is shown and the session is cleared', async function (this: UserWorld) {
  await expect(this.loginPage.expired).toBeVisible();
  expect(await this.sessionKeys()).toHaveLength(0);
});