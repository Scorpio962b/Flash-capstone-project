Feature: Recipient validation - negative scenarios
  As a Flash Wallet customer
  I want clear feedback when I transfer money to an invalid or blocked recipient
  So that I know whether my transfer was successful and what needs to be fixed

  Background:
    Given I navigate to the transfer funds feature
    
    
  Scenario Outline: <case>
    When I select {string} from Accounts tab and select {string } from  Beneficiaries 
    And I enter {string} in the Amount field and submit the transfer
    Then I see the message "<expectedMessage>"
    And my balance is "<Balance>"
    And no transaction should be recorded


    @blocked
    Examples: Blocked 
      | case                                   | Account      | Beneficiary | Amount | expectedMessage              | Balance    |
      | TC-005 Transfer to a blocked recipient | Alice Ledger | 0711111111  | 10.00  | Recipient account is blocked | R10 000,00 |
      | TC-006 Transfer of the minimum amount  | Alice Ledger | 0722222222  | 0.01   | Recipient account is blocked | R10 000,00 |
      | TC-007 Transfer of a large amount      | Alice Ledger | 0733333333  | 100.00 | Recipient account is blocked | R10 000,00 |

    @self-transfer
    Examples: Self-transfer
      | case                                   | Account      | Beneficiary  | Amount | expectedMessage                         | Balance    |
      | TC-003 Self-transfer of a small amount | Alice Ledger | Alice Ledger | 10.00  | You cannot transfer to the same account | R10 000,00 |
      | TC-004 Self-transfer of a larger amount| Alice Ledger | Alice Ledger | 100.00 | You cannot transfer to the same account | R10 000,00 |

    @unknown
    Examples: Unknown
      | case                                       | Account      | Beneficiary | Amount | expectedMessage             | Balance    |
      | TC-008 Unknown number                      | Alice Ledger | 0600000000  | 0.00   | Recipient account not found | R10 000,00 |
      | TC-009 Another unknown number              | Alice Ledger | 0999999999  | 0.00   | Recipient account not found | R10 000,00 |
      | TC-010 Recipient number that is too short  | Alice Ledger | 12345       | 0.00   | Recipient account not found | R10 000,00 |
      | TC-011 Recipient with letters only         | Alice Ledger | abcdefghij  | 0.00   | Recipient account not found | R10 000,00 |

    @empty
    Examples: Empty
      | case                                    | Account      | Beneficiary | Amount | expectedMessage               | Balance    |
      | TC-012 Missing recipient, small amount  | Alice Ledger |             | 10.00  | Recipient account is required | R10 000,00 |
      | TC-013 Missing recipient, mid amount    | Alice Ledger |             | 50.00  | Recipient account is required | R10 000,00 |
      | TC-014 Missing recipient, larger amount | Alice Ledger |             | 8000.00 | Recipient account is required | R10 000,00 |