import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { UserWorld } from "../../support/World";

// ---------- User Credentials ----------

function getUserEmail(user: string): string {
  const email = process.env[`${user.toUpperCase()}_EMAIL`];

  if (!email) {
    throw new Error(`Email not configured for test user: ${user}`);
  }

  return email;
}

function getUserPassword(user: string): string {
  const password = process.env[`${user.toUpperCase()}_PASSWORD`];

  if (!password) {
    throw new Error(`Password not configured for test user: ${user}`);
  }

  return password;
}

function getInvalidPassword(): string {
  const password = process.env.INVALID_PASSWORD;

  if (!password) {
    throw new Error("INVALID_PASSWORD is not configured");
  }

  return password;
}

// ---------- Given ----------

Given("I am on the login page", async function (this: UserWorld) {
  await this.loginPage.open();
});

Given(
  "I am logged in as {string}",
  async function (this: UserWorld, user: string) {
    await this.loginPage.login(getUserEmail(user), getUserPassword(user));

    await this.dashboardPage.expectLoaded();
  },
);

Given("the test is running in Google Chrome", async function (this: UserWorld) {
  expect(this.browser.browserType().name()).toBe("chromium");
});

// ---------- When ----------

When("I sign in as {string}", async function (this: UserWorld, user: string) {
  await this.loginPage.login(getUserEmail(user), getUserPassword(user));
});

When(
  "I sign in with invalid credentials as {string}",
  async function (this: UserWorld, user: string) {
    await this.loginPage.login(getUserEmail(user), getInvalidPassword());
  },
);

When(
  "I fail to log in as {string} {int} times",
  async function (this: UserWorld, user: string, attempts: number) {
    for (let i = 0; i < attempts; i++) {
      await this.loginPage.login(getUserEmail(user), getInvalidPassword());
    }
  },
);

When(
  "I sign out and sign back in as {string}",
  async function (this: UserWorld, user: string) {
    await this.page.getByRole("link", { name: "logout Sign Out" }).click();

    await this.loginPage.open();

    await this.loginPage.login(getUserEmail(user), getUserPassword(user));
  },
);

When(
  "I am inactive for {int} minutes",
  async function (this: UserWorld, minutes: number) {
    await this.page.clock.fastForward(minutes * 60 * 1000 + 1000);

    await this.dashboardPage.interact();
  },
);

// ---------- Then ----------

Then("I should see the dashboard", async function (this: UserWorld) {
  await this.dashboardPage.expectLoaded();

  expect((await this.sessionKeys()).length).toBeGreaterThan(0);
});

Then("I should remain on the login page", async function (this: UserWorld) {
  await expect(this.page.getByRole("status")).toContainText(
    "Invalid credentials",
  );
});

Then(
  "I should see the account locked message",
  async function (this: UserWorld) {
    await expect(this.loginPage.locked).toBeVisible();
  },
);

Then(
  "I should see the session expired message",
  async function (this: UserWorld) {
    await expect(this.loginPage.expired).toBeVisible();

    expect(await this.sessionKeys()).toHaveLength(0);
  },
);
