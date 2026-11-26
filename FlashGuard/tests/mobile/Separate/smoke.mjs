import { remote } from 'webdriverio';
import fs from 'fs';

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  logLevel: 'warn',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'emulator-5554',
    'appium:appPackage': 'com.anonymous.flashguadmobileapp',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
  },
});

await driver.waitUntil(
  async () => (await driver.getPageSource()).includes('EditText'),
  { timeout: 90000, interval: 2000, timeoutMsg: 'Login fields never appeared' }
);

fs.writeFileSync('source.txt', await driver.getPageSource());
await driver.saveScreenshot('./login.png');
console.log('Saved source.txt and login.png');
await driver.deleteSession();
