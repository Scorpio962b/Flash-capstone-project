Feature: Flash-Guard Camera Face-Check Authentication

  @mobile @authentication @camera @negative
  Scenario: Merchant cancels camera face-check
    Given the merchant is on the login screen
    When the merchant selects camera face-check
    And the merchant grants camera permission if requested
    And the merchant cancels camera face-check
    Then the camera face-check modal should close
    And the merchant should remain on the login screen
