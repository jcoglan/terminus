module Terminus
  class Proxy
    
    module Rewrite
      def each(&block)
        handler = lambda do |fragment|
          block.call(rewrite(fragment))
        end
        super(&handler)
      end
      
      def rewrite(fragment)
        fragment.gsub(/\b(action|href)="([^"]*)"/i) do
          %Q{#{$1}="#{ Terminus.rewrite_remote($2) }"}
        end
      end
    end
    
  end
end
