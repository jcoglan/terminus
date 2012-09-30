module Terminus
  class PhantomJS
    
    DEFAULT_COMMAND = ['/usr/bin/env', 'phantomjs']
    PHANTOM_CLIENT  = File.expand_path('../phantom.js', __FILE__)
    
    def self.start(options = {})
      process = new(options)
      process.start
      process
    end
    
    def initialize(options)
      @address  = TCPServer.new(0).addr
      @port     = options[:port] || @address[1]
      @terminus = Terminus.create(:port => @port)
      
      args = (options[:command] || DEFAULT_COMMAND).dup
      args.concat([PHANTOM_CLIENT, @address[2], @port.to_s])
      @phantomjs = ChildProcess.build(*args)
    end
    
    def start
      Terminus.ensure_reactor_running
      @terminus.run!
      
      @phantomjs.start
      
      Terminus.port = @port
      Terminus.browser = {:name => 'PhantomJS'}
      
      at_exit { stop }
    end
    
    def stop
      @terminus.stop!
      @phantomjs.stop
      @phantomjs.poll_for_exit(10)
    rescue ChildProcess::TimeoutError
    end
    
  end
end

