@AccountManagement
Feature: Account Management  
  As a FlashGuard user
  I want to update account information and payment methods
  So that the account displays correctly and payment methods are validated

  Background:
    Given I am logged in and see the homepage

  Scenario Outline: "<case>"
    When I select Account Profile
    And I update "<FullName>"
    And I update "<Email>"
    And I Update "<phoneNumber>"
    And I change "<Password>"
    Then I see "<expectedMessage>" result


    Examples: Accepted
      | case                   | FullName     | Email                  | phoneNumber | Password     | expectedMessage                      |
      | Update Account details | Alice Ledger | alice@flashguard.local | 0794867890  | offline-demo | Profile details updated successfully |



@PaymentMethods
  Scenario Outline: "<case>"
    When I navigate to the payment methods feature
    And I click add payment method to enter my "<cardNumber>"
    And I enter my "<Nickname>"
    And I enter my "<expiryDate>"
    And I enter my "<CVV>" and click add card
    Then I see "<expectedMessage>" result for my payment method


    Examples: Accepted
      | case                   | cardNumber      | Nickname  | expiryDate | CVV | expectedMessage                   |
      | Add new payment method | 1234567890123456 | Test Bank | 02/28       | 223 | Payment method added successfully |


