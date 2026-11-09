@loginfeature
Feature: Login

  Background:
    Given I am on the login page

  Scenario Outline: <id> Login with valid credentials as <user>
    When I sign in as "<user>"
    Then I should see the dashboard

    Examples:
      | id            | user  |
      | T-UI-AUTH-001 | alice |
      | T-UI-AUTH-002 | bob   |

  Scenario: T-UI-AUTH-003 Login with invalid password
    When I sign in with invalid credentials as "bob"
    Then I should remain on the login page

  Scenario: T-UI-AUTH-004 Account locks after 5 failed attempts
    When I fail to log in as "charlie" 5 times
    Then I should see the account locked message

  Scenario: T-UI-AUTH-005 Logout and login again
    Given I am logged in as "alice"
    When I sign out and sign back in as "alice"
    Then I should see the dashboard

  @clock
  Scenario: T-UI-AUTH-006 Session expires after 30 minutes of inactivity
    Given I am logged in as "bob"
    When I am inactive for 30 minutes
    Then I should see the session expired message

  @chrome
  Scenario: T-UI-AUTH-007 Login works in the latest Chrome
    Given the test is running in Google Chrome
    When I sign in as "alice"
    Then I should see the dashboard