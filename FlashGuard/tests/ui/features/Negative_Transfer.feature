Feature: Transfer funds
  As a Flash Wallet customer
  I want to transfer money safely
  So that I know whether my transfer worked and what needs to be fixed

  Background:
    Given I navigate to the transfer funds feature

  # 1. Initiate transfer (valid recipient, amount validation) | P0 | Positive
  @positive @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the amount is shown in the currency "<currency>"
    And I am asked to enter my OTP

    Examples: Initiate transfer
      | case                                | account      | beneficiary | amount | currency |
      | Valid recipient and valid amount    | Alice Ledger | Bob Wallet  | 500.00 | ZAR      |
      | Valid recipient, small valid amount | Alice Ledger | Bob Wallet  | 10.00  | ZAR      |

  # 2a. Amount validation (min/max accepted, currency) | P0 | Boundary
  @boundary @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the currency "<currency>" is displayed
    And I am asked to enter my OTP

    Examples: Accepted limits
      | case                          | account      | beneficiary | amount   | currency |
      | Minimum amount accepted       | Alice Ledger | Bob Wallet  | 0.01     | ZAR      |
      | Maximum amount (full balance) | Alice Ledger | Bob Wallet  | 10000.00 | ZAR      |

  # 2b. Amount validation (max exceeded, decimal places, currency) | P0 | Boundary
  @boundary @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then the currency "<currency>" is displayed
    And I see the message "<expectedMessage>"
    And my balance is "<balance>"
    And no transaction should be recorded

    Examples: Rejected amounts
      | case                             | account      | beneficiary | amount   | currency | expectedMessage                  | balance     |
      | One cent above available balance | Alice Ledger | Bob Wallet  | 10000.01 | ZAR      | Insufficient funds               | R 10 000,00 |
      | Three decimal places not allowed | Alice Ledger | Bob Wallet  | 100.505  | ZAR      | Maximum 2 decimal places allowed | R 10 000,00 |

  # 3. Recipient validation (blocked, self-transfer, unknown) | P0 | Negative
  @negative @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then I see the message "<expectedMessage>"
    And my balance is "<balance>"
    And no transaction should be recorded

    @blocked
    Examples: Blocked
      | case                                   | account      | beneficiary | amount | expectedMessage              | balance     |
      | TC-005 Transfer to a blocked recipient | Alice Ledger | 0711111111  | 10.00  | Recipient account is blocked | R 10 000,00 |

    @self-transfer
    Examples: Self-transfer
      | case                                   | account      | beneficiary  | amount | expectedMessage                         | balance     |
      | TC-003 Self-transfer of a small amount | Alice Ledger | Alice Ledger | 10.00  | You cannot transfer to the same account | R 10 000,00 |

    @unknown
    Examples: Unknown
      | case                            | account      | beneficiary | amount | expectedMessage             | balance     |
      | TC-008 Unknown number           | Alice Ledger | 0600000000  | 0.00   | Recipient account not found | R 10 000,00 |
      | TC-010 Number that is too short | Alice Ledger | 12345       | 0.00   | Recipient account not found | R 10 000,00 |

    @empty
    Examples: Missing recipient
      | case                                   | account      | beneficiary | amount | expectedMessage               | balance     |
      | TC-012 Missing recipient, small amount | Alice Ledger |             | 10.00  | Recipient account is required | R 10 000,00 |

  # 4. Transfer confirmation + OTP entry | P0 | Functional
  @functional @otp @P0
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    And I confirm the transfer with a "<otp>"
    Then I see the message "<expectedMessage>"
    And my balance is "<balance>"

    Examples: OTP
      | case                              | account      | beneficiary | amount | otp       | expectedMessage     | balance    |
      | Valid transfer confirmed with OTP | Alice Ledger | Bob Wallet  | 500.00 | valid OTP | Transfer successful | R 9 500,00 |

  # 5a. Failed transfer (rejection, error handling) | P1 | Error path
  @error-path @P1
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    Then I see the message "<expectedMessage>"
    And my balance is "<balance>"
    And no transaction should be recorded

    Examples: Rejection
      | case                                    | account      | beneficiary    | amount | expectedMessage                         | balance     |
      | Transfer rejected to frozen beneficiary | Alice Ledger | Charlie Frozen | 100.00 | Transfers to this recipient are blocked | R 10 000,00 |

  # 5b. Failed transfer (timeout) | P1 | Error path
  @error-path @timeout @P1 @pending
  Scenario Outline: <case>
    When I select "<account>" from Accounts tab and select "<beneficiary>" from Beneficiaries
    And I enter "<amount>" in the Amount field and submit the transfer
    But the transfer request times out
    Then I see the message "<expectedMessage>"
    And my balance is "<balance>"
    And no transaction should be recorded

    Examples: Timeout
      | case                       | account      | beneficiary | amount | expectedMessage   | balance     |
      | Transfer request times out | Alice Ledger | Bob Wallet  | 100.00 | <timeout message> | R 10 000,00 |
