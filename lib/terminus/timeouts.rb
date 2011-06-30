module Terminus
  module Timeouts
    
    class TimeoutError < StandardError
    end
    
    include Faye::Timeouts
    TIMEOUT = 30
    
    def wait_with_timeout(name, duration = TIMEOUT, &predicate)
      result, time_out = nil, false
      add_timeout(name, duration) { time_out = true }
      
      while !result and !time_out
        result = predicate.call
        sleep 0.001
      end
      
      raise TimeoutError.new("Waited #{duration}s but could not get a #{name}") if time_out
      remove_timeout(name)
      
      result
    end
    
  end
end

