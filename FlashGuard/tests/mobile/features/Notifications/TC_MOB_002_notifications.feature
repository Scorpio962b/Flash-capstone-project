Feature: Flash-Guard Mobile Notifications and Permissions

  @mobile @notifications
  Scenario: T-MOB-NOTIF-001 In-app alerts are displayed
    Given I am logged into the mobile app
    When I open the mobile account tab
    Then the mobile notifications alert count should be displayed

  @mobile @notifications
  Scenario: T-MOB-NOTIF-002 Tapping the pending approvals card opens the detail page
    Given I am logged into the mobile app
    When I tap the mobile pending approvals card
    Then the mobile history page should be displayed with the pending filter

  @mobile @notifications @permissions
  Scenario: T-MOB-NOTIF-003a Granting camera permission opens the camera preview
    Given the merchant is on the login screen
    When the merchant selects camera face-check
    And the merchant grants camera permission if requested
    Then the camera preview should become ready

  @mobile @notifications @permissions
  Scenario: T-MOB-NOTIF-003b Denying camera permission shows an access required alert
    Given the merchant is on the login screen
    When the merchant selects camera face-check
    And the merchant denies camera permission
    Then the camera access required alert should be displayed