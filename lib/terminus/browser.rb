module Terminus
  class Browser
    
    include Timeouts
    
    def initialize(controller)
      @controller = controller
      @attributes = {}
      @namespace  = Faye::Namespace.new
      @results    = {}
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
    
    def result!(message)
      @results[message['commandId']] = message['result']
    end
    
    def visit(url)
      @controller.drop_browser(self)
      instruct [:visit, url]
      @controller.await_ping(
        'ua'  => @attributes['ua'],
        'url' => url)
    end
    
    def find(xpath)
      instruct_and_wait [:find, xpath]
    end
    
    def return_to_dock
      visit "http://0.0.0.0:#{DEFAULT_PORT}/"
    end
    
  private
    
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
    
    def messenger
      @controller.messenger
    end
    
    def channel
      "/terminus/clients/#{id}"
    end
    
  end
end

