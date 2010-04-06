module Terminus
  class Browser
    
    include Faye::Timeouts
    include Observable
    
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
    end
    
    def visit(url)
      instruct [:visit, url]
      sleep 2
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

