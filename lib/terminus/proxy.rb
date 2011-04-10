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
      response[2] = DriverBody.new(env, response)
      
      response
    end
    
    class DriverBody
      TEMPLATE = ERB.new(<<-DRIVER)
        <%= driver_script %>
        <script type="text/javascript">
          TERMINUS_STATUS = <%= @response.first %>;
          TERMINUS_HEADERS = {};
          <% @response[1].each do |key, value| %>
            TERMINUS_HEADERS[<%= key.inspect %>] = <%= value.inspect %>;
          <% end %>
        </script>
      DRIVER

      def initialize(env, response)
        @env      = env
        @response = response
        @body     = response[2]
      end
      
      def each(&block)
        script_injected = false
        
        @body.each do |fragment|
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
    end
    
  end
end
