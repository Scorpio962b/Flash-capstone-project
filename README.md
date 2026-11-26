# Flash-capstone-project

# API DEFECTS

### Error & Edge Case Endpoints

### Test Case: Invalid JWT / Expired Token

**Test Case ID:** API-ERR-001

**Defect Title:** GET /accounts allows access without authentication

**Severity:** High (provisional; confirm based on the data exposed)

**Priority:** P1 (provisional)

**Module:** API Security — Authentication and Authorization

**Precondition:** FlashGuard API is running at `http://localhost:4000`.

**Steps to Reproduce:**
1. Open Postman.
2. Create a GET request to `http://localhost:4000/accounts`.
3. Set Authorization to No Auth.
4. Send the request.

**Expected Result:** The API rejects unauthenticated access to protected account information, normally with HTTP 401 Unauthorized.

**Actual Result:** The API returns account information without requiring an authentication token. (Confirm the actual status code and response body when recording the defect.)

**Potential Impact:** Unauthorized users may access account information without signing in, depending on the data returned and the endpoint's intended access policy.

**Recommendation:** Enforce JWT authentication middleware on protected account endpoints and verify that the authenticated user is authorized to access the requested accounts.

---

### Test Case: API Login Rate Limiting

**Test Case ID:** API-ERR-002

**Test objective:** Verify that repeated login requests are limited to reduce the risk of brute-force attacks.

**Endpoint:** `POST http://localhost:4000/auth/login`

**Test execution:** Sent 50 login requests in quick succession using Postman.

**Actual result:** All 50 requests returned `200 OK` with authentication tokens.

**Expected result:** Once the configured request limit is exceeded, the API should return `429 Too Many Requests`.

**Status:** Failed — rate limiting was not triggered during the test.

**Potential severity:** High security risk, subject to the project's security requirements.

**Evidence:** The API source does not show rate-limiting middleware in the application setup or login route.

**Recommendation:** Implement an appropriate login rate limit and retest the endpoint.

---

# MOBILE TESTING

### P0 Test 8 — Verify Failed Transactions Do Not Affect Balances

**Test data:** Transaction ID 3, Alice (account 1) to Charlie (account 3), amount R15,000.00.

**Precondition:** The transfer exceeds the R10,000 AML threshold.

**Expected result:**
- Transaction status is `rejected`.
- Compliance flag is `aml`.
- No debit or credit ledger entries are created.
- Account balances are not updated by the rejected transfer.
- A compliance-block event is recorded in the audit log.

**Actual result:**
- Transaction status: `rejected`.
- Compliance flag: `aml`.
- Ledger entry count: 0.
- Total debits: R0.00.
- Total credits: R0.00.
- Audit event: `compliance_blocked`, audit ID 15.
- Source-code review confirms that the AML rejection path does not post balance updates or ledger entries.

**Result: PASS — AML rejection scenario.**

**Evidence limitation:** Historical before-and-after balance snapshots were not available to independently prove the absence of every possible balance change. The conclusion is supported by the current database state and the reviewed application code.

---

# REPORT

The query compares each account's current balance with its net ledger balance.

| Field | Meaning |
| :--- | :--- |
| current_balance | Balance stored in dbo.accounts |
| net_ledger_balance | Total credits minus total debits |
| balance_difference | Current balance minus net ledger balance |

Expected result: The difference should be zero if the ledger includes the opening balance and all subsequent movements.

Your current result: The check is PENDING INVESTIGATION, not a confirmed pass or fail. The opening balances were seeded directly into the accounts table without matching opening ledger entries, so the two values are not yet directly comparable.

For example, Alice's balance was initially R10,000, but the opening amount wasn't represented in the ledger. After the successful R10 transfer to Bob, Alice's balance became R9,990 and Bob's became R2,510.