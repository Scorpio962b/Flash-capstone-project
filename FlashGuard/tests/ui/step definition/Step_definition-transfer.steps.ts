import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { UserWorld } from "../../support/World";

// GIVEN

Given(
  "I am logged in as Alice for negative transfer testing",
  async function (this: UserWorld) {
    await this.loginPage.open();
    await this.loginPage.login(
      process.env.ALICE_EMAIL!,
      process.env.ALICE_PASSWORD!,
    );
    await this.dashboardPage.expectLoaded();
  },
);

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

// =====================================================
// WHEN
// =====================================================

When(
  "I select {string} from Accounts tab and select {string} from Beneficiaries",
  async function (this: UserWorld, account: string, beneficiary: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();

    await this.page
      .getByPlaceholder("Search saved beneficiaries or enter new account...")
      .fill(beneficiary);
  },
);

When(
  "I select account {string} for an unknown recipient",
  async function (this: UserWorld, account: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();

    await this.page
      .getByRole("textbox", { name: "Search saved beneficiaries or" })
      .click();
  },
);

When(
  "I search for recipient {string} in the Beneficiaries section",
  async function (this: UserWorld, beneficiary: string) {
    await this.page
      .getByRole("textbox", { name: "Search saved beneficiaries or" })
      .fill(beneficiary);
  },
);

When(
  "I select account {string} and try to clear the beneficiary",
  async function (this: UserWorld, account: string) {
    await this.page.getByRole("radio", { name: new RegExp(account) }).check();

    await this.page
      .getByPlaceholder("Search saved beneficiaries or enter new account...")
      .clear();

    await this.page
      .getByRole("button", { name: /^Selected$/ })
      .first()
      .click();
  },
);

// The timeout must be set up BEFORE the amount is submitted
When("the transfer request times out", async function (this: UserWorld) {
  await this.page.route("**/api/**transfer**", (route) =>
    route.abort("timedout"),
  );
});

When(
  "I enter {string} in the Amount field and submit the transfer",
  async function (this: UserWorld, amount: string) {
    await this.page.getByRole("spinbutton", { name: "0.00" }).fill(amount);

    await this.page
      .getByRole("button", { name: "lock Confirm & Transfer" })
      .click();
  },
);

// The app has no OTP step, so scenarios using this are tagged @defect
When(
  "I confirm the transfer with a {string}",
  async function (this: UserWorld, otpType: string) {
    await expect(
      this.page.getByPlaceholder(/otp/i),
      "DEFECT: no OTP field to confirm the transfer with",
    ).toBeVisible({ timeout: 5000 });

    await this.page
      .getByPlaceholder(/otp/i)
      .fill(otpType === "valid OTP" ? process.env.VALID_OTP! : "000000");

    await this.page
      .getByRole("button", { name: /confirm|verify|submit/i })
      .click();
  },
);

// =====================================================
// THEN
// =====================================================

Then("a beneficiary should remain selected", async function (this: UserWorld) {
  await expect(
    this.page.getByRole("button", { name: /^Selected$/ }),
  ).toHaveCount(1);
});

Then(
  "the amount is shown in the currency {string}",
  async function (this: UserWorld, currency: string) {
    await expect(this.page.getByText(currency).first()).toBeVisible();
  },
);

Then(
  "the currency {string} is displayed",
  async function (this: UserWorld, currency: string) {
    await expect(this.page.getByText(currency).first()).toBeVisible();
  },
);

// The app has no OTP step, so scenarios using this are tagged @defect
Then("I am asked to enter my OTP", async function (this: UserWorld) {
  await expect(
    this.page
      .getByPlaceholder(/otp/i)
      .or(this.page.getByText(/enter.*otp/i))
      .first(),
    "DEFECT: no OTP prompt is shown after Confirm & Transfer",
  ).toBeVisible({ timeout: 5000 });
});

Then(
  "I see the message {string}",
  async function (this: UserWorld, message: string) {
    await expect(
      this.page
        .locator('[role="status"], [role="alert"], .toast')
        .filter({ hasText: message })
        .first(),
    ).toBeVisible();
  },
);

Then(
  "my balance is {string}",
  async function (this: UserWorld, balance: string) {
    await expect(this.page.getByText(balance, { exact: true })).toBeVisible();
  },
);

Then("no transaction should be recorded", async function (this: UserWorld) {
  await this.page
    .getByRole("link", { name: "receipt_long Transaction" })
    .click();

  await expect(
    this.page.getByRole("heading", { name: "Ledger & Reporting" }),
  ).toBeVisible();
});

Then(
  "I should see the negative amount validation message",
  async function (this: UserWorld) {
    await expect
      .poll(() =>
        this.page
          .getByRole("spinbutton", { name: "0.00" })
          .evaluate((el: HTMLInputElement) => el.validity.valid),
      )
      .toBe(false);

    await expect
      .poll(() =>
        this.page
          .getByRole("spinbutton", { name: "0.00" })
          .evaluate((el: HTMLInputElement) => el.validationMessage),
      )
      .toContain("Value must be greater than or equal to 0");
  },
);