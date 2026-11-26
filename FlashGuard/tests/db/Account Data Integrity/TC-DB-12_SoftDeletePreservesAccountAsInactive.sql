/*
P0 Test 3: Soft Delete Preserves Account as Inactive


Test ID: DB-ACC-003

Purpose:
Validate that an account is marked as INACTIVE
when deleted instead of being permanently
removed from the database.

Expected Outcome:
The account record should still exist in the
database with an INACTIVE status.

*/

USE FlashGuard;
GO

SELECT
    id AS account_id,
    email,
    full_name,
    is_active,
    balance,
    created_at
FROM dbo.accounts
WHERE is_active = 0
ORDER BY id;
