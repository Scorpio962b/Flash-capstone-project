import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { UserWorld } from '../../support/World';

interface TransferWorld extends UserWorld {
  page: Page;
  selectedAccount?: string;
  selectedAccountBalance?: string;
}

Given(
  `I navigate to the transfer funds feature`,
  async function (this: TransferWorld): Promise<void> {
    await this.page.goto('http://localhost:3000/login');
    await this.loginPage.login('alice@flashguard.local', 'offline-demo');
    await this.page.waitForURL('**/dashboard');
    await this.dashboardPage.expectLoaded();

    await this.page.goto('http://localhost:3000/transfers');
    await expect(
      this.page.getByRole('heading', { name: 'Transfer Funds' })
    ).toBeVisible();
  }
);

When(
  'I select {string} from Accounts tab',
  async function (this: TransferWorld, account: string): Promise<void> {
    const accountSection = this.page
      .getByRole('heading', { name: 'From Account' })
      .locator('xpath=../..');
    await accountSection
      .getByText(account, { exact: true })
      .click();

    const balance = accountSection
      .locator('label')
      .filter({ hasText: account })
      .locator('span.font-body-lg');
    await expect(balance).toHaveCount(1);
    this.selectedAccount = account;
    this.selectedAccountBalance = await balance.innerText();
  }
);

When(
  'I select {string} from Beneficiaries',
  async function (this: TransferWorld, beneficiary: string): Promise<void> {
    const beneficiarySection = this.page
      .getByRole('heading', { name: 'To Beneficiary' })
      .locator('xpath=../..');
    await beneficiarySection
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
    const status = this.page.getByRole('status');

    if (expectedMessage === 'Transfer created successfully') {
      await expect(status).toContainText(/Transfer #\d+ created successfully!/);
      return;
    }

    await expect(status).toContainText(expectedMessage);
  }
);

Then(
  'my account balance remains unchanged',
  async function (this: TransferWorld): Promise<void> {
    if (!this.selectedAccount || !this.selectedAccountBalance) {
      throw new Error('Select a source account before checking its balance.');
    }

    const accountSection = this.page
      .getByRole('heading', { name: 'From Account' })
      .locator('xpath=../..');
    const balance = accountSection
      .locator('label')
      .filter({ hasText: this.selectedAccount })
      .locator('span.font-body-lg');
    await expect(balance).toHaveText(this.selectedAccountBalance);
  }
);
