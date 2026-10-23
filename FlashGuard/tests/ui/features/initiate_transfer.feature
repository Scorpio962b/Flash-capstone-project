Feature: Initiate successful money transfers
  As a system rule requirement
  I want to validate money transfers to an account from a beneficiary
  So that incorrect or unauthorized money transfers are rejected
  
  Background: 
  Given I navigate to transfer funds feature 
  
  

  Scenario Outline: <case>
    When I select "<Account>" from Accounts tab
    And I select "<Beneficiary>" from Beneficiaries
    And I select "<Amount>" that I want to transfer
    Then I see the "<Message>" confirming my transfer request
    And my "<Balance>" shows correctly
    

@smoke
Examples: Accepted
    | case | Account | Beneficiary | Amount | Message | Balance
    | TC-001 A successful money transfer | Alice Ledger | Bob Wallet | 200 | Transfer created successfully | R
