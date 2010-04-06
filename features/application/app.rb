require 'sinatra'

class TestApplication < Sinatra::Base
  ROOT = File.expand_path(File.dirname(__FILE__))
  
  set :static, true
  set :public, ROOT + '/public'
  set :views,  ROOT + '/views'
  
  get('/') { erb :index }
end

