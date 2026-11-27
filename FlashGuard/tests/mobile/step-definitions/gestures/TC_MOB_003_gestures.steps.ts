import { When, Then } from "@wdio/cucumber-framework";
import { expect } from "@wdio/globals";
import { DashboardScreen } from "../../../../src/pages/mobile/DashboardScreen";
import { HistoryScreen } from "../../../../src/pages/mobile/HistoryScreen";
import { MobileActions } from "../../../../src/support/MobileActions";

const dashboard = new DashboardScreen();
const history = new HistoryScreen();

let cardXBefore = 0;

// ---------- T-MOB-GEST-001 ----------

When("I swipe left on the mobile balance card", async () => {
  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  cardXBefore = (await dashboard.pendingApprovalsTitle.getLocation()).x;

  await MobileActions.swipeLeftOn(dashboard.netWorthTitle);
  await browser.pause(1000);
});

Then("the next mobile dashboard card should be visible", async () => {
  await dashboard.pendingApprovalsTitle.waitForDisplayed({ timeout: 10000 });
  const xAfter = (await dashboard.pendingApprovalsTitle.getLocation()).x;

  expect(xAfter).toBeLessThan(cardXBefore);
  await expect(dashboard.pendingApprovalsTitle).toBeDisplayed();
});

// ---------- T-MOB-GEST-002 ----------

When("I tap the mobile history tab", async () => {
  await browser.pause(2000);
  await dashboard.pendingApprovalsTitle.click();
  await browser.pause(1500);
});

Then("the mobile history page should be displayed", async () => {
  await expect(history.title).toBeDisplayed();
  await expect(history.pendingChip).toBeDisplayed();
});

When("I tap the mobile dashboard tab", async () => {
  const dashboardTab = await $('android=new UiSelector().text("Dashboard")');

  await dashboardTab.waitForDisplayed({ timeout: 5000 });
  await dashboardTab.click();

  await browser.pause(2000);

  const source = await browser.getPageSource();

  console.log(">>> SCREEN AFTER DASHBOARD TAP:");
  console.log(source);

  console.log(">>> QUICK ACTIONS visible:", source.includes("QUICK ACTIONS"));

  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  await expect(dashboard.quickActionsLabel).toBeDisplayed();

  await browser.pause(3000);
});

When("I long press the mobile balance card", async () => {
  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  await MobileActions.longPress(dashboard.netWorthTitle);
  await browser.pause(1000);
});

Then("the mobile dashboard should remain stable", async () => {
  await expect(dashboard.netWorthTitle).toBeDisplayed();
  await expect(dashboard.quickActionsLabel).toBeDisplayed();
});
