Feature: User wants to login

  Background:
    Given I am on the login page

  Scenario Outline: <id> Valid login as <user>
    When <user> logs in
    Then the dashboard is shown and the session is saved

    Examples:
      | id            | user  |
      | T-UI-AUTH-001 | alice |
      | T-UI-AUTH-002 | bob   |

  Scenario: T-UI-AUTH-003 Wrong password is rejected
    When bob logs in with a wrong password
    Then an invalid credentials error is shown

  Scenario: T-UI-AUTH-004 Account locks after 5 failed attempts
    When charlie fails to log in 5 times
    Then the account locked message is shown

  Scenario: T-UI-AUTH-005 User logs out and logs in again
    Given alice is logged in
    When I sign out
    Then the login page is shown and the session is cleared
    When alice logs in
    Then the dashboard is shown and the session is saved

  @clock
  Scenario: T-UI-AUTH-006 Session expires after 30 minutes of inactivity
    Given bob is logged in
    When I am inactive for 30 minutes
    Then the session expired message is shown and the session is cleared

  @chrome
  Scenario: T-UI-AUTH-007 Login works in the latest Chrome
    Given the test is running in Google Chrome
    When alice logs in
    Then the dashboard is shown and the session is saved