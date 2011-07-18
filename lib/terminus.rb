require 'forwardable'
require 'uri'
require 'rack'
require 'thin'
require 'eventmachine'
require 'faye'
require 'sinatra'
require 'packr'
require 'capybara'
require 'rack-proxy'
require 'useragent'

Thin::Logging.silent = true

module Terminus
  FAYE_MOUNT   = '/messaging'
  DEFAULT_HOST = 'localhost'
  DEFAULT_PORT = 7004
  LOCALHOST    = /^(localhost|0\.0\.0\.0|127\.0\.0\.1)$/
  RETRY_LIMIT  = 3
  
  ROOT = File.expand_path(File.dirname(__FILE__))
  autoload :Application, ROOT + '/terminus/application'
  autoload :Browser,     ROOT + '/terminus/browser'
  autoload :Controller,  ROOT + '/terminus/controller'
  autoload :Host,        ROOT + '/terminus/host'
  autoload :Node,        ROOT + '/terminus/node'
  autoload :Proxy,       ROOT + '/terminus/proxy'
  autoload :Server,      ROOT + '/terminus/server'
  autoload :Timeouts,    ROOT + '/terminus/timeouts'
  
  require ROOT + '/capybara/driver/terminus'
  
  class << self
    attr_accessor :debug
    
    def create(options = {})
      Server.new(options)
    end
    
    def driver_script(host = DEFAULT_HOST)
      Application.driver_script(host)
    end
    
    def endpoint(host = DEFAULT_HOST)
      "http://#{host}:#{port}#{FAYE_MOUNT}"
    end
    
    def ensure_reactor_running
      Thread.new { EM.run unless EM.reactor_running? }
      while not EM.reactor_running?; end
    end
    
    def port
      @port || DEFAULT_PORT
    end
    
    def port=(port)
      @port = port.to_i
    end
    
    extend Forwardable
    def_delegators :controller, :browser,
                                :browsers,
                                :browser=,
                                :ensure_browsers,
                                :return_to_dock,
                                :rewrite_local,
                                :rewrite_remote
    
  private
    
    def controller
      @controller ||= Controller.new
    end
  end
end

