import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import { DashboardScreen } from '../../../../src/pages/mobile/DashboardScreen';
import { HistoryScreen } from '../../../../src/pages/mobile/HistoryScreen';
import { MobileActions } from '../../../../src/support/MobileActions';

const dashboard = new DashboardScreen();
const history = new HistoryScreen();

let cardXBefore = 0;

// One touch press on the lower part of a bottom tab, found with a UiSelector.
async function tapTabOnce(name: string) {
  const tab = await $(
    `android=new UiSelector().descriptionMatches(".*, ${name}").clickable(true)`
  );

  await tab.waitForDisplayed({ timeout: 5000 });

  const { x, y } = await tab.getLocation();
  const { width, height } = await tab.getSize();

  const tapX = Math.round(x + width / 2);
  const tapY = Math.round(y + height - 15);

  console.log(`>>> tapping ${name} at (${tapX}, ${tapY})`);

  await browser
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: tapX, y: tapY })
    .down()
    .pause(150)
    .up()
    .perform();
}

// Taps the tab, then records what the screen looks like. Retries up to 3 times.
async function openTab(name: string, isOpen: () => Promise<boolean>) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`>>> ${name} tab: tap attempt ${attempt}`);

    await tapTabOnce(name);
    await browser.pause(1500);

    await browser.saveScreenshot(
      `./tab-${name}-attempt${attempt}-${Date.now()}.png`
    );

    const src = await browser.getPageSource();

    const texts = [...src.matchAll(/ text="([^"]+)"/g)]
      .map((m) => m[1])
      .slice(0, 15);

    console.log(`>>> visible texts: ${texts.join(' | ')}`);

    if (await isOpen()) return;
  }

  throw new Error(`${name} tab did not open after 3 taps`);
}

// QUICK ACTIONS only exists on the dashboard screen.
const onDashboard = async () =>
  (await browser.getPageSource()).includes('QUICK ACTIONS');

// ---------- T-MOB-GEST-001 ----------

When('I swipe left on the mobile balance card', async () => {
  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  cardXBefore = (await dashboard.pendingApprovalsTitle.getLocation()).x;

  await MobileActions.swipeLeftOn(dashboard.netWorthTitle);
  await browser.pause(1000);
});

Then('the next mobile dashboard card should be visible', async () => {
  await dashboard.pendingApprovalsTitle.waitForDisplayed({ timeout: 10000 });
  const xAfter = (await dashboard.pendingApprovalsTitle.getLocation()).x;

  expect(xAfter).toBeLessThan(cardXBefore);
  await expect(dashboard.pendingApprovalsTitle).toBeDisplayed();
});

// ---------- T-MOB-GEST-002 ----------

When('I tap the mobile history tab', async () => {
  await browser.pause(2000);

  // Open History through the Pending Approvals card.
  await dashboard.pendingApprovalsTitle.click();

  await browser.pause(1500);
});

Then('the mobile history page should be displayed', async () => {
  await expect(history.title).toBeDisplayed();
  await expect(history.pendingChip).toBeDisplayed();
});

When('I tap the mobile dashboard tab', async () => {
  const dashboardTab = await $(
    'android=new UiSelector().text("Dashboard")'
  );

  await dashboardTab.waitForDisplayed({ timeout: 5000 });
  await dashboardTab.click();

  await browser.pause(2000);

  // Diagnostic output to inspect the screen after the tap.
  const source = await browser.getPageSource();

  console.log('>>> SCREEN AFTER DASHBOARD TAP:');
  console.log(source);

  console.log(
    '>>> QUICK ACTIONS visible:',
    source.includes('QUICK ACTIONS')
  );

  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  await expect(dashboard.quickActionsLabel).toBeDisplayed();

  await browser.pause(3000);
});

When('I long press the mobile balance card', async () => {
  await dashboard.netWorthTitle.waitForDisplayed({ timeout: 10000 });
  await MobileActions.longPress(dashboard.netWorthTitle);
  await browser.pause(1000);
});

Then('the mobile dashboard should remain stable', async () => {
  await expect(dashboard.netWorthTitle).toBeDisplayed();
  await expect(dashboard.quickActionsLabel).toBeDisplayed();
});
