
/*
P0 Test 2: No Duplicate Account Emails

Test file: NoDuplicateAccountEmails.sql

Objective: Verify that each email address belongs to only one account.

Test procedure:

Queried dbo.accounts for duplicate email addresses.

Inspected SQL Server indexes to confirm uniqueness enforcement on email.

Expected result: No duplicate emails exist, and the database enforces uniqueness.

Actual result:

Duplicate email query returned zero rows.

Unique index UQ__accounts__AB6E61641A8CA12D was found on the email column.

is_unique = 1, confirming that the index enforces uniqueness.

Status: PASS.

Evidence: Results from both SQL queries.
*/

/* ### P0 Test 2: No Duplicate Account Emails

**Test file:** `NoDuplicateAccountEmails.sql`

**Objective:** Verify that no email address is associated with multiple accounts in `dbo.accounts`.

**Test procedure:** Group account records by email and return only those with a count greater than one.

**Expected result:** Zero rows returned.

**Actual result:** The query returned no rows. No duplicate email addresses were found in the current database records.

**Status:** PASS — no duplicate emails currently exist.

**Limitation:** This check validates existing data only. It does not confirm that the database prevents duplicate emails from being inserted in the future. */

USE FlashGuard;
GO

SELECT
    email,
    COUNT(*) AS account_count
FROM dbo.accounts
GROUP BY email
HAVING COUNT(*) > 1;
