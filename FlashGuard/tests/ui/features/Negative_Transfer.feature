Feature: Recipient validation - negative scenarios
  As a Flash Wallet customer
  I want clear feedback when I transfer money to an invalid or blocked recipient
  So that I know whether my transfer was successful and what needs to be fixed

  Background:
    Given I navigate to the transfer funds feature
    
    
  Scenario Outline: <case>
   When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
     And I enter "<amount>" in the Amount field and submit the transfer
    Then I see the message "<expectedMessage>"
    And my balance is "<Balance>"
    And no transaction should be recorded

@functional @otp
Scenario Outline: <case>
  Given I am on the transfer page
  When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
  And I enter "<amount>" in the Amount field and submit the transfer
  Then I see the confirmation screen showing "<beneficiary>" and "<amount>"
  When I enter the OTP "<otp>" to confirm the transfer
  Then I see the message "<expectedMessage>"
  And my balance is "<Balance>"

  Examples: OTP confirmation
    | case                       | account      | beneficiary | amount | otp                         | expectedMessage                  | Balance                 |
    | Confirm transfer using OTP | Alice Ledger | Bob Wallet  | 100.00 | REPLACE_WITH_VALID_TEST_OTP | REPLACE_WITH_SUCCESS_MESSAGE     | REPLACE_WITH_UPDATED_BALANCE |

    @empty
Scenario Outline: <case>
  Given I am on the transfer page
  When I select "<account>" from Accounts tab
  And I select no beneficiary
  And I enter "<amount>" in the Amount field and submit the transfer
  Then I see the message "<expectedMessage>"
  And my balance is "<Balance>"
  And no transaction should be recorded

  Examples: Empty beneficiary
    | case                         | account      | amount  | expectedMessage               | Balance        |
    | Transfer without beneficiary | Alice Ledger | 10.00   | Recipient account is required | R 10 000,00   |
    | Transfer without beneficiary | Alice Ledger | 50.00   | Recipient account is required | R 10 000,00   |
    | Transfer without beneficiary | Alice Ledger | 8000.00 | Recipient account is required | R 10 000,00   |

    @unknown
Scenario Outline: <case>
  Given I am on the transfer page
  When I select "<account>" from Accounts tab
  And I search for "<beneficiary>" in the Beneficiaries section
  And no matching beneficiary is displayed
  And I enter "<amount>" in the Amount field and submit the transfer
  Then I see the message "<expectedMessage>"
  And no transaction should be recorded

  Examples: Unknown beneficiaries
    | case                              | account      | beneficiary | amount | expectedMessage             | Balance      |
    | Unknown mobile number             | Alice Ledger | 0600000000  | 0.00   | Recipient account not found | R10 000,00   |
    | Unregistered mobile number        | Alice Ledger | 0999999999  | 0.00   | Recipient account not found | R10 000,00   |
    | Invalid short mobile number       | Alice Ledger | 12345       | 0.00   | Recipient account not found | R10 000,00   |
    | Alphabetic beneficiary number     | Alice Ledger | abcdefghij  | 0.00   | Recipient account not found | R10 000,00   |


@blocked
Scenario Outline: <case>
  Given I navigate to the transfer funds feature
  When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
  And I enter "<amount>" in the Amount field and submit the transfer
  Then I see the message "<expectedMessage>"
  And my balance is "<Balance>"
  And no transaction should be recorded

Examples: Blocked
  | case                                    | account      | beneficiary | amount | expectedMessage              | Balance    |
  | TC-005 Transfer to a blocked recipient  | Alice Ledger | 0711111111  | 10.00  | Recipient account is blocked | R10 000,00 |
  | TC-006 Transfer of the minimum amount   | Alice Ledger | 0722222222  | 0.01   | Recipient account is blocked | R10 000,00 |
  | TC-007 Transfer of a large amount       | Alice Ledger | 0733333333  | 100.00 | Recipient account is blocked | R10 000,00 |
