module Terminus
  module Client

    autoload :Browser,    ROOT + '/terminus/client/browser'
    autoload :PhantomJS,  ROOT + '/terminus/client/phantomjs'

    class Base
      def self.start(options = {})
        process = new(options)
        process.start
        process
      end

      def initialize(options)
        @address  = TCPServer.new(0).addr
        @port     = options[:port] || @address[1]
        @terminus = Terminus.create(:port => @port)
        @browser  = ChildProcess.build(*browser_args(options[:command]))
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

