require 'rubygems'
require 'rack'
require 'thin'
require 'eventmachine'
require 'faye'

Thin::Logging.silent = true

module Terminus
  VERSION = '0.1.0'
  
  class Server
    def initialize(options = {})
      @options = options
    end
    
    def execute(script, &callback)
      # TODO run javascript code in the browser
    end
    
    def running?
      not @server.nil?
    end
    
    def run
      return if running?
      handler = Rack::Handler.get('thin')
      ensure_reactor_running!
      handler.run(app, :Port => @options[:port]) { |s| @server = s }
    end
    
    def stop
      return unless running?
      @server.stop!
      @server = nil
    end
    
  private
    
    def app
      return @app if defined?(@app)
      frontend = Application.new
      @app = Faye::RackAdapter.new(frontend, :mount => '/exec', :timeout => 15)
    end
    
    def ensure_reactor_running!
      Thread.new { EM.run unless EM.reactor_running? }
      while not EM.reactor_running?; end
    end
  end
  
  class Application
    def call(env)
      [200, {'Content-Type' => 'text/plain'}, ['Hello Terminus App']]
    end
  end
  
end

