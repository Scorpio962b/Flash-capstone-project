# Coverage Analysis (Baseline Provisioned System)

| Layer | Provided System Capability | Student Automation Target |
|---|---|---|
| Web | Login, account list, transfer form, history | 28 Playwright tests |
| API | Auth, accounts, transactions, recipients, audit, compliance, alerts | 31 Newman tests |
| DB | Accounts, recipients, transactions, ledger, audit tables with seed data | 17 SQL checks |
| Mobile | Android-facing wallet UI + API integration points | 25 mobile automation tests |
| E2E | Transfer create + authorize + DB integrity path | 3 integrated scenarios |

## Notes
- This repository now provides the **application under test**, not only test scaffolding.
- Students still implement and own their automation suites and evidence.
