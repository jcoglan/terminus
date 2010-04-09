module Terminus
  class Browser
    
    include Timeouts
    
    LOCALHOST = /localhost|0\.0\.0\.0|127\.0\.0\.1/
    
    def initialize(controller)
      @controller = controller
      @attributes = {}
      @docked     = false
      @namespace  = Faye::Namespace.new
      @results    = {}
      add_timeout(:dead, TIMEOUT) { drop_dead! }
    end
    
    def id
      @attributes['id']
    end
    
    def docked?
      @docked
    end
    
    def ping!(message)
      remove_timeout(:dead)
      @attributes = @attributes.merge(message)
      detect_dock_host
      add_timeout(:dead, TIMEOUT) { drop_dead! }
    end
    
    def result!(message)
      @results[message['commandId']] = message['result']
    end
    
    def visit(url)
      @controller.drop_browser(self)
      url = url.gsub(LOCALHOST, @controller.dock_host)
      instruct [:visit, url]
      @controller.await_ping('ua'  => @attributes['ua'], 'url' => url) do |browser|
        @controller.browser = browser
      end
    end
    
    def find(xpath)
      instruct_and_wait [:find, xpath]
    end
    
    def return_to_dock
      visit "http://#{@controller.dock_host}:#{DEFAULT_PORT}/"
    end
    
  private
    
    def messenger
      @controller.messenger
    end
    
    def channel
      "/terminus/clients/#{id}"
    end
    
    def drop_dead!
      @controller.drop_browser(self)
    end
    
    def instruct(code)
      messenger.publish(channel, 'command' => code)
    end
    
    def instruct_and_wait(code)
      id = @namespace.generate
      messenger.publish(channel, 'command' => code, 'commandId' => id)
      wait_with_timeout(:result) { @results.has_key?(id) }
      @results.delete(id) ? [:foo] : []
    end
    
    def detect_dock_host
      uri = URI.parse(@attributes['url'])
      return unless uri.port == DEFAULT_PORT
      @docked = true
      @controller.dock_host = uri.host
    end
    
  end
end

