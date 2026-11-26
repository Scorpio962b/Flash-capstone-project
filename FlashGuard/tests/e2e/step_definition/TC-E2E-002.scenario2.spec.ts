import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { runQuery, closeDb } from '../support/db';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const API_PORT = process.env.API_PORT ?? '4000';
const EMAIL = process.env.ALICE_EMAIL!;
const PASSWORD = process.env.ALICE_PASSWORD!;

// The blocked recipient. Note: Charlie Frozen is an inactive account (is_active = false),
// not a true sanctioned recipient, so the app only returns a generic validation error.
const SANCTIONED_RECIPIENT = 'Charlie Frozen';

test.afterAll(async () => {
  await closeDb();
});

// Highest id in a table right now. Comparing ids avoids timezone problems with timestamps.
async function maxId(table: 'transactions' | 'ledger_entries' | 'audit_log'): Promise<number> {
  const [{ m }] = await runQuery(`SELECT ISNULL(MAX(id), 0) AS m FROM ${table}`);
  return m;
}

test('TC-E2E-002 @P0 @defect Scenario 2: Failed compliance check', async ({ page }) => {
  // log every call the web app makes to the API
  page.on('response', r => {
    if (r.url().includes(`:${API_PORT}`)) {
      console.log(r.request().method(), r.status(), r.url());
    }
  });

  // snapshot the DB before the transfer
  const [{ id: aliceId, balance: balanceBefore }] = await runQuery(
    `SELECT id, balance FROM accounts WHERE email = @email`, { email: EMAIL });
  const txnIdBefore = await maxId('transactions');
  const ledgerIdBefore = await maxId('ledger_entries');
  const auditIdBefore = await maxId('audit_log');

  await test.step('Log in as Alice', async () => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Portfolio Overview' })).toBeVisible();
  });

  // Step 1: user attempts transfer to sanctioned recipient, API returns an error
  const transferResponse = await test.step('Transfer to sanctioned recipient', async () => {
    await page.getByRole('link', { name: /Transfer Funds/ }).click();

    await page.getByRole('radio', { name: /Alice Ledger/ }).check();                 // pay from
    await page.getByText(new RegExp(`${SANCTIONED_RECIPIENT}.*Select`)).click();     // recipient card
    await page.getByRole('spinbutton').fill('100');
    await page.getByRole('textbox', { name: /Invoice INV/ }).fill('Compliance test');

    // start listening right before the submit click
    const responsePromise = page.waitForResponse(
      r => r.request().method() === 'POST' && r.url().includes('/transactions/transfer'),
      { timeout: 10000 }
    );
    await page.getByRole('button', { name: /transfer|send|confirm|continue|pay|submit/i }).click();

    return await responsePromise;
  });

  await test.step('API returns an error for the sanctioned recipient', async () => {
    expect(transferResponse.status()).toBe(400);
    const body = await transferResponse.json();
    console.log('Transfer body:', JSON.stringify(body));
    expect(body.message).toBeTruthy();

    // DEFECT: the error should say it was a compliance/sanction block
    expect.soft(JSON.stringify(body), 'API error should mention the compliance/sanction reason')
      .toMatch(/sanction|compliance|blocked/i);
  });

  // Step 2: web UI displays a user-friendly error message
  await test.step('UI shows a user-friendly error', async () => {
    const error = page.getByRole('alert')
      .or(page.getByText(/not valid|blocked|compliance|unable|failed|declined/i))
      .first();
    await expect(error).toBeVisible();
    console.log('UI error text:', await error.innerText());
    await expect(error).not.toContainText(/500|stack|exception|undefined/i);
    await expect(page.getByText(/transfer successful/i)).toHaveCount(0);
  });

  // Step 3: transaction NOT created in DB, no orphaned records
  await test.step('No transaction created in the DB', async () => {
    const [{ newTxns }] = await runQuery(
      `SELECT COUNT(*) AS newTxns FROM transactions WHERE id > @txnIdBefore`, { txnIdBefore });
    expect(newTxns, 'no new transaction rows').toBe(0);

    const [{ balance }] = await runQuery(
      `SELECT balance FROM accounts WHERE id = @id`, { id: aliceId });
    expect(balance, 'Alice balance unchanged').toBe(balanceBefore);

    const [{ newLedger }] = await runQuery(
      `SELECT COUNT(*) AS newLedger FROM ledger_entries WHERE id > @ledgerIdBefore`, { ledgerIdBefore });
    expect(newLedger, 'no new ledger entries').toBe(0);

    const [{ orphans }] = await runQuery(
      `SELECT COUNT(*) AS orphans FROM ledger_entries le
       LEFT JOIN transactions t ON t.id = le.transaction_id
       WHERE t.id IS NULL AND le.id > @ledgerIdBefore`, { ledgerIdBefore });
    expect(orphans, 'no orphaned ledger entries').toBe(0);
  });

  // Step 4: audit log records the attempt and the failure reason
  await test.step('Audit log records attempt and failure reason', async () => {
    // everything written to the audit log for Alice since the test started
    const getRows = () => runQuery(
      `SELECT id, action, metadata FROM audit_log
       WHERE account_id = @id AND id > @auditIdBefore ORDER BY id`, { id: aliceId, auditIdBefore });

    // give a slow audit write up to 5 seconds, ignoring the login entry from this test
    let rows = await getRows();
    for (let i = 0; i < 10 && !rows.some(r => r.action !== 'login'); i++) {
      await page.waitForTimeout(500);
      rows = await getRows();
    }
    console.log('Audit entries written during this test:');
    console.table(rows);

    // DEFECT: the app writes no audit entry for the failed transfer attempt
    const attempt = rows.filter(r => r.action !== 'login');
    expect.soft(attempt.length, 'Audit log should have an entry for the failed transfer attempt')
      .toBeGreaterThan(0);

    if (attempt.length > 0) {
      expect.soft(JSON.stringify(attempt.map(r => r.action))).toMatch(/transfer/i);                           // the attempt
      expect.soft(JSON.stringify(attempt.map(r => r.metadata))).toMatch(/sanction|compliance|blocked|not valid/i); // the failure reason
    }
  });
});