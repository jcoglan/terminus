module Terminus
  class Browser
    
    include Faye::Timeouts
    
    TIMEOUT = 30
    
    def initialize(controller)
      @controller = controller
      @attributes = {}
      add_timeout(:dead, TIMEOUT) { drop_dead! }
    end
    
    def id
      @attributes['id']
    end
    
    def ping!(message)
      remove_timeout(:dead)
      @attributes = @attributes.merge(message)
      add_timeout(:dead, TIMEOUT) { drop_dead! }
    end
    
    def visit(url)
      @controller.drop_browser(self)
      instruct [:visit, url]
      @controller.await_ping(
        'ua'  => @attributes['ua'],
        'url' => url)
    end
    
    def return_to_dock
      visit "http://0.0.0.0:#{DEFAULT_PORT}/"
    end
    
  private
    
    def drop_dead!
      @controller.drop_browser(self)
    end
    
    def instruct(code)
      channel = "/terminus/clients/#{id}"
      @controller.messenger.publish(channel, :dsl => code)
    end
    
  end
end

