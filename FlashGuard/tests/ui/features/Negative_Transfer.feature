
Feature: Recipient validation - negative scenarios

  As a Flash Wallet customer
  I want clear feedback when I transfer money to an invalid or blocked recipient
  So that I know whether my transfer was successful and what needs to be fixed

  Background:
    Given I am logged in as Alice for negative transfer testing
    And I open the transfer funds page for negative testing

  @negative @validation
  Scenario Outline: <case>
    When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
    And I enter transfer amount "<amount>" and submit
    Then I should receive the transfer message "<expectedMessage>"
    And my transfer balance should be "<Balance>"
    # And Then I should see the negative amount validation message 

    Examples: Recipient validation
      | case                     | account      | beneficiary | amount | expectedMessage         | Balance     |
      | Zero amount transfer     | Alice Ledger | Bob Wallet  | 0.00   | Invalid transfer payload | R 10 000,00 |
      | Negative amount transfer | Alice Ledger | Bob Wallet  | -10.00 | Value must be greater than or equal to 0 | R 10 000,00 |

  @unknown
  Scenario Outline: <case>
    When I select account "<account>" for an unknown recipient
    And I search for recipient "<beneficiary>" in the Beneficiaries section
    And I enter transfer amount "<amount>" and submit
    # Then I should receive the transfer message "<expectedMessage>"
    # And my transfer balance should be "<Balance>"
    # And I should find no recorded transaction

    Examples: Unknown beneficiaries
      | case                          | account      | beneficiary | amount | expectedMessage             | Balance     |
      | Unknown account number       | Alice Ledger | 0600000000  | 0.00   | Invalid transfer payload| R 10 000,00 |
      | Unsaved beneficiarie   | Alice Ledger | Alen  | 0.00   | Invalid transfer payload| R 10 000,00 |
      | Invalid account number   | Alice Ledger | 6235487545     | 0.00   |Invalid transfer payload| R 10 000,00 |
      | invalid beneficiarie     | Alice Ledger | A.165  | 0.00   | Invalid transfer payload| R 10 000,00 |


  # @functional @otp
  # Scenario Outline: <case>
  #   When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should see transfer confirmation for "<beneficiary>" and amount "<amount>"
  #   When I confirm the transfer using OTP "<otp>"
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"

  #   Examples: OTP confirmation
  #     | case                       | account      | beneficiary | amount | otp                         | expectedMessage              | Balance                       |
  #     | Confirm transfer using OTP | Alice Ledger | Bob Wallet  | 100.00 | REPLACE_WITH_VALID_TEST_OTP | REPLACE_WITH_SUCCESS_MESSAGE | REPLACE_WITH_UPDATED_BALANCE |

  # @empty
  # Scenario Outline: <case>
  #   When I select account "<account>" and leave the beneficiary empty
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"
  #   And I should find no recorded transaction

  #   Examples: Empty beneficiary
  #     | case                         | account      | amount  | expectedMessage               | Balance     |
  #     | Transfer without beneficiary | Alice Ledger | 10.00   | Invalid transfer payload | R 10 000,00 |
  #     | Transfer without beneficiary | Alice Ledger | 50.00   | Invalid transfer payload | R 10 000,00 |
  #     | Transfer without beneficiary | Alice Ledger | 8000.00 | Invalid transfer payload | R 10 000,00 |


  # @blocked
  # Scenario Outline: <case>
  #   When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"
  #   And I should find no recorded transaction

  #   Examples: Blocked recipients
  #     | case                                   | account      | beneficiary | amount | expectedMessage              | Balance     |
  #     | TC-005 Transfer to a blocked recipient | Alice Ledger | 0711111111  | 10.00  | Recipient account is blocked | R 10 000,00 |
  #     | TC-006 Transfer of the minimum amount  | Alice Ledger | 0722222222  | 0.01   | Recipient account is blocked | R 10 000,00 |
  #     | TC-007 Transfer of a large amount      | Alice Ledger | 0733333333  | 100.00 | Recipient account is blocked | R 10 000,00 |

  # @negative @boundary
  # Scenario Outline: <case>
  #   When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"
  #   And I should find no recorded transaction

  #   Examples: Boundary validation
  #     | case                     | account      | beneficiary | amount | expectedMessage         | Balance     |
  #     | Zero amount boundary     | Alice Ledger | Bob Wallet  | 0.00   | Invalid transfer payload | R 10 000,00 |
  #     | Negative amount boundary | Alice Ledger | Bob Wallet  | -1.00  | Value must be greater than or equal to 0 | R 10 000,00 |

  # @negative @error-path
  # Scenario Outline: <case>
  #   When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"
  #   And I should find no recorded transaction

  #   Examples: Error handling
  #     | case                    | account      | beneficiary | amount | expectedMessage | Balance     |
  #     | Transfer server failure | Alice Ledger | Bob Wallet  | -100.00 | Value must be greater than or equal to 0 | R 10 000,00 |

  # @positive @otp
  # Scenario Outline: <case>
  #   When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
  #   And I enter transfer amount "<amount>" and submit
  #   Then I should see transfer confirmation for "<beneficiary>" and amount "<amount>"
  #   When I confirm the transfer using OTP "<otp>"
  #   Then I should receive the transfer message "<expectedMessage>"
  #   And my transfer balance should be "<Balance>"

  #   Examples: Successful OTP transfer
  #     | case                       | account      | beneficiary | amount | otp                         | expectedMessage              | Balance                       |
  #     | Confirm transfer using OTP | Alice Ledger | Bob Wallet  | 100.00 | REPLACE_WITH_VALID_TEST_OTP | REPLACE_WITH_SUCCESS_MESSAGE | REPLACE_WITH_UPDATED_BALANCE |
