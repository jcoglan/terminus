module Terminus
  class Proxy
    
    class DriverBody
      ASYNC_BROWSERS = %w[Android]
      
      TEMPLATE = ERB.new(<<-HTML)
        <script type="text/javascript" id="terminus-data">
          TERMINUS_ERROR_ID = window.TERMINUS_ERROR_ID || '';
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
        <% if @async %>
          <script type="text/javascript">
            (function() {
              var head = document.getElementsByTagName('head')[0],
                  script = document.createElement('script');
              
              script.type = 'text/javascript';
              script.src = '<%= @host %>/bootstrap.js';
              head.appendChild(script);
            })();
          </script>
        <% else %>
          <script type="text/javascript" src="<%= @host %><%= FAYE_MOUNT %>/client.js"></script>
          <script type="text/javascript" src="<%= @host %>/compiled/terminus-min.js"></script>
          <script type="text/javascript">
            setTimeout(function() {
              Terminus.connect('<%= @env['SERVER_NAME'] %>', <%= Terminus.port %>);
            }, 0);
          </script>
        <% end %>
      HTML
      
      def initialize(env, response)
        @env      = env
        @response = response
        @body     = response[2]
        @host     = "http://#{@env['SERVER_NAME']}:#{Terminus.port}"
        @async    = ASYNC_BROWSERS.include?(UserAgent.parse(env['HTTP_USER_AGENT']).browser)
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
      
      def page_source
        @source.inspect.gsub('</script>', '</scr"+"ipt>')
      end
    end
    
  end
end
