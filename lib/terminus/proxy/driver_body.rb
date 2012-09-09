module Terminus
  class Proxy
    
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
            
            var head   = document.getElementsByTagName('head')[0],
                script = document.createElement('script');
            
            script.type = 'text/javascript';
            script.src  = 'http://<%= @env['SERVER_NAME'] %>:<%= Terminus.port %>/bootstrap.js';
            
            head.appendChild(script);
          })();
        </script>
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
      
      def page_source
        @source.inspect.gsub('</script>', '</scr"+"ipt>')
      end
    end
    
  end
end
