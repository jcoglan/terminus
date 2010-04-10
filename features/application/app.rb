require 'sinatra'

class TestApplication < Sinatra::Base
  ROOT = File.expand_path(File.dirname(__FILE__)) unless defined?(ROOT)
  
  set :static, true
  set :public, ROOT + '/public'
  set :views,  ROOT + '/views'
  
  get('/') { erb :index }
  
  get('/*.html') { erb params[:splat].first.to_sym }
end

