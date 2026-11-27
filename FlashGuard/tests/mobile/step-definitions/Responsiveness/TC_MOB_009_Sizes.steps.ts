import { Given, Then } from "@cucumber/cucumber";
import { expect, browser } from "@wdio/globals";
import { LoginScreen } from "../../../../src/pages/mobile/LoginScreen";
import { DashboardScreen } from "../../../../src/pages/mobile/DashboardScreen";
import { MobileActions } from "../../../../src/support/MobileActions";

const dashboard = new DashboardScreen();

Given("I am logged into the FlashGuard application", async () => {
  await MobileActions.restartApp();
  await new LoginScreen().loginAsDemoUser();
  await dashboard.waitUntilLoaded();
});

Given(/^i\s*'?m\s+on the Dashboard screen$/i, async () => {
  await dashboard.waitUntilLoaded();
});

Given("the merchant is on the Dashboard screen", async () => {
  await dashboard.waitUntilLoaded();
});

async function dashboardDisplayedCorrectly() {
  await expect(dashboard.netWorthTitle).toBeDisplayed();

  for (const label of [
    "Dashboard",
    "Services",
    "Transact",
    "History",
    "Account",
  ] as const) {
    await expect(dashboard.navItem(label)).toBeDisplayed();
  }

  const { width } = await browser.getWindowSize();
  const account = dashboard.navItem("Account");
  const { x } = await account.getLocation();
  const { width: itemWidth } = await account.getSize();

  expect(x + itemWidth).toBeLessThanOrEqual(width + 1);
}

Then(
  "the Dashboard screen should be displayed correctly",
  dashboardDisplayedCorrectly,
);
Then(
  "the Dashboard screen should adjust correctly",
  dashboardDisplayedCorrectly,
);

Then("all account information should remain visible", async () => {
  await expect(dashboard.netWorthTitle).toBeDisplayed();
  await expect(dashboard.netWorthValue).toBeDisplayed();
});
