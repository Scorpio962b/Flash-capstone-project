// Shared helpers for FR-007 Appium (WebdriverIO + Mocha) specs.
// Locators are text based because App.js has no testID / accessibilityLabel yet.
// Note: uppercase-styled labels use (?i) regex because Android may report them transformed.

const APP_PACKAGE = 'com.anonymous.flashguadmobileapp';

const byText = (t) => `android=new UiSelector().text("${t}")`;
const byContains = (t) => `android=new UiSelector().textContains("${t}")`;
const byRegex = (r) => `android=new UiSelector().textMatches("${r}")`;
const editTextWith = (t) =>
  `android=new UiSelector().className("android.widget.EditText").text("${t}")`;

async function relaunchApp() {
  await driver.terminateApp(APP_PACKAGE);
  await driver.activateApp(APP_PACKAGE);
}

// Login screen has the demo credentials prefilled (alice@flashguard.local / offline-demo)
async function login() {
  const signIn = await $(byText('Sign In'));
  await signIn.waitForDisplayed({ timeout: 30000 });
  await signIn.click();
  // "Welcome back" native alert after a successful login
  try {
    await driver.waitUntil(async () => (await $$(byText('OK'))).length > 0, {
      timeout: 10000,
    });
    await (await $(byText('OK'))).click();
  } catch {
    throw new Error('Login alert not shown - is the backend running on port 4000?');
  }
  await (await $(byRegex('(?i)quick actions'))).waitForDisplayed({ timeout: 20000 });
}

// Screen titles repeat the nav label (History, Account), and the nav bar is
// rendered last, so the LAST match is always the bottom-nav item.
async function tapNav(label) {
  const matches = await $$(byText(label));
  if (matches.length === 0) throw new Error(`Nav item "${label}" not found`);
  await matches[matches.length - 1].click();
}

async function expectDisplayed(selector, timeout = 10000) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout });
  return el;
}

async function windowInfo() {
  const { width, height } = await driver.getWindowSize();
  const density = await driver.getDisplayDensity(); // px per inch
  const dp = (px) => Math.round(px / (density / 160));
  return { width, height, density, widthDp: dp(width), heightDp: dp(height), dp };
}

async function assertFitsOnScreen(el, label) {
  const { width, height } = await driver.getWindowSize();
  const loc = await el.getLocation();
  const size = await el.getSize();
  const tol = 2;
  if (loc.x < -tol || loc.y < -tol || loc.x + size.width > width + tol || loc.y + size.height > height + tol) {
    throw new Error(
      `${label} is clipped: x=${loc.x}, y=${loc.y}, w=${size.width}, h=${size.height} on ${width}x${height}`,
    );
  }
}

module.exports = {
  APP_PACKAGE, byText, byContains, byRegex, editTextWith,
  relaunchApp, login, tapNav, expectDisplayed, windowInfo, assertFitsOnScreen,
};
