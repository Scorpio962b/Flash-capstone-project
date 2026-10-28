import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { CustomWorld } from '../../support/World';

interface NotificationsWorld extends CustomWorld { page: Page; }

 //SCENARIO: Open the notifications panel

Given(`I am signed in with a valid account`, async function (this: NotificationsWorld) {
   await this.page.goto(' http://localhost:3000/login');
   await this.page.getByPlaceholder('you@example.com').fill('alice@flashguard.local');
   await this.page.getByPlaceholder('Enter your password').fill('offline-demo');
   await this.page.getByRole('button', { name: 'Sign In' }).click();
});

Given(`I am on the account dashboard`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
});


When(`I click the notifications bell icon`, async function (this: NotificationsWorld) {
    const notificationBell = this.page.locator('button').filter({
        has: this.page.locator('span.material-symbols-outlined:text-is("notifications")'),
      });

    await expect(notificationBell).toBeVisible();
    await notificationBell.click();
  },
);


Then(`the notifications panel should be displayed`, async function (this: NotificationsWorld) {
    await expect( this.page.getByTestId('notifications-panel')).toBeVisible();
  },
);


Then(`I should be able to view my notifications`, async function (this: NotificationsWorld) {
    const notificationItems = this.page.getByTestId('notification-item');

    await expect(notificationItems.first()).toBeVisible();
  },
);


//SCENARIO: Display a notification after a successful transfer

Given(`I have sufficient funds to make a transfer`, async function (this: NotificationsWorld) {
    await this.page.goto('http://localhost:3000/dashboard');
});

When(`I complete a successful money transfer`, async function (this: NotificationsWorld) {

// Navigate to the transfer page, fill in the transfer details, and submit the transfer.
    await this.page.goto('http://localhost:3000/transfers');
    await expect( this.page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();
 
// Select the source account
    await this.page.getByText('Alice Ledger').click(); 
 
// Select the source beneficiary
    await this.page.getByText('Bob Wallet').click();
 
// Select the amount
    await this.page.getByPlaceholder('0.00').fill('50.00');
    await this.page.getByRole('button', { name: 'lock Confirm & Transfer'}).click();
});

Then(`a transfer success notification should be displayed`, async function (this: NotificationsWorld) {
    await expect( this.page.getByTestId('transfer-success-notification')).toBeVisible();
  });

Then(`the notification should confirm that the transfer was successful`, async function (this: NotificationsWorld) {
    await expect( this.page.getByTestId('transfer-success-notification')
    ).toContainText(/transfer.*successful|success.*transfer/i);
  });


//SCENARIO: Display an account alert

When(`an account alert is triggered`, async function (this: NotificationsWorld) {
  await this.page.goto('http://localhost:3000/dashboard');
});

Then(`an in-app notification should be displayed`, async function (this: NotificationsWorld) {
    await expect( this.page.getByTestId('account-alert-notification')).toBeVisible();
  },
);

Then(`the notification should contain the relevant alert information`, async function (this: NotificationsWorld) {
    const accountAlert = this.page.getByTestId( 'account-alert-notification');

    await expect(accountAlert).toBeVisible();
    await expect(accountAlert).not.toBeEmpty();
  },
);


 //SCENARIO: Display an error message when a transaction fails

When(`I attempt a transaction that fails`, async function (this: NotificationsWorld) {
// Navigate to the transfer page, fill in the transfer details, and submit the transfer.
    await this.page.goto('http://localhost:3000/transfers');
    await expect( this.page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();
 
// Select the source account
    await this.page.getByText('Alice Ledger').click(); 
 
// Select the source beneficiary
    await this.page.getByText('Bob Wallet').click();
 
// Select the amount
    await this.page.getByPlaceholder('0.00').fill('-1.00'); // Invalid amount to trigger failure
    await this.page.getByRole('button', { name: 'lock Confirm & Transfer'}).click();
});

Then(`an error toast or modal should be displayed`, async function (this: NotificationsWorld) {
    const errorMessage = this.page.getByTestId('transaction-error-message');

    await expect(errorMessage).toBeVisible();
  },
);

Then(`the error message should explain why the transaction failed`, async function (this: NotificationsWorld) {
    const errorMessage = this.page.getByTestId('transaction-error-message');

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).not.toBeEmpty();
  },
);

