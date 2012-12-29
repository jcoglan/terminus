module Terminus
  module Client

    class PhantomJS < Base
      DEFAULT_COMMAND = ['/usr/bin/env', 'phantomjs']
      DEFAULT_WIDTH   = 1024
      DEFAULT_HEIGHT  = 768
      PHANTOM_CLIENT  = File.expand_path('../phantom.js', __FILE__)

      def browser_args
        command = @options[:command] || DEFAULT_COMMAND
        width   = @options[:width]   || DEFAULT_WIDTH
        height  = @options[:height]  || DEFAULT_HEIGHT

        args = command.dup
        args + [PHANTOM_CLIENT, width.to_s, height.to_s, @address[2], @port.to_s, @connector.port.to_s]
      end

      def browser_selector
        {:name => 'PhantomJS'}
      end

      def save_screenshot(path, options = {})
        message = Yajl::Encoder.encode(['save_screenshot', path])
        @connector.request(message)
      end
    end

  end
end

