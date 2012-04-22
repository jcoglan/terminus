module Terminus
  class Proxy
    
    CONTENT_TYPES   = %w[text/plain text/html]
    BASIC_RESOURCES = %w[/favicon.ico /robots.txt]
    MAX_REDIRECTS   = 5
    
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
      response = @app.call(env)
      
      if response.first == 302
        @redirects += 1
        if @redirects > MAX_REDIRECTS
          @redirects = 0
          response = INFINITE_REDIRECT_RESPONSE
        end
      else
        @redirects = 0
      end
      
      if location = response[1]['Location']
        response[1]['Location'] = Terminus.rewrite_remote(location).to_s
      end
      
      return response if response.first == -1 or              # async response
             BASIC_RESOURCES.include?(env['PATH_INFO']) or    # not pages - favicon etc
             env.has_key?('HTTP_X_REQUESTED_WITH')            # Ajax calls
      
      content_type = Proxy.content_type(response)
      return response unless CONTENT_TYPES.include?(content_type)
      
      response[1] = response[1].dup
      response[1].delete_if { |key, _| key =~ /^content-length$/i }
      response[2] = DriverBody.new(env, response)
      
      response
    end
    
  end
end
