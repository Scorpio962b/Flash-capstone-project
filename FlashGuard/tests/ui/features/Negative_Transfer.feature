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

    Examples: Recipient validation
      | case                 | account      | beneficiary | amount | expectedMessage          | Balance     |
      | Zero amount transfer | Alice Ledger | Bob Wallet  | 0.00   | Invalid transfer payload | R 10 000,00 |

  @negative @validation
  Scenario Outline: Negative amount <amount> is rejected by the form
    When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
    And I enter transfer amount "<amount>" and submit
    Then I should see the negative amount validation message
    And my transfer balance should be "R 10 000,00"

    Examples: Negative amounts
    | account      | beneficiary  | amount  |
    | Alice Ledger | Bob Wallet   | -1.00   |
    | Alice Ledger | Bob Wallet   | -10.00  |
    | Alice Ledger | Bob Wallet   | -100.00 |

  @unknown
  Scenario Outline: <case>
    When I select account "<account>" for an unknown recipient
    And I search for recipient "<beneficiary>" in the Beneficiaries section
    And I enter transfer amount "<amount>" and submit
    # Then I should receive the transfer message "<expectedMessage>"
    # And my transfer balance should be "<Balance>"
    # And I should find no recorded transaction

    Examples: Unknown beneficiaries
      | case                   | account      | beneficiary | amount | expectedMessage          | Balance     |
      | Unknown account number | Alice Ledger | 0600000000  | 0.00   | Invalid transfer payload | R 10 000,00 |
      | Unsaved beneficiarie   | Alice Ledger | Alen        | 0.00   | Invalid transfer payload | R 10 000,00 |
      | Invalid account number | Alice Ledger | 6235487545  | 0.00   | Invalid transfer payload | R 10 000,00 |
      | invalid beneficiarie   | Alice Ledger | A.165       | 0.00   | Invalid transfer payload | R 10 000,00 |

#  empty classified as defect cause we should leave it empty it will remain selected
  @empty
  Scenario: The app does not allow the beneficiary to be cleared
    When I select account "Alice Ledger" and try to clear the beneficiary
    Then a beneficiary should remain selected
# This is also a defect cause it doesn't allow to block the account
  @blocked
  Scenario Outline: <case>
    When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
    And I enter transfer amount "<amount>" and submit
    Then I should receive the transfer message "<expectedMessage>"
    And my transfer balance should be "<Balance>"
    And I should find no recorded transaction

    Examples: Blocked recipients
      | case                                   | account      | beneficiary    | amount | expectedMessage              | Balance     |
      | TC-005 Transfer to a blocked recipient | Alice Ledger | Charlie Frozen | 10.00  | Nothing | R 10 000,00 |
  

  @negative @boundary
  Scenario Outline: <case>
    When I select account "<account>" and beneficiary "<beneficiary>" for negative transfer
    And I enter transfer amount "<amount>" and submit
    Then I should receive the transfer message "<expectedMessage>"
    And my transfer balance should be "<Balance>"
    And I should find no recorded transaction

    Examples: Boundary validation
      | case                 | account      | beneficiary | amount | expectedMessage          | Balance     |
      | Zero amount boundary | Alice Ledger | Bob Wallet  | 0.00   | Invalid transfer payload | R 10 000,00 |

      