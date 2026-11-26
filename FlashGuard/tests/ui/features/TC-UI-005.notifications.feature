@NotificationsFeature
Feature: Notifications and Alerts
  As a signed-in FlashGuard user
  I want to receive notifications and alerts
  So that I can stay informed about my transactions and account activity

 Background:
 Given I am signed in with a valid account

  @FunctionalNotificationBell @KnownDefect
  Scenario: Known defect - the notifications bell does not open a panel
    And I am on the account dashboard
    When I click the notifications bell icon
    Then the notifications panel should remain unavailable
    And no notification entries should be displayed

  @FunctionalTransferSuccess
  Scenario: Display a notification after a successful transfer
    And I have sufficient funds to make a transfer
    When I complete a successful money transfer
    Then a transfer success notification should be displayed
    And the notification should confirm that the transfer was successful

  @FunctionalAccountAlert @KnownDefect
  Scenario: Known defect - account alerts are not displayed on the dashboard
    Given a high-value account alert is available
    When I open the account dashboard
    Then the account alert should not be displayed on the dashboard
    And the account alert details should remain unavailable in the dashboard

  @NegativeErrorAlert
  Scenario: Display an error message when a transaction fails
    When I attempt a transaction that fails
    Then an error toast or modal should be displayed
    And the error message should explain why the transaction failed
