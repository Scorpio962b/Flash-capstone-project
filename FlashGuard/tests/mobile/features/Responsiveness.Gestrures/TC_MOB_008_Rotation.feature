Feature: Mobile Settings and Responsiveness
  As a mobile banking user
  I want to access my account settings and use the app on different screen sizes
  So that the application works correctly on mobile devices

  Background:
    Given I am logged into the FlashGuard application
     And im  on the Dashboard screen


@mobile @responsive @rotation @positive
Scenario: Rotate screen from portrait to landscape
  Given the merchant is on the Dashboard screen
  When the merchant rotates the device to landscape mode
  Then the Dashboard screen should adjust correctly
  And all account information should remain visible