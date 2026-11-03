// steps/recipient-validation.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { UserWorld } from '../../support/World';

interface TransferWorld extends UserWorld {
  page: Page;
}

Given(
  'I am on the transfer page',
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
  'I select {string} from Accounts tab and leave Beneficiaries empty',
    async function (this: FlashWorld, account: string) {
  
    await this.page.getByText('Alice Ledger').click();

    await this.page.getByText(account, { exact: true }).click();
  }
);

When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);

    await this.page.getByRole('button', { name: /Confirm & Transfer/ }).click();
  }
);
Then(
  'no transaction should be recorded',
  async function (this: TransferWorld): Promise<void> {
    await expect(this.page.getByRole('status')).not.toContainText("");
  }
);
When('I enter {string} in the Amount field',async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);
  }
);

Then('I see the message {string}',async function (this: TransferWorld,expectedMessage: string
  ): Promise<void> {
    await expect(this.page.getByRole('status')).toContainText(expectedMessage);
  }
);

Then(
  'my balance is {string}',async function (this: TransferWorld, balance: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'From Account' }).locator('xpath=../..')
    ).toContainText(balance);
  }
);


Then(
  'no transaction should be recorded',async function (this: TransferWorld): Promise<void> {
  await expect(this.page.getByRole('status')).not.toContainText(/Transfer #\d+ createdsuccessfully!/);
  }
);
When(
  'I select no beneficiary',
  async function (this: TransferWorld): Promise<void> {
    await this.page.getByRole('button', { name: /Clear beneficiary|Remove beneficiary/i }).click();
  }
);
When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);

    await this.page.getByRole('button', { name: /Confirm & Transfer/i }) .click();
  }
);
Then('I see the message {string}',async function (this: TransferWorld,
    expectedMessage: string
  ): Promise<void> {
    await expect(this.page.getByRole('status'))
      .toContainText(expectedMessage);
  }
);

When(
  'I select {string} from Accounts tab and select {string} from Beneficiaries',
  async function (
    this: TransferWorld,
    account: string,
    beneficiary: string
  ): Promise<void> {
    await this.page
      .getByRole('heading', { name: 'From Account' })
      .locator('xpath=../..')
      .getByText(account, { exact: true })
      .click();

    await this.page
      .getByRole('heading', { name: 'To Beneficiary' })
      .locator('xpath=../..')
      .getByText(beneficiary, { exact: true })
      .click();
  }
);

When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);

    await this.page.getByRole('button', { name: /Confirm & Transfer/i }).click();
  }
);
When(
  'I select {string} from Accounts tab',
  async function (this: TransferWorld, account: string): Promise<void> {
    await this.page
      .getByRole('heading', { name: 'From Account' })
      .locator('xpath=../..')
      .getByText(account, { exact: true })
      .click();
  }
);

When(
  'I search for {string} in the Beneficiaries section',
  async function (this: TransferWorld, beneficiary: string): Promise<void> {
    await this.page
      .getByRole('heading', { name: 'To Beneficiary' })
      .locator('xpath=../..')
      .getByPlaceholder('Search beneficiaries')
      .fill(beneficiary);
  }
);

When(
  'no matching beneficiary is displayed',
  async function (this: TransferWorld): Promise<void> {
    await expect(
      this.page.getByText('No matching beneficiaries found')
    ).toBeVisible();
  }
);

When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);

    await this.page
      .getByRole('button', { name: /Confirm & Transfer/i })
      .click();
  }
);
When(
  'I select {string} from Accounts tab and select {string} from Beneficiaries',
  async function (
    this: TransferWorld,
    account: string,
    beneficiary: string
  ): Promise<void> {
    await this.page
      .getByRole('heading', { name: 'From Account' })
      .locator('xpath=../..')
      .getByText(account, { exact: true })
      .click();

    await this.page
      .getByRole('heading', { name: 'To Beneficiary' })
      .locator('xpath=../..')
      .getByText(beneficiary, { exact: true })
      .click();
  }
);

When(
  'I enter {string} in the Amount field and submit the transfer',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);

    await this.page
      .getByRole('button', { name: /Confirm & Transfer/i })
      .click();
  }
);
When(
  'I enter {string} in the Amount field',
  async function (this: TransferWorld, amount: string): Promise<void> {
    await this.page.getByPlaceholder('0.00').fill(amount);
  }
);

When(
  'I enter the OTP {string} to confirm the transfer',
  async function (this: TransferWorld, otp: string): Promise<void> {
    await this.page.getByLabel('OTP').fill(otp);

    await this.page
      .getByRole('button', { name: /Confirm|Verify|Submit/i })
      .click();
  }
);
