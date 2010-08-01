module Terminus
  class Browser
    
    include Timeouts
    
    LOCALHOST = /localhost|0\.0\.0\.0|127\.0\.0\.1/
    
    def initialize(controller)
      @controller     = controller
      @attributes     = {}
      @docked         = false
      @namespace      = Faye::Namespace.new
      @ping_callbacks = []
      @results        = {}
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
    end
    
    def id
      @attributes['id']
    end
    
    def docked?
      @docked
    end
    
    def ping!(message)
      remove_timeout(:dead)
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
      @attributes = @attributes.merge(message)
      detect_dock_host
      @ping_callbacks.each do |ping|
        ping.complete! if ping === message
      end
      @ping_callbacks.delete_if { |p| p.complete? }
    end
    
    def result!(message)
      @results[message['commandId']] = message['result']
    end
    
    def visit(url)
      url = url.gsub(LOCALHOST, @controller.dock_host)
      instruct(:visit, url)
      await_ping('url' => url)
    end
    
    def find(xpath)
      instruct_and_wait(:find, xpath, false).map { |id| Node.new(self, id) }
    end
    
    def current_url
      @attributes['url']
    end
    
    def current_path
      return nil unless url = @attributes['url']
      URI.parse(url).path
    end
    
    def body
      instruct_and_wait(:body)
    end
    alias :source :body
    
    def evaluate_script(expression)
      instruct_and_wait(:evaluate, expression)
    end
    
    def cleanup!
      instruct_and_wait(:cleanup)
    end
    
    def return_to_dock
      visit "http://#{@controller.dock_host}:#{DEFAULT_PORT}/"
    end
    
    def instruct(*command)
      id = @namespace.generate
      messenger.publish(channel, 'command' => command, 'commandId' => id)
      id
    end
    
    def instruct_and_wait(*command)
      id = instruct(*command)
      wait_with_timeout(:result) { @results.has_key?(id) }
      @results.delete(id)
    end
    
    def await_ping(params = {}, &block)
      ping = PingMatch.new(params)
      @ping_callbacks << ping
      got_ping = false
      ping.callback { got_ping = true }
      wait_with_timeout(:ping) { got_ping }
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
    
    def detect_dock_host
      uri = URI.parse(@attributes['url'])
      return unless uri.port == DEFAULT_PORT
      @docked = true
      @controller.dock_host = uri.host
    end
    
  end
end

