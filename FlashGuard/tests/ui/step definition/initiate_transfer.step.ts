import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { UserWorld } from '../../support/World';

interface TransferWorld extends UserWorld {
  page: Page;
}

Given(
  `I navigate to the transfer funds feature`,
  async function (this: TransferWorld,): Promise<void> {
    await this.page.goto('http://localhost:3000/dashboard');
    await this.page.getByRole('link', {name: 'payments Transfer Funds'}).click();

    await expect(
      this.page.getByRole('heading', { name: 'Transfer Funds' })
    ).toBeVisible();
  }
);

When(
  'I select {string} from Accounts tab',
  async function (this: TransferWorld, account: string): Promise<void> {
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
  async function (this: TransferWorld, beneficiary: string): Promise<void> {
    await this.page
      .getByText('Bob Wallet')
      .click();

    await this.page
      .getByText(beneficiary, { exact: true })
      .click();
  }
);

When(
  'I select {string} ZAR that I want to transfer and click submit',
  async function (this: TransferWorld, amount: string): Promise<void> {
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
  async function (this: TransferWorld, expectedMessage: string): Promise<void> {
    await expect(
      this.page.getByText(expectedMessage, { exact: true })
    ).toBeVisible();
  }
);

Then(
  'my {string} shows correctly',
  async function (this: TransferWorld, expectedBalance: string): Promise<void> {
    await expect(
      this.page.getByText(expectedBalance, { exact: true })
    ).toBeVisible();
  }
);
