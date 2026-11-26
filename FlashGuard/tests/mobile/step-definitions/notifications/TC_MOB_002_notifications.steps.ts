import { When, Then } from '@wdio/cucumber-framework';
import { DashboardScreen } from '../../../../src/pages/mobile/DashboardScreen';
import { HistoryScreen } from '../../../../src/pages/mobile/HistoryScreen';
import { byText } from '../../../../src/support/MobileActions';

const dashboard = new DashboardScreen();

When('I open the mobile account tab', async () => {
  await dashboard.navItem('Account').click();
});

Then('the mobile notifications alert count should be displayed', async () => {
  await expect(byText('Notifications')).toBeDisplayed();
  await expect($('android=new UiSelector().textMatches("^\\\\d+ alerts$")')).toBeDisplayed();
});

When('I tap the mobile pending approvals card', async () => {
  await dashboard.pendingApprovalsTitle.click();
});

Then('the mobile history page should be displayed with the pending filter', async () => {
  const history = new HistoryScreen();
  await expect(history.title).toBeDisplayed();
  await expect(history.pendingChip).toBeDisplayed();
});