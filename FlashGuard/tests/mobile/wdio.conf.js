
const path = require('node:path');

exports.config = {
    runner: 'local',

    specs: [
        path.resolve(__dirname, 'specs/**/*.test.js')
    ],
    maxInstances: 1,

    hostname: '127.0.0.1',
    port: 4723,
    path: '/',

    capabilities: [{
        platformName: 'Android',

        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'emulator-5554',
        'appium:udid': 'emulator-5554',

        'appium:appPackage': 'com.anonymous.flashguadmobileapp',
        'appium:appActivity': '.MainActivity',

        'appium:noReset': true,
        'appium:newCommandTimeout': 120
    }],

    logLevel: 'info',

    framework: 'mocha',

    mochaOpts: {
        timeout: 60000
    },

    reporters: ['spec']
};
