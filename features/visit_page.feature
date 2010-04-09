Feature: Visit a page
  
  Background:
    Given Terminus is connected to a browser
  
  Scenario: Navigate to a page
    When I visit "/"
    Then I should see "Hello, Terminus!"

