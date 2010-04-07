module Terminus
  class Controller
    include Faye::Timeouts
    
    class TimeoutError < StandardError
    end
    
    TIMEOUT = 30
    
    def initialize
      @connected = false
      @browsers = {}
      @ping_callbacks = []
      trap('INT') { exit }
    end
    
    def messenger
      Terminus.ensure_reactor_running!
      return @messenger if defined?(@messenger)
      
      @messenger = Faye::Client.new(Terminus.endpoint)
      
      @messenger.subscribe('/terminus/ping',    &method(:accept_ping))
      @messenger.subscribe('/terminus/results', &method(:accept_result))
      @messenger
    end
    
    def ensure_connection!
      return if @connected
      messenger.connect { @connected = true }
      wait_with_timeout(:connection) { @connected }
    end
    
    def ensure_browser!
      wait_with_timeout(:browser) { not @browsers.empty? }
    end
    
    def browser(id = nil)
      id ||= @browsers.keys.first
      @browsers[id] ||= Browser.new(self)
    end
    
    def drop_browser(browser)
      @browsers.delete(browser.id)
    end
    
    def return_to_dock
      @browsers.each { |id, b| b.return_to_dock }
    end
    
    def await_ping(params)
      ping = PingMatch.new(params)
      @ping_callbacks << ping
      done = false
      ping.callback { done = true }
      while not done; sleep 0.1; end
    end
    
  private
    
    def accept_ping(message)
      browser(message['id']).ping!(message)
      @ping_callbacks.each do |ping|
        ping.complete! if ping === message
      end
      @ping_callbacks.delete_if { |p| p.complete? }
    end
    
    def accept_result(message)
      browser(message['id']).result!(message)
    end
    
    def wait_with_timeout(name, &predicate)
      time_out = false
      add_timeout(name, TIMEOUT) { time_out = true }
      while not time_out and not predicate.call; sleep 0.1; end
      raise TimeoutError.new("Waited #{TIMEOUT}s but could not get a #{name}") if time_out
      remove_timeout(name)
    end
    
  end
end

