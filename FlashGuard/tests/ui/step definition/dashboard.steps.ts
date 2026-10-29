import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { UserWorld } from '../../support/World';
import { expectAccountBalance, mockAccountBalance, updateMockAccountBalance, } from '../../support/helpers';

interface DashboardWorld extends UserWorld { page: Page }


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
    const transactions = this.page.getByText(/^Transfer #\d+$/);

    await expect(transactions.first()).toBeVisible();
    await expect(this.page.getByText('Transfer #3')).toBeVisible();
    await expect(this.page.getByText('Transfer #2')).toBeVisible();
    await expect(this.page.getByText('Transfer #1')).toBeVisible();
  });


// @IntegrationBalanceAccuracyDisplay
// And the account balance is "<expectedBalance>"
Given(`the account balance is {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    await mockAccountBalance(this, expectedBalance);
});

// The When step "I open the dashboard" is defined above.
Then(`the displayed balance should be {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    await expectAccountBalance(this, expectedBalance);
  });

// @FunctionalBalanceAccuracy
// And my initial balance is "<initialBalance>"
Given(`my initial balance is {string}`, async function (this: DashboardWorld, initialBalance: string) {
    await mockAccountBalance(this, initialBalance);
    await this.page.goto('http://localhost:3000/dashboard');
    await expectAccountBalance(this, initialBalance);
  });

// When my account balance is updated to "<updatedBalance>"
When(`my account balance is updated to {string}`, async function (this: DashboardWorld, updatedBalance: string) {
    await updateMockAccountBalance(this, updatedBalance);
    await this.page.goto('http://localhost:3000/dashboard');
  });

// Then the dashboard should display "<updatedBalance>"
Then(`the dashboard should display {string}`, async function (this: DashboardWorld, expectedBalance: string) {
    await expectAccountBalance(this, expectedBalance);
  });


// @FunctionalRecentTransactionsDisplay
// And the account containing <transactionCount> transactions
Given(`the account containing {int} transactions`, async function (this: DashboardWorld, transactionCount: number) {
   const transactions = Array.from({ length: transactionCount }, (_, index) => ({
     id: index + 1,
     sender_account_id: 1,
     recipient_account_id: 2,
     transaction_type: 'transfer',
     amount: 25,
     status: 'pending',
     created_at: new Date().toISOString(),
   }));
   await this.page.route(
     (url) => url.pathname === '/transactions/history',
     (route) => route.fulfill({ json: transactions }),
   );
  });

// The When step "I open the dashboard" is defined above.
Then(`I should see {int} recent transactions`, async function (this: DashboardWorld, expectedCount: number) {
    await expect(this.page.getByText(/^Transfer #\d+$/)).toHaveCount(expectedCount);
  });
