module Terminus
  class PingMatch
    
    include EventMachine::Deferrable
    
    def initialize(params)
      @params = params
      @complete = false
    end
    
    def ===(ping)
      @params.all? { |key, value| value === ping[key] }
    end
    
    def complete!
      set_deferred_status(:succeeded)
      @complete = true
    end
    
    def complete?
      @compelte
    end
    
  end
end

