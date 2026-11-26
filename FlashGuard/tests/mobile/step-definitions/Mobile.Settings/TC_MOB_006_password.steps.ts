const { Given, When, Then } = require("@cucumber/cucumber");
const h = require("../support/helpers");

const NEW_PASSWORD = "NewPass123!";

// ---------- Change password ----------
Given(/^the merchant is on the change password screen$/, async () => {
  await h.ensureLoggedIn();
  await h.goToTab("Account");
  const row = h.PASSWORD_UI.row();
  await h.waitShown(row, "DEFECT: 'Change Password' option on the Account screen", 8000);
  await row.click();
});

When(/^the merchant enters and submits a new password$/, async () => {
  h.ctx.newPassword = NEW_PASSWORD;
  await h.PASSWORD_UI.current().setValue(h.PASSWORD);
  await h.PASSWORD_UI.next().setValue(NEW_PASSWORD);
  await h.PASSWORD_UI.confirm().setValue(NEW_PASSWORD);
  await h.hideKeyboard();
  await h.PASSWORD_UI.submit().click();
});

Then(/^a password changed confirmation should be displayed$/, async () => {
  await h.waitShown(h.PASSWORD_UI.confirmation(), "password changed confirmation", 10000);
});

Then(/^the merchant should be able to log in with the new password$/, async () => {
  // current build has no logout, so relaunch the app to reach the login screen
  await (globalThis as any).driver.terminateApp(h.APP_PACKAGE);
  await (globalThis as any).driver.activateApp(h.APP_PACKAGE);
  await h.login(h.EMAIL, h.ctx.newPassword);
  await h.waitShown(h.DASHBOARD.netWorth(), "Dashboard");
});


