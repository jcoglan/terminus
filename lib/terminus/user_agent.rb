module Terminus
  module UserAgent
    
    def self.parse(string)
      user_agent = {}
      case string
        
      when /\bChrome\/(\d+(?:\.\d+)+)/
        user_agent[:vendor]  = "Google"
        user_agent[:name]    = "Chrome"
        user_agent[:version] = $1
        
      when /\bSafari\/(\d+(?:\.\d+)+)/
        string =~ /\Version\/(\d+(?:\.\d+)+)/
        user_agent[:vendor]  = "Apple"
        user_agent[:name]    = "Safari"
        user_agent[:version] = $1
        
      when /\bFirefox\/(\d+(?:\.\d+)+)/
        user_agent[:vendor]  = "Mozilla"
        user_agent[:name]    = "Firefox"
        user_agent[:version] = $1
      end
      
      user_agent[:os] = (string =~ /\bMac OS X\b/) ? "Mac OS X" : nil
      user_agent
    end
    
  end
end
