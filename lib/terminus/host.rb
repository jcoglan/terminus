module Terminus
  class Host
    
    attr_reader :host, :port
    
    def initialize(uri)
      @host = uri.host
      @port = uri.port
    end
    
    def eql?(other)
      host == other.host and
      port == other.port
    end
    alias :== :eql?
    
    def hash
      [host, port].hash
    end
    
  end
end
