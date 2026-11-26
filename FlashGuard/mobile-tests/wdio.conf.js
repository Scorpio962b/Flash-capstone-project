const path = require('path');

exports.config = {
  runner: 'local',
  specs: ['./specs/**/*.spec.js'],
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:app': path.resolve(__dirname, '../mobile/android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appPackage': 'com.anonymous.flashguadmobileapp',
    'appium:newCommandTimeout': 240,
    'appium:autoGrantPermissions': true,
  }],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 120000 },
  logLevel: 'info',
};
