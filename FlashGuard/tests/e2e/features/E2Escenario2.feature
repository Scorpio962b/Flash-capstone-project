@e2e @P0
Feature: E2E transfer flow

  Scenario: Transfer to a sanctioned recipient fails the compliance check
    Given I am logged in as "Alice"
    And I note the transaction count for "Alice Ledger"
    When I transfer "R 100,00" from "Alice Ledger" to the sanctioned recipient "Sanctioned Recipient"
    Then the compliance check API should return an error
    And the web UI should show a user-friendly error message
    And no transaction should be created in the database
    And the audit log should record the attempt and failure reason