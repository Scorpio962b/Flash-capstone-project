import {Given, When, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import type { Page } from '@playwright/test';

import { CustomWorld } from '../../support/World';

interface ManageAccountWorld extends CustomWorld{
    page: Page
};

Given('I am logged in and see the homepage ', async function(this: ManageAccountWorld): Promise<void> {
     await this.page.goto('http://localhost:3000/dashboard');
     await this.page.getByRole('textbox', {name: 'Email address'}).fill('alice@flashguard.local');
     await this.page.getByRole('textbox', {name: 'Password'}).fill('offline-demo ');
     await this.page.getByRole('button', {name: 'Sign in'}).click();

});