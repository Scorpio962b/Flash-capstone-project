Feature: Mobile Settings and Responsiveness
  As a mobile banking user
  I want to access my account settings and use the app on different screen sizes
  So that the application works correctly on mobile devices

  Background:
    Given I am logged into the FlashGuard application
     And im  on the Dashboard screen


  @responsive @landscape
  Scenario: Display the application in landscape mode
    When I set the mobile screen to landscape mode
    Then the Dashboard screen should be displayed correctly

  @responsive @phone
  Scenario: Display the application on a mobile phone resolution
    When I set the screen resolution to  mobile phone size
    Then the Dashboard screen should be displayed correctly

  @responsive @tablet
  Scenario: Display the application on a tablet resolution
    When I set the screen resolution to tablet size
    Then the Dashboard screen should be displayed correctly