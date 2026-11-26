-- TC-02 | Recipient Validation | P0
-- Verify sender cannot be recipient
-- Expected: 0 rows from each query (run one at a time)
USE FlashGuard;
GO

SELECT id, sender_account_id, recipient_account_id
FROM dbo.transactions
WHERE sender_account_id = recipient_account_id;

SELECT id, sender_account_id, recipient_account_id
FROM dbo.recipients
WHERE sender_account_id = recipient_account_id;