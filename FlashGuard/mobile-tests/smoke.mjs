import { remote } from 'webdriverio';

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  logLevel: 'warn',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'emulator-5554',
    'appium:app': 'C:\\Users\\Emihle\\OneDrive\\Documents\\Flash-capstone-project\\FlashGuard\\mobile\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk',
    'appium:autoGrantPermissions': true,
  },
});

console.log('Package:', await driver.getCurrentPackage());
console.log('Activity:', await driver.getCurrentActivity());
await driver.pause(3000);
await driver.saveScreenshot('./launch.png');
console.log(await driver.getPageSource());
await driver.deleteSession();
