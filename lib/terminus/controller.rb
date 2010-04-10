module Terminus
  class Controller
    
    include Timeouts
    attr_accessor :dock_host
    
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
    
    def ensure_docked_browser!
      ensure_connection!
      wait_with_timeout(:docked_browser) { @browsers.any? { |id,b| b.docked? } }
    end
    
    def ensure_browser!
      ensure_connection!
      wait_with_timeout(:browser) { @browser }
    end
    
    def browser(id = nil)
      return @browser if id.nil?
      @browsers[id] ||= Browser.new(self)
    end
    
    def browser=(params)
      @browser = case params
        when :docked then @browsers.values.find { |b| b.docked? }
        when Browser then params
      end
    end
    
    def drop_browser(browser)
      @browsers.delete(browser.id)
      @browser = nil if @browser == browser
    end
    
    def return_to_dock
      @browsers.each { |id, b| b.return_to_dock }
    end
    
    def await_ping(params, &block)
      ping = PingMatch.new(params)
      @ping_callbacks << ping
      done = false
      ping.callback do |browser|
        done = true
        block.call(browser)
      end
      while not done; sleep 0.1; end
    end
    
  private
    
    def ensure_connection!
      return if @connected
      messenger.connect { @connected = true }
      wait_with_timeout(:connection) { @connected }
    end
    
    def accept_ping(message)
      browser = browser(message['id'])
      browser.ping!(message)
      @ping_callbacks.each do |ping|
        ping.complete!(browser) if ping === message
      end
      @ping_callbacks.delete_if { |p| p.complete? }
    end
    
    def accept_result(message)
      browser(message['id']).result!(message)
    end
    
  end
end

