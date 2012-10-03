require File.expand_path('../spec_helper', __FILE__)

describe Capybara::Session do
  context 'with terminus driver' do
    before do
      @session = Capybara::Session.new(:terminus, TestApp)
      select_browser
    end
    
    after do
      Terminus.browser.return_to_dock unless ENV['USER_AGENT']
    end
    
    it_should_behave_like "session"
    it_should_behave_like "session with headers support"
    it_should_behave_like "session with javascript support"
    it_should_behave_like "session with status code support"
  end
end
