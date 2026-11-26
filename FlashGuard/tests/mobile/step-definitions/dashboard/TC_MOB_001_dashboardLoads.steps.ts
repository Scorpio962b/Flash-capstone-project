import { When, Then } from '@wdio/cucumber-framework';
import { DashboardScreen } from '../../../../src/pages/mobile/DashboardScreen';

const dashboard = new DashboardScreen();
const MONEY = /^R\s?[\d\s.,]+$/;

When('I open the mobile dashboard tab', async () => {
  await dashboard.navItem('Dashboard').click();
  await dashboard.waitUntilLoaded();
});

Then('the mobile dashboard balance should be displayed', async () => {
  await expect(dashboard.netWorthTitle).toBeDisplayed();
  expect(await dashboard.balanceText()).toMatch(MONEY);
});

When('I scroll through the dashboard transactions', async () => {
  await dashboard.scrollToRecentTransactions();
});

Then('recent mobile transactions should be visible', async () => {
  await expect(dashboard.recentTransactionsHeader).toBeDisplayed();
  await expect(dashboard.viewAll).toBeDisplayed();
});

When('I refresh the mobile balance', async () => {
  // Pull-down gesture. The app has no RefreshControl, so nothing actually reloads.
  const { width, height } = await driver.getWindowRect();
  await driver.execute('mobile: swipeGesture', {
    left: Math.round(width * 0.4), top: Math.round(height * 0.25),
    width: Math.round(width * 0.2), height: Math.round(height * 0.4),
    direction: 'down', percent: 0.75,
  });
});

Then('the mobile dashboard balance should still be displayed', async () => {
  await expect(dashboard.netWorthTitle).toBeDisplayed();
  expect(await dashboard.balanceText()).toMatch(MONEY);
});