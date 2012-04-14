require 'rubygems'
require 'sinatra'
require 'yaml'

module Example
  class App < Sinatra::Base
    set :views, File.expand_path('../views', __FILE__)
    
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

require File.expand_path('../../lib/terminus', __FILE__)
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
