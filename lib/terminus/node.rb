module Terminus
  class Node
    
    def initialize(browser, id)
      @browser, @id = browser, id
    end
    
    def click
      @browser.instruct(:click, @id)
      @browser.await_ping
    end
    
    DSL_METHODS = [:set, :select, :unselect]
    
    DSL_METHODS.each do |method|
      define_method(method) do |value|
        @browser.instruct(method, @id, value)
      end
    end
    
  end
end

