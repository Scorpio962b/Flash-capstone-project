import {Given, When, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import type { Page } from '@playwright/test';

import { UserWorld} from '../../support/World';

interface ManageAccountWorld extends UserWorld{
    page: Page
};

Given('I am logged in and see the homepage ', async function(this: ManageAccountWorld): Promise<void> {
     await this.page.goto('http://localhost:3000');
     await this.page.getByRole('textbox', {name: 'Email address'}).fill('alice@flashguard.local');
     await this.page.getByRole('textbox', {name: 'Password'}).fill('offline-demo ');
     await this.page.getByRole('button', {name: 'Sign in'}).click();

     await expect(this.page.getByRole('heading', {name: 'Portfolio Overview'})).toBeVisible()
});

When('I select Account Profile', async function(this: ManageAccountWorld): Promise<void> {
    await this.page.getByRole('link', { name: /profile/i }).click();

});

When( 'I update {string}', async function(this: ManageAccountWorld): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Fullname'}).fill('Alice Ledger');

});

When('I update {string}', async function(this: ManageAccountWorld): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Email'}).fill('alice@flashguard.local');

});

When('I update {string}', async function(this:ManageAccountWorld): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Phone Number'}).fill('0794867890');

});

When('I change {string}', async function(this:ManageAccountWorld): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Password'}).fill('Capstone-Merchant');

});

Then('I see {string} result', async function(this:ManageAccountWorld): Promise<void> {
    await expect(this.page.getByRole('status')).toContainText('Account profile updated successfully');

});


Given('I am logged in and see the homepage ', async function(this: ManageAccountWorld): Promise<void> {
     await this.page.goto('http://localhost:3000');
     await this.page.getByRole('textbox', {name: 'Email address'}).fill('alice@flashguard.local');
     await this.page.getByRole('textbox', {name: 'Password'}).fill('offline-demo ');
     await this.page.getByRole('button', {name: 'Sign in'}).click();

     await expect(this.page.getByRole('heading', {name: 'Portfolio Overview'})).toBeVisible()
});

When('I navigate to payment methods feature', async function(this: ManageAccountWorld): Promise<void> {
     await this.page.getByRole('link', { name: 'credit_card payment methods'}).click();

     await expect(this.page.getByRole('heading', {name: 'Payment Methods'})).toBeVisible();
});

When('I click add payment method to enter my {string}', async function(this: ManageAccountWorld, cardNumber: string): Promise<void> {
    await this.page.getByRole('button', {name: 'add Add Payment Method'}).click();
    await this.page.getByRole('textbox', {name: 'Card Number(16 digits)'}).fill(cardNumber);

});

When('I enter my {string}', async function(this:ManageAccountWorld, Nickname:string): Promise<void> {
    await this.page.getByRole('textbox', {name: 'Nickname (e.g., My Visa)'}).fill(Nickname);

});

When('I enter my {string}', async function(this:ManageAccountWorld, expiryDate: string): Promise<void> {
     await this.page.getByRole('textbox', {name: 'Expiry Date (MM/YY)'}).fill(expiryDate);
   
});

When('I enter my {string} and click add card', async function(this: ManageAccountWorld, CVV: string): Promise<void> {
     await this.page.getByRole('textbox', {name: 'CVV'}).fill(CVV);
     await this.page.getByRole('button', {name: 'Add Card'}).click();

});

Then('I see {string} result for my payment method', async function(this:ManageAccountWorld, expectedMessage: string): Promise<void> {
    await expect(this.page.getByRole('status', {name: 'Payment method added successfully'})).toContainText(expectedMessage)
});