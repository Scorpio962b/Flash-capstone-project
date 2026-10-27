import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { CustomWorld } from '../../support/World';

interface DashboardWorld extends CustomWorld { page: Page }

// Format used in dashboard
function formatBalance(balance: string): string {

  const amount = Number(balance);
  if (!Number.isFinite(amount)) { throw new Error(`Invalid balance: "${balance}"`) }
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(amount).replace(/\u202f/g, ' ');

}

// The Background sign-in step should be defined once in a shared step file.
Given(`I am signed in`, async function (this: DashboardWorld) {
  await this.page.goto(' http://localhost:3000/login');
  await this.page.getByPlaceholder('you@example.com').fill('alice@flashguard.local');
  await this.page.getByPlaceholder('Enter your password').fill('offline-demo');
  await this.page.getByRole('button', { name: 'Sign In' }).click();
});

// @SmokeDashboardDisplay
// When I open the dashboard
When(`I open the dashboard`, async function (this: DashboardWorld) {
  await this.page.goto('http://localhost:3000/dashboard');
});

Then(`the Portfolio Overview heading should be visible`, async function (this: DashboardWorld) {
    await expect(this.page.getByRole('heading', { name: 'Portfolio Overview' })).toBeVisible();
  });

Then(`my account balance should be displayed`, async function (this: DashboardWorld) {
    await expect(this.page.getByText('Alice Ledger')).toBeVisible();
    await expect(this.page.getByText('R 10 000,00')).toBeVisible();
  });

Then(`recent transaction details should be displayed`, async function (this: DashboardWorld) {
    const transactions = this.page.getByTestId('recent-transaction');

    await expect(transactions.first()).toBeVisible();
    await expect(this.page.getByText('Transfer #3')).toBeVisible();
    await expect(this.page.getByText('Transfer #2')).toBeVisible();
    await expect(this.page.getByText('Transfer #1')).toBeVisible();
  });


// @IntegrationBalanceAccuracyDisplay
// And the account balance is "<expectedBalance>"
Given(`the account balance is {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    const formattedExpectedBalance = formatBalance(expectedBalance);
    await expect(this.page.getByText(formattedExpectedBalance, { exact: false })).toBeVisible();
});

// The When step "I open the dashboard" is defined above.
Then(`the displayed balance should be {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    const formattedExpectedBalance = formatBalance(expectedBalance);
    await expect(this.page.getByText(formattedExpectedBalance, { exact: false })).toBeVisible();
  });

// @FunctionalBalanceAccuracy
// And my initial balance is "<initialBalance>"
Given(`my initial balance is {string}`, async function (this: DashboardWorld, initialBalance: string) {
    const formattedInitialBalance = formatBalance(initialBalance);
    await expect(this.page.getByText(formattedInitialBalance, { exact: false })).toBeVisible();
  });

// When my account balance is updated to "<updatedBalance>"
When(`my account balance is updated to {string}`, async function (this: DashboardWorld, updatedBalance: string) {
    const formattedUpdatedBalance = formatBalance(updatedBalance);
    await expect(this.page.getByText(formattedUpdatedBalance, { exact: false })).toBeVisible();
  });

// Then the dashboard should display "<updatedBalance>"
Then(`the dashboard should display {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    const formattedUpdatedBalance = formatBalance(expectedBalance);
    await expect(this.page.getByText(formattedUpdatedBalance, { exact: false })).toBeVisible();
  });


// @FunctionalRecentTransactionsDisplay
// And the account containing <transactionCount> transactions
Given(`the account containing {int} transactions`, async function (this: DashboardWorld, transactionCount: number) {
   await expect(this.page.getByTestId('recent-transaction')).toHaveCount(transactionCount);
  });

// The When step "I open the dashboard" is defined above.
Then(`I should see {int} recent transactions`, async function (this: DashboardWorld, expectedCount: number) {
    await expect(this.page.getByTestId('recent-transaction')).toHaveCount(expectedCount);
  });
