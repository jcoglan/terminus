require 'packr'
require 'sinatra'

module Terminus
  class Application < Sinatra::Base
    
    ROOT = File.expand_path('../..', __FILE__)
    
    set :static, true
    set :root,   ROOT + '/terminus'
    
    helpers do
      def bootstrap
        Packr.pack(erb(:bootstrap), :shrink_vars => true)
      end
    end
    
    get '/' do
      erb :index
    end
    
    get '/bootstrap.js' do
      headers 'Content-Type' => 'text/javascript'
      bootstrap
    end
    
  end
end

