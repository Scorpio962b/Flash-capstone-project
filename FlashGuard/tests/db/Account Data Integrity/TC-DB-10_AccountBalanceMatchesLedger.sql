
/*
P0 Test 1: Account Balance Matches Ledger


Test ID: DB-ACC-001
Purpose:
Validate that an account balance matches
the total credits minus the total debits.

Expected Outcome:
The query should return no accounts
with an incorrect balance.
*/



USE FlashGuard;
GO 

SELECT
    a.id AS account_id,
    a.email,
    a.balance AS current_balance,

    COALESCE(
        SUM(
            CASE
                WHEN le.entry_type = 'credit' THEN le.amount
                WHEN le.entry_type = 'debit' THEN -le.amount
                ELSE 0
            END
        ), 0
    ) AS net_ledger_balance,

    a.balance - COALESCE(
        SUM(
            CASE
                WHEN le.entry_type = 'credit' THEN le.amount
                WHEN le.entry_type = 'debit' THEN -le.amount
                ELSE 0
            END
        ), 0
    ) AS balance_difference

FROM dbo.accounts AS a
LEFT JOIN dbo.ledger_entries AS le
    ON a.id = le.account_id

GROUP BY
    a.id,
    a.email,
    a.balance

ORDER BY a.id;
