require 'capybara/cucumber'
require File.dirname(__FILE__) + '/../../lib/terminus'
require File.dirname(__FILE__) + '/../application/app'

Capybara.default_driver = :terminus
Capybara.app = TestApplication.new

Before do
  Terminus.ensure_docked_browser!
  Terminus.browser = :docked
end

After do
  Terminus.return_to_dock
end

