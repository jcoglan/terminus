module Terminus
  class Server
    
    def initialize(options = {})
      @options = options
    end
    
    def running?
      not @server.nil?
    end
    
    def run!
      return if running?
      handler = Rack::Handler.get('thin')
      handler.run(app, :Port => @options[:port]) { |s| @server = s }
    end
    
    def stop!
      return unless running?
      @server.stop!
      @server = nil
    end
    
  private
    
    def app
      @app ||= Rack::Builder.new {
                 use Terminus::Proxy
                 use Faye::RackAdapter, :mount => FAYE_MOUNT, :timeout => 15
                 run Application.new
               }.to_app
    end
    
  end
end

