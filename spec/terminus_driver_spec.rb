require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe Capybara::Driver::Terminus do
  before do
    @driver = Capybara::Driver::Terminus.new(TestApp)
    Terminus.ensure_docked_browser
    Terminus.browser = :docked
  end

  after do
    Terminus.return_to_dock
  end

  it_should_behave_like "driver"
  it_should_behave_like "driver with javascript support"
  it_should_behave_like "driver without status code support"
  it_should_behave_like "driver with support for window switching"
  it_should_behave_like "driver with cookies support"
  it_should_behave_like "driver with infinite redirect detection"
end
