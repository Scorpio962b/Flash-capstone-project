-- TC-03 | Concurrency & Locking | P1 | SESSION A
-- Verify no double-spending. Expected final balance: 20
-- Run each block below separately (highlight, then run).
USE FlashGuard;
GO

-- PRECONDITION (run once)
UPDATE dbo.accounts SET balance = 100 WHERE id = 1;

-- STEP 1 (A): start and lock. Expect balance 100. Do NOT commit.
BEGIN TRANSACTION;
SELECT balance FROM dbo.accounts WITH (UPDLOCK, ROWLOCK) WHERE id = 1;

-- >>> Now go to the Session B file and do STEP 2 <<<

-- STEP 3 (A): spend 80. Expect rows_changed = 1
UPDATE dbo.accounts SET balance = balance - 80 WHERE id = 1 AND balance >= 80;
SELECT @@ROWCOUNT AS rows_changed;

-- STEP 4 (A): commit. Session B wakes up and shows 20
COMMIT;

-- VERIFY (after B has committed). Expect 20
SELECT balance FROM dbo.accounts WHERE id = 1;