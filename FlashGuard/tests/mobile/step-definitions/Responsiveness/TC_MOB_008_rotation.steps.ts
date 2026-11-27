import { When } from '@cucumber/cucumber';
import { driver } from '@wdio/globals';

const rotateLandscape = async () => {
  await driver.setOrientation('LANDSCAPE');
  await driver.pause(1500);
};

When(/^the merchant rotates the device to landscape mode$/, rotateLandscape);
When(/^I set the mobile screen to landscape mode$/, rotateLandscape);