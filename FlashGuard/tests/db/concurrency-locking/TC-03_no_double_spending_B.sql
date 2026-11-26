-- TC-03 | Concurrency & Locking | P1 | SESSION B
-- STEP 2 (B): start and try to lock. Expect it to WAIT.
USE FlashGuard;
GO

BEGIN TRANSACTION;
SELECT balance FROM dbo.accounts WITH (UPDLOCK, ROWLOCK) WHERE id = 1;

-- >>> Go to the Session A file and do STEPS 3 and 4 <<<

-- STEP 5 (B): spend 80. Expect rows_changed = 0
UPDATE dbo.accounts SET balance = balance - 80 WHERE id = 1 AND balance >= 80;
SELECT @@ROWCOUNT AS rows_changed;

-- STEP 6 (B): commit
COMMIT;