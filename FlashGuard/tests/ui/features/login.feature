Feature: User want to login

Scenario Outline: Scenario Outline name: 
Given Given the user is on the login page
When When the user enter a valid username '<Email Address>' and password "<Password>"
Then Go to the dashboard

@login    
Examples: Valid Login 
 | Account                                         |  Email Address              | Password      |
 |  Acc-1  - a user log in with valid credentials  | alice@flashguard.local      | offline-demo  |
 |  Acc-2  - a user log in with valid credentials  | bob@flashguard.local        | offline-demo  |
 |  Acc-3  - a user log in with valid credentials  | charlie@flashguard.local    | offline-demo  |
 |  Acc-4  - a user log in with valid credentials  | services@flashguard.local   | offline-demo  |

@Invalid login    
Examples: Valid Login 
 | Account                                         |  Email Address              | Password      |
 |  Acc-1  - a user log in with valid credentials  | alice@flashguard.local      | offline-demo  |
 |  Acc-2  - a user log in with valid credentials  | bob@flashguard.local        | offline-demo  |
 |  Acc-3  - a user log in with valid credentials  | charlie@flashguard.local    | offline-demo  |
 |  Acc-4  - a user log in with valid credentials  | services@flashguard.local   | offline-demo  |



 