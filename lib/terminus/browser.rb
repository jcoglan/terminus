module Terminus
  class Browser
    
    include Timeouts
    attr_reader :dock_host
    
    LOCALHOST   = /localhost|0\.0\.0\.0|127\.0\.0\.1/
    RETRY_LIMIT = 3
    
    def initialize(controller)
      @controller     = controller
      @attributes     = {}
      @docked         = false
      @frames         = Set.new
      @namespace      = Faye::Namespace.new
      @ping_callbacks = []
      @results        = {}
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
    end
    
    def ===(params)
      return docked? if params == :docked
      return params == id if String === params
      return false if @parent
      
      params.all? do |name, value|
        case value
        when Regexp then @user_agent[name] =~ value
        when String then @user_agent[name] == value
        end
      end
    end
    
    def ask(command, retries = RETRY_LIMIT)
      id = tell(command)
      result_hash = wait_with_timeout(:result) { result(id) }
      result_hash[:value]
    rescue Timeouts::TimeoutError => e
      raise e if retries.zero?
      ask(command, retries - 1)
    end
    
    def body
      ask([:body])
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
      tell([:execute, expression])
      nil
    end
    
    def find(xpath)
      ask([:find, xpath, false]).map { |id| Node.new(self, id) }
    end
    
    def frame!(frame_browser)
      @frames.add(frame_browser)
    end
    
    def frames
      @frames.to_a
    end
    
    def frame_src(name)
      ask([:frame_src, name])
    end
    
    def id
      @attributes['id']
    end
    
    def page_id
      @attributes['page']
    end
    
    def ping!(message)
      remove_timeout(:dead)
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
      
      uri  = URI.parse(message['url'])
      path = (uri.path == '/') ? '' : uri.path
      message['url'] = "http://#{uri.host}:#{uri.port}#{path}"
      
      @attributes = @attributes.merge(message)
      @user_agent = UserAgent.parse(message['ua'])
      detect_dock_host
      
      if parent = message['parent']
        @parent = Terminus.browser(parent)
        @parent.frame!(self)
      end
      
      @ping = true
    end
    
    def reset!
      uri = URI.parse(@attributes['url'])
      visit("http://#{uri.host}:#{uri.port}")
      ask([:clear_cookies])
    end
    
    def response_headers
      evaluate_script('TERMINUS_HEADERS')
    end
    
    def result!(message)
      @results[message['commandId']] = message['result']
    end
    
    def result(id)
      return nil unless @results.has_key?(id)
      {:value => @results.delete(id)}
    end
    
    def return_to_dock
      visit "http://#{dock_host}:#{DEFAULT_PORT}/"
    end
    
    def source
      evaluate_script('TERMINUS_SOURCE')
    end
    
    def status_code
      evaluate_script('TERMINUS_STATUS')
    end
    
    def tell(command)
      id = @namespace.generate
      messenger.publish(channel, 'command' => command, 'commandId' => id)
      @controller.last_commanded_browser = self
      id
    end
    
    def user_agent
      @attributes['ua']
    end
    
    def visit(url, retries = RETRY_LIMIT)
      close_frames!
      url = url.gsub(LOCALHOST, dock_host)
      tell([:visit, url])
      wait_for_ping
    rescue Timeouts::TimeoutError => e
      raise e if retries.zero?
      visit(url, retries - 1)
    end
    
    def wait_for_ping
      @ping = false
      wait_with_timeout(:ping) { @ping or @dead }
    end
    
    def to_s
      "<#{self.class.name} #{@user_agent[:name]} #{@user_agent[:version]} (#{@user_agent[:os]})>"
    end
    alias :inspect :to_s
    
  protected
    
    def drop_dead!
      remove_timeout(:dead)
      close_frames!
      @dead = true
      @controller.drop_browser(self)
    end
    
  private
    
    def channel
      "/terminus/clients/#{id}"
    end
    
    def close_frames!
      @frames.each { |frame| frame.drop_dead! }
      @frames = Set.new
    end
    
    def detect_dock_host
      uri = URI.parse(@attributes['url'])
      if uri.port == DEFAULT_PORT
        @docked = true
        @dock_host = uri.host
      else
        @docked = false
        @dock_host ||= @controller.last_commanded_browser.dock_host
      end
    end
    
    def messenger
      @controller.messenger
    end
    
  end
end

