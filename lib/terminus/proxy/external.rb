module Terminus
  class Proxy
    
    class External < Rack::Proxy
      attr_reader :uri

      def initialize(uri)
        @uri = uri
      end
      
      def rewrite_env(env)
        env = env.dup
        env['SERVER_NAME'] = @uri.host
        env['SERVER_PORT'] = @uri.port
        env['HTTP_HOST']   = "#{@uri.host}:#{@uri.port}"
        env.delete('HTTP_ACCEPT_ENCODING')
        
        if scheme = @uri.scheme
          env['rack.url_scheme'] = scheme
        end
        
        env
      end
      
      def call(env)
        dock_host = env['SERVER_NAME']
        response = super
        response[1].delete('transfer-encoding')
        response[2].extend(Rewrite)
        response[2].dock_host = dock_host
        response
      end
    end
    
  end
end
