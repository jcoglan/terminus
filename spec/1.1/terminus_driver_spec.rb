require File.expand_path('../spec_helper', __FILE__)

describe Capybara::Driver::Terminus do
  before do
    @driver = Capybara::Driver::Terminus.new(TestApp)
    select_browser
  end

  after do
    Terminus.browser.return_to_dock unless ENV['USER_AGENT']
  end

  single_window = %w[Android iPad iPhone PhantomJS].include?(ENV['USER_AGENT'])

  it_should_behave_like "driver"
  it_should_behave_like "driver with javascript support"
  it_should_behave_like "driver with resynchronization support"
  it_should_behave_like "driver with header support"
  it_should_behave_like "driver with status code support"
  it_should_behave_like "driver with support for window switching" unless single_window
  it_should_behave_like "driver with cookies support"
  it_should_behave_like "driver with infinite redirect detection"
end
