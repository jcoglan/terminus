module Terminus
  class Proxy
    
    class Rewrite
      def initialize(body)
        body  = [body] unless body.respond_to?(:each)
        @body = body
      end
      
      def each(&block)
        @body.each do |fragment|
          block.call(rewrite(fragment))
        end
      end
      
      def rewrite(fragment)
        fragment.gsub(/\b(action|href)="([^"]*)"/i) do
          %Q{#{$1}="#{ Terminus.rewrite_remote($2) }"}
        end
      end
    end
    
  end
end
