import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { UserWorld } from '../../support/World';

interface NotificationsWorld extends UserWorld { page: Page; }

  const API_ORIGIN = 'http://localhost:4000';

Given(`I am signed in with a valid account`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/login');
    await this.loginPage.login('alice@flashguard.local', 'offline-demo');
    await this.page.waitForURL('**/dashboard');
    await this.dashboardPage.expectLoaded();
  });

  Given(`I am on the account dashboard`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
    await this.dashboardPage.expectLoaded();
});


  When(`I click the notifications bell icon`, async function (this: NotificationsWorld) {
    const notificationBell = this.page.locator('button').filter({
      has: this.page.locator('span.material-symbols-outlined:text-is("notifications")'),
    });

    await expect(notificationBell).toHaveCount(1);
    await expect(notificationBell).toBeVisible();
    await notificationBell.click();
  });

  Then(`the notifications panel should remain unavailable`, async function (this: NotificationsWorld) {
    await expect(this.page).toHaveURL(/\/dashboard$/);
    await expect(this.page.getByRole('heading', { name: 'Notifications' })).toHaveCount(0);
    await expect(this.page.getByTestId('notifications-panel')).toHaveCount(0);
  });

  Then(`no notification entries should be displayed`, async function (this: NotificationsWorld) {
    await expect(this.page.getByTestId('notification-item')).toHaveCount(0);
  });

  async function submitTransfer(
    world: NotificationsWorld,
    amount: string,
    response: { status: number; body: Record<string, unknown> },
  ) {
    await world.page.goto('http://localhost:3000/transfers');
    await expect(world.page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

    const sourceAccount = world.page
      .locator('section')
      .filter({ has: world.page.getByRole('heading', { name: 'From Account' }) })
      .getByRole('radio', { name: /Alice Ledger/ });
    await sourceAccount.check();

    const beneficiarySection = world.page
      .locator('section')
      .filter({ has: world.page.getByRole('heading', { name: 'To Beneficiary' }) });
    await beneficiarySection.getByText('Bob Wallet', { exact: true }).click();

    await world.page.route(
      (url) => url.origin === API_ORIGIN &&
        url.pathname === '/transactions/transfer',
      async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        await route.fulfill({ status: response.status, json: response.body });
      },
    );
    await world.page.getByPlaceholder('0.00').fill(amount);
    await world.page.getByRole('button', { name: /Confirm & Transfer/ }).click();
  }

  //SCENARIO: Display a notification after a successful transfer

  Given(`I have sufficient funds to make a transfer`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
    await expect(this.page.getByText('Alice Ledger', { exact: true })).toBeVisible();
  });

  When(`I complete a successful money transfer`, async function (this: NotificationsWorld) {
    await submitTransfer(this, '50.00', {
      status: 201,
      body: { id: 9001, status: 'pending' },
    });
  });

  Then(`a transfer success notification should be displayed`, async function (this: NotificationsWorld) {
    await expect(this.page.getByRole('status')).toContainText(/Transfer #9001 created successfully/i);
  });

  Then(`the notification should confirm that the transfer was successful`, async function (this: NotificationsWorld) {
    await expect(this.page.getByRole('status')).toContainText(/Transfer #9001 created successfully/i);
  });


  //SCENARIO: Record the account-alert display defect

  Given(`a high-value account alert is available`, async function (this: NotificationsWorld) {
    const alert = {
      id: 9002,
      amount: 12000,
      compliance_flag: 'aml',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    await this.page.route(
      (url) => url.origin === API_ORIGIN && url.pathname === '/alerts',
      (route) => route.fulfill({ json: [alert] }),
    );

    const response = await this.page.evaluate(async () => {
      const result = await fetch('http://localhost:4000/alerts');
      return { status: result.status, alerts: await result.json() };
    });
    expect(response.status).toBe(200);
    expect(response.alerts).toEqual([alert]);
  });

  When(`I open the account dashboard`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
    await this.dashboardPage.expectLoaded();
  });

  Then(`the account alert should not be displayed on the dashboard`, async function (this: NotificationsWorld) {
    await expect(this.page.getByText('Transaction #9002', { exact: true })).toHaveCount(0);
    await expect(this.page.getByTestId('account-alert-notification')).toHaveCount(0);
  });

  Then(`the account alert details should remain unavailable in the dashboard`, async function (this: NotificationsWorld) {
    await expect(this.page.getByText(/Manual review required/i)).toHaveCount(0);
  });


  //SCENARIO: Display an error message when a transaction fails

  When(`I attempt a transaction that fails`, async function (this: NotificationsWorld) {
    await submitTransfer(this, '999999.00', {
      status: 400,
      body: { message: 'Insufficient funds' },
    });
  });

  Then(`an error toast or modal should be displayed`, async function (this: NotificationsWorld) {
    await expect(this.page.getByRole('status')).toContainText('Insufficient funds');
  });

  Then(`the error message should explain why the transaction failed`, async function (this: NotificationsWorld) {
    await expect(this.page.getByRole('status')).toContainText('Insufficient funds');
  });
