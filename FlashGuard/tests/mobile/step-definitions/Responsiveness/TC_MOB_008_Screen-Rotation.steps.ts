import { Given, When, Then } from '@cucumber/cucumber';

declare const $: (selector: string) => any;
declare const browser: {
  setOrientation(orientation: 'LANDSCAPE' | 'PORTRAIT'): Promise<void>;
  getWindowSize(): Promise<{ width: number; height: number }>;
};

function dashboardName(name: string) {
  return $(`//*[contains(@text, "${name}")]`);
}

// MOB-006: Dashboard screen
Given('the merchant is on the Dashboard screen', async () => {
  await dashboardName('Alice Ledger').waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'The Dashboard screen was not displayed.'
  });
});

// Orientation
When('the merchant rotates the device to landscape mode', async () => {
  await browser.setOrientation('LANDSCAPE');
  console.log('Device rotated to landscape.');
});

When('the merchant rotates the device to portrait mode', async () => {
  await browser.setOrientation('PORTRAIT');
  console.log('Device rotated to portrait.');
});

// Screen sizes (checks the current emulator size; it does not resize it)
When('the merchant views the app on phone screen size', async () => {
  const size = await browser.getWindowSize();
  console.log(`Phone screen size: ${size.width}x${size.height}`);
});

When('the merchant views the app on tablet screen size', async () => {
  const size = await browser.getWindowSize();
  console.log(`Tablet screen size: ${size.width}x${size.height}`);
});

// Checks
Then('the Dashboard screen should adjust correctly', async () => {
  await dashboardName('Alice Ledger').waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'The Dashboard did not adjust correctly.'
  });

  const size = await browser.getWindowSize();
  console.log(`Dashboard displayed at ${size.width}x${size.height}.`);
});

Then('all account information should remain visible', async () => {
  const expectedTexts = ['Alice Ledger', 'Pending Approvals'];

  for (const text of expectedTexts) {
    const element = dashboardName(text);

    await element.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: `${text} is not visible on the Dashboard.`
    });
  }

  console.log('All Dashboard information remains visible.');
});