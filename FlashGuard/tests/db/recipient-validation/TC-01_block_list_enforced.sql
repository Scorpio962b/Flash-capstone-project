-- TC-01 | Recipient Validation | P0
-- Verify recipient block list is enforced (blacklist_status = 'blocked')
-- Expected: 0 rows
USE FlashGuard;
GO

SELECT t.id, t.sender_account_id, t.recipient_account_id, t.status, r.blacklist_status
FROM dbo.transactions t
JOIN dbo.recipients r
  ON r.sender_account_id = t.sender_account_id
 AND r.recipient_account_id = t.recipient_account_id
WHERE r.blacklist_status = 'blocked'
  AND t.status NOT IN ('rejected');