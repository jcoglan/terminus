module Terminus
  class Headers
    
    def initialize(values)
      @hash = {}
      values.each do |key, value|
        @hash[normalize_key(key)] = value
      end
    end
    
    def [](key)
      @hash[normalize_key(key)]
    end
    
  private
  
    def normalize_key(key)
      key.downcase.
          gsub(/^http_/, '').
          gsub(/_/, '-')
    end
    
  end
end

