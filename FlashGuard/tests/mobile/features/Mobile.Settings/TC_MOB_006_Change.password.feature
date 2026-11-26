  Feature: Flash-Guard Merchant Mobile Settings

  As a registered Flash-Guard merchant
  I want to manage my profile and account security in the mobile app
  So that my account details stay accurate and my account stays protected

  # DEFECT: the Account screen has no change-password option in the current build
  @mobile @settings @password @positive @defect
  Scenario: Successfully change password
  Given the merchant is on the change password screen
  When the merchant enters and submits a new password
  Then a password changed confirmation should be displayed
  And the merchant should be able to log in with the new password
  