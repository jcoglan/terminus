module Terminus
  class Browser
    
    include Faye::Timeouts
    
    TIMEOUT = 30
    
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
      channel = "/terminus/clients/#{id}"
      @controller.messenger.publish(channel, 'command' => code)
    end
    
    def instruct_and_wait(code)
      channel = "/terminus/clients/#{id}"
      id = @namespace.generate
      @controller.messenger.publish(channel, 'command' => code, 'commandId' => id)
      wait_with_timeout(:result) { @results.has_key?(id) }
      @results.delete(id) ? [:foo] : []
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

