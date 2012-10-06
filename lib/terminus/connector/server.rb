# Based on code from the Poltergeist project
# https://github.com/jonleighton/poltergeist
# 
# Copyright (c) 2011 Jonathan Leighton
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

module Terminus
  module Connector
    
    class Server
      RECV_SIZE    = 1024
      BIND_TIMEOUT = 5
      
      def initialize(browser, timeout = BIND_TIMEOUT)
        @browser = browser
        @skips   = 0
        @server  = start_server
        @timeout = timeout
        reset
      end
      
      def reset
        @env     = nil
        @handler = nil
        @parser  = Http::Parser.new
        @socket  = nil
      end
      
      def connected?
        not @socket.nil?
      end
      
      def port
        @server.addr[1]
      end
      
      def request(message)
        p [:send, @browser.id, message] if Terminus.debug
        accept unless connected?
        @socket.write(@handler.encode(message))
        result = receive
        p [:recv, @browser.id, result] if Terminus.debug
        reset if result.nil?
        result
      rescue Errno::ECONNRESET, Errno::EPIPE, Errno::EWOULDBLOCK
        reset
        nil
      end
      
    private
      
      def start_server
        time = Time.now
        TCPServer.open(0)
      rescue Errno::EADDRINUSE
        if (Time.now - time) < BIND_TIMEOUT
          sleep(0.01)
          retry
        else
          raise
        end
      end
      
      def accept
        @skips.times { @server.accept.close }
        @socket = @server.accept
        while line = @socket.gets
          @parser << line
          break if line == "\r\n"
        end
        if line.nil?
          accept
          @skips += 1
        else
          @handler = SocketHandler.new(self, env)
          @socket.write(@handler.handshake_response)
          p [:accept, @browser.id, @handler.url] if Terminus.debug
        end
      end
      
      def env
        @env ||= begin
          env = {'REQUEST_METHOD' => @parser.http_method}
          @parser.headers.each do |header, value|
            env['HTTP_' + header.upcase.gsub('-', '_')] = value
          end
          if env['HTTP_SEC_WEBSOCKET_KEY1']
            env['rack.input'] = StringIO.new(@socket.read(8))
          end
          env
        end
      end
      
      def receive
        p [:receive, @browser.id] if Terminus.debug
        start = Time.now
        
        until @handler.message?
          raise Errno::EWOULDBLOCK if (Time.now - start) >= @timeout
          IO.select([@socket], [], [], @timeout) or raise Errno::EWOULDBLOCK
          data = @socket.recv(RECV_SIZE)
          break if data.empty?
          @handler << data
          break if @handler.nil?
        end
        @handler && @handler.next_message
      end
      
      def close
        [server, socket].compact.each do |s|
          s.close_read
          s.close_write
        end
      end
    end
    
  end
end

