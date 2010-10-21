require 'forwardable'

class Capybara::Driver::Terminus < Capybara::Driver::Base
  def initialize(app = nil)
    raise ArgumentError.new if app.nil?
    @app = app
    @rack_server = Capybara::Server.new(@app)
    @rack_server.boot if Capybara.run_server
  end
  
  def visit(path)
    browser.visit @rack_server.url(path)
  end
  
  extend Forwardable
  def_delegators :browser, :body,
                           :current_path,
                           :current_url,
                           :evaluate_script,
                           :execute_script,
                           :find,
                           :reset!,
                           :source
  
  def within_window(name)
    current_browser = browser
    Terminus.browser = {:name => name}
    yield
    Terminus.browser = current_browser
  end
  
private
  
  def browser
    Terminus.ensure_browser
    Terminus.browser
  end
end

# Capybara 0.3.9 looks in the Capybara::Driver namespace for
# appropriate drivers. 0.4 uses this registration API instead.
if Capybara.respond_to?(:register_driver)
  Capybara.register_driver :terminus do |app|
    Capybara::Driver::Terminus.new(app)
  end
end

