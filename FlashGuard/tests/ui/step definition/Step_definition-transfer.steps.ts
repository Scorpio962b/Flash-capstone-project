import { Given, When, Then } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import { UserWorld } from "../../support/World";

const transactionCounts = new WeakMap<Page, number>();

// GIVEN
Given("I am logged in as Alice for negative transfer testing", async function (this: UserWorld) {
  await this.loginPage.open();
  await this.loginPage.login(process.env.ALICE_EMAIL!, process.env.ALICE_PASSWORD!);
  await this.dashboardPage.expectLoaded();
});

Given("I open the transfer funds page for negative testing", async function (this: UserWorld) {
  await this.page.getByRole("link", { name: /Transfer Funds/ }).click();
  await expect(this.page.getByRole("heading", { name: "Transfer Funds" })).toBeVisible();
});

// WHEN
When("I select {string} from Accounts tab and select {string} from Beneficiaries", async function (
  this: UserWorld,
  account: string,
  beneficiary: string
) {
  // Record the transaction count before attempting the transfer.
  await this.page.getByRole("link", { name: /Transaction/ }).click();
  await expect(this.page.getByRole("heading", { name: "Ledger & Reporting" })).toBeVisible();

  const existingTransactions = await this.page.getByRole("button", { name: "View Details" }).count();
  transactionCounts.set(this.page, existingTransactions);

  await this.page.getByRole("link", { name: /Transfer Funds/ }).click();
  await expect(this.page.getByRole("heading", { name: "Transfer Funds" })).toBeVisible();

  await this.page.getByRole("radio", { name: new RegExp(account) }).check();

  const search = this.page.getByPlaceholder("Search saved beneficiaries or enter new account...");
  await search.fill(beneficiary);

  if (beneficiary.trim() !== "") {
    const beneficiaryResult = this.page.getByText(beneficiary, { exact: true });

    try {
      await beneficiaryResult.first().waitFor({ state: "visible", timeout: 3000 });

      await beneficiaryResult.first().click();

      const selectButton = this.page.getByRole("button", { name: "Select" });

      if (await selectButton.count()) {
        await selectButton.first().click();
      }
    } catch {
      // No saved beneficiary result was displayed.
    }
  }
});

When("I select account {string} for an unknown recipient", async function (
  this: UserWorld,
  account: string
) {
  await this.page.getByRole("radio", { name: new RegExp(account) }).check();
  await this.page.getByPlaceholder("Search saved beneficiaries or enter new account...").click();
});

When("I search for recipient {string} in the Beneficiaries section", async function (
  this: UserWorld,
  beneficiary: string
) {
  await this.page.getByPlaceholder("Search saved beneficiaries or enter new account...").fill(beneficiary);
});

When("I select account {string} and try to clear the beneficiary", async function (
  this: UserWorld,
  account: string
) {
  await this.page.getByRole("radio", { name: new RegExp(account) }).check();
  await this.page.getByPlaceholder("Search saved beneficiaries or enter new account...").clear();
});

When("the transfer request times out", async function (this: UserWorld) {
  await this.page.route("**/api/**transfer**", async (route) => {
    await route.abort("timedout");
  });
});

When("I enter {string} in the Amount field and submit the transfer", async function (
  this: UserWorld,
  amount: string
) {
  await this.page.getByPlaceholder("0.00").fill(amount);
  await this.page.getByRole("button", { name: /Confirm & Transfer/ }).click();
});

When("I confirm the transfer with a {string}", async function (
  this: UserWorld,
  otpType: string
) {
  const otpField = this.page.getByPlaceholder(/otp/i);

  await expect(
    otpField,
    "No OTP field is currently displayed by the application."
  ).toBeVisible({ timeout: 5000 });

  const otp = otpType === "valid OTP" ? process.env.VALID_OTP : "000000";

  if (!otp) {
    throw new Error("VALID_OTP is missing from the environment.");
  }

  await otpField.fill(otp);
  await this.page.getByRole("button", { name: /confirm|verify|submit/i }).click();
});

// THEN
Then("a beneficiary should remain selected", async function (this: UserWorld) {
  await expect(this.page.getByRole("button", { name: /^Selected$/ })).toBeVisible();
});

Then("the amount is shown in the currency {string}", async function (
  this: UserWorld,
  currency: string
) {
  await expect(this.page.getByText(currency, { exact: true }).first()).toBeVisible();
});

Then("the currency {string} is displayed", async function (
  this: UserWorld,
  currency: string
) {
  await expect(this.page.getByText(currency, { exact: true }).first()).toBeVisible();
});

Then("I am asked to enter my OTP", async function (this: UserWorld) {
  await expect(
    this.page.getByPlaceholder(/otp/i).or(this.page.getByText(/enter.*otp/i)).first(),
    "No OTP prompt is displayed after Confirm & Transfer."
  ).toBeVisible({ timeout: 5000 });
});

Then("I see the message {string}", async function (
  this: UserWorld,
  message: string
) {
  const notification = this.page
    .locator('[role="status"], [role="alert"], .toast')
    .filter({ hasText: message })
    .first();

  await expect(notification, `Expected notification message: ${message}`).toBeVisible({
    timeout: 10000
  });
});

Then("my balance is {string}", async function (
  this: UserWorld,
  balance: string
) {
  await expect(this.page.getByText(balance, { exact: true }).first()).toBeVisible({
    timeout: 10000
  });
});

Then("no transaction should be recorded", async function (this: UserWorld) {
  await this.page.getByRole("link", { name: /Transaction/ }).click();
  await expect(this.page.getByRole("heading", { name: "Ledger & Reporting" })).toBeVisible();

  const originalCount = transactionCounts.get(this.page);

  if (originalCount === undefined) {
    throw new Error("Transaction baseline was not recorded before the transfer.");
  }

  await expect.poll(
    () => this.page.getByRole("button", { name: "View Details" }).count(),
    { timeout: 10000 }
  ).toBe(originalCount);
});

// NEGATIVE AMOUNT VALIDATION
Then("I should see the negative amount validation message", async function (this: UserWorld) {
  const amountField = this.page.getByPlaceholder("0.00");

  await expect.poll(
    () => amountField.evaluate((el: HTMLInputElement) => el.validity.valid)
  ).toBe(false);

  await expect.poll(
    () => amountField.evaluate((el: HTMLInputElement) => el.validationMessage)
  ).toContain("Value must be greater than or equal to 0");
});