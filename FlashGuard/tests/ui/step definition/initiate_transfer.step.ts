
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { CustomWorld } from '../../support/World';

interface TransferWorld extends CustomWorld {
  page: Page;
}

Given(
  'I navigate to the transfer funds feature',
  async function (this: TransferWorld,) {
    await this.page.goto('http://localhost:3000/transfers');

    await expect(
      this.page.getByRole('heading', { name: 'Transfer Funds' })
    ).toBeVisible();
  }
);

When(
  'I select {string} from Accounts tab',
  async function (this: TransferWorld, account: string) {
    await this.page
      .getByText('Alice Ledger')
      .click();

    await this.page
      .getByText(account, { exact: true })
      .click();
  }
);

When(
  'I select {string} from Beneficiaries',
  async function (this: TransferWorld, beneficiary: string) {
    await this.page
      .getByText('Bob Wallet')
      .click();

    await this.page
      .getByText(beneficiary, { exact: true })
      .click();
  }
);

When(
  'I select {string} ZAR that I want to transfer',
  async function (this: TransferWorld, amount: string) {
    await this.page
      .getByPlaceholder('0.00')
      .fill(amount);

    await this.page
      .getByRole('button', { name: 'lock Confirm & Transfer'})
      .click();
  }
);

Then(
  'I see the {string} result for my transfer request',
  async function (this: TransferWorld, expectedMessage: string) {
    await expect(
      this.page.getByText(expectedMessage, { exact: true })
    ).toBeVisible();
  }
);

Then(
  'my {string} shows correctly',
  async function (this: TransferWorld, expectedBalance: string) {
    await expect(
      this.page.getByText(expectedBalance, { exact: true })
    ).toBeVisible();
  }
);

Then(
  'the transaction status is {string}',
  async function (this: TransferWorld, expectedStatus: string) {
    await expect(
      this.page.getByText(expectedStatus, { exact: true })
    ).toBeVisible();
  }
);

// Then(
//   'I must complete OTP authentication on the mobile side',
//   async function (this: TransferWorld) {
//     await expect(
//       this.page.getByText(/otp|mobile authentication/i)
//     ).toBeVisible();
//   }
// );

// Then(
//   'the transfer must not be marked as {string} before OTP authentication',
//   async function (this: TransferWorld, forbiddenStatus: string) {
//     await expect(
//       this.page.getByText(forbiddenStatus, { exact: true })
//     ).toHaveCount(0);
//   }
// );
