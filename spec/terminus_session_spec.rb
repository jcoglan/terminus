require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe Capybara::Session do
  context 'with terminus driver' do
    before do
      @session = Capybara::Session.new(:terminus, TestApp)
      Terminus.ensure_docked_browser
      Terminus.browser = :docked
    end

    after do
      Terminus.return_to_dock
    end

    describe '#driver' do
      it "should be a terminus driver" do
        @session.driver.should be_an_instance_of(Capybara::Driver::Terminus)
      end
    end

    describe '#mode' do
      it "should remember the mode" do
        @session.mode.should == :terminus
      end
    end

    it_should_behave_like "session"
    it_should_behave_like "session with javascript support"
    it_should_behave_like "session without headers support"
    it_should_behave_like "session without status code support"
  end
end