Feature: Filling out forms
  
  Scenario: Fill in a text field
    When I visit "/form.html"
    And I fill in "Name" with "James"
    And I press "Save"
    Then I should see "Got full-name: James"
  
  Scenario: Fill in a textarea
    When I visit "/form.html"
    And I fill in "Description" with "Ruby programmer hacking your browser"
    And I press "Save"
    Then I should see "Got description: Ruby programmer hacking your browser"
  
  Scenario: Choose a radio button
    When I visit "/form.html"
    And I choose "Male"
    And I press "Save"
    Then I should see "Got gender: male"
  
  Scenario: Choose a radio button (2)
    When I visit "/form.html"
    And I choose "Female"
    And I press "Save"
    Then I should see "Got gender: female"
  
  Scenario: Check a box
    When I visit "/form.html"
    And I check "Active"
    And I press "Save"
    Then I should see "Got active: 1"
  
  Scenario: Check a box then uncheck
    When I visit "/form.html"
    And I check "Active"
    And I uncheck "Active"
    And I press "Save"
    Then I should not see "Got active: 1"
  
  Scenario: Use a select box
    When I visit "/form.html"
    And I select "Ireland" from "State"
    And I press "Save"
    Then I should see "Got state: ireland"
  
  Scenario: Use a select box then unselect
    When I visit "/form.html"
    And I select "Ireland" from "State"
    And I unselect "Ireland" from "State"
    And I press "Save"
    Then I should not see "Got state: ireland"
  
  Scenario: Submit a form controlled by JavaScript
    When I visit "/form.html"
    And I press "Go"
    Then I should see "Injected with script"

