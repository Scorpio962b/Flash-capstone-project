Feature: Initiate successful money transfers
  As a system rule requirement
  I want to validate money transfers to an account from a beneficiary
  So that incorrect or unauthorized money transfers are rejected
  
  Background: 
  Given I navigate to transfer funds feature 
  
  

  Scenario Outline: <case>
    When I select "<Account>" from Accounts tab
    And I select "<Beneficiary>" from Beneficiaries
    And I select "<Amount>" ZAR that I want to transfer
    Then I see the "<expectedMessage>" result for my transfer request
    And my "<Balance>" shows correctly
    

@smoke
Examples: Accepted
    | case | Account | Beneficiary | Amount | expectedMessage | Balance |
    | TC-001 A successful money transfer | Alice Ledger | Bob Wallet   | 200 | Transfer created successfully | R9800.00 |
    | TC-002 A successful money transfer | Bob Wallet   | Alice Ledger | 200 | Transfer created successfully | R2300.00 |

@negative
Examples: Boundary/Rejected
    | case | Account | Beneficiary| Amount | expectedMessage | Balance |
    | TC-003 - Transfer the minimum amount, R0.01  | Alice Ledger  | Bob Wallet | 0.01 | Transfer created successfully | R9999.99 |
    | TC-004 - Transfer no amount, R0.00  |  Bob Wallet  | Alice Ledger | 0 | Invalid transfer payload | R2500.00|