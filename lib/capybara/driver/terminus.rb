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
  
  def visit(path)
    browser.visit(@rack_server.url(path))
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
  
  def within_frame(name)
    frame_src = browser.frame_src(name)
    frame = browser.frames.find do |frame|
      frame.current_url == frame_src or
      frame.current_path == frame_src
    end
    current_browser = browser
    Terminus.browser = frame
    yield
    Terminus.browser = current_browser
  end
  
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

