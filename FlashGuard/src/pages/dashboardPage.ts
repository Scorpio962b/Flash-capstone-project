import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

get heading() {
    return this.page.getByRole('heading', { name: 'Portfolio Overview' });
  }
async open() {await this.page.goto('http://localhost:3000/dashboard')};
async expectLoaded() {await expect(this.heading).toBeVisible();}
async logout() {await this.page.getByRole('button', { name: /sign out|log out/i }).click()};
async interact() {await this.heading.click();}
}