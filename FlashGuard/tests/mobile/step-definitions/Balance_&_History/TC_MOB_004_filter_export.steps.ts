// Feature file 2: REQ 3 (filter history) and REQ 4 (export / share screenshot)
import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import page, { FilterLabel } from '../../../../src/support/primeFin-Page';
import { backend, normaliseStatus } from '../../../../src/support/helper';

// ---------- REQ 3: filter by status ("type" in the current app) ----------
When('I filter the history by {string}', async (label: string) => {
  await page.historySummaryLabel.waitForDisplayed({ timeout: 10000 });
  await page.filterChip(label as FilterLabel).click();
});

Then('only {string} transactions should be listed', async (label: string) => {
  const wanted = normaliseStatus(label);
  const statuses = backend().history.map((t) => normaliseStatus(t.status));

  // no pill of any other status may be visible
  for (const other of new Set(statuses.filter((s) => s !== wanted))) {
    expect(await page.countStatusPills(other)).toBe(0);
  }

  // and the wanted status is shown, or the empty state if the backend has none
  if (statuses.includes(wanted)) {
    expect(await page.countStatusPills(wanted)).toBeGreaterThan(0);
  } else {
    await expect(page.emptyHistoryCard).toBeDisplayed();
  }
});

// ---------- @wip: not implemented in App.js yet ('pending' marks the step pending) ----------
When('I set the history date range from {string} to {string}', async () => 'pending');
Then('only transactions dated within that range should be listed', async () => 'pending');

When('I choose to share the first transaction', async () => 'pending');
Then('the Android share sheet should be displayed', async () => 'pending');
Then('the shared file should be an image of that transaction', async () => 'pending');
