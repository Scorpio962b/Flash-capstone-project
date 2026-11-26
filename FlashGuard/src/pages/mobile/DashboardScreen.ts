import { byText, MobileActions } from '../../support/MobileActions';

export class DashboardScreen {
  get netWorthTitle() { return byText('Total Net Worth'); }
 get netWorthValue() {
    return $('//android.widget.TextView[@text="TOTAL NET WORTH"]/following-sibling::android.widget.TextView[1]');
  }
  get pendingApprovalsTitle() { return byText('Pending Approvals'); }
  get quickActionsLabel() { return byText('Quick Actions'); }
  get recentTransactionsHeader() { return byText('Recent Transactions'); }
  get viewAll() { return byText('View All'); }

  navItem(label: 'Dashboard' | 'Services' | 'Transact' | 'History' | 'Account') {
    return byText(label);
  }

  async waitUntilLoaded() {
    await this.netWorthTitle.waitForDisplayed({ timeout: 30000 });
    // Shows "R 0.00" until the API call finishes
    await browser.waitUntil(async () => (await this.netWorthValue.getText()) !== 'R 0.00', {
      timeout: 30000, timeoutMsg: 'Balance never loaded from the API',
    });
  }

  async balanceText() { return this.netWorthValue.getText(); }

  async scrollToRecentTransactions() {
    await MobileActions.scrollUntilDisplayed(this.recentTransactionsHeader);
  }
}