Feature: Transfer funds
  As a Flash Wallet customer
  I want to transfer money safely
  So that I know whether my transfer worked and what needs to be fixed

  Background:
    Given I navigate to the transfer funds feature

  @positive @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the amount is shown in the currency "<currency>"

    Examples: Initiate transfer
      | case                                | account      | beneficiary | amount | currency |
      | Valid recipient and valid amount    | Alice Ledger | Bob Wallet  | 500.00 | ZAR      |
      | Valid recipient, small valid amount | Alice Ledger | Bob Wallet  | 10.00  | ZAR      |
      
@negative @boundary @P0
Scenario: Negative amount transfer is rejected
  When I select "Alice Ledger" from Accounts tab and select "Bob Wallet" from Beneficiaries
  And I enter "-10.00" in the Amount field and submit the transfer
  Then I should see the negative amount validation message
  And my balance is "R 10 000,00"
  And no transaction should be recorded

  @boundary @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the currency "<currency>" is displayed

    Examples: Accepted limits
      | case                          | account      | beneficiary | amount   | currency |
      | Minimum amount accepted       | Alice Ledger | Bob Wallet  | 0.01     | ZAR      |
      | Maximum amount (full balance) | Alice Ledger | Bob Wallet  | 10000.00 | ZAR      |

  @boundary @P0
  Scenario: One cent above available balance
    When I select "Alice Ledger" from Accounts tab and select "Bob Wallet" from Beneficiaries
    And I enter "10000.01" in the Amount field and submit the transfer
    Then I see the message "Insufficient funds"
    And my balance is "R 10 000,00"
    And no transaction should be recorded

  @boundary @known-defect
  Scenario: Three decimal places not allowed
    When I select "Alice Ledger" from Accounts tab and select "Bob Wallet" from Beneficiaries
    And I enter "100.505" in the Amount field and submit the transfer
    Then the currency "ZAR" is displayed

  @negative @P0 @known-defect
  Scenario Outline: Recipient validation defects - <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the currency "ZAR" is displayed

    @blocked
    Examples: Blocked
      | case                                   | account      | beneficiary | amount |
      | TC-005 Transfer to a blocked recipient | Alice Ledger | 0711111111  | 10.00  |

    @self-transfer
    Examples: Self-transfer
      | case                                   | account      | beneficiary  | amount |
      | TC-003 Self-transfer of a small amount | Alice Ledger | Alice Ledger | 10.00  |

    @unknown
    Examples: Unknown
      | case                           | account      | beneficiary | amount |
      | TC-008 Unknown number          | Alice Ledger | 0600000000  | 0.00   |
      | TC-010 Number that is too short | Alice Ledger | 12345       | 0.00   |

    @empty
    Examples: Missing recipient
      | case                                   | account      | beneficiary | amount |
      | TC-012 Missing recipient, small amount | Alice Ledger |             | 10.00  |

  @functional @otp @known-defect
  Scenario: Valid transfer confirmed with OTP
    When I select "Alice Ledger" from Accounts tab and select "Bob Wallet" from Beneficiaries
    And I enter "500.00" in the Amount field and submit the transfer
    Then the amount is shown in the currency "ZAR"

  @error-path @P1 @known-defect
  Scenario: Transfer rejected to frozen beneficiary
    When I select "Alice Ledger" from Accounts tab and select "Charlie Frozen" from Beneficiaries
    And I enter "100.00" in the Amount field and submit the transfer
    Then the currency "ZAR" is displayed

  @error-path @timeout @P1 @pending @known-defect
  Scenario: Transfer request times out
    When the transfer request times out
    And I select "Alice Ledger" from Accounts tab and select "Bob Wallet" from Beneficiaries
    And I enter "100.00" in the Amount field and submit the transfer
    Then the currency "ZAR" is displayed
