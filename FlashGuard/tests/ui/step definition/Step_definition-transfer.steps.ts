// steps/recipient-validation.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import type { CustomWorld } from '../../support/World';

interface FlashWorld extends CustomWorld {
  page: Page;
}




// Shared by @empty, @unknown, @self-transfer, @blocked
Given(
  'I am on the transfer fund page',
  async function (this: FlashWorld) {
    await this.page.goto('http://localhost:3000/transfers');
    await expect(
      this.page.getByRole('heading', { name: 'transfer fund' })
    ).toBeVisible();

  }
);

// @empty
When(
  'I select {string} from Accounts tab and leave Beneficiaries empty',
  async function (this: FlashWorld, account: string) {
    await this.page.getByText('Alice Ledger').click();
    await this.page.getByText(account, { exact: true }).click();
    // Beneficiaries intentionally left untouched
  }
);

// @unknown, @self-transfer, @blocked
When(
  'I select {string} from Accounts tab and select {string} from Beneficiaries',
  async function (this: FlashWorld, account: string, beneficiary: string) {
    await this.page.getByText('Alice Ledger').click();
    await this.page.getByText(account, { exact: true }).click();

    await this.page.getByText('Alice Ledger').click();
    await this.page.getByText(beneficiary, { exact: true }).click();
  }
);

// All four scenarios
When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: FlashWorld, amount: string) {
    await this.page.getByLabel('Amount').fill(amount);
    await this.page.getByRole('button', { name:  'lock Confirm & Transfer' }).click();
  }
);

// All four scenarios
Then(
  'I should see the message {string}',
  async function (this: FlashWorld, expectedMessage: string) {
    await expect(this.page.getByText(expectedMessage, { exact: true })).toBeVisible();
  }
);

// All four scenarios
Then('no transaction should be recorded',
  async function (this: FlashWorld) {
    // Implementation for checking no transaction is recorded
  }
);
