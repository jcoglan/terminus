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
                           :cleanup!,
                           :current_path,
                           :current_url,
                           :evaluate_script,
                           :execute_script,
                           :find,
                           :source
  
private
  
  def browser
    Terminus.ensure_browser!
    Terminus.browser
  end
end
