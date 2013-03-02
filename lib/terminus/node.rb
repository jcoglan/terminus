module Terminus
  class Node

    attr_reader :id

    def initialize(browser, id, driver = nil)
      @browser, @id, @driver = browser, id, driver
    end

    def checked?
      !!self['checked']
    end

    def click
      page    = @browser.page_id
      options = @driver ? @driver.options : {}

      value = if @browser.connector
        @browser.ask([:click, @id, options], false)
      else
        command = @browser.tell([:click, @id, options])

        result = @browser.wait_with_timeout(:click_response) do
          @browser.result(command) || (@browser.page_id != page)
        end
        Hash === result ? result[:value] : nil
      end

      if String === value
        raise Capybara::TimeoutError, value
      end
    end

    def disabled?
      !!self['disabled']
    end

    def drag_to(node)
      @browser.ask([:drag, {:from => @id, :to => node.id}])
    end

    def ==(other)
      Terminus::Node === other and @id == other.id
    end
    alias :eql? :==

    def find_css(css)
      @browser.ask([:find_css, css, @id]).map { |id| Node.new(@browser, id) }
    end

    def find_xpath(xpath)
      @browser.ask([:find_xpath, xpath, @id]).map { |id| Node.new(@browser, id) }
    end
    alias :find :find_xpath

    def hash
      @id.hash
    end

    # Capybara invokes `node.native ==` to determine node equality
    def native
      self
    end

    def select
      @browser.ask([:select, @id])
    end

    def selected?
      !!self['selected']
    end

    def set(value)
      result = @browser.ask([:set, @id, value])
      raise Capybara::NotSupportedByDriverError.new if result == 'not_allowed'
    end

    def all_text
      @browser.ask([:text, @id, false])
    end

    def visible_text
      @browser.ask([:text, @id, true])
    end
    alias :text :visible_text

    def trigger(event_type)
      @browser.ask([:trigger, @id, event_type])
    end

    def unselect
      allowed = @browser.ask([:unselect, @id])
      raise Capybara::UnselectNotAllowed.new unless allowed
    end

    def to_s
      "<#{self.class.name} #{@id}>"
    end
    alias :inspect :to_s

    alias :select_option :select
    alias :unselect_option :unselect

    SYNC_DSL_METHODS = [ [:[], :attribute],
                         [:[]=, :set_attribute],
                         :tag_name,
                         :value,
                         [:visible?, :is_visible]
                       ]

    SYNC_DSL_METHODS.each do |method|
      if Array === method
        name, command = *method
      else
        name = command = method
      end
      define_method(name) do |*args|
        @browser.ask([command, @id, *args])
      end
    end

  end
end

