module Terminus
  class Node
    
    attr_reader :id
    
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
    
    def drag_to(node)
      @browser.instruct_and_wait(:drag, :from => @id, :to => node.id)
    end
    
    def [](attribute)
      @browser.instruct_and_wait(:attribute, @id, attribute)
    end
    
    def tag_name
      @browser.instruct_and_wait(:tag_name, @id).downcase
    end
    
    def text
      @browser.instruct_and_wait(:text, @id)
    end
    
    def value
      @browser.instruct_and_wait(:value, @id)
    end
    
    def visible?
      @browser.instruct_and_wait(:is_visible, @id)
    end
    
  end
end

