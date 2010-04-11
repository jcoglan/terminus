module Terminus
  class Node
    
    def initialize(browser, id)
      @browser, @id = browser, id
    end
    
    def click
      @browser.instruct(:click, @id)
      @browser.await_ping
    end
    
    def set(value)
      @browser.instruct(:set, @id, value)
    end
    
  end
end

