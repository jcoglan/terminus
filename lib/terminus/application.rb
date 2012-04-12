module Terminus
  class Application < Sinatra::Base
    
    ROOT = File.expand_path(File.dirname(__FILE__) + '/../')
    
    set :static, true
    set :root,   ROOT + '/terminus'
    
    def self.driver_script(host)
      %Q{<script type="text/javascript" src="http://#{host}:#{Terminus.port}/bootstrap.js"></script>}
    end
    
    helpers do
      def bootstrap
        Packr.pack(erb(:bootstrap), :shrink_vars => true)
      end
      
      def host
        "http://#{ env['HTTP_HOST'] }"
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

