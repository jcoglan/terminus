require 'forwardable'

class Capybara::Driver::Terminus < Capybara::Driver::Base
  def initialize(app)
    @app = app
    @rack_server = Capybara::Server.new(@app)
    @rack_server.boot if Capybara.run_server
  end
  
  def visit(path)
    browser.visit @rack_server.url(path)
  end
  
  extend Forwardable
  def_delegators :browser, :find,
                           :current_url,
                           :current_path,
                           :body,
                           :source,
                           :evaluate_script,
                           :cleanup!
  
private
  
  def browser
    Terminus.ensure_browser!
    Terminus.browser
  end
end
