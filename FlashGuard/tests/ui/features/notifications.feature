@NotificationsFeature
Feature: Notifications and Alerts
  As a signed-in FlashGuard user
  I want to receive notifications and alerts
  So that I can stay informed about my transactions and account activity

 Background:
 Given I am signed in with a valid account

  @FunctionalNotificationBell
  Scenario: Open the notifications panel
    And I am on the account dashboard
    When I click the notifications bell icon
    Then the notifications panel should be displayed
    And I should be able to view my notifications

  @FunctionalTransferSuccess
  Scenario: Display a notification after a successful transfer
    And I have sufficient funds to make a transfer
    When I complete a successful money transfer
    Then a transfer success notification should be displayed
    And the notification should confirm that the transfer was successful

  @FunctionalAccountAlert
  Scenario: Display an account alert
    When an account alert is triggered
    Then an in-app notification should be displayed
    And the notification should contain the relevant alert information

  @NegativeErrorAlert
  Scenario: Display an error message when a transaction fails
    When I attempt a transaction that fails
    Then an error toast or modal should be displayed
    And the error message should explain why the transaction failed
