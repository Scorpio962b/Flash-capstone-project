Feature: Flash-Guard Merchant Mobile Settings

  As a registered Flash-Guard merchant
  I want to manage my profile and account security in the mobile app
  So that my account details stay accurate and my account stays protected

  # DEFECT: the Account screen has no edit-profile option in the current build

  @mobile @settings @profile @positive @defect
Scenario: Successfully update profile name and phone number
  Given the merchant is logged in and on the Account screen
  When the merchant opens profile settings
  And updates the name to "Alice Ledger Updated"
  And updates the phone number to "0821234567"
  And saves the changes
  Then the updated profile name and phone number should be displayed
  And a profile updated confirmation should be displayed