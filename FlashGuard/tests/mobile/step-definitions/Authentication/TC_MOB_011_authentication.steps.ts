import logger from '@wdio/logger';
const log = logger('TC_MOB_011');
import { Given, When, Then } from '@cucumber/cucumber';

// Login screen elements
const welcomeHeading = () =>
  $('android=new UiSelector().text("Welcome Back")');

const emailField = () =>
  $('android=new UiSelector().className("android.widget.EditText").instance(0)');

const passwordField = () =>
  $('android=new UiSelector().className("android.widget.EditText").instance(1)');

// Match the button without depending on the arrow character.
const signInButton = () =>
  $('android=new UiSelector().description("Sign In, \u203A")');

// Dashboard element
const dashboardName = (name: string) =>
  $(`android=new UiSelector().text("${name}")`);

const authenticationErrors = () =>
  $$('//*[string-length(@text) > 0 and (contains(translate(@text, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "invalid") or contains(translate(@text, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "incorrect") or contains(translate(@text, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "failed") or contains(translate(@text, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "error") or contains(translate(@text, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "try again"))]');

// Reusable login screen verification
const verifyLoginScreen = async () => {
  await welcomeHeading().waitForDisplayed({
    timeout: 60000,
    timeoutMsg: 'Login screen did not appear within 60 seconds'
  });

  await emailField().waitForDisplayed({ timeout: 15000 });
  await passwordField().waitForDisplayed({ timeout: 15000 });
};

// Reusable email entry
const enterEmail = async (email: string) => {
  const field = emailField();

  await field.waitForDisplayed({ timeout: 15000 });
  await field.clearValue();
  await field.setValue(email);
};

// Reusable password entry
const enterPassword = async (password: string) => {
  const field = passwordField();

  await field.waitForDisplayed({ timeout: 15000 });
  await field.clearValue();
  await field.setValue(password);

  await driver.hideKeyboard().catch(() => {});
};

// MOB-002: Login screen

Given('the merchant is on the login screen', async () => {
  log.info('\n========== MOB-002 LOGIN SCREEN ==========');

  await verifyLoginScreen();

  log.info('Login screen successfully displayed.');
});

// MOB-002: Email entry
// Supports both valid and generic email wording in feature files.

When('the merchant enters the valid email {string}', async (email: string) => {
  await enterEmail(email);
});

When('the merchant enters the email {string}', async (email: string) => {
  await enterEmail(email);
});

// MOB-002: Password entry

When('the merchant enters the valid password {string}', async (password: string) => {
  await enterPassword(password);
});

When('the merchant enters the password {string}', async (password: string) => {
  await enterPassword(password);
});

When('the merchant enters the incorrect password {string}', async (password: string) => {
  await enterPassword(password);
});

When('the merchant submits the login form', async () => {
  const button = signInButton();

  await button.waitForDisplayed({ timeout: 15000 });
  await button.click();

  log.info('Login form submitted.');
});

// MOB-002: Successful authentication

Then('the merchant should successfully access the dashboard', async () => {
  const name = dashboardName('Alice Ledger');

  await name.waitForDisplayed({
    timeout: 30000,
    timeoutMsg: 'Login submitted, but the expected dashboard was not displayed.'
  });

  log.info('Merchant successfully accessed the dashboard.');
});

Then('the dashboard should display the name {string}', async (expectedName: string) => {
  const name = dashboardName(expectedName);

  await expect(name).toBeDisplayed();
});

Then('the merchant dismisses the welcome message', async () => {
  const welcomeTitle = $('android=new UiSelector().text("Welcome back")');

  await welcomeTitle.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'The successful-login welcome alert was not displayed.'
  });

  const okButton = $('android=new UiSelector().text("OK")');

  await okButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'The welcome alert did not display an OK button.'
  });

  await okButton.click();

  log.info('Welcome alert dismissed.');
});

// MOB-002: Unsuccessful authentication

Then('an authentication error should be displayed', async () => {
  log.info('\n========== AUTHENTICATION ERROR CHECK ==========');

  let errorTexts: string[] = [];

  await driver.waitUntil(async () => {
    const errors = await authenticationErrors();
    errorTexts = await errors.map((error) => error.getText());

    return errorTexts.some((text) => text.trim() === 'Login failed') &&
      errorTexts.some((text) => text.trim() === 'Invalid credentials');
  }, {
    timeout: 15000,
    interval: 500,
    timeoutMsg: 'The expected Login failed alert with Invalid credentials was not displayed.'
  });

  log.info('Authentication error:', errorTexts.join(' | '));

  // The default React Native Alert button is OK.
  const okButton = $('android=new UiSelector().text("OK")');

  await okButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'The authentication alert did not display an OK button.'
  });

  await okButton.click();

  log.info('Authentication error alert dismissed.');
});

Then('the merchant should be denied access', async () => {
  log.info('\n========== ACCESS DENIAL CHECK ==========');

  // After dismissing the alert, the login screen should be visible.
  await verifyLoginScreen();

  // The dashboard must not be displayed.
  const dashboard = dashboardName('Alice Ledger');

  await dashboard.waitForDisplayed({
    timeout: 5000,
    reverse: true,
    timeoutMsg: 'The merchant was incorrectly allowed into the dashboard.'
  });

  log.info('Merchant remained on the login screen.');
  log.info('Dashboard access was correctly denied.');
});
