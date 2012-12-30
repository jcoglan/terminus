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

    class SocketHandler
      attr_reader :env

      def initialize(server, env)
        @server   = server
        @env      = env
        @parser   = Faye::WebSocket.parser(env).new(self)
        @messages = []
      end

      def url
        "ws://#{env['HTTP_HOST']}/"
      end

      def handshake_response
        @parser.handshake_response
      end

      def <<(data)
        @parser.parse(data)
      end

      def encode(message)
        @parser.frame(Faye::WebSocket.encode(message))
      end

      def receive(message)
        @messages << message
      end

      def message?
        @messages.any?
      end

      def next_message
        @messages.shift
      end

      def close(*args)
        @server.reset
      end
    end

  end
end

