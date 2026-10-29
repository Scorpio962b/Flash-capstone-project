import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  get error()   { return this.page.getByTestId('login-error')};
  get locked()  { return this.page.getByTestId('account-locked')};
  get expired() { return this.page.getByTestId('session-expired')};

  async open() {
    await this.page.goto('http://localhost:3000');
    await this.page.getByRole('link', { name: 'Sign In' }).click();
  }
  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }
  async expectVisible() {
    await expect(this.page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  }
}




