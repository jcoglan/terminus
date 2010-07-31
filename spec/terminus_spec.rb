root = File.dirname(__FILE__) + '/../'

require root + 'vendor/capybara/lib/capybara/spec/driver'
require root + 'lib/terminus'

class TestApp
  template :layout do
    <<-HTML
      <html>
        <head>
          <meta http-equiv="Content-type" content="text/html; charset=utf-8">
          <title>Capybara Driver Test</title>
        </head>
        <body>
          <%= yield %>
          <%= Terminus.driver_script request.host %>
        </body>
      </html>
    HTML
  end
end

describe Capybara::Driver::Terminus do
  before do
    @driver = Capybara::Driver::Terminus.new(TestApp)
    Terminus.ensure_docked_browser!
    Terminus.browser = :docked
  end

  after do
    Terminus.return_to_dock
  end

#  it "should throw an error when no rack app is given" do
#    running do
#      Capybara::Driver::RackTest.new(nil)
#    end.should raise_error(ArgumentError)
#  end

  it_should_behave_like "driver"
  it_should_behave_like "driver with javascript support"
  it_should_behave_like "driver with cookies support"
#  it_should_behave_like "driver with header support"
#  it_should_behave_like "driver with status code support"
#  it_should_behave_like "driver with infinite redirect detection"
end
