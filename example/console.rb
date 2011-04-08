require 'rubygems'
require 'rack'
require 'net/http'
require 'uri'
require 'readline'
require 'stringio'

module DIRB
  def self.server
    hander = Rack::Handler.get('webrick')
    hander.run(Server.new, :Port => 7331)
  end
  
  def self.client
    loop {
      expression = Readline.readline('>> ')
      Readline::HISTORY << expression
      uri = URI.parse('http://localhost:7331/')
      response = Net::HTTP.post_form(uri, :expr => expression)
      puts response.body
    }
  end
  
  class Server
    def call(env)
      expression = Rack::Request.new(env).params['expr']
      begin
        result, output, $stdout = :exception, $stdout, StringIO.new
        result = eval(expression, scope, '(rirb)')
      rescue StandardError, ScriptError, Exception, SyntaxError
        $! = RuntimeError.new("unknown exception raised") unless $!
        print $!.class, ": ", $!, "\n"
  
        trace = []
        $!.backtrace.each do |line|
          trace << "\tfrom #{line}"
          break if line =~ /\(dirb\)/
        end
        
        puts trace
      ensure
        $stdout, output = output, $stdout
        output.rewind
        output = output.read
      end
      
      body  = output.empty? ? '' : output + "\n"
      body += "=> #{result.inspect}" unless result == :exception
      
      [200, {'Content-Type' => 'text/plain'}, [body]]
    end
    
    def scope
      @scope ||= instance_eval { binding }
    end
  end
end

if __FILE__ == $0
  trap('INT') { exit }
  if ARGV[0] == 'server'
    DIRB.server
  elsif ARGV[0] == 'client'
    DIRB.client
  else
    puts "#{$0} <server|client>"
  end
end
