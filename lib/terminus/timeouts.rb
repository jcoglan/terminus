module Terminus
  module Timeouts
    
    include Faye::Timeouts
    TIMEOUT = 30
    
    def wait_with_timeout(name, &predicate)
      time_out = false
      add_timeout(name, TIMEOUT) { time_out = true }
      while not time_out and not predicate.call; sleep 0.1; end
      raise TimeoutError.new("Waited #{TIMEOUT}s but could not get a #{name}") if time_out
      remove_timeout(name)
    end
    
  end
end

