Feature: Follow links
  
  Scenario: Follow a link
    When I visit "/"
    And I click "Table of Contents"
    Then I should see "Chapter One"

