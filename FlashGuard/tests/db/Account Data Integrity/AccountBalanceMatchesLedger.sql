
/*
P0 Test 1: Account Balance Matches Ledger

Expected rule:
Current Balance = Opening Balance + Credits - Debits

IMPORTANT:
The current database schema has no opening_balance column.
Seeded opening balances were inserted directly into dbo.accounts
without corresponding opening entries in dbo.ledger_entries.

Therefore, a difference does not automatically mean the test failed.
Record the result as PENDING INVESTIGATION until the intended
opening-balance accounting design is confirmed.
*/

/*
Report:
The query compares each account's current balance with its net ledger balance. 

| Field              | Meaning                                  |
| :----------------- | :--------------------------------------- |
| current_balance    | Balance stored in dbo.accounts           |
| net_ledger_balance | Total credits minus total debits         |
| balance_difference | Current balance minus net ledger balance |

Expected result: The difference should be zero if the ledger includes the opening balance and all subsequent movements.

Your current result: The check is PENDING INVESTIGATION, not a confirmed pass or fail. The opening balances were seeded directly into the accounts table without matching opening ledger entries, so the two values are not yet directly comparable.

For example, Alice's balance was initially R10,000, but the opening amount wasn't represented in the ledger. After the successful R10 transfer to Bob, Alice's balance became R9,990 and Bob's became R2,510.
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
