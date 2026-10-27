Feature: User wants to login

Scenario Outline: <Account>
  Given the user is on the login page
  When the user enters a valid username '<Email Address>' and password "<Password>"
  Then the user is taken to the dashboard

  @login
  Examples: Valid Login
    | Account                                               | Email Address          | Password     |
    | T-UI-AUTH-001 - a user logs in with valid credentials | alice@flashguard.local | offline-demo |
    | T-UI-AUTH-002 - a user logs in with valid credentials | bob@flashguard.local   | offline-demo |

Scenario Outline: <Account>
  Given the user is on the login page
  When the user enters username '<Email Address>' and password "<Password>"
  Then an invalid credentials error is displayed

  @InvalidLogin
  Examples: Invalid Login
    | Account                                                   | Email Address        | Password     |
    | T-UI-AUTH-003 - a user logs in with an incorrect password | bob@flashguard.local | onnline-demo |
    | T-UI-AUTH-001 - a user logs in with valid credentials | alce@flashguard.local | offline-demo |

Scenario Outline: <Account>
  Given the user is on the login page
  When the user enters a wrong password <Attempts> times for '<Email Address>'
  Then the account locked message is displayed

  @InvalidLogin @lockout
  Examples: Account Lockout
    | Account                                                         | Email Address            | Password     | Attempts |
    | T-UI-AUTH-004 - account is locked after 5 failed login attempts | charlie@flashguard.local | offline-demo | 5        |

Scenario Outline: <Account>
  Given the user is on the login page
  And the user is logged in as '<Email Address>' with password "<Password>"
  When the user logs out
  Then the login page is displayed
  When the user enters a valid username '<Email Address>' and password "<Password>"
  Then the user is taken to the dashboard

  @session
  Examples: Logout and Re-login
    | Account                                           | Email Address          | Password     |
    | T-UI-AUTH-005 - a user logs out and logs in again | alice@flashguard.local | offline-demo |

Scenario Outline: <Account>
  Given the user is on the login page
  And the user is logged in as '<Email Address>' with password "<Password>"
  When the user is inactive for <Minutes> minutes
  And the user interacts with the application
  Then a session expired message is displayed
  When the user enters a valid username '<Email Address>' and password "<Password>"
  Then the user is taken to the dashboard

  @session @timeout @clock
  Examples: Session Timeout
    | Account                                                              | Email Address        | Password     | Minutes |
    | T-UI-AUTH-006 - session expires after 30 minutes and user re-logs in | bob@flashguard.local | offline-demo | 30      |

Scenario Outline: <Account>
  Given the test is running in Google Chrome
  And the user is on the login page
  When the user enters a valid username '<Email Address>' and password "<Password>"
  Then the user is taken to the dashboard

  @regression @chrome
  Examples: Chrome Regression
    | Account                                                | Email Address          | Password     |
    | T-UI-AUTH-007 - login and logout work in latest Chrome | alice@flashguard.local | offline-demo |