import { remote, type Browser } from 'webdriverio';

export type MobileSessionConfig = {
  serverUrl: string;
  deviceName: string;
  app?: string;
  appPackage?: string;
  appActivity?: string;
};

export function getMobileSessionConfig(): MobileSessionConfig | null {
  const app = process.env.APK_PATH;
  const appPackage = process.env.APP_PACKAGE;
  const appActivity = process.env.APP_ACTIVITY ?? '.MainActivity';
  const serverUrl = process.env.APPIUM_SERVER_URL ?? 'http://localhost:4723';
  const deviceName = process.env.DEVICE_NAME ?? 'Android Emulator';

  if (!app && !appPackage) {
    return null;
  }

  return {
    serverUrl,
    deviceName,
    app,
    appPackage,
    appActivity,
  };
}

export async function createMobileSession(config: MobileSessionConfig): Promise<Browser> {
  const url = new URL(config.serverUrl);

  return remote({
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: Number(url.port || (url.protocol === 'https:' ? 443 : 4723)),
    path: url.pathname || '/',
    logLevel: 'error',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': config.deviceName,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      ...(config.appPackage
        ? {
            'appium:appPackage': config.appPackage,
            'appium:appActivity': config.appActivity,
            'appium:noReset': false,
          }
        : { 'appium:app': config.app }),
    } as WebdriverIO.Capabilities,
  });
}

export async function mobileLogin(browser: Browser, email: string, password: string): Promise<void> {
  const signInButton = browser.$('android=new UiSelector().textMatches("(?i)^(sign in|log in|login)$")');
  await signInButton.waitForDisplayed({ timeout: 30000 });

  const emailInput = browser.$(
    'android=new UiSelector().textContains("900101").className("android.widget.EditText")'
  );
  const emailField = (await emailInput.isExisting())
    ? emailInput
    : browser.$('//android.widget.EditText[1]');
  await emailField.waitForDisplayed({ timeout: 10000 });
  await emailField.click();
  await emailField.clearValue();
  await emailField.setValue(email);

  const passwordField = browser.$('//android.widget.EditText[@password="true"]');
  await passwordField.waitForDisplayed({ timeout: 10000 });
  await passwordField.click();
  await passwordField.clearValue();
  await passwordField.setValue(password);

  await signInButton.click();
  const dashboardMarker = browser.$('android=new UiSelector().textMatches("(?i)^Quick Actions$")');
  await dashboardMarker.waitForDisplayed({ timeout: 30000 });
}

export async function openMobileHistory(browser: Browser): Promise<void> {
  const historyTab = browser.$(
    '(//android.widget.TextView[@text="History"])[last()]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
  );
  await historyTab.waitForDisplayed({ timeout: 10000 });
  await historyTab.click();

  const historyMarker = browser.$('android=new UiSelector().textMatches("(?i)^Total Spending \\(May\\)$")');
  await historyMarker.waitForDisplayed({ timeout: 15000 });
}

export async function findMobileTransactionRow(browser: Browser, transactionId: number) {
  const selector = `new UiSelector().text("Transfer #${transactionId}")`;
  const row = await browser.$(
    `android=new UiScrollable(new UiSelector().scrollable(true)).setMaxSearchSwipes(20).scrollIntoView(${selector})`
  );
  await row.waitForDisplayed({ timeout: 15000 });
  return row;
}

export async function readMobileDashboardBalance(browser: Browser): Promise<string> {
  const dashboardTab = browser.$(
    '(//android.widget.TextView[@text="Dashboard"])[last()]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
  );
  if (await dashboardTab.isExisting()) {
    await dashboardTab.click();
  }

  const title = browser.$(
    '//android.widget.TextView[translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="total net worth"]'
  );
  await title.waitForDisplayed({ timeout: 15000 });
  const value = browser.$(
    '//android.widget.TextView[translate(@text,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="total net worth"]/following-sibling::android.widget.TextView[1]'
  );
  await value.waitForDisplayed({ timeout: 10000 });
  return value.getText();
}
