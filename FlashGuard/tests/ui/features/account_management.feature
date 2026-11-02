@AccountManagement
Feature: Account Management  
  As a FlashGuard user
  I want to update account information and payment methods
  So that the account displays correctly and payment methods are validated

  Background: 
  Given I am logged in and see the homepage
  
  Scenario Outline: "<case>"
    When I select Account Profile
    And I update the full name to "<FullName>"
    And I update the email address to "<Email>"
    And I update the phone number to "<phoneNumber>"
    And I change the password to "<Password>"
    Then I should see the profile result "<expectedMessage>"


    Examples: Accepted
      | case                   | FullName     | Email                  | phoneNumber | Password     | expectedMessage                      |
      | Update Account details | Alice Ledger | alice@flashguard.local | 0794867890  | offline-demo | Profile details updated successfully |



@PaymentMethods
  Scenario Outline: "<case>"
    When I navigate to Payment Methods
    And I add a payment method with card number "<cardNumber>"
    And I enter the payment nickname "<Nickname>"
    And I enter the card expiry date "<expiryDate>"
    And I enter the card CVV "<CVV>" and submit it
    Then I should see the payment method result "<expectedMessage>"


    Examples: Accepted
      | case                   | cardNumber      | Nickname  | expiryDate | CVV | expectedMessage                   |
      | Add new payment method | 1234567890123456 | Test Bank | 02/28       | 223 | Payment method added successfully |

