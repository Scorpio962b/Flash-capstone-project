@android
Feature: Balance and history
  As a PrimeFin SA customer
  I want to see my account balance and my transaction history
  So that I can keep track of my money

  Background:
    Given I am logged in to PrimeFin SA
    And the dashboard balance has loaded


  # ---- REQ 3: Filter history (date range, type) ----
  # "Type" is only available as a status filter (All / Pending / Completed) in the current app.
  @history @filter
  Scenario Outline: Filtering history by status shows only that status
    Given I open the "History" tab
    When I filter the history by "<filter>"
    Then only "<filter>" transactions should be listed
    When I filter the history by "All"
    Then the first backend transaction should be visible in the history

    Examples:
      | filter    |
      | Pending   |
      | Completed |

  # Not implemented in App.js yet: excluded by default (tagExpression "not @wip").
  @wip @history @filter
  Scenario: Filtering history by date range
    Given I open the "History" tab
    When I set the history date range from "2026-05-25" to "2026-05-26"
    Then only transactions dated within that range should be listed

  # ---- REQ 4: Export / share transaction screenshot ----
  # Not implemented in App.js yet: excluded by default.
  @wip @history @export
  Scenario: Sharing a transaction screenshot
    Given I open the "History" tab
    When I choose to share the first transaction
    Then the Android share sheet should be displayed
    And the shared file should be an image of that transaction