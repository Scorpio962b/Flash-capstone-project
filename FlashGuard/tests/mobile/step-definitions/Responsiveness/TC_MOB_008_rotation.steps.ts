const { When } = require("@cucumber/cucumber");
const { driver } = require("@wdio/globals");
const h = require("../support/helpers");

const rotateLandscape = async () => {
  await driver.setOrientation("LANDSCAPE");
  await driver.pause(1500);
};

When(/^the merchant rotates the device to landscape mode$/, rotateLandscape);
When(/^I set the mobile screen to landscape mode$/, rotateLandscape);

// the feature has a double space: "resolution to  mobile phone size"
When(/^I set the screen resolution to\s+mobile phone size$/, async () => h.setDisplay("phone"));
When(/^I set the screen resolution to\s+tablet size$/, async () => h.setDisplay("tablet"));