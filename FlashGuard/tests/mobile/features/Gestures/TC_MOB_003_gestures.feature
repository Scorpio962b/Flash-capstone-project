Feature: Flash-Guard Mobile Gestures

  Background:
    Given I am logged into the mobile app

  @mobile @gestures
  Scenario: T-MOB-GEST-001 Swipe the dashboard card carousel
    When I open the mobile dashboard tab
    And I swipe left on the mobile balance card
    Then the next mobile dashboard card should be visible

  @mobile @gestures
  Scenario: T-MOB-GEST-002 Tap and long-press interactions
    When I open the mobile dashboard tab
    And I tap the mobile history tab
    Then the mobile history page should be displayed
    When I tap the mobile dashboard tab
    And I long press the mobile balance card
    Then the mobile dashboard should remain stable