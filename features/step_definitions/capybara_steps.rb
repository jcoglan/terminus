When /^I visit "([^\"]*)"$/ do |url|
  visit url
end

When /^I click "([^\"]*)"$/ do |link_text|
  click_link link_text
end

Then /^I should( not)? see "([^\"]*)"$/ do |no, text|
  method = no ? :should_not : :should
  page.__send__ method, have_content(text)
end

When /^I fill in "([^\"]*)" with "([^\"]*)"$/ do |field_name, value|
  fill_in field_name, :with => value
end

When /^I press "([^\"]*)"$/ do |button_text|
  click_button button_text
end

