class Capybara::Driver::Terminus < Capybara::Driver::Base
  attr_reader :options
  
  def initialize(app = nil, options = {})
    raise ArgumentError.new if app.nil?
    
    @app         = Terminus::Proxy[app]
    @options     = options
    @rack_server = Capybara::Server.new(@app)
    
    @rack_server.boot
  end
  
  def find(xpath)
    browser.find(xpath, self)
  end
  
  def invalid_element_errors
    [::Terminus::ObsoleteElementError]
  end
  
  def visit(path)
    browser.visit(@rack_server.url(path))
  end
  
  def wait?
    true
  end
  
  extend Forwardable
  def_delegators :browser, :body,
                           :current_url,
                           :evaluate_script,
                           :execute_script,
                           :reset!,
                           :response_headers,
                           :source,
                           :status_code
  
  def within_window(name)
    current_browser = browser
    Terminus.browser = browser.id + '/' + name
    yield
    Terminus.browser = current_browser
  end
  alias :within_frame :within_window
  
private
  
  def browser
    Terminus.ensure_browsers
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

