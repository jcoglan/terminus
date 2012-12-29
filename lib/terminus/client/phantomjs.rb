module Terminus
  module Client

    class PhantomJS < Base
      DEFAULT_COMMAND = ['/usr/bin/env', 'phantomjs']
      PHANTOM_CLIENT  = File.expand_path('../phantom.js', __FILE__)

      def browser_args(command)
        args = (command || DEFAULT_COMMAND).dup
        args + [PHANTOM_CLIENT, @address[2], @port.to_s, @connector.port.to_s]
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

