export const config: WebdriverIO.Config = {
  runner: "local",
  hostname: "localhost",
  port: 4723,
  path: "/",

  specs: ["./E2EScenario3-Concurrent Transfers.feature"],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": process.env.DEVICE_NAME ?? "Android Emulator",
      "appium:appPackage":
        process.env.APP_PACKAGE ?? "com.anonymous.flashguadmobileapp",
      "appium:appActivity": process.env.APP_ACTIVITY ?? ".MainActivity",
      "appium:noReset": true,
      "appium:autoGrantPermissions": true,
      "appium:newCommandTimeout": 240,
    },
  ],

  logLevel: "info",
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,

  framework: "cucumber",
  reporters: ["spec"],

  cucumberOpts: {
    require: ["./Concurrent Transfer.steps.ts"],
    timeout: 120000,
    tagExpression: process.env.TAGS ?? "not @wip",
  },
};
