/*
P0 Test 4: Transaction Amount Matches Ledger Entries

Objective:
Verify that completed transactions have matching debit
and credit ledger entries equal to the transaction amount.
*/

/*
REPORT: The query checks for completed transactions and their corresponding ledger entries.

# P0 Test 4: Transaction Amount Matches Ledger Entries

**Test File:** `TransactionAmountMatchesLedgerEntries.sql`

**Objective:**  
Verify that each completed transaction has corresponding debit and credit ledger entries that match the transaction amount.

**Test Data and Results:**

| Transaction ID | Transaction Amount | Total Debits | Total Credits | Result |
|---|---:|---:|---:|---|
| 1 | R250.00 | R250.00 | R250.00 | PASS |
| 5 | R10.00 | R10.00 | R10.00 | PASS |

**Expected Result:**  
Each completed transfer should have one debit entry and one credit entry, with both amounts equal to the transaction amount.

**Actual Result:**  
Both completed transactions have exactly one debit and one credit entry. The debit and credit totals match their respective transaction amounts.

**Overall Status:** PASS — for the completed transactions returned by the query.

**Evidence:**  
SQL query output from `TransactionAmountMatchesLedgerEntries.sql`.

**Limitation:**  
The test currently verifies existing completed transactions only. Additional tests would be required to verify missing entries, duplicate entries, and other transaction statuses.
*/

USE FlashGuard;
GO

SELECT
    t.id AS transaction_id,
    t.status,
    t.amount AS transaction_amount,

    COUNT(CASE
        WHEN le.entry_type = 'debit' THEN 1
    END) AS debit_entry_count,

    COALESCE(SUM(CASE
        WHEN le.entry_type = 'debit' THEN le.amount
        ELSE 0
    END), 0) AS total_debits,

    COUNT(CASE
        WHEN le.entry_type = 'credit' THEN 1
    END) AS credit_entry_count,

    COALESCE(SUM(CASE
        WHEN le.entry_type = 'credit' THEN le.amount
        ELSE 0
    END), 0) AS total_credits

FROM dbo.transactions AS t

LEFT JOIN dbo.ledger_entries AS le
    ON le.transaction_id = t.id

WHERE t.status = 'completed'

GROUP BY
    t.id,
    t.status,
    t.amount

ORDER BY t.id;
GO
