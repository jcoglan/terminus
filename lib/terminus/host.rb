module Terminus
  class Host
    
    attr_reader :host, :port
    
    def initialize(uri)
      @scheme = uri.scheme if uri.respond_to?(:scheme)
      @host   = uri.host
      @port   = uri.port
    end
    
    def scheme
      @scheme || 'http'
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
