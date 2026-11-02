/*
P0 Test 3: Soft Delete Preserves Account as Inactive

Objective:
Verify that inactive accounts remain in dbo.accounts
after deactivation.

Expected result:
Inactive accounts remain in the database with is_active = 0.

Pass criteria:
The account record still exists and is marked inactive.
*/

/*
Report:The query checks for accounts where is_active = 0.

### P0 Test 3: Soft Delete Preserves Account as Inactive

**Test file:** `SoftDeletePreservesAccountAsInactive.sql`

**Objective:** Verify that an inactive account remains in the database rather than being physically deleted.

**Test procedure:** Queried `dbo.accounts` for records where `is_active = 0`.

**Expected result:** The inactive account record remains in the database with `is_active = 0`.

**Actual result:** Account ID 3 (`charlie@flashguard.local`) was found with `is_active = 0` and a balance of R450.00.

**Status:** PARTIAL PASS.

**Limitation:** This confirms that an inactive account exists, but does not prove that the deactivation operation itself preserves the record or that inactive accounts are prevented from accessing the application.
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
