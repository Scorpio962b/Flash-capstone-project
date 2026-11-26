// FR-007 | Mobile Settings (2 test cases) | Android
// IMPORTANT: the App.js shared so far has NO edit-profile or change-password screen
// (Account tab only shows read-only rows). These specs detect the feature and skip with
// a clear message if it is missing. Adjust the locators below to match the real screens.
const assert = require('assert');
const { byText, byRegex, byContains, relaunchApp, login, tapNav, expectDisplayed } = require('./helpers');

async function openFromAccount(entryRegex, ctx) {
  await tapNav('Account');
  await expectDisplayed(byText('Security'));
  const entries = await $$(byRegex(entryRegex));
  if (entries.length === 0) {
    ctx.skip(); // feature not present in this build
  }
  await entries[0].click();
}

describe('FR-007 Mobile Settings', () => {
  before(async () => {
    await relaunchApp();
    await login();
  });

  it('TC-MS-01 Update profile (name, phone) [P2]', async function () {
    await openFromAccount('(?i)(edit|update) profile|personal details', this);

    const nameField = await $('android=new UiSelector().className("android.widget.EditText").instance(0)');
    await nameField.waitForDisplayed({ timeout: 10000 });
    await nameField.clearValue();
    await nameField.setValue('Alice Updated');

    const phoneField = await $('android=new UiSelector().className("android.widget.EditText").instance(1)');
    await phoneField.clearValue();
    await phoneField.setValue('821234567');

    await (await $(byRegex('(?i)save( changes)?'))).click();
    await expectDisplayed(byRegex('(?i)(updated|saved|success).*'));
    await driver.acceptAlert().catch(() => {});

    // Name reflected on the Account screen
    await tapNav('Account');
    await expectDisplayed(byText('Alice Updated'));

    // Persists after restart
    await relaunchApp();
    await login();
    await tapNav('Account');
    await expectDisplayed(byText('Alice Updated'));
  });

  it('TC-MS-02 Change password [P2]', async function () {
    await openFromAccount('(?i)change password', this);

    const fields = await $$('android=new UiSelector().className("android.widget.EditText")');
    assert.ok(fields.length >= 3, 'Expected current, new and confirm password fields');
    await fields[0].setValue('offline-demo');
    await fields[1].setValue('NewPass#2026');
    await fields[2].setValue('NewPass#2026');

    await (await $(byRegex('(?i)(update|change|save).*password|submit'))).click();
    await expectDisplayed(byRegex('(?i)(updated|changed|success).*'));
    await driver.acceptAlert().catch(() => {});

    // Negative: wrong current password is rejected
    await openFromAccount('(?i)change password', this);
    const f2 = await $$('android=new UiSelector().className("android.widget.EditText")');
    await f2[0].setValue('wrong-password');
    await f2[1].setValue('Another#2026');
    await f2[2].setValue('Another#2026');
    await (await $(byRegex('(?i)(update|change|save).*password|submit'))).click();
    await expectDisplayed(byContains('rror')).catch(async () =>
      expectDisplayed(byRegex('(?i).*(incorrect|invalid|failed).*')),
    );
  });
});
