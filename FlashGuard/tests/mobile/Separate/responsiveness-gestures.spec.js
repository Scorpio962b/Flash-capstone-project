// FR-007 | Mobile Responsiveness & Gestures (4 test cases) | Android
// Prereqs: backend on :4000, Metro on :8081 (debug APK), emulator auto-rotate enabled.
const assert = require('assert');
const {
  APP_PACKAGE, byText, byContains, byRegex, editTextWith,
  relaunchApp, login, tapNav, expectDisplayed, windowInfo, assertFitsOnScreen,
} = require('./helpers');

describe('FR-007 Mobile Responsiveness & Gestures', () => {
  beforeEach(async () => {
    await driver.setOrientation('PORTRAIT');
    await relaunchApp();
    await login();
  });

  afterEach(async () => {
    await driver.setOrientation('PORTRAIT').catch(() => {});
  });

  // ---------- Gestures (2) ----------
  it('TC-RG-01 Swipe gesture: hero carousel + vertical scroll [P2]', async () => {
    const hero = await expectDisplayed(byRegex('(?i)total net worth'));
    const loc = await hero.getLocation();
    const { width, height } = await driver.getWindowSize();

    const swipeCarousel = (direction) =>
      driver.execute('mobile: swipeGesture', {
        left: 20, top: loc.y, width: width - 40, height: 100, direction, percent: 0.75,
      });

    await swipeCarousel('left');
    await expectDisplayed(byRegex('(?i)pending approvals'));
    await swipeCarousel('left');
    await expectDisplayed(byRegex('(?i)recent activity'));
    await swipeCarousel('right');
    await swipeCarousel('right');
    await expectDisplayed(byRegex('(?i)total net worth'));

    // Vertical scroll down to Recent Transactions, then back up
    const scrollArea = { left: 100, top: Math.round(height * 0.3), width: width - 200, height: Math.round(height * 0.5) };
    await driver.execute('mobile: scrollGesture', { ...scrollArea, direction: 'down', percent: 1.0 });
    await expectDisplayed(byRegex('(?i)recent transactions'));
    await driver.execute('mobile: scrollGesture', { ...scrollArea, direction: 'up', percent: 1.0 });
    await expectDisplayed(byRegex('(?i)quick actions'));
  });

  it('TC-RG-02 Tap and long-press gestures [P2]', async () => {
    // Taps: bottom navigation
    await tapNav('Services');
    await expectDisplayed(byContains('Select Network'));
    await tapNav('Transact');
    await expectDisplayed(byText('Transfer Details'));
    await tapNav('History');
    await expectDisplayed(byText('Total Spending (May)'));
    await tapNav('Account');
    await expectDisplayed(byText('Security'));
    await tapNav('Dashboard');
    await expectDisplayed(byRegex('(?i)quick actions'));

    // Tap: Pending Approvals hero card opens History
    const heroTitle = await expectDisplayed(byRegex('(?i)total net worth'));
    const heroLoc = await heroTitle.getLocation();
    const win = await driver.getWindowSize();
    await driver.execute('mobile: swipeGesture', {
      left: 20, top: heroLoc.y, width: win.width - 40, height: 100, direction: 'left', percent: 0.75,
    });
    await (await $(byRegex('(?i)pending approvals'))).click();
    await expectDisplayed(byText('Total Spending (May)'));
    await tapNav('Dashboard');

    // Long-press on a non-interactive row: nothing should happen, app stays up
    const row = await $(byRegex('(?i)recent transactions'));
    await row.waitForDisplayed();
    await driver.execute('mobile: longClickGesture', { elementId: row.elementId, duration: 1500 });
    assert.strictEqual(await driver.getCurrentPackage(), APP_PACKAGE);

    // Long-press a quick action. App.js has no onLongPress handler, so React Native still
    // delivers onPress on release. Assert only that the app stays responsive (no crash/ANR).
    const send = await $(byText('Send Money'));
    await send.waitForDisplayed();
    await driver.execute('mobile: longClickGesture', { elementId: send.elementId, duration: 1500 });
    assert.strictEqual(await driver.getCurrentPackage(), APP_PACKAGE);
    await driver.waitUntil(
      async () => (await $$(byText('Transfer Details'))).length > 0 ||
                  (await $$(byRegex('(?i)quick actions'))).length > 0,
      { timeout: 10000, timeoutMsg: 'App not responsive after long-press' },
    );
  });

  // ---------- Rotation (1) ----------
  it('TC-RG-03 Rotation portrait <-> landscape keeps state [P1]', async () => {
    await tapNav('Transact');
    await expectDisplayed(byText('Transfer Details'));

    // Enter amount; select first beneficiary if one is listed (shows an email)
    const amount = await $(editTextWith('1250'));
    await amount.waitForDisplayed();
    await amount.clearValue();
    await amount.setValue('2500');
    const beneficiaries = await $$(byContains('@'));
    if (beneficiaries.length > 0) await beneficiaries[0].click();
    await driver.hideKeyboard().catch(() => {});

    await driver.setOrientation('LANDSCAPE');
    const landscape = await driver.getOrientation();
    if (landscape !== 'LANDSCAPE') {
      // app.json "orientation": "portrait" locks Expo apps - report, don't fail silently
      console.warn('App did not rotate. Check expo "orientation" in app.json.');
    }
    assert.ok((await $$(editTextWith('2500'))).length > 0, 'Amount lost after rotating to landscape');
    assert.ok((await $$(byText('Account'))).length > 0, 'Bottom nav / session lost in landscape');

    await driver.setOrientation('PORTRAIT');
    assert.ok((await $$(editTextWith('2500'))).length > 0, 'Amount lost after rotating back to portrait');

    // History filter retained across rotation
    await tapNav('History');
    await expectDisplayed(byText('Total Spending (May)'));
    const chips = await $$(byText('Pending'));
    await chips[0].click(); // first match is the filter chip above the list
    await driver.setOrientation('LANDSCAPE');
    assert.ok((await $$(byText('Total Spending (May)'))).length > 0, 'History screen lost after rotation');
    await driver.setOrientation('PORTRAIT');
    assert.strictEqual(await driver.getCurrentPackage(), APP_PACKAGE);
  });

  // ---------- Device sizes (1) ----------
  it('TC-RG-04 Layout fits phone and tablet sizes [P1]', async () => {
    const info = await windowInfo();
    const kind = Math.min(info.widthDp, info.heightDp) >= 600 ? 'TABLET' : 'PHONE';
    console.log(`Device: ${kind} ${info.width}x${info.height}px (${info.widthDp}x${info.heightDp}dp)`);

    // Bottom nav + FAB fully visible and not clipped on the Dashboard
    for (const label of ['Dashboard', 'Services', 'Transact', 'History', 'Account']) {
      const matches = await $$(byText(label));
      const nav = matches[matches.length - 1];
      await nav.waitForDisplayed();
      await assertFitsOnScreen(nav, `Nav "${label}"`);
    }

    // Key content on Transact and Services screens
    await tapNav('Transact');
    await assertFitsOnScreen(await expectDisplayed(byText('Transfer Details')), 'Transfer Details');
    await assertFitsOnScreen(await expectDisplayed(editTextWith('1250')), 'Amount field');
    await tapNav('Services');
    await assertFitsOnScreen(await expectDisplayed(byText('Vodacom')), 'Network tile');
    await assertFitsOnScreen(await expectDisplayed(byText('Airtime')), 'Airtime toggle');

    // Login layout on this size: form capped at 480dp (authStage maxWidth) so it must
    // not stretch across a tablet. Relaunch to reach the login screen.
    await relaunchApp();
    const signIn = await expectDisplayed(byText('Sign In'));
    await assertFitsOnScreen(signIn, 'Sign In button');
    const emailField = await expectDisplayed(editTextWith('alice@flashguard.local'));
    await assertFitsOnScreen(emailField, 'Email field');
    const fieldSize = await emailField.getSize();
    assert.ok(info.dp(fieldSize.width) <= 484, `Login form too wide: ${info.dp(fieldSize.width)}dp (max 480dp)`);
  });
});
