
Feature: Flash-Guard Camera Face-Check Authentication

  @mobile @authentication @camera @positive
  Scenario: Merchant signs in using camera face-check
    Given the merchant is on the login screen
    When the merchant selects camera face-check
    And the merchant grants camera permission if requested
    Then the camera preview should become ready
    And the camera face-check should complete
    And the merchant should successfully access the dashboard
    And the dashboard should display the name "Alice Ledger"
    And the merchant dismisses the welcome message
