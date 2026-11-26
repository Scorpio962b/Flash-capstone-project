
export const config = {
    runner: 'local',

    port: 4723,

    specs: ['./e2e/specs/**/*.test.ts'],

    capabilities: [
        {
            platformName: 'Android',

            'appium:deviceName': 'Android Emulator',
            'appium:udid': 'emulator-5554',

            'appium:automationName': 'UiAutomator2',

            'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',

            'appium:autoGrantPermissions': true,

            'appium:newCommandTimeout': 120
        }
    ],

    logLevel: 'info',

    waitforTimeout: 10000,

    framework: 'mocha',

    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
