import type { ChainablePromiseElement } from 'webdriverio';

export const APP_PACKAGE = 'com.anonymous.flashguadmobileapp';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');

// Case-insensitive exact match, because the app uppercases some labels (textTransform)
export const byText = (text: string) =>
  $(`android=new UiSelector().textMatches("(?i)^${escapeRegex(text)}$")`);
export const MobileActions = {
  async scrollDown(percent = 0.7) {
    const { width, height } = await driver.getWindowRect();
    // Scroll area sits below the hero carousel so the page scrolls, not the carousel
    await driver.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.05), top: Math.round(height * 0.45),
      width: Math.round(width * 0.9), height: Math.round(height * 0.35),
      direction: 'down', percent,
    });
  },

  async scrollUntilDisplayed(el: ChainablePromiseElement, maxScrolls = 6) {
    for (let i = 0; i < maxScrolls && !(await el.isDisplayed()); i++) {
      await this.scrollDown();
    }
  },

  async swipeLeftOn(el: ChainablePromiseElement) {
    const element = await el;
    await driver.execute('mobile: swipeGesture', {
      elementId: element.elementId, direction: 'left', percent: 0.8,
    });
  },

  async longPress(el: ChainablePromiseElement, ms = 1500) {
    const element = await el;
    await driver.execute('mobile: longClickGesture', {
      elementId: element.elementId, duration: ms,
    });
  },

  async restartApp() {
    await driver.terminateApp(APP_PACKAGE);
    await driver.activateApp(APP_PACKAGE);
  },
};