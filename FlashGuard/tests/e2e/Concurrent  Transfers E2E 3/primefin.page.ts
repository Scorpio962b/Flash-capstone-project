/// <reference types="webdriverio" />

import { $, $$, browser, driver } from '@wdio/globals';
import { normaliseStatus, parseZar } from '../support/helpers';

/**
 * LOCATORS: App.js has no testID / accessibilityLabel, so everything is text based.
 * For Android testID props, use `android=new UiSelector().resourceId("<testID>")`.
 */

export type NavLabel = 'Dashboard' | 'Services' | 'Transact' | 'History' | 'Account';
export type FilterLabel = 'All' | 'Pending' | 'Completed';

const esc = (v: string) => v.replace(/"/g, '\\"');
const byText = (v: string) => `android=new UiSelector().text("${esc(v)}")`;
const lower = (attr: string) => `translate(${attr},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')`;

class PrimeFinPage {
  // ---------- login ----------
  get signInButton() { return $(byText('Sign In')); }
  get dashboardMarker() { return $('android=new UiSelector().textMatches("(?i)^Quick Actions$")'); }
  get dashboardTab() { return $(byText('Dashboard')); }
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
  /** Tap the visible label so a transient overlay over the tab's center cannot intercept the tap. */
  async openTab(label: NavLabel) {
    if (label === 'Transact') {
      const sendMoney = await $(
        '//android.widget.TextView[@text="Send Money"]/ancestor::android.view.ViewGroup[@clickable="true"][1]',
      );
      await sendMoney.waitForDisplayed({ timeout: 10000 });
      await driver.execute('mobile: clickGesture', { elementId: sendMoney.elementId });
    } else {
      const tab = await this.navItem(label);
      await tab.waitForDisplayed({ timeout: 10000 });
      await tab.click();
    }

    const marker: Record<NavLabel, string> = {
      Dashboard: 'Quick Actions',
      Services: 'Select Network',
      Transact: 'From Account',
      History: 'Total Spending (May)',
      Account: 'Security',
    };
    await $(`android=new UiSelector().textMatches("(?i)^${marker[label]}$")`).waitForDisplayed({
      timeout: 10000,
      timeoutMsg: `Tapped "${label}" but its screen never appeared`,
    });
  }

  async login() {
    await browser.waitUntil(
      async () => (await this.signInButton.isDisplayed()) || (await this.dashboardTab.isDisplayed()),
      {
        timeout: 30000,
        timeoutMsg: 'Neither the Sign In screen nor the signed-in navigation appeared',
      },
    );
    if (await this.dashboardTab.isDisplayed()) {
      if (!(await this.dashboardMarker.isDisplayed())) await this.openTab('Dashboard');
      return;
    }

    await this.signInButton.waitForDisplayed({ timeout: 30000 });
    await this.signInButton.click();
    await this.welcomeAlertTitle.waitForDisplayed({ timeout: 20000 });
    await this.alertOkButton.click();
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