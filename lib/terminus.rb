require 'forwardable'
require 'rubygems'
require 'rack'
require 'thin'
require 'eventmachine'
require 'faye'
require 'capybara'
require 'sinatra'
require 'packr'

%w[ application
    server
    controller
    browser
    ping_match

].each do |file|
  require File.join(File.dirname(__FILE__), 'terminus', file)
end

require File.dirname(__FILE__) + '/capybara/driver/terminus'

Thin::Logging.silent = true

module Terminus
  VERSION      = '0.2.0'
  FAYE_MOUNT   = '/messaging'
  DEFAULT_PORT = 7004
  
  class << self
    def create(options = {})
      Server.new(options)
    end
    
    def javascript_tag
      Application.javascript_tag
    end
    
    def endpoint
      "http://0.0.0.0:#{DEFAULT_PORT}#{FAYE_MOUNT}"
    end
    
    def ensure_reactor_running!
      Thread.new { EM.run unless EM.reactor_running? }
      while not EM.reactor_running?; end
    end
    
    extend Forwardable
    def_delegators :controller,
                   :ensure_connection!,
                   :ensure_browser!,
                   :browser,
                   :return_to_dock
    
  private
    
    def controller
      @controller ||= Controller.new
    end
  end
end

