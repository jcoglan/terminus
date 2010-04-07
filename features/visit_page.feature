Feature: Visit a page
  
  Background:
    Given Terminus has a connection
  
  Scenario: Navigate to a page
    When I visit "/"
    Then I should see "Hello, Terminus!"

