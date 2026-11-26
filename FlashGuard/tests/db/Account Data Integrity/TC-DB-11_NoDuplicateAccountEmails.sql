
/*
P0 Test 2: No Duplicate Account Emails


Test ID: DB-ACC-002

Purpose:
Validate that no duplicate accounts exist
using the same customer email address.

Expected Outcome:
The query should return no duplicate email
addresses associated with multiple accounts.

*/

USE FlashGuard;
GO

SELECT
    email,
    COUNT(*) AS account_count
FROM dbo.accounts
GROUP BY email
HAVING COUNT(*) > 1;
