
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

import { UserWorld } from "../../support/World";

// Login specifically for Negative Transfer tests
Given("I am logged in as Alice for negative transfer testing",async function (this: UserWorld) {
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
Given("I open the transfer funds page for negative testing",async function (this: UserWorld){
  await this.page.getByRole("link", { name: "payments Transfer Funds" }).click();
  await expect(this.page.getByRole("heading", { name: "Transfer Funds" })).toBeVisible()},
);

// Select account and beneficiary
When(
  "I select account {string} and beneficiary {string} for negative transfer",
  async function (this: UserWorld, account: string, beneficiary: string) {
    await this.page.getByRole('radio', { name: new RegExp(account) }).check();

await this.page.getByRole('button', { name: 'Selected' }).click();
  }
);


// Select account for unknown beneficiary
When(
  "I select account {string} for an unknown recipient",
  async function (this: UserWorld,) {
  await this.page.getByRole('radio', { name: 'Alice Ledger check_circle R' }).check();
  await this.page.getByRole('textbox', { name: 'Search saved beneficiaries or' }).click();

  },
);

// Search for beneficiary
When(
  "I search for recipient {string} in the Beneficiaries section",
  async function (this: UserWorld, beneficiary: string) {
    await this.page
      .getByRole("textbox", {
        name: "Search saved beneficiaries or enter new account.",
      })
      .fill(beneficiary);
  },
);




// // Select account without beneficiary
// When(
//   "I select account {string} and leave the beneficiary empty",
//   async function (this: UserWorld, account: string) {

//     await this.page.getByRole('radio', { name: /Alice Ledger/ }).check();

//     const beneficiarySearch = this.page.getByPlaceholder(
//       'Search saved beneficiaries or enter new account...'
//     );

//     await beneficiarySearch.clear();

//     await expect(beneficiarySearch).toHaveValue('');
//   }
// );






// Enter amount and submit transfer
When("I enter transfer amount {string} and submit", async function (this: UserWorld, amount: string) {
  await this.page.getByRole('spinbutton', { name: '0.00' }).click();
  await this.page.getByRole('spinbutton', { name: '0.00' }).fill(amount);
  await this.page.getByRole('button', { name: 'lock Confirm & Transfer' }).click();
})
      


// // Enter OTP and confirm
// When(
//   "I confirm the transfer using OTP {string}",
//   async function (this: UserWorld, otp: string) {
//     await this.page.getByLabel("OTP").fill(otp);

//     await this.page
//       .getByRole("button", { name: "lock Confirm & Transfer" })
//       .click();
//   },
// );

// // Verify confirmation screen
// Then(
//   "I should see transfer confirmation for {string} and amount {string}",
//   async function (
//     this: UserWorld,
//     beneficiary: string,
//     amount: string,
//   ) {
//      await this.page.getByRole('button', { name: 'lock Confirm & Transfer' }).click();

//   },
// );



// Verify message
Then(
  "I should receive the transfer message {string}",
  async function (this: UserWorld, expectedMessage: string) {
   await expect(this.page.getByRole('status')).toContainText(expectedMessage);
},
);

// // Verify balance
Then(
  "my transfer balance should be {string}",
  async function (this: UserWorld, balance: string) {
    await expect(
      this.page.getByText(balance, { exact: true })
    ).toBeVisible();
  }
);
Then(
  "I should see the negative amount validation message",
  async function (this: UserWorld) {
    const amountInput = this.page.getByLabel('Amount');

    await expect(amountInput).toHaveJSProperty('valid', false);

    await expect.poll(async () =>
      amountInput.evaluate(
        (element: HTMLInputElement) => element.validationMessage
      )
    ).toContain('Value must be greater than or equal to 0');
  }
);
// // Navigate to transactions
// Then(
//   "I should find no recorded transaction",
//   async function (this: UserWorld) {
//       await this.page.getByRole('link', { name: 'receipt_long Transaction' }).click();


//     await expect(
//       this.page.getByRole("heading", { name: 'Ledger & Reporting' }),
//     ).toBeVisible();
//   },
// );
