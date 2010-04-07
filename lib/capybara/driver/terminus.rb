class Capybara::Driver::Terminus < Capybara::Driver::Base
  def initialize(app)
    @app = app
    @rack_server = Capybara::Server.new(@app)
    @rack_server.boot if Capybara.run_server
  end
  
  def visit(path)
    browser.visit @rack_server.url(path)
  end
  
  def find(xpath)
    browser.find(xpath)
  end
  
private
  
  def browser
    Terminus.ensure_connection!
    Terminus.ensure_browser!
    Terminus.browser
  end
end
