const { Given, Then } = require("@cucumber/cucumber");
const { expect, browser } = require("@wdio/globals");
const h = require("../support/helpers");

Given(/^I am logged into the FlashGuard application$/, async () => {
  await h.ensureLoggedIn();
});

// the feature text is "im  on the Dashboard screen" (typo and double space)
Given(/^i\s*'?m\s+on the Dashboard screen$/i, async () => {
  await h.goToDashboard();
});

Given(/^the merchant is on the Dashboard screen$/, async () => {
  await h.ensureLoggedIn();
  await h.goToDashboard();
});

async function dashboardDisplayedCorrectly() {
  await expect(await h.waitShown(h.DASHBOARD.welcome(), "Welcome back,", 15000)).toBeDisplayed();
  await expect(await h.waitShown(h.DASHBOARD.netWorth(), "Total Net Worth", 15000)).toBeDisplayed();
  for (const label of h.NAV_LABELS) {
    await expect(await h.waitShown(h.nav(label), `${label} tab`, 10000)).toBeDisplayed();
  }
  // bottom nav must fit inside the screen width
  const { width } = await browser.getWindowSize();
  const { x } = await h.nav("Account").getLocation();
  const { width: w } = await h.nav("Account").getSize();
  expect(x + w).toBeLessThanOrEqual(width + 1);
}

Then(/^the Dashboard screen should be displayed correctly$/, dashboardDisplayedCorrectly);
Then(/^the Dashboard screen should adjust correctly$/, dashboardDisplayedCorrectly);

Then(/^all account information should remain visible$/, async () => {
  await expect(await h.waitShown(h.DASHBOARD.welcome(), "Welcome back,", 10000)).toBeDisplayed();
  await expect(await h.waitShown(h.DASHBOARD.netWorth(), "Total Net Worth", 10000)).toBeDisplayed();
});

