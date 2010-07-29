Feature: Follow links
  
  Scenario: Follow a link
    When I visit "/"
    And I click "Table of Contents"
    Then I should see "Chapter One"
  
  Scenario: Follow a link controlled by JavaScript
    When I visit "/"
    And I click "stat"
    Then I should see "Everything's just peachy"
    And I should not see "Show Status"

