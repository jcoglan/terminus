require 'spec/spec_helper'

describe Capybara::Driver::Terminus do
  before do
    @driver = Capybara::Driver::Terminus.new(TestApp)
    Terminus.ensure_docked_browser!
    Terminus.browser = :docked
  end

  after do
    Terminus.return_to_dock
  end

  it "should throw an error when no rack app is given" do
    running do
      Capybara::Driver::Terminus.new(nil)
    end.should raise_error(ArgumentError)
  end

  it_should_behave_like "driver"
  it_should_behave_like "driver with javascript support"
  it_should_behave_like "driver with cookies support"
#  it_should_behave_like "driver with infinite redirect detection"
end
