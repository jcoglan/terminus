module Terminus
  class Application < Sinatra::Base
    
    ROOT = File.expand_path(File.dirname(__FILE__) + '/../')
    
    set :static, true
    set :public, ROOT + '/public'
    set :views,  ROOT + '/views'
    
    def self.driver_script(host)
      %Q{<script type="text/javascript" src="http://#{host}:#{DEFAULT_PORT}/controller.js"></script>}
    end
    
    helpers do
      def bookmarklet
        Packr.pack(erb(:bookmarklet), :shrink_vars => true)
      end
      
      def host
        "http://#{ env['HTTP_HOST'] }"
      end
    end
    
    get '/' do
      erb :index
    end
    
    get '/controller.js' do
      headers 'Content-Type' => 'text/javascript'
      bookmarklet
    end
    
  end
end

