module Terminus
  class Proxy
    
    CONTENT_TYPES   = %w[text/plain text/html]
    BASIC_RESOURCES = %w[/favicon.ico /robots.txt]
    
    def self.[](app)
      @proxies ||= {}
      @proxies[app] ||= new(app)
    end
    
    def self.content_type(response)
      type = response[1].find { |key, _| key =~ /^content-type$/i }
      type && type.last.split(';').first
    end
    
    def initialize(app)
      app = External.new(app) if Host === app
      @app = app
    end
    
    def call(env)
      response = @app.call(env)
      
      return response if response.first == -1 or              # async response
             BASIC_RESOURCES.include?(env['PATH_INFO']) or    # not pages - favicon etc
             env.has_key?('HTTP_X_REQUESTED_WITH')            # Ajax calls
      
      content_type = Proxy.content_type(response)
      return response unless CONTENT_TYPES.include?(content_type)
      
      response[1] = response[1].dup
      response[1].delete_if { |key, _| key =~ /^content-length$/i }
      response[2] = DriverBody.new(env, response)
      
      response
    end
    
    class DriverBody
      TEMPLATE = ERB.new(<<-DRIVER)
        <script id="terminus-data" type="text/javascript">
          TERMINUS_STATUS = <%= @response.first %>;
          TERMINUS_HEADERS = {};
          <% @response[1].each do |key, value| %>
            TERMINUS_HEADERS[<%= key.inspect %>] = <%= value.inspect %>;
          <% end %>
          TERMINUS_SOURCE = <%= page_source %>;
        </script>
        <script type="text/javascript">
          (function() {
            var terminusScript = document.getElementById('terminus-data');
            terminusScript.parentNode.removeChild(terminusScript);
          })();
        </script>
        <%= driver_script %>
      DRIVER
      
      def initialize(env, response)
        @env      = env
        @response = response
        @body     = response[2]
      end
      
      def each(&block)
        script_injected = false
        @source = ''
        
        @body.each do |fragment|
          @source << fragment
          output = inject_script(fragment)
          script_injected ||= (output != fragment)
          block.call(output)
        end
        
        unless script_injected
          block.call(TEMPLATE.result(binding))
        end
      end
      
    private
      
      def inject_script(fragment)
        fragment.gsub(/((?:^\s*)?<\/body>)/i) do
          TEMPLATE.result(binding) + $1
        end
      end
      
      def driver_script
        Terminus.driver_script(@env['SERVER_NAME'])
      end
      
      def page_source
        @source.inspect.gsub('</script>', '</scr"+"ipt>')
      end
    end
    
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
        response[2] = Rewrite.new(response[2])
        response
      end
    end
    
    class Rewrite
      def initialize(body)
        body  = [body] unless body.respond_to?(:each)
        @body = body
      end
      
      def each(&block)
        @body.each do |fragment|
          block.call(rewrite(fragment))
        end
      end
      
      def rewrite(fragment)
        fragment.gsub(/\b(action|href)="([^"]*)"/i) do
          %Q{#{$1}="#{ Terminus.rewrite_remote($2) }"}
        end
      end
    end
    
  end
end
