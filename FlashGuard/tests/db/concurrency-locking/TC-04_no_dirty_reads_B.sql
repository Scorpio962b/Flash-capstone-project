-- TC-04 | Concurrency & Locking | P1 | SESSION B
-- STEP 2 (B): read the balance. Expect it to wait, or show 10000. Never 9950.
USE FlashGuard;
GO

SELECT balance FROM dbo.accounts WHERE id = 1;
