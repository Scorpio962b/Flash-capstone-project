import { UserWorld } from './World';
import { expect } from '@playwright/test';

// Maps the friendly bundle names used in Gherkin to the API bundle codes.
export const BUNDLE_MAP: Record<string, string> = {
  '500MB': 'D500MB',
  '1GB': 'D1GB',
  '2GB': 'D2GB',
  '5GB': 'D5GB',
  '10GB': 'D10GB'
};

// Locators taken from data-app/public/data-bundle.html
export const MOBILE_FIELD = '#mobile';
export const BUNDLE_LIST = '#bundle';
export const BUY_BUTTON = 'button:has-text("Buy data")';
export const MESSAGE = '[data-testid="purchase-message"]';
export const REFERENCE = '[data-testid="purchase-reference"]';
export const BALANCE = '[data-testid="wallet-balance"]';

// Shared helper (a normal function, not a step) that fills and submits the purchase form.
export async function submitPurchaseForm(world: UserWorld, mobile: string, bundle: string) {
  const page = world.page!;
  await page.fill(MOBILE_FIELD, mobile || '');

  if (bundle && bundle !== 'None') {
    const code = BUNDLE_MAP[bundle] || bundle;
    await page.selectOption(BUNDLE_LIST, code);
  } else {
    await page.selectOption(BUNDLE_LIST, '');
  }

  await page.click(BUY_BUTTON);
}
//DASHBORDLANCE HELPERS
//DON'T CHANGE ANYTHING BELOW THIS LINE UNLESS YOU ARE POLITE.

const ACCOUNTS_API = 'http://localhost:4000/accounts';

export function formatBalance(balance: string): RegExp {
  const amount = Number(balance);
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid balance: "${balance}"`);
  }

  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  const escaped = formatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexibleSpacing = escaped.replace(/[\s\u00a0\u202f]+/g, '[\\s\\u00a0\\u202f]+');
  return new RegExp(`^${flexibleSpacing}$`);
}

export function dashboardAccounts(aliceBalance: string) {
  return [
    {
      id: 1,
      email: 'alice@flashguard.local',
      full_name: 'Alice Ledger',
      balance: Number(aliceBalance),
      is_active: true,
    },
    {
      id: 2,
      email: 'bob@flashguard.local',
      full_name: 'Bob Wallet',
      balance: 2500,
      is_active: true,
    },
    {
      id: 3,
      email: 'charlie@flashguard.local',
      full_name: 'Charlie Cash',
      balance: 500,
      is_active: true,
    },
  ];
}

export async function mockAccountBalance(world: UserWorld, balance: string) {
  const accounts = dashboardAccounts(balance);
  const accountsUrl = new URL(ACCOUNTS_API);

  await world.page.route(
    (url) =>
      url.origin === accountsUrl.origin &&
      (url.pathname === accountsUrl.pathname ||
        url.pathname === `${accountsUrl.pathname}/1`),
    async (route) => {
      const request = route.request();
      const requestUrl = new URL(request.url());

      if (request.method() === 'GET' && requestUrl.pathname === accountsUrl.pathname) {
        await route.fulfill({ json: accounts });
        return;
      }

      if (request.method() === 'PUT' && requestUrl.pathname === `${accountsUrl.pathname}/1`) {
        const body: unknown = request.postDataJSON();
        if (
          typeof body !== 'object' ||
          body === null ||
          !('balance' in body) ||
          typeof body.balance !== 'number' ||
          !Number.isFinite(body.balance)
        ) {
          throw new Error('Account update request must include a finite numeric balance.');
        }

        const aliceAccount = accounts.find((account) => account.id === 1);
        if (!aliceAccount) {
          throw new Error('Alice account is missing from the dashboard fixture.');
        }

        aliceAccount.balance = body.balance;
        await route.fulfill({ json: aliceAccount });
        return;
      }

      throw new Error(`Unexpected mocked accounts request: ${request.method()} ${request.url()}`);
    },
  );
}

export async function updateMockAccountBalance(world: UserWorld, balance: string) {
  const amount = Number(balance);
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid balance: "${balance}"`);
  }

  const result = await world.page.evaluate(async ({ url, balance: updatedBalance }) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Alice Ledger', balance: updatedBalance }),
    });

    return { ok: response.ok, status: response.status };
  }, { url: `${ACCOUNTS_API}/1`, balance: amount });

  if (!result.ok) {
    throw new Error(`Account update failed with HTTP ${result.status}.`);
  }
}

export async function expectAccountBalance(world: UserWorld, balance: string) {
  await expect(world.page.getByText(formatBalance(balance))).toBeVisible();
}