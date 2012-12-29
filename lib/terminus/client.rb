module Terminus
  module Client

    autoload :Browser,    ROOT + '/terminus/client/browser'
    autoload :PhantomJS,  ROOT + '/terminus/client/phantomjs'

    class Base
      attr_reader :id

      def self.start(options = {})
        @process = new(options)
        @process.start
        @process
      end

      def self.save_screenshot(path, options = {})
        @process.save_screenshot(path, options)
      end

      def initialize(options)
        @id        = Faye.random
        @options   = options
        @address   = TCPServer.new(0).addr
        @connector = Connector::Server.new(self)
        @port      = options[:port] || @address[1]
        @terminus  = Terminus.create(:port => @port)
        @browser   = ChildProcess.build(*browser_args)
      end

      def debug(*args)
        p args if Terminus.debug
      end

      def start
        Terminus.ensure_reactor_running
        @terminus.run!

        @browser.start

        Terminus.port = @port
        Terminus.browser = browser_selector

        at_exit { stop }
      end

      def stop
        @terminus.stop!
        @browser.stop
        @browser.poll_for_exit(10)
      rescue ChildProcess::TimeoutError
      end
    end

  end
end

