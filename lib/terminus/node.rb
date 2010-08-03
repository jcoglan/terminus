module Terminus
  class Node
    
    attr_reader :id
    
    def initialize(browser, id)
      @browser, @id = browser, id
    end
    
    def find(xpath)
      @browser.ask(:find, xpath, @id).map { |id| Node.new(@browser, id) }
    end
    
    def click
      @browser.tell(:click, @id)
      @browser.await_ping
    end
    
    def set(value)
      result = @browser.ask(:set, @id, value)
      raise Capybara::NotSupportedByDriverError.new if result == 'not_allowed'
    end
    
    def select(value)
      result = @browser.ask(:select, @id, value)
      raise Capybara::OptionNotFound.new unless result
    end
    
    def unselect(value)
      case @browser.ask(:unselect, @id, value)
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
        @browser.ask(command, @id, *args)
      end
    end
    
    def drag_to(node)
      @browser.ask(:drag, :from => @id, :to => node.id)
    end
    
  end
end

