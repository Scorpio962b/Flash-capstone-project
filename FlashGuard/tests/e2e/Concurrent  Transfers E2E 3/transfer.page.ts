
// Typed WebdriverIO and Appium interfaces used by the transfer page.

interface MobileElement {
  waitForDisplayed(options?: {
    timeout?: number;
    timeoutMsg?: string;
  }): Promise<boolean>;
  isDisplayed(): Promise<boolean>;
  click(): Promise<void>;
  clearValue(): Promise<void>;
  addValue(value: string): Promise<void>;
  getText(): Promise<string>;
  getLocation(): Promise<{ x: number; y: number }>;
  getSize(): Promise<{ width: number; height: number }>;
}

interface MobileBrowser {
  pause(milliseconds: number): Promise<void>;
  waitUntil(
    condition: () => Promise<boolean>,
    options?: {
      timeout?: number;
      timeoutMsg?: string;
    },
  ): Promise<void>;
}

interface MobileDriver {
  execute(
    command: string,
    parameters: Record<string, number | string>,
  ): Promise<unknown>;
  isKeyboardShown(): Promise<boolean>;
  pressKeyCode(keyCode: number): Promise<void>;
  getCurrentPackage(): Promise<string>;
  terminateApp(appPackage: string): Promise<void>;
  activateApp(appPackage: string): Promise<void>;
}

declare const $: (selector: string) => MobileElement;
declare const browser: MobileBrowser;
declare const driver: MobileDriver;

/** Mobile "Transact" screen actions used by the transfer E2E scenarios. */

const esc = (v: string) => v.replace(/"/g, '\\"');
const byText = (v: string) => `android=new UiSelector().text("${esc(v)}")`;
const amountInputSelector = 'new UiSelector().resourceId("transfer-amount")';
const amountInputLocator = `android=${amountInputSelector}`;
const reviewButtonSelector = 'new UiSelector().resourceId("transfer-submit")';

export interface MobileTransferResult {
  ok: boolean;
  title: string;
  message: string;
}

class TransferPage {
  /** Swipes up to reveal later fields lower in the Transact form. */
  private async scrollTo(uiSelector: string): Promise<MobileElement> {
    const target = $(`android=${uiSelector}`);
    const scrollView = $('android=new UiSelector().scrollable(true)');

    await scrollView.waitForDisplayed({ timeout: 10000 });

    const location = await scrollView.getLocation();
    const size = await scrollView.getSize();

    const left = location.x + Math.round(size.width * 0.05);
    const top = location.y + Math.round(size.height * 0.12);
    const width = Math.round(size.width * 0.9);
    const height = Math.round(size.height * 0.75);

    for (let swipe = 0; swipe < 10; swipe += 1) {
      if (await target.isDisplayed()) {
        return target;
      }

      await driver.execute('mobile: swipeGesture', {
        left,
        top,
        width,
        height,
        direction: 'up',
        percent: 0.75,
      });
    }

    if (await target.isDisplayed()) {
      return target;
    }

    throw new Error(
      `Could not scroll down to "${uiSelector}" within the Transact form`,
    );
  }

  /** Use a stable test ID because the amount text changes as the controlled input updates. */
  async setAmount(amount: number): Promise<void> {
    await this.scrollTo('new UiSelector().text("Transfer Details")');

    const input = await this.scrollTo(amountInputSelector);

    await input.click();
    await input.clearValue();

    const refreshedInput = $(amountInputLocator);

    await refreshedInput.waitForDisplayed({ timeout: 10000 });
    await refreshedInput.addValue(String(amount));

    await browser.waitUntil(
      async () => (await $(amountInputLocator).getText()) === String(amount),
      {
        timeout: 5000,
        timeoutMsg: `Transfer amount did not update to ${amount}`,
      },
    );

    if (await driver.isKeyboardShown()) {
      await driver.pressKeyCode(4);

      await browser.waitUntil(
        async () => !(await driver.isKeyboardShown()),
        {
          timeout: 5000,
          timeoutMsg: 'Android keyboard remained open after pressing Back',
        },
      );
    }
  }

  async tapBeneficiary(name: string): Promise<void> {
    await this.scrollTo(`new UiSelector().text("${esc(name)}")`);

    const row = $(
      `//android.widget.TextView[@text="${esc(name)}"]/ancestor::android.view.ViewGroup[@clickable="true"][1]`,
    );

    await row.waitForDisplayed({ timeout: 10000 });
    await row.click();
  }

  /** Brings the Review Transaction button into view. */
  async reviewButton(): Promise<MobileElement> {
    return this.scrollTo(reviewButtonSelector);
  }

  async tapReviewTransaction(): Promise<void> {
    const button = await this.reviewButton();

    await $(byText('Review Transaction')).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: 'Review Transaction label was not visible',
    });

    await button.click();

    await browser.waitUntil(
      async () =>
        (await $(byText('Submitting...')).isDisplayed()) ||
        (await $(byText('Transfer submitted')).isDisplayed()) ||
        (await $(byText('Transfer failed')).isDisplayed()),
      {
        timeout: 10000,
        timeoutMsg: 'Tapping Review Transaction did not start a submission',
      },
    );
  }

  async tap(el: Pick<MobileElement, 'click'>): Promise<void> {
    await el.click();
  }

  /** App.js shows an Alert: "Transfer submitted" on success, "Transfer failed" + server message otherwise. */
  async waitForTransferResult(
    timeout = 20000,
  ): Promise<MobileTransferResult> {
    const isUp = async (text: string) =>
      $(byText(text)).isDisplayed();

    await browser.waitUntil(
      async () =>
        (await isUp('Transfer submitted')) ||
        (await isUp('Transfer failed')),
      {
        timeout,
        timeoutMsg:
          'Neither "Transfer submitted" nor "Transfer failed" appeared on the mobile app',
      },
    );

    const ok = await isUp('Transfer submitted');
    let message = '';

    try {
      message = await $('id=android:id/message').getText();
    } catch {
      // No message text.
    }

    await $('id=android:id/button1').click();

    return {
      ok,
      title: ok ? 'Transfer submitted' : 'Transfer failed',
      message,
    };
  }

  async restartApp(): Promise<void> {
    const appPackage = await driver.getCurrentPackage();

    await driver.terminateApp(appPackage);
    await driver.activateApp(appPackage);
  }
}

export default new TransferPage();
