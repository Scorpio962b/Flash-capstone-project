import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { CustomWorld } from '../../support/World';
import {setWorldConstructor,World,} from '@cucumber/cucumber';
import {Browser,BrowserContext,} from '@playwright/test';

interface DashboardWorld extends CustomWorld { page: Page; }

// Helper to format account balances as currency.
// Example: "1000.00" -> "R 1 000,00"
function formatBalance(balance: string): string {
  const amount = Number(balance);

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(/\u202f/g, ' ');
}

// --------------------------------------------------
// GIVEN: Signed-in user
// --------------------------------------------------

Given(`I am signed in with a valid account`, async function (this: DashboardWorld) {
    // Assumes your authentication setup has already signed in the user.
    // If not, replace this with your existing login helper.
    await expect(this.page).toHaveURL('http://localhost:3000/dashboard');
  },
);

// --------------------------------------------------
// WHEN: Open dashboard
// --------------------------------------------------

When(`I open the dashboard`, async function (this: DashboardWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
    await expect( this.page.getByRole('heading', { name: 'Portfolio Overview', }),).toBeVisible();
  },
);

// --------------------------------------------------
// THEN: Dashboard display assertions
// --------------------------------------------------

Then( `the Portfolio Overview heading should be visible`, async function (this: DashboardWorld) {
    await expect( this.page.getByRole('heading', { name: 'Portfolio Overview',}),).toBeVisible();
  },
);

Then(`the welcome message should be visible`, async function (this: DashboardWorld) {
    await expect( this.page.getByText( 'Welcome back, Alice. Here is your summary for today.',)).toBeVisible();
  },
);

Then(`the total net worth should be displayed`, async function (this: DashboardWorld) {
    await expect( this.page.getByText('TOTAL NET WORTH')).toBeVisible();
    await expect( this.page.getByText('R 12 950,00')).toBeVisible();
  },
);

Then(`my account balance should be displayed`, async function (this: DashboardWorld) {
    await expect(this.page.getByText('Alice Ledger'),).toBeVisible();
    await expect(this.page.getByText('R 10 000,00'),).toBeVisible();
  },
);

Then(`recent transaction details should be displayed`, async function (this: DashboardWorld) {
    const recentTransactions = this.page
      .getByRole('heading', { name: 'Recent Transactions' })
      .locator('..');

    await expect( this.page.getByText('Transfer #1')).toBeVisible();
    await expect( this.page.getByText('Transfer #2')).toBeVisible();
    await expect(this.page.getByText('Transfer #3')).toBeVisible();
    await expect(this.page.getByText('completed')).toBeVisible();
    await expect(this.page.getByText('pending')).toBeVisible();
    await expect(this.page.getByText('rejected'),).toBeVisible();
  },
);

Then(`the spending summary should be visible`, async function (this: DashboardWorld) {
    await expect( this.page.getByRole('heading', { name: 'Spending Summary'})).toBeVisible();
  },
);

// --------------------------------------------------
// GIVEN: Account with a specified balance
// --------------------------------------------------

Given(`I am signed in with an account balance of {string}`, async function (
    this: DashboardWorld,
    expectedBalance: string,
  ) {
    // TODO:
    // Set up the account with expectedBalance using your API,
    // database setup, or existing test-data helper.
    //
    // This step must prepare the account before opening
    // the dashboard. Do not merely check the displayed value here.

    await expect(this.page).toHaveURL(/dashboard/);
  },
);

// --------------------------------------------------
// THEN: Displayed balance matches expected balance
// --------------------------------------------------

Then(`the displayed balance should be {string}`, async function (
    this: DashboardWorld,
    expectedBalance: string, )
     {
        const formattedBalance = formatBalance(expectedBalance);

    await expect(this.page.getByText(formattedBalance, { exact: false })).toBeVisible();
  },
);

// --------------------------------------------------
// GIVEN: Viewing dashboard
// --------------------------------------------------

Given(`I am viewing the dashboard`, async function (this: DashboardWorld) {
    await this.page.goto('/dashboard');
    await expect( this.page.getByRole('heading', { name: 'Portfolio Overview'})).toBeVisible();
  },
);

Given(`my initial balance is {string}`, async function (
    this: DashboardWorld,
    initialBalance: string,
  ) {
    // TODO:
    // Set the account balance to initialBalance
    // through your test setup or API helper.

    const formattedBalance = formatBalance(initialBalance);

    await expect( this.page.getByText(formattedBalance, { exact: false}),).toBeVisible();
  },
);

// --------------------------------------------------
// WHEN: Account balance changes
// --------------------------------------------------

When(`my account balance is updated to {string}`, async function (
    this: DashboardWorld,
    updatedBalance: string,
  ) {
    // TODO:
    // Update the balance using your API or test helper.
    //
    // If your app updates automatically, wait for the UI
    // to receive the new balance.

    this.page.setDefaultTimeout(5000);

    const formattedBalance = formatBalance(updatedBalance);

    await expect( this.page.getByText(formattedBalance, { exact: false})).toBeVisible();
  },
);

// --------------------------------------------------
// THEN: Dashboard reflects updated balance
// --------------------------------------------------

Then(`the dashboard should display {string}`, async function (
    this: DashboardWorld,
    expectedBalance: string,
  ) {
    const formattedBalance = formatBalance(expectedBalance);

    await expect( this.page.getByText(formattedBalance, { exact: false})).toBeVisible();
  },
);

// --------------------------------------------------
// GIVEN: Account containing a specified number of transactions
// --------------------------------------------------

Given(`I am signed in with an account containing {int} transactions`, async function (
    this: DashboardWorld,
    transactionCount: number,
  ) {
    // TODO:
    // Seed exactly transactionCount transactions
    // using your API or database test-data helper.

    await expect(this.page).toHaveURL(/dashboard/);
  },
);

// --------------------------------------------------
// THEN: Number of recent transactions
// --------------------------------------------------

Then(`I should see {int} recent transactions`, async function (
    this: DashboardWorld,
    expectedCount: number,
  ) {
    const transactionRows = this.page.locator(
      '[data-testid="recent-transaction"]',
    );

    await expect(transactionRows).toHaveCount(expectedCount);
  },
);
