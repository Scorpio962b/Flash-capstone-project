-- TC-04 | Concurrency & Locking | P1 | SESSION A
-- Verify no dirty reads. Expected: B never sees 9950
USE FlashGuard;
GO

-- PRECONDITION
UPDATE dbo.accounts SET balance = 10000 WHERE id = 1;

-- STEP 1 (A): change the balance, do NOT commit
BEGIN TRANSACTION;
UPDATE dbo.accounts SET balance = balance - 50 WHERE id = 1;

-- >>> Go to the Session B file and do STEP 2 <<<

-- STEP 3 (A): undo the change. B finishes and shows 10000
ROLLBACK;