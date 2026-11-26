Feature: Flash-Guard Camera Face-Check Authentication

  @mobile @authentication @camera @negative @permission
  Scenario: Merchant denies camera permission
    Given the merchant is on the login screen
    When the merchant selects camera face-check
    And the merchant denies camera permission
    Then the camera access required alert should be displayed
    And the merchant should remain on the login screen
