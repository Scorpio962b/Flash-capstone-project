declare const browser: any;

const { Given, When, Then } = require("@cucumber/cucumber");
const h = require("../support/helpers");
// ---------- Update profile ----------
Given(/^the merchant is logged in and on the Account screen$/, async () => {
  await h.ensureLoggedIn();
  await h.goToTab("Account");
  await h.waitShown(h.ui ? h.ui : browser.$('android=new UiSelector().text("Security")'), "Account screen", 15000);
});

When(/^the merchant opens profile settings$/, async () => {
  const row = h.PROFILE_UI.row();
  await h.waitShown(row, "DEFECT: profile settings option on the Account screen", 8000);
  await row.click();
});

When(/^updates the name to "([^"]*)"$/, async (name: string) => {
  h.ctx.profileName = name;
  await h.PROFILE_UI.name().setValue(name);
});

When(/^updates the phone number to "([^"]*)"$/, async (phone: string) => {
  h.ctx.profilePhone = phone;
  await h.PROFILE_UI.phone().setValue(phone);
});
When(/^saves the changes$/, async () => {
  await h.hideKeyboard();
  await h.PROFILE_UI.save().click();
});
Then(/^the updated profile name and phone number should be displayed$/, async () => {
  await h.waitShown(browser.$(`android=new UiSelector().textContains("${h.ctx.profileName}")`), "updated profile name", 10000);
  await h.waitShown(browser.$(`android=new UiSelector().textContains("${h.ctx.profilePhone}")`), "updated phone number", 10000);
});
// the feature line ends with a full stop
Then(/^a profile updated confirmation should be displayed\.?$/, async () => {
  await h.waitShown(h.PROFILE_UI.confirmation(), "profile updated confirmation", 10000);
});