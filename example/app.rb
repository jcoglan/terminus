require 'rubygems'
require 'sinatra'
require 'yaml'

module Example
  class App < Sinatra::Base
    set :views, File.dirname(__FILE__) + '/views'
    
    get '/' do
      erb(:index)
    end
    
    get '/signup' do
      erb(:signup)
    end
    
    post '/signup' do
      "<pre>\n#{ YAML.dump params }\n</pre>"
    end
  end
end

require File.dirname(__FILE__) + '/../lib/terminus'
require 'capybara/dsl'

def driver
  Capybara.current_session.driver
end

Thread.new do
  Capybara.current_driver = :terminus
  Capybara.app = Example::App
  
  Terminus.ensure_browsers
  Terminus.browser = :docked
end
