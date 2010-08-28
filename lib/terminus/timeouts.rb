module Terminus
  module Timeouts
    
    class TimeoutError < StandardError
    end
    
    include Faye::Timeouts
    TIMEOUT = 10
    
    def wait_with_timeout(name, duration = TIMEOUT, &predicate)
      time_out = false
      add_timeout(name, duration) { time_out = true }
      while not time_out and not predicate.call; sleep 0.1; end
      raise TimeoutError.new("Waited #{duration}s but could not get a #{name}") if time_out
      remove_timeout(name)
    end
    
  end
end

