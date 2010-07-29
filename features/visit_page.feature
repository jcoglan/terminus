Feature: Visit a page
  
  Scenario: Navigate to a page
    When I visit "/"
    Then the current path should be "/"
    And I should see "Hello, Terminus!"

