
/*
P0 Test 8: Failed Transactions Do Not Change Balances

Objective:
Verify that rejected or failed transactions do not create
ledger entries that debit or credit customer accounts.

Expected result:
- Failed/rejected transactions have no posted ledger entries.
- Sender and recipient balances remain unchanged by the failure.

Note:
This query checks transaction and ledger records.
It cannot independently prove historical balances stayed
unchanged without before-and-after balance snapshots.
*/

/*
REPORT: The query checks for transactions with status 'failed' or 'rejected'

### P0 Test 8: Failed Transactions Do Not Change Balances

**Test file:** `FailedTransactionsDoNotChangeBalances.sql`

**Objective:** Verify that failed or rejected transactions do not affect customer balances through posted ledger entries.

**Test data:** Transaction ID 3 — R15,000 transfer rejected by the AML compliance rule.

**Expected result:**
- Transaction remains rejected.
- No debit or credit ledger entries are posted.
- Sender and recipient balances are not changed by the rejected transaction.

**Actual result:**
- Status: `rejected`.
- Compliance flag: `aml`.
- Ledger entry count: 0.
- Total debits: R0.00.
- Total credits: R0.00.
- Current Alice balance: R9,990.00.
- Current Charlie balance: R450.00.

**Status:** PASS for the rejected AML transaction scenario.

**Supporting evidence:** SQL query results and inspection of the API rejection path, which does not update account balances or insert ledger entries.

**Limitation:** No before-and-after balance snapshots were available to independently demonstrate historical balance changes.
*/

USE FlashGuard;
GO

SELECT
    t.id AS transaction_id,
    t.status,
    t.amount,
    t.compliance_flag,
    t.sender_account_id,
    sender.email AS sender_email,
    sender.balance AS sender_current_balance,
    t.recipient_account_id,
    recipient.email AS recipient_email,
    recipient.balance AS recipient_current_balance,
    COUNT(le.id) AS ledger_entry_count,
    COALESCE(
        SUM(CASE WHEN le.entry_type = 'debit'
                 THEN le.amount ELSE 0 END), 0
    ) AS total_debits,
    COALESCE(
        SUM(CASE WHEN le.entry_type = 'credit'
                 THEN le.amount ELSE 0 END), 0
    ) AS total_credits
FROM dbo.transactions AS t
LEFT JOIN dbo.accounts AS sender
    ON sender.id = t.sender_account_id
LEFT JOIN dbo.accounts AS recipient
    ON recipient.id = t.recipient_account_id
LEFT JOIN dbo.ledger_entries AS le
    ON le.transaction_id = t.id
WHERE t.status IN ('failed', 'rejected')
GROUP BY
    t.id,
    t.status,
    t.amount,
    t.compliance_flag,
    t.sender_account_id,
    sender.email,
    sender.balance,
    t.recipient_account_id,
    recipient.email,
    recipient.balance
ORDER BY t.id;
GO
