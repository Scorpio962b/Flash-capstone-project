# Requirements Traceability Matrix

Generated: 2026-11-26T09:58:25.096Z

| Requirement | Test ID | Test title | Layer | Priority | Status | Evidence | Defect ID |
|---|---|---|---|---|---|---|---|
| FR-001 | TC-API-17 | loginInvalidAuth | api | P0 | Not run | tests/api/authentication/TC-API-17.loginInvalidAuth.json | |
| FR-001 | TC-API-18 | loginValidAuth | api | P0 | Not run | tests/api/authentication/TC-API-18.loginValidAuth.json | |
| FR-001 | TC-API-19 | logout | api | P0 | Not run | tests/api/authentication/TC-API-19.logout.json | |
| FR-001 | TC-API-21 | registerExistingEmail | api | P0 | Not run | tests/api/authentication/TC-API-21.registerExistingEmail.json | |
| FR-001 | TC-API-22 | registerNewUser | api | P0 | Not run | tests/api/authentication/TC-API-22.registerNewUser.json | |
| FR-001 | TC-API-23 | registrationValidation | api | P0 | Not run | tests/api/authentication/TC-API-23.registrationValidation.json | |
| FR-001 | TC-API-25 | InvalidJwtOrExpiredToken | api | P1 | Not run | tests/api/errorAndSecurity/TC-API-25.InvalidJwtOrExpiredToken.json | |
| FR-001 | TC-E2E-001 | scenario1 | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-001.scenario1.spec.ts | |
| FR-001 | TC-MOB-011 | Flash-Guard Merchant Authentication | mobile | P0 | Not run | tests/mobile/features/Authentication/TC_MOB_011_authentication.feature | |
| FR-001 | TC-MOB-012 | Flash-Guard Camera Face-Check Authentication | mobile | P0 | Not run | tests/mobile/features/Authentication/TC_MOB_012_camera-face-check-cancel.feature | |
| FR-001 | TC-UI-003 | Login | ui | P0 | Not run | tests/ui/features/TC-UI-003-login.feature | |
| FR-002 | TC-API-01 | getAllAccounts | api | P0 | Not run | tests/api/AccountDetails/TC-API-01_getAllAccounts.json | |
| FR-002 | TC-API-02 | getUnregisteredUser | api | P0 | Not run | tests/api/AccountDetails/TC-API-02_getUnregisteredUser.json | |
| FR-002 | TC-API-03 | getOneAccount | api | P0 | Not run | tests/api/AccountDetails/TC-API-03_getOneAccount.json | |
| FR-002 | TC-API-04 | getBalance | api | P0 | Not run | tests/api/AccountDetails/TC-API-04_getBalance.json | |
| FR-002 | TC-API-13 | update_account-profile | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-13.update_account-profile.json | |
| FR-002 | TC-API-14 | successful_account_retrieval | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-14.successful_account_retrieval.json | |
| FR-002 | TC-API-15 | retrieval_of_real-time_balance | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-15.retrieval_of_real-time_balance.json | |
| FR-002 | TC-API-16 | retrieval_of_all_accounts | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-16.retrieval_of_all_accounts.json | |
| FR-002 | TC-DB-10 | AccountBalanceMatchesLedger | db | P0 | Failed | results/db/ | |
| FR-002 | TC-E2E-001 | scenario1 | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-001.scenario1.spec.ts | |
| FR-002 | TC-MOB-001 | Mobile Dashboard | mobile | P0 | Not run | tests/mobile/features/Dashboard/TC_MOB_001_dashboardLoads.feature | |
| FR-002 | TC-MOB-004 | Balance and history | mobile | P0 | Not run | tests/mobile/features/Balance_&_History/TC_MOB_004_Balance.feature | |
| FR-002 | TC-MOB-005 | Balance and history | mobile | P0 | Not run | tests/mobile/features/Balance_&_History/TC_MOB_005_history.feature | |
| FR-002 | TC-UI-001 | Account Management | ui | P1 | Not run | tests/ui/features/TC-UI-001.account_management.feature | |
| FR-002 | TC-UI-004 | User dashboard and account information | ui | P0 | Not run | tests/ui/features/TC-UI-004.dashboard.feature | |
| FR-003 | TC-01 | block_list_enforced | db | P0 | Passed | results/db/ | |
| FR-003 | TC-02 | sender_not_recipient | db | P0 | Passed | results/db/ | |
| FR-003 | TC-03 | no_double_spending_A | db | P1 | Not run | tests/db/concurrency-locking/TC-03_no_double_spending_A.sql | |
| FR-003 | TC-API-09 | valid_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-09.valid_transfer.json | |
| FR-003 | TC-API-10 | invalid_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-10.invalid_transfer.json | |
| FR-003 | TC-API-11 | boundary_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-11.boundary_transfer.json | |
| FR-003 | TC-API-12 | authorize_pending_transactions | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-12.authorize_pending_transactions.json | |
| FR-003 | TC-API-27 | add-recipient | api | P0 | Not run | tests/api/recipients/TC-API-27.add-recipient.json | |
| FR-003 | TC-API-28 | list-recipients | api | P0 | Not run | tests/api/recipients/TC-API-28.list-recipients.json | |
| FR-003 | TC-API-29 | update-recipient | api | P0 | Not run | tests/api/recipients/TC-API-29.update-recipient.json | |
| FR-003 | TC-API-30 | Valid.Blocked | api | P0 | Not run | tests/api/recipients/TC-API-30.Valid.Blocked.json | |
| FR-003 | TC-API-31 | Auth.Transac | api | P0 | Not run | tests/api/Transaction/TC-API-31.Auth.Transac.json | |
| FR-003 | TC-API-32 | Boundary.Transfer | api | P0 | Not run | tests/api/Transaction/TC-API-32.Boundary.Transfer.json | |
| FR-003 | TC-API-33 | cancel-transfer | api | P0 | Not run | tests/api/Transaction/TC-API-33.cancel-transfer.json | |
| FR-003 | TC-API-34 | get-transaction | api | P0 | Not run | tests/api/Transaction/TC-API-34.get-transaction.json | |
| FR-003 | TC-API-35 | Missing.Amount | api | P1 | Not run | tests/api/Transaction/TC-API-35.Missing.Amount.json | |
| FR-003 | TC-API-36 | Pending.Transfer | api | P0 | Not run | tests/api/Transaction/TC-API-36.Pending.Transfer.json | |
| FR-003 | TC-API-37 | transaction-history | api | P0 | Not run | tests/api/Transaction/TC-API-37.transaction-history.json | |
| FR-003 | TC-API-38 | Valid.Tranfer | api | P0 | Not run | tests/api/Transaction/TC-API-38.Valid.Tranfer.json | |
| FR-003 | TC-DB-05 | amount_matches_ledger | db | P0 | Failed | results/db/ | |
| FR-003 | TC-DB-06 | failed_txn_no_balance_effect | db | P0 | Passed | results/db/ | |
| FR-003 | TC-DB-07 | recipient_credited_two_sided | db | P0 | Passed | results/db/ | |
| FR-003 | TC-DB-09 | status_progression | db | P0 | Failed | results/db/ | |
| FR-003 | TC-DB-13 | FailedTransactionsDoNotChangeBalances | db | P0 | Failed | results/db/ | |
| FR-003 | TC-DB-14 | RecipientReceivesTheCorrespondingCredit | db | P0 | Failed | results/db/ | |
| FR-003 | TC-DB-15 | TransactionAmountAgreesWithLedgerEntries | db | P0 | Failed | results/db/ | |
| FR-003 | TC-DB-16 | TransactionStatusProgressionIsValid | db | P0 | Failed | results/db/ | |
| FR-003 | TC-E2E-001 | scenario1 | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-001.scenario1.spec.ts | |
| FR-003 | TC-E2E-002 | column | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-002.column.spec.ts | |
| FR-003 | TC-E2E-003 | Scenario | e2e | P1 | Not run | tests/e2e/Concurrent  Transfers E2E 3/TC-E2E-003.Scenario.spec.ts | |
| FR-003 | TC-MOB-010 | Flash-Guard Mobile Fund Transfers | mobile | P0 | Not run | tests/mobile/features/FundTransfers/TC_MOB_010_fund-transfers.feature | |
| FR-003 | TC-UI-002 | Initiate money transfer requests | ui | P0 | Not run | tests/ui/features/TC-UI-002.initiate_transfer.feature | |
| FR-003 | TC-UI-006 | Transfer funds | ui | P0 | Not run | tests/ui/features/TC-UI-006.Negative_Transfer.feature | |
| FR-004 | TC-API-01 | getAllAccounts | api | P0 | Not run | tests/api/AccountDetails/TC-API-01_getAllAccounts.json | |
| FR-004 | TC-API-02 | getUnregisteredUser | api | P0 | Not run | tests/api/AccountDetails/TC-API-02_getUnregisteredUser.json | |
| FR-004 | TC-API-03 | getOneAccount | api | P0 | Not run | tests/api/AccountDetails/TC-API-03_getOneAccount.json | |
| FR-004 | TC-API-04 | getBalance | api | P0 | Not run | tests/api/AccountDetails/TC-API-04_getBalance.json | |
| FR-004 | TC-API-05 | comlianceValidation | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-05_comlianceValidation.json | |
| FR-004 | TC-API-06 | ComplianceCheck | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-06_ComplianceCheck.json | |
| FR-004 | TC-API-07 | getAuditLogs | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-07_getAuditLogs.json | |
| FR-004 | TC-API-08 | getAlerts | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-08_getAlerts.json | |
| FR-004 | TC-API-09 | valid_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-09.valid_transfer.json | |
| FR-004 | TC-API-10 | invalid_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-10.invalid_transfer.json | |
| FR-004 | TC-API-11 | boundary_transfer | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-11.boundary_transfer.json | |
| FR-004 | TC-API-12 | authorize_pending_transactions | api | P0 | Not run | tests/api/Initiate&Authorize Transfers/TC-API-12.authorize_pending_transactions.json | |
| FR-004 | TC-API-13 | update_account-profile | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-13.update_account-profile.json | |
| FR-004 | TC-API-14 | successful_account_retrieval | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-14.successful_account_retrieval.json | |
| FR-004 | TC-API-15 | retrieval_of_real-time_balance | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-15.retrieval_of_real-time_balance.json | |
| FR-004 | TC-API-16 | retrieval_of_all_accounts | api | P0 | Not run | tests/api/AccountUpdate&Statement/TC-API-16.retrieval_of_all_accounts.json | |
| FR-004 | TC-API-17 | loginInvalidAuth | api | P0 | Not run | tests/api/authentication/TC-API-17.loginInvalidAuth.json | |
| FR-004 | TC-API-18 | loginValidAuth | api | P0 | Not run | tests/api/authentication/TC-API-18.loginValidAuth.json | |
| FR-004 | TC-API-19 | logout | api | P0 | Not run | tests/api/authentication/TC-API-19.logout.json | |
| FR-004 | TC-API-20 | missingParameters | api | P1 | Not run | tests/api/authentication/TC-API-20.missingParameters.json | |
| FR-004 | TC-API-21 | registerExistingEmail | api | P0 | Not run | tests/api/authentication/TC-API-21.registerExistingEmail.json | |
| FR-004 | TC-API-22 | registerNewUser | api | P0 | Not run | tests/api/authentication/TC-API-22.registerNewUser.json | |
| FR-004 | TC-API-23 | registrationValidation | api | P0 | Not run | tests/api/authentication/TC-API-23.registrationValidation.json | |
| FR-004 | TC-API-24 | ErrorHandling | api | P1 | Not run | tests/api/errorAndSecurity/TC-API-24.ErrorHandling.json | |
| FR-004 | TC-API-25 | InvalidJwtOrExpiredToken | api | P1 | Not run | tests/api/errorAndSecurity/TC-API-25.InvalidJwtOrExpiredToken.json | |
| FR-004 | TC-API-26 | RateLimiting(429)TooManyRequests | api | P1 | Not run | tests/api/errorAndSecurity/TC-API-26.RateLimiting(429)TooManyRequests.json | |
| FR-004 | TC-API-27 | add-recipient | api | P0 | Not run | tests/api/recipients/TC-API-27.add-recipient.json | |
| FR-004 | TC-API-28 | list-recipients | api | P0 | Not run | tests/api/recipients/TC-API-28.list-recipients.json | |
| FR-004 | TC-API-29 | update-recipient | api | P0 | Not run | tests/api/recipients/TC-API-29.update-recipient.json | |
| FR-004 | TC-API-30 | Valid.Blocked | api | P0 | Not run | tests/api/recipients/TC-API-30.Valid.Blocked.json | |
| FR-004 | TC-API-31 | Auth.Transac | api | P0 | Not run | tests/api/Transaction/TC-API-31.Auth.Transac.json | |
| FR-004 | TC-API-32 | Boundary.Transfer | api | P0 | Not run | tests/api/Transaction/TC-API-32.Boundary.Transfer.json | |
| FR-004 | TC-API-33 | cancel-transfer | api | P0 | Not run | tests/api/Transaction/TC-API-33.cancel-transfer.json | |
| FR-004 | TC-API-34 | get-transaction | api | P0 | Not run | tests/api/Transaction/TC-API-34.get-transaction.json | |
| FR-004 | TC-API-35 | Missing.Amount | api | P1 | Not run | tests/api/Transaction/TC-API-35.Missing.Amount.json | |
| FR-004 | TC-API-36 | Pending.Transfer | api | P0 | Not run | tests/api/Transaction/TC-API-36.Pending.Transfer.json | |
| FR-004 | TC-API-37 | transaction-history | api | P0 | Not run | tests/api/Transaction/TC-API-37.transaction-history.json | |
| FR-004 | TC-API-38 | Valid.Tranfer | api | P0 | Not run | tests/api/Transaction/TC-API-38.Valid.Tranfer.json | |
| FR-005 | TC-03 | no_double_spending_A | db | P1 | Not run | tests/db/concurrency-locking/TC-03_no_double_spending_A.sql | |
| FR-005 | TC-04 | no_dirty_reads_A | db | P1 | Not run | tests/db/concurrency-locking/TC-04_no_dirty_reads_A.sql | |
| FR-005 | TC-API-07 | getAuditLogs | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-07_getAuditLogs.json | |
| FR-005 | TC-DB-05 | amount_matches_ledger | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-06 | failed_txn_no_balance_effect | db | P0 | Passed | results/db/ | |
| FR-005 | TC-DB-07 | recipient_credited_two_sided | db | P0 | Passed | results/db/ | |
| FR-005 | TC-DB-08 | chronological_timestamps | db | P0 | Passed | results/db/ | |
| FR-005 | TC-DB-09 | status_progression | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-10 | AccountBalanceMatchesLedger | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-11 | NoDuplicateAccountEmails | db | P0 | Passed | results/db/ | |
| FR-005 | TC-DB-12 | SoftDeletePreservesAccountAsInactive | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-13 | FailedTransactionsDoNotChangeBalances | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-14 | RecipientReceivesTheCorrespondingCredit | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-15 | TransactionAmountAgreesWithLedgerEntries | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-16 | TransactionStatusProgressionIsValid | db | P0 | Failed | results/db/ | |
| FR-005 | TC-DB-17 | TransactionTimestampsAreChronological | db | P0 | Failed | results/db/ | |
| FR-005 | TC-E2E-001 | scenario1 | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-001.scenario1.spec.ts | |
| FR-005 | TC-E2E-002 | column | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-002.column.spec.ts | |
| FR-005 | TC-E2E-003 | Scenario | e2e | P1 | Not run | tests/e2e/Concurrent  Transfers E2E 3/TC-E2E-003.Scenario.spec.ts | |
| FR-006 | TC-01 | block_list_enforced | db | P0 | Passed | results/db/ | |
| FR-006 | TC-API-05 | comlianceValidation | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-05_comlianceValidation.json | |
| FR-006 | TC-API-06 | ComplianceCheck | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-06_ComplianceCheck.json | |
| FR-006 | TC-API-07 | getAuditLogs | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-07_getAuditLogs.json | |
| FR-006 | TC-API-08 | getAlerts | api | P0 | Not run | tests/api/ComplianceAndAudit/TC-API-08_getAlerts.json | |
| FR-006 | TC-API-30 | Valid.Blocked | api | P0 | Not run | tests/api/recipients/TC-API-30.Valid.Blocked.json | |
| FR-006 | TC-E2E-002 | column | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-002.column.spec.ts | |
| FR-006 | TC-UI-005 | Notifications and Alerts | ui | P1 | Not run | tests/ui/features/TC-UI-005.notifications.feature | |
| FR-007 | TC-E2E-001 | scenario1 | e2e | P0 | Not run | tests/e2e/step_definition/TC-E2E-001.scenario1.spec.ts | |
| FR-007 | TC-MOB-001 | Mobile Dashboard | mobile | P0 | Not run | tests/mobile/features/Dashboard/TC_MOB_001_dashboardLoads.feature | |
| FR-007 | TC-MOB-002 | Flash-Guard Mobile Notifications and Permissions | mobile | P1 | Not run | tests/mobile/features/Notifications/TC_MOB_002_notifications.feature | |
| FR-007 | TC-MOB-003 | Flash-Guard Mobile Gestures | mobile | P1 | Not run | tests/mobile/features/Gestures/TC_MOB_003_gestures.feature | |
| FR-007 | TC-MOB-004 | Balance and history | mobile | P0 | Not run | tests/mobile/features/Balance_&_History/TC_MOB_004_Balance.feature | |
| FR-007 | TC-MOB-005 | Balance and history | mobile | P0 | Not run | tests/mobile/features/Balance_&_History/TC_MOB_005_history.feature | |
| FR-007 | TC-MOB-006 | Flash-Guard Merchant Mobile Settings | mobile | P1 | Not run | tests/mobile/features/Mobile.Settings/TC_MOB_006_Change.password.feature | |
| FR-007 | TC-MOB-007 | Flash-Guard Merchant Mobile Settings | mobile | P1 | Not run | tests/mobile/features/Mobile.Settings/TC_MOB_007_Update.Profile.feature | |
| FR-007 | TC-MOB-008 | Mobile Settings and Responsiveness | mobile | P1 | Not run | tests/mobile/features/Responsiveness.Gestrures/TC_MOB_008_Rotation.feature | |
| FR-007 | TC-MOB-009 | Mobile Settings and Responsiveness | mobile | P1 | Not run | tests/mobile/features/Responsiveness.Gestrures/TC_MOB_009_Sizes.feature | |
| FR-007 | TC-MOB-010 | Flash-Guard Mobile Fund Transfers | mobile | P0 | Not run | tests/mobile/features/FundTransfers/TC_MOB_010_fund-transfers.feature | |
| FR-007 | TC-MOB-011 | Flash-Guard Merchant Authentication | mobile | P0 | Not run | tests/mobile/features/Authentication/TC_MOB_011_authentication.feature | |
| FR-007 | TC-MOB-012 | Flash-Guard Camera Face-Check Authentication | mobile | P0 | Not run | tests/mobile/features/Authentication/TC_MOB_012_camera-face-check-cancel.feature | |
| FR-008 | - | **NOT COVERED** | | | | | |
| FR-009 | - | **NOT COVERED** | | | | | |
| FR-010 | - | **NOT COVERED** | | | | | |
