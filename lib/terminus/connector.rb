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

require 'websocket/driver'

module Terminus
  class Connector

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
      @closing = false
      @driver  = nil
      @socket  = nil
    end

    def connected?
      not @socket.nil?
    end

    def port
      @server.addr[1]
    end

    def request(message)
      @browser.debug(:send, @browser.id, message)
      accept unless connected?
      @driver.text(message)
      true while @closing && receive
      result = receive
      @browser.debug(:recv, @browser.id, result)
      reset if result.nil?
      result
    rescue Errno::ECONNRESET, Errno::EPIPE, Errno::EWOULDBLOCK
      reset
      nil
    end

    def drain_socket
      @closing = true if @socket
    end

    def close
      [@server, @socket].compact.each do |s|
        s.close_read
        s.close_write
      end
    end

    def write(data)
      @socket.write(data)
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

      @socket   = @server.accept
      @messages = []
      @driver   = WebSocket::Driver.server(self)

      @driver.on(:connect) { |e| @driver.start }
      @driver.on(:message) { |e| @messages << e.data }

      # @browser.debug(:accept, @browser.id, @handler.url)
    end

    def receive
      @browser.debug(:receive, @browser.id)
      start = Time.now

      until @messages.any?
        raise Errno::EWOULDBLOCK if (Time.now - start) >= @timeout
        IO.select([@socket], [], [], @timeout) or raise Errno::EWOULDBLOCK
        data = @socket.recv(RECV_SIZE)
        break if data.empty?
        @driver.parse(data)
      end
      @messages.shift
    end

  end
end

