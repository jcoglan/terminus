module Terminus
  class Application < Sinatra::Base
    
    ROOT = File.expand_path(File.dirname(__FILE__) + '/../')
    
    set :static, true
    set :public, ROOT + '/public'
    set :views,  ROOT + '/views'
    
    helpers do
      def host
        "http://#{ env['HTTP_HOST'] }"
      end
      
      def bookmarklet
        Packr.pack(erb(:bookmarklet), :shrink_vars => true)
      end
    end
    
    get('/') { erb :index }
    
  end
end

