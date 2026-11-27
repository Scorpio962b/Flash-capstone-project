
import { Before, Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import page from './primefin.page';
import transferPage, { MobileTransferResult } from './transfer.page';
import { normaliseStatus, round2 } from '../support/helpers';
import {
  authorize,
  getAccounts,
  getBalance,
  getHistory,
  getTransaction,
  loginAs,
  transfer,
  HistoryTx,
  Session,
  TransferResult,
} from '../support/transferApi';

interface ConcurrencyState {
  web: Session;
  senderName?: string;
  recipientId?: number;
  recipientName?: string;
  recipientBalance?: number;
  originalBalance?: number;
  originalIds?: Set<number>;
  mobileAmount?: number;
  webAmount?: number;
  webResult?: TransferResult;
  mobileResult?: MobileTransferResult;
  newTxs?: HistoryTx[];
}

let state: ConcurrencyState | undefined;

const st = (): ConcurrencyState => {
  if (!state) {
    throw new Error('State missing: an account setup step must run first');
  }
  return state;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

Before({ tags: '@concurrency' }, async () => {
  state = undefined;
});

Before({ tags: '@mobile-transfer' }, async () => {
  state = undefined;
});

async function waitForNewTransactions(
  s: ConcurrencyState,
  atLeast: number,
): Promise<HistoryTx[]> {
  const deadline = Date.now() + 10000;
  let fresh: HistoryTx[];

  do {
    const history = await getHistory(s.web);
    fresh = history.filter((t) => !(s.originalIds as Set<number>).has(t.id));

    if (fresh.length >= atLeast) break;

    await sleep(500);
  } while (Date.now() < deadline);

  return fresh;
}

async function initializeState(): Promise<ConcurrencyState> {
  await page.login();
  await page.waitForBalanceLoaded();

  const s: ConcurrencyState = { web: await loginAs('web') };
  const accounts = await getAccounts(s.web);
  const sender = accounts.find((account) => account.id === s.web.userId);
  const recipient = accounts.find((account) => account.id !== s.web.userId);

  if (!sender) {
    throw new Error(`Could not find the signed-in account with ID ${s.web.userId}`);
  }

  if (!recipient) {
    throw new Error('The database needs a second account to act as the transfer recipient');
  }

  s.senderName = sender.full_name;
  s.recipientId = recipient.id;
  s.originalBalance = round2(await getBalance(s.web));
  s.originalIds = new Set(
    (await getHistory(s.web)).map((transaction) => transaction.id),
  );

  state = s;
  return s;
}

// Setup
Given('the account balance is R{float}', async (expectedBalance: number) => {
  const s = await initializeState();

  if (s.originalBalance !== round2(expectedBalance)) {
    throw new Error(
      `Precondition failed: expected the account balance to be R${expectedBalance}, but the database has R${s.originalBalance}. Reseed the demo user first.`,
    );
  }
});

Given('Alice has at least R{float} available', async (minimumBalance: number) => {
  const s = await initializeState();

  if (s.senderName !== 'Alice Ledger') {
    throw new Error(
      `Expected Alice Ledger to be signed in, but the API session belongs to "${s.senderName}"`,
    );
  }

  if ((s.originalBalance as number) < round2(minimumBalance)) {
    throw new Error(
      `Precondition failed: Alice needs at least R${minimumBalance}, but the database has R${s.originalBalance}.`,
    );
  }
});

// Concurrent action
When(
  'mobile transfers R{float} and web transfers R{float} simultaneously',
  async (mobileAmount: number, webAmount: number) => {
    const s = st();
    s.mobileAmount = mobileAmount;
    s.webAmount = webAmount;

    expect(s.originalBalance as number).toBeGreaterThanOrEqual(
      round2(mobileAmount + webAmount),
    );

    await page.openTab('Transact');
    await transferPage.setAmount(mobileAmount);

    const button = await transferPage.reviewButton();
    const delayMs = Number(process.env.WEB_DELAY_MS ?? 0);

    const [, web] = await Promise.all([
      transferPage.tap(button),
      sleep(delayMs).then(() =>
        transfer(s.web, s.recipientId as number, webAmount),
      ),
    ]);

    s.webResult = web;
    s.mobileResult = await transferPage.waitForTransferResult();
  },
);

When(
  'Alice transfers R{float} to {string} and taps Review Transaction',
  async (amount: number, recipientName: string) => {
    const s = st();
    const recipient = (await getAccounts(s.web)).find(
      (account) => account.full_name === recipientName,
    );

    if (!recipient || recipient.id === s.web.userId) {
      throw new Error(`Could not find a transfer recipient named "${recipientName}"`);
    }

    if ((s.originalBalance as number) < round2(amount)) {
      throw new Error(`Alice's balance is too low to transfer R${amount}`);
    }

    s.recipientId = recipient.id;
    s.recipientName = recipientName;
    s.recipientBalance = round2(await getBalance(s.web, recipient.id));
    s.mobileAmount = amount;

    await page.openTab('Transact');

    const mobileBalance = round2(await page.transferScreenBalance());

    if (mobileBalance !== s.originalBalance) {
      throw new Error(
        `The mobile app balance is R${mobileBalance}, but Alice's API balance is R${s.originalBalance}`,
      );
    }

    await transferPage.tapBeneficiary(recipientName);
    await transferPage.setAmount(amount);
    await transferPage.tap(await transferPage.reviewButton());

    s.mobileResult = await transferPage.waitForTransferResult();
  },
);

// Verification
Then('both transfers should succeed', async () => {
  const s = st();

  if (!s.webResult?.ok) {
    throw new Error(
      `Web transfer failed: HTTP ${s.webResult?.httpStatus} ${JSON.stringify(s.webResult?.body)}`,
    );
  }

  if (!s.mobileResult?.ok) {
    throw new Error(
      `Mobile transfer failed: ${s.mobileResult?.message || '(no message)'}`,
    );
  }
});

Then('both transactions should be saved in the database', async () => {
  const s = st();
  const queued = await waitForNewTransactions(s, 2);

  for (const tx of queued) {
    const latest = await getTransaction(s.web, tx.id);

    if (normaliseStatus(latest.status) === 'pending') {
      await authorize(s.web, tx.id);
    }
  }

  s.newTxs = await waitForNewTransactions(s, 2);

  const amounts = s.newTxs
    .map((transaction) => round2(Math.abs(Number(transaction.amount))))
    .sort((a, b) => a - b);

  expect(amounts).toEqual(
    [round2(s.mobileAmount as number), round2(s.webAmount as number)].sort(
      (a, b) => a - b,
    ),
  );
});

Then('the final balance should be R{float}', async (expectedBalance: number) => {
  const s = st();
  const expected = round2(expectedBalance);

  let actual = round2(await getBalance(s.web));
  const deadline = Date.now() + 10000;

  while (actual !== expected && Date.now() < deadline) {
    await sleep(500);
    actual = round2(await getBalance(s.web));
  }

  if (actual === expected) return;

  const original = s.originalBalance as number;
  let hint = 'balance does not match either single debit';

  if (actual === round2(original - (s.mobileAmount as number))) {
    hint = 'the WEB debit was lost (lost update / double-spend)';
  }

  if (actual === round2(original - (s.webAmount as number))) {
    hint = 'the MOBILE debit was lost (lost update / double-spend)';
  }

  throw new Error(
    `Balance mismatch: expected ${expected}, database has ${actual} (original ${original}): ${hint}`,
  );
});

Then('no duplicate transactions should exist', async () => {
  const s = st();

  await sleep(3000);

  const history = await getHistory(s.web);
  const fresh = history.filter(
    (transaction) => !(s.originalIds as Set<number>).has(transaction.id),
  );

  expect(new Set(fresh.map((transaction) => transaction.id)).size).toBe(
    fresh.length,
  );
  expect(fresh.length).toBe(2);
});

Then('the mobile transfer should be submitted successfully', async () => {
  const result = st().mobileResult;

  if (!result?.ok) {
    throw new Error(
      `Mobile transfer failed: ${result?.message || '(no success alert appeared)'}`,
    );
  }
});

Then('the transfer should be completed from Alice to {string}', async (recipientName: string) => {
  const s = st();

  if (s.recipientName !== recipientName) {
    throw new Error(
      `Expected recipient "${recipientName}", but selected "${s.recipientName}"`,
    );
  }

  const fresh = await waitForNewTransactions(s, 1);

  if (fresh.length !== 1) {
    throw new Error(`Expected one new transfer, but found ${fresh.length}`);
  }

  let transaction = await getTransaction(s.web, fresh[0].id);

  expect(Number(transaction.sender_account_id)).toBe(s.web.userId);
  expect(Number(transaction.recipient_account_id)).toBe(s.recipientId);
  expect(round2(Math.abs(Number(transaction.amount)))).toBe(
    round2(s.mobileAmount as number),
  );

  const status = normaliseStatus(transaction.status);

  if (status === 'pending') {
    await authorize(s.web, transaction.id);
    transaction = await getTransaction(s.web, transaction.id);
  } else if (status !== 'completed') {
    throw new Error(
      `Expected a pending or completed transfer, received status "${transaction.status}"`,
    );
  }

  expect(normaliseStatus(transaction.status)).toBe('completed');
  s.newTxs = [transaction];
});

Then(
  "Alice's balance should decrease by R{float} and {string} should increase by R{float}",
  async (debit: number, recipientName: string, credit: number) => {
    const s = st();

    if (s.recipientName !== recipientName) {
      throw new Error(
        `Expected recipient "${recipientName}", but selected "${s.recipientName}"`,
      );
    }

    expect(round2(debit)).toBe(round2(s.mobileAmount as number));
    expect(round2(credit)).toBe(round2(s.mobileAmount as number));

    const expectedAliceBalance = round2(
      (s.originalBalance as number) - debit,
    );
    const expectedRecipientBalance = round2(
      (s.recipientBalance as number) + credit,
    );
    const deadline = Date.now() + 10000;

    let aliceBalance = round2(await getBalance(s.web));
    let recipientBalance = round2(
      await getBalance(s.web, s.recipientId as number),
    );

    while (
      (aliceBalance !== expectedAliceBalance ||
        recipientBalance !== expectedRecipientBalance) &&
      Date.now() < deadline
    ) {
      await sleep(500);
      aliceBalance = round2(await getBalance(s.web));
      recipientBalance = round2(
        await getBalance(s.web, s.recipientId as number),
      );
    }

    expect(aliceBalance).toBe(expectedAliceBalance);
    expect(recipientBalance).toBe(expectedRecipientBalance);
  },
);
