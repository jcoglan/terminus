module Terminus
  class Proxy
    
    module Rewrite
      attr_writer :dock_host
      
      def each(&block)
        handler = lambda do |fragment|
          block.call(rewrite(fragment))
        end
        super(&handler)
      end
      
      def rewrite(fragment)
        fragment.gsub(/\b(action|href)=('[^']*?'|"[^"]*?"|\S*)/i) do
          q = $2.chars.first
          %Q{#{$1}=#{q}#{ Terminus.rewrite_remote($2[1..-2], @dock_host) }#{q}}
        end
      end
    end
    
  end
end
