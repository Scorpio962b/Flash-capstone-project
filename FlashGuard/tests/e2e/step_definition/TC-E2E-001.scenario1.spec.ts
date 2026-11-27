
import { test, expect } from '@playwright/test';
import { executeSql, getLatestLoginAuditId } from '../helpers/database';
import { loginAsAlice } from '../helpers/scenario1-actions';
import {
  ACCOUNT_ID,
  API_URL,
  BASE_URL,
  EMAIL,
  PASSWORD
} from '../helpers/scenario1-data';
import {
  createMobileSession,
  getMobileSessionConfig,
  mobileLogin,
  openMobileHistory,
  findMobileTransactionRow,
  readMobileDashboardBalance
} from '../helpers/scenario1-mobile-session';

test.describe('Flash-Guard - Transfer Integration', () => {

    test('E2E-001: User successfully logs in through the web application', async ({ page }) => {
    
        // Open the Vite web application using the configured baseURL
        await loginAsAlice(page);
    
        // Verify successful authentication
        await expect(page).toHaveURL(/dashboard/);
    
        await expect(
          page.getByText('Welcome back, Alice Ledger!')
        ).toBeVisible();
    
        // Verify the browser stored the authenticated session
        const session = await page.evaluate(() =>
          localStorage.getItem('flashguard-session')
        );
    
        expect(session).not.toBeNull();
    
        const parsedSession = JSON.parse(session!);
    
        expect(parsedSession.token).toBeTruthy();
        expect(parsedSession.user.email).toBe(EMAIL);
      });
    
    
      test('E2E-001-validation: Successful API login creates a new database audit record', async ({ request }) => {
    
        // Capture the latest login audit ID before the API request
        const previousAuditId = getLatestLoginAuditId(ACCOUNT_ID);
    
        // Authenticate through the actual API
        const response = await request.post(`${API_URL}/auth/login`, {
          data: {
            email: EMAIL,
            password: PASSWORD
          }
        });
    
        expect(response.status()).toBe(200);
    
        const responseBody = await response.json();
    
        expect(responseBody.token).toBeTruthy();
        expect(responseBody.user.email).toBe(EMAIL);
        expect(responseBody.user.id).toBe(ACCOUNT_ID);
    
        // Verify that a new database audit record was created
        const latestAuditId = getLatestLoginAuditId(ACCOUNT_ID);
    
        expect(latestAuditId).toBeGreaterThan(previousAuditId);
      });

  // E2E-002: Verify a successful transfer through the web application
  test('E2E-002: User successfully submits a funds transfer through the web application', async ({ page }) => {
        
         const notificationRequests: {
         url: string;
         method: string;
         }[] = [];

        page.on('request', request => {
          if (/notification|sms|push|twilio|message/i.test(request.url())) {
           notificationRequests.push({
           url: request.url(),
           method: request.method()
    });
  }
});
    // Step 1: Log in as Alice
    await loginAsAlice(page);

    // Step 2: Open the Transfer Funds page
    await page.goto(`${BASE_URL}/transfers`);

    // Step 3: Verify Alice is automatically selected as the sender
    await expect(
      page.getByText('Alice Ledger', { exact: true }).first()
    ).toBeVisible();

    const senderRadio = page.locator('input[name="from_account"]').first();

    await expect(senderRadio).toBeChecked();

    // Step 4: Select Bob as the recipient
    const beneficiarySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'To Beneficiary' })
    });
    await beneficiarySection.getByText('Bob Wallet', { exact: true }).click();

    // Step 5: Enter transfer details
    await page.getByPlaceholder('0.00').fill('10.00');

    await page.getByPlaceholder('e.g. Invoice INV-2024-001')
      .fill('E2E-002 Test Transfer');

    // Step 6: Capture the transfer API response
    const transferResponsePromise = page.waitForResponse(response =>
      response.url().includes('/transactions/transfer') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', {
      name: 'Confirm & Transfer'
    }).click();

    const transferResponse = await transferResponsePromise;

    // Step 7: Verify successful API response
    expect(transferResponse.status()).toBe(201);

    const transfer = await transferResponse.json();

    expect(transfer.id).toBeTruthy();
    expect(transfer.sender_account_id).toBe(1);
    expect(transfer.recipient_account_id).toBe(2);
    expect(Number(transfer.amount)).toBe(10);
    expect(transfer.status).toBe('pending');

    // Step 8: Verify success notification
    await expect(
      page.getByText(
        new RegExp(`Transfer #${transfer.id} created successfully!`)
      )
    ).toBeVisible();

    //  notification network evidence
    await test.info().attach('E2E-011-notification-network-observation', {
       body: JSON.stringify(notificationRequests, null, 2),
       contentType: 'application/json'
    });
  });


  // E2E-004: Verify transfer persistence in SQL Server
  test('E2E-004: Successful transfer is correctly persisted in the database', async ({ page }) => {

    // Step 1: Log in as Alice
    await loginAsAlice(page);

    // Step 2: Open the Transfer Funds page
    await page.goto(`${BASE_URL}/transfers`);

    // Step 3: Verify Alice is selected as the sender
    await expect(
      page.getByText('Alice Ledger', { exact: true }).first()
    ).toBeVisible();

    const senderRadio = page.locator('input[name="from_account"]').first();

    await expect(senderRadio).toBeChecked();

    // Step 4: Select Bob as the recipient
    const beneficiarySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'To Beneficiary' })
    });
    await beneficiarySection.getByText('Bob Wallet', { exact: true }).click();

    // Step 5: Enter a fresh transfer
    await page.getByPlaceholder('0.00').fill('10.00');

    await page.getByPlaceholder('e.g. Invoice INV-2024-001')
      .fill('E2E-004 Database Persistence Test');

    // Step 6: Capture the transaction created by the API
    const transferResponsePromise = page.waitForResponse(response =>
      response.url().includes('/transactions/transfer') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', {
      name: 'Confirm & Transfer'
    }).click();

    const transferResponse = await transferResponsePromise;

    // Step 7: Verify that the API created the transaction
    expect(transferResponse.status()).toBe(201);

    const transfer = await transferResponse.json();

    const transactionId = Number(transfer.id);

    expect(Number.isInteger(transactionId)).toBe(true);
    expect(transactionId).toBeGreaterThan(0);

    // Step 8: Query SQL Server using the generated transaction ID
    const databaseResult = executeSql(`
      SET NOCOUNT ON;

      SELECT
        sender_account_id,
        recipient_account_id,
        amount,
        status,
        transaction_type
      FROM dbo.transactions
      WHERE id = ${transactionId};
    `);

    // Step 9: Confirm that the transaction exists in the database
    expect(
      databaseResult,
      `Transaction ${transactionId} was not found in the database`
    ).not.toBe('');

    const databaseRecord = databaseResult.split('|');

    expect(databaseRecord).toHaveLength(5);

    // step 10: Verify the persisted transaction details
    expect(Number(databaseRecord[0])).toBe(1);
    expect(Number(databaseRecord[1])).toBe(2);
    expect(Number(databaseRecord[2])).toBe(10);
    expect(databaseRecord[3]).toBe('pending');
    expect(databaseRecord[4]).toBe('transfer');

    // step 11:Verify the success notification
    await expect(
      page.getByText(
        new RegExp(`Transfer #${transactionId} created successfully!`)
      )
    ).toBeVisible();

  });

  const toCents = (value: string | number) => Math.round(Number(value) * 100);

  const getAccountBalanceCents = (accountId: number): number => {
    const result = executeSql(`
      SET NOCOUNT ON;

      SELECT CAST(balance AS DECIMAL(18,2))
      FROM dbo.accounts
      WHERE id = ${accountId};
    `);

    if (!result) {
      throw new Error(`Account ${accountId} was not found when reading balance`);
    }

    return toCents(result);
  };

  const getTransactionStatus = (transactionId: number): string => {
    const result = executeSql(`
      SET NOCOUNT ON;

      SELECT status
      FROM dbo.transactions
      WHERE id = ${transactionId};
    `);

    if (!result) {
      throw new Error(`Transaction ${transactionId} was not found when reading status`);
    }

    return result;
  };

  // E2E-005: Verify transfer appears in history and balance matches.
  // Mobile verification through Appium/WebdriverIO. Requires a running Appium server and
  // an installed Android app (APK_PATH or APP_PACKAGE/APP_ACTIVITY).
  test('E2E-005: Mobile history shows the transfer and matching balance', async ({ request }) => {
    const mobileConfig = getMobileSessionConfig();

    // eslint-disable-next-line playwright/no-skipped-test -- Mobile test requires optional Appium configuration.
    test.skip(
      !mobileConfig,
      'Set APK_PATH or APP_PACKAGE (and optionally APPIUM_SERVER_URL) to run mobile Appium checks.'
    );

    test.setTimeout(120_000);
    
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: EMAIL, password: PASSWORD }
    });
    expect(loginResponse.status()).toBe(200);
    const { token } = await loginResponse.json();

    const senderBeforeResponse = await request.get(`${API_URL}/accounts/${ACCOUNT_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(senderBeforeResponse.status()).toBe(200);
    const senderBefore = await senderBeforeResponse.json();

    const transferResponse = await request.post(`${API_URL}/transactions/transfer`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        senderAccountId: ACCOUNT_ID,
        recipientAccountId: 2,
        amount: 10,
        transactionType: 'transfer'
      }
    });
    expect(transferResponse.status()).toBe(201);
    const transfer = await transferResponse.json();
    const transactionId = Number(transfer.id);

    const mobile = await createMobileSession(mobileConfig!);
    try {
      await mobileLogin(mobile, EMAIL, PASSWORD);
      await openMobileHistory(mobile);

      const row = await findMobileTransactionRow(mobile, transactionId);
      await expect.poll(async () => row.getText(), {
        timeout: 15_000,
        intervals: [500, 1000, 2000]
      }).toContain('10.00');

      const uiBalanceText = await readMobileDashboardBalance(mobile);
      const uiBalanceCents = toCents(uiBalanceText.replace(/[^0-9.-]/g, ''));

      const senderAfterResponse = await request.get(`${API_URL}/accounts/${ACCOUNT_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(senderAfterResponse.status()).toBe(200);
      const senderAfter = await senderAfterResponse.json();

      expect(uiBalanceCents).toBe(toCents(senderAfter.balance));
      expect(toCents(senderAfter.balance)).toBe(toCents(senderBefore.balance));
    } finally {
      await mobile.deleteSession();
    }
  });

  // E2E-006: Verify DB ledger integrity after transfer settlement.
  test('E2E-006: DB ledger integrity after transfer', async ({ request }) => {
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: EMAIL, password: PASSWORD }
    });
    expect(loginResponse.status()).toBe(200);
    const { token } = await loginResponse.json();

    const senderAccountId = ACCOUNT_ID;
    const recipientAccountId = 2;
    const amount = 10;

    const senderBefore = getAccountBalanceCents(senderAccountId);
    const recipientBefore = getAccountBalanceCents(recipientAccountId);

    const transferResponse = await request.post(`${API_URL}/transactions/transfer`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        senderAccountId,
        recipientAccountId,
        amount,
        transactionType: 'transfer'
      }
    });
    expect(transferResponse.status()).toBe(201);
    const transfer = await transferResponse.json();
    const transactionId = Number(transfer.id);

    const authorizeResponse = await request.post(`${API_URL}/transactions/transfer/${transactionId}/authorize`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(authorizeResponse.status()).toBe(200);

    await expect.poll(() => getTransactionStatus(transactionId), {
      timeout: 30_000,
      intervals: [500, 1000, 2000]
    }).toBe('completed');

    const senderAfter = getAccountBalanceCents(senderAccountId);
    const recipientAfter = getAccountBalanceCents(recipientAccountId);
    const amountCents = toCents(amount);

    expect(senderAfter).toBe(senderBefore - amountCents);
    expect(recipientAfter).toBe(recipientBefore + amountCents);
    expect(senderAfter + recipientAfter).toBe(senderBefore + recipientBefore);

    const countResult = executeSql(`
      SET NOCOUNT ON;

      SELECT COUNT(*)
      FROM dbo.transactions
      WHERE id = ${transactionId};
    `);
    expect(Number(countResult)).toBe(1);
  });
});
