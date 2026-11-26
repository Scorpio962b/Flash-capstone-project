import { Given } from '@cucumber/cucumber';
import { LoginScreen } from '../../../../src/pages/mobile/LoginScreen';
import { DashboardScreen } from '../../../../src/pages/mobile/DashboardScreen';
import { MobileActions } from '../../../../src/support/MobileActions';

Given('I am logged into the mobile app', async () => {
  await MobileActions.restartApp(); // fresh login screen, even if a previous scenario left us logged in
  await new LoginScreen().loginAsDemoUser();
  await new DashboardScreen().waitUntilLoaded();
});