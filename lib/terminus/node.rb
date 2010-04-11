module Terminus
  class Node
    
    def initialize(browser, id)
      @browser, @id = browser, id
    end
    
    def click
      @browser.instruct(:click, @id)
      @browser.await_ping
    end
    
  end
end

