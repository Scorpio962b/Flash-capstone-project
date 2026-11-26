// Steps used by BOTH feature files. Cucumber step definitions are global, so each step
// text must be defined exactly once across all files in this folder.
import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import page, { NavLabel } from '../../../../src/support/primeFin-Page';
import { ctx, getBackendState } from '../../../../src/support/helper';

const firstTitle = () => {
  const tx = (ctx.backend as any)?.transactions?.[0] ?? (ctx.backend as any)?.history?.[0];
  return tx?.title ?? tx?.description ?? tx?.name ?? '';
};

// ---------- Background ----------
Given('I am logged in to PrimeFin SA', async () => {
  await page.login();
  ctx.backend = await getBackendState();
});

Given('the dashboard balance has loaded', async () => {
  await page.waitForBalanceLoaded();
});

When('I open the {string} tab', async (label: string) => {
  await page.openTab(label as NavLabel);
});

// ---------- History (used by the scroll scenario and the filter scenario) ----------
Then('the first backend transaction should be visible in the history', async () => {
  await page.historySummaryLabel.waitForDisplayed({ timeout: 10000 });
  await expect(page.rowTitle(firstTitle())).toBeDisplayed();
});
// ---------- History (used by the scroll scenario and the filter scenario) ----------
Then('the first backend transaction should be visible in the history', async () => {
  await page.historySummaryLabel.waitForDisplayed({ timeout: 10000 });
  await expect(page.rowTitle(firstTitle())).toBeDisplayed();
});
