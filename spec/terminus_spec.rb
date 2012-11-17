require File.expand_path('../spec_helper', __FILE__)

describe Terminus do
  include Capybara::SpecHelper

  before do
    @session = Capybara::Session.new(:terminus, TestApp)
    select_browser
  end
  
  after do
    Terminus.browser.return_to_dock unless ENV['USER_AGENT']
  end

  specs = Capybara::SpecHelper.instance_eval { @specs }
  specs.each do |name, options, block|
    next if name =~ /within/
    describe name, options do
      class_eval(&block)
    end
  end
end

