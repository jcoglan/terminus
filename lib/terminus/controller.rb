module Terminus
  class Controller
    
    include Timeouts
    
    def initialize
      @connected    = false
      @browsers     = {}
      @host_aliases = {}
    end
    
    def browser(id = nil)
      return @browser if id.nil?
      @browsers[id] ||= Browser.new(self)
    end
    
    def browsers
      @browsers.values
    end
    
    def browser=(params)
      ensure_connection
      return @browser = params if Browser === params
      @browser = wait_with_timeout(:selected_browser) do
        @browsers.values.find { |b| b === params }
      end
    end
    
    def drop_browser(browser)
      @browsers.delete(browser.id)
      @browser = nil if @browser == browser
    end
    
    def ensure_browsers(n = 1)
      ensure_connection
      wait_with_timeout(:browsers) { @browsers.size >= n }
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
    
    def rewrite_local(url, dock_host)
      uri = URI.parse(url)
      uri.host = '127.0.0.1' if uri.host == dock_host
      uri.path = '' if uri.path == '/'
      
      # 1.8.7 does not have Hash#key, and 1.9.2 gives warnings for #index
      remote_host = @host_aliases.respond_to?(:key) ?
                    @host_aliases.key(Host.new(uri)) :
                    @host_aliases.index(Host.new(uri))

      if remote_host
        uri.scheme = remote_host.scheme
        uri.host   = remote_host.host
        uri.port   = remote_host.port
      end
      uri.host = dock_host if dock_host and uri.host =~ LOCALHOST
      uri
    end
    
    def rewrite_remote(url, dock_host = nil)
      uri = URI.parse(url)
      return uri unless URI::HTTP === uri and uri.host !~ LOCALHOST and uri.host != dock_host
      server = boot(uri)
      uri.scheme = 'http'
      uri.host, uri.port = (dock_host || server.host), server.port
      uri
    end
    
    def server_running?(server)
      return false unless server.port
      uri = URI.parse("http://#{server.host}:#{server.port}/")
      Net::HTTP.get_response(uri) && true
    rescue
      false
    end
    
  private
    
    def accept_ping(message)
      browser(message['id']).ping!(message)
    end
    
    def accept_result(message)
      browser = @browsers[message['id']]
      browser.result!(message) if browser
    end
    
    def boot(remote_uri)
      host = Host.new(remote_uri)
      @host_aliases[host] ||= begin
        server = Capybara::Server.new(Proxy[host])
        Thread.new { server.boot }
        sleep 1 until server_running?(server)
        Host.new(server)
      end
    end
    
    def ensure_connection
      return if @connected
      messenger.connect { @connected = true }
      wait_with_timeout(:connection) { @connected }
    end
    
  end
end

