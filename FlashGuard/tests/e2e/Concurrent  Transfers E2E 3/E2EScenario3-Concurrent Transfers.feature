
Feature: Concurrent Transfers
  As a FlashGuard banking user
  I want mobile and web transfers to process simultaneously
  So that transactions are processed accurately without balance inconsistencies

  @e2e @concurrency @P1
  Scenario: Mobile and Web transfers happen simultaneously
    Given the account balance is R100
    When mobile transfers R50 and web transfers R50 simultaneously
    Then both transfers should succeed
    And both transactions should be saved in the database
    And the final balance should be R0
    And no duplicate transactions should exist

  @e2e @mobile-transfer @P1
  Scenario: Alice transfers R50 to Bob Wallet from the mobile app
    Given Alice has at least R50 available
    When Alice transfers R50 to "Bob Wallet" and taps Review Transaction
    Then the mobile transfer should be submitted successfully
    And the transfer should be completed from Alice to "Bob Wallet"
    And Alice's balance should decrease by R50 and "Bob Wallet" should increase by R50

