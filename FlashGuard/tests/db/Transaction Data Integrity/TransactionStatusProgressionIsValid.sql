/*
P0 Test 5: Transaction Status Progression

Objective:
Check that completed transfers have the expected status
and that their authorization and settlement timestamps
are populated in the correct order.
*/

/*
REPORT: The query checks for completed transfer transactions and their status progression.

# Rejected Transaction Status Check

**Test File:** `RejectedTransactionStatusCheck.sql`

**Objective:**  
Verify that an AML-rejected transaction does not proceed to authorization or settlement.

**Test Data:** Transaction 3 — R15,000.00, compliance flag `aml`.

**Expected Result:** The transaction remains rejected, with `authorized_at` and `settled_at` set to NULL.

**Actual Result:** The transaction status is `rejected`, the compliance flag is `aml`, and both timestamps are NULL.

**Result:** PASS.

**Evidence:** SQL query output from `RejectedTransactionStatusCheck.sql`.

**Limitation:** This confirms the stored state of the rejected transaction, not the full historical status transition.
*/

USE FlashGuard;
GO

SELECT
    t.id AS transaction_id,
    t.status,
    t.amount,
    t.compliance_flag,
    t.created_at,
    t.authorized_at,
    t.settled_at,

    CASE
        WHEN t.status = 'pending'
             AND t.authorized_at IS NULL
             AND t.settled_at IS NULL
            THEN 'PASS - Pending'

        WHEN t.status = 'completed'
             AND t.authorized_at IS NOT NULL
             AND t.settled_at IS NOT NULL
             AND t.authorized_at >= t.created_at
             AND t.settled_at >= t.authorized_at
            THEN 'PASS - Completed'

        WHEN t.status = 'settled'
             AND t.authorized_at IS NOT NULL
             AND t.settled_at IS NOT NULL
             AND t.authorized_at >= t.created_at
             AND t.settled_at >= t.authorized_at
            THEN 'PASS - Settled'

        WHEN t.status = 'rejected'
             AND t.authorized_at IS NULL
             AND t.settled_at IS NULL
            THEN 'PASS - Rejected'

        WHEN t.status IN ('pending', 'completed', 'settled', 'rejected')
            THEN 'FAIL - Status or timestamps inconsistent'

        ELSE 'REVIEW - Other status'
    END AS test_result

FROM dbo.transactions AS t
WHERE t.transaction_type = 'transfer'
ORDER BY t.id;
GO