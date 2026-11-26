import { expect, type Page } from '@playwright/test';
import { BASE_URL, EMAIL, PASSWORD } from './scenario1-data';

export async function loginAsAlice(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);

  await page.getByLabel('Email address').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/dashboard/);
}

export async function prepareTransfer(page: Page): Promise<void> {
  await loginAsAlice(page);
  await page.goto(`${BASE_URL}/transfers`);

  const beneficiarySection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'To Beneficiary' })
  });

  await beneficiarySection.getByText('Bob Wallet', { exact: true }).click();
  await page.getByPlaceholder('0.00').fill('10.00');
  await page.getByPlaceholder('e.g. Invoice INV-2024-001')
    .fill('Scenario 1 test');
}
