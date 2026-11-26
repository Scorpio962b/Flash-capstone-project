@DashboardFeature
Feature: User dashboard and account information
  As a signed-in FlashGuard user
  I want to view my account dashboard
  So that I can see my account summary and recent activity

Background:
 Given I am signed in with a valid account

  @SmokeDashboardDisplay
  Scenario: Display the account dashboard
    When I open the dashboard
    Then the Portfolio Overview heading should be visible
    And my account balance should be displayed
    And recent transaction details should be displayed

  @IntegrationBalanceAccuracyDisplay
  Scenario Outline: Display the correct account balance
    And the account balance is "<expectedBalance>"
    When I open the dashboard
    Then the displayed balance should be "<expectedBalance>"

    Examples:
      | expectedBalance |
      | 1000.00         |
      | 0.00            |
      | 500.50          |

  @FunctionalBalanceAccuracy
  Scenario Outline: Reflect an updated account balance
    And my initial balance is "<initialBalance>"
    When my account balance is updated to "<updatedBalance>"
    Then the dashboard should display "<updatedBalance>"

    Examples:
      | initialBalance | updatedBalance |
      | 10000.00        | 12000.00      |

  @FunctionalRecentTransactionsDisplay
  Scenario Outline: Display the available recent transactions
    And the account containing <transactionCount> transactions
    When I open the dashboard
    Then I should see <expectedCount> recent transactions

    Examples:
      | transactionCount | expectedCount |
      | 10               | 3             |
      | 3                | 3             |
      | 0                | 0             |

