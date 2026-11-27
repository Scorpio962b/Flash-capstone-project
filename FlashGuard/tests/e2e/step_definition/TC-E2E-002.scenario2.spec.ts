import "dotenv/config";
import { test, expect } from "@playwright/test";
import { runQuery, closeDb } from "../support/db";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ALICE_EMAIL!;
const PASSWORD = process.env.ALICE_PASSWORD!;

// CHANGED: fail loudly if credentials are missing (e.g. in CI).
// This runs at load time, so test.fail() below cannot hide it.
if (!EMAIL || !PASSWORD) {
  throw new Error(
    "ALICE_EMAIL / ALICE_PASSWORD are not set - add them to .env locally or the workflow env in CI",
  );
}

const SANCTIONED_RECIPIENT = "Charlie Frozen";

test.afterAll(async () => {
  await closeDb();
});

async function maxId(
  table: "transactions" | "ledger_entries" | "audit_log",
): Promise<number> {
  const [{ m }] = await runQuery(
    `SELECT ISNULL(MAX(id), 0) AS m FROM ${table}`,
  );
  return m;
}

test("TC-E2E-002 @P0 @defect Scenario 2: Failed compliance check", async ({
  page,
}) => {
  // CHANGED: known defects - expected to fail until fixed. Playwright reports this as an
  // "expected failure" and flags it as "unexpectedly passed" once fixed; then remove this line.
  test.fail(
    true,
    'DEF-001: compliance rejection returns generic "Sender/recipient not valid"; DEF-002: failed attempt not written to audit_log',
  );

  const [{ id: aliceId, balance: balanceBefore }] = await runQuery(
    "SELECT id, balance FROM accounts WHERE email = @email",
    { email: EMAIL },
  );

  const txnIdBefore = await maxId("transactions");
  const ledgerIdBefore = await maxId("ledger_entries");
  const auditIdBefore = await maxId("audit_log");

  await test.step("Log in as Alice", async () => {
    await page.goto(BASE_URL);
    await page.getByRole("link", { name: "Sign In" }).click();
    await page.getByRole("textbox", { name: "Email address" }).fill(EMAIL);
    await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(
      page.getByRole("heading", { name: "Portfolio Overview" }),
    ).toBeVisible();
  });

  const transferResponse =
    await test.step("Transfer to sanctioned recipient", async () => {
      await page.getByRole("link", { name: /Transfer Funds/ }).click();

      await page.getByRole("radio", { name: /Alice Ledger/ }).check();
      await page
        .getByText(new RegExp(`${SANCTIONED_RECIPIENT}.*Select`))
        .click();
      await page.getByRole("spinbutton").fill("100");
      await page
        .getByRole("textbox", { name: /Invoice INV/ })
        .fill("Compliance test");

      const responsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          response.url().includes("/transactions/transfer"),
        { timeout: 10000 },
      );

      await page
        .getByRole("button", {
          name: /transfer|send|confirm|continue|pay|submit/i,
        })
        .click();

      return responsePromise;
    });

  await test.step("API returns an error for the sanctioned recipient", async () => {
    expect(transferResponse.status()).toBe(400);

    const body = await transferResponse.json();

    expect(body.message).toBeTruthy();

    expect
      .soft(
        JSON.stringify(body),
        "API error should mention the compliance/sanction reason",
      )
      .toMatch(/sanction|compliance|blocked/i);
  });

  await test.step("UI shows a user-friendly error", async () => {
    const error = page
      .getByRole("alert")
      .or(
        page.getByText(/not valid|blocked|compliance|unable|failed|declined/i),
      )
      .first();

    await expect(error).toBeVisible();

    await expect(error).not.toContainText(/500|stack|exception|undefined/i);
    await expect(page.getByText(/transfer successful/i)).toHaveCount(0);
  });

  await test.step("No transaction created in the DB", async () => {
    const [{ newTxns }] = await runQuery(
      "SELECT COUNT(*) AS newTxns FROM transactions WHERE id > @txnIdBefore",
      { txnIdBefore },
    );

    expect(newTxns, "no new transaction rows").toBe(0);

    const [{ balance }] = await runQuery(
      "SELECT balance FROM accounts WHERE id = @id",
      { id: aliceId },
    );

    expect(balance, "Alice balance unchanged").toBe(balanceBefore);

    const [{ newLedger }] = await runQuery(
      "SELECT COUNT(*) AS newLedger FROM ledger_entries WHERE id > @ledgerIdBefore",
      { ledgerIdBefore },
    );

    expect(newLedger, "no new ledger entries").toBe(0);

    const [{ orphans }] = await runQuery(
      `SELECT COUNT(*) AS orphans FROM ledger_entries le
       LEFT JOIN transactions t ON t.id = le.transaction_id
       WHERE t.id IS NULL AND le.id > @ledgerIdBefore`,
      { ledgerIdBefore },
    );

    expect(orphans, "no orphaned ledger entries").toBe(0);
  });

  await test.step("Audit log records attempt and failure reason", async () => {
    const getRows = () =>
      runQuery(
        `SELECT id, action, metadata FROM audit_log
         WHERE account_id = @id AND id > @auditIdBefore ORDER BY id`,
        { id: aliceId, auditIdBefore },
      );

    await expect
      .poll(
        async () => {
          const rows = await getRows();
          return rows.some((row) => row.action !== "login");
        },
        {
          message: "Waiting for the failed transfer attempt in the audit log",
          timeout: 5000,
          intervals: [500],
        },
      )
      .toBe(true);

    const rows = await getRows();
    const attempt = rows.filter((row) => row.action !== "login");

    expect
      .soft(
        attempt.length,
        "Audit log should have an entry for the failed transfer attempt",
      )
      .toBeGreaterThan(0);

    expect
      .soft(JSON.stringify(attempt.map((row) => row.action)))
      .toMatch(/transfer/i);

    expect
      .soft(JSON.stringify(attempt.map((row) => row.metadata)))
      .toMatch(/sanction|compliance|blocked|not valid/i);
  });
});
