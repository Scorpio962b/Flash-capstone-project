@loginfeature
Feature: Login

  Background:
    Given I am on the login page

  Scenario Outline: <id> Login with valid credentials as <user>
    When I sign in with email "<email>" and password "<password>"
    Then I should see the dashboard

    Examples:
      | id            | user    | email                    | password    |
      | T-UI-AUTH-001 | alice   | alice@flashguard.local   | offline-demo |
      | T-UI-AUTH-002 | bob     | bob@flashguard.local     | offline-demo |

  Scenario: T-UI-AUTH-003 Login with invalid password
    When I sign in with email "bob@flashguard.local" and password "wrong-password"
    Then I should remain on the login page

  Scenario: T-UI-AUTH-004 Account locks after 5 failed attempts
    When I fail to log in with email "charlie@flashguard.local" and password "wrong-password" 5 times
    Then I should see the account locked message

  Scenario: T-UI-AUTH-005 Logout and login again
    Given I am logged in with email "alice@flashguard.local" and password "offline-demo"
    When I sign out and sign back in with email "alice@flashguard.local" and password "offline-demo"
    Then I should see the dashboard

  @clock
  Scenario: T-UI-AUTH-006 Session expires after 30 minutes of inactivity
    Given I am logged in with email "bob@flashguard.local" and password "offline-demo"
    When I am inactive for 30 minutes
    Then I should see the session expired message

  @chrome
  Scenario: T-UI-AUTH-007 Login works in the latest Chrome
    Given the test is running in Google Chrome
    When I sign in with email "alice@flashguard.local" and password "offline-demo"
    Then I should see the dashboard