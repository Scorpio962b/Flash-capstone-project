/*
P0 Test 6: Transaction Timestamps Are Chronological

Objective:
Verify that transaction timestamps follow the correct order.

Rules:
1. authorized_at must not be earlier than created_at.
2. settled_at must not be earlier than created_at.
3. settled_at must not be earlier than authorized_at
   when both timestamps exist.
*/

/*
REPORT: The query checks for completed transfer transactions and their timestamps.

# P0 Test 6: Transaction Timestamps Are Chronological

**Test File:** `TransactionTimestampsAreChronological.sql`

**Objective:**  
Verify that transaction timestamps follow the correct chronological order.

**Expected Result:**  
Authorization must not occur before creation. Settlement must not occur before creation or authorization.

**Actual Results:**
- Transaction 1: All timestamps are chronological. PASS.
- Transaction 2: Pending transaction has no authorization or settlement timestamps. PASS.
- Transaction 3: Rejected transaction has no authorization or settlement timestamps. PASS.
- Transaction 5: All timestamps satisfy the chronological rules. Authorization and settlement timestamps are equal. PASS.

**Overall Status:** PASS — all four returned transactions satisfy the implemented chronology checks.

**Evidence:**  
SQL output from `TransactionTimestampsAreChronological.sql`.

**Limitation:**  
This test checks timestamp ordering, not whether required timestamps are present for each status. That is assessed separately by `TransactionStatusProgression.sql`.
*/

USE FlashGuard;
GO

SELECT
    t.id AS transaction_id,
    t.status,
    t.created_at,
    t.authorized_at,
    t.settled_at,

    CASE
        WHEN t.authorized_at IS NOT NULL
             AND t.authorized_at < t.created_at
            THEN 'FAIL - Authorized before creation'

        WHEN t.settled_at IS NOT NULL
             AND t.settled_at < t.created_at
            THEN 'FAIL - Settled before creation'

        WHEN t.authorized_at IS NOT NULL
             AND t.settled_at IS NOT NULL
             AND t.settled_at < t.authorized_at
            THEN 'FAIL - Settled before authorization'

        ELSE 'PASS'
    END AS test_result

FROM dbo.transactions AS t
WHERE t.transaction_type = 'transfer'
ORDER BY t.id;
GO
