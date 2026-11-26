export const config: WebdriverIO.Config = {
  runner: 'local',
  // Appium is started separately: `appium` (default http://localhost:4723)
  hostname: 'localhost',
  port: 4723,
  path: '/',

  specs: ['./Concurrent Transfers.feature'],
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.DEVICE_NAME ?? 'Android Emulator',
      // Either point at an .apk (APK_PATH) or at an app already installed on the emulator (APP_PACKAGE).
      ...(process.env.APP_PACKAGE
        ? {
            'appium:appPackage': process.env.APP_PACKAGE,
            'appium:appActivity': process.env.APP_ACTIVITY ?? '.MainActivity',
            'appium:noReset': true,
          }
        : { 'appium:app': process.env.APK_PATH }),
      'appium:autoGrantPermissions': true, // camera permission for the face-check modal
      'appium:newCommandTimeout': 240,
    },
  ],

  logLevel: 'info',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,

  framework: 'cucumber',
  reporters: ['spec'],
  cucumberOpts: {
    require: ['./Concurrent Transfer.steps.ts'],
    timeout: 120000,
    tagExpression: process.env.TAGS ?? 'not @wip and not @e2e', // @wip = feature not built in the app yet
  },
};