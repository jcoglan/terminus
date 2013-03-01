class Capybara::Driver::Terminus < Capybara::Driver::Base
  attr_reader :options

  NULL_APP = lambda do |env|
    [200, {'Content-Type' => 'text/html'}, ['']]
  end

  def initialize(app = nil, options = {})
    @app         = Terminus::Proxy[app || NULL_APP]
    @options     = options
    @rack_server = Capybara::Server.new(@app)

    @rack_server.boot
    sleep(0.1) until Terminus.server_running?(@rack_server)
    Terminus.register_local_port(@rack_server.port)
  end

  def find_css(css)
    browser.find_css(css, self)
  end

  def find_xpath(xpath)
    browser.find_xpath(xpath, self)
  end
  alias :find :find_xpath

  def invalid_element_errors
    [::Terminus::ObsoleteElementError]
  end

  def needs_server?
    true
  end

  def visit(path)
    h, s = Capybara.app_host, @rack_server
    path = "#{h || "http://#{s.host}:#{s.port}"}#{path}" unless path =~ /^https?:\/\//
    browser.visit(path)
  end

  def wait?
    true
  end

  extend Forwardable
  def_delegators :browser, :body,
                           :current_url,
                           :debugger,
                           :evaluate_script,
                           :execute_script,
                           :html,
                           :reset!,
                           :response_headers,
                           :save_screenshot,
                           :source,
                           :status_code

  def within_window(name)
    current_browser = browser
    Terminus.browser = browser.id + '/' + name
    result = yield
    Terminus.browser = current_browser
    result
  end
  alias :within_frame :within_window

private

  def browser
    Terminus.ensure_browsers
    Terminus.browser
  end
end

# Capybara 0.3.9 looks in the Capybara::Driver namespace for appropriate
# drivers. 0.4 uses this registration API instead.
if Capybara.respond_to?(:register_driver)
  Capybara.register_driver :terminus do |app|
    Capybara::Driver::Terminus.new(app)
  end
end

# We use WEBrick to boot the test app, because if we use Thin (the default) the
# slow response used to test Ajax resynchronization blocks the event loop. This
# stops Terminus receiving messages and causes false positives: the client is
# not really waiting for Ajax to complete, it's just having its messages blocked
# because EventMachine is frozen.

Capybara.server do |app, port|
  handler = Rack::Handler.get('webrick')
  handler.run(app, :Port => port, :AccessLog => [], :Logger => WEBrick::Log::new(nil, 0))
end

