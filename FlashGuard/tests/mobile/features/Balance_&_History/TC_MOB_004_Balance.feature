@android
Feature: Balance and history
  As a PrimeFin SA customer
  I want to see my balance and browse, filter and share my transaction history
  So that I can keep track of my money

  Background:
    Given I am logged in to PrimeFin SA
    And the dashboard balance has loaded

  # ---- REQ 1: Display current balance (accuracy vs DB) ----
  @balance
  Scenario: Current balance shown in the app matches the database
    Then the "Total Net Worth" card should show the same balance as the backend
    When I open the "Transact" tab
    Then the available balance on the transfer screen should show the same balance as the backend

  # ---- REQ 2: Show transaction history (scrolling, load more) ----
  # NOTE: App.js has no pagination / "load more": the whole list is rendered in one ScrollView.
  # So "load more" is verified as "every backend transaction is reachable by scrolling".
  @history @scroll
  Scenario: History can be scrolled from the first to the last transaction
    Given the backend has at least 10 transactions
    When I open the "History" tab
    Then the first backend transaction should be visible in the history
    When I scroll the history down to the last backend transaction
    Then the last backend transaction should be visible in the history
    And the first backend transaction should no longer be visible
    When I scroll the history back to the first backend transaction
    Then the first backend transaction should be visible in the history