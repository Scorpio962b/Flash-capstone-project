@feature
Feature: User dashboard and account information
  As a signed-in FlashGuard user
  I want to view my account dashboard
  So that I can see my account summary and recent activity

  @dashboardDisplayTestData
  @smoke
  Scenario: Display the account dashboard
    Given I am signed in with a valid account
    When I open the dashboard
    Then the Portfolio Overview heading should be visible
    And the welcome message should be visible
    And the total net worth should be displayed
    And my account balance should be displayed
    And recent transaction details should be displayed
    And the spending summary should be visible


  @balanceAccuracyDisplayTestData
  Scenario Outline: Display the correct account balance
    Given I am signed in with an account balance of "<expectedBalance>"
    When I open the dashboard
    Then the displayed balance should be "<expectedBalance>"

    Examples:
      | expectedBalance |
      | 1000.00         |
      | 0.00            |
      | 500.50          |

  @balanceAccuracyRefreshTestData
  Scenario: Reflect an updated account balance
    Given I am viewing the dashboard
    And my initial balance is "1000.00"
    When my account balance is updated to "750.00"
    Then the dashboard should display "750.00"

  @recentTransactionsDisplayTestData
  Scenario Outline: Display the available recent transactions
    Given I am signed in with an account containing <transactionCount> transactions
    When I open the dashboard
    Then I should see <expectedCount> recent transactions

    Examples:
      | transactionCount | expectedCount |
      | 10               | 3             |
      | 3                | 3             |
      | 0                | 0             |
