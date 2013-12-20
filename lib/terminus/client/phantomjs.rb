module Terminus
  module Client

    class PhantomJS < Base
      BROWSERS        = %w[chromium chromium-browser google-chrome xdg-open open]
      DEBUG_PATH      = '/webkit/inspector/inspector.html?page=2'
      DEFAULT_COMMAND = ['/usr/bin/env', 'phantomjs']
      DEFAULT_WIDTH   = 1024
      DEFAULT_HEIGHT  = 768
      PHANTOM_CLIENT  = File.expand_path('../phantom.js', __FILE__)

      def initialize(*args)
        @debug_port = TCPServer.new(0).addr[1]
        @debugger   = BROWSERS.map(&method(:detect_browser)).compact.first
        super
      end

      def browser_args
        command = @options[:command] || DEFAULT_COMMAND
        width   = @options[:width]   || DEFAULT_WIDTH
        height  = @options[:height]  || DEFAULT_HEIGHT

        args = command.dup
        args + ["--remote-debugger-port=#{@debug_port}", "--remote-debugger-autorun=yes",
                PHANTOM_CLIENT, width.to_s, height.to_s,
                @address[2], @port.to_s, @connector.port.to_s]
      end

      def browser_selector
        {:name => 'PhantomJS'}
      end

      def debugger
        raise ArgumentError, 'Could not find launchable browser' unless @debugger
        url = "http://#{@address[2]}:#{@debug_port}#{DEBUG_PATH}"
        process = ChildProcess.build(@debugger, url)
        process.start
        puts "Launched WebKit remote debugger at #{url}"
      end

      def detect_browser(browser)
        ENV['PATH'].split(File::PATH_SEPARATOR).each do |path|
          exe = File.join(path, browser)
          return exe if File.executable?(exe)
        end
        nil
      end

      def save_screenshot(path, options = {})
        message = MultiJson.dump(['save_screenshot', path, options])
        @connector.request(message)
      end
    end

  end
end

