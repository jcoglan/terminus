module Terminus
  class Browser
    
    include Timeouts
    
    LOCALHOST   = /localhost|0\.0\.0\.0|127\.0\.0\.1/
    RETRY_LIMIT = 3
    
    def initialize(controller)
      @controller     = controller
      @attributes     = {}
      @docked         = false
      @namespace      = Faye::Namespace.new
      @ping_callbacks = []
      @results        = {}
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
    end
    
    def ask(command, retries = RETRY_LIMIT)
      id = tell(command)
      wait_with_timeout(:result) { @results.has_key?(id) }
      @results.delete(id)
    rescue Timeouts::TimeoutError => e
      raise e if retries.zero?
      ask(command, retries - 1)
    end
    
    def body
      ask([:body])
    end
    alias :source :body
    
    def cleanup!
      ask([:cleanup])
    end
    
    def current_path
      return nil unless url = @attributes['url']
      URI.parse(url).path
    end
    
    def current_url
      @attributes['url']
    end
    
    def docked?
      @docked
    end
    
    def evaluate_script(expression)
      ask([:evaluate, expression])
    end
    
    def execute_script(expression)
      ask([:execute, expression])
    end
    
    def find(xpath)
      ask([:find, xpath, false]).map { |id| Node.new(self, id) }
    end
    
    def id
      @attributes['id']
    end
    
    def ping!(message)
      remove_timeout(:dead)
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
      @attributes = @attributes.merge(message)
      detect_dock_host
      @ping = true
    end
    
    def result!(message)
      @results[message['commandId']] = message['result']
    end
    
    def return_to_dock
      visit "http://#{@controller.dock_host}:#{DEFAULT_PORT}/"
    end
    
    def tell(command)
      id = @namespace.generate
      messenger.publish(channel, 'command' => command, 'commandId' => id)
      id
    end
    
    def visit(url, retries = RETRY_LIMIT)
      url = url.gsub(LOCALHOST, @controller.dock_host)
      tell([:visit, url])
      wait_for_ping
    rescue Timeouts::TimeoutError => e
      raise e if retries.zero?
      visit(url, retries - 1)
    end
    
    def wait_for_ping
      @ping = false
      wait_with_timeout(:ping) { @ping }
    end
    
  private
    
    def channel
      "/terminus/clients/#{id}"
    end
    
    def detect_dock_host
      uri = URI.parse(@attributes['url'])
      return unless uri.port == DEFAULT_PORT
      @docked = true
      @controller.dock_host = uri.host
    end
    
    def drop_dead!
      @controller.drop_browser(self)
    end
    
    def messenger
      @controller.messenger
    end
    
  end
end

