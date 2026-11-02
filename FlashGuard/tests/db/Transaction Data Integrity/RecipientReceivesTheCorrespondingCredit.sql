/*
P0 Test 7: Recipient Receives the Corresponding Credit

Objective:
Verify that each completed transfer has a credit ledger
entry for the correct recipient and amount.
*/

/*
REPORT: The query checks for completed transfer transactions and their corresponding credit ledger entries.

# P0 Test 7: Recipient Receives the Corresponding Credit

**Test File:** `RecipientReceivesTheCorrespondingCredit.sql`

**Objective:**  
Verify that every completed transfer credits the correct recipient's account with the transaction amount.

**Expected Result:**  
Each completed transfer should have a credit ledger entry associated with the recipient's account ID, with an amount equal to the transaction amount.

**Actual Result:**

- Transaction 1: R250.00 transferred; Bob's account received a R250.00 credit.
- Transaction 5: R10.00 transferred; Bob's account received a R10.00 credit.
- Both transactions contain exactly one credit entry.

**Overall Status:** PASS — for the two completed transfers returned by the query.

**Evidence:**  
SQL output from `RecipientReceivesTheCorrespondingCredit.sql`.

**Limitation:**  
The test confirms the recorded credit entries for existing completed transfers. It does not independently prove that the recipient's current account balance increased by the same amount during each transaction, or that every possible transfer scenario behaves correctly.
*/

USE FlashGuard;
GO

SELECT
    t.id AS transaction_id,
    t.status,
    t.amount AS transaction_amount,

    t.sender_account_id,
    sender.email AS sender_email,

    t.recipient_account_id,
    recipient.email AS recipient_email,

    COUNT(CASE
        WHEN le.entry_type = 'credit' THEN 1
    END) AS credit_entry_count,

    COALESCE(SUM(CASE
        WHEN le.entry_type = 'credit' THEN le.amount
        ELSE 0
    END), 0) AS total_credits,

    COALESCE(SUM(CASE
        WHEN le.entry_type = 'credit'
         AND le.account_id = t.recipient_account_id
        THEN le.amount
        ELSE 0
    END), 0) AS recipient_credit_amount

FROM dbo.transactions AS t

LEFT JOIN dbo.accounts AS sender
    ON sender.id = t.sender_account_id

LEFT JOIN dbo.accounts AS recipient
    ON recipient.id = t.recipient_account_id

LEFT JOIN dbo.ledger_entries AS le
    ON le.transaction_id = t.id

WHERE t.status = 'completed'
  AND t.transaction_type = 'transfer'

GROUP BY
    t.id,
    t.status,
    t.amount,
    t.sender_account_id,
    sender.email,
    t.recipient_account_id,
    recipient.email

ORDER BY t.id;
GO
