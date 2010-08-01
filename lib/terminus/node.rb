module Terminus
  class Node
    
    attr_reader :id
    
    def initialize(browser, id)
      @browser, @id = browser, id
    end
    
    def find(xpath)
      @browser.instruct_and_wait(:find, xpath, @id).map { |id| Node.new(@browser, id) }
    end
    
    def click
      @browser.instruct(:click, @id)
      @browser.await_ping
    end
    
    def set(value)
      @browser.instruct(:set, @id, value)
    end
    
    def select(value)
      result = @browser.instruct_and_wait(:select, @id, value)
      raise Capybara::OptionNotFound.new unless result
    end
    
    def unselect(value)
      case @browser.instruct_and_wait(:unselect, @id, value)
      when 'not_allowed' then raise Capybara::UnselectNotAllowed.new
      when 'not_found'   then raise Capybara::OptionNotFound.new
      end
    end
    
    alias :select_option :select
    alias :unselect_option :unselect
    
    SYNC_DSL_METHODS = [[:[], :attribute], :tag_name, :text, :value, [:visible?, :is_visible]]
    
    SYNC_DSL_METHODS.each do |method|
      if Array === method
        name, command = *method
      else
        name = command = method
      end
      define_method(name) do |*args|
        @browser.instruct_and_wait(command, @id, *args)
      end
    end
    
    def drag_to(node)
      @browser.instruct_and_wait(:drag, :from => @id, :to => node.id)
    end
    
  end
end

