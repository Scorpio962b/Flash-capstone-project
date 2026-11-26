// Feature file 1: REQ 1 (balance vs DB) and REQ 2 (history scrolling / load more)
import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import page from '../../../../src/support/primeFin-Page';
import { backend, round2 } from '../../../../src/support/helper';

const firstTitle = (): string => {
  const tx = backend().history[0] as any;
  return tx.title ?? tx.description ?? tx.name;
};

const lastTitle = (): string => {
  const history = backend().history as any[];
  const tx = history[history.length - 1] as any;
  return tx.title ?? tx.description ?? tx.name;
};

// ---------- REQ 1: balance ----------
Then('the {string} card should show the same balance as the backend', async (title: string) => {
  await expect(page.heroCardValue(title)).toBeDisplayed();
  expect(round2(await page.dashboardBalance())).toBe(round2(backend().balance));
});

Then('the available balance on the transfer screen should show the same balance as the backend', async () => {
  expect(round2(await page.transferScreenBalance())).toBe(round2(backend().balance));
});

// ---------- REQ 2: scrolling ----------
Given('the backend has at least {int} transactions', async (min: number) => {
  expect(backend().history.length).toBeGreaterThanOrEqual(min);
});

When('I scroll the history down to the last backend transaction', async () => {
  await page.scrollToRow(lastTitle());
});

Then('the last backend transaction should be visible in the history', async () => {
  await expect(page.rowTitle(lastTitle())).toBeDisplayed();
});

Then('the first backend transaction should no longer be visible', async () => {
  await expect(page.rowTitle(firstTitle())).not.toBeDisplayed();
});

When('I scroll the history back to the first backend transaction', async () => {
  await page.scrollToRow(firstTitle());
});
