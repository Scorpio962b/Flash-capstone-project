
import { Given, When, Then } from '@cucumber/cucumber';

// --------------------------------------------------
// MOB-003: Fund Transfer screen elements
// --------------------------------------------------

const appPackage = 'com.anonymous.flashguadmobileapp';

const welcomeHeading = () =>
  $('android=new UiSelector().text("Welcome Back")');

const emailField = () =>
  $('android=new UiSelector().className("android.widget.EditText").instance(0)');

const passwordField = () =>
  $('android=new UiSelector().className("android.widget.EditText").instance(1)');

const signInButton = () =>
  $('android=new UiSelector().description("Sign In, \u203A")');

const dashboardName = () =>
  $('android=new UiSelector().text("Alice Ledger")');

const welcomeAlertTitle = () =>
  $('android=new UiSelector().text("Welcome back")');

const sendMoneyButton = () =>
  $('android=new UiSelector().text("Send Money")');

const transferFormHeading = () =>
  $('android=new UiSelector().text("To Beneficiary")');

const beneficiaryName = (name: string) =>
  $(`android=new UiSelector().text("${name}")`);

const amountField = () =>
  $('android=new UiSelector().className("android.widget.EditText").instance(1)');

const transferAlertTitle = () =>
  $('android=new UiSelector().text("Transfer submitted")');

const alertOkButton = () =>
  $('android=new UiSelector().text("OK")');

const historyTab = () =>
  $('android=new UiSelector().text("History")');

// --------------------------------------------------
// Reusable navigation
// --------------------------------------------------

const loginToDashboard = async () => {
  if ((await driver.getCurrentPackage()) !== appPackage) {
    await driver.execute('mobile: activateApp', { appId: appPackage });
  }

  await driver.waitUntil(async () => (await driver.getCurrentPackage()) === appPackage, {
    timeout: 30000,
    interval: 500,
    timeoutMsg: 'FlashGuard did not return to the foreground before fund transfer.'
  });

  let startingScreen: 'login' | 'dashboard' | 'transfer' | undefined;
  await driver.waitUntil(async () => {
    if (await welcomeHeading().isExisting()) {
      startingScreen = 'login';
      return true;
    }

    if (await transferFormHeading().isExisting()) {
      startingScreen = 'transfer';
      return true;
    }

    if (await sendMoneyButton().isExisting()) {
      startingScreen = 'dashboard';
      return true;
    }

    return false;
  }, {
    timeout: 90000,
    interval: 1000,
    timeoutMsg: 'Login, dashboard, or fund transfer screen did not appear after launching FlashGuard.'
  });

  if (!startingScreen) {
    throw new Error('Unable to determine the current FlashGuard screen.');
  }

  if (startingScreen === 'login') {
    await emailField().setValue('alice@flashguard.local');
    await passwordField().setValue('offline-demo');

    if (await driver.isKeyboardShown()) {
      await driver.hideKeyboard();
    }

    await signInButton().waitForDisplayed({ timeout: 15000 });
    await signInButton().click();

    await dashboardName().waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Dashboard did not appear after login.'
    });
  } else if (startingScreen === 'transfer') {
    return;
  } else if (startingScreen === 'dashboard') {
    await dashboardName().waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Dashboard was not displayed before fund transfer.'
    });
  }

  if (await welcomeAlertTitle().isExisting()) {
    await alertOkButton().click();
  }
};

const openFundTransferScreen = async () => {
  if (await transferFormHeading().isExisting()) {
    await beneficiaryName('Bob Wallet').waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Beneficiary list did not load.'
    });
    return;
  }

  await sendMoneyButton().waitForDisplayed({
    timeout: 20000,
    timeoutMsg: 'Send Money quick action was not displayed.'
  });

  await sendMoneyButton().click();

  await transferFormHeading().waitForDisplayed({
    timeout: 20000,
    timeoutMsg: 'Fund Transfer screen did not open.'
  });

  await beneficiaryName('Bob Wallet').waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Beneficiary list did not load.'
  });
};

// --------------------------------------------------
// MOB-003.1: Select recipient
// --------------------------------------------------

Given('the merchant is on the fund transfer screen', async () => {
  console.log('\n========== MOB-003 FUND TRANSFERS ==========');

  await loginToDashboard();
  await openFundTransferScreen();

  console.log('Fund Transfer screen successfully displayed.');
});

When('the merchant selects the beneficiary {string}', async (name: string) => {
  const beneficiary = beneficiaryName(name);

  await beneficiary.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: `Beneficiary "${name}" was not displayed.`
  });

  await beneficiary.click();

  console.log(`Selected beneficiary: ${name}`);
});

Then('the selected beneficiary should be displayed', async () => {
  await beneficiaryName('Bob Wallet').waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Selected beneficiary is no longer displayed.'
  });

  console.log('Selected beneficiary is displayed.');
});

// --------------------------------------------------
// MOB-003.2: Enter transfer amount
// --------------------------------------------------

When('the merchant enters the transfer amount {string}', async (amount: string) => {
  const field = amountField();

  await field.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Transfer amount field was not displayed.'
  });

  await field.click();
  await field.clearValue();
  await field.setValue(amount);

  if (await driver.isKeyboardShown()) {
    await driver.hideKeyboard();
  }

  console.log(`Entered transfer amount: ${amount}`);
});

Then('the transfer amount should be {string}', async (expectedAmount: string) => {
  const field = amountField();

  await field.waitForDisplayed({ timeout: 10000 });

  const actualAmount = await field.getAttribute('text');

  await expect(actualAmount).toBe(expectedAmount);

  console.log(`Amount verified: ${actualAmount}`);
});

// --------------------------------------------------
// MOB-003.4: Confirm and submit transfer
// --------------------------------------------------

When('the merchant reviews and submits the transfer', async () => {
  if (await driver.isKeyboardShown()) {
    await driver.hideKeyboard();
  }

  const button = $(
    'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Review Transaction"))'
  );

  await button.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Review Transaction button was not displayed.'
  });

  await button.click();

  console.log('Review Transaction button clicked.');
});

Then('a transfer submitted confirmation should be displayed', async () => {
  await transferAlertTitle().waitForDisplayed({
    timeout: 30000,
    timeoutMsg: 'Transfer submitted confirmation was not displayed.'
  });

  console.log('Transfer submitted confirmation displayed.');

  const okButton = alertOkButton();

  await okButton.waitForDisplayed({ timeout: 10000 });
  await okButton.click();
});

Then('the merchant should be redirected to transaction history', async () => {
  await historyTab().waitForDisplayed({
    timeout: 20000,
    timeoutMsg: 'History tab was not displayed after transfer submission.'
  });

  console.log('Merchant returned to transaction history.');
});
