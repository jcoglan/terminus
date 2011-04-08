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
    
    def browser(id = nil)
      return @browser if id.nil?
      @browsers[id] ||= Browser.new(self)
    end
    
    def browser=(params)
      return @browser = params if Browser === params
      @browser = wait_with_timeout(:selected_browser) do
        @browsers.values.find { |b| b === params }
      end
    end
    
    def drop_browser(browser)
      @browsers.delete(browser.id)
      @browser = nil if @browser == browser
    end
    
    def ensure_browser
      ensure_connection
      wait_with_timeout(:browser) { @browser }
    end
    
    def ensure_docked_browser
      ensure_connection
      wait_with_timeout(:docked_browser) { @browsers.any? { |id,b| b.docked? } }
    end
    
    def messenger
      Terminus.ensure_reactor_running
      return @messenger if defined?(@messenger)
      
      @messenger = Faye::Client.new(Terminus.endpoint)
      
      @messenger.subscribe('/terminus/ping',    &method(:accept_ping))
      @messenger.subscribe('/terminus/results', &method(:accept_result))
      @messenger
    end
    
    def return_to_dock
      @browsers.each { |id, b| b.return_to_dock }
    end
    
  private
    
    def accept_ping(message)
      browser(message['id']).ping!(message)
    end
    
    def accept_result(message)
      browser(message['id']).result!(message)
    end
    
    def ensure_connection
      return if @connected
      messenger.connect { @connected = true }
      wait_with_timeout(:connection) { @connected }
    end
    
  end
end

