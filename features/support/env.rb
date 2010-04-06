require 'capybara/cucumber'
require File.dirname(__FILE__) + '/../../lib/terminus'
require File.dirname(__FILE__) + '/../application/app'

Capybara.default_driver = :terminus
Capybara.app = TestApplication.new

After do
  Terminus.return_to_dock
end

