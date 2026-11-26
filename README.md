# Flash-capstone-project

# API DEFECTS

### Error & Edge Case Endpoints

### Test Case: Invalid JWT/ Expired Token

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
