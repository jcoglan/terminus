module Terminus
  module Client
    
    class Browser < Base
      DEFAULT_COMMANDS = {
        /(mingw|mswin|windows)/i    => ['start', '/b'],
        /(darwin|mac os)/i          => ['open'],
        /(linux|bsd|aix|solaris)/i  => ['xdg-open'],
        /cygwin/i                   => ['cmd', '/C', 'start', '/b']
      }
      
      def browser_args(command)
        return command + [dock_url] if command
          
        os  = RbConfig::CONFIG['host_os']
        key = DEFAULT_COMMANDS.keys.find { |key| os =~ key }
        DEFAULT_COMMANDS[key] + [dock_url]
      end
      
      def browser_selector
        {:current_url => dock_url}
      end
      
      def dock_url
        "http://#{@address[2]}:#{@port}"
      end
    end
    
  end
end
