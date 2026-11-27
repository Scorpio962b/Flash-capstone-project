import { $, $$, browser } from '@wdio/globals';
import { normaliseStatus, parseZar } from '../support/helper';

/**
 * LOCATORS: App.js has no testID / accessibilityLabel, so everything is text based.
 * If you add testID props in the app, swap these for `$('id=<package>:id/<testID>')`
 * (React Native maps testID -> Android resource-id).
 */

export type NavLabel = 'Dashboard' | 'Services' | 'Transact' | 'History' | 'Account';
export type FilterLabel = 'All' | 'Pending' | 'Completed';

const esc = (v: string) => v.replace(/"/g, '\\"');
const byText = (v: string) => `android=new UiSelector().text("${esc(v)}")`;
const lower = (attr: string) => `translate(${attr},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')`;

class PrimeFinPage {
  // ---------- login ----------
  get signInButton() { return $(byText('Sign In')); }
  get welcomeAlertTitle() { return $(byText('Welcome back')); }
  get alertOkButton() { return $('id=android:id/button1'); }

  // ---------- bottom navigation (label also appears as a screen title, so take the last match) ----------
  navItem(label: NavLabel) { return $(`(//android.widget.TextView[@text="${label}"])[last()]`); }

  // ---------- dashboard ----------
  // heroTitle uses textTransform: 'uppercase', so match case-insensitively.
  // The value is the TextView right after the title inside the same card.
  heroCardValue(title: string) {
    return $(
      `//android.widget.TextView[${lower('@text')}="${title.toLowerCase()}"]/following-sibling::android.widget.TextView[1]`,
    );
  }

  // ---------- transact ----------
  // "Available" sits directly under the balance inside "From Account".
  get availableBalanceValue() {
    return $('//android.widget.TextView[@text="Available"]/preceding-sibling::android.widget.TextView[1]');
  }

  // ---------- history ----------
  get historySummaryLabel() { return $(byText('Total Spending (May)')); }
  filterChip(label: FilterLabel) { return $(byText(label)); }
  get emptyHistoryCard() { return $(byText('No transactions yet')); }
  rowTitle(title: string) { return $(byText(title)); }

  /**
   * statusPillText uses textTransform: 'uppercase', the filter chips do not: "PENDING" vs "Pending".
   * If Appium Inspector shows the pill in mixed case on your device, change .toUpperCase() here only.
   */
  statusPillSelector(status?: string) {
    return byText((normaliseStatus(status) || 'unknown').toUpperCase());
  }

  // ---------- actions ----------
  async login() {
    await this.signInButton.waitForDisplayed({ timeout: 30000 });
    await this.signInButton.click();
    await this.welcomeAlertTitle.waitForDisplayed({ timeout: 20000 });
    await this.alertOkButton.click();
  };
  
async openTab(label: NavLabel) {

    const tab = await $(
        `android=new UiSelector().description("↺, ${label}")`
    );

    await tab.waitForDisplayed({ timeout: 10000 });
    await tab.waitForEnabled({ timeout: 10000 });

    console.log('NAVIGATION ELEMENT:', await tab.getAttribute('content-desc'));

    // Tap the clickable navigation parent
    await tab.click();

    await browser.pause(2000);

    // Check whether the screen changed
    const source = await browser.getPageSource();

    console.log('HISTORY SCREEN:', source.includes('Total Spending (May)'));
    console.log('DASHBOARD SCREEN:', source.includes('Quick Actions'));

    const marker: Record<NavLabel, string> = {
        Dashboard: 'Quick Actions',
        Services: 'Select Network',
        Transact: 'From Account',
        History: 'Total Spending (May)',
        Account: 'Security',
    };

    const screenMarker = await $(
        `android=new UiSelector().text("${marker[label]}")`
    );

    await screenMarker.waitForDisplayed({
        timeout: 15000,
        timeoutMsg: `Tapped "${label}" but its screen never appeared`
    });

    console.log(`Successfully navigated to ${label}`);
}


  /** formatCurrency(null) renders "R 0.00" until loadSessionData() finishes, so wait for a non-zero value. */
  async waitForBalanceLoaded() {
    await browser.waitUntil(
      async () => parseZar(await this.heroCardValue('Total Net Worth').getText()) > 0,
      { timeout: 20000, timeoutMsg: 'Dashboard balance never loaded (still R 0.00)' },
    );
  }

  async dashboardBalance(): Promise<number> {
    return parseZar(await this.heroCardValue('Total Net Worth').getText());
  }

  async transferScreenBalance(): Promise<number> {
  await $(byText('From Account')).waitForDisplayed({ timeout: 10000 });
  const amount = $('android=new UiSelector().textMatches("^-?R.{0,2}[0-9].*").instance(0)');
  await amount.waitForDisplayed({ timeout: 10000 });
  return parseZar(await amount.getText());
}

  /** Scrolls the History ScrollView until a row with this title is on screen. */
  async scrollToRow(title: string) {
    const el = await $(
      `android=new UiScrollable(new UiSelector().scrollable(true)).setMaxSearchSwipes(20).scrollIntoView(new UiSelector().text("${esc(title)}"))`,
    );
    await el.waitForDisplayed({ timeout: 10000 });
    return el;
  }

  async countStatusPills(status?: string): Promise<number> {
    return (await $$(this.statusPillSelector(status))).length;
  }

  /** Every ZAR amount currently visible, parsed to numbers (rows, summary card...). */
  async visibleAmounts(): Promise<number[]> {
    const els = await $$('android=new UiSelector().textMatches("^-?R.{0,2}[0-9].*")');
    const texts = await els.map((e) => e.getText());
    return texts.map(parseZar);
  }
}

export default new PrimeFinPage();
