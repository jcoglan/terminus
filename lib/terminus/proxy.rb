module Terminus
  class Proxy
    
    CONTENT_TYPES   = %w[text/plain text/html]
    BASIC_RESOURCES = %w[/favicon.ico /robots.txt]
    
    def self.[](app)
      @proxies ||= {}
      @proxies[app] ||= new(app)
    end
    
    def initialize(app)
      @app = app
    end
    
    def call(env)
      response = @app.call(env)
      
      return response if response.first == -1 or              # async response
             BASIC_RESOURCES.include?(env['PATH_INFO']) or    # not pages - favicon etc
             env.has_key?('HTTP_X_REQUESTED_WITH')            # Ajax calls
      
      type = response[1].find { |key, _| key =~ /^content-type$/i }
      content_type = type && type.last.split(';').first
      
      return response unless CONTENT_TYPES.include?(content_type)
      
      response[1] = response[1].dup
      response[1].delete_if { |key, _| key =~ /^content-length$/i }
      response[2] = DriverBody.new(env, response[2])
      
      response
    end
    
    class DriverBody
      def initialize(env, body)
        @env  = env
        @body = body
      end
      
      def each(&block)
        script_injected = false
        
        @body.each do |fragment|
          output = inject_script(fragment)
          script_injected ||= (output != fragment)
          block.call(output)
        end
        
        unless script_injected
          block.call(driver_script)
        end
      end
      
    private
      
      def inject_script(fragment)
        fragment.gsub(/((?:^\s*)?<\/body>)/i) { driver_script + $1 }
      end
      
      def driver_script
        Terminus.driver_script(@env['SERVER_NAME'])
      end
    end
    
  end
end
