module Terminus
  class Controller

    include Timeouts

    def initialize
      @connected    = false
      @browsers     = {}
      @errors       = {}
      @host_aliases = {}
      @local_ports  = []
      @visited      = Set.new
    end

    def browser(id = nil)
      return @browser if id.nil?
      @browsers[id] ||= Browser.new(self, id)
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

    def cookies
      @cookies ||= CookieJar::Jar.new
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

    def register_local_port(port)
      @local_ports << port
      @host_aliases[Host.new(URI.parse("http://localhost:#{port}/"))] = Host.new(URI.parse("http://localhost:80/"))
    end

    def retrieve_error(id)
      @errors.delete(id)
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
      uri.path = '/' if uri.path == ''
      uri
    end

    def rewrite_remote(url, dock_host = nil)
      protocol_relative = (url =~ /^\/\//)
      url = "http:#{url}" if protocol_relative

      uri = URI.parse(url)
      return uri unless URI::HTTP === uri

      if (uri.host =~ LOCALHOST or uri.host == dock_host)
        if uri.port == 80
          uri.port = @host_aliases.keys.find { |h| h.host =~ LOCALHOST }.port
        end

        if local_ports.include?(uri.port)
          uri.host = dock_host
          return uri
        end
      end

      server = boot(uri)
      uri.scheme = protocol_relative ? nil : 'http'
      uri.host, uri.port = (dock_host || server.host), server.port
      uri
    rescue URI::InvalidURIError
      url
    end

    def save_error(error)
      id = Faye.random
      @errors[id] = error
      id
    end

    def server_running?(server)
      return false unless server.port
      uri = URI.parse("http://#{server.host}:#{server.port}#{PING_PATH}")
      Net::HTTP.start(uri.host, uri.port) { |h| h.head(uri.path) }
      true
    rescue
      false
    end

    def visit_url(url)
      @visited.add(url)
    end

    def visited?(url)
      visited = @visited.member?(url)
      @visited.delete(url)
      visited
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
        sleep(0.1) until server_running?(server)
        Host.new(server)
      end
    end

    def ensure_connection
      return if @connected
      messenger.connect { @connected = true }
      wait_with_timeout(:connection) { @connected }
    end

    def local_ports
      [Terminus.port] + @local_ports + @host_aliases.values.map { |h| h.port }
    end

  end
end

