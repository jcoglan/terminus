Feature: Filling out forms
  
  Scenario: Fill in a text field
    When I visit "/form.html"
    And I fill in "Name" with "James"
    And I press "Save"
    Then I should see "Got full-name: James"
  
  Scenario: Submit a form controlled by JavaScript
    When I visit "/form.html"
    And I press "Go"
    Then I should see "Injected with script"

