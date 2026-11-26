Feature: Mobile Dashboard

  Background:
    Given I am logged into the mobile app

  @mobile @dashboard
  Scenario: T-MOB-DASH-001 Dashboard loads correctly with balance display
    When I open the mobile dashboard tab
    Then the mobile dashboard balance should be displayed

  @mobile @dashboard
  Scenario: T-MOB-DASH-002 Recent transactions are visible with scrolling
    When I open the mobile dashboard tab
    And I scroll through the dashboard transactions
    Then recent mobile transactions should be visible

  @mobile @dashboard
  Scenario: T-MOB-DASH-003 Refresh balance using pull gesture
    When I open the mobile dashboard tab
    And I refresh the mobile balance
    Then the mobile dashboard balance should still be displayed