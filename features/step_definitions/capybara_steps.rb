When /^I visit "([^\"]*)"$/ do |url|
  visit url
end

Then /^I should see "([^\"]*)"$/ do |text|
  page.should have_content(text)
end

