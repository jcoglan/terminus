module Terminus
  class Proxy
    
    CONTENT_TYPES   = %w[text/plain text/html]
    BASIC_RESOURCES = %w[/favicon.ico /robots.txt]
    MAX_REDIRECTS   = 5
    REDIRECT_CODES  = [301, 302, 303, 305, 307]
    
    INFINITE_REDIRECT_RESPONSE = [
      200,
      {'Content-Type' => 'text/html'},
      [File.read(ROOT + '/terminus/views/infinite.html')]
    ]
    
    autoload :DriverBody, ROOT + '/terminus/proxy/driver_body'
    autoload :External,   ROOT + '/terminus/proxy/external'
    autoload :Rewrite,    ROOT + '/terminus/proxy/rewrite'
    
    def self.[](app)
      @proxies ||= {}
      @proxies[app] ||= new(app)
    end
    
    def self.content_type(response)
      type = response[1].find { |key, _| key =~ /^content-type$/i }
      type && type.last.split(';').first
    end
    
    def initialize(app)
      app = External.new(app) if Host === app
      @app = app
      @redirects = 0
    end
    
    def call(env)
      add_cookies(env)
      response = @app.call(env)
      store_cookies(env, response)
      
      if REDIRECT_CODES.include?(response.first)
        @redirects += 1
        if @redirects > MAX_REDIRECTS
          @redirects = 0
          response = INFINITE_REDIRECT_RESPONSE
        end
      else
        @redirects = 0
      end
      
      if location = response[1]['Location']
        app_host = URI.parse('http://' + env['HTTP_HOST']).host
        response[1]['Location'] = Terminus.rewrite_remote(location, app_host).to_s
      end
      
      return response if response.first == -1 or              # async response
             REDIRECT_CODES.include?(response.first) or       # redirects
             BASIC_RESOURCES.include?(env['PATH_INFO']) or    # not pages - favicon etc
             env.has_key?('HTTP_X_REQUESTED_WITH')            # Ajax calls
      
      content_type = Proxy.content_type(response)
      return response unless CONTENT_TYPES.include?(content_type)
      
      response[1] = response[1].dup
      response[1].delete_if { |key, _| key =~ /^content-length$/i }
      response[2] = DriverBody.new(env, response)
      
      response
    end
    
  private
    
    def add_cookies(env)
      return unless External === @app
      cookies = Terminus.cookies.get_cookies(env['REQUEST_URI'])
      env['HTTP_COOKIE'] = (cookies + [env['HTTP_COOKIE']]).compact.join('; ')
    rescue => e
      puts e.message
    end
    
    def store_cookies(env, response)
      set_cookie = response[1].keys.grep(/^set-cookie$/i).first
      return unless set_cookie
      
      host = External === @app ? @app.uri.host : env['HTTP_HOST']
      endpoint = "http://#{host}#{env['PATH_INFO']}"
      
      [*response[1][set_cookie]].compact.each do |cookie|
        cookie.split(/\s*,\s*(?=\S+=)/).each do |value|
          Terminus.cookies.set_cookie(endpoint, value)
        end
      end
    end
    
  end
end

