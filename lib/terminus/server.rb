module Terminus
  class Server
    
    def initialize(options = {})
      @options = options
    end
    
    def execute(script, &callback)
      messenger.publish('/terminus/commands', :command => script)
    end
    
    def running?
      not @server.nil?
    end
    
    def run!
      return if running?
      handler = Rack::Handler.get('thin')
      ensure_reactor_running!
      handler.run(app, :Port => @options[:port]) { |s| @server = s }
    end
    
    def stop!
      return unless running?
      @server.stop!
      @server = nil
    end
    
  private
    
    def app
      return @app if defined?(@app)
      frontend = Application.new
      @app = Faye::RackAdapter.new(frontend, :mount => FAYE_MOUNT, :timeout => 15)
    end
    
    def messenger
      app.get_client
    end
    
    def ensure_reactor_running!
      Thread.new { EM.run unless EM.reactor_running? }
      while not EM.reactor_running?; end
    end
    
  end
end

