
Feature: Flash-Guard Mobile Fund Transfers

  As a registered Flash-Guard merchant
  I want to transfer funds to another beneficiary
  So that I can make payments using my account

  @mobile @fund-transfer @smoke @positive
  Scenario: Successfully select a transfer recipient
    Given the merchant is on the fund transfer screen
    When the merchant selects the beneficiary "Bob Wallet"
    Then the selected beneficiary should be displayed

  @mobile @fund-transfer @positive
  Scenario: Enter a valid decimal transfer amount
    Given the merchant is on the fund transfer screen
    When the merchant enters the transfer amount "125.50"
    Then the transfer amount should be "125.50"

  # Known implementation gap:
  # The supplied mobile implementation does not currently show an OTP flow.
  @known-gap @manual @fund-transfer
  Scenario: Merchant confirms a transfer using an OTP
    Given the merchant has submitted a transfer for review
    When the merchant enters the confirmation OTP
    Then the transfer should be authorized

  @mobile @fund-transfer @smoke @positive
  Scenario: Successfully submit a fund transfer
    Given the merchant is on the fund transfer screen
    When the merchant selects the beneficiary "Bob Wallet"
    And the merchant enters the transfer amount "100.00"
    And the merchant reviews and submits the transfer
    Then a transfer submitted confirmation should be displayed
    And the merchant should be redirected to transaction history

  # Known implementation gap:
  # No pending-transfer cancellation control is shown in TransferScreen.
  @known-gap @manual @fund-transfer
  Scenario: Merchant cancels a pending transfer
    Given the merchant has a pending transfer
    When the merchant chooses to cancel the transfer
    Then the transfer status should be cancelled
