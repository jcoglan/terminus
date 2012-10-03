module Terminus
  class Browser
    
    include Timeouts
    
    extend Forwardable
    def_delegators :@user_agent, :os, :version
    
    def initialize(controller)
      @controller = controller
      @attributes = {}
      @docked     = false
      @frames     = Set.new
      @namespace  = Faye::Namespace.new
      @results    = {}
      
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
    end
    
    def ===(params)
      return docked? if params == :docked
      return params == id if String === params
      return false if @parent
      return false unless @user_agent
      
      params.all? do |name, value|
        property = __send__(name)
        value === property
      end
    end
    
    def ask(command, retries = RETRY_LIMIT)
      value = if @connector
        message = Yajl::Encoder.encode('commandId' => '_', 'command' => command)
        response = @connector.send(message)
        return ask(command) if response.nil?
        result_hash = Yajl::Parser.parse(response)
        result_hash['value']
      else
        id = tell(command)
        result_hash = wait_with_timeout(:result) { result(id) }
        result_hash[:value]
      end
      raise ObsoleteElementError if value.nil?
      value
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
      return @attributes['url'] || '' unless @connector
      url = ask([:current_url])
      @controller.rewrite_local(url, @dock_host).to_s
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
    
    def find(xpath, driver = nil)
      ask([:find, xpath, false]).map { |id| Node.new(self, id, driver) }
    end
    
    def frame!(frame_browser)
      @frames.add(frame_browser)
    end
    
    def frames
      @frames.to_a
    end
    
    def id
      @attributes['id']
    end
    
    def name
      return 'PhantomJS' if @user_agent.to_str =~ /\bPhantomJS\b/
      @user_agent.browser
    end
    
    def page_id
      @attributes['page']
    end
    
    def ping!(message)
      p message if Terminus.debug
      remove_timeout(:dead)
      add_timeout(:dead, Timeouts::TIMEOUT) { drop_dead! }
      
      uri = @controller.rewrite_local(message['url'], @dock_host)
      message['url'] = uri.to_s
      
      @attributes = @attributes.merge(message)
      @user_agent = UserAgent.parse(message['ua'])
      detect_dock_host
      
      @infinite_redirect = message['infinite']
      
      if parent = message['parent']
        @parent = Terminus.browser(parent)
        @parent.frame!(self) unless @parent == self
      end
      
      start_connector if message['sockets']
      
      @ping = true
    end
    
    def reset!
      if url = @attributes['url']
        uri = URI.parse(url)
        visit("http://#{uri.host}:#{uri.port}/")
      end
      ask([:clear_cookies])
      @attributes.delete('url')
    end
    
    def response_headers
      evaluate_script('TERMINUS_HEADERS')
    end
    
    def result!(message)
      p message if Terminus.debug
      @results[message['commandId']] = {:value => message['result']}
    end
    
    def result(id)
      return nil unless @results.has_key?(id)
      @results.delete(id)
    end
    
    def return_to_dock
      visit("http://#{@dock_host}:#{Terminus.port}/")
    end
    
    def source
      evaluate_script('TERMINUS_SOURCE')
    end
    
    def status_code
      evaluate_script('TERMINUS_STATUS')
    end
    
    def tell(command)
      id = @namespace.generate
      p [id, command] if Terminus.debug
      messenger.publish(command_channel, 'command' => command, 'commandId' => id)
      id
    end
    
    def visit(url, retries = RETRY_LIMIT)
      close_frames!
      uri = @controller.rewrite_remote(url, @dock_host)
      uri.host = @dock_host if uri.host =~ LOCALHOST
      
      if @connector
        ask([:visit, uri.to_s])
      else
        tell([:visit, uri.to_s])
        wait_for_ping
      end
      
      if @infinite_redirect
        @infinite_redirect = nil
        raise Capybara::InfiniteRedirectError
      end
      
    rescue Timeouts::TimeoutError => e
      raise e if retries.zero?
      visit(url, retries - 1)
    end
    
    def wait_for_ping
      @ping = false
      wait_with_timeout(:ping) { @ping or @dead }
    end
    
    def to_s
      "<#{self.class.name} #{name} #{version} (#{os})>"
    end
    alias :inspect :to_s
    
  protected
    
    def drop_dead!
      remove_timeout(:dead)
      close_frames!
      @connector.close if @connector
      @dead = true
      @controller.drop_browser(self)
    end
    
  private
    
    def command_channel
      "/terminus/clients/#{id}"
    end
    
    def socket_channel
      "/terminus/sockets/#{id}"
    end
    
    def close_frames!
      @frames.each { |frame| frame.drop_dead! }
      @frames = Set.new
    end
    
    def detect_dock_host
      uri = URI.parse(@attributes['url'])
      if uri.port == Terminus.port
        @docked = true
        @dock_host = uri.host
      else
        @docked = false
      end
    end
    
    def start_connector
      return if @connector
      @connector = Connector::Server.new
      messenger.publish(socket_channel, 'url' => "ws://#{@dock_host}:#{@connector.port}/")
    end
    
    def messenger
      @controller.messenger
    end
    
  end
end

