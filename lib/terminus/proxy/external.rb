module Terminus
  class Proxy
    
    class External < Rack::Proxy
      def initialize(uri)
        @uri = uri
      end
      
      def rewrite_env(env)
        env = env.dup
        env['SERVER_NAME'] = @uri.host
        env['SERVER_PORT'] = @uri.port
        env['HTTP_HOST']   = "#{@uri.host}:#{@uri.port}"
        env
      end
      
      def call(env)
        response = super
        response[2].extend(Rewrite)
        response
      end
    end
    
  end
end
