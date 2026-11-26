
Feature: Flash-Guard Merchant Authentication

  As a registered Flash-Guard merchant
  I want to authenticate using my credentials
  So that I can securely access my financial dashboard

  @mobile @authentication @negative
  Scenario: Login is rejected with an incorrect password
  Given the merchant is on the login screen
  When the merchant enters the email "alice@flashguard.local"
  And the merchant enters the password "wrong-password"
  And the merchant submits the login form
  Then an authentication error should be displayed
  And the merchant should be denied access

  @mobile @authentication @smoke @positive
  Scenario: Successfully log in with valid credentials
    Given the merchant is on the login screen
    When the merchant enters the email "alice@flashguard.local"
    And the merchant enters the password "offline-demo"
    And the merchant submits the login form
    Then the merchant should successfully access the dashboard
    And the dashboard should display the name "Alice Ledger"
    And the merchant dismisses the welcome message
