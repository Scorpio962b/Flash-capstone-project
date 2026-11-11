import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { UserWorld } from "../../support/World";

// Login specifically for Negative Transfer tests
Given(
  "I am logged in as Alice for negative transfer testing",
  async function (this: UserWorld) {
    const email = process.env.ALICE_EMAIL;
    const password = process.env.ALICE_PASSWORD;

    if (!email || !password) {
      throw new Error("ALICE_EMAIL or ALICE_PASSWORD is missing from .env");
    }

    await this.loginPage.open();
    await this.loginPage.login(email, password);
    await this.dashboardPage.expectLoaded();
  },
);

// Navigate to transfer page
Given(
  "I open the transfer funds page for negative testing",
  async function (this: UserWorld) {
    await this.page
      .getByRole("link", { name: "payments Transfer Funds" })
      .click();
    await expect(
      this.page.getByRole("heading", { name: "Transfer Funds" }),
    ).toBeVisible();
  },
);

// Select account and beneficiary (by the beneficiary's name)
When(
  "I select account {string} and beneficiary {string} for negative transfer",
  async function (this: UserWorld, account: string, beneficiary: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();

    const card = this.page
      .locator("div")
      .filter({ hasText: beneficiary })
      .filter({ has: this.page.getByRole("button", { name: /^Select(ed)?$/ }) })
      .last();

    const selectButton = card.getByRole("button", { name: /^Select$/ });
    if (await selectButton.count()) {
      await selectButton.click();
    }

    await expect(
      card.getByRole("button", { name: /^Selected$/ }),
    ).toBeVisible();
  },
);

// Select account for unknown beneficiary
When(
  "I select account {string} for an unknown recipient",
  async function (this: UserWorld, account: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();
    await this.page
      .getByRole("textbox", { name: "Search saved beneficiaries or" })
      .click();
  },
);

// Search for beneficiary
When(
  "I search for recipient {string} in the Beneficiaries section",
  async function (this: UserWorld, beneficiary: string) {
    await this.page
      .getByRole("textbox", {
        name: "Search saved beneficiaries or",
      })
      .fill(beneficiary);
  },
);

// Try to clear the beneficiary (the app preselects one)
When(
  "I select account {string} and try to clear the beneficiary",
  async function (this: UserWorld, account: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();
    await this.page
      .getByPlaceholder("Search saved beneficiaries or enter new account...")
      .clear();

    const selected = this.page.getByRole("button", { name: /^Selected$/ });
    if (await selected.count()) {
      await selected.first().click();
    }
  },
);

// A beneficiary cannot be cleared
Then("a beneficiary should remain selected", async function (this: UserWorld) {
  await expect(
    this.page.getByRole("button", { name: /^Selected$/ }),
  ).toHaveCount(1);
});

// Enter amount and submit transfer
When(
  "I enter transfer amount {string} and submit",
  async function (this: UserWorld, amount: string) {
    await this.page.getByRole("spinbutton", { name: "0.00" }).click();
    await this.page.getByRole("spinbutton", { name: "0.00" }).fill(amount);
    await this.page
      .getByRole("button", { name: "lock Confirm & Transfer" })
      .click();
  },
);

// Verify message (shows what the app displayed and saves a screenshot on failure)
Then(
  "I should receive the transfer message {string}",
  async function (this: UserWorld, expectedMessage: string) {
    const toasts = this.page.locator('[role="status"], [role="alert"], .toast');
    try {
      await expect(
        toasts.filter({ hasText: expectedMessage }).first(),
      ).toBeVisible();
    } catch {
      const actual = await toasts.allTextContents();
      await this.page.screenshot({
        path: "test-results/message-failure.png",
        fullPage: true,
      });
      throw new Error(
        `Expected a message containing "${expectedMessage}" but the app showed: ${JSON.stringify(actual)}. Screenshot: test-results/message-failure.png`,
      );
    }
  },
);

// Verify balance
Then(
  "my transfer balance should be {string}",
  async function (this: UserWorld, balance: string) {
    await expect(this.page.getByText(balance, { exact: true })).toBeVisible();
  },
);

// Native browser validation for negative amounts (not a toast)
Then(
  "I should see the negative amount validation message",
  async function (this: UserWorld) {
    const amountInput = this.page.getByRole("spinbutton", { name: "0.00" });

    await expect
      .poll(() =>
        amountInput.evaluate((el: HTMLInputElement) => el.validity.valid),
      )
      .toBe(false);

    await expect
      .poll(() =>
        amountInput.evaluate((el: HTMLInputElement) => el.validationMessage),
      )
      .toContain("Value must be greater than or equal to 0");
  },
);

// Navigate to transactions
Then("I should find no recorded transaction", async function (this: UserWorld) {
  await this.page
    .getByRole("link", { name: "receipt_long Transaction" })
    .click();

  await expect(
    this.page.getByRole("heading", { name: "Ledger & Reporting" }),
  ).toBeVisible();
});
