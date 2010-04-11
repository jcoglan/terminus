require 'forwardable'
require 'uri'
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
    timeouts
    controller
    browser
    node
    ping_match

].each do |file|
  require File.join(File.dirname(__FILE__), 'terminus', file)
end

require File.dirname(__FILE__) + '/capybara/driver/terminus'

Thin::Logging.silent = true

module Terminus
  VERSION      = '0.2.0'
  FAYE_MOUNT   = '/messaging'
  DEFAULT_HOST = 'localhost'
  DEFAULT_PORT = 7004
  
  class << self
    def create(options = {})
      Server.new(options)
    end
    
    def driver_script(host = DEFAULT_HOST)
      Application.driver_script(host)
    end
    
    def endpoint(host = DEFAULT_HOST)
      "http://#{host}:#{DEFAULT_PORT}#{FAYE_MOUNT}"
    end
    
    def ensure_reactor_running!
      Thread.new { EM.run unless EM.reactor_running? }
      while not EM.reactor_running?; end
    end
    
    extend Forwardable
    def_delegators :controller,
                   :ensure_docked_browser!,
                   :ensure_browser!,
                   :browser,
                   :browser=,
                   :return_to_dock
    
  private
    
    def controller
      @controller ||= Controller.new
    end
  end
end

